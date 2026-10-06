#!/usr/bin/env node
/**
 * Offline check of the ADU report's rent rule.
 *
 * RENTCAST_API_KEY is not available in every environment, and we never want the
 * correctness of a client-facing number to depend on a live third-party call.
 * Everything below runs against fixtures shaped exactly like RentCast's
 * documented /avm/rent/long-term response (comparables[] carrying `price`,
 * `bedrooms`, `squareFootage` and `distance` in MILES).
 *
 *   node scripts/test-rent-resolution.mjs
 *
 * It compiles the pure modules with the project's own TypeScript, so a type
 * error fails the run too.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const root = new URL("..", import.meta.url).pathname;
const out = mkdtempSync(join(tmpdir(), "rent-check-"));

let pass = 0;
function check(name, fn) {
  fn();
  pass += 1;
  console.log(`  ok  ${name}`);
}

try {
  execFileSync(
    "npx",
    [
      "tsc",
      "lib/property-intelligence/rent-resolution.ts",
      "lib/property-intelligence/rentcast-service.ts",
      "--module", "commonjs",
      "--target", "es2020",
      "--moduleResolution", "node",
      "--skipLibCheck",
      "--esModuleInterop",
      "--outDir", out,
    ],
    { cwd: root, stdio: "inherit" },
  );

  const resolution = await import(pathToFileURL(join(out, "property-intelligence/rent-resolution.js")));
  const rentcast = await import(pathToFileURL(join(out, "property-intelligence/rentcast-service.js")));
  const siteData = await import(pathToFileURL(join(out, "data/site-data.js")));

  const { resolveRent } = resolution;
  const { selectConfigurationComps, medianRent, MARKET_RENT_MIN_COMPS } = rentcast;
  const { NEW_CONSTRUCTION_RENT_PREMIUM, getRentEstimate, findRentAssumption } = siteData;
  const siteDataWindow = siteData.comparableSizeWindow;

  // A RentCast-shaped comparables array for a 1,200 sq ft 3-bed/2-bath subject.
  // Window at 0.85-1.20 of 1,200 = 1,020-1,440 sq ft.
  const SUBJECT_SQFT = 1200;
  const win = siteDataWindow(SUBJECT_SQFT, false);
  const wideWin = siteDataWindow(SUBJECT_SQFT, true);

  const rawComps = [
    { formattedAddress: "1 A St", price: 4200, bedrooms: 3, bathrooms: 2, squareFootage: 1100, distance: 0.31 },
    { formattedAddress: "2 B St", price: 4600, bedrooms: 3, bathrooms: 2, squareFootage: 1250, distance: 0.62 },
    { formattedAddress: "3 C St", price: 5400, bedrooms: 3, bathrooms: 2.5, squareFootage: 1400, distance: 0.88 },
    // too small for a 1,200 sq ft subject - this is the kind of comp that was
    // dragging the reported rent down to $3,950
    { formattedAddress: "4 TooSmall St", price: 3400, bedrooms: 3, bathrooms: 2, squareFootage: 800, distance: 0.15 },
    // too big
    { formattedAddress: "5 TooBig St", price: 6800, bedrooms: 3, bathrooms: 3, squareFootage: 1500, distance: 0.4 },
    // right size, wrong bedroom count
    { formattedAddress: "6 WrongBeds St", price: 2500, bedrooms: 1, bathrooms: 1, squareFootage: 1150, distance: 0.2 },
    // right size and beds, but out past a mile
    { formattedAddress: "7 Far St", price: 5200, bedrooms: 3, bathrooms: 2, squareFootage: 1300, distance: 2.4 },
    // no distance reported - cannot be proven near
    { formattedAddress: "8 NoDist St", price: 4800, bedrooms: 3, bathrooms: 2, squareFootage: 1200, distance: undefined },
    // no square footage reported - cannot be proven in the window
    { formattedAddress: "9 NoSize St", price: 4900, bedrooms: 3, bathrooms: 2, distance: 0.5 },
  ];

  const pick = (opts) => selectConfigurationComps(rawComps, { bedrooms: 3, sizeWindow: win, ...opts });

  console.log("\nComp selection: configuration AND comparable size");

  check("the size window for a 1,200 sq ft subject is 1,020-1,440 sq ft", () => {
    assert.deepEqual(win, { minSqFt: 1020, maxSqFt: 1440 });
  });

  check("an 800 sq ft 3-bed is NOT a comparable for a 1,200 sq ft 3-bed", () => {
    const comps = pick({ radiusMiles: 1 });
    assert.ok(!comps.some((c) => c.address === "4 TooSmall St"));
  });

  check("a 1,400 sq ft 3-bed IS a comparable", () => {
    const comps = pick({ radiusMiles: 1 });
    assert.ok(comps.some((c) => c.address === "3 C St"));
  });

  check("a 1,500 sq ft 3-bed does not qualify", () => {
    const comps = pick({ radiusMiles: 1 });
    assert.ok(!comps.some((c) => c.address === "5 TooBig St"));
  });

  check("right size, wrong bedroom count is still excluded", () => {
    const comps = pick({ radiusMiles: 1 });
    assert.ok(!comps.some((c) => c.address === "6 WrongBeds St"));
  });

  check("a comp beyond the radius is excluded until the radius widens", () => {
    assert.ok(!pick({ radiusMiles: 1 }).some((c) => c.address === "7 Far St"));
    assert.ok(pick({ radiusMiles: 3 }).some((c) => c.address === "7 Far St"));
  });

  check("a comp with no reported distance is dropped, never assumed near", () => {
    assert.ok(!pick({ radiusMiles: 5 }).some((c) => c.address === "8 NoDist St"));
  });

  check("a comp with no reported size is dropped unless unsized are allowed", () => {
    assert.ok(!pick({ radiusMiles: 1 }).some((c) => c.address === "9 NoSize St"));
    assert.ok(pick({ radiusMiles: 1, allowUnsized: true }).some((c) => c.address === "9 NoSize St"));
  });

  check("allowing unsized comps does NOT re-admit the 800 sq ft one", () => {
    const comps = pick({ radiusMiles: 3, allowUnsized: true });
    assert.ok(!comps.some((c) => c.address === "4 TooSmall St"));
    assert.ok(!comps.some((c) => c.address === "5 TooBig St"));
  });

  check("the widened size window re-admits 800 and 1,500 (last resort only)", () => {
    assert.deepEqual(wideWin, { minSqFt: 840, maxSqFt: 1680 });
    const comps = selectConfigurationComps(rawComps, { bedrooms: 3, radiusMiles: 1, sizeWindow: wideWin });
    assert.ok(comps.some((c) => c.address === "5 TooBig St"));
    // 800 is still below even the widened floor of 840 - the band widens, it does
    // not disappear
    assert.ok(!comps.some((c) => c.address === "4 TooSmall St"));
  });

  check("the 800 sq ft comp no longer drags the median down", () => {
    const comps = pick({ radiusMiles: 1 });
    assert.deepEqual(comps.map((c) => c.address), ["1 A St", "2 B St", "3 C St"]);
    assert.equal(medianRent(comps), 4600);
  });

  console.log("\nTruthCore rent table — bedrooms AND nearest size");

  check("a 3-bed detached matches a 3-bed row, not the nearest square footage", () => {
    // 1,000 sq ft rows exist for 2-bed only; a 3-bed at 1,000 must not take it.
    const row = findRentAssumption(1000, "Detached ADU", 3);
    assert.equal(row.bedrooms, 3);
  });

  check("bedrooms AND nearest size: the two 3-bed rows stay distinct", () => {
    // The owner keeps these deliberately different - do not collapse them.
    assert.deepEqual(getRentEstimate(1200, "Detached ADU", 3), { low: 5000, high: 6000 });
    assert.deepEqual(getRentEstimate(900, "Detached ADU", 3), { low: 3900, high: 4700 });
  });

  console.log("\nThe rule: comps lead, premium on top, the table is the floor");

  const table3Bed1200 = getRentEstimate(1200, "Detached ADU", 3); // 5000-6000

  check("comps + premium above the floor -> comp-driven figure", () => {
    const market = {
      status: "ok",
      result: {
        monthlyRent: 4800, rentRangeLow: 4400, rentRangeHigh: 5400,
        comparableCount: 6, comparables: [], basis: "", radiusMiles: 1,
        widened: false, bedrooms: 3, sizeWindow: { minSqFt: 1020, maxSqFt: 1440 },
        sizeBandWidened: false, includesUnsizedComps: false, source: "RentCast rent AVM",
      },
    };
    const r = resolveRent({ market, truthcoreRange: table3Bed1200, bedrooms: 3, bathrooms: 2 });
    assert.equal(r.basis, "verified-comps");
    // 4800 * 1.15 = 5520 -> nearest $50
    assert.equal(r.monthlyRent, Math.round((4800 * (1 + NEW_CONSTRUCTION_RENT_PREMIUM)) / 50) * 50);
    assert.ok(r.monthlyRent > 4800, "premium must raise the comp median");
    assert.ok(r.rentRangeLow >= table3Bed1200.low, "the bottom of the range never dips below the floor");
    assert.match(r.explanation, /verified/i);
  });

  check("comps + premium BELOW the floor -> the owner's own range, and it says so", () => {
    const market = {
      status: "ok",
      result: {
        monthlyRent: 3500, rentRangeLow: 3200, rentRangeHigh: 3900,
        comparableCount: 4, comparables: [], basis: "", radiusMiles: 1,
        widened: false, bedrooms: 3, sizeWindow: { minSqFt: 1020, maxSqFt: 1440 },
        sizeBandWidened: false, includesUnsizedComps: false, source: "RentCast rent AVM",
      },
    };
    const r = resolveRent({ market, truthcoreRange: table3Bed1200, bedrooms: 3, bathrooms: 2 });
    assert.equal(r.basis, "truthcore-floor");
    assert.equal(r.rentRangeLow, 5000);
    assert.equal(r.rentRangeHigh, 6000);
    assert.equal(r.monthlyRent, 5500);
    assert.match(r.explanation, /below what our own/i);
  });

  check("too few comps nearby -> the owner's range, and the report says how few", () => {
    const r = resolveRent({
      market: { status: "insufficient", qualifyingCount: 2, radiusMiles: 3, bedrooms: 3,
        sizeWindow: { minSqFt: 840, maxSqFt: 1680 } },
      truthcoreRange: table3Bed1200, bedrooms: 3, bathrooms: 2,
    });
    assert.equal(r.basis, "truthcore-table");
    assert.equal(r.comparableCount, 0);
    assert.equal(r.monthlyRent, 5500);
    assert.match(r.explanation, /only 2 within 3 miles/);
  });

  check("no RentCast at all -> the owner's range, nothing claimed as market data", () => {
    const r = resolveRent({
      market: { status: "unavailable", reason: "RentCast API key not configured" },
      truthcoreRange: table3Bed1200, bedrooms: 3, bathrooms: 2,
    });
    assert.equal(r.basis, "truthcore-table");
    assert.equal(r.monthlyRent, 5500);
    assert.ok(!/RentCast/.test(r.explanation), "client copy must not name a provider that gave us nothing");
  });

  check("a widened search is disclosed in the client copy", () => {
    const market = {
      status: "ok",
      result: {
        monthlyRent: 5000, rentRangeLow: 4800, rentRangeHigh: 5600,
        comparableCount: MARKET_RENT_MIN_COMPS, comparables: [], basis: "",
        radiusMiles: 3, widened: true, bedrooms: 3, sizeWindow: { minSqFt: 1020, maxSqFt: 1440 },
        sizeBandWidened: false, includesUnsizedComps: false, source: "RentCast rent AVM",
      },
    };
    const r = resolveRent({ market, truthcoreRange: table3Bed1200, bedrooms: 3, bathrooms: 2 });
    assert.match(r.explanation, /look out to 3 miles/);
  });

  check("the resolved figure is one number, consistent across range and headline", () => {
    const market = {
      status: "ok",
      result: {
        monthlyRent: 4800, rentRangeLow: 4400, rentRangeHigh: 5400,
        comparableCount: 6, comparables: [], basis: "", radiusMiles: 1,
        widened: false, bedrooms: 3, sizeWindow: { minSqFt: 1020, maxSqFt: 1440 },
        sizeBandWidened: false, includesUnsizedComps: false, source: "RentCast rent AVM",
      },
    };
    const r = resolveRent({ market, truthcoreRange: table3Bed1200, bedrooms: 3, bathrooms: 2 });
    assert.ok(r.monthlyRent >= r.rentRangeLow && r.monthlyRent <= r.rentRangeHigh,
      `headline ${r.monthlyRent} must sit inside ${r.rentRangeLow}-${r.rentRangeHigh}`);
  });

  console.log(`\n${pass} checks passed.`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
