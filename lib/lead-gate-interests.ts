// What a lead gate is protecting — each gated tool / the showroom registers a
// BuildCore lead tagged with its interest. Client-safe (types + constants only).

import type { BuildCoreServiceLine } from "@/lib/buildcore-intake";

export interface LeadGateInterest {
  /** Stable id, used for per-interest lead dedupe. [a-z0-9-] */
  key: string;
  /** Human label shown in BuildCore notes ("Website tool: <label>") */
  label: string;
  serviceLine: BuildCoreServiceLine;
}

export const LEAD_GATE_INTERESTS = {
  concreteCalculator: { key: "concrete-calculator", label: "Concrete Calculator", serviceLine: "concrete" },
  roofCalculator: { key: "roof-calculator", label: "Roof Price Calculator", serviceLine: "roofing" },
  kitchenCalculator: { key: "kitchen-calculator", label: "Kitchen Remodel Calculator", serviceLine: "remodel" },
  bathroomCalculator: { key: "bathroom-calculator", label: "Bathroom Remodel Calculator", serviceLine: "remodel" },
  aduCalculator: { key: "adu-calculator", label: "ADU Cost Calculator", serviceLine: "adu" },
  instantAduEstimator: { key: "instant-adu-estimator", label: "Instant ADU Estimator", serviceLine: "adu" },
  aduIncomeCalculator: { key: "adu-income-calculator", label: "ADU Rental Income Calculator", serviceLine: "adu" },
  aduRoiSimulator: { key: "adu-roi-simulator", label: "ADU ROI Simulator", serviceLine: "adu" },
  compareAduSizes: { key: "compare-adu-sizes", label: "Compare ADU Sizes", serviceLine: "adu" },
  aduDesignInspiration: { key: "adu-design-inspiration", label: "ADU Design Inspiration", serviceLine: "adu" },
  showroom: { key: "showroom", label: "Showroom", serviceLine: "general-construction" },
} as const satisfies Record<string, LeadGateInterest>;

export const SHOWROOM_OFFER = "Unlock up to 30% off";
