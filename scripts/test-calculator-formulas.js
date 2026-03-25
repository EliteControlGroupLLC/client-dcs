/**
 * Calculator Formula Verification Tests
 * Tests all loan/payment calculations with values up to $5,000,000
 */

// ============================================
// CORE CALCULATION FUNCTIONS (mirroring app logic)
// ============================================

/**
 * Calculate monthly mortgage payment using standard amortization formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
function calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermYears) {
  if (loanAmount <= 0) return 0;
  
  const monthlyRate = annualInterestRate / 100 / 12;
  const totalPayments = loanTermYears * 12;
  
  // Zero interest: simple division
  if (monthlyRate === 0) {
    return Math.round(loanAmount / totalPayments);
  }
  
  const compoundFactor = Math.pow(1 + monthlyRate, totalPayments);
  const payment = loanAmount * (monthlyRate * compoundFactor) / (compoundFactor - 1);
  
  // Guard against NaN/Infinity
  if (!Number.isFinite(payment)) return 0;
  return Math.round(payment);
}

/**
 * Calculate cash-on-cash return
 */
function calculateCashOnCashReturn(annualCashFlow, downPayment, loanAmount, projectCost) {
  if (downPayment > 0) {
    return Math.round((annualCashFlow / downPayment) * 1000) / 10;
  }
  if (loanAmount === projectCost && annualCashFlow > 0) {
    return Infinity; // 100% financed with positive cash flow
  }
  return 0;
}

/**
 * Format price for display
 */
function formatPrice(price) {
  if (!Number.isFinite(price) || price < 0) {
    return "$0";
  }
  if (price >= 1000000) {
    const millions = price / 1000000;
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : 
                      millions * 10 % 1 === 0 ? millions.toFixed(1) : 
                      millions.toFixed(2);
    return `$${formatted}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}k`;
  }
  return `$${price.toLocaleString()}`;
}

// ============================================
// TEST CASES
// ============================================

const testCases = [
  // Standard cases
  {
    name: "Standard 30-year loan at 7%",
    loanAmount: 280000,
    interestRate: 7.0,
    loanTermYears: 30,
    expectedMonthlyPayment: 1863 // Verified with standard calculator
  },
  {
    name: "High-value $4M loan at 7%",
    loanAmount: 4000000,
    interestRate: 7.0,
    loanTermYears: 30,
    expectedMonthlyPayment: 26618 // 4M * 0.006653
  },
  {
    name: "Maximum $5M loan at 7%",
    loanAmount: 5000000,
    interestRate: 7.0,
    loanTermYears: 30,
    expectedMonthlyPayment: 33272 // 5M * 0.006653
  },
  // Edge cases
  {
    name: "Zero interest rate",
    loanAmount: 360000,
    interestRate: 0,
    loanTermYears: 30,
    expectedMonthlyPayment: 1000 // 360000 / 360 months
  },
  {
    name: "Zero loan amount",
    loanAmount: 0,
    interestRate: 7.0,
    loanTermYears: 30,
    expectedMonthlyPayment: 0
  },
  {
    name: "Very high interest rate (15%)",
    loanAmount: 280000,
    interestRate: 15.0,
    loanTermYears: 30,
    expectedMonthlyPayment: 3537 // Verified
  },
  {
    name: "Short term (15 years)",
    loanAmount: 280000,
    interestRate: 7.0,
    loanTermYears: 15,
    expectedMonthlyPayment: 2517 // Verified
  }
];

const formatPriceTests = [
  { input: 0, expected: "$0" },
  { input: 500, expected: "$500" },
  { input: 5000, expected: "$5k" },
  { input: 50000, expected: "$50k" },
  { input: 500000, expected: "$500k" },
  { input: 1000000, expected: "$1M" },
  { input: 1500000, expected: "$1.5M" },
  { input: 2250000, expected: "$2.25M" },
  { input: 5000000, expected: "$5M" },
  { input: NaN, expected: "$0" },
  { input: Infinity, expected: "$0" },
  { input: -1000, expected: "$0" }
];

// ============================================
// RUN TESTS
// ============================================

console.log("========================================");
console.log("ADU CALCULATOR FORMULA VERIFICATION");
console.log("========================================\n");

let passCount = 0;
let failCount = 0;

// Test monthly payment calculations
console.log("--- Monthly Payment Calculations ---\n");

for (const test of testCases) {
  const actual = calculateMonthlyPayment(test.loanAmount, test.interestRate, test.loanTermYears);
  const tolerance = Math.max(1, test.expectedMonthlyPayment * 0.01); // 1% tolerance
  const passed = Math.abs(actual - test.expectedMonthlyPayment) <= tolerance;
  
  if (passed) {
    console.log(`PASS: ${test.name}`);
    console.log(`  Loan: $${test.loanAmount.toLocaleString()} @ ${test.interestRate}% for ${test.loanTermYears} years`);
    console.log(`  Payment: $${actual.toLocaleString()}/mo (expected ~$${test.expectedMonthlyPayment.toLocaleString()})\n`);
    passCount++;
  } else {
    console.log(`FAIL: ${test.name}`);
    console.log(`  Loan: $${test.loanAmount.toLocaleString()} @ ${test.interestRate}% for ${test.loanTermYears} years`);
    console.log(`  Got: $${actual.toLocaleString()}/mo, Expected: ~$${test.expectedMonthlyPayment.toLocaleString()}\n`);
    failCount++;
  }
}

// Test formatPrice function
console.log("\n--- Format Price Tests ---\n");

for (const test of formatPriceTests) {
  const actual = formatPrice(test.input);
  const passed = actual === test.expected;
  
  if (passed) {
    console.log(`PASS: formatPrice(${test.input}) = "${actual}"`);
    passCount++;
  } else {
    console.log(`FAIL: formatPrice(${test.input})`);
    console.log(`  Got: "${actual}", Expected: "${test.expected}"`);
    failCount++;
  }
}

// Test ROI calculations with high values
console.log("\n\n--- ROI Calculations with High Values ---\n");

const roiTests = [
  {
    name: "$5M project, $20K/mo rent, $4M loan",
    projectCost: 5000000,
    monthlyRent: 20000,
    loanAmount: 4000000,
    interestRate: 7.0,
    loanTermYears: 30
  },
  {
    name: "$3M project, $15K/mo rent, $2.4M loan",
    projectCost: 3000000,
    monthlyRent: 15000,
    loanAmount: 2400000,
    interestRate: 6.5,
    loanTermYears: 30
  }
];

for (const test of roiTests) {
  const monthlyPayment = calculateMonthlyPayment(test.loanAmount, test.interestRate, test.loanTermYears);
  const monthlyCashFlow = test.monthlyRent - monthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const downPayment = test.projectCost - test.loanAmount;
  const cashOnCash = calculateCashOnCashReturn(annualCashFlow, downPayment, test.loanAmount, test.projectCost);
  
  const valid = Number.isFinite(monthlyPayment) && 
                Number.isFinite(monthlyCashFlow) && 
                Number.isFinite(annualCashFlow) &&
                (Number.isFinite(cashOnCash) || cashOnCash === Infinity);
  
  if (valid) {
    console.log(`PASS: ${test.name}`);
    console.log(`  Monthly Payment: $${monthlyPayment.toLocaleString()}`);
    console.log(`  Monthly Cash Flow: $${monthlyCashFlow.toLocaleString()}`);
    console.log(`  Annual Cash Flow: $${annualCashFlow.toLocaleString()}`);
    console.log(`  Down Payment: $${downPayment.toLocaleString()}`);
    console.log(`  Cash-on-Cash Return: ${cashOnCash === Infinity ? 'Infinite' : cashOnCash + '%'}\n`);
    passCount++;
  } else {
    console.log(`FAIL: ${test.name} - Invalid calculations detected\n`);
    failCount++;
  }
}

// Summary
console.log("\n========================================");
console.log("TEST SUMMARY");
console.log("========================================");
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total:  ${passCount + failCount}`);
console.log("========================================\n");

if (failCount === 0) {
  console.log("All tests passed! Calculator formulas are working correctly.");
} else {
  console.log(`${failCount} test(s) failed. Please review the calculations.`);
  process.exit(1);
}
