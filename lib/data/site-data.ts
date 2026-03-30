/**
 * Site-wide shared data source.
 * Floor plans are the canonical source of truth for ADU pricing, plan specs, and rent assumptions.
 * All public-facing cards, calculators, gallery views, and scanner outputs should derive from this file.
 */

// =============================================================================
// COMPANY INFORMATION
// =============================================================================

export const COMPANY_INFO = {
  name: "Distinct Construction Solutions",
  shortName: "DCS",
  office: "Chula Vista, CA",
  email: "jtalavera@distinctcsolutions.com",
  phone: "(858) 833-0705",
  phoneHref: "+18588330705",
  founded: 2014,
  businessHours: {
    weekdays: "Monday-Friday: 8:00 AM to 4:30 PM",
    saturday: "Saturday by appointment",
  },
  stats: {
    projectsCompleted: "500+",
    adusBuilt: "250+",
    customHomes: "50+",
    remodels: "200+",
    valueDelivered: "$50M+",
    clientSatisfaction: "98%",
  },
} as const;

export function getYearsExperience(): number {
  return new Date().getFullYear() - COMPANY_INFO.founded;
}

export function getExperienceLabel(): string {
  return `${getYearsExperience()}+ years`;
}

// =============================================================================
// PROCESS CONTENT
// =============================================================================

export const PROCESS_STEPS = [
  {
    number: "01",
    step: 1,
    title: "Design Your Project & Get Pricing",
    description:
      "Use our planning tools to compare layouts, understand pricing, and see which project path makes the most sense for your lot, lifestyle, and budget.",
    timeline: "1 Day",
  },
  {
    number: "02",
    step: 2,
    title: "Funding & Pre-Approval",
    description:
      "Once the scope is clear, we help you pressure-test budget, financing, and monthly carry so the project is financially ready before design advances.",
    timeline: "2-3 Days",
  },
  {
    number: "03",
    step: 3,
    title: "Design, Engineering & Permits",
    description:
      "Our team develops plans, coordinates engineering, and manages the permitting process with the city until the project is approved and ready to build.",
    timeline: "6-9 Months",
  },
  {
    number: "04",
    step: 4,
    title: "Construction",
    description:
      "We build with disciplined scheduling, premium trades, and clear communication so you always know what is happening on site and what comes next.",
    timeline: "3-4 Months",
  },
  {
    number: "05",
    step: 5,
    title: "Final Walkthrough",
    description:
      "We close the project with punch-list completion, final documentation, and a walk-through that ensures the finished space is ready to occupy with confidence.",
    timeline: "About 1 Week",
  },
] as const;

// =============================================================================
// FLOOR PLANS - CANONICAL ADU SOURCE OF TRUTH
// =============================================================================

export interface FloorPlanVariation {
  label: string;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  priceLow: number;
  priceHigh: number;
  description: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  sqFt: number;
  bedrooms: number;
  maxBedrooms: number;
  bathrooms: number;
  maxBathrooms: number;
  stories: number;
  style: string;
  type: "Garage Conversion" | "Detached" | "Attached" | "Two-Story";
  priceRange: string;
  priceLow: number;
  priceHigh: number;
  popular: boolean;
  dimensions: {
    widthFt: number;
    depthFt: number;
    label: string;
  };
  features: string[];
  summary: string;
  description: string;
  exteriorImage: string;
  rentEstimate: { low: number; high: number };
  supportedVariations: FloorPlanVariation[];
}

export const FLOOR_PLANS: FloorPlan[] = [
  {
    id: "garage-conversion",
    name: "Garage Conversion",
    sqFt: 400,
    bedrooms: 0,
    maxBedrooms: 1,
    bathrooms: 1,
    maxBathrooms: 1,
    stories: 1,
    style: "Modern",
    type: "Garage Conversion",
    priceRange: "$120,000-$150,000",
    priceLow: 120000,
    priceHigh: 150000,
    popular: true,
    dimensions: { widthFt: 20, depthFt: 20, label: "20' x 20'" },
    features: ["Existing shell reuse", "Full kitchen", "Dedicated bath", "Laundry niche"],
    summary: "A fast, value-forward conversion strategy for homeowners with an existing garage shell worth preserving.",
    description:
      "Designed for efficient delivery and strong entry-level rental performance, this 400 sq ft garage conversion turns an underused structure into a polished studio ADU with a real kitchen, full bath, laundry zone, and comfortable living footprint.",
    exteriorImage: "/images/floor-plans/garage-conversion-exterior.jpg",
    rentEstimate: { low: 2000, high: 2700 },
    supportedVariations: [
      {
        label: "2-Car Garage Studio",
        bedrooms: 0,
        bathrooms: 1,
        stories: 1,
        priceLow: 120000,
        priceHigh: 140000,
        description: "Best for tight lots and efficient rental income using a standard 2-car shell.",
      },
      {
        label: "3-Car Conversion Suite",
        bedrooms: 1,
        bathrooms: 1,
        stories: 1,
        priceLow: 140000,
        priceHigh: 150000,
        description: "Uses the extra bay depth to create a more private sleeping zone and stronger rent profile.",
      },
    ],
  },
  {
    id: "compact-detached",
    name: "Compact Detached ADU",
    sqFt: 400,
    bedrooms: 0,
    maxBedrooms: 1,
    bathrooms: 1,
    maxBathrooms: 1,
    stories: 1,
    style: "Modern",
    type: "Detached",
    priceRange: "Starting at $175,000",
    priceLow: 175000,
    priceHigh: 195000,
    popular: true,
    dimensions: { widthFt: 20, depthFt: 20, label: "20' x 20'" },
    features: ["Standalone footprint", "Private entry", "Full kitchen", "Stackable laundry"],
    summary: "The smallest detached ADU in the lineup, built for privacy, clean design, and efficient permitting.",
    description:
      "This 400 sq ft detached studio is ideal for compact lots that still deserve a true standalone structure. It prioritizes natural light, a clean kitchen wall, a private bath, and a layout that feels intentional rather than improvised.",
    exteriorImage: "/images/floor-plans/compact-detached-exterior.jpg",
    rentEstimate: { low: 2500, high: 2800 },
    supportedVariations: [
      {
        label: "Open Studio",
        bedrooms: 0,
        bathrooms: 1,
        stories: 1,
        priceLow: 175000,
        priceHigh: 185000,
        description: "Most efficient budget path with a bright studio plan and compact storage.",
      },
      {
        label: "Private Sleeping Niche",
        bedrooms: 1,
        bathrooms: 1,
        stories: 1,
        priceLow: 185000,
        priceHigh: 195000,
        description: "Uses partial separation to create a more private sleep zone without losing openness.",
      },
    ],
  },
  {
    id: "efficient-one",
    name: "The Efficient",
    sqFt: 500,
    bedrooms: 1,
    maxBedrooms: 1,
    bathrooms: 1,
    maxBathrooms: 1,
    stories: 1,
    style: "Contemporary",
    type: "Attached",
    priceRange: "$220,000-$225,000",
    priceLow: 220000,
    priceHigh: 225000,
    popular: true,
    dimensions: { widthFt: 20, depthFt: 25, label: "20' x 25'" },
    features: ["True 1-bedroom layout", "Dining niche", "Laundry closet", "Efficient attachment strategy"],
    summary: "An attached ADU that feels complete, not compromised, with a real bedroom and efficient construction footprint.",
    description:
      "The Efficient is designed for homeowners who want a premium one-bedroom ADU while keeping the new construction tied to the existing home. It balances livability, cost control, and a smooth permitting narrative.",
    exteriorImage: "/images/floor-plans/efficient-one-exterior.jpg",
    rentEstimate: { low: 2500, high: 2800 },
    supportedVariations: [
      {
        label: "Classic One-Bedroom",
        bedrooms: 1,
        bathrooms: 1,
        stories: 1,
        priceLow: 220000,
        priceHigh: 225000,
        description: "Full bedroom privacy with a simple and highly rentable plan.",
      },
    ],
  },
  {
    id: "cozy-cottage",
    name: "Cozy Cottage",
    sqFt: 600,
    bedrooms: 1,
    maxBedrooms: 1,
    bathrooms: 1,
    maxBathrooms: 1,
    stories: 1,
    style: "Craftsman",
    type: "Detached",
    priceRange: "$255,000-$260,000",
    priceLow: 255000,
    priceHigh: 260000,
    popular: true,
    dimensions: { widthFt: 20, depthFt: 30, label: "20' x 30'" },
    features: ["Private patio edge", "Walk-in closet", "Separated bedroom", "Detached privacy"],
    summary: "A detached one-bedroom cottage with the comfort level clients expect from a long-term living space.",
    description:
      "Cozy Cottage stretches the footprint just enough to create a genuine living room, larger kitchen wall, walk-in storage, and a more residential feel for extended family or long-term tenants.",
    exteriorImage: "/images/floor-plans/cozy-cottage-exterior.jpg",
    rentEstimate: { low: 3000, high: 3500 },
    supportedVariations: [
      {
        label: "Standard Cottage",
        bedrooms: 1,
        bathrooms: 1,
        stories: 1,
        priceLow: 255000,
        priceHigh: 260000,
        description: "The most balanced detached 1-bedroom option for comfort, privacy, and value.",
      },
    ],
  },
  {
    id: "urban-loft",
    name: "Urban Loft",
    sqFt: 650,
    bedrooms: 1,
    maxBedrooms: 2,
    bathrooms: 1,
    maxBathrooms: 1,
    stories: 1,
    style: "Modern",
    type: "Detached",
    priceRange: "$275,000-$280,000",
    priceLow: 275000,
    priceHigh: 280000,
    popular: false,
    dimensions: { widthFt: 22, depthFt: 30, label: "22' x 30'" },
    features: ["High-ceiling feel", "Flexible second room", "Large glazing", "Compact two-bedroom potential"],
    summary: "A modern detached plan that can flex between a large 1-bedroom and a compact 2-bedroom arrangement.",
    description:
      "Urban Loft is ideal for clients who want premium style in a smaller detached footprint. The layout supports high natural light, a strong kitchen-living zone, and a flexible room that can function as an office, nursery, or second bedroom.",
    exteriorImage: "/images/floor-plans/urban-loft-exterior.jpg",
    rentEstimate: { low: 3000, high: 3700 },
    supportedVariations: [
      {
        label: "Large 1-Bedroom Loft",
        bedrooms: 1,
        bathrooms: 1,
        stories: 1,
        priceLow: 275000,
        priceHigh: 280000,
        description: "Best for premium finishes, home-office flexibility, and a more open luxury feel.",
      },
      {
        label: "Compact 2-Bedroom",
        bedrooms: 2,
        bathrooms: 1,
        stories: 1,
        priceLow: 287000,
        priceHigh: 297000,
        description: "Creates a second enclosed room for family use or higher occupancy rental demand.",
      },
    ],
  },
  {
    id: "family-suite",
    name: "Family Suite",
    sqFt: 750,
    bedrooms: 2,
    maxBedrooms: 2,
    bathrooms: 1,
    maxBathrooms: 1.5,
    stories: 1,
    style: "Traditional",
    type: "Detached",
    priceRange: "$320,000-$325,000",
    priceLow: 320000,
    priceHigh: 325000,
    popular: true,
    dimensions: { widthFt: 25, depthFt: 30, label: "25' x 30'" },
    features: ["Two true bedrooms", "Open living core", "Private yard edge", "Family-ready footprint"],
    summary: "A dependable 2-bedroom detached plan sized for daily living, not just overnight use.",
    description:
      "Family Suite is a strong fit for multigenerational living, full-time occupancy, or tenants who want a practical two-bedroom layout with generous common space and a detached sense of privacy.",
    exteriorImage: "/images/floor-plans/family-suite-exterior.jpg",
    rentEstimate: { low: 3400, high: 4100 },
    supportedVariations: [
      {
        label: "2 Bed / 1 Bath",
        bedrooms: 2,
        bathrooms: 1,
        stories: 1,
        priceLow: 320000,
        priceHigh: 325000,
        description: "The most cost-efficient way to reach a livable 2-bedroom detached ADU.",
      },
      {
        label: "2 Bed / 1.5 Bath",
        bedrooms: 2,
        bathrooms: 1.5,
        stories: 1,
        priceLow: 332000,
        priceHigh: 340000,
        description: "Adds a powder component for better privacy and stronger family functionality.",
      },
    ],
  },
  {
    id: "deluxe-two",
    name: "Deluxe Two",
    sqFt: 850,
    bedrooms: 2,
    maxBedrooms: 2,
    bathrooms: 2,
    maxBathrooms: 2,
    stories: 1,
    style: "Modern",
    type: "Detached",
    priceRange: "$360,000-$365,000",
    priceLow: 360000,
    priceHigh: 365000,
    popular: false,
    dimensions: { widthFt: 28, depthFt: 30, label: "28' x 30'" },
    features: ["Two full baths", "Primary suite", "Guest privacy", "Premium single-story layout"],
    summary: "A premium 2-bedroom plan for clients who want ensuite-level comfort and stronger resale appeal.",
    description:
      "Deluxe Two delivers the comfort of a primary suite and a guest-ready second bedroom without moving into a larger home-scale footprint. It is a strong fit for higher-end rentals and independent family living.",
    exteriorImage: "/images/floor-plans/deluxe-two-exterior.jpg",
    rentEstimate: { low: 3600, high: 4300 },
    supportedVariations: [
      {
        label: "Dual-Suite Layout",
        bedrooms: 2,
        bathrooms: 2,
        stories: 1,
        priceLow: 360000,
        priceHigh: 365000,
        description: "Best for roommates, family privacy, and premium rent positioning.",
      },
    ],
  },
  {
    id: "compact-three",
    name: "Compact Three",
    sqFt: 900,
    bedrooms: 3,
    maxBedrooms: 3,
    bathrooms: 2,
    maxBathrooms: 2,
    stories: 1,
    style: "Contemporary",
    type: "Detached",
    priceRange: "$390,000-$400,000",
    priceLow: 390000,
    priceHigh: 400000,
    popular: false,
    dimensions: { widthFt: 30, depthFt: 30, label: "30' x 30'" },
    features: ["Three bedrooms", "Two baths", "Efficient circulation", "High-value family layout"],
    summary: "A compact 3-bedroom detached ADU for clients who want bedroom count without overspending on square footage.",
    description:
      "Compact Three pushes efficiency hard: three real bedrooms, two baths, and a strong shared living core in a square footprint that stays practical on many suburban lots.",
    exteriorImage: "/images/floor-plans/compact-three-exterior.jpg",
    rentEstimate: { low: 3900, high: 4700 },
    supportedVariations: [
      {
        label: "3 Bed / 2 Bath",
        bedrooms: 3,
        bathrooms: 2,
        stories: 1,
        priceLow: 390000,
        priceHigh: 400000,
        description: "A high-occupancy detached plan that prioritizes sleeping capacity and efficient value.",
      },
    ],
  },
  {
    id: "grand-retreat",
    name: "Grand Retreat",
    sqFt: 1000,
    bedrooms: 2,
    maxBedrooms: 3,
    bathrooms: 2,
    maxBathrooms: 2,
    stories: 1,
    style: "Contemporary",
    type: "Detached",
    priceRange: "$425,000-$430,000",
    priceLow: 425000,
    priceHigh: 430000,
    popular: true,
    dimensions: { widthFt: 32, depthFt: 32, label: "32' x 32'" },
    features: ["Great room scale", "Primary suite", "Flex third bedroom option", "Premium detached feel"],
    summary: "A larger detached ADU designed to feel like a true standalone home with premium livability.",
    description:
      "Grand Retreat offers the room count and openness many clients want without committing to a 1,200 sq ft build. It supports strong rent potential, better long-term livability, and up to 3 bedrooms when the lot can justify it.",
    exteriorImage: "/images/floor-plans/grand-retreat-exterior.jpg",
    rentEstimate: { low: 4000, high: 4500 },
    supportedVariations: [
      {
        label: "2 Bed / 2 Bath",
        bedrooms: 2,
        bathrooms: 2,
        stories: 1,
        priceLow: 425000,
        priceHigh: 430000,
        description: "A spacious two-bedroom layout with larger common areas and strong owner-occupant comfort.",
      },
      {
        label: "3 Bed / 2 Bath",
        bedrooms: 3,
        bathrooms: 2,
        stories: 1,
        priceLow: 440000,
        priceHigh: 452000,
        description: "Reallocates square footage into an additional room for stronger family or rental flexibility.",
      },
    ],
  },
  {
    id: "luxury-suite",
    name: "Luxury Suite",
    sqFt: 1200,
    bedrooms: 3,
    maxBedrooms: 3,
    bathrooms: 2,
    maxBathrooms: 2.5,
    stories: 1,
    style: "Modern",
    type: "Detached",
    priceRange: "$495,000-$512,000",
    priceLow: 495000,
    priceHigh: 512000,
    popular: false,
    dimensions: { widthFt: 30, depthFt: 40, label: "30' x 40'" },
    features: ["Three full bedrooms", "2 to 2.5 baths", "Premium kitchen footprint", "High-end detached living"],
    summary: "A single-story 1,200 sq ft detached ADU for clients who want near-home-scale comfort and premium finishes.",
    description:
      "Luxury Suite is built for properties that can support a larger detached ADU and clients who want it to feel like a real home, not an accessory structure. It is ideal for extended family, premium rentals, and high-value backyard development.",
    exteriorImage: "/images/floor-plans/luxury-suite-exterior.jpg",
    rentEstimate: { low: 5000, high: 6000 },
    supportedVariations: [
      {
        label: "3 Bed / 2 Bath",
        bedrooms: 3,
        bathrooms: 2,
        stories: 1,
        priceLow: 495000,
        priceHigh: 512000,
        description: "The cleanest premium family layout with generous common space and strong rental upside.",
      },
      {
        label: "3 Bed / 2.5 Bath",
        bedrooms: 3,
        bathrooms: 2.5,
        stories: 1,
        priceLow: 507000,
        priceHigh: 520000,
        description: "Adds a guest powder component for improved entertaining and primary-suite privacy.",
      },
    ],
  },
  {
    id: "modern-four",
    name: "Modern Four",
    sqFt: 1200,
    bedrooms: 4,
    maxBedrooms: 4,
    bathrooms: 2,
    maxBathrooms: 2,
    stories: 2,
    style: "Modern",
    type: "Two-Story",
    priceRange: "$500,000-$520,000",
    priceLow: 500000,
    priceHigh: 520000,
    popular: true,
    dimensions: { widthFt: 25, depthFt: 24, label: "25' x 24' footprint, 2 stories" },
    features: ["4 bedrooms", "2 baths", "Two-story efficiency", "High-yield rental strategy"],
    summary: "A 4-bedroom modern two-story ADU built to maximize bedroom count and property value on the right lot.",
    description:
      "Modern Four is the highest-value product in the library for lots that can support a premium two-story build. It keeps the footprint compact while delivering four legitimate bedrooms, two baths, and strong rent performance.",
    exteriorImage: "/images/floor-plans/modern-four-exterior.jpg",
    rentEstimate: { low: 5000, high: 6000 },
    supportedVariations: [
      {
        label: "4 Bed / 2 Bath",
        bedrooms: 4,
        bathrooms: 2,
        stories: 2,
        priceLow: 500000,
        priceHigh: 520000,
        description: "Best for larger households, student-style housing, or maximum bedroom count on a premium lot.",
      },
    ],
  },
];

export const FLOOR_PLAN_DISPLAY_ORDER = [
  "garage-conversion",
  "compact-detached",
  "efficient-one",
  "cozy-cottage",
  "urban-loft",
  "family-suite",
  "deluxe-two",
  "compact-three",
  "grand-retreat",
  "luxury-suite",
  "modern-four",
] as const;

export const FLOOR_PLANS_SORTED = FLOOR_PLAN_DISPLAY_ORDER.map((id) =>
  FLOOR_PLANS.find((plan) => plan.id === id)
).filter((plan): plan is FloorPlan => Boolean(plan));

// =============================================================================
// RENT ASSUMPTIONS - UNIFIED ACROSS TOOLS
// =============================================================================

export type AduEstimateType = "garage-conversion" | "detached" | "attached" | "two-story";

export interface RentAssumption {
  sqFt: number;
  type: AduEstimateType;
  bedrooms: number;
  garageStalls?: 2 | 3;
  low: number;
  high: number;
  description: string;
}

export const RENT_ASSUMPTIONS: RentAssumption[] = [
  { sqFt: 400, type: "garage-conversion", bedrooms: 0, garageStalls: 2, low: 2000, high: 2700, description: "2-car garage conversion" },
  { sqFt: 400, type: "garage-conversion", bedrooms: 1, garageStalls: 3, low: 2300, high: 3000, description: "3-car garage conversion" },
  { sqFt: 400, type: "detached", bedrooms: 0, low: 2500, high: 2800, description: "400 sq ft detached ADU" },
  { sqFt: 500, type: "attached", bedrooms: 1, low: 2500, high: 2800, description: "500 sq ft attached ADU" },
  { sqFt: 500, type: "detached", bedrooms: 1, low: 2500, high: 2800, description: "500 sq ft detached ADU" },
  { sqFt: 600, type: "detached", bedrooms: 1, low: 3000, high: 3500, description: "600 sq ft detached ADU" },
  { sqFt: 650, type: "detached", bedrooms: 1, low: 3000, high: 3700, description: "650 sq ft detached ADU" },
  { sqFt: 700, type: "detached", bedrooms: 1, low: 3000, high: 3700, description: "700 sq ft detached ADU" },
  { sqFt: 800, type: "detached", bedrooms: 2, low: 3300, high: 3900, description: "800 sq ft detached ADU" },
  { sqFt: 850, type: "detached", bedrooms: 2, low: 3600, high: 4300, description: "850 sq ft detached ADU" },
  { sqFt: 900, type: "detached", bedrooms: 3, low: 3900, high: 4700, description: "900 sq ft detached ADU" },
  { sqFt: 1000, type: "detached", bedrooms: 2, low: 4000, high: 4500, description: "1,000 sq ft detached ADU" },
  { sqFt: 1200, type: "detached", bedrooms: 3, low: 5000, high: 6000, description: "1,200 sq ft detached ADU" },
  { sqFt: 1200, type: "two-story", bedrooms: 4, low: 5000, high: 6000, description: "1,200 sq ft two-story ADU" },
];

// =============================================================================
// SERVICE PRICING
// =============================================================================

export const SERVICE_PRICING = {
  adu: {
    startingPrice: "$120,000",
    detachedStartingPrice: "$175,000",
    description: "ADU Solutions",
    badge: "Most Popular",
  },
  customHomes: {
    startingPrice: "Custom Pricing",
    description: "Custom Homes",
  },
  remodeling: {
    startingPrice: "$18,000",
    description: "Remodeling",
  },
  roofing: {
    startingPrice: "$12,500",
    description: "Roofing",
  },
  concrete: {
    startingPrice: "$17.50 per sq ft",
    retainingWalls: "$200 per linear foot",
    description: "Concrete",
  },
  windows: {
    vinyl: "$750 per window",
    aluminum: "$1,800 per window",
    fiberglass: "$800 per window",
    slidingGlass: "$3,000 per door",
    startingPrice: "$750 per window",
    description: "Windows",
  },
  exterior: {
    painting: "$12,500",
    sidingStucco: "$15,000",
    decksAndPergolas: "$12,000",
    landscapeHardscaping: "$25,000",
    outdoorLiving: "$75,000",
    startingPrice: "$12,000",
    description: "Exterior Improvements",
  },
  generalConstruction: {
    startingPrice: "$800",
    description: "General Construction",
  },
  kitchen: {
    startingPrice: "$18,000",
    description: "Kitchen Remodeling",
  },
  bathroom: {
    startingPrice: "$12,000",
    heatedFloor: "$10,000",
    framelessGlassShowerDoor: "$2,500",
    description: "Bathroom Renovation",
  },
} as const;

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  href: string;
  badge?: string;
  category: "primary" | "secondary";
}

export const SERVICE_CARDS: ServiceCard[] = [
  {
    id: "adu-solutions",
    title: "ADU Solutions",
    description:
      "Detached ADUs, garage conversions, and family-ready backyard homes designed around your lot, permit path, and long-term value goals.",
    priceLabel: `Starting at ${SERVICE_PRICING.adu.startingPrice}`,
    href: "/services/adu-solutions",
    badge: SERVICE_PRICING.adu.badge,
    category: "primary",
  },
  {
    id: "custom-homes",
    title: "Custom Homes",
    description:
      "Ground-up homes with disciplined planning, premium detailing, and one design-build team managing the project from concept through completion.",
    priceLabel: SERVICE_PRICING.customHomes.startingPrice,
    href: "/services/new-construction",
    category: "primary",
  },
  {
    id: "remodeling",
    title: "Remodeling",
    description:
      "Kitchen, bath, and home-wide renovations that upgrade function, raise finish quality, and make the whole property feel more intentional.",
    priceLabel: `Starting at ${SERVICE_PRICING.remodeling.startingPrice}`,
    href: "/services/remodeling",
    category: "primary",
  },
  {
    id: "roofing",
    title: "Roofing",
    description: "Roof replacements and premium roofing systems designed for long-term weather protection and curb appeal.",
    priceLabel: `Starting at ${SERVICE_PRICING.roofing.startingPrice}`,
    href: "/services/roofing",
    category: "secondary",
  },
  {
    id: "concrete",
    title: "Concrete",
    description: "Driveways, patios, retaining walls, and slab work built with clean execution and site-specific planning.",
    priceLabel: `Starting at ${SERVICE_PRICING.concrete.startingPrice}`,
    href: "/services/concrete",
    category: "secondary",
  },
  {
    id: "windows",
    title: "Windows",
    description: "Installed vinyl, aluminum, fiberglass, and sliding door systems selected for comfort, performance, and architecture.",
    priceLabel: `Starting at ${SERVICE_PRICING.windows.startingPrice}`,
    href: "/services/windows",
    category: "secondary",
  },
  {
    id: "exterior",
    title: "Exterior Improvements",
    description: "Exterior painting, siding, decks, pergolas, hardscaping, and outdoor living environments with premium curb impact.",
    priceLabel: `Starting at ${SERVICE_PRICING.exterior.startingPrice}`,
    href: "/services/exterior",
    category: "secondary",
  },
  {
    id: "general-construction",
    title: "General Construction",
    description: "Room additions, structural work, permit coordination, and maintenance projects executed with licensed oversight.",
    priceLabel: `Starting at ${SERVICE_PRICING.generalConstruction.startingPrice}`,
    href: "/services/general-construction",
    category: "secondary",
  },
  {
    id: "kitchen",
    title: "Kitchen Remodeling",
    description: "Cabinetry, surfaces, layout upgrades, and finish packages tailored to how the home should actually perform.",
    priceLabel: `Starting at ${SERVICE_PRICING.kitchen.startingPrice}`,
    href: "/services/kitchen",
    category: "secondary",
  },
  {
    id: "bathroom",
    title: "Bathroom Renovation",
    description: "Bath transformations with better space planning, better materials, and a cleaner day-to-day user experience.",
    priceLabel: `Starting at ${SERVICE_PRICING.bathroom.startingPrice}`,
    href: "/services/bathroom",
    category: "secondary",
  },
];

export const PRIMARY_SERVICE_CARDS = SERVICE_CARDS.filter((service) => service.category === "primary");
export const SECONDARY_SERVICE_CARDS = SERVICE_CARDS.filter((service) => service.category === "secondary");

// =============================================================================
// GALLERY PROJECTS
// =============================================================================

export interface GalleryProject {
  id: string;
  category: "adu" | "remodel" | "kitchen" | "bathroom" | "custom-home";
  title: string;
  location: string;
  sqft: string;
  type: string;
  image: string;
  imageStatus: "ready" | "pending-replacement";
  imageNote?: string;
  description: string;
}

export const GALLERY_PROJECTS: GalleryProject[] = [
  {
    id: "1",
    category: "adu",
    title: "1,200 Sq Ft 4-Bed, 2-Bath Two-Story ADU",
    location: "SDSU / College Area, CA",
    sqft: "1,200 sq ft",
    type: "ADU",
    image: "/images/projects/adu-exterior-balcony.webp",
    imageStatus: "ready",
    description:
      "A 1,200 sq ft two-story ADU configured with four bedrooms and two baths to maximize bedroom count, long-term livability, and premium rental performance near SDSU.",
  },
  {
    id: "2",
    category: "adu",
    title: "Multifamily ADUs",
    location: "SDSU / College Area, CA",
    sqft: "2 structures, 4-bed/2-bath each",
    type: "ADU",
    image: "/images/projects/adu-exterior-yard.webp",
    imageStatus: "ready",
    description:
      "A two-structure ADU development built for investment performance, with each building configured as a 4-bedroom, 2-bath residence designed around the same premium material palette.",
  },
  {
    id: "3",
    category: "adu",
    title: "1,200 Sq Ft Garage Conversion ADU",
    location: "SDSU / College Area, CA",
    sqft: "1,200 sq ft",
    type: "ADU",
    image: "/images/projects/adu-exterior-side.webp",
    imageStatus: "ready",
    description:
      "A large-scale garage conversion ADU that transformed existing structure into a polished residential product with updated circulation, premium finishes, and a full family-ready program.",
  },
  {
    id: "4",
    category: "kitchen",
    title: "Modern Kitchen Remodel",
    location: "Carlsbad, CA",
    sqft: "Kitchen remodel",
    type: "Remodel",
    image: "/images/projects/kitchen-remodel.webp",
    imageStatus: "ready",
    description:
      "A Carlsbad kitchen reworked around cleaner circulation, premium cabinetry, better prep space, and a brighter material palette tailored to modern family living.",
  },
  {
    id: "5",
    category: "custom-home",
    title: "Custom Home Build",
    location: "Coronado, CA",
    sqft: "3,200 sq ft",
    type: "Custom Home",
    image: "/images/projects/pending-gallery-image.svg",
    imageStatus: "pending-replacement",
    imageNote: "Approved replacement custom home image still required before this project can be considered visually complete.",
    description:
      "A 3,200 sq ft custom home in Coronado planned around clean California architecture, strong indoor-outdoor living, and a premium finish package. Approved replacement imagery is still needed for this gallery item.",
  },
  {
    id: "6",
    category: "bathroom",
    title: "Bathroom Renovation",
    location: "Del Mar, CA",
    sqft: "Bathroom renovation",
    type: "Remodel",
    image: "/images/projects/pending-gallery-image.svg",
    imageStatus: "pending-replacement",
    imageNote: "Approved replacement bathroom image still required before this project can be considered visually complete.",
    description:
      "A bathroom renovation centered on cleaner detailing, upgraded surfaces, and a stronger spa feel. Approved replacement imagery is still needed for this gallery slot.",
  },
];

// =============================================================================
// GENERIC HELPERS
// =============================================================================

function roundToNearest(value: number, increment = 500): number {
  return Math.round(value / increment) * increment;
}

function lerp(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio;
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  }
  return `$${price.toLocaleString()}`;
}

export function formatPriceFull(price: number): string {
  return `$${price.toLocaleString()}`;
}

export function formatPriceRange(low: number, high: number): string {
  return `${formatPriceFull(low)}-${formatPriceFull(high)}`;
}

export function formatSqFt(value: number): string {
  return `${value.toLocaleString()} sq ft`;
}

export function getFloorPlanById(id: string): FloorPlan | undefined {
  return FLOOR_PLANS.find((plan) => plan.id === id);
}

export function getProjectById(id: string): GalleryProject | undefined {
  return GALLERY_PROJECTS.find((project) => project.id === id);
}

export function normalizeAduType(type: string, stories = 1): AduEstimateType {
  const normalized = type.toLowerCase();

  if (normalized.includes("garage")) return "garage-conversion";
  if (stories >= 2 || normalized.includes("two")) return "two-story";
  if (normalized.includes("attach")) return "attached";
  return "detached";
}

function getPlansForType(type: AduEstimateType): FloorPlan[] {
  if (type === "garage-conversion") {
    return FLOOR_PLANS_SORTED.filter((plan) => plan.type === "Garage Conversion");
  }

  if (type === "attached") {
    return FLOOR_PLANS_SORTED.filter((plan) => plan.type === "Attached");
  }

  if (type === "two-story") {
    return FLOOR_PLANS_SORTED.filter((plan) => plan.type === "Two-Story");
  }

  return FLOOR_PLANS_SORTED.filter((plan) => plan.type === "Detached");
}

function interpolateFamilyPrice(type: AduEstimateType, sqFt: number): { low: number; high: number; matchedPlan?: FloorPlan } {
  const plans = getPlansForType(type);

  if (plans.length === 0) {
    return { low: 0, high: 0 };
  }

  if (plans.length === 1) {
    if (type === "attached") {
      const detachedFallback = interpolateFamilyPrice("detached", sqFt);
      if (detachedFallback.low > 0 && detachedFallback.high > 0) {
        return {
          low: roundToNearest(detachedFallback.low * 0.9),
          high: roundToNearest(detachedFallback.high * 0.9),
          matchedPlan: plans[0],
        };
      }
    }

    return {
      low: plans[0].priceLow,
      high: plans[0].priceHigh,
      matchedPlan: plans[0],
    };
  }

  const exact = plans.find((plan) => plan.sqFt === sqFt);
  if (exact) {
    return {
      low: exact.priceLow,
      high: exact.priceHigh,
      matchedPlan: exact,
    };
  }

  const lower = [...plans].reverse().find((plan) => plan.sqFt < sqFt) || plans[0];
  const upper = plans.find((plan) => plan.sqFt > sqFt) || plans[plans.length - 1];

  if (lower.id === upper.id) {
    return {
      low: lower.priceLow,
      high: lower.priceHigh,
      matchedPlan: lower,
    };
  }

  const ratio = (sqFt - lower.sqFt) / (upper.sqFt - lower.sqFt);

  return {
    low: roundToNearest(lerp(lower.priceLow, upper.priceLow, ratio)),
    high: roundToNearest(lerp(lower.priceHigh, upper.priceHigh, ratio)),
    matchedPlan: Math.abs(lower.sqFt - sqFt) <= Math.abs(upper.sqFt - sqFt) ? lower : upper,
  };
}

export interface AduEstimateInput {
  sqFt: number;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  garageStalls?: 2 | 3;
}

export function getRecommendedFloorPlan(input: AduEstimateInput): FloorPlan | undefined {
  const normalizedType = normalizeAduType(input.type, input.stories ?? 1);

  if (normalizedType === "garage-conversion") {
    return getFloorPlanById("garage-conversion");
  }

  const plans = getPlansForType(normalizedType);
  const requestedBedrooms = input.bedrooms ?? 0;
  const requestedBathrooms = input.bathrooms ?? 1;

  return [...plans].sort((a, b) => {
    const sizeDelta = Math.abs(a.sqFt - input.sqFt) - Math.abs(b.sqFt - input.sqFt);
    if (sizeDelta !== 0) return sizeDelta;

    const bedroomPenaltyA = requestedBedrooms > a.maxBedrooms ? 10 : Math.abs((a.bedrooms || 0) - requestedBedrooms);
    const bedroomPenaltyB = requestedBedrooms > b.maxBedrooms ? 10 : Math.abs((b.bedrooms || 0) - requestedBedrooms);
    if (bedroomPenaltyA !== bedroomPenaltyB) return bedroomPenaltyA - bedroomPenaltyB;

    const bathPenaltyA = requestedBathrooms > a.maxBathrooms ? 10 : Math.abs(a.bathrooms - requestedBathrooms);
    const bathPenaltyB = requestedBathrooms > b.maxBathrooms ? 10 : Math.abs(b.bathrooms - requestedBathrooms);
    if (bathPenaltyA !== bathPenaltyB) return bathPenaltyA - bathPenaltyB;

    return b.priceHigh - a.priceHigh;
  })[0];
}

export function estimateAduPriceRange(input: AduEstimateInput): { low: number; high: number; matchedPlan?: FloorPlan } {
  const normalizedType = normalizeAduType(input.type, input.stories ?? 1);

  if (normalizedType === "garage-conversion") {
    const garagePlan = getFloorPlanById("garage-conversion");
    const garageStalls = input.garageStalls ?? 2;

    if (!garagePlan) {
      return { low: 120000, high: 150000 };
    }

    if (garageStalls === 3) {
      return {
        low: roundToNearest(garagePlan.priceHigh - 10000),
        high: garagePlan.priceHigh,
        matchedPlan: garagePlan,
      };
    }

    return {
      low: garagePlan.priceLow,
      high: roundToNearest(garagePlan.priceHigh - 10000),
      matchedPlan: garagePlan,
    };
  }

  const interpolated = interpolateFamilyPrice(normalizedType, input.sqFt);
  const matchedPlan = getRecommendedFloorPlan(input) || interpolated.matchedPlan;

  if (!matchedPlan) {
    return interpolated;
  }

  const extraBedrooms = Math.max(0, (input.bedrooms ?? matchedPlan.bedrooms) - matchedPlan.bedrooms);
  const extraBathrooms = Math.max(0, Math.ceil((input.bathrooms ?? matchedPlan.bathrooms) - matchedPlan.bathrooms));
  const extraStories = Math.max(0, (input.stories ?? matchedPlan.stories) - matchedPlan.stories);

  const lowAdjustment =
    extraBedrooms * 12000 +
    extraBathrooms * 8000 +
    extraStories * 30000;
  const highAdjustment =
    extraBedrooms * 15000 +
    extraBathrooms * 10000 +
    extraStories * 35000;

  return {
    low: roundToNearest(interpolated.low + lowAdjustment),
    high: roundToNearest(interpolated.high + highAdjustment),
    matchedPlan,
  };
}

export function getRentEstimate(
  sqFt: number,
  type: string,
  bedrooms?: number,
  options?: { stories?: number; garageStalls?: 2 | 3 }
): { low: number; high: number } {
  const normalizedType = normalizeAduType(type, options?.stories ?? 1);
  const requestedBedrooms = bedrooms ?? 0;

  const exact = RENT_ASSUMPTIONS.find((assumption) => {
    if (assumption.type !== normalizedType) return false;
    if (assumption.sqFt !== sqFt) return false;
    if (normalizedType === "garage-conversion") {
      return assumption.garageStalls === (options?.garageStalls ?? 2);
    }
    return assumption.bedrooms === requestedBedrooms || assumption.bedrooms === 0;
  });

  if (exact) {
    return { low: exact.low, high: exact.high };
  }

  const sameType = RENT_ASSUMPTIONS.filter((assumption) => assumption.type === normalizedType);
  const sorted = sameType.length > 0 ? sameType : RENT_ASSUMPTIONS;
  const closest = [...sorted].sort((a, b) => {
    const sizeDelta = Math.abs(a.sqFt - sqFt) - Math.abs(b.sqFt - sqFt);
    if (sizeDelta !== 0) return sizeDelta;
    return Math.abs(a.bedrooms - requestedBedrooms) - Math.abs(b.bedrooms - requestedBedrooms);
  })[0];

  if (!closest) {
    return { low: 2500, high: 3200 };
  }

  return {
    low: closest.low,
    high: closest.high,
  };
}

export function getAverageMonthlyRent(
  sqFt: number,
  type: string,
  bedrooms?: number,
  options?: { stories?: number; garageStalls?: 2 | 3 }
): number {
  const rent = getRentEstimate(sqFt, type, bedrooms, options);
  return Math.round((rent.low + rent.high) / 2 / 50) * 50;
}
