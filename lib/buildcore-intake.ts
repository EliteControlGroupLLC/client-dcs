// BuildCore intake — pushes website leads into the BuildCore CRM: "Build Your
// ADU" leads (plus the report PDF the visitor unlocked, so sales sees exactly
// what the client received) and contact-form messages. Server-only: uses
// BUILDCORE_INTAKE_SECRET.

import { COMPANY_INFO } from "@/lib/data/site-data";

// KEEP THE www. HOST. Do not "simplify" this to the apex buildcoreus.ai:
// the apex 308-redirects to www and that redirect STRIPS the Authorization
// header, so an apex POST arrives unauthenticated and the lead is lost
// (verified: apex + auth = 401, www + auth = 200/400). Same applies to
// BUILDCORE_INTAKE_URL if it is ever set in the environment.
const DEFAULT_INTAKE_URL = "https://www.buildcoreus.ai/api/intake/consultations";
const TIMEOUT_MS = 15_000;

export type BuildCoreServiceLine =
  | "adu"
  | "custom-home"
  | "remodel"
  | "fencing"
  | "roofing"
  | "concrete"
  | "windows"
  | "general-construction";

export const BUILDCORE_SERVICE_LINES: readonly BuildCoreServiceLine[] = [
  "adu",
  "custom-home",
  "remodel",
  "fencing",
  "roofing",
  "concrete",
  "windows",
  "general-construction",
];

export type BuildCoreLeadSource =
  | "adu-builder"
  | "website-contact"
  | "website-tool"
  | "website-showroom";

export interface BuildCoreLeadInput {
  serviceLine?: BuildCoreServiceLine;
  source?: BuildCoreLeadSource;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  city?: string | null;
  notes?: string;
  reportPdf?: Uint8Array | null;
}

export interface BuildCorePushResult {
  success: boolean;
  skipped?: boolean;
  status?: number;
  error?: string;
}

function titleCase(v: string): string {
  return v.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// Best-effort city: geocoder city if present, else the segment before the
// "CA 92xxx" part of "123 Main St, San Diego, CA 92104".
function resolveCity(address: string, city?: string | null): string {
  if (city && city.trim().length >= 2) return titleCase(city.trim());
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 1; i--) {
    if (/^[A-Z]{2}(\s+\d{5}(-\d{4})?)?$/i.test(parts[i]) || /^\d{5}/.test(parts[i])) continue;
    if (parts[i].toUpperCase() === "USA") continue;
    if (parts[i].length >= 2) return titleCase(parts[i]);
  }
  return "San Diego";
}

function reportFileName(address: string): string {
  const slug = address.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return `ADU-Report-${slug || "property"}.pdf`;
}

export async function pushLeadToBuildCore(input: BuildCoreLeadInput): Promise<BuildCorePushResult> {
  const secret = process.env.BUILDCORE_INTAKE_SECRET?.trim();
  if (!secret) {
    return { success: false, skipped: true, error: "BUILDCORE_INTAKE_SECRET not set" };
  }
  const url = process.env.BUILDCORE_INTAKE_URL?.trim() || DEFAULT_INTAKE_URL;

  const body: Record<string, unknown> = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    serviceLine: input.serviceLine ?? "adu",
    source: input.source ?? "adu-builder",
    propertyAddress: input.propertyAddress,
    city: resolveCity(input.propertyAddress, input.city),
    notes: input.notes ?? "",
  };
  if (input.reportPdf && input.reportPdf.length > 0) {
    body.reportPdfBase64 = Buffer.from(input.reportPdf).toString("base64");
    body.reportFileName = reportFileName(input.propertyAddress);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "manual", // a redirect would drop the POST body — treat as failure
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, status: res.status, error: text.slice(0, 500) || res.statusText };
    }
    return { success: true, status: res.status };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead capture — the website has no database of its own. BuildCore IS the
// record. Every lead-capturing route goes through captureLead() so a failed
// push is impossible to miss: it is logged loudly and the visitor is told to
// call instead, rather than being shown a "thank you" for a lead nobody has.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The visitor-facing message when a lead could not be captured. Honest: the
 * request did not get through, so give them the phone number instead.
 */
export const LEAD_CAPTURE_FAILURE_MESSAGE =
  `We couldn't send your request right now. Please call us at ${COMPANY_INFO.phone} and we'll take care of you.`;

/**
 * Push a lead into BuildCore and make any failure impossible to miss.
 *
 * Never throws. On a 400 that names `source` (BuildCore doesn't know a newer
 * source value yet) the lead is resent as a generic website lead rather than
 * dropped — a 400 means nothing was created, so this cannot duplicate.
 *
 * Logging carries the name and the failure reason only — enough for the team
 * to chase the lead from the server logs, without dumping personal data.
 */
export async function captureLead(
  tag: string,
  input: BuildCoreLeadInput
): Promise<BuildCorePushResult> {
  let source = input.source ?? "adu-builder";
  let result: BuildCorePushResult;
  try {
    result = await pushLeadToBuildCore(input);
    if (!result.success && result.status === 400 && /source/i.test(result.error ?? "")) {
      console.warn(`[${tag}] BuildCore rejected source "${source}" — retrying as website-contact`);
      source = "website-contact";
      result = await pushLeadToBuildCore({ ...input, source });
    }
  } catch (err) {
    result = { success: false, error: err instanceof Error ? err.message : String(err) };
  }

  if (result.success) {
    console.info(`[${tag}] BuildCore lead captured (source=${source}).`);
  } else {
    console.error(
      `[${tag}] LEAD NOT CAPTURED — call this person back manually. ` +
        `name="${input.firstName} ${input.lastName}" source=${source} ` +
        `status=${result.status ?? "none"} skipped=${result.skipped ? "yes" : "no"} ` +
        `reason=${result.error ?? "unknown"}`
    );
  }
  return result;
}

/** Map a free-text project/service label onto a BuildCore service line. */
export function serviceLineFromText(service: unknown): BuildCoreServiceLine {
  const s = String(service ?? "").toLowerCase();
  if (s.includes("adu") || s.includes("guest house") || s.includes("granny")) return "adu";
  if (s.includes("custom home") || s.includes("new home")) return "custom-home";
  if (
    s.includes("remodel") ||
    s.includes("kitchen") ||
    s.includes("bath") ||
    s.includes("garage conversion") ||
    s.includes("addition")
  )
    return "remodel";
  if (s.includes("roof")) return "roofing";
  if (s.includes("fenc")) return "fencing";
  if (s.includes("concrete") || s.includes("driveway") || s.includes("patio")) return "concrete";
  if (s.includes("window")) return "windows";
  return "general-construction";
}

/** Split a single "full name" field into the first/last BuildCore expects. */
export function splitFullName(name: unknown): { firstName: string; lastName: string } {
  const full = String(name ?? "").trim();
  const [first, ...rest] = full.split(/\s+/);
  return { firstName: first || full || "Website", lastName: rest.join(" ") || "-" };
}

/** BuildCore requires a phone; keep obviously-empty values out of the CRM. */
export function phoneOrNotProvided(phone: unknown): string {
  const v = String(phone ?? "").trim();
  return v.replace(/\D/g, "").length >= 7 ? v : "Not provided";
}

/**
 * Pull the city out of a picked address ("1015 Monterrey Ct, Chula Vista, CA
 * 91911" -> "Chula Vista"). The address comes from the autocomplete, so the
 * shape is predictable; anything unexpected returns an empty string rather
 * than a guess, and the lead still carries the full address.
 */
export function cityFromAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  // "street, city, STATE ZIP" — the city is the second part when present.
  if (parts.length >= 3) return parts[1];
  if (parts.length === 2) return parts[1].replace(/\s+[A-Z]{2}\s*\d{5}(-\d{4})?$/, "").trim();
  return "";
}
