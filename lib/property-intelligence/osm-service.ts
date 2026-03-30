// OpenStreetMap Service - Queries real building footprints and parcel data
// Uses Overpass API (free, no account needed) and Nominatim for reverse geocoding

interface OSMBuilding {
  areaSqM: number;
  areaSqFt: number;
  levels?: number;
  height?: number;
  buildingType?: string;
  nodes: Array<{ lat: number; lon: number }>;
}

interface OSMParcelData {
  buildings: OSMBuilding[];
  totalBuildingFootprintSqFt: number;
  mainBuildingFootprintSqFt: number;
  mainBuildingAreaSqFt: number;
  mainBuildingLevels: number;
  landuse?: string;
  nearbyAmenities: string[];
}

export interface OSMPropertyData {
  parcel: OSMParcelData | null;
  nominatimAddress: string | null;
  nominatimType: string | null;
  osmId: string | null;
  boundingBox: [number, number, number, number] | null;
  confidence: number;
}

// Calculate polygon area using Shoelace formula with lat/lon
function calculatePolygonAreaSqM(nodes: Array<{ lat: number; lon: number }>): number {
  if (nodes.length < 3) return 0;

  // Convert to approximate meters using Mercator projection
  const refLat = nodes[0].lat;
  const latToM = 111320; // ~meters per degree latitude
  const lonToM = 111320 * Math.cos((refLat * Math.PI) / 180);

  const points = nodes.map((n) => ({
    x: (n.lon - nodes[0].lon) * lonToM,
    y: (n.lat - nodes[0].lat) * latToM,
  }));

  // Shoelace formula
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area) / 2;
}

const SQ_M_TO_SQ_FT = 10.7639;

// Query Overpass API for buildings near a coordinate
async function queryOverpassBuildings(
  lat: number,
  lng: number,
  radiusM: number = 50
): Promise<OSMBuilding[]> {
  const query = `
    [out:json][timeout:10];
    (
      way["building"](around:${radiusM},${lat},${lng});
      relation["building"](around:${radiusM},${lat},${lng});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) return [];

    const data = await response.json();
    const elements = data.elements || [];

    // Build node lookup
    const nodeMap = new Map<number, { lat: number; lon: number }>();
    for (const el of elements) {
      if (el.type === "node") {
        nodeMap.set(el.id, { lat: el.lat, lon: el.lon });
      }
    }

    // Extract buildings
    const buildings: OSMBuilding[] = [];
    for (const el of elements) {
      if (el.type === "way" && el.tags?.building) {
        const nodes: Array<{ lat: number; lon: number }> = [];
        for (const nodeId of el.nodes || []) {
          const node = nodeMap.get(nodeId);
          if (node) nodes.push(node);
        }

        if (nodes.length >= 3) {
          const areaSqM = calculatePolygonAreaSqM(nodes);
          const levels = el.tags["building:levels"]
            ? parseInt(el.tags["building:levels"], 10)
            : undefined;
          const height = el.tags.height
            ? parseFloat(el.tags.height)
            : undefined;

          buildings.push({
            areaSqM,
            areaSqFt: Math.round(areaSqM * SQ_M_TO_SQ_FT),
            levels: levels && !isNaN(levels) ? levels : undefined,
            height: height && !isNaN(height) ? height : undefined,
            buildingType: el.tags.building !== "yes" ? el.tags.building : undefined,
            nodes,
          });
        }
      }
    }

    return buildings;
  } catch {
    return [];
  }
}

// Query Nominatim for reverse geocoding and property info
async function queryNominatim(
  lat: number,
  lng: number
): Promise<{
  address: string | null;
  type: string | null;
  osmId: string | null;
  boundingBox: [number, number, number, number] | null;
}> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`,
      {
        headers: {
          "User-Agent": "DCS-ADU-Scanner/1.0 (https://distinctconstructionsolutions.com)",
        },
      }
    );

    if (!response.ok) return { address: null, type: null, osmId: null, boundingBox: null };

    const data = await response.json();

    const boundingBox: [number, number, number, number] | null = data.boundingbox
      ? [
          parseFloat(data.boundingbox[0]),
          parseFloat(data.boundingbox[1]),
          parseFloat(data.boundingbox[2]),
          parseFloat(data.boundingbox[3]),
        ]
      : null;

    return {
      address: data.display_name || null,
      type: data.type || null,
      osmId: data.osm_id ? `${data.osm_type}/${data.osm_id}` : null,
      boundingBox,
    };
  } catch {
    return { address: null, type: null, osmId: null, boundingBox: null };
  }
}

// Query Overpass for landuse near coordinates
async function queryLanduse(lat: number, lng: number): Promise<string | undefined> {
  const query = `
    [out:json][timeout:5];
    (
      way["landuse"](around:30,${lat},${lng});
      relation["landuse"](around:30,${lat},${lng});
    );
    out tags;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) return undefined;
    const data = await response.json();

    for (const el of data.elements || []) {
      if (el.tags?.landuse) return el.tags.landuse;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// Main function: Get all OSM property data for coordinates
export async function getOSMPropertyData(
  lat: number,
  lng: number
): Promise<OSMPropertyData> {
  // Run all queries in parallel
  const [buildings, nominatim, landuse] = await Promise.all([
    queryOverpassBuildings(lat, lng, 50),
    queryNominatim(lat, lng),
    queryLanduse(lat, lng),
  ]);

  if (buildings.length === 0) {
    return {
      parcel: null,
      nominatimAddress: nominatim.address,
      nominatimType: nominatim.type,
      osmId: nominatim.osmId,
      boundingBox: nominatim.boundingBox,
      confidence: 30,
    };
  }

  // Sort buildings by area (largest first) — the main building is likely the largest
  const sortedBuildings = [...buildings].sort((a, b) => b.areaSqFt - a.areaSqFt);
  const mainBuilding = sortedBuildings[0];

  // Calculate total footprint
  const totalFootprintSqFt = buildings.reduce((sum, b) => sum + b.areaSqFt, 0);

  // Estimate main building total area (footprint * levels)
  const levels = mainBuilding.levels || (mainBuilding.areaSqFt > 1500 ? 2 : 1);
  const mainBuildingAreaSqFt = mainBuilding.areaSqFt * levels;

  // Nearby amenities from Nominatim
  const nearbyAmenities: string[] = [];

  const parcel: OSMParcelData = {
    buildings: sortedBuildings,
    totalBuildingFootprintSqFt: totalFootprintSqFt,
    mainBuildingFootprintSqFt: mainBuilding.areaSqFt,
    mainBuildingAreaSqFt,
    mainBuildingLevels: levels,
    landuse,
    nearbyAmenities,
  };

  // Confidence is higher if we found buildings
  const confidence = buildings.length > 0 ? 78 : 30;

  return {
    parcel,
    nominatimAddress: nominatim.address,
    nominatimType: nominatim.type,
    osmId: nominatim.osmId,
    boundingBox: nominatim.boundingBox,
    confidence,
  };
}
