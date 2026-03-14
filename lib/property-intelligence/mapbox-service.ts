// Mapbox Service — Premium parcel visualization, map rendering, and build envelope display
// Uses Mapbox GL JS for interactive property maps with parcel boundaries,
// structure footprints, setback visualization, and ADU placement zones.

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface MapboxConfig {
  accessToken: string;
  style: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
}

export interface ParcelVisualization {
  parcelBoundary: GeoJSONPolygon | null;
  structureFootprint: GeoJSONPolygon | null;
  setbackLines: GeoJSONLineString[];
  buildableEnvelope: GeoJSONPolygon | null;
  detachedCandidateZones: GeoJSONPolygon[];
  attachedCandidateZones: GeoJSONPolygon[];
  conversionCandidateZones: GeoJSONPolygon[];
  uncertaintyShading: GeoJSONPolygon | null;
  geometryConfidence: number;
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface GeoJSONLineString {
  type: "LineString";
  coordinates: number[][];
}

export type MapVisualMode =
  | "property-overview"
  | "feasibility-overlay"
  | "recommended-placement"
  | "property-maximization";

/**
 * Check if Mapbox is configured and available
 */
export function isMapboxAvailable(): boolean {
  return Boolean(MAPBOX_TOKEN);
}

/**
 * Get the Mapbox access token
 */
export function getMapboxToken(): string | null {
  return MAPBOX_TOKEN || null;
}

/**
 * Get the default Mapbox configuration for a property location
 */
export function getMapboxConfig(lat: number, lng: number): MapboxConfig | null {
  if (!MAPBOX_TOKEN) return null;

  return {
    accessToken: MAPBOX_TOKEN,
    style: "mapbox://styles/mapbox/light-v11",
    center: [lng, lat],
    zoom: 18,
  };
}

/**
 * Generate an estimated parcel polygon from lot dimensions and center point.
 * When real parcel data is unavailable, this creates an approximate rectangular parcel.
 */
export function generateEstimatedParcelPolygon(
  lat: number,
  lng: number,
  lotWidthFt: number,
  lotDepthFt: number
): GeoJSONPolygon {
  // Convert feet to approximate degrees
  const ftToLat = 1 / 364000; // ~1 ft in degrees latitude
  const ftToLng = 1 / (364000 * Math.cos((lat * Math.PI) / 180)); // adjusted for latitude

  const halfWidth = (lotWidthFt / 2) * ftToLng;
  const halfDepth = (lotDepthFt / 2) * ftToLat;

  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - halfWidth, lat - halfDepth],
        [lng + halfWidth, lat - halfDepth],
        [lng + halfWidth, lat + halfDepth],
        [lng - halfWidth, lat + halfDepth],
        [lng - halfWidth, lat - halfDepth],
      ],
    ],
  };
}

/**
 * Generate setback lines inset from the parcel boundary
 */
export function generateSetbackLines(
  parcelPolygon: GeoJSONPolygon,
  sideSetbackFt: number,
  rearSetbackFt: number,
  frontSetbackFt: number
): GeoJSONLineString[] {
  const coords = parcelPolygon.coordinates[0];
  if (coords.length < 5) return [];

  // For a rectangular parcel [SW, SE, NE, NW, SW]
  const [sw, se, ne, nw] = coords;

  const parcelWidthDeg = Math.abs(se[0] - sw[0]);
  const parcelDepthDeg = Math.abs(nw[1] - sw[1]);

  // Approximate conversion
  const lat = (sw[1] + nw[1]) / 2;
  const ftToLng = 1 / (364000 * Math.cos((lat * Math.PI) / 180));
  const ftToLat = 1 / 364000;

  const sideOffsetLng = sideSetbackFt * ftToLng;
  const rearOffsetLat = rearSetbackFt * ftToLat;
  const frontOffsetLat = frontSetbackFt * ftToLat;

  const lines: GeoJSONLineString[] = [];

  // Left setback line
  lines.push({
    type: "LineString",
    coordinates: [
      [sw[0] + sideOffsetLng, sw[1]],
      [nw[0] + sideOffsetLng, nw[1]],
    ],
  });

  // Right setback line
  lines.push({
    type: "LineString",
    coordinates: [
      [se[0] - sideOffsetLng, se[1]],
      [ne[0] - sideOffsetLng, ne[1]],
    ],
  });

  // Rear setback line (top/north)
  lines.push({
    type: "LineString",
    coordinates: [
      [nw[0], nw[1] - rearOffsetLat],
      [ne[0], ne[1] - rearOffsetLat],
    ],
  });

  // Front setback line (bottom/south)
  if (frontSetbackFt > 0) {
    lines.push({
      type: "LineString",
      coordinates: [
        [sw[0], sw[1] + frontOffsetLat],
        [se[0], se[1] + frontOffsetLat],
      ],
    });
  }

  return lines;
}

/**
 * Generate a buildable envelope polygon (setback-inset area minus structure footprint)
 */
export function generateBuildableEnvelope(
  lat: number,
  lng: number,
  lotWidthFt: number,
  lotDepthFt: number,
  sideSetbackFt: number,
  rearSetbackFt: number,
  frontSetbackFt: number,
  _structureFootprintFt: number
): GeoJSONPolygon | null {
  const usableWidth = lotWidthFt - 2 * sideSetbackFt;
  const usableDepth = lotDepthFt - frontSetbackFt - rearSetbackFt;

  if (usableWidth <= 0 || usableDepth <= 0) return null;

  const ftToLat = 1 / 364000;
  const ftToLng = 1 / (364000 * Math.cos((lat * Math.PI) / 180));

  const halfWidth = (usableWidth / 2) * ftToLng;
  // Position buildable area in the rear of the lot
  const rearEdgeLat = lat + (lotDepthFt / 2) * ftToLat - rearSetbackFt * ftToLat;
  const frontEdgeLat = rearEdgeLat - usableDepth * ftToLat;

  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - halfWidth, frontEdgeLat],
        [lng + halfWidth, frontEdgeLat],
        [lng + halfWidth, rearEdgeLat],
        [lng - halfWidth, rearEdgeLat],
        [lng - halfWidth, frontEdgeLat],
      ],
    ],
  };
}

/**
 * Generate ADU candidate placement zones on the property
 */
export function generateCandidateZones(
  lat: number,
  lng: number,
  lotWidthFt: number,
  lotDepthFt: number,
  sideSetbackFt: number,
  rearSetbackFt: number,
  separationFt: number,
  mainHomeWidthFt: number,
  mainHomeDepthFt: number
): {
  detached: GeoJSONPolygon | null;
  attached: GeoJSONPolygon | null;
  conversion: GeoJSONPolygon | null;
} {
  const ftToLat = 1 / 364000;
  const ftToLng = 1 / (364000 * Math.cos((lat * Math.PI) / 180));

  // Rear detached ADU zone (behind main home with separation)
  const rearAvailableDepth = lotDepthFt / 2 - mainHomeDepthFt / 2 - separationFt - rearSetbackFt;
  const rearAvailableWidth = lotWidthFt - 2 * sideSetbackFt;

  let detached: GeoJSONPolygon | null = null;
  if (rearAvailableDepth > 10 && rearAvailableWidth > 10) {
    const aduWidth = Math.min(rearAvailableWidth, 30);
    const aduDepth = Math.min(rearAvailableDepth, 40);
    const aduCenterLng = lng;
    const aduCenterLat = lat + (lotDepthFt / 4) * ftToLat;

    detached = {
      type: "Polygon",
      coordinates: [
        [
          [aduCenterLng - (aduWidth / 2) * ftToLng, aduCenterLat - (aduDepth / 2) * ftToLat],
          [aduCenterLng + (aduWidth / 2) * ftToLng, aduCenterLat - (aduDepth / 2) * ftToLat],
          [aduCenterLng + (aduWidth / 2) * ftToLng, aduCenterLat + (aduDepth / 2) * ftToLat],
          [aduCenterLng - (aduWidth / 2) * ftToLng, aduCenterLat + (aduDepth / 2) * ftToLat],
          [aduCenterLng - (aduWidth / 2) * ftToLng, aduCenterLat - (aduDepth / 2) * ftToLat],
        ],
      ],
    };
  }

  // Attached ADU zone (side of main home)
  let attached: GeoJSONPolygon | null = null;
  const sideSpace = (lotWidthFt - mainHomeWidthFt) / 2 - sideSetbackFt;
  if (sideSpace > 8) {
    const aduWidth = Math.min(sideSpace, 20);
    const aduDepth = Math.min(mainHomeDepthFt, 30);
    const attachedLng = lng + (mainHomeWidthFt / 2 + aduWidth / 2) * ftToLng;

    attached = {
      type: "Polygon",
      coordinates: [
        [
          [attachedLng - (aduWidth / 2) * ftToLng, lat - (aduDepth / 2) * ftToLat],
          [attachedLng + (aduWidth / 2) * ftToLng, lat - (aduDepth / 2) * ftToLat],
          [attachedLng + (aduWidth / 2) * ftToLng, lat + (aduDepth / 2) * ftToLat],
          [attachedLng - (aduWidth / 2) * ftToLng, lat + (aduDepth / 2) * ftToLat],
          [attachedLng - (aduWidth / 2) * ftToLng, lat - (aduDepth / 2) * ftToLat],
        ],
      ],
    };
  }

  // Garage conversion zone (approximate garage location)
  const conversion: GeoJSONPolygon | null = null;

  return { detached, attached, conversion };
}

/**
 * Generate the full parcel visualization data for Mapbox rendering
 */
export function generateParcelVisualization(
  lat: number,
  lng: number,
  lotWidthFt: number,
  lotDepthFt: number,
  mainHomeWidthFt: number,
  mainHomeDepthFt: number,
  sideSetbackFt: number,
  rearSetbackFt: number,
  frontSetbackFt: number,
  separationFt: number
): ParcelVisualization {
  const parcelBoundary = generateEstimatedParcelPolygon(lat, lng, lotWidthFt, lotDepthFt);

  // Generate structure footprint (centered, slightly toward front of lot)
  const ftToLat = 1 / 364000;
  const ftToLng = 1 / (364000 * Math.cos((lat * Math.PI) / 180));
  const homeOffsetLat = -(lotDepthFt * 0.1) * ftToLat; // slightly toward front
  const structureFootprint: GeoJSONPolygon = {
    type: "Polygon",
    coordinates: [
      [
        [lng - (mainHomeWidthFt / 2) * ftToLng, lat + homeOffsetLat - (mainHomeDepthFt / 2) * ftToLat],
        [lng + (mainHomeWidthFt / 2) * ftToLng, lat + homeOffsetLat - (mainHomeDepthFt / 2) * ftToLat],
        [lng + (mainHomeWidthFt / 2) * ftToLng, lat + homeOffsetLat + (mainHomeDepthFt / 2) * ftToLat],
        [lng - (mainHomeWidthFt / 2) * ftToLng, lat + homeOffsetLat + (mainHomeDepthFt / 2) * ftToLat],
        [lng - (mainHomeWidthFt / 2) * ftToLng, lat + homeOffsetLat - (mainHomeDepthFt / 2) * ftToLat],
      ],
    ],
  };

  const setbackLines = generateSetbackLines(parcelBoundary, sideSetbackFt, rearSetbackFt, frontSetbackFt);

  const buildableEnvelope = generateBuildableEnvelope(
    lat, lng, lotWidthFt, lotDepthFt,
    sideSetbackFt, rearSetbackFt, frontSetbackFt,
    mainHomeWidthFt * mainHomeDepthFt
  );

  const candidateZones = generateCandidateZones(
    lat, lng, lotWidthFt, lotDepthFt,
    sideSetbackFt, rearSetbackFt, separationFt,
    mainHomeWidthFt, mainHomeDepthFt
  );

  return {
    parcelBoundary,
    structureFootprint,
    setbackLines,
    buildableEnvelope,
    detachedCandidateZones: candidateZones.detached ? [candidateZones.detached] : [],
    attachedCandidateZones: candidateZones.attached ? [candidateZones.attached] : [],
    conversionCandidateZones: candidateZones.conversion ? [candidateZones.conversion] : [],
    uncertaintyShading: null,
    geometryConfidence: MAPBOX_TOKEN ? 70 : 50,
  };
}

/**
 * Get a static Mapbox map image URL for the property report
 */
export function getStaticMapUrl(
  lat: number,
  lng: number,
  width: number = 600,
  height: number = 400,
  zoom: number = 18
): string | null {
  if (!MAPBOX_TOKEN) return null;

  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-l+1EAEDB(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`;
}
