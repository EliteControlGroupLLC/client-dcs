// Geocoding Service - Uses Google Geocoding API to normalize addresses and get coordinates

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface GeocodingResult {
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
    geometry: {
      location: { lat: number; lng: number };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!GOOGLE_API_KEY) return null;

  try {
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
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId: result.place_id,
      components,
    };
  } catch {
    return null;
  }
}
