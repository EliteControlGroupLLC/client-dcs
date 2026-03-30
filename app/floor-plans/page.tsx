"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Grid3x3, 
  List, 
  Bed, 
  Bath, 
  Square,
  Heart,
  Eye,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { FLOOR_PLANS } from "@/lib/data/site-data";
import { FloorPlanLayout } from "@/components/floor-plans/floor-plan-layout";
import { FloorPlanDetailModal } from "@/components/floor-plans/floor-plan-detail-modal";

type ViewMode = "grid" | "list";
type SortOption = "size-asc" | "size-desc" | "price-asc" | "price-desc";

// Exterior image mapping
const EXTERIOR_IMAGES: Record<string, string> = {
  "garage-conversion": "/images/floor-plans/garage-conversion-exterior.jpg",
  "compact-detached": "/images/floor-plans/compact-detached-exterior.jpg",
  "efficient-one": "/images/floor-plans/efficient-one-exterior.jpg",
  "cozy-cottage": "/images/floor-plans/cozy-cottage-exterior.jpg",
  "urban-loft": "/images/floor-plans/urban-loft-exterior.jpg",
  "family-suite": "/images/floor-plans/family-suite-exterior.jpg",
  "deluxe-two": "/images/floor-plans/deluxe-two-exterior.jpg",
  "compact-three": "/images/floor-plans/compact-three-exterior.jpg",
  "grand-retreat": "/images/floor-plans/grand-retreat-exterior.jpg",
  "luxury-suite": "/images/floor-plans/luxury-suite-exterior.jpg",
  "modern-four": "/images/floor-plans/modern-four-exterior.jpg",
};

const styles = ["All Styles", "Modern", "Contemporary", "Traditional", "Craftsman"];
const types = ["All Types", "Studio", "Attached", "Detached", "Garage Conversion", "Two-Story"];
const bedroomOptions = ["Any", "Studio", "1", "2", "3", "4"];

export default function FloorPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedBedrooms, setSelectedBedrooms] = useState("Any");
  const [sortBy, setSortBy] = useState<SortOption>("size-asc");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredPlans = useMemo(() => {
    let plans = [...FLOOR_PLANS];

    // Search filter
    if (searchQuery) {
      plans = plans.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
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
        plans = plans.filter(p => p.bedrooms === 0);
      } else {
        plans = plans.filter(p => p.bedrooms === parseInt(selectedBedrooms));
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

  const handleOpenDetail = (index: number) => {
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
    <div className="min-h-screen bg-muted pt-28 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            ADU Floor Plans Library
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our curated collection of ADU designs with real floor plan layouts. Each plan can be customized to fit your property and lifestyle.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search floor plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Style Filter */}
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-background text-sm"
            >
              {styles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-background text-sm"
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Bedrooms Filter */}
            <select
              value={selectedBedrooms}
              onChange={(e) => setSelectedBedrooms(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-background text-sm"
            >
              {bedroomOptions.map(opt => (
                <option key={opt} value={opt}>{opt === "Any" ? "Any Beds" : opt === "Studio" ? "Studio" : `${opt} Bed`}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 px-4 rounded-lg border border-input bg-background text-sm"
            >
              <option value="size-asc">Size: Small to Large</option>
              <option value="size-desc">Size: Large to Small</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {/* View Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary text-white" : "bg-white"}`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary text-white" : "bg-white"}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-secondary">{filteredPlans.length}</span> floor plans
          </p>
          {favorites.length > 0 && (
            <p className="text-sm text-primary">
              <Heart className="inline h-4 w-4 mr-1 fill-current" />
              {favorites.length} saved
            </p>
          )}
        </div>

        {/* Floor Plans Grid/List */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
        }>
          {filteredPlans.map((plan, index) => (
            <Card key={plan.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex flex-row" : ""}`}>
              {/* Floor Plan Preview */}
              <div className={`relative ${viewMode === "list" ? "w-72 shrink-0" : ""}`}>
                {/* Exterior Image */}
                <div className={`relative ${viewMode === "list" ? "h-full" : "aspect-[4/3]"}`}>
                  <Image
                    src={EXTERIOR_IMAGES[plan.id] || "/images/adu-configurator-preview.jpg"}
                    alt={`${plan.name} exterior`}
                    fill
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
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                    Popular
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(plan.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition"
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(plan.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </button>
              </div>

              <CardContent className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                <div>
                  <h3 className="font-semibold text-secondary text-lg mb-2">{plan.name}</h3>
                  
                  {/* Mini Floor Plan Layout */}
                  {viewMode === "grid" && (
                    <div className="mb-3 bg-muted/50 rounded-lg p-2">
                      <FloorPlanLayout
                        planId={plan.id}
                        sqFt={plan.sqFt}
                        bedrooms={plan.bedrooms}
                        bathrooms={plan.bathrooms}
                        showLabels={false}
                        showDimensions={false}
                        className="border-0 bg-transparent"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {plan.bedrooms === 0 ? "Studio" : plan.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {plan.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${plan.rentEstimate.low.toLocaleString()}-${plan.rentEstimate.high.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-muted px-2 py-1 rounded">{plan.style}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{plan.type}</span>
                  </div>
                  <p className="font-semibold text-primary">{plan.priceRange}</p>
                </div>

                {viewMode === "list" && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDetail(index)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Link href="/build-your-adu">
                      <Button size="sm" className="bg-primary hover:bg-primary-dark text-secondary">
                        Customize
                      </Button>
                    </Link>
                  </div>
                )}

                {viewMode === "grid" && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleOpenDetail(index)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Link href="/build-your-adu" className="flex-1">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary-dark text-secondary">
                        Customize
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-secondary rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Don&apos;t See What You&apos;re Looking For?
          </h2>
          <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
            We can design a custom ADU floor plan that perfectly fits your property and needs. Our architects will work with you to create your ideal space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Design Custom ADU
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Talk to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <FloorPlanDetailModal
        plan={selectedPlan}
        isOpen={selectedPlanIndex !== null}
        onClose={handleCloseDetail}
        onPrevious={handlePreviousPlan}
        onNext={handleNextPlan}
        hasPrevious={selectedPlanIndex !== null && selectedPlanIndex > 0}
        hasNext={selectedPlanIndex !== null && selectedPlanIndex < filteredPlans.length - 1}
      />
    </div>
  );
}
