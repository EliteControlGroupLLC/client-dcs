// Server-side "Build Your ADU" property report PDF.
//
// Pure pdf-lib vector drawing with StandardFonts (Helvetica / Helvetica-Bold).
// No raster images, no filesystem reads, no headless browser. The generated
// PDF is attached to the CRM lead so sales sees exactly what the client got.
//
// `scanResults` is posted from the browser and is only loosely shaped like a
// PropertyAnalysisResult, so every field is treated as possibly missing.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { FLOOR_PLANS } from "@/lib/data/site-data";

export interface AduReportLead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
}

// ─── Page geometry ───────────────────────────────────────────────────────────

const PAGE_W = 612; // US Letter
const PAGE_H = 792;
const MARGIN_X = 54;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const HEADER_H = 78; // space reserved at the top of each page
const FOOTER_H = 50; // space reserved at the bottom of each page
const CONTENT_TOP = PAGE_H - HEADER_H;
const CONTENT_BOTTOM = FOOTER_H;

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
  ink: rgb(0.11, 0.13, 0.16),
  muted: rgb(0.42, 0.45, 0.5),
  faint: rgb(0.62, 0.65, 0.69),
  rule: rgb(0.86, 0.87, 0.89),
  zebra: rgb(0.965, 0.97, 0.975),
  headFill: rgb(0.93, 0.94, 0.95),
  accent: rgb(0.1, 0.27, 0.45),
  accentSoft: rgb(0.9, 0.94, 0.98),
  green: rgb(0.13, 0.52, 0.3),
  amber: rgb(0.72, 0.5, 0.06),
  orange: rgb(0.8, 0.38, 0.1),
  red: rgb(0.72, 0.16, 0.16),
  gray: rgb(0.5, 0.52, 0.56),
};

const NA = "Not available";

// ─── Safe accessors ──────────────────────────────────────────────────────────

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function get(obj: unknown, ...path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!isObj(cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(/[$,\s]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return "";
}

function orDash(s: string): string {
  return s ? s : "-";
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function fmtInt(n: number | null): string {
  if (n === null) return "";
  return Math.round(n).toLocaleString("en-US");
}

function fmtCurrency(n: number | null): string {
  if (n === null) return "";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
}

function fmtPct(n: number | null, digits = 1): string {
  if (n === null) return "";
  const rounded = Number(n.toFixed(digits));
  return `${rounded.toLocaleString("en-US", { maximumFractionDigits: digits })}%`;
}

function fmtYears(n: number | null): string {
  // 99 is the model's "never pays back" sentinel — not a real payback period.
  if (n === null || n >= 99) return "";
  const rounded = Number(n.toFixed(1));
  return `${rounded.toLocaleString("en-US", { maximumFractionDigits: 1 })} yrs`;
}

function fmtSqFt(n: number | null): string {
  return n === null ? "" : `${fmtInt(n)} sq ft`;
}

function fmtFt(n: number | null): string {
  return n === null ? "" : `${fmtInt(n)} ft`;
}

function fmtBool(v: unknown): string {
  return typeof v === "boolean" ? (v ? "Yes" : "No") : "";
}

function titleCase(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(Adu|Jadu|Sb|Roi)\b/g, (w) => w.toUpperCase());
}

// ─── WinAnsi sanitization ────────────────────────────────────────────────────
// StandardFonts can only encode WinAnsi (CP1252). Anything else makes pdf-lib
// throw, so every string is normalized before it reaches drawText/widthOf.

const REPLACEMENTS: Record<string, string> = {
  "\u2018": "'", "\u2019": "'", "\u201A": "'", "\u201B": "'", "\u2032": "'",
  "\u201C": '"', "\u201D": '"', "\u201E": '"', "\u201F": '"', "\u2033": '"',
  "\u00AB": '"', "\u00BB": '"', "\u2039": "'", "\u203A": "'",
  "\u2010": "-", "\u2011": "-", "\u2012": "-", "\u2013": "-", "\u2014": "-",
  "\u2015": "-", "\u2212": "-", "\u2043": "-",
  "\u2022": "-", "\u2023": "-", "\u25CF": "-", "\u25E6": "-", "\u2219": "-", "\u00B7": "-",
  "\u2026": "...",
  "\u2264": "<=", "\u2265": ">=", "\u2260": "!=", "\u2248": "~", "\u00D7": "x",
  "\u00F7": "/", "\u00B1": "+/-", "\u2192": "->", "\u2190": "<-", "\u2194": "<->",
  "\u21D2": "=>", "\u2713": "", "\u2714": "", "\u2717": "", "\u2718": "",
  "\u00B2": "2", "\u00B3": "3", "\u00B0": " deg", "\u2122": "(TM)", "\u00AE": "(R)",
  "\u00A9": "(C)", "\u20AC": "EUR", "\u00A0": " ", "\u2009": " ", "\u200A": " ",
  "\u2002": " ", "\u2003": " ", "\u202F": " ", "\u200B": "", "\u200C": "", "\u200D": "",
  "\uFEFF": "", "\u00AD": "",
  "\t": " ",
};

/**
 * Reduce a string to a conservative WinAnsi-safe subset: printable ASCII plus
 * Latin-1 letters (0xC0-0xFF, e.g. accented names). Newlines are preserved for
 * the wrapper; everything else outside the set is transliterated or dropped.
 */
function sanitize(input: unknown): string {
  const s = typeof input === "string" ? input : str(input);
  let out = "";
  for (const ch of s) {
    const rep = REPLACEMENTS[ch];
    if (rep !== undefined) {
      out += rep;
      continue;
    }
    const code = ch.codePointAt(0) ?? 0;
    if (ch === "\n") {
      out += "\n";
    } else if (ch === "\r") {
      // drop; \r\n collapses to \n
    } else if (code >= 0x20 && code <= 0x7e) {
      out += ch;
    } else if (code >= 0xc0 && code <= 0xff) {
      out += ch;
    } else {
      // Try stripping diacritics (e.g. "ą" -> "a"); otherwise drop (emoji, CJK, etc).
      const base = ch.normalize("NFKD").replace(/[\u0300-\u036F]/g, "");
      if (/^[\x20-\x7e]+$/.test(base)) out += base;
    }
  }
  return out.replace(/[ ]{2,}/g, " ");
}

// ─── Layout engine ───────────────────────────────────────────────────────────

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
}

interface TextOpts {
  font?: PDFFont;
  size?: number;
  color?: RGB;
  lineGap?: number;
}

class ReportWriter {
  readonly doc: PDFDocument;
  readonly fonts: Fonts;
  readonly generatedLabel: string;
  page!: PDFPage;
  y = CONTENT_TOP;

  constructor(doc: PDFDocument, fonts: Fonts, generatedLabel: string) {
    this.doc = doc;
    this.fonts = fonts;
    this.generatedLabel = generatedLabel;
    this.newPage();
  }

  newPage(): void {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.drawHeader();
    this.y = CONTENT_TOP;
  }

  /** Start a new page if fewer than `h` points remain above the footer. */
  ensure(h: number): void {
    if (this.y - h < CONTENT_BOTTOM) this.newPage();
  }

  space(h: number): void {
    this.y -= h;
  }

  private drawHeader(): void {
    const { regular, bold } = this.fonts;
    const p = this.page;
    const top = PAGE_H - 40;
    p.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: C.accent });
    p.drawText(sanitize("TruthCore"), {
      x: MARGIN_X, y: top, size: 14, font: bold, color: C.accent,
    });
    p.drawText(sanitize("ADU Property Report"), {
      x: MARGIN_X, y: top - 15, size: 9.5, font: regular, color: C.muted,
    });
    const gen = sanitize(this.generatedLabel);
    const genW = regular.widthOfTextAtSize(gen, 8.5);
    p.drawText(gen, { x: PAGE_W - MARGIN_X - genW, y: top + 2, size: 8.5, font: regular, color: C.muted });
    p.drawLine({
      start: { x: MARGIN_X, y: top - 26 }, end: { x: PAGE_W - MARGIN_X, y: top - 26 },
      thickness: 0.75, color: C.rule,
    });
  }

  /** Called once all content is laid out, so "Page X of Y" is known. */
  drawFooters(): void {
    const { regular } = this.fonts;
    const pages = this.doc.getPages();
    const total = pages.length;
    pages.forEach((p, i) => {
      p.drawLine({
        start: { x: MARGIN_X, y: 36 }, end: { x: PAGE_W - MARGIN_X, y: 36 },
        thickness: 0.5, color: C.rule,
      });
      const left = sanitize("TruthCore, a DBA of Distinct Construction Solutions  |  Preliminary planning estimate, not a permit determination");
      p.drawText(left, { x: MARGIN_X, y: 24, size: 7.5, font: regular, color: C.faint });
      const right = sanitize(`Page ${i + 1} of ${total}`);
      const w = regular.widthOfTextAtSize(right, 8);
      p.drawText(right, { x: PAGE_W - MARGIN_X - w, y: 24, size: 8, font: regular, color: C.muted });
    });
  }

  /** Word-wrap text to `maxWidth`, honoring explicit newlines and hard-breaking long tokens. */
  wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const clean = sanitize(text);
    const lines: string[] = [];
    for (const para of clean.split("\n")) {
      const words = para.split(" ").filter((w) => w.length > 0);
      if (words.length === 0) {
        lines.push("");
        continue;
      }
      let line = "";
      for (const rawWord of words) {
        let word = rawWord;
        // Hard-break tokens wider than the column (URLs, long APNs).
        while (font.widthOfTextAtSize(word, size) > maxWidth) {
          let cut = word.length - 1;
          while (cut > 1 && font.widthOfTextAtSize(word.slice(0, cut), size) > maxWidth) cut--;
          if (line) {
            lines.push(line);
            line = "";
          }
          lines.push(word.slice(0, cut));
          word = word.slice(cut);
        }
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          line = candidate;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);
    }
    return lines.length ? lines : [""];
  }

  /** Flowing paragraph with automatic page breaks between lines. */
  paragraph(text: string, opts: TextOpts & { x?: number; width?: number } = {}): void {
    const font = opts.font ?? this.fonts.regular;
    const size = opts.size ?? 10;
    const color = opts.color ?? C.ink;
    const x = opts.x ?? MARGIN_X;
    const width = opts.width ?? CONTENT_W - (x - MARGIN_X);
    const lh = size * 1.38 + (opts.lineGap ?? 0);
    for (const line of this.wrap(text, font, size, width)) {
      this.ensure(lh);
      this.y -= lh;
      if (line) this.page.drawText(line, { x, y: this.y + (lh - size) / 2, size, font, color });
    }
  }

  bullets(items: string[], opts: TextOpts = {}): void {
    const size = opts.size ?? 9.5;
    for (const item of items) {
      const lines = this.wrap(item, this.fonts.regular, size, CONTENT_W - 14);
      const lh = size * 1.38;
      lines.forEach((line, i) => {
        this.ensure(lh);
        this.y -= lh;
        const baseline = this.y + (lh - size) / 2;
        if (i === 0) {
          this.page.drawCircle({ x: MARGIN_X + 4, y: baseline + size * 0.33, size: 1.6, color: opts.color ?? C.muted });
        }
        this.page.drawText(line, {
          x: MARGIN_X + 14, y: baseline, size, font: this.fonts.regular, color: opts.color ?? C.ink,
        });
      });
      this.y -= 2;
    }
  }

  sectionTitle(title: string, number?: number): void {
    // Keep the heading with its first block (callout boxes run ~110pt).
    this.ensure(130);
    this.y -= 22;
    const { bold } = this.fonts;
    const label = sanitize(number ? `${number}. ${title}` : title);
    this.page.drawRectangle({ x: MARGIN_X, y: this.y - 2, width: 3, height: 14, color: C.accent });
    this.page.drawText(label, { x: MARGIN_X + 10, y: this.y, size: 12.5, font: bold, color: C.ink });
    this.y -= 12;
  }

  /** Two-column label/value rows with an optional status pill on the right. */
  keyValues(rows: { label: string; value: string; status?: string }[], labelW = 150): void {
    const size = 9.5;
    const { regular, bold } = this.fonts;
    const pillW = 78;
    rows.forEach((row, idx) => {
      const valueW = CONTENT_W - labelW - (row.status !== undefined ? pillW + 12 : 0) - 10;
      const lines = this.wrap(row.value || "-", regular, size, valueW);
      const lh = size * 1.38;
      const h = Math.max(lines.length * lh, lh) + 8;
      this.ensure(h);
      const top = this.y;
      if (idx % 2 === 0) {
        this.page.drawRectangle({ x: MARGIN_X, y: top - h, width: CONTENT_W, height: h, color: C.zebra });
      }
      const firstBaseline = top - 4 - lh + (lh - size) / 2;
      this.page.drawText(sanitize(row.label), {
        x: MARGIN_X + 8, y: firstBaseline, size, font: bold, color: C.muted,
      });
      lines.forEach((line, i) => {
        this.page.drawText(line, {
          x: MARGIN_X + labelW, y: firstBaseline - i * lh, size, font: regular, color: C.ink,
        });
      });
      if (row.status !== undefined) this.pill(row.status, PAGE_W - MARGIN_X - pillW - 6, firstBaseline - 3, pillW);
      this.y = top - h;
    });
  }

  /** Small colored status label, e.g. "Verified" / "Estimated". */
  pill(label: string, x: number, y: number, w: number): void {
    const text = sanitize(label || "Unavailable");
    const color = statusColor(text);
    const size = 7.5;
    this.page.drawRectangle({
      x, y, width: w, height: 13, color: rgb(1, 1, 1), borderColor: color, borderWidth: 0.8, opacity: 1,
    });
    const tw = this.fonts.bold.widthOfTextAtSize(text, size);
    this.page.drawText(text, { x: x + (w - tw) / 2, y: y + 3.6, size, font: this.fonts.bold, color });
  }

  /** Table with wrapped cells, zebra rows, and a header repeated after page breaks. */
  table(
    columns: { header: string; width: number; align?: "left" | "right" }[],
    rows: { cells: string[]; colors?: (RGB | undefined)[]; bold?: boolean[] }[],
  ): void {
    const size = 9;
    const pad = 6;
    const lh = size * 1.36;
    const { regular, bold } = this.fonts;
    const totalW = columns.reduce((s, c) => s + c.width, 0);
    const scale = CONTENT_W / totalW;
    const widths = columns.map((c) => c.width * scale);

    const drawHead = () => {
      const h = lh + 10;
      this.ensure(h + lh + 10);
      const top = this.y;
      this.page.drawRectangle({ x: MARGIN_X, y: top - h, width: CONTENT_W, height: h, color: C.headFill });
      let x = MARGIN_X;
      columns.forEach((col, i) => {
        const text = sanitize(col.header);
        const tw = bold.widthOfTextAtSize(text, 8.5);
        const tx = col.align === "right" ? x + widths[i] - pad - tw : x + pad;
        this.page.drawText(text, { x: tx, y: top - h + 7, size: 8.5, font: bold, color: C.muted });
        x += widths[i];
      });
      this.y = top - h;
    };

    drawHead();
    rows.forEach((row, rIdx) => {
      const cellLines = row.cells.map((cell, i) =>
        this.wrap(cell || "-", row.bold?.[i] ? bold : regular, size, widths[i] - pad * 2),
      );
      const h = Math.max(...cellLines.map((l) => l.length)) * lh + 10;
      if (this.y - h < CONTENT_BOTTOM) {
        this.newPage();
        drawHead();
      }
      const top = this.y;
      if (rIdx % 2 === 1) {
        this.page.drawRectangle({ x: MARGIN_X, y: top - h, width: CONTENT_W, height: h, color: C.zebra });
      }
      let x = MARGIN_X;
      cellLines.forEach((lines, i) => {
        const font = row.bold?.[i] ? bold : regular;
        const color = row.colors?.[i] ?? C.ink;
        lines.forEach((line, li) => {
          const tw = font.widthOfTextAtSize(line, size);
          const tx = columns[i].align === "right" ? x + widths[i] - pad - tw : x + pad;
          this.page.drawText(line, { x: tx, y: top - 5 - (li + 1) * lh + (lh - size) / 2 + 1, size, font, color });
        });
        x += widths[i];
      });
      this.page.drawLine({
        start: { x: MARGIN_X, y: top - h }, end: { x: MARGIN_X + CONTENT_W, y: top - h },
        thickness: 0.4, color: C.rule,
      });
      this.y = top - h;
    });
  }

  /** Highlighted call-out box with a bold label and wrapped body text. */
  callout(label: string, body: string): void {
    const size = 10;
    const lh = size * 1.4;
    const lines = this.wrap(body, this.fonts.regular, size, CONTENT_W - 28);
    const h = 22 + lines.length * lh + 10;
    this.ensure(Math.min(h, CONTENT_TOP - CONTENT_BOTTOM));
    const top = this.y;
    const boxH = Math.min(h, top - CONTENT_BOTTOM);
    this.page.drawRectangle({ x: MARGIN_X, y: top - boxH, width: CONTENT_W, height: boxH, color: C.accentSoft });
    this.page.drawRectangle({ x: MARGIN_X, y: top - boxH, width: 3, height: boxH, color: C.accent });
    this.page.drawText(sanitize(label), {
      x: MARGIN_X + 14, y: top - 16, size: 8.5, font: this.fonts.bold, color: C.accent,
    });
    this.y = top - 22;
    for (const line of lines) {
      this.ensure(lh);
      this.y -= lh;
      if (line) this.page.drawText(line, { x: MARGIN_X + 14, y: this.y + (lh - size) / 2, size, font: this.fonts.regular, color: C.ink });
    }
    this.y -= 10;
  }
}

function statusColor(label: string): RGB {
  const s = label.toLowerCase();
  if (s.includes("verified") || s === "likely" || s === "high") return C.green;
  if (s.includes("cross")) return C.accent;
  if (s.includes("estimated") || s === "possible" || s === "moderate") return C.amber;
  if (s === "limited") return C.orange;
  if (s.includes("not recommended") || s === "low" || s.includes("rejected")) return C.red;
  return C.gray;
}

// ─── Field extraction ────────────────────────────────────────────────────────

/** Read an IntelligenceField (or a bare value) into display value + status. */
function intelField(
  scan: unknown,
  key: string,
  format: (v: unknown) => string,
): { value: string; status: string } {
  const f = get(scan, "property", key);
  if (f === undefined || f === null) return { value: NA, status: "Unavailable" };
  if (!isObj(f)) {
    const v = format(f);
    return { value: v || NA, status: v ? "Reported" : "Unavailable" };
  }
  const display = str(f.displayValue);
  // An "Unavailable" field holds an assumed stand-in, not data — never print it.
  if (!display && str(f.status) === "Unavailable") return { value: NA, status: "Unavailable" };
  const v = display || format(f.value);
  const status = str(f.status) || (v ? "Reported" : "Unavailable");
  return { value: v || NA, status: v ? status : "Unavailable" };
}

const asText = (v: unknown) => str(v);
const asSqFt = (v: unknown) => fmtSqFt(num(v));

// ─── Public API ──────────────────────────────────────────────────────────────

export async function buildAduReportPdf(lead: AduReportLead, scanResults: unknown): Promise<Uint8Array> {
  const scan: unknown = isObj(scanResults) ? scanResults : {};
  const safeLead: Obj = isObj(lead) ? (lead as unknown as Obj) : {};

  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "America/Los_Angeles",
  });
  const fullName = [str(safeLead.firstName), str(safeLead.lastName)].filter(Boolean).join(" ");
  const address = str(safeLead.propertyAddress) || str(get(scan, "property", "address", "value")) || str(get(scan, "geocoded", "formattedAddress"));

  doc.setTitle(sanitize(`ADU Property Report${address ? ` - ${address}` : ""}`));
  doc.setAuthor("TruthCore (Distinct Construction Solutions)");
  doc.setSubject("Build Your ADU property report");
  doc.setCreator("TruthCore");
  doc.setProducer("pdf-lib");
  doc.setCreationDate(now);
  doc.setModificationDate(now);

  const w = new ReportWriter(doc, fonts, `Generated ${dateLabel}`);

  // Title block
  w.space(8);
  w.paragraph("Property Report", { font: fonts.bold, size: 20, color: C.ink });
  w.paragraph(address || "Property address not provided", { size: 11.5, color: C.muted });
  w.space(4);

  // 1. Prepared for
  let n = 0;
  w.sectionTitle("Prepared For", ++n);
  w.keyValues([
    { label: "Name", value: fullName || NA },
    { label: "Email", value: str(safeLead.email) || NA },
    { label: "Phone", value: str(safeLead.phone) || NA },
    { label: "Property address", value: address || NA },
  ]);

  // 2. Property facts
  w.sectionTitle("Property Facts", ++n);
  const jName = str(get(scan, "jurisdiction", "name"));
  const jUncertain = get(scan, "jurisdiction", "uncertain") === true;
  const jConf = num(get(scan, "jurisdiction", "confidence"));
  const apn = intelField(scan, "apn", asText);
  const lot = intelField(scan, "lotSizeSqFt", asSqFt);
  const home = intelField(scan, "homeAreaSqFt", asSqFt);
  const zoning = intelField(scan, "zoning", asText);
  const zoningDesc = str(get(scan, "zoningEnrichment", "zoningDescription"));
  w.keyValues([
    { label: "APN", value: apn.value, status: apn.status },
    { label: "Lot size", value: lot.value, status: lot.status },
    { label: "Home living area", value: home.value, status: home.status },
    {
      label: "Zoning",
      value: zoning.value !== NA && zoningDesc ? `${zoning.value} (${zoningDesc})` : zoning.value,
      status: zoning.status,
    },
    {
      label: "Jurisdiction",
      value: jName || NA,
      status: jName ? (jUncertain ? "Estimated" : jConf !== null && jConf >= 90 ? "Verified" : "Reported") : "Unavailable",
    },
  ]);

  // 3. ADU rules snapshot
  const rules = get(scan, "aduRulesSnapshot");
  if (isObj(rules)) {
    w.sectionTitle(`ADU Rules Snapshot${jName ? ` - ${jName}` : ""}`, ++n);
    const side = fmtFt(num(rules.sideSetbackFt));
    const rear = fmtFt(num(rules.rearSetbackFt));
    const setbacks = side || rear ? [side && `${side} side`, rear && `${rear} rear`].filter(Boolean).join(" / ") : "";
    const parking =
      typeof rules.parkingRequired === "boolean"
        ? rules.parkingRequired
          ? "Required (exemptions may apply)"
          : "Not required"
        : "";
    const heightBits = [fmtFt(num(rules.maxHeightFt))];
    const twoStory = fmtBool(rules.twoStoryAllowed);
    if (twoStory) heightBits.push(`two-story ${twoStory === "Yes" ? "allowed" : "not allowed"}`);
    const rows = [
      { label: "Detached ADU max", value: fmtSqFt(num(rules.detachedMaxSqft)) || NA },
      { label: "Attached ADU max", value: fmtSqFt(num(rules.attachedMaxSqft)) || NA },
      { label: "JADU max", value: fmtSqFt(num(rules.jaduMaxSqft)) || NA },
      { label: "Setbacks", value: setbacks || NA },
      { label: "Max height", value: heightBits.filter(Boolean).join(", ") || NA },
      { label: "Parking", value: parking || NA },
    ];
    const owner = str(rules.ownerOccupancyNotes);
    const bonus = str(rules.bonusProgramNotes);
    if (owner) rows.push({ label: "Owner occupancy", value: owner });
    if (bonus) rows.push({ label: "Bonus programs", value: bonus });
    w.keyValues(rows);
  }

  // 4. Feasibility
  w.sectionTitle("ADU Feasibility", ++n);
  const best = str(get(scan, "bestRecommendation")) || str(get(scan, "smartBanner", "recommendation"));
  const bannerDetails = str(get(scan, "smartBanner", "details"));
  if (best) {
    w.callout("BEST RECOMMENDATION", bannerDetails && bannerDetails !== best ? `${best}\n${bannerDetails}` : best);
  }
  // Same rows (and TruthCore plan pricing) the client saw in "Recommended ADU Paths".
  const recs = arr(get(scan, "recommendations")).filter(isObj);
  const feasRows = (recs.length ? recs : arr(get(scan, "enhancedFeasibility")).filter(isObj)).slice(0, 12);
  if (feasRows.length) {
    w.space(4);
    w.table(
      [
        { header: "ADU type", width: 150 },
        { header: "Feasibility", width: 90 },
        { header: "Size range", width: 110 },
        { header: "Price range", width: 130 },
      ],
      feasRows.map((r) => {
        const feas = str(r.feasibility);
        let size = str(r.estimatedSizeRange);
        if (!size) {
          const lo = num(r.minSizeSqft);
          const hi = num(r.maxSizeSqft);
          if (lo !== null && hi !== null) size = `${fmtInt(lo)}-${fmtInt(hi)} sq ft`;
          else if (hi !== null) size = `Up to ${fmtInt(hi)} sq ft`;
        }
        return {
          cells: [orDash(str(r.type)), orDash(feas), orDash(size), orDash(str(r.priceRange))],
          colors: [undefined, feas ? statusColor(feas) : undefined],
          bold: [true, true],
        };
      }),
    );
  } else if (!best) {
    w.paragraph("Feasibility results were not available for this property. Our team will review it manually.", {
      size: 9.5, color: C.muted,
    });
  }

  // 5. Financial snapshot
  const scenarios = arr(get(scan, "financialScenarios")).filter(isObj).slice(0, 3);
  w.sectionTitle("Financial Snapshot", ++n);
  if (scenarios.length) {
    w.table(
      [
        { header: "Scenario", width: 170 },
        { header: "Total cost", width: 85, align: "right" },
        { header: "Monthly rent", width: 90, align: "right" },
        { header: "ROI", width: 60, align: "right" },
        { header: "Payback", width: 70, align: "right" },
      ],
      scenarios.map((s) => ({
        cells: [
          orDash(str(s.scenarioName) || titleCase(str(s.scenarioType))),
          orDash(fmtCurrency(num(s.estimatedTotalCost))),
          orDash(fmtCurrency(num(s.estimatedMonthlyIncome))),
          orDash(fmtPct(num(s.estimatedRoi))),
          orDash(fmtYears(num(s.estimatedPaybackYears))),
        ],
        bold: [true],
      })),
    );
    const first = scenarios[0];
    const rentBasis = str(first.rentBasis);
    const assumptions = arr(first.assumptions).map(str).filter(Boolean);
    if (rentBasis) {
      w.space(4);
      w.paragraph(`Rent basis: ${rentBasis}`, { size: 8.5, color: C.muted });
    }
    if (assumptions.length) {
      w.space(4);
      w.paragraph("Planning assumptions", { font: fonts.bold, size: 9, color: C.ink });
      w.bullets(assumptions);
    }
  } else {
    w.paragraph("Financial scenarios were not available for this property.", { size: 9.5, color: C.muted });
  }

  // 5b. Site conditions (each from a real map query, or "Not checked")
  const constraints = arr(get(scan, "siteConstraints", "constraints")).filter(isObj);
  if (constraints.length) {
    w.sectionTitle("Site Conditions", ++n);
    w.keyValues(
      constraints.map((c) => ({
        label: titleCase(str(c.category)),
        value: num(c.confidence) === 0 ? `Not checked — ${str(c.classification)}` : `${str(c.classification)} (source: ${str(c.source)})`,
      })),
    );
  }

  // 6. Confidence
  w.sectionTitle("Report Confidence", ++n);
  const score = num(get(scan, "confidenceScore"));
  const band = str(get(scan, "confidenceBand"));
  const bandLabel = band ? titleCase(band) : "";
  w.keyValues([
    {
      label: "Confidence score",
      value: score !== null ? fmtPct(score, 0) : NA,
      status: bandLabel || (score !== null ? "Reported" : "Unavailable"),
    },
  ]);
  const reasons = arr(get(scan, "manualReviewReasons")).map(str).filter(Boolean);
  if (reasons.length || get(scan, "manualReviewRequired") === true) {
    w.space(8);
    w.paragraph("Items flagged for manual review", { font: fonts.bold, size: 10, color: C.ink });
    w.bullets(reasons.length ? reasons : ["A specialist review is recommended for this property."]);
  }

  // 7. Floor plans
  w.sectionTitle("Our ADU Floor Plans & Pricing", ++n);
  const plans = Array.isArray(FLOOR_PLANS) ? FLOOR_PLANS : [];
  w.table(
    [
      { header: "Floor plan", width: 150 },
      { header: "Size", width: 70, align: "right" },
      { header: "Bed / bath", width: 70 },
      { header: "Price range", width: 120 },
      { header: "Est. rent", width: 110, align: "right" },
    ],
    plans.map((p) => {
      const bed = num(p.bedrooms);
      const bath = num(p.bathrooms);
      const bedLabel = bed === null ? "-" : bed === 0 ? "Studio" : `${bed} bd`;
      const bathLabel = bath === null ? "-" : `${bath} ba`;
      const lo = num(p.rentEstimate?.low);
      const hi = num(p.rentEstimate?.high);
      const rent = lo !== null && hi !== null ? `${fmtCurrency(lo)}-${fmtCurrency(hi)}/mo` : "";
      return {
        cells: [
          orDash(str(p.name)),
          orDash(fmtSqFt(num(p.sqFt))),
          `${bedLabel} / ${bathLabel}`,
          orDash(str(p.priceRange)),
          orDash(rent),
        ],
        bold: [true],
      };
    }),
  );
  w.space(6);
  w.paragraph(
    "Pricing reflects typical all-in design, permitting, and construction ranges. Final pricing depends on site conditions, utilities, and finish selections.",
    { size: 8.5, color: C.muted },
  );

  // 8. Disclaimers
  w.sectionTitle("Disclaimers", ++n);
  const disclaimer =
    str(get(scan, "disclaimer")) ||
    "Recommendations are based on parcel data, mapped jurisdiction standards, and publicly available regulations. Final feasibility depends on site conditions, utilities, easements, overlays, and formal city review.";
  const finDisclaimer =
    str(get(scan, "financialDisclaimer")) ||
    "Cost, financing, income, and ROI results are planning estimates only and are not loan offers, appraisals, or guaranteed investment returns.";
  w.paragraph(disclaimer, { size: 8.5, color: C.muted });
  w.space(6);
  w.paragraph(finDisclaimer, { size: 8.5, color: C.muted });
  w.space(6);
  w.paragraph(
    "This report is a pre-feasibility assessment, not a permit approval determination. Contact TruthCore for a site visit and formal feasibility review.",
    { size: 8.5, color: C.muted },
  );

  w.drawFooters();
  return doc.save();
}
