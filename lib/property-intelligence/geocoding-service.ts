// Geocoding Service — free/keyless by default.
//
// Priority: Google (only if a key is configured) → US Census geocoder
// (free, public-domain, storable, great for CA) → ArcGIS World Geocoder
// (free single-line lookups). Returns a stable GeocodingResult so the rest
// of the property-intelligence pipeline is unchanged.
//
// This replaces the old Google-only implementation that returned null with
// no key — which is what silently collapsed the whole real-data path and
// forced the engine into address-seeded fabrication.

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export type GeocodingProvider = "Google Geocoding" | "U.S. Census Geocoder" | "ArcGIS World Geocoder";

export interface GeocodingResult {
  /** Which geocoder actually produced this result (for honest source labels). */
  provider: GeocodingProvider;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
  components: {
    streetNumber?: string;
    route?: string;
    city?: string;
    county?: string;
    state?: string;
    zip?: string;
  };
}

interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string;
    place_id: string;
    geometry: { location: { lat: number; lng: number } };
    address_components: Array<{ long_name: string; short_name: string; types: string[] }>;
  }>;
  status: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // 1) Google, only if a key exists (best precision).
  if (GOOGLE_API_KEY) {
    const g = await geocodeGoogle(address).catch(() => null);
    if (g) return g;
  }
  // 2) US Census — free, keyless, storable, rooftop-ish for CA parcels.
  const census = await geocodeCensus(address).catch(() => null);
  if (census) return census;
  // 3) ArcGIS World Geocoder — free single-line fallback.
  const arcgis = await geocodeArcGIS(address).catch(() => null);
  if (arcgis) return arcgis;
  return null;
}

async function geocodeGoogle(address: string): Promise<GeocodingResult | null> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
  );
  if (!response.ok) return null;
  const data: GoogleGeocodingResponse = await response.json();
  if (data.status !== "OK" || data.results.length === 0) return null;
  const result = data.results[0];
  const components: GeocodingResult["components"] = {};
  for (const comp of result.address_components) {
    if (comp.types.includes("street_number")) components.streetNumber = comp.long_name;
    if (comp.types.includes("route")) components.route = comp.long_name;
    if (comp.types.includes("locality")) components.city = comp.long_name;
    if (comp.types.includes("administrative_area_level_2")) components.county = comp.long_name;
    if (comp.types.includes("administrative_area_level_1")) components.state = comp.short_name;
    if (comp.types.includes("postal_code")) components.zip = comp.long_name;
  }
  return {
    provider: "Google Geocoding",
    formattedAddress: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    placeId: result.place_id,
    components,
  };
}

interface CensusResponse {
  result?: {
    addressMatches?: Array<{
      matchedAddress?: string;
      coordinates?: { x: number; y: number };
      addressComponents?: {
        city?: string;
        state?: string;
        zip?: string;
        streetName?: string;
        fromAddress?: string;
      };
    }>;
  };
}

async function geocodeCensus(address: string): Promise<GeocodingResult | null> {
  const url =
    `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress` +
    `?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&format=json`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data: CensusResponse = await response.json();
  const match = data.result?.addressMatches?.[0];
  if (!match?.coordinates) return null;
  const c = match.addressComponents ?? {};
  return {
    provider: "U.S. Census Geocoder",
    formattedAddress: match.matchedAddress ?? address,
    lat: match.coordinates.y, // Census x=lng, y=lat
    lng: match.coordinates.x,
    placeId: `census:${match.coordinates.y},${match.coordinates.x}`,
    components: {
      streetNumber: c.fromAddress,
      route: c.streetName,
      city: c.city,
      state: c.state,
      zip: c.zip,
    },
  };
}

interface ArcGISResponse {
  candidates?: Array<{
    address?: string;
    location?: { x: number; y: number };
    attributes?: { City?: string; RegionAbbr?: string; Postal?: string; Subregion?: string };
  }>;
}

async function geocodeArcGIS(address: string): Promise<GeocodingResult | null> {
  const url =
    `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates` +
    `?SingleLine=${encodeURIComponent(address)}&outFields=City,RegionAbbr,Postal,Subregion&maxLocations=1&f=json`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data: ArcGISResponse = await response.json();
  const cand = data.candidates?.[0];
  if (!cand?.location) return null;
  const a = cand.attributes ?? {};
  return {
    provider: "ArcGIS World Geocoder",
    formattedAddress: cand.address ?? address,
    lat: cand.location.y,
    lng: cand.location.x,
    placeId: `arcgis:${cand.location.y},${cand.location.x}`,
    components: {
      city: a.City,
      county: a.Subregion,
      state: a.RegionAbbr,
      zip: a.Postal,
    },
  };
}
