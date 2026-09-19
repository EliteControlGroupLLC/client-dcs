"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Grid3x3, 
  List, 
  Bed, 
  Bath, 
  Square,
  Eye,
  DollarSign,
  Layers3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { FLOOR_PLANS_SORTED } from "@/lib/data/site-data";
import { fieldClass } from "@/components/ui/form";
import { FloorPlanDetailModal } from "@/components/floor-plans/floor-plan-detail-modal";

type ViewMode = "grid" | "list";
type SortOption = "size-asc" | "size-desc" | "price-asc" | "price-desc";
type ModalView = "layout" | "customize";

const styles = ["All Styles", ...Array.from(new Set(FLOOR_PLANS_SORTED.map((plan) => plan.style)))];
const types = ["All Types", ...Array.from(new Set(FLOOR_PLANS_SORTED.map((plan) => plan.type)))];
const bedroomOptions = ["Any", "Studio", "1", "2", "3", "4"];

function formatBedroomLabel(minBeds: number, maxBeds: number) {
  if (maxBeds === 0) return "Studio";
  if (minBeds === maxBeds) return `${maxBeds} bed${maxBeds > 1 ? "s" : ""}`;
  return `${minBeds}–${maxBeds} beds`;
}

function formatBathroomLabel(minBaths: number, maxBaths: number) {
  if (minBaths === maxBaths) return `${minBaths} bath${minBaths > 1 ? "s" : ""}`;
  return `${minBaths}–${maxBaths} baths`;
}

export default function FloorPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedBedrooms, setSelectedBedrooms] = useState("Any");
  const [sortBy, setSortBy] = useState<SortOption>("size-asc");
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null);
  const [modalView, setModalView] = useState<ModalView>("layout");

  const filteredPlans = useMemo(() => {
    let plans = [...FLOOR_PLANS_SORTED];

    // Search filter
    if (searchQuery) {
      plans = plans.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Style filter
    if (selectedStyle !== "All Styles") {
      plans = plans.filter(p => p.style === selectedStyle);
    }

    // Type filter
    if (selectedType !== "All Types") {
      plans = plans.filter(p => p.type === selectedType);
    }

    // Bedroom filter
    if (selectedBedrooms !== "Any") {
      if (selectedBedrooms === "Studio") {
        plans = plans.filter((plan) => plan.supportedVariations.some((variation) => variation.bedrooms === 0));
      } else {
        const requestedBeds = parseInt(selectedBedrooms);
        plans = plans.filter((plan) => plan.supportedVariations.some((variation) => variation.bedrooms === requestedBeds));
      }
    }

    // Sort
    switch (sortBy) {
      case "size-asc":
        plans.sort((a, b) => a.sqFt - b.sqFt);
        break;
      case "size-desc":
        plans.sort((a, b) => b.sqFt - a.sqFt);
        break;
      case "price-asc":
        plans.sort((a, b) => a.priceLow - b.priceLow);
        break;
      case "price-desc":
        plans.sort((a, b) => b.priceLow - a.priceLow);
        break;
    }

    return plans;
  }, [searchQuery, selectedStyle, selectedType, selectedBedrooms, sortBy]);

  const selectedPlan = selectedPlanIndex !== null ? filteredPlans[selectedPlanIndex] : null;

  const handleOpenPlan = (index: number, view: ModalView = "layout") => {
    setModalView(view);
    setSelectedPlanIndex(index);
  };

  const handleCloseDetail = () => {
    setSelectedPlanIndex(null);
  };

  const handlePreviousPlan = () => {
    if (selectedPlanIndex !== null && selectedPlanIndex > 0) {
      setSelectedPlanIndex(selectedPlanIndex - 1);
    }
  };

  const handleNextPlan = () => {
    if (selectedPlanIndex !== null && selectedPlanIndex < filteredPlans.length - 1) {
      setSelectedPlanIndex(selectedPlanIndex + 1);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              FLOOR PLANS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ADU Floor Plans Library
            </h1>
            <p className="text-xl text-white/80">
              Browse our curated collection of ADU designs with real floor plan layouts. Each plan can be customized to fit your property and lifestyle.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4 lg:items-center">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  aria-label="Search floor plans"
                  placeholder="Search floor plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={fieldClass({}, "pl-10")}
                />
              </div>

              {/* Style Filter */}
              <select
                aria-label="Filter by style"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className={fieldClass({}, "lg:w-auto")}
              >
                {styles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                aria-label="Filter by type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={fieldClass({}, "lg:w-auto")}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Bedrooms Filter */}
              <select
                aria-label="Filter by bedrooms"
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className={fieldClass({}, "lg:w-auto")}
              >
                {bedroomOptions.map(opt => (
                  <option key={opt} value={opt}>{opt === "Any" ? "Any Beds" : opt === "Studio" ? "Studio" : `${opt} Bed`}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                aria-label="Sort floor plans"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={fieldClass({}, "lg:w-auto")}
              >
                <option value="size-asc">Size: Small to Large</option>
                <option value="size-desc">Size: Large to Small</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {/* View Toggle */}
              <div className="flex w-fit rounded-lg border border-border overflow-hidden sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                  className={`h-11 w-11 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "bg-white text-secondary hover:bg-muted"}`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  className={`h-11 w-11 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-primary text-white" : "bg-white text-secondary hover:bg-muted"}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">
            Showing <span className="font-semibold text-secondary">{filteredPlans.length}</span> floor plans
          </p>

          {/* Floor Plans Grid/List */}
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-6"
          }>
            {filteredPlans.map((plan, index) => (
              <Card key={plan.id} className={`h-full overflow-hidden hover:shadow-lg transition-shadow flex ${viewMode === "list" ? "flex-col md:flex-row" : "flex-col"}`}>
                {/* Floor Plan Preview */}
                <div className={`relative ${viewMode === "list" ? "md:w-72 shrink-0" : ""}`}>
                  {/* Exterior Image */}
                  <div className={`relative ${viewMode === "list" ? "aspect-[4/3] md:aspect-auto md:h-full" : "aspect-[4/3]"}`}>
                    <Image
                      src={plan.exteriorImage}
                      alt={`${plan.name} exterior`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                    {/* Overlay Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Square className="h-4 w-4" />
                        <span>{plan.sqFt.toLocaleString()} sq ft</span>
                      </div>
                    </div>
                  </div>

                  {plan.popular && (
                    <div className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                </div>

                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-secondary mb-3">{plan.name}</h3>
                  
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {formatBedroomLabel(plan.bedrooms, plan.maxBedrooms)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {formatBathroomLabel(plan.bathrooms, plan.maxBathrooms)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${plan.rentEstimate.low.toLocaleString()}&nbsp;&ndash; ${plan.rentEstimate.high.toLocaleString()}/mo
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers3 className="h-4 w-4" />
                        {plan.dimensions.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs font-medium text-secondary bg-muted px-3 py-1 rounded-full">{plan.style}</span>
                      <span className="text-xs font-medium text-secondary bg-muted px-3 py-1 rounded-full">{plan.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{plan.summary}</p>
                    <p className="font-semibold text-primary">{plan.priceRange}</p>
                  </div>

                  <div className={`flex gap-3 mt-6 ${viewMode === "list" ? "flex-col sm:flex-row" : ""}`}>
                    <Button
                      variant="outline"
                      rounded="full"
                      className={viewMode === "grid" ? "flex-1" : ""}
                      onClick={() => handleOpenPlan(index, "layout")}
                    >
                      <Eye className="h-4 w-4" />
                      {viewMode === "grid" ? "Details" : "View Details"}
                    </Button>
                    <Button
                      rounded="full"
                      className={viewMode === "grid" ? "flex-1" : ""}
                      onClick={() => handleOpenPlan(index, "customize")}
                    >
                      Customize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don&apos;t See What You&apos;re Looking For?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            We can design a custom ADU floor plan that perfectly fits your property and needs. Our architects will work with you to create your ideal space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu" className="w-full sm:w-auto">
              <Button size="lg" rounded="full" className="w-full sm:w-auto">
                Design Custom ADU <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" rounded="full" variant="outlineWhite" className="w-full sm:w-auto">
                Talk to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <FloorPlanDetailModal
        plan={selectedPlan}
        isOpen={selectedPlanIndex !== null}
        initialTab={modalView}
        onClose={handleCloseDetail}
        onPrevious={handlePreviousPlan}
        onNext={handleNextPlan}
        hasPrevious={selectedPlanIndex !== null && selectedPlanIndex > 0}
        hasNext={selectedPlanIndex !== null && selectedPlanIndex < filteredPlans.length - 1}
      />
    </div>
  );
}
