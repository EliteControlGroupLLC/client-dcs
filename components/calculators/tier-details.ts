// What's actually included at each price level on the calculators — the
// "why it costs more" content. Written from the owner's install standards
// (e.g. Hardie Backer + RedGard vs. DensShield + Hydro Ban for showers; GAF
// certified, 50-year warranty on every GAF roof). Edit specs here; the
// calculators and comparison tables read from this file only.
//
// Order of `options` must match the option order in each calculator.

import type { TierLadder } from "@/components/calculators/tier-explainer";

export const BATHROOM_TIERS: TierLadder = {
  areas: ["Behind the walls", "Waterproofing", "Shower build", "Tile & grout", "Vanity & fixtures"],
  options: [
    {
      label: "Standard",
      specs: [
        "Hardie Backer cement board on the wet walls",
        "RedGard liquid waterproofing membrane on the wet areas",
        "Fiberglass tub/shower unit or pre-formed pan",
        "Ceramic tile, standard cement grout",
        "Stock vanity, standard chrome fixtures, new toilet",
      ],
      why: "A clean, code-compliant remodel with proven materials — the most budget-friendly way to do it right.",
    },
    {
      label: "Mid-Range",
      specs: [
        "Hardie Backer cement board, seams taped and embedded",
        "RedGard over the entire shower, floor to ceiling, corners reinforced",
        "Hand-built tile shower, pan sloped to the drain",
        "Porcelain tile — denser and more water-resistant than ceramic",
        "Semi-custom vanity, upgraded fixtures, recessed niche",
      ],
      why: "A fully tiled, hand-built shower replaces the fiberglass unit — more layers, more material and more skilled labor hours.",
    },
    {
      label: "Premium",
      specs: [
        "Georgia-Pacific DensShield tile backer with a built-in moisture barrier",
        "LATICRETE Hydro Ban over the entire shower, plus Hydro Ban Adhesive & Sealant on every seam, corner and penetration",
        "Custom tile shower, pan sloped to the drain, recessed niche",
        "Large-format porcelain or natural stone, stain-resistant grout",
        "Designer vanity, stone top, premium fixtures",
      ],
      why: "The upgrade starts behind the wall. DensShield and Hydro Ban cost more than cement board and RedGard, and sealing every seam and penetration takes time — it's the layer you'll never see and the one that keeps water out of your walls for decades.",
    },
    {
      label: "Luxury / Spa",
      specs: [
        "DensShield + Hydro Ban system, same as Premium",
        "Hydro Ban across the shower and the bathroom floor",
        "Curbless or linear-drain shower, rain head + handheld",
        "Custom layouts, natural stone, hand-mitered edges",
        "Frameless glass, freestanding tub, heated floors",
      ],
      why: "Spa features are labor-intensive: curbless floors are recessed and re-sloped, stone edges are mitered by hand, and the glass, tub and heated floors are custom-fitted.",
    },
  ],
};

export const KITCHEN_TIERS: TierLadder = {
  areas: ["Cabinet boxes", "Doors & drawers", "Countertops", "Backsplash", "Appliances & lighting"],
  options: [
    {
      label: "Standard",
      specs: [
        "Stock cabinets, particleboard boxes",
        "Standard hinges and drawer slides",
        "Laminate countertops",
        "Ceramic tile backsplash",
        "Standard appliance package, standard light fixtures",
      ],
      why: "Proven, budget-friendly materials in your existing layout — a fresh, functional kitchen for the lowest cost.",
    },
    {
      label: "Mid-Range",
      specs: [
        "Semi-custom cabinets, plywood boxes that hold screws and resist moisture better",
        "Soft-close doors, full-extension soft-close drawers",
        "Quartz countertops — non-porous, no sealing needed",
        "Subway tile backsplash",
        "Mid-range appliances, LED recessed lighting",
      ],
      why: "Plywood boxes, soft-close hardware and quartz cost more to buy and install — and they're the parts you touch and load every day.",
    },
    {
      label: "Premium",
      specs: [
        "Custom cabinets built to your room, all-plywood construction",
        "Solid-wood doors, dovetail drawer boxes, undermount soft-close slides",
        "Premium quartz or natural stone, upgraded edge profile",
        "Designer tile, set with precise layouts",
        "High-end appliances, under-cabinet LED lighting",
      ],
      why: "Custom cabinetry is built for your exact space instead of pulled from a catalog, and premium stone is templated, fabricated and installed as full slabs.",
    },
    {
      label: "Luxury",
      specs: [
        "Fully custom cabinetry, integrated appliance panels",
        "Custom interiors and organizers, premium hardware",
        "Exotic stone such as quartzite or marble, waterfall or mitered edges",
        "Full-height slab or custom backsplash",
        "Pro-grade appliances, layered lighting on dimmers",
      ],
      why: "Every piece is one-of-a-kind: exotic slabs are hand-selected and book-matched, mitered edges are cut by hand and pro-grade appliances need dedicated installation.",
    },
  ],
};

// Roof types are materials rather than a strict ladder, so each is explained
// on the same four points. Order matches `roofTypes` in the roof calculator.
export const ROOF_OPTIONS: TierLadder = {
  areas: ["Material & lifespan", "What's under it", "Warranty", "Best for"],
  options: [
    {
      label: "GAF Shingle — Value Line",
      specs: [
        "GAF Timberline architectural shingles — a Lifetime-rated line",
        "Full GAF system: leak barrier, roof deck protection, starter strips, ridge caps and ventilation",
        "50-year GAF System Plus warranty — every GAF shingle roof we install",
        "Homeowners who want a dependable roof at the best price",
      ],
      why: "Budget-friendly GAF architectural shingles, installed to the same certified standard and backed by the same 50-year warranty.",
    },
    {
      label: "GAF Shingle — Premium Line",
      specs: [
        "GAF's thicker, higher-grade Timberline shingles (e.g. UHDZ)",
        "Same full GAF system as the Value Line",
        "50-year GAF System Plus warranty — every GAF shingle roof we install",
        "A richer, dimensional look and top-tier wind and weather performance",
      ],
      why: "Higher-grade GAF shingles cost more per square — you're paying for thickness, curb appeal and performance. The warranty doesn't change: it's 50 years either way.",
    },
    {
      label: "Concrete Tile",
      specs: [
        "Concrete tile — the tile itself can last 50+ years",
        "New underlayment and flashing — the layer that fails first (often at 20–30 years), not the tile",
        "Manufacturer tile warranty — terms in your proposal",
        "Spanish and Mediterranean homes, fire resistance",
      ],
      why: "Tile is heavy and hand-set piece by piece. The tile outlasts what's under it, so we replace the underlayment and flashing — never just re-lay old tile over tired paper.",
    },
    {
      label: "Clay Tile",
      specs: [
        "Fired clay — can last 75+ years and won't fade",
        "New underlayment and flashing beneath the tile",
        "Manufacturer tile warranty — terms in your proposal",
        "Authentic Spanish style and the longest-lasting color",
      ],
      why: "Clay costs more than concrete tile and is more delicate to handle and cut, so installation takes more skilled time.",
    },
    {
      label: "Standing Seam Metal",
      specs: [
        "Steel panels — 40–70 years",
        "Concealed-fastener panels over high-temperature underlayment",
        "Manufacturer panel & finish warranty — terms in your proposal",
        "Modern design, reflective and low-maintenance",
      ],
      why: "Panels are measured and formed to your roof, with no exposed screws to leak — specialty material and a specialty crew.",
    },
    {
      label: "Flat / Low-Slope (TPO/Modified)",
      specs: [
        "TPO or modified membrane — 20–30 years",
        "Membrane with heat-welded seams that form one continuous sheet",
        "Manufacturer membrane warranty — terms in your proposal",
        "Flat roofs, patio covers, and additions",
      ],
      why: "Low-slope roofs live or die on drainage and seams; welding every seam and flashing each edge is careful, detail-heavy work.",
    },
  ],
};

export const ROOF_COMPLEXITY_WHY = [
  "Simple roofs have few valleys and penetrations — the most efficient install.",
  "Multiple planes mean more valleys, flashing and cut pieces — more labor and more material waste.",
  "Cut-ups and dormers need extra flashing, hand-fitting at every intersection and more safety setup — the most labor per square.",
];

// Concrete: slab structure by thickness. Order matches `thicknessOptions`.
export const CONCRETE_STRUCTURE: TierLadder = {
  areas: ["Concrete strength", "Reinforcement", "Base prep", "Built for"],
  options: [
    {
      label: '4" Standard slab',
      specs: [
        "3,000 PSI mix",
        "#3 rebar grid, 18\" on center",
        "Compacted base",
        "Patios, walkways and foot traffic",
      ],
      why: "The right slab for foot traffic — solid, reinforced concrete without paying for strength you won't use.",
    },
    {
      label: '5" Reinforced',
      specs: [
        "3,500 PSI mix",
        "#3 rebar grid, tighter spacing",
        "Thicker compacted base",
        "Driveways and everyday vehicles",
      ],
      why: "25% more concrete, a stronger mix and tighter rebar — built to carry cars day after day without cracking.",
    },
    {
      label: '6" Heavy-duty',
      specs: [
        "4,000 PSI mix",
        "#4 rebar grid",
        "Thickest compacted base",
        "RVs, trucks, boats and heavy equipment",
      ],
      why: "50% more concrete than a 4\" slab, the strongest mix and heavier steel — for loads that would break a standard slab.",
    },
  ],
};

// Why each concrete finish costs more. Order matches `finishTypes`.
export const CONCRETE_FINISH_WHY = [
  "Clean, slip-resistant texture — the most economical and durable finish.",
  "Decorative stone in the mix; the surface is washed at exactly the right moment to reveal it.",
  "Color, release agent and texture mats pressed by a larger crew in a short window, then sealed.",
  "Color built up in coats and sealed — a richer look with more steps.",
  "Ground and polished in multiple diamond passes, then densified — heavy machine work.",
  "Custom patterns, borders and multiple colors — hand-detailed, the most labor per square foot.",
];

export const GAF_TRUST = {
  title: "GAF Certified installer · 50-year warranty on every GAF shingle roof",
  text: "Whether you choose a budget-friendly GAF shingle or a premium one, every GAF shingle roof we install is built as a complete GAF system and carries GAF's 50-year System Plus warranty — something only GAF certified contractors can offer. The grade you choose changes the look, thickness and performance — not the warranty.",
};
