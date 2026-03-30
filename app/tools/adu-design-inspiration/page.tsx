"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Palette, Check, Sparkles } from "lucide-react";

const projectScales = [
  { id: "compact", label: "Compact ADU", description: "Efficient 400-600 sq ft concept direction" },
  { id: "family", label: "Family ADU", description: "Balanced 650-1,000 sq ft backyard home" },
  { id: "large", label: "Larger Backyard Home", description: "Premium 1,000-1,200 sq ft concept direction" },
];

const styles = [
  { id: "modern", label: "Modern", description: "Clean lines, flat roofs, large windows, minimalist palette" },
  { id: "contemporary", label: "Contemporary", description: "Current trends, mixed materials, open layouts" },
  { id: "minimal", label: "Minimal", description: "Simple forms, neutral tones, functional beauty" },
  { id: "warm-modern", label: "Warm Modern", description: "Modern structure with warm wood tones and natural textures" },
  { id: "spanish", label: "Spanish-Inspired", description: "Stucco, tile roof accents, arched details, terracotta warmth" },
  { id: "coastal", label: "Clean Coastal", description: "Light tones, natural materials, breezy and relaxed" },
];

const roofStyles = [
  { id: "flat", label: "Flat / Low Slope" },
  { id: "gable", label: "Gable" },
  { id: "hip", label: "Hip" },
  { id: "shed", label: "Shed / Single Slope" },
];

const exteriorMaterials = [
  { id: "stucco", label: "Smooth Stucco" },
  { id: "wood", label: "Wood / Wood-Look Siding" },
  { id: "mixed", label: "Mixed (Stucco + Wood)" },
  { id: "metal", label: "Metal Panel Accents" },
  { id: "stone", label: "Stone Veneer" },
];

const windowStyles = [
  { id: "large", label: "Large Floor-to-Ceiling" },
  { id: "standard", label: "Standard Sized" },
  { id: "clerestory", label: "Clerestory / High Windows" },
  { id: "corner", label: "Corner Windows" },
];

const kitchenMoods = [
  { id: "bright", label: "Bright & Clean" },
  { id: "warm", label: "Warm & Natural" },
  { id: "bold", label: "Bold & Dramatic" },
  { id: "minimal-k", label: "Minimal & Sleek" },
];

const bathroomMoods = [
  { id: "spa", label: "Spa-Like Retreat" },
  { id: "modern-b", label: "Modern & Crisp" },
  { id: "warm-b", label: "Warm & Earthy" },
  { id: "classic", label: "Clean Classic" },
];

const finishLevels = [
  { id: "standard", label: "Standard", description: "Quality materials, clean execution" },
  { id: "premium", label: "Premium", description: "Upgraded selections, designer touches" },
  { id: "luxury", label: "Luxury", description: "High-end finishes, custom details" },
];

type SelectionState = {
  scale: string | null;
  style: string | null;
  roof: string | null;
  exterior: string | null;
  windows: string | null;
  kitchen: string | null;
  bathroom: string | null;
  finish: string | null;
};

const stylePalettes: Record<string, { sky: string; facade: string; accent: string; roof: string; glass: string; landscape: string; hardscape: string }> = {
  modern: { sky: "#DCE7EE", facade: "#F3EFE8", accent: "#1F2F3A", roof: "#30353A", glass: "#8AB3C8", landscape: "#617E66", hardscape: "#D7D2CB" },
  contemporary: { sky: "#E3EAF0", facade: "#E9E4DA", accent: "#334155", roof: "#4B5563", glass: "#86AFC6", landscape: "#5F7C6D", hardscape: "#D0C4B4" },
  minimal: { sky: "#EDF1F4", facade: "#F7F5EF", accent: "#26313A", roof: "#40464E", glass: "#96BACD", landscape: "#73816D", hardscape: "#E1DDD6" },
  "warm-modern": { sky: "#E3E6DF", facade: "#E8DDCF", accent: "#7C5B3E", roof: "#473C36", glass: "#7CA5BA", landscape: "#6D7F61", hardscape: "#CDBCA8" },
  spanish: { sky: "#F1E6D8", facade: "#F0D6BD", accent: "#A35A37", roof: "#8E4B33", glass: "#87A8B8", landscape: "#71815F", hardscape: "#D4B18F" },
  coastal: { sky: "#DCECF2", facade: "#F5F6F0", accent: "#557A8B", roof: "#7A8D93", glass: "#8CBAC8", landscape: "#71918A", hardscape: "#DBD8D0" },
};

const materialColors: Record<string, string> = {
  stucco: "#EFE2CF",
  wood: "#9B7150",
  mixed: "#D8C4AA",
  metal: "#7B8794",
  stone: "#B7ACA1",
};

const kitchenPalettes: Record<string, { wall: string; cabinet: string; island: string; accent: string; floor: string }> = {
  bright: { wall: "#F7F5F0", cabinet: "#E9E4DA", island: "#D9DDE0", accent: "#C2A56A", floor: "#DDCFBD" },
  warm: { wall: "#EFE6D8", cabinet: "#CDAE85", island: "#A8815D", accent: "#B98E50", floor: "#D5BFA3" },
  bold: { wall: "#2E3138", cabinet: "#474C55", island: "#1F242B", accent: "#C8A951", floor: "#8C7B67" },
  "minimal-k": { wall: "#F2F2EE", cabinet: "#D8D8D2", island: "#C7CAC9", accent: "#7F8C8D", floor: "#D8D3CA" },
};

const bathroomPalettes: Record<string, { wall: string; vanity: string; tile: string; accent: string; floor: string }> = {
  spa: { wall: "#E7EEE7", vanity: "#B68E68", tile: "#D3DDD3", accent: "#7B9E8E", floor: "#C6CEC4" },
  "modern-b": { wall: "#F1F4F6", vanity: "#9DA8B2", tile: "#D8E0E7", accent: "#34495E", floor: "#CAD4DB" },
  "warm-b": { wall: "#EEE2D5", vanity: "#A77858", tile: "#DABFA7", accent: "#8A6A4E", floor: "#C9AE90" },
  classic: { wall: "#F4F1EA", vanity: "#B8B1A7", tile: "#E1DDD5", accent: "#8D8B85", floor: "#D6CEC1" },
};

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getScaleProfile(scale: string | null) {
  switch (scale) {
    case "compact":
      return { width: 340, height: 140, offsetX: 430, offsetY: 420 };
    case "large":
      return { width: 520, height: 190, offsetX: 340, offsetY: 375 };
    default:
      return { width: 430, height: 165, offsetX: 385, offsetY: 400 };
  }
}

function buildRoofPath(roof: string | null, x: number, y: number, width: number, height: number): string {
  if (roof === "gable") {
    return `M ${x - 12} ${y} L ${x + width / 2} ${y - height * 0.42} L ${x + width + 12} ${y} Z`;
  }
  if (roof === "hip") {
    return `M ${x + 10} ${y} L ${x + width / 2} ${y - height * 0.32} L ${x + width - 10} ${y} L ${x + width - 24} ${y + 10} L ${x + 24} ${y + 10} Z`;
  }
  if (roof === "shed") {
    return `M ${x} ${y} L ${x + width} ${y - height * 0.24} L ${x + width} ${y} Z`;
  }
  return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + 16} L ${x} ${y + 16} Z`;
}

function buildWindowMarkup(windowStyle: string | null, x: number, y: number, palette: { glass: string; accent: string }) {
  if (windowStyle === "large") {
    return `
      <rect x="${x}" y="${y}" width="88" height="72" rx="4" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="6" />
      <rect x="${x + 104}" y="${y}" width="88" height="72" rx="4" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="6" />
    `;
  }

  if (windowStyle === "clerestory") {
    return `
      <rect x="${x}" y="${y - 28}" width="86" height="24" rx="3" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="5" />
      <rect x="${x + 104}" y="${y - 28}" width="86" height="24" rx="3" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="5" />
      <rect x="${x + 34}" y="${y + 24}" width="48" height="44" rx="3" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="5" />
      <rect x="${x + 138}" y="${y + 24}" width="48" height="44" rx="3" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="5" />
    `;
  }

  if (windowStyle === "corner") {
    return `
      <rect x="${x}" y="${y}" width="78" height="64" rx="4" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="6" />
      <rect x="${x + 176}" y="${y}" width="32" height="64" rx="4" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="6" />
      <rect x="${x + 92}" y="${y}" width="74" height="64" rx="4" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="6" />
    `;
  }

  return `
    <rect x="${x}" y="${y}" width="62" height="52" rx="4" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="5" />
    <rect x="${x + 86}" y="${y}" width="62" height="52" rx="4" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="5" />
    <rect x="${x + 172}" y="${y}" width="62" height="52" rx="4" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="5" />
  `;
}

function buildExteriorConcept(kind: "front" | "rear", selections: SelectionState): string {
  const palette = stylePalettes[selections.style || "modern"];
  const scale = getScaleProfile(selections.scale);
  const bodyColor = materialColors[selections.exterior || "stucco"];
  const roofY = scale.offsetY - 28;
  const deckDepth = kind === "rear" ? 54 : 18;
  const landscapeBand = kind === "rear" ? 100 : 72;
  const pergola = kind === "rear" ? `<rect x="${scale.offsetX + scale.width - 140}" y="${scale.offsetY + 32}" width="110" height="12" fill="${palette.accent}" opacity="0.75" />
    <line x1="${scale.offsetX + scale.width - 124}" y1="${scale.offsetY + 44}" x2="${scale.offsetX + scale.width - 124}" y2="${scale.offsetY + 118}" stroke="${palette.accent}" stroke-width="6" />
    <line x1="${scale.offsetX + scale.width - 46}" y1="${scale.offsetY + 44}" x2="${scale.offsetX + scale.width - 46}" y2="${scale.offsetY + 118}" stroke="${palette.accent}" stroke-width="6" />` : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.sky}" />
          <stop offset="100%" stop-color="#F8F7F2" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#sky)" />
      <rect y="640" width="1200" height="260" fill="${palette.landscape}" opacity="0.95" />
      <rect y="610" width="1200" height="${landscapeBand}" fill="${palette.hardscape}" opacity="0.9" />
      <rect x="${scale.offsetX - 30}" y="${scale.offsetY + scale.height - 8}" width="${scale.width + 80}" height="${deckDepth}" rx="10" fill="${palette.hardscape}" />
      <rect x="${scale.offsetX}" y="${scale.offsetY}" width="${scale.width}" height="${scale.height}" rx="12" fill="${bodyColor}" />
      <path d="${buildRoofPath(selections.roof, scale.offsetX, roofY, scale.width, scale.height)}" fill="${palette.roof}" />
      <rect x="${scale.offsetX + scale.width * 0.42}" y="${scale.offsetY + 40}" width="72" height="${scale.height - 40}" rx="8" fill="${palette.accent}" />
      ${buildWindowMarkup(selections.windows, scale.offsetX + 42, scale.offsetY + 52, palette)}
      ${kind === "rear" ? `<rect x="${scale.offsetX + 118}" y="${scale.offsetY + 54}" width="126" height="92" rx="8" fill="${palette.glass}" stroke="${palette.accent}" stroke-width="7" />` : ""}
      ${pergola}
      <circle cx="${kind === "front" ? "244" : "960"}" cy="560" r="90" fill="${palette.landscape}" opacity="0.6" />
      <circle cx="${kind === "front" ? "950" : "210"}" cy="540" r="70" fill="${palette.landscape}" opacity="0.5" />
      <rect x="0" y="760" width="1200" height="140" fill="#F6F1E7" />
      <rect x="0" y="760" width="1200" height="22" fill="#D4C7B8" />
      <text x="60" y="92" fill="${palette.accent}" font-size="34" font-family="Arial, sans-serif" font-weight="700">
        ${kind === "front" ? "Front Exterior Concept" : "Rear Yard Concept"}
      </text>
      <text x="60" y="130" fill="${palette.accent}" font-size="20" font-family="Arial, sans-serif" opacity="0.75">
        ${selections.scale === "compact" ? "Compact ADU massing" : selections.scale === "large" ? "Larger backyard home massing" : "Family-sized backyard home massing"}
      </text>
    </svg>
  `;

  return svgToDataUri(svg);
}

function buildInteriorConcept(kind: "kitchen" | "bathroom", selections: SelectionState): string {
  const accent = stylePalettes[selections.style || "modern"].accent;
  const finishScale = selections.finish === "luxury" ? 1.12 : selections.finish === "premium" ? 1.06 : 1;
  if (kind === "kitchen") {
    const palette = kitchenPalettes[selections.kitchen || "bright"];
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
        <rect width="1200" height="900" fill="${palette.wall}" />
        <rect y="610" width="1200" height="290" fill="${palette.floor}" />
        <rect x="120" y="220" width="960" height="270" rx="20" fill="${palette.cabinet}" />
        <rect x="150" y="252" width="900" height="34" rx="8" fill="${palette.accent}" opacity="0.88" />
        <rect x="320" y="510" width="${280 * finishScale}" height="126" rx="20" fill="${palette.island}" stroke="${accent}" stroke-width="8" />
        <rect x="690" y="510" width="${180 * finishScale}" height="126" rx="18" fill="${palette.island}" opacity="0.92" />
        <rect x="168" y="310" width="140" height="110" rx="8" fill="#F7FBFD" stroke="${accent}" stroke-width="6" />
        <rect x="344" y="310" width="140" height="110" rx="8" fill="#F7FBFD" stroke="${accent}" stroke-width="6" />
        <rect x="520" y="310" width="140" height="110" rx="8" fill="#F7FBFD" stroke="${accent}" stroke-width="6" />
        <rect x="700" y="310" width="140" height="110" rx="8" fill="#F7FBFD" stroke="${accent}" stroke-width="6" />
        <rect x="890" y="310" width="88" height="150" rx="10" fill="#E6EBF0" stroke="${accent}" stroke-width="6" />
        <circle cx="404" cy="170" r="40" fill="${palette.accent}" opacity="0.75" />
        <circle cx="604" cy="170" r="40" fill="${palette.accent}" opacity="0.75" />
        <circle cx="804" cy="170" r="40" fill="${palette.accent}" opacity="0.75" />
        <text x="60" y="92" fill="${accent}" font-size="34" font-family="Arial, sans-serif" font-weight="700">Kitchen Concept</text>
        <text x="60" y="130" fill="${accent}" font-size="20" font-family="Arial, sans-serif" opacity="0.75">Generated from your selected kitchen mood and finish direction</text>
      </svg>
    `);
  }

  const palette = bathroomPalettes[selections.bathroom || "spa"];
  return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
        <rect width="1200" height="900" fill="${palette.wall}" />
        <rect y="620" width="1200" height="280" fill="${palette.floor}" />
        <rect x="120" y="220" width="360" height="330" rx="24" fill="${palette.tile}" stroke="${accent}" stroke-width="10" />
        <rect x="170" y="270" width="260" height="230" rx="18" fill="#F9FCFD" opacity="0.95" />
        <rect x="620" y="250" width="360" height="120" rx="18" fill="${palette.vanity}" />
        <rect x="650" y="210" width="300" height="44" rx="12" fill="${palette.accent}" opacity="0.88" />
        <circle cx="720" cy="312" r="26" fill="#F6F6F2" />
        <circle cx="880" cy="312" r="26" fill="#F6F6F2" />
        <rect x="660" y="430" width="${320 * finishScale}" height="120" rx="60" fill="#F7F2EA" stroke="${accent}" stroke-width="8" />
        <rect x="510" y="150" width="110" height="340" rx="55" fill="#E9EEF0" opacity="0.8" />
        <text x="60" y="92" fill="${accent}" font-size="34" font-family="Arial, sans-serif" font-weight="700">Bathroom Concept</text>
        <text x="60" y="130" fill="${accent}" font-size="20" font-family="Arial, sans-serif" opacity="0.75">Generated from your selected bathroom mood and finish direction</text>
      </svg>
    `);
}

export default function ADUDesignInspirationPage() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<SelectionState>({
    scale: null,
    style: null,
    roof: null,
    exterior: null,
    windows: null,
    kitchen: null,
    bathroom: null,
    finish: null,
  });

  const select = (key: keyof SelectionState, value: string) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      title: "Project Scale",
      subtitle: "What size project are you trying to visualize?",
      key: "scale" as const,
      options: projectScales,
    },
    {
      title: "Choose Your Style",
      subtitle: "What overall aesthetic speaks to you?",
      key: "style" as const,
      options: styles,
    },
    {
      title: "Roof Style",
      subtitle: "Select a roof direction",
      key: "roof" as const,
      options: roofStyles,
    },
    {
      title: "Exterior Material",
      subtitle: "Choose your exterior look",
      key: "exterior" as const,
      options: exteriorMaterials,
    },
    {
      title: "Window Style",
      subtitle: "How should natural light flow in?",
      key: "windows" as const,
      options: windowStyles,
    },
    {
      title: "Kitchen Mood",
      subtitle: "What feeling do you want in the kitchen?",
      key: "kitchen" as const,
      options: kitchenMoods,
    },
    {
      title: "Bathroom Mood",
      subtitle: "What feeling do you want in the bathroom?",
      key: "bathroom" as const,
      options: bathroomMoods,
    },
    {
      title: "Finish Level",
      subtitle: "How refined should the finishes be?",
      key: "finish" as const,
      options: finishLevels,
    },
  ];

  const currentStep = steps[step];
  const isComplete = step >= steps.length;
  const completedCount = Object.values(selections).filter(Boolean).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  const getLabel = (key: keyof SelectionState) => {
    const val = selections[key];
    if (!val) return null;
    const stepDef = steps.find((s) => s.key === key);
    const opt = stepDef?.options.find((o) => o.id === val);
    return opt?.label ?? val;
  };

  const conceptCards = useMemo(
    () => [
      {
        title: "Front Exterior",
        caption: "Primary massing, roofline, window rhythm, and entry composition",
        image: buildExteriorConcept("front", selections),
      },
      {
        title: "Rear Yard Exterior",
        caption: "Outdoor living edge, glazing strategy, and backyard-facing elevation",
        image: buildExteriorConcept("rear", selections),
      },
      {
        title: "Kitchen Concept",
        caption: "Cabinet tone, island character, and material direction",
        image: buildInteriorConcept("kitchen", selections),
      },
      {
        title: "Bathroom Concept",
        caption: "Vanity mood, tile palette, and spa-level detailing direction",
        image: buildInteriorConcept("bathroom", selections),
      },
    ],
    [selections]
  );

  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              DESIGN INSPIRATION
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ADU Design Inspiration Builder
            </h1>
            <p className="text-xl text-white/80">
              Select your preferences and generate concept visuals for both exterior and interior directions.
              The goal is to give you a visual starting point, not just a style label.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-10">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {Math.min(step + 1, steps.length)} of {steps.length}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!isComplete ? (
            <div>
              <h2 className="text-2xl font-bold text-secondary mb-2">{currentStep.title}</h2>
              <p className="text-muted-foreground mb-8">{currentStep.subtitle}</p>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => select(currentStep.key, opt.id)}
                    className={`text-left px-5 py-4 rounded-xl border-2 transition-all ${
                      selections[currentStep.key] === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/30"
                    }`}
                  >
                    <span className="font-semibold text-secondary block">{opt.label}</span>
                    {"description" in opt && (
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {(opt as { description?: string }).description}
                      </span>
                    )}
                    {selections[currentStep.key] === opt.id && (
                      <Check className="h-4 w-4 text-primary mt-2" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!selections[currentStep.key]}
                  className="bg-primary hover:bg-primary-dark text-secondary font-semibold"
                >
                  {step === steps.length - 1 ? "Generate Concepts" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-10">
                <Sparkles className="h-14 w-14 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-secondary mb-2">Your Generated Concept Direction</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  These concept visuals are generated from your chosen project scale, architectural style,
                  exterior materials, and interior moods so you can react to something visual instead of abstract descriptions.
                </p>
              </div>

              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(["scale", "style", "roof", "exterior", "windows", "kitchen", "bathroom", "finish"] as const).map((key) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          {key === "scale" ? "Project Scale" : key === "roof" ? "Roof Style" : key === "windows" ? "Window Style" : key === "kitchen" ? "Kitchen Mood" : key === "bathroom" ? "Bathroom Mood" : key === "finish" ? "Finish Level" : key === "exterior" ? "Exterior Material" : "Overall Style"}
                        </p>
                        <p className="font-bold text-secondary text-lg">{getLabel(key)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {conceptCards.map((concept) => (
                  <div key={concept.title} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <img
                      src={concept.image}
                      alt={concept.title}
                      className="h-72 w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="font-bold text-secondary text-lg mb-2">{concept.title}</h3>
                      <p className="text-sm text-muted-foreground">{concept.caption}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-secondary text-white mb-8">
                <CardContent className="p-8 text-center">
                  <Palette className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Use These Concepts to Start a Real Design Conversation</h3>
                  <p className="text-white/70 mb-6">
                    Bring this direction into a consultation and we can turn it into floor-plan refinements,
                    exterior massing options, finish packages, and a buildable scope for your property.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/build-your-adu">
                      <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                        Start Building Your ADU <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button size="lg" variant="outlineWhite">
                        Schedule Consultation
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <button
                onClick={() => {
                  setStep(0);
                  setSelections({
                    scale: null,
                    style: null,
                    roof: null,
                    exterior: null,
                    windows: null,
                    kitchen: null,
                    bathroom: null,
                    finish: null,
                  });
                }}
                className="text-primary text-sm font-semibold hover:underline mx-auto block"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
