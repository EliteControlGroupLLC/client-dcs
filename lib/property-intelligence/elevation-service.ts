// Elevation Service - Uses Google Elevation API for real terrain/slope data

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

interface ElevationResult {
  slope: string;
  confidence: number;
  sources: string[];
}

interface GoogleElevationResponse {
  results: Array<{
    elevation: number;
    location: { lat: number; lng: number };
    resolution: number;
  }>;
  status: string;
}

export async function getElevationData(lat: number, lng: number): Promise<ElevationResult> {
  if (!GOOGLE_API_KEY) {
    return {
      slope: "Mostly flat",
      confidence: 40,
      sources: ["Default estimate"],
    };
  }

  try {
    // Sample 5 points around the property (center + 4 cardinal directions ~30m away)
    const offset = 0.0003; // ~30 meters
    const locations = [
      `${lat},${lng}`,
      `${lat + offset},${lng}`,
      `${lat - offset},${lng}`,
      `${lat},${lng + offset}`,
      `${lat},${lng - offset}`,
    ].join("|");

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Elevation API error: ${response.status}`);
    }

    const data: GoogleElevationResponse = await response.json();

    if (data.status !== "OK" || data.results.length < 5) {
      throw new Error("Insufficient elevation data");
    }

    const elevations = data.results.map((r) => r.elevation);
    const center = elevations[0];
    const maxDiff = Math.max(...elevations.map((e) => Math.abs(e - center)));

    // Calculate approximate slope percentage over ~30m
    const slopePercent = (maxDiff / 30) * 100;

    let slope: string;
    if (slopePercent < 2) {
      slope = "Flat";
    } else if (slopePercent < 5) {
      slope = "Mostly flat";
    } else if (slopePercent < 15) {
      slope = "Moderate slope";
    } else {
      slope = "Steep slope";
    }

    const resolution = data.results[0].resolution;
    // Higher resolution = more confidence
    const confidence = resolution < 10 ? 82 : resolution < 30 ? 72 : 58;

    return {
      slope,
      confidence,
      sources: ["Google Elevation API"],
    };
  } catch {
    return {
      slope: "Mostly flat",
      confidence: 40,
      sources: ["Default estimate (API unavailable)"],
    };
  }
}
