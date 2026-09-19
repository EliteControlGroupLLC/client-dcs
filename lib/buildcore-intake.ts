// BuildCore intake — pushes website leads into the BuildCore CRM: "Build Your
// ADU" leads (plus the report PDF the visitor unlocked, so sales sees exactly
// what the client received) and contact-form messages. Server-only: uses
// BUILDCORE_INTAKE_SECRET.

const DEFAULT_INTAKE_URL = "https://www.buildcoreus.ai/api/intake/consultations";
const TIMEOUT_MS = 15_000;

export type BuildCoreServiceLine =
  | "adu"
  | "custom-home"
  | "remodel"
  | "roofing"
  | "general-construction";

export interface BuildCoreLeadInput {
  serviceLine?: BuildCoreServiceLine;
  source?: "adu-builder" | "website-contact";
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
