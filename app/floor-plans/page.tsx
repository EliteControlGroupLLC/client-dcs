"use client";

import { useState, useMemo } from "react";
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
  ArrowUpDown,
  Heart,
  Eye,
  Download
} from "lucide-react";
import Link from "next/link";

type ViewMode = "grid" | "list";
type SortOption = "popular" | "size-asc" | "size-desc" | "price-asc" | "price-desc";

const floorPlans = [
  {
    id: "garage-conversion",
    name: "Garage Conversion",
    sqFt: 400,
    bedrooms: 0,
    bathrooms: 1,
    style: "Modern",
    type: "Garage Conversion",
    priceRange: "$120k - $150k",
    popular: true,
    features: ["Uses existing structure", "Open floor plan", "Full kitchen"],
  },
  {
    id: "compact-detached",
    name: "Compact Detached ADU",
    sqFt: 400,
    bedrooms: 0,
    bathrooms: 1,
    style: "Modern",
    type: "Detached",
    priceRange: "Starting at $175k",
    popular: true,
    features: ["Standalone structure", "Full kitchen", "Stackable W/D"],
  },
  {
    id: "efficient-one",
    name: "The Efficient",
    sqFt: 500,
    bedrooms: 1,
    bathrooms: 1,
    style: "Contemporary",
    type: "Attached",
    priceRange: "$220k - $225k",
    popular: true,
    features: ["Separate bedroom", "Full kitchen", "In-unit laundry"],
  },
  {
    id: "cozy-cottage",
    name: "Cozy Cottage",
    sqFt: 600,
    bedrooms: 1,
    bathrooms: 1,
    style: "Craftsman",
    type: "Detached",
    priceRange: "$255k - $260k",
    popular: true,
    features: ["Private patio", "Walk-in closet", "Full kitchen"],
  },
  {
    id: "urban-loft",
    name: "Urban Loft",
    sqFt: 650,
    bedrooms: 1,
    bathrooms: 1,
    style: "Modern",
    type: "Detached",
    priceRange: "$275k - $280k",
    popular: false,
    features: ["High ceilings", "Large windows", "Open concept"],
  },
  {
    id: "family-suite",
    name: "Family Suite",
    sqFt: 750,
    bedrooms: 2,
    bathrooms: 1,
    style: "Traditional",
    type: "Detached",
    priceRange: "$320k - $325k",
    popular: true,
    features: ["2 bedrooms", "Full kitchen", "Private yard space"],
  },
  {
    id: "deluxe-two",
    name: "Deluxe Two",
    sqFt: 850,
    bedrooms: 2,
    bathrooms: 2,
    style: "Modern",
    type: "Detached",
    priceRange: "$360k - $365k",
    popular: false,
    features: ["Primary suite", "Guest bedroom", "2 full baths"],
  },
  {
    id: "grand-retreat",
    name: "Grand Retreat",
    sqFt: 1000,
    bedrooms: 2,
    bathrooms: 2,
    style: "Contemporary",
    type: "Detached",
    priceRange: "$425k - $430k",
    popular: true,
    features: ["Spacious living", "Walk-in closets", "Premium finishes"],
  },
  {
    id: "luxury-suite",
    name: "Luxury Suite",
    sqFt: 1200,
    bedrooms: 3,
    bathrooms: 2,
    style: "Modern",
    type: "Detached",
    priceRange: "$495k - $512k",
    popular: false,
    features: ["3 bedrooms", "2 full baths", "Premium upgrades"],
  },
];

const styles = ["All Styles", "Modern", "Contemporary", "Traditional", "Craftsman"];
const types = ["All Types", "Studio", "Attached", "Detached", "Garage Conversion"];
const bedroomOptions = ["Any", "Studio", "1", "2", "3+"];

export default function FloorPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedBedrooms, setSelectedBedrooms] = useState("Any");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredPlans = useMemo(() => {
    let plans = [...floorPlans];

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
      } else if (selectedBedrooms === "3+") {
        plans = plans.filter(p => p.bedrooms >= 3);
      } else {
        plans = plans.filter(p => p.bedrooms === parseInt(selectedBedrooms));
      }
    }

    // Sort
    switch (sortBy) {
      case "popular":
        plans.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        break;
      case "size-asc":
        plans.sort((a, b) => a.sqFt - b.sqFt);
        break;
      case "size-desc":
        plans.sort((a, b) => b.sqFt - a.sqFt);
        break;
      case "price-asc":
        plans.sort((a, b) => parseInt(a.priceRange.replace(/\D/g, "")) - parseInt(b.priceRange.replace(/\D/g, "")));
        break;
      case "price-desc":
        plans.sort((a, b) => parseInt(b.priceRange.replace(/\D/g, "")) - parseInt(a.priceRange.replace(/\D/g, "")));
        break;
    }

    return plans;
  }, [searchQuery, selectedStyle, selectedType, selectedBedrooms, sortBy]);

  return (
    <div className="min-h-screen bg-muted pt-28 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            ADU Floor Plans Library
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our curated collection of ADU designs. Each plan can be customized to fit your property and lifestyle.
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
              <option value="popular">Most Popular</option>
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
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
        }>
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex flex-row" : ""}`}>
              {/* Image Placeholder */}
              <div className={`bg-gradient-to-br from-primary/20 to-secondary/20 relative ${viewMode === "list" ? "w-48 shrink-0" : "aspect-[4/3]"}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Square className="h-12 w-12 text-primary/40 mx-auto mb-2" />
                    <span className="text-sm text-muted-foreground">Floor Plan</span>
                  </div>
                </div>
                {plan.popular && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                    Popular
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(plan.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition"
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(plan.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </button>
              </div>

              <CardContent className={`p-4 ${viewMode === "list" ? "flex-1 flex items-center justify-between" : ""}`}>
                <div>
                  <h3 className="font-semibold text-secondary text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      {plan.sqFt} sq ft
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {plan.bedrooms === 0 ? "Studio" : plan.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {plan.bathrooms}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-muted px-2 py-1 rounded">{plan.style}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{plan.type}</span>
                  </div>
                  <p className="font-semibold text-primary">{plan.priceRange}</p>
                </div>

                {viewMode === "list" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary-dark text-secondary">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}

                {viewMode === "grid" && (
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary-dark text-secondary">
                      Customize
                    </Button>
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
    </div>
  );
}
