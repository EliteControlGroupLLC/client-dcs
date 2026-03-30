import { estimateAduPriceRange, getAverageMonthlyRent } from "@/lib/data/site-data";

export interface ADUConfiguration {
  // Step 1: Property Info
  address?: string;
  propertyType: "single-family" | "multi-family" | "vacant-lot";
  lotSize?: number;
  existingStructure: boolean;
  
  // Step 2: ADU Type
  aduType: "detached" | "attached" | "garage-conversion" | "jadu";
  
  // Step 3: Size
  size: "studio" | "1-bed" | "2-bed" | "custom";
  sqft: number;
  
  // Step 4: Layout
  bedrooms: number;
  bathrooms: number;
  layout: "open" | "traditional" | "split";
  
  // Step 5: Style
  style: "modern" | "contemporary" | "craftsman" | "spanish" | "farmhouse";
  exteriorFinish: "stucco" | "siding" | "brick" | "mixed";
  roofStyle: "flat" | "pitched" | "shed";
  
  // Step 6: Features
  features: string[];
  
  // Step 7: Upgrades
  upgrades: string[];
  
  // Step 8: Timeline
  timeline: "asap" | "3-months" | "6-months" | "planning";
  
  // Pricing
  basePrice: number;
  upgradesPrice: number;
  totalPrice: number;
  monthlyPayment?: number;
  
  // Contact
  contact?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredContact: "email" | "phone" | "text";
    notes?: string;
  };
}

export const ADU_SIZES = {
  studio: { label: "Studio", sqft: 400, beds: 0, baths: 1, price: estimateAduPriceRange({ sqFt: 400, type: "detached", bedrooms: 0, bathrooms: 1 }).low },
  "1-bed": { label: "1 Bedroom", sqft: 500, beds: 1, baths: 1, price: estimateAduPriceRange({ sqFt: 500, type: "detached", bedrooms: 1, bathrooms: 1 }).low },
  "2-bed": { label: "2 Bedroom", sqft: 750, beds: 2, baths: 1, price: estimateAduPriceRange({ sqFt: 750, type: "detached", bedrooms: 2, bathrooms: 1 }).low },
  custom: { label: "Custom", sqft: 0, beds: 0, baths: 0, price: 0 },
};

export const ADU_TYPES = {
  detached: { label: "Detached ADU", description: "Standalone backyard home with the widest plan flexibility" },
  attached: { label: "Attached ADU", description: "Integrated addition for tighter lots and efficient tie-ins" },
  "garage-conversion": { label: "Garage Conversion", description: "Convert an existing garage shell into livable space" },
  jadu: { label: "JADU", description: "Junior ADU within an existing home footprint" },
};

export const ADU_STYLES = {
  modern: { label: "Modern", description: "Clean lines, large windows, minimalist" },
  contemporary: { label: "Contemporary", description: "Current trends with timeless appeal" },
  craftsman: { label: "Craftsman", description: "Classic American with warm details" },
  spanish: { label: "Spanish/Mediterranean", description: "Stucco, tile roof, arched details" },
  farmhouse: { label: "Modern Farmhouse", description: "Rustic charm meets modern comfort" },
};

export const ADU_FEATURES = [
  { id: "kitchen-full", label: "Full Kitchen", price: 0, included: true },
  { id: "bathroom-full", label: "Full Bathroom", price: 0, included: true },
  { id: "washer-dryer", label: "Washer/Dryer Hookups", price: 0, included: true },
  { id: "hvac", label: "Central HVAC", price: 0, included: true },
  { id: "outdoor-space", label: "Private Outdoor Space", price: 2500 },
  { id: "parking", label: "Dedicated Parking", price: 5000 },
  { id: "storage", label: "Built-in Storage", price: 3500 },
  { id: "accessibility", label: "ADA Accessibility", price: 8000 },
];

export const ADU_UPGRADES = [
  { id: "solar", label: "Solar Panels", price: 12000, description: "6kW system with battery backup" },
  { id: "smart-home", label: "Smart Home Package", price: 5000, description: "Thermostat, locks, lighting" },
  { id: "premium-appliances", label: "Premium Appliances", price: 8000, description: "Stainless steel, Energy Star" },
  { id: "quartz-counters", label: "Quartz Countertops", price: 4500, description: "Throughout kitchen and bath" },
  { id: "hardwood", label: "Hardwood Flooring", price: 6000, description: "Engineered hardwood throughout" },
  { id: "ev-charger", label: "EV Charger", price: 2500, description: "Level 2 electric vehicle charger" },
  { id: "security", label: "Security System", price: 3000, description: "Cameras, sensors, monitoring" },
  { id: "deck", label: "Private Deck/Patio", price: 15000, description: "300 sq ft covered outdoor space" },
];

export function calculateADUPrice(config: Partial<ADUConfiguration>): { base: number; upgrades: number; total: number } {
  const sqFt = config.sqft || (config.size && config.size !== "custom" ? ADU_SIZES[config.size].sqft : 0);
  const aduType = config.aduType === "jadu" ? "attached" : config.aduType || "detached";
  const bedrooms =
    config.bedrooms ??
    (config.size && config.size !== "custom" ? ADU_SIZES[config.size].beds : sqFt <= 400 ? 0 : sqFt <= 650 ? 1 : sqFt <= 1000 ? 2 : 3);
  const bathrooms =
    config.bathrooms ??
    (config.size && config.size !== "custom" ? ADU_SIZES[config.size].baths : sqFt <= 750 ? 1 : 2);

  const priceRange = sqFt
    ? estimateAduPriceRange({
        sqFt,
        type: aduType,
        bedrooms,
        bathrooms,
      })
    : { low: 0, high: 0 };

  let base = Math.round((priceRange.low + priceRange.high) / 2);

  if (config.aduType === "jadu") {
    base = Math.round(base * 0.8);
  }
  
  // Calculate upgrades
  let upgradesTotal = 0;
  if (config.upgrades) {
    config.upgrades.forEach((upgradeId) => {
      const upgrade = ADU_UPGRADES.find((u) => u.id === upgradeId);
      if (upgrade) upgradesTotal += upgrade.price;
    });
  }
  
  if (config.features) {
    config.features.forEach((featureId) => {
      const feature = ADU_FEATURES.find((f) => f.id === featureId);
      if (feature && !feature.included) upgradesTotal += feature.price;
    });
  }
  
  return {
    base: Math.round(base),
    upgrades: upgradesTotal,
    total: Math.round(base + upgradesTotal),
  };
}

export function calculateADURent(config: Partial<ADUConfiguration>): number {
  const sqFt = config.sqft || (config.size && config.size !== "custom" ? ADU_SIZES[config.size].sqft : 0);
  const bedrooms =
    config.bedrooms ??
    (config.size && config.size !== "custom" ? ADU_SIZES[config.size].beds : sqFt <= 400 ? 0 : sqFt <= 650 ? 1 : sqFt <= 1000 ? 2 : 3);

  if (!sqFt) return 0;

  return getAverageMonthlyRent(
    sqFt,
    config.aduType === "jadu" ? "attached" : config.aduType || "detached",
    bedrooms,
    {
      garageStalls: config.aduType === "garage-conversion" && bedrooms >= 1 ? 3 : 2,
    }
  );
}
