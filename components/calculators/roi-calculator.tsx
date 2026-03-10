"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Calendar, Home, DollarSign } from "lucide-react";

export function ROICalculator() {
  const [buildCost, setBuildCost] = useState(180000);
  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [propertyValue, setPropertyValue] = useState(800000);
  const [appreciationRate, setAppreciationRate] = useState(5);

  const results = useMemo(() => {
    const annualRent = monthlyRent * 12;
    const expenseRate = 0.25; // 25% for maintenance, vacancy, etc.
    const netAnnualIncome = annualRent * (1 - expenseRate);
    
    // Payback period
    const paybackYears = buildCost / netAnnualIncome;
    
    // Property value increase (ADUs typically add 20-30% of build cost to property value)
    const immediateValueAdd = buildCost * 0.7;
    const newPropertyValue = propertyValue + immediateValueAdd;
    
    // 5-year projection
    const yearlyAppreciation = appreciationRate / 100;
    const fiveYearValue = newPropertyValue * Math.pow(1 + yearlyAppreciation, 5);
    const fiveYearIncome = netAnnualIncome * 5;
    const fiveYearROI = ((fiveYearIncome + (fiveYearValue - newPropertyValue)) / buildCost) * 100;
    
    // Annual ROI
    const annualROI = (netAnnualIncome / buildCost) * 100;

    return {
      paybackYears: paybackYears.toFixed(1),
      annualROI: annualROI.toFixed(1),
      netAnnualIncome: Math.round(netAnnualIncome),
      immediateValueAdd: Math.round(immediateValueAdd),
      newPropertyValue: Math.round(newPropertyValue),
      fiveYearValue: Math.round(fiveYearValue),
      fiveYearROI: fiveYearROI.toFixed(1),
      fiveYearIncome: Math.round(fiveYearIncome),
    };
  }, [buildCost, monthlyRent, propertyValue, appreciationRate]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-secondary flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          ADU ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Inputs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              ADU Build Cost
            </label>
            <Input
              type="number"
              value={buildCost}
              onChange={(e) => setBuildCost(Number(e.target.value))}
              className="text-lg"
            />
            <input
              type="range"
              value={buildCost}
              onChange={(e) => setBuildCost(Number(e.target.value))}
              min={50000}
              max={400000}
              step={5000}
              className="w-full mt-2 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Expected Monthly Rent
            </label>
            <Input
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              className="text-lg"
            />
            <input
              type="range"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              min={1000}
              max={5000}
              step={100}
              className="w-full mt-2 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              <Home className="inline h-4 w-4 mr-1" />
              Current Property Value
            </label>
            <Input
              type="number"
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              className="text-lg"
            />
            <input
              type="range"
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              min={300000}
              max={2000000}
              step={25000}
              className="w-full mt-2 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Annual Appreciation Rate
            </label>
            <div className="flex gap-2">
              {[3, 4, 5, 6, 7].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setAppreciationRate(rate)}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                    appreciationRate === rate
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Payback Period</div>
            <div className="text-3xl font-bold text-primary">{results.paybackYears}</div>
            <div className="text-sm text-muted-foreground">years</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Annual ROI</div>
            <div className="text-3xl font-bold text-green-600">{results.annualROI}%</div>
            <div className="text-sm text-muted-foreground">cash-on-cash</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Net Annual Income</div>
            <div className="text-3xl font-bold text-blue-600">${(results.netAnnualIncome / 1000).toFixed(0)}k</div>
            <div className="text-sm text-muted-foreground">after expenses</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Value Added</div>
            <div className="text-3xl font-bold text-orange-600">+${(results.immediateValueAdd / 1000).toFixed(0)}k</div>
            <div className="text-sm text-muted-foreground">immediate</div>
          </div>
        </div>

        {/* 5-Year Projection */}
        <div className="bg-secondary rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            5-Year Investment Projection
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-white/70 mb-1">Total Rental Income</div>
              <div className="text-2xl font-bold">${results.fiveYearIncome.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-white/70 mb-1">Property Value</div>
              <div className="text-2xl font-bold">${results.fiveYearValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-white/70 mb-1">Total ROI</div>
              <div className="text-2xl font-bold text-primary">{results.fiveYearROI}%</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
            Get Your Personalized ROI Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
