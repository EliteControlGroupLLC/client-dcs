// Benchmark Testing API Route
// SURGICAL FIX: Wires the existing benchmark-testing-service.ts to an API route.
// Allows running benchmark suite from admin UI.

import { NextRequest, NextResponse } from "next/server";
import {
  runBenchmarkSuite,
  runSingleBenchmark,
  getBenchmarkProperties,
} from "@/lib/property-intelligence/benchmark-testing-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, address } = body;

    if (mode === "single" && address) {
      console.log(`[BENCHMARK] Running single benchmark for: ${address}`);
      const result = await runSingleBenchmark(address);
      return NextResponse.json({ success: true, result });
    }

    if (mode === "suite") {
      console.log("[BENCHMARK] Running full benchmark suite...");
      const result = await runBenchmarkSuite();
      console.log(`[BENCHMARK] Suite complete: ${result.passRate}% pass rate, ${result.totalExecutionTimeMs}ms`);
      return NextResponse.json({ success: true, result });
    }

    if (mode === "list") {
      const properties = getBenchmarkProperties();
      return NextResponse.json({ success: true, properties });
    }

    return NextResponse.json(
      { error: "Invalid mode. Use 'suite', 'single', or 'list'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[BENCHMARK] Error:", error);
    return NextResponse.json(
      {
        error: "Benchmark failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const properties = getBenchmarkProperties();
    return NextResponse.json({
      success: true,
      properties,
      count: properties.length,
    });
  } catch (error) {
    console.error("[BENCHMARK] Error:", error);
    return NextResponse.json(
      { error: "Failed to list benchmark properties" },
      { status: 500 }
    );
  }
}
