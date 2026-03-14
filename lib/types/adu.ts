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
  studio: { label: "Studio", sqft: 400, beds: 0, baths: 1, price: 170800 },
  "1-bed": { label: "1 Bedroom", sqft: 600, beds: 1, baths: 1, price: 256200 },
  "2-bed": { label: "2 Bedroom", sqft: 800, beds: 2, baths: 2, price: 341600 },
  custom: { label: "Custom", sqft: 0, beds: 0, baths: 0, price: 0 },
};

export const ADU_TYPES = {
  detached: { label: "Detached ADU", description: "Standalone structure in your backyard", multiplier: 1 },
  attached: { label: "Attached ADU", description: "Connected to your main home", multiplier: 1.04 },
  "garage-conversion": { label: "Garage Conversion", description: "Convert existing garage", multiplier: 0.7 },
  jadu: { label: "JADU", description: "Junior ADU within existing home (500 sq ft max)", multiplier: 0.65 },
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
  let base = 0;
  
  // Base price from size
  if (config.size && config.size !== "custom") {
    base = ADU_SIZES[config.size].price;
  } else if (config.sqft) {
    base = config.sqft * 427; // $427 per sq ft for custom (detached rate)
  }
  
  // Apply type multiplier
  if (config.aduType) {
    base *= ADU_TYPES[config.aduType].multiplier;
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
