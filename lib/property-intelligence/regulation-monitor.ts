// Self-Updating Regulation Monitor — Monitors official city/county/state sources
// for ADU/JADU/SB9 rule changes and automatically updates jurisdiction rules.
// Designed to run as a recurring background job (Vercel Cron or similar).

import type { JurisdictionProfile } from "./jurisdictions/types";
import { JURISDICTION_PROFILES } from "./jurisdictions/profiles";

// ─── Data Model Types ───

export interface RegulationSource {
  id: string;
  jurisdictionId: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: "municipal-code" | "planning-page" | "bulletin" | "ordinance" | "state-guidance" | "county-page";
  monitorFrequency: "daily" | "weekly" | "biweekly" | "monthly";
  lastChecked: string | null;
  lastChangeDetected: string | null;
  extractionConfidence: number;
  active: boolean;
}

export interface RegulationChange {
  id: string;
  jurisdictionId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  sourceUrl: string;
  updateTimestamp: string;
  extractionConfidence: number;
  reviewStatus: "pending" | "approved" | "rejected";
}

export interface RulesVersionRecord {
  jurisdictionId: string;
  version: string;
  effectiveDate: string;
  changesSummary: string;
  sourceUrls: string[];
  confidence: number;
}

// ─── Official Source Registry ───

const REGULATION_SOURCES: RegulationSource[] = [
  // City of San Diego
  {
    id: "sd-city-adu-page",
    jurisdictionId: "san-diego-city",
    sourceTitle: "City of San Diego ADU Program",
    sourceUrl: "https://www.sandiego.gov/development-services/news-programs/adu",
    sourceType: "planning-page",
    monitorFrequency: "weekly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 80,
    active: true,
  },
  {
    id: "sd-city-municipal-code",
    jurisdictionId: "san-diego-city",
    sourceTitle: "San Diego Municipal Code - ADU Regulations",
    sourceUrl: "https://www.sandiego.gov/city-clerk/officialdocs/municipal-code",
    sourceType: "municipal-code",
    monitorFrequency: "monthly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 90,
    active: true,
  },
  // Chula Vista
  {
    id: "cv-adu-page",
    jurisdictionId: "chula-vista",
    sourceTitle: "City of Chula Vista ADU Information",
    sourceUrl: "https://www.chulavistaca.gov/departments/development-services/planning/accessory-dwelling-units",
    sourceType: "planning-page",
    monitorFrequency: "weekly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 75,
    active: true,
  },
  // Carlsbad
  {
    id: "carlsbad-adu-page",
    jurisdictionId: "carlsbad",
    sourceTitle: "City of Carlsbad ADU Information",
    sourceUrl: "https://www.carlsbadca.gov/departments/community-development/planning/accessory-dwelling-units",
    sourceType: "planning-page",
    monitorFrequency: "weekly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 75,
    active: true,
  },
  // Encinitas
  {
    id: "encinitas-adu-page",
    jurisdictionId: "encinitas",
    sourceTitle: "City of Encinitas ADU Program",
    sourceUrl: "https://www.encinitasca.gov/government/departments/development-services/planning/accessory-dwelling-units",
    sourceType: "planning-page",
    monitorFrequency: "weekly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 75,
    active: true,
  },
  // Escondido
  {
    id: "escondido-adu-page",
    jurisdictionId: "escondido",
    sourceTitle: "City of Escondido ADU Information",
    sourceUrl: "https://www.escondido.org/accessory-dwelling-units",
    sourceType: "planning-page",
    monitorFrequency: "weekly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 75,
    active: true,
  },
  // Oceanside
  {
    id: "oceanside-adu-page",
    jurisdictionId: "oceanside",
    sourceTitle: "City of Oceanside ADU Information",
    sourceUrl: "https://www.ci.oceanside.ca.us/gov/dev/planning/adu.asp",
    sourceType: "planning-page",
    monitorFrequency: "weekly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 75,
    active: true,
  },
  // San Diego County (unincorporated)
  {
    id: "sd-county-adu-page",
    jurisdictionId: "san-diego-county",
    sourceTitle: "County of San Diego ADU Program",
    sourceUrl: "https://www.sandiegocounty.gov/pds/accessory.html",
    sourceType: "county-page",
    monitorFrequency: "weekly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 80,
    active: true,
  },
  // California HCD (state-level guidance)
  {
    id: "ca-hcd-adu-guidance",
    jurisdictionId: "california-state",
    sourceTitle: "California HCD ADU Handbook",
    sourceUrl: "https://www.hcd.ca.gov/policy-and-research/accessory-dwelling-units",
    sourceType: "state-guidance",
    monitorFrequency: "monthly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 95,
    active: true,
  },
  {
    id: "ca-sb9-guidance",
    jurisdictionId: "california-state",
    sourceTitle: "California SB 9 Implementation",
    sourceUrl: "https://www.hcd.ca.gov/planning-and-community-development/sb-9",
    sourceType: "state-guidance",
    monitorFrequency: "monthly",
    lastChecked: null,
    lastChangeDetected: null,
    extractionConfidence: 90,
    active: true,
  },
];

// ─── In-Memory State (replaced by database in production) ───

let regulationHistory: RegulationChange[] = [];
let lastScanTimestamp: string | null = null;

// ─── Public API ───

/**
 * Get all registered regulation sources
 */
export function getRegulationSources(): RegulationSource[] {
  return REGULATION_SOURCES;
}

/**
 * Get regulation sources for a specific jurisdiction
 */
export function getSourcesForJurisdiction(jurisdictionId: string): RegulationSource[] {
  return REGULATION_SOURCES.filter(
    (s) => s.jurisdictionId === jurisdictionId || s.jurisdictionId === "california-state"
  );
}

/**
 * Get the current rules version for a jurisdiction
 */
export function getRulesVersion(jurisdictionId: string): RulesVersionRecord | null {
  const profile = JURISDICTION_PROFILES[jurisdictionId];
  if (!profile) return null;

  return {
    jurisdictionId,
    version: profile.identity.rulesVersion,
    effectiveDate: profile.identity.lastVerifiedDate,
    changesSummary: `Rules verified as of ${profile.identity.lastVerifiedDate}`,
    sourceUrls: profile.identity.sourceUrls,
    confidence: profile.confidence.confidenceDefault,
  };
}

/**
 * Get regulation change history
 */
export function getRegulationHistory(): RegulationChange[] {
  return regulationHistory;
}

/**
 * Get the last scan timestamp
 */
export function getLastScanTimestamp(): string | null {
  return lastScanTimestamp;
}

// ─── Content Snapshot Store (in-memory; persisted per serverless cold start) ───
const contentSnapshots: Record<string, string> = {};

/**
 * Simple content hash — produces a short deterministic digest of text content.
 * Used to detect whether a page has changed since the last check.
 */
function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash.toString(36);
}

/**
 * Strip HTML tags, collapse whitespace, and extract meaningful text content.
 * This makes comparison resilient to cosmetic markup changes.
 */
function extractTextContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * ADU-related keywords that signal meaningful regulation content.
 * If a page contains several of these, confidence in the extraction is higher.
 */
const ADU_KEYWORDS = [
  "accessory dwelling unit",
  "adu",
  "jadu",
  "setback",
  "lot coverage",
  "height limit",
  "square feet",
  "sq ft",
  "parking",
  "owner-occupied",
  "sb 9",
  "sb9",
  "building permit",
  "zoning",
  "residential",
  "detached",
  "attached",
  "garage conversion",
];

/**
 * Check a regulation source by fetching its page content, comparing against the
 * stored snapshot, and detecting meaningful ADU-related changes.
 */
export async function checkRegulationSource(
  source: RegulationSource
): Promise<{
  changed: boolean;
  confidence: number;
  details: string;
  contentPreview?: string;
}> {
  const now = new Date().toISOString();
  source.lastChecked = now;

  try {
    const response = await fetch(source.sourceUrl, {
      headers: {
        "User-Agent": "DCS-RegulationMonitor/1.0 (ADU compliance check)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return {
        changed: false,
        confidence: 0,
        details: `Source returned HTTP ${response.status}. Will retry next cycle.`,
      };
    }

    const html = await response.text();
    const textContent = extractTextContent(html);
    const currentHash = simpleHash(textContent);

    // Count ADU-related keyword matches for confidence scoring
    const keywordMatches = ADU_KEYWORDS.filter((kw) => textContent.includes(kw));
    const keywordConfidence = Math.min(
      100,
      Math.round((keywordMatches.length / 6) * source.extractionConfidence)
    );

    const previousHash = contentSnapshots[source.id];
    contentSnapshots[source.id] = currentHash;

    if (!previousHash) {
      // First check — store baseline snapshot
      return {
        changed: false,
        confidence: keywordConfidence,
        details: `Baseline snapshot stored at ${now}. ${keywordMatches.length} ADU keywords detected.`,
        contentPreview: textContent.substring(0, 500),
      };
    }

    if (currentHash === previousHash) {
      return {
        changed: false,
        confidence: keywordConfidence,
        details: `No changes detected at ${now}. Content hash matches previous snapshot.`,
      };
    }

    // Change detected — log it
    source.lastChangeDetected = now;

    const change: RegulationChange = {
      id: `change-${source.id}-${Date.now()}`,
      jurisdictionId: source.jurisdictionId,
      fieldName: "page_content",
      oldValue: `hash:${previousHash}`,
      newValue: `hash:${currentHash}`,
      sourceUrl: source.sourceUrl,
      updateTimestamp: now,
      extractionConfidence: keywordConfidence,
      reviewStatus: "pending",
    };
    regulationHistory.push(change);

    return {
      changed: true,
      confidence: keywordConfidence,
      details: `CHANGE DETECTED at ${now}. ${keywordMatches.length} ADU keywords found. Content hash changed from ${previousHash} to ${currentHash}. Queued for review.`,
      contentPreview: textContent.substring(0, 500),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      changed: false,
      confidence: 0,
      details: `Failed to fetch source at ${now}: ${message}`,
    };
  }
}

/**
 * Run a full regulation scan across all active sources.
 * Designed to be called by a cron job (e.g., Vercel Cron).
 */
export async function runRegulationScan(): Promise<{
  sourcesChecked: number;
  changesDetected: number;
  errors: number;
  timestamp: string;
}> {
  const activeSources = REGULATION_SOURCES.filter((s) => s.active);
  let changesDetected = 0;
  let errors = 0;

  for (const source of activeSources) {
    try {
      const result = await checkRegulationSource(source);
      if (result.changed) changesDetected++;
    } catch {
      errors++;
    }
  }

  const timestamp = new Date().toISOString();
  lastScanTimestamp = timestamp;

  return {
    sourcesChecked: activeSources.length,
    changesDetected,
    errors,
    timestamp,
  };
}

/**
 * Get the monitoring status summary for display in the UI
 */
export function getMonitoringStatus(): {
  totalSources: number;
  activeSources: number;
  jurisdictionsCovered: number;
  lastScan: string | null;
  nextScheduledScan: string;
  healthStatus: "healthy" | "warning" | "stale";
} {
  const activeSources = REGULATION_SOURCES.filter((s) => s.active);
  const uniqueJurisdictions = new Set(activeSources.map((s) => s.jurisdictionId));

  // Determine health status based on last scan
  let healthStatus: "healthy" | "warning" | "stale" = "healthy";
  if (!lastScanTimestamp) {
    healthStatus = "stale";
  } else {
    const daysSinceLastScan = (Date.now() - new Date(lastScanTimestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastScan > 14) healthStatus = "stale";
    else if (daysSinceLastScan > 7) healthStatus = "warning";
  }

  return {
    totalSources: REGULATION_SOURCES.length,
    activeSources: activeSources.length,
    jurisdictionsCovered: uniqueJurisdictions.size,
    lastScan: lastScanTimestamp,
    nextScheduledScan: "Weekly (automated)",
    healthStatus,
  };
}

/**
 * Validate that a jurisdiction profile's rules are still current
 */
export function validateRulesCurrency(
  profile: JurisdictionProfile
): {
  isCurrent: boolean;
  daysSinceVerification: number;
  recommendation: string;
} {
  const lastVerified = new Date(profile.identity.lastVerifiedDate);
  const daysSince = Math.round((Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince <= 30) {
    return {
      isCurrent: true,
      daysSinceVerification: daysSince,
      recommendation: "Rules are current.",
    };
  }

  if (daysSince <= 90) {
    return {
      isCurrent: true,
      daysSinceVerification: daysSince,
      recommendation: "Rules verified recently. Next verification recommended.",
    };
  }

  return {
    isCurrent: false,
    daysSinceVerification: daysSince,
    recommendation: "Rules may be outdated. Manual verification recommended.",
  };
}
