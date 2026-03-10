"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Bed, Bath, Ruler, DollarSign, Phone, Info } from "lucide-react";
import { ADU_SIZES, ADU_TYPES } from "@/lib/types/adu";

export function ADUPriceSidebar() {
  const { config, pricing, currentStep } = useADU();

  const sizeInfo = config.size && config.size !== "custom" ? ADU_SIZES[config.size] : null;
  const typeInfo = config.aduType ? ADU_TYPES[config.aduType] : null;

  // Calculate estimated monthly payment (30-year, 7% rate)
  const monthlyPayment = pricing.total > 0 
    ? Math.round((pricing.total * 0.07 / 12) / (1 - Math.pow(1 + 0.07 / 12, -360))) 
    : 0;

  // Estimated rental income based on size
  const estimatedRent = sizeInfo 
    ? Math.round(sizeInfo.sqft * 3.5) // ~$3.50/sqft in San Diego
    : config.sqft 
    ? Math.round(config.sqft * 3.5)
    : 0;

  return (
    <div className="space-y-6 sticky top-40">
      {/* Price Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Your Estimate
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Main price */}
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-secondary">
              {pricing.total > 0 ? formatCurrency(pricing.total) : "—"}
            </span>
            <p className="text-sm text-muted-foreground mt-1">Estimated Total</p>
          </div>

          {/* Price breakdown */}
          {pricing.total > 0 && (
            <div className="space-y-3 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-medium">{formatCurrency(pricing.base)}</span>
              </div>
              {pricing.upgrades > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Upgrades</span>
                  <span className="font-medium text-primary">+{formatCurrency(pricing.upgrades)}</span>
                </div>
              )}
            </div>
          )}

          {/* Monthly estimates */}
          {pricing.total > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-secondary">{formatCurrency(monthlyPayment)}</p>
                <p className="text-xs text-muted-foreground">Est. Monthly Payment*</p>
              </div>
              <div className="bg-success/10 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-success">{formatCurrency(estimatedRent)}</p>
                <p className="text-xs text-muted-foreground">Est. Rental Income</p>
              </div>
            </div>
          )}

          {/* Quick stats */}
          {currentStep > 3 && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {typeInfo && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span>{typeInfo.label}</span>
                </div>
              )}
              {(sizeInfo || config.sqft) && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary" />
                  <span>{sizeInfo?.sqft || config.sqft} sq ft</span>
                </div>
              )}
              {config.bedrooms !== undefined && (
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-primary" />
                  <span>{config.bedrooms === 0 ? "Studio" : `${config.bedrooms} Bed`}</span>
                </div>
              )}
              {config.bathrooms !== undefined && (
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-primary" />
                  <span>{config.bathrooms} Bath</span>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground mt-4 flex items-start gap-1">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            *Estimates for illustration. Final pricing after site assessment.
          </p>
        </CardContent>
      </Card>

      {/* Quick contact */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">Have questions? We're here to help.</p>
          <a href="tel:+18588330705">
            <Button variant="outline" className="w-full">
              <Phone className="h-4 w-4" />
              858-833-0705
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
