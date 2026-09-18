// Parcel Raster Analysis — real-parcel yard / ADU-fit analysis.
//
// Used when we have an AUTHORITATIVE parcel polygon (SANDAG/SanGIS) and real
// building outlines. Instead of the old bounding-box approximation (which
// assumed every lot faces south and is a rectangle), this rasterizes the
// actual parcel into ~1 ft cells in a frame aligned with the street frontage
// and marks every cell that satisfies:
//
//   • inside the parcel
//   • ≥ front setback from the street-frontage lot line
//   • ≥ side/rear setback from every other lot line
//   • not inside any building, and ≥ required separation from every building
//     (detached ADU) — attached ADU needs only to be outside the buildings
//   • not in front of the main home (no front-yard ADUs)
//
// Contiguous cells form candidate zones. For each zone we find the LARGEST
// RECTANGLE whose sides are both ≥ the minimum practical ADU dimension, which
// is what a real unit footprint has to fit into. Zone areas therefore can
// never exceed the lot, and a strip of leftover yard 6 ft deep is never
// reported as "room for a 1,200 sq ft ADU".

import type { DetectedStructure, GeometryPolygon, LeftoverZone } from "./geometry-engine";

// ─── Tunable constants (documented) ───

/** Minimum width AND depth (ft) of a footprint that can hold a livable unit
 *  (a 12 ft interior span is about the narrowest practical studio/tiny home). */
export const ADU_MIN_DIMENSION_FT = 12;
/** Minimum rectangle area (sq ft) for a very small detached unit ("Possible"). */
export const ADU_MIN_SMALL_SQFT = 150;
/** Minimum rectangle area (sq ft) for a standard detached ADU ("Likely") —
 *  matches the smallest DCS detached floor plan (400 sq ft). */
export const ADU_MIN_STANDARD_SQFT = 400;
/** Minimum width/depth (ft) of an attached addition. */
export const ATTACHED_MIN_DIMENSION_FT = 10;
/** Target raster cell count ceiling; cell size grows on very large lots. */
const MAX_CELLS = 60000;

const M_PER_DEG_LAT = 111320;
const FT_PER_M = 3.28084;

interface XY {
  x: number;
  y: number;
}

export interface RasterRect {
  areaSqFt: number;
  widthFt: number; // along the street frontage
  depthFt: number; // perpendicular to the street frontage
  polygon: GeometryPolygon;
}

export interface ParcelRasterResult {
  zones: LeftoverZone[];
  /** Largest attached-addition rectangle adjacent to the main home (null if none). */
  attachedFit: RasterRect | null;
  /** How the street frontage (front lot line) was identified. */
  frontEdgeMethod: "street-frontage (adjacent parcels)" | "nearest lot line to address point";
  /** Lot width along the frontage and depth perpendicular to it (ft). */
  lotWidthFt: number;
  lotDepthFt: number;
  /** Measured yard depths around the main home (ft, median across the home). */
  measuredYards: { frontFt: number; rearFt: number; leftFt: number; rightFt: number };
  cellSizeFt: number;
  /** Only when input.debug: ASCII raster (street at bottom). */
  debugGrid?: string;
}

export interface ParcelRasterInput {
  parcel: GeometryPolygon;
  structures: DetectedStructure[];
  mainStructure: DetectedStructure;
  /** Geocoded address point (usually in/near the street). */
  addressPoint: { lat: number; lng: number } | null;
  /** WGS84 rings of adjacent parcels (to find which lot lines face the street). */
  adjacentParcelRings?: number[][][][];
  frontSetbackFt: number;
  sideSetbackFt: number;
  rearSetbackFt: number;
  separationFt: number;
  /** Emit an ASCII raster for diagnostics. */
  debug?: boolean;
}

// ─── Small geometry helpers (local feet) ───

function pointInRing(p: XY, ring: XY[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function pointInRings(p: XY, rings: XY[][]): boolean {
  let inside = false;
  for (const r of rings) if (pointInRing(p, r)) inside = !inside;
  return inside;
}

function segDist(p: XY, a: XY, b: XY): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = a.x + t * dx - p.x;
  const qy = a.y + t * dy - p.y;
  return Math.sqrt(qx * qx + qy * qy);
}

function stripClosing(ring: number[][]): number[][] {
  if (ring.length > 1) {
    const f = ring[0];
    const l = ring[ring.length - 1];
    if (f[0] === l[0] && f[1] === l[1]) return ring.slice(0, -1);
  }
  return ring;
}

interface Edge {
  a: XY;
  b: XY;
  ringIdx: number;
  idx: number;
}

/**
 * Analyze a real parcel. Returns null if the geometry is unusable
 * (degenerate parcel or main home outside it).
 */
export function analyzeParcelRaster(input: ParcelRasterInput): ParcelRasterResult | null {
  const parcelRingsLL = input.parcel.coordinates.map(stripClosing).filter((r) => r.length >= 3);
  if (parcelRingsLL.length === 0) return null;

  // Local frame in feet, origin at the exterior ring's vertex average.
  const ext = parcelRingsLL[0];
  const refLng = ext.reduce((s, p) => s + p[0], 0) / ext.length;
  const refLat = ext.reduce((s, p) => s + p[1], 0) / ext.length;
  const ftPerDegLng = M_PER_DEG_LAT * Math.cos((refLat * Math.PI) / 180) * FT_PER_M;
  const ftPerDegLat = M_PER_DEG_LAT * FT_PER_M;
  const toFt = ([lng, lat]: number[]): XY => ({ x: (lng - refLng) * ftPerDegLng, y: (lat - refLat) * ftPerDegLat });
  const toLL = (p: XY): number[] => [refLng + p.x / ftPerDegLng, refLat + p.y / ftPerDegLat];

  const parcelRings = parcelRingsLL.map((r) => r.map(toFt));
  const parcelCentroid: XY = {
    x: parcelRings[0].reduce((s, p) => s + p.x, 0) / parcelRings[0].length,
    y: parcelRings[0].reduce((s, p) => s + p.y, 0) / parcelRings[0].length,
  };

  // Edges of every parcel ring
  const edges: Edge[] = [];
  parcelRings.forEach((ring, ri) => {
    for (let i = 0; i < ring.length; i++) edges.push({ a: ring[i], b: ring[(i + 1) % ring.length], ringIdx: ri, idx: i });
  });

  // ── 1. Identify the street frontage (front lot line) ──
  const addr = input.addressPoint ? toFt([input.addressPoint.lng, input.addressPoint.lat]) : null;
  const neighborRings = (input.adjacentParcelRings ?? [])
    .map((rings) => rings.map((r) => stripClosing(r).map(toFt)))
    // Drop stacked duplicates of the subject lot (condo/common-area parcels
    // sharing the same polygon) — they'd make every edge look "shared".
    .filter((rings) => !pointInRings(parcelCentroid, rings));

  const isStreet: boolean[] = edges.map(() => false);
  let frontEdgeMethod: ParcelRasterResult["frontEdgeMethod"] = "nearest lot line to address point";
  if (neighborRings.length > 0) {
    edges.forEach((e, i) => {
      const dx = e.b.x - e.a.x;
      const dy = e.b.y - e.a.y;
      const len = Math.hypot(dx, dy);
      if (len < 0.5) return;
      let nx = dy / len;
      let ny = -dx / len;
      const mid = { x: (e.a.x + e.b.x) / 2, y: (e.a.y + e.b.y) / 2 };
      if (pointInRings({ x: mid.x + nx * 1.5, y: mid.y + ny * 1.5 }, parcelRings)) {
        nx = -nx;
        ny = -ny;
      }
      let shared = 0;
      const samples = [0.25, 0.5, 0.75];
      for (const t of samples) {
        const p = { x: e.a.x + dx * t + nx * 5, y: e.a.y + dy * t + ny * 5 };
        if (neighborRings.some((rings) => pointInRings(p, rings))) shared++;
      }
      isStreet[i] = shared < 2;
    });
    // Short sliver edges inherit from neighbors so arcs stay contiguous.
    edges.forEach((e, i) => {
      if (Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y) >= 0.5) return;
      const prev = (i - 1 + edges.length) % edges.length;
      isStreet[i] = isStreet[prev];
    });
  }

  // Group street edges of the exterior ring into consecutive chains
  const extCount = parcelRings[0].length;
  const chains: number[][] = [];
  if (isStreet.slice(0, extCount).some(Boolean) && !isStreet.slice(0, extCount).every(Boolean)) {
    // start at an index right after a non-street edge so chains don't wrap
    let start = 0;
    while (isStreet[start]) start++;
    let current: number[] = [];
    for (let k = 1; k <= extCount; k++) {
      const i = (start + k) % extCount;
      if (isStreet[i]) current.push(i);
      else if (current.length) {
        chains.push(current);
        current = [];
      }
    }
    if (current.length) chains.push(current);
  }

  // Split frontage chains at corners so a corner lot's two street sides (or
  // a curb return) aren't averaged into one diagonal "front". Gentle arcs
  // (cul-de-sacs) stay together until they've turned > 60°.
  const heading = (i: number) => Math.atan2(edges[i].b.y - edges[i].a.y, edges[i].b.x - edges[i].a.x);
  const turn = (a: number, b: number) => {
    let d = Math.abs(a - b) % (2 * Math.PI);
    if (d > Math.PI) d = 2 * Math.PI - d;
    return (d * 180) / Math.PI;
  };
  const straightChains: number[][] = [];
  for (const chain of chains) {
    let cur: number[] = [];
    let startH = 0;
    let prevH = 0;
    for (const i of chain) {
      const len = Math.hypot(edges[i].b.x - edges[i].a.x, edges[i].b.y - edges[i].a.y);
      if (cur.length === 0) {
        cur = [i];
        startH = prevH = heading(i);
        continue;
      }
      if (len < 1) {
        cur.push(i);
        continue;
      }
      const h = heading(i);
      if (turn(h, prevH) > 35 || turn(h, startH) > 60) {
        straightChains.push(cur);
        cur = [i];
        startH = h;
      } else {
        cur.push(i);
      }
      prevH = h;
    }
    if (cur.length) straightChains.push(cur);
  }
  chains.length = 0;
  chains.push(...straightChains);

  const chainDist = (chain: number[]): number =>
    addr ? Math.min(...chain.map((i) => segDist(addr, edges[i].a, edges[i].b))) : 0;
  const chainLen = (chain: number[]): number =>
    chain.reduce((s, i) => s + Math.hypot(edges[i].b.x - edges[i].a.x, edges[i].b.y - edges[i].a.y), 0);

  let frontChain: number[];
  if (chains.length > 0) {
    frontEdgeMethod = "street-frontage (adjacent parcels)";
    // Nearest to the address point; ties / no point → longest frontage.
    // Ignore short curb-return fragments when a real frontage exists.
    const substantial = chains.filter((c) => chainLen(c) >= 20);
    frontChain = [...(substantial.length ? substantial : chains)].sort((c1, c2) => {
      const d = chainDist(c1) - chainDist(c2);
      return Math.abs(d) > 3 ? d : chainLen(c2) - chainLen(c1);
    })[0];
  } else {
    // No adjacency info — the lot line nearest the address point is the front.
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < extCount; i++) {
      const d = addr ? segDist(addr, edges[i].a, edges[i].b) : -Math.hypot(edges[i].b.x - edges[i].a.x, edges[i].b.y - edges[i].a.y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    frontChain = [best];
  }
  const frontSet = new Set(frontChain);

  // ── 2. Rotate so the frontage runs along +X and the lot extends into +Y ──
  const first = edges[frontChain[0]].a;
  const last = edges[frontChain[frontChain.length - 1]].b;
  let ux = last.x - first.x;
  let uy = last.y - first.y;
  let ulen = Math.hypot(ux, uy);
  if (ulen < 1) {
    const e = edges[frontChain[0]];
    ux = e.b.x - e.a.x;
    uy = e.b.y - e.a.y;
    ulen = Math.hypot(ux, uy) || 1;
  }
  ux /= ulen;
  uy /= ulen;
  let vx = -uy;
  let vy = ux;
  const frontMid = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 };
  if ((parcelCentroid.x - frontMid.x) * vx + (parcelCentroid.y - frontMid.y) * vy < 0) {
    vx = -vx;
    vy = -vy;
  }
  const toFrame = (p: XY): XY => ({ x: p.x * ux + p.y * uy, y: p.x * vx + p.y * vy });
  const fromFrame = (p: XY): XY => ({ x: p.x * ux + p.y * vx, y: p.x * uy + p.y * vy });

  const fParcel = parcelRings.map((r) => r.map(toFrame));
  const fEdges = edges.map((e, i) => ({ a: toFrame(e.a), b: toFrame(e.b), front: frontSet.has(i) && e.ringIdx === 0 }));
  const structRings = input.structures.map((s) => ({
    isMain: s === input.mainStructure,
    rings: s.polygon.coordinates.map(stripClosing).filter((r) => r.length >= 3).map((r) => r.map(toFt).map(toFrame)),
  }));
  const main = structRings.find((s) => s.isMain);
  if (!main || main.rings.length === 0) return null;

  // Frame bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of fParcel[0]) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  let hMinX = Infinity, hMinY = Infinity, hMaxX = -Infinity, hMaxY = -Infinity;
  for (const p of main.rings[0]) {
    hMinX = Math.min(hMinX, p.x); hMaxX = Math.max(hMaxX, p.x);
    hMinY = Math.min(hMinY, p.y); hMaxY = Math.max(hMaxY, p.y);
  }

  const areaEst = (maxX - minX) * (maxY - minY);
  const cell = Math.max(1, Math.sqrt(areaEst / MAX_CELLS));
  const cols = Math.max(1, Math.ceil((maxX - minX) / cell));
  const rows = Math.max(1, Math.ceil((maxY - minY) / cell));

  // ── 3. Rasterize ──
  const detOK = new Uint8Array(rows * cols);
  const attOK = new Uint8Array(rows * cols);
  const inParcel = new Uint8Array(rows * cols);
  const inBldg = new Uint8Array(rows * cols);
  const nearMain = new Uint8Array(rows * cols);
  const sideRear = Math.max(input.sideSetbackFt, input.rearSetbackFt);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = { x: minX + (c + 0.5) * cell, y: minY + (r + 0.5) * cell };
      const k = r * cols + c;
      if (!pointInRings(p, fParcel)) continue;
      inParcel[k] = 1;
      let dFront = Infinity;
      let dOther = Infinity;
      for (const e of fEdges) {
        const d = segDist(p, e.a, e.b);
        if (e.front) dFront = Math.min(dFront, d);
        else dOther = Math.min(dOther, d);
      }
      let inside = false;
      let dB = Infinity;
      let dMain = Infinity;
      for (const s of structRings) {
        if (pointInRings(p, s.rings)) {
          inside = true;
          if (s.isMain) dMain = 0;
        }
        for (const ring of s.rings) {
          for (let i = 0; i < ring.length; i++) {
            const d = segDist(p, ring[i], ring[(i + 1) % ring.length]);
            if (d < dB) dB = d;
            if (s.isMain && d < dMain) dMain = d;
          }
        }
      }
      if (inside) {
        inBldg[k] = 1;
        continue;
      }
      if (dMain <= cell * 1.5) nearMain[k] = 1;
      const setbacksOK = dFront >= input.frontSetbackFt && dOther >= sideRear;
      const notFrontYard = p.y >= hMinY; // no ADU between the home and the street
      if (setbacksOK && notFrontYard) {
        attOK[k] = 1;
        if (dB >= input.separationFt) detOK[k] = 1;
      }
    }
  }

  // ── 4. Contiguous zones + largest fitting rectangle ──
  const components = (mask: Uint8Array): number[][] => {
    const seen = new Uint8Array(mask.length);
    const out: number[][] = [];
    for (let k = 0; k < mask.length; k++) {
      if (!mask[k] || seen[k]) continue;
      const comp: number[] = [];
      const stack = [k];
      seen[k] = 1;
      while (stack.length) {
        const q = stack.pop() as number;
        comp.push(q);
        const r = Math.floor(q / cols);
        const c = q % cols;
        const nb = [c > 0 ? q - 1 : -1, c < cols - 1 ? q + 1 : -1, r > 0 ? q - cols : -1, r < rows - 1 ? q + cols : -1];
        for (const n of nb) {
          if (n >= 0 && mask[n] && !seen[n]) {
            seen[n] = 1;
            stack.push(n);
          }
        }
      }
      out.push(comp);
    }
    return out;
  };

  const rectToPolygon = (c0: number, r0: number, w: number, h: number): GeometryPolygon => {
    const x0 = minX + c0 * cell;
    const y0 = minY + r0 * cell;
    const corners = [
      { x: x0, y: y0 },
      { x: x0 + w * cell, y: y0 },
      { x: x0 + w * cell, y: y0 + h * cell },
      { x: x0, y: y0 + h * cell },
    ].map((p) => toLL(fromFrame(p)));
    return { type: "Polygon", coordinates: [[...corners, [...corners[0]]]] };
  };

  /** Largest rectangle inside `cells` with both sides ≥ minDimFt (and the unconstrained max). */
  const largestRect = (cells: number[], minDimFt: number): { fit: RasterRect | null; any: RasterRect | null } => {
    let r0 = rows, r1 = -1, c0 = cols, c1 = -1;
    for (const k of cells) {
      const r = Math.floor(k / cols);
      const c = k % cols;
      r0 = Math.min(r0, r); r1 = Math.max(r1, r);
      c0 = Math.min(c0, c); c1 = Math.max(c1, c);
    }
    const W = c1 - c0 + 1;
    const H = r1 - r0 + 1;
    const m = new Uint8Array(W * H);
    for (const k of cells) m[(Math.floor(k / cols) - r0) * W + ((k % cols) - c0)] = 1;
    const heights = new Int32Array(W);
    const left = new Int32Array(W);
    const right = new Int32Array(W);
    const minCells = Math.ceil(minDimFt / cell - 1e-9);
    let fit: { a: number; c: number; r: number; w: number; h: number } | null = null;
    let any: { a: number; c: number; r: number; w: number; h: number } | null = null;
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) heights[c] = m[r * W + c] ? heights[c] + 1 : 0;
      const st: number[] = [];
      for (let c = 0; c < W; c++) {
        while (st.length && heights[st[st.length - 1]] >= heights[c]) st.pop();
        left[c] = st.length ? st[st.length - 1] + 1 : 0;
        st.push(c);
      }
      st.length = 0;
      for (let c = W - 1; c >= 0; c--) {
        while (st.length && heights[st[st.length - 1]] >= heights[c]) st.pop();
        right[c] = st.length ? st[st.length - 1] - 1 : W - 1;
        st.push(c);
      }
      for (let c = 0; c < W; c++) {
        const h = heights[c];
        if (!h) continue;
        const w = right[c] - left[c] + 1;
        const a = w * h;
        const cand = { a, c: left[c], r: r - h + 1, w, h };
        if (!any || a > any.a) any = cand;
        if (w >= minCells && h >= minCells && (!fit || a > fit.a)) fit = cand;
      }
    }
    const conv = (x: typeof fit): RasterRect | null =>
      x
        ? {
            areaSqFt: Math.round(x.a * cell * cell),
            widthFt: Math.round(x.w * cell),
            depthFt: Math.round(x.h * cell),
            polygon: rectToPolygon(c0 + x.c, r0 + x.r, x.w, x.h),
          }
        : null;
    return { fit: conv(fit), any: conv(any) };
  };

  const zones: LeftoverZone[] = [];
  for (const comp of components(detOK)) {
    const compArea = Math.round(comp.length * cell * cell);
    if (compArea < 50) continue;
    const { fit, any } = largestRect(comp, ADU_MIN_DIMENSION_FT);
    const rect = fit ?? any;
    if (!rect) continue;
    let sx = 0;
    let sy = 0;
    for (const k of comp) {
      sx += minX + ((k % cols) + 0.5) * cell;
      sy += minY + (Math.floor(k / cols) + 0.5) * cell;
    }
    const cx = sx / comp.length;
    const cy = sy / comp.length;
    const position: LeftoverZone["position"] =
      cy > hMaxY ? "rear" : cx < hMinX ? "left-side" : cx > hMaxX ? "right-side" : "interior";
    const suitableFor: string[] = [];
    if (fit && fit.areaSqFt >= ADU_MIN_STANDARD_SQFT) suitableFor.push("Detached ADU");
    else if (fit && fit.areaSqFt >= ADU_MIN_SMALL_SQFT) suitableFor.push("Small Detached ADU");
    const centroidLL = toLL(fromFrame({ x: cx, y: cy }));
    zones.push({
      polygon: rect.polygon,
      areaSqFt: fit ? fit.areaSqFt : 0,
      contiguousAreaSqFt: compArea,
      centroid: { lng: centroidLL[0], lat: centroidLL[1] },
      position,
      buildQuality: fit ? Math.min(100, 40 + Math.round(fit.areaSqFt / 15)) + (position === "rear" ? 5 : 0) : 10,
      minWidthFt: rect.widthFt,
      minDepthFt: rect.depthFt,
      suitableFor,
    });
  }
  zones.sort((a, b) => b.buildQuality - a.buildQuality || b.areaSqFt - a.areaSqFt);

  // Attached addition: best rectangle in an attached-OK region touching the home.
  let attachedFit: RasterRect | null = null;
  for (const comp of components(attOK)) {
    if (!comp.some((k) => nearMain[k])) continue;
    const { fit } = largestRect(comp, ATTACHED_MIN_DIMENSION_FT);
    if (fit && (!attachedFit || fit.areaSqFt > attachedFit.areaSqFt)) attachedFit = fit;
  }

  // Measured yards around the main home (median across the home's span).
  const median = (xs: number[]): number => {
    if (xs.length === 0) return 0;
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const rearDepths: number[] = [];
  const frontDepths: number[] = [];
  for (let c = 0; c < cols; c++) {
    const x = minX + (c + 0.5) * cell;
    if (x < hMinX || x > hMaxX) continue;
    let topParcel = -1, botParcel = -1, topB = -1, botB = -1;
    for (let r = 0; r < rows; r++) {
      const k = r * cols + c;
      if (inParcel[k]) {
        if (botParcel < 0) botParcel = r;
        topParcel = r;
      }
      if (inBldg[k] && inParcel[k]) {
        if (botB < 0) botB = r;
        topB = r;
      }
    }
    if (topB >= 0 && topParcel >= 0) {
      rearDepths.push((topParcel - topB) * cell);
      frontDepths.push((botB - botParcel) * cell);
    }
  }
  const leftDepths: number[] = [];
  const rightDepths: number[] = [];
  for (let r = 0; r < rows; r++) {
    const y = minY + (r + 0.5) * cell;
    if (y < hMinY || y > hMaxY) continue;
    let lP = -1, rP = -1, lB = -1, rB = -1;
    for (let c = 0; c < cols; c++) {
      const k = r * cols + c;
      if (inParcel[k]) {
        if (lP < 0) lP = c;
        rP = c;
      }
      if (inBldg[k] && inParcel[k]) {
        if (lB < 0) lB = c;
        rB = c;
      }
    }
    if (lB >= 0 && lP >= 0) {
      leftDepths.push((lB - lP) * cell);
      rightDepths.push((rP - rB) * cell);
    }
  }

  let debugGrid: string | undefined;
  if (input.debug) {
    const lines: string[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        const k = r * cols + c;
        line += inBldg[k] ? "#" : detOK[k] ? "D" : attOK[k] ? "a" : inParcel[k] ? "." : " ";
      }
      lines.push(line);
    }
    debugGrid = lines.join("\n");
  }

  return {
    debugGrid,
    zones,
    attachedFit,
    frontEdgeMethod,
    lotWidthFt: Math.round(maxX - minX),
    lotDepthFt: Math.round(maxY - minY),
    measuredYards: {
      frontFt: Math.round(median(frontDepths)),
      rearFt: Math.round(median(rearDepths)),
      leftFt: Math.round(median(leftDepths)),
      rightFt: Math.round(median(rightDepths)),
    },
    cellSizeFt: Math.round(cell * 100) / 100,
  };
}
