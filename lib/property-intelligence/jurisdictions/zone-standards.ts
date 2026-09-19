// Base-zone standards the ADU site engine needs, per zone code.
//
// ADU front setbacks follow the BASE ZONE (SDMC § 141.0302(b)(9)(A)), and
// multiple-dwelling zones allow extra primary units by density. Only values
// read from the adopted code tables are listed here; anything else falls back
// to the jurisdiction profile's default (frontSetbackFt) and is labelled so.
//
// City of San Diego — SDMC Chapter 13, Article 1, Division 4 (7-2026 PDF:
// https://docs.sandiego.gov/municode/MuniCodeChapter13/Ch13Art01Division04.pdf)
//   • Table 131-04D (RS zones): single "Min Front setback" row.
//   • Table 131-04G (RM zones): min / standard front setback and max density
//     (sq ft of lot per dwelling unit). § 131.0443: up to 50% of the building
//     envelope width may use the 15 ft minimum; the rest the 20 ft standard —
//     the engine uses the 20 ft standard (conservative).

export interface ZoneStandards {
  zone: string;
  /** Front setback (ft) the engine uses for this zone. */
  frontSetbackFt: number;
  frontSetbackNote: string;
  /** Max density: sq ft of lot per dwelling unit (multiple-dwelling zones). */
  lotSqFtPerUnit: number | null;
  /** Zone allows more than one primary dwelling unit by right. */
  multiUnit: boolean;
  citation: string;
}

const SD_RS_FRONT: Record<string, number> = {
  "RS-1-4": 20,
  "RS-1-5": 20,
  "RS-1-6": 15,
  "RS-1-7": 15,
};

const SD_RM: Record<string, { minFront: number; stdFront: number; sqFtPerUnit: number }> = {
  "RM-1-1": { minFront: 15, stdFront: 20, sqFtPerUnit: 3000 },
  "RM-1-2": { minFront: 15, stdFront: 20, sqFtPerUnit: 2500 },
  "RM-1-3": { minFront: 15, stdFront: 20, sqFtPerUnit: 2000 },
  "RM-2-4": { minFront: 15, stdFront: 20, sqFtPerUnit: 1750 },
  "RM-2-5": { minFront: 15, stdFront: 20, sqFtPerUnit: 1500 },
  "RM-2-6": { minFront: 15, stdFront: 20, sqFtPerUnit: 1250 },
  "RM-3-7": { minFront: 10, stdFront: 20, sqFtPerUnit: 1000 },
};

/** Pull a base-zone code like "RM-2-5" out of "RM-2-5 (Residential—Multiple Unit)". */
export function extractZoneCode(zoning: string | null | undefined): string | null {
  if (!zoning) return null;
  const m = zoning.toUpperCase().match(/\b(R[SMTX]{1,2}-\d-\d{1,2})\b/);
  return m ? m[1] : null;
}

/**
 * Verified base-zone standards for a parcel, or null when the zone isn't in
 * our verified table (callers then use the jurisdiction profile default).
 */
export function getZoneStandards(jurisdictionId: string, zoning: string | null | undefined): ZoneStandards | null {
  if (jurisdictionId !== "san-diego-city") return null;
  const zone = extractZoneCode(zoning);
  if (!zone) return null;
  if (SD_RS_FRONT[zone] != null) {
    return {
      zone,
      frontSetbackFt: SD_RS_FRONT[zone],
      frontSetbackNote: `${SD_RS_FRONT[zone]} ft minimum front setback (${zone})`,
      lotSqFtPerUnit: null,
      multiUnit: false,
      citation: "SDMC Table 131-04D",
    };
  }
  const rm = SD_RM[zone];
  if (rm) {
    return {
      zone,
      frontSetbackFt: rm.stdFront,
      frontSetbackNote: `${rm.stdFront} ft standard front setback (${rm.minFront} ft minimum allowed on up to 50% of the building width, SDMC § 131.0443)`,
      lotSqFtPerUnit: rm.sqFtPerUnit,
      multiUnit: true,
      citation: "SDMC Table 131-04G",
    };
  }
  return null;
}

/**
 * Units allowed by base density on a multiple-dwelling lot (floor of lot ÷
 * sq ft per unit, at least 1). Null when not a multi-unit zone.
 */
export function baseDensityUnits(standards: ZoneStandards | null, lotSizeSqFt: number | null | undefined): number | null {
  if (!standards?.lotSqFtPerUnit || !lotSizeSqFt || lotSizeSqFt <= 0) return null;
  return Math.max(1, Math.floor(lotSizeSqFt / standards.lotSqFtPerUnit));
}
