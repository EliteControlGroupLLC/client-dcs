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

  // A RentCast-shaped comparables array: a mix of bedroom counts and distances.
  const rawComps = [
    { formattedAddress: "1 A St", price: 4200, bedrooms: 3, bathrooms: 2, squareFootage: 1100, distance: 0.31 },
    { formattedAddress: "2 B St", price: 4600, bedrooms: 3, bathrooms: 2, squareFootage: 1450, distance: 0.62 },
    { formattedAddress: "3 C St", price: 4400, bedrooms: 3, bathrooms: 2.5, squareFootage: 900, distance: 0.88 },
    { formattedAddress: "4 D St", price: 2500, bedrooms: 1, bathrooms: 1, squareFootage: 600, distance: 0.2 },
    { formattedAddress: "5 E St", price: 5200, bedrooms: 3, bathrooms: 2, squareFootage: 1600, distance: 2.4 },
    { formattedAddress: "6 F St", price: 4800, bedrooms: 3, bathrooms: 2, squareFootage: 1200, distance: undefined },
  ];

  console.log("\nComp selection");

  check("keeps only the same bedroom count, inside the radius", () => {
    const comps = selectConfigurationComps(rawComps, { bedrooms: 3, radiusMiles: 1 });
    assert.deepEqual(comps.map((c) => c.address), ["1 A St", "2 B St", "3 C St"]);
  });

  check("square footage never disqualifies a comp (900 and 1,450 both kept)", () => {
    const comps = selectConfigurationComps(rawComps, { bedrooms: 3, radiusMiles: 1 });
    const sizes = comps.map((c) => c.squareFootage).sort((a, b) => a - b);
    assert.deepEqual(sizes, [900, 1100, 1450]);
  });

  check("drops a comp with no reported distance rather than assuming it is near", () => {
    const comps = selectConfigurationComps(rawComps, { bedrooms: 3, radiusMiles: 5 });
    assert.ok(!comps.some((c) => c.address === "6 F St"));
  });

  check("widening to 3 miles pulls in the 2.4-mile comp", () => {
    const comps = selectConfigurationComps(rawComps, { bedrooms: 3, radiusMiles: 3 });
    assert.ok(comps.some((c) => c.address === "5 E St"));
  });

  check("median is a real comp rent, not an interpolation", () => {
    const comps = selectConfigurationComps(rawComps, { bedrooms: 3, radiusMiles: 1 });
    assert.equal(medianRent(comps), 4400);
  });

  console.log("\nTruthCore rent table — configuration first, size only breaks ties");

  check("a 3-bed detached matches a 3-bed row, not the nearest square footage", () => {
    // 1,000 sq ft rows exist for 2-bed only; a 3-bed at 1,000 must not take it.
    const row = findRentAssumption(1000, "Detached ADU", 3);
    assert.equal(row.bedrooms, 3);
  });

  check("1,200 sq ft 3-bed detached is the owner's $5,000-$6,000 row", () => {
    assert.deepEqual(getRentEstimate(1200, "Detached ADU", 3), { low: 5000, high: 6000 });
  });

  console.log("\nThe rule: comps lead, premium on top, the table is the floor");

  const table3Bed1200 = getRentEstimate(1200, "Detached ADU", 3); // 5000-6000

  check("comps + premium above the floor -> comp-driven figure", () => {
    const market = {
      status: "ok",
      result: {
        monthlyRent: 4800, rentRangeLow: 4400, rentRangeHigh: 5400,
        comparableCount: 6, comparables: [], basis: "", radiusMiles: 1,
        widened: false, bedrooms: 3, source: "RentCast rent AVM",
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
        widened: false, bedrooms: 3, source: "RentCast rent AVM",
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
      market: { status: "insufficient", qualifyingCount: 2, radiusMiles: 3, bedrooms: 3 },
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
        radiusMiles: 3, widened: true, bedrooms: 3, source: "RentCast rent AVM",
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
        widened: false, bedrooms: 3, source: "RentCast rent AVM",
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
