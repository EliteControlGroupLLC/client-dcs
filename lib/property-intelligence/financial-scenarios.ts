// Financial Scenario Engine — Cost, Loan, Cash Flow, ROI modeling
// Enhanced with RentCast market rent data when available

import type { FeasibilityResult, FinancialScenario } from "./jurisdictions/types";
import type { RentEstimate } from "./rentcast-service";

// Configurable assumptions (admin-adjustable in future)
const ASSUMPTIONS = {
  // Cost per sqft by type
  costPerSqft: {
    "Detached ADU": 425,
    "Attached ADU": 375,
    "Garage Conversion": 275,
    "JADU": 325,
  } as Record<string, number>,

  // Soft costs as % of build cost
  softCostPercent: 0.15,

  // Financing
  interestRate: 0.075, // 7.5%
  loanTermYears: 30,
  downPaymentPercent: 0.20,

  // Rental income per sqft/month (San Diego market)
  rentPerSqftMonth: {
    studio: 3.50,
    oneBed: 3.25,
    twoBed: 3.00,
  },

  // Property value add
  valueAddMultiplier: 1.3, // ADU typically adds 1.3x its cost in property value

  // Vacancy rate
  vacancyRate: 0.05,

  // Annual property tax rate on improvements
  propertyTaxRate: 0.011,

  // Annual insurance estimate per unit
  annualInsurance: 600,

  // Annual maintenance as % of build cost
  maintenancePercent: 0.01,
};

function estimateMonthlyRent(sqft: number): number {
  if (sqft <= 400) return Math.round(sqft * ASSUMPTIONS.rentPerSqftMonth.studio);
  if (sqft <= 700) return Math.round(sqft * ASSUMPTIONS.rentPerSqftMonth.oneBed);
  return Math.round(sqft * ASSUMPTIONS.rentPerSqftMonth.twoBed);
}

function calculateMonthlyPayment(loanAmount: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;
  if (monthlyRate === 0) return loanAmount / numPayments;
  return Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

/**
 * Generate financial scenarios for each feasible ADU type
 */
export function generateFinancialScenarios(
  feasibilityResults: FeasibilityResult[],
  rentEstimates?: Map<string, RentEstimate>
): FinancialScenario[] {
  const scenarios: FinancialScenario[] = [];

  // Only generate scenarios for feasible options
  const feasible = feasibilityResults.filter(
    (r) => r.feasibility === "likely" || r.feasibility === "possible"
  );

  for (const result of feasible) {
    // Use midpoint of size range
    const targetSqft = Math.round((result.minSizeSqft + result.maxSizeSqft) / 2);
    const costPerSqft = ASSUMPTIONS.costPerSqft[result.type] || 400;

    const buildCost = Math.round(targetSqft * costPerSqft);
    const softCost = Math.round(buildCost * ASSUMPTIONS.softCostPercent);
    const totalCost = buildCost + softCost;

    const downPayment = Math.round(totalCost * ASSUMPTIONS.downPaymentPercent);
    const loanAmount = totalCost - downPayment;
    const monthlyPayment = calculateMonthlyPayment(
      loanAmount,
      ASSUMPTIONS.interestRate,
      ASSUMPTIONS.loanTermYears
    );

    // Use RentCast estimate if available, otherwise fallback to internal estimate
    const rentCastEstimate = rentEstimates?.get(result.type);
    const monthlyRent = rentCastEstimate
      ? rentCastEstimate.estimatedMonthlyRent
      : estimateMonthlyRent(targetSqft);
    const effectiveMonthlyRent = Math.round(monthlyRent * (1 - ASSUMPTIONS.vacancyRate));

    // Annual expenses
    const annualTax = Math.round(totalCost * ASSUMPTIONS.propertyTaxRate);
    const annualMaintenance = Math.round(buildCost * ASSUMPTIONS.maintenancePercent);
    const annualExpenses = annualTax + ASSUMPTIONS.annualInsurance + annualMaintenance;
    const monthlyExpenses = Math.round(annualExpenses / 12);

    const monthlyCashflow = effectiveMonthlyRent - monthlyPayment - monthlyExpenses;
    const annualGrossIncome = effectiveMonthlyRent * 12;
    const annualNetCashflow = monthlyCashflow * 12;

    // ROI = annual net / total investment
    const roi = totalCost > 0 ? Math.round((annualNetCashflow / totalCost) * 1000) / 10 : 0;

    // Payback period
    const paybackYears = annualNetCashflow > 0
      ? Math.round((totalCost / annualNetCashflow) * 10) / 10
      : 99;

    // Value add estimate
    const valueAdd = Math.round(totalCost * ASSUMPTIONS.valueAddMultiplier);

    scenarios.push({
      scenarioName: `Standard ${result.type}`,
      scenarioType: result.type.toLowerCase().replace(/\s+/g, "-"),
      projectedUnits: 1,
      estimatedBuildCost: buildCost,
      estimatedSoftCost: softCost,
      estimatedTotalCost: totalCost,
      estimatedLoanAmount: loanAmount,
      estimatedDownPayment: downPayment,
      estimatedMonthlyPayment: monthlyPayment,
      estimatedMonthlyIncome: effectiveMonthlyRent,
      estimatedMonthlyCashflow: monthlyCashflow,
      estimatedAnnualGrossIncome: annualGrossIncome,
      estimatedAnnualNetCashflow: annualNetCashflow,
      estimatedRoi: roi,
      estimatedPaybackYears: paybackYears,
      estimatedValueAdd: valueAdd,
    });
  }

  // ── Maximize Property scenario (if multiple feasible) ──
  if (feasible.length >= 2) {
    const combined = scenarios.reduce(
      (acc, s) => ({
        buildCost: acc.buildCost + s.estimatedBuildCost,
        softCost: acc.softCost + s.estimatedSoftCost,
        totalCost: acc.totalCost + s.estimatedTotalCost,
        loanAmount: acc.loanAmount + s.estimatedLoanAmount,
        downPayment: acc.downPayment + s.estimatedDownPayment,
        monthlyPayment: acc.monthlyPayment + s.estimatedMonthlyPayment,
        monthlyIncome: acc.monthlyIncome + s.estimatedMonthlyIncome,
        monthlyCashflow: acc.monthlyCashflow + s.estimatedMonthlyCashflow,
        annualGross: acc.annualGross + s.estimatedAnnualGrossIncome,
        annualNet: acc.annualNet + s.estimatedAnnualNetCashflow,
        valueAdd: acc.valueAdd + s.estimatedValueAdd,
        units: acc.units + s.projectedUnits,
      }),
      {
        buildCost: 0, softCost: 0, totalCost: 0, loanAmount: 0,
        downPayment: 0, monthlyPayment: 0, monthlyIncome: 0,
        monthlyCashflow: 0, annualGross: 0, annualNet: 0, valueAdd: 0, units: 0,
      }
    );

    const combinedRoi = combined.totalCost > 0
      ? Math.round((combined.annualNet / combined.totalCost) * 1000) / 10
      : 0;
    const combinedPayback = combined.annualNet > 0
      ? Math.round((combined.totalCost / combined.annualNet) * 10) / 10
      : 99;

    scenarios.push({
      scenarioName: "Maximize This Property",
      scenarioType: "maximize",
      projectedUnits: combined.units,
      estimatedBuildCost: combined.buildCost,
      estimatedSoftCost: combined.softCost,
      estimatedTotalCost: combined.totalCost,
      estimatedLoanAmount: combined.loanAmount,
      estimatedDownPayment: combined.downPayment,
      estimatedMonthlyPayment: combined.monthlyPayment,
      estimatedMonthlyIncome: combined.monthlyIncome,
      estimatedMonthlyCashflow: combined.monthlyCashflow,
      estimatedAnnualGrossIncome: combined.annualGross,
      estimatedAnnualNetCashflow: combined.annualNet,
      estimatedRoi: combinedRoi,
      estimatedPaybackYears: combinedPayback,
      estimatedValueAdd: combined.valueAdd,
    });
  }

  return scenarios;
}
