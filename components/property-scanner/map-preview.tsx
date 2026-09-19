import { MapPin, ExternalLink } from "lucide-react";

interface MapPreviewProps {
  address: string;
}

export function MapPreview({ address }: MapPreviewProps) {
  return (
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 overflow-hidden">
      {/* No map imagery is available for this report — say so rather than
          drawing a fake map, streets or parcel outline. */}
      <div className="h-24 bg-secondary flex flex-col items-center justify-center gap-1 text-center px-4">
        <MapPin className="h-5 w-5 text-white/75" />
        <p className="text-xs text-white/75">Map imagery not available — open the address in Google Maps</p>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-white/75">Property Location</p>
            <p className="text-sm font-semibold text-white truncate">{address}</p>
          </div>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-light hover:underline flex-shrink-0"
          >
            View Map
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
