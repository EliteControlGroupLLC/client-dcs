/**
 * SITE-WIDE SHARED DATA SOURCE
 * This file is the single source of truth for:
 * - Company information
 * - Floor plan specs and pricing
 * - Rent assumptions
 * - Service pricing
 * - Gallery project metadata
 * All tools, pages, and components should import from here.
 */

// =============================================================================
// COMPANY INFORMATION
// =============================================================================

export const COMPANY_INFO = {
  name: "Distinct Construction Solutions",
  shortName: "DCS",
  office: "Chula Vista, CA",
  email: "jtalavera@distinctcsolutions.com",
  phone: "+1 (858) - 833 - 0705",
  founded: 2014,
  yearsExperience: new Date().getFullYear() - 2014, // Auto-calculates
  businessHours: {
    weekdays: "Monday - Friday: 8:00 AM - 4:30 PM",
    saturday: "Saturday: By appointment",
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

// =============================================================================
// FLOOR PLANS - SOURCE OF TRUTH FOR ADU PRICING
// =============================================================================

export interface FloorPlan {
  id: string;
  name: string;
  sqFt: number;
  bedrooms: number;
  maxBedrooms: number;
  bathrooms: number;
  maxBathrooms: number;
  style: string;
  type: "Garage Conversion" | "Detached" | "Attached" | "Two-Story";
  priceRange: string;
  priceLow: number;
  priceHigh: number;
  popular: boolean;
  features: string[];
  rentEstimate: { low: number; high: number };
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
    style: "Modern",
    type: "Garage Conversion",
    priceRange: "$120k - $150k",
    priceLow: 120000,
    priceHigh: 150000,
    popular: true,
    features: ["Uses existing structure", "Open floor plan", "Full kitchen"],
    rentEstimate: { low: 2000, high: 2400 },
  },
  {
    id: "compact-detached",
    name: "Compact Detached ADU",
    sqFt: 400,
    bedrooms: 0,
    maxBedrooms: 1,
    bathrooms: 1,
    maxBathrooms: 1,
    style: "Modern",
    type: "Detached",
    priceRange: "Starting at $175k",
    priceLow: 175000,
    priceHigh: 195000,
    popular: true,
    features: ["Standalone structure", "Full kitchen", "Stackable W/D"],
    rentEstimate: { low: 2200, high: 2600 },
  },
  {
    id: "efficient-one",
    name: "The Efficient",
    sqFt: 500,
    bedrooms: 1,
    maxBedrooms: 1,
    bathrooms: 1,
    maxBathrooms: 1,
    style: "Contemporary",
    type: "Attached",
    priceRange: "$220k - $225k",
    priceLow: 220000,
    priceHigh: 225000,
    popular: true,
    features: ["Separate bedroom", "Full kitchen", "In-unit laundry"],
    rentEstimate: { low: 2500, high: 2900 },
  },
  {
    id: "cozy-cottage",
    name: "Cozy Cottage",
    sqFt: 600,
    bedrooms: 1,
    maxBedrooms: 1,
    bathrooms: 1,
    maxBathrooms: 1,
    style: "Craftsman",
    type: "Detached",
    priceRange: "$255k - $260k",
    priceLow: 255000,
    priceHigh: 260000,
    popular: true,
    features: ["Private patio", "Walk-in closet", "Full kitchen"],
    rentEstimate: { low: 3000, high: 3700 },
  },
  {
    id: "urban-loft",
    name: "Urban Loft",
    sqFt: 650,
    bedrooms: 1,
    maxBedrooms: 2,
    bathrooms: 1,
    maxBathrooms: 1,
    style: "Modern",
    type: "Detached",
    priceRange: "$275k - $280k",
    priceLow: 275000,
    priceHigh: 280000,
    popular: false,
    features: ["High ceilings", "Large windows", "Open concept", "Flexible layout"],
    rentEstimate: { low: 3200, high: 3800 },
  },
  {
    id: "family-suite",
    name: "Family Suite",
    sqFt: 750,
    bedrooms: 2,
    maxBedrooms: 2,
    bathrooms: 1,
    maxBathrooms: 1.5,
    style: "Traditional",
    type: "Detached",
    priceRange: "$320k - $325k",
    priceLow: 320000,
    priceHigh: 325000,
    popular: true,
    features: ["2 bedrooms", "Full kitchen", "Private yard space"],
    rentEstimate: { low: 3500, high: 4200 },
  },
  {
    id: "deluxe-two",
    name: "Deluxe Two",
    sqFt: 850,
    bedrooms: 2,
    maxBedrooms: 2,
    bathrooms: 2,
    maxBathrooms: 2,
    style: "Modern",
    type: "Detached",
    priceRange: "$360k - $365k",
    priceLow: 360000,
    priceHigh: 365000,
    popular: false,
    features: ["Primary suite", "Guest bedroom", "2 full baths"],
    rentEstimate: { low: 3800, high: 4500 },
  },
  {
    id: "compact-three",
    name: "Compact Three",
    sqFt: 900,
    bedrooms: 3,
    maxBedrooms: 3,
    bathrooms: 2,
    maxBathrooms: 2,
    style: "Contemporary",
    type: "Detached",
    priceRange: "$390k - $400k",
    priceLow: 390000,
    priceHigh: 400000,
    popular: false,
    features: ["3 bedrooms", "2 full baths", "Efficient layout"],
    rentEstimate: { low: 4000, high: 4800 },
  },
  {
    id: "grand-retreat",
    name: "Grand Retreat",
    sqFt: 1000,
    bedrooms: 2,
    maxBedrooms: 3,
    bathrooms: 2,
    maxBathrooms: 2,
    style: "Contemporary",
    type: "Detached",
    priceRange: "$425k - $430k",
    priceLow: 425000,
    priceHigh: 430000,
    popular: true,
    features: ["Spacious living", "Walk-in closets", "Premium finishes"],
    rentEstimate: { low: 4000, high: 4500 },
  },
  {
    id: "luxury-suite",
    name: "Luxury Suite",
    sqFt: 1200,
    bedrooms: 3,
    maxBedrooms: 3,
    bathrooms: 2,
    maxBathrooms: 2.5,
    style: "Modern",
    type: "Detached",
    priceRange: "$495k - $512k",
    priceLow: 495000,
    priceHigh: 512000,
    popular: false,
    features: ["3 bedrooms", "2 full baths", "Premium upgrades"],
    rentEstimate: { low: 5000, high: 6000 },
  },
  {
    id: "modern-four",
    name: "Modern Four-Bedroom",
    sqFt: 1200,
    bedrooms: 4,
    maxBedrooms: 4,
    bathrooms: 2,
    maxBathrooms: 2,
    style: "Modern",
    type: "Two-Story",
    priceRange: "$500k - $520k",
    priceLow: 500000,
    priceHigh: 520000,
    popular: true,
    features: ["4 bedrooms", "2 full baths", "Two-story design", "Modern finishes"],
    rentEstimate: { low: 5500, high: 6500 },
  },
];

// Sort plans by sqFt for display
export const FLOOR_PLANS_SORTED = [...FLOOR_PLANS].sort((a, b) => a.sqFt - b.sqFt);

// =============================================================================
// RENT ASSUMPTIONS - UNIFIED ACROSS ALL TOOLS
// =============================================================================

export interface RentAssumption {
  sqFt: number;
  type: "garage-conversion" | "detached" | "attached" | "two-story";
  bedrooms: number;
  low: number;
  high: number;
  description: string;
}

export const RENT_ASSUMPTIONS: RentAssumption[] = [
  { sqFt: 400, type: "garage-conversion", bedrooms: 0, low: 2000, high: 2400, description: "2-car garage conversion" },
  { sqFt: 400, type: "garage-conversion", bedrooms: 0, low: 2500, high: 2800, description: "3-car garage conversion" },
  { sqFt: 400, type: "detached", bedrooms: 0, low: 2200, high: 2600, description: "400 sq ft detached ADU" },
  { sqFt: 500, type: "detached", bedrooms: 1, low: 2500, high: 2900, description: "500 sq ft ADU" },
  { sqFt: 600, type: "detached", bedrooms: 1, low: 3000, high: 3500, description: "600 sq ft ADU" },
  { sqFt: 700, type: "detached", bedrooms: 1, low: 3000, high: 3700, description: "700-800 sq ft ADU" },
  { sqFt: 800, type: "detached", bedrooms: 2, low: 3200, high: 3800, description: "800 sq ft ADU" },
  { sqFt: 1000, type: "detached", bedrooms: 2, low: 4000, high: 4500, description: "1,000 sq ft ADU" },
  { sqFt: 1200, type: "detached", bedrooms: 3, low: 5000, high: 6000, description: "1,200 sq ft ADU" },
  { sqFt: 1200, type: "two-story", bedrooms: 4, low: 5500, high: 6500, description: "1,200 sq ft two-story ADU" },
];

// Helper function to get rent estimate based on sqFt and type
export function getRentEstimate(sqFt: number, type: string, bedrooms?: number): { low: number; high: number } {
  // Find closest match
  const normalizedType = type.toLowerCase().includes("garage") ? "garage-conversion" 
    : type.toLowerCase().includes("two") ? "two-story"
    : type.toLowerCase().includes("attached") ? "attached" : "detached";
  
  let match = RENT_ASSUMPTIONS.find(r => 
    r.sqFt === sqFt && r.type === normalizedType && (bedrooms === undefined || r.bedrooms === bedrooms)
  );
  
  // If no exact match, find closest by sqFt
  if (!match) {
    const sorted = [...RENT_ASSUMPTIONS].sort((a, b) => 
      Math.abs(a.sqFt - sqFt) - Math.abs(b.sqFt - sqFt)
    );
    match = sorted[0];
  }
  
  return { low: match.low, high: match.high };
}

// =============================================================================
// SERVICE PRICING
// =============================================================================

export const SERVICE_PRICING = {
  adu: {
    startingPrice: "$120,000",
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
    startingPrice: "$17.50/sq ft",
    retainingWalls: "$200/linear ft",
    description: "Concrete",
  },
  windows: {
    vinyl: "$750/window",
    aluminum: "$1,800/window",
    fiberglass: "$800/window",
    slidingGlass: "$3,000/door",
    startingPrice: "$750/window",
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

// =============================================================================
// GALLERY PROJECTS
// =============================================================================

export interface GalleryProject {
  id: string;
  title: string;
  location: string;
  sqft: string;
  type: string;
  image: string;
  description: string;
}

export const GALLERY_PROJECTS: GalleryProject[] = [
  {
    id: "1",
    title: "1,200 Sq Ft 4-Bed, 2-Bath Two-Story ADU",
    location: "SDSU / College Area, CA",
    sqft: "1,200 sq ft",
    type: "ADU",
    image: "/images/projects/adu-exterior-balcony.webp",
    description: "A spacious two-story ADU featuring 4 bedrooms, 2 full bathrooms, and modern finishes throughout. Designed for maximum rental potential with a thoughtful layout that maximizes the 1,200 sq ft footprint.",
  },
  {
    id: "2",
    title: "Multifamily ADUs",
    location: "SDSU / College Area, CA",
    sqft: "2 structures, 4-bed/2-bath each",
    type: "ADU",
    image: "/images/projects/adu-exterior-yard.webp",
    description: "A dual-structure ADU development featuring two identical 4-bedroom, 2-bathroom units. Built for investment income with modern finishes and energy-efficient design.",
  },
  {
    id: "3",
    title: "1,200 Sq Ft Garage Conversion ADU",
    location: "SDSU / College Area, CA",
    sqft: "1,200 sq ft",
    type: "ADU",
    image: "/images/projects/adu-exterior-side.webp",
    description: "A complete garage-to-ADU conversion maximizing an existing 3-car garage structure. Features an open living area, full kitchen, bedrooms, and modern finishes throughout.",
  },
  {
    id: "4",
    title: "Modern Kitchen Remodel",
    location: "Carlsbad, CA",
    sqft: "Kitchen",
    type: "Remodel",
    image: "/images/projects/kitchen-remodel.webp",
    description: "A full kitchen remodel with custom cabinetry, quartz countertops, modern appliances, and an open layout. Designed for both functionality and style.",
  },
  {
    id: "5",
    title: "Custom Home Build",
    location: "Coronado, CA",
    sqft: "3,200 sq ft",
    type: "Custom Homes",
    image: "/images/projects/custom-home-coronado.jpg",
    description: "A custom-built 3,200 sq ft home featuring modern California architecture, open living spaces, and premium finishes throughout. Designed for comfortable family living with attention to every detail.",
  },
  {
    id: "6",
    title: "Bathroom Renovation",
    location: "Encinitas, CA",
    sqft: "Bathroom",
    type: "Remodel",
    image: "/images/projects/bathroom-renovation-encinitas.webp",
    description: "A complete bathroom renovation with custom tile work, a walk-in shower, modern vanity, and updated fixtures. Clean, contemporary design with premium materials.",
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getFloorPlanById(id: string): FloorPlan | undefined {
  return FLOOR_PLANS.find(p => p.id === id);
}

export function getProjectById(id: string): GalleryProject | undefined {
  return GALLERY_PROJECTS.find(p => p.id === id);
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}k`;
  }
  return `$${price.toLocaleString()}`;
}

export function getYearsExperience(): number {
  return new Date().getFullYear() - COMPANY_INFO.founded;
}
