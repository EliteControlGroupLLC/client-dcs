import { MapPin, ExternalLink } from "lucide-react";

interface MapPreviewProps {
  address: string;
}

export function MapPreview({ address }: MapPreviewProps) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* No map imagery is available for this report — say so rather than
          drawing a fake map, streets or parcel outline. */}
      <div className="h-24 bg-muted/50 flex flex-col items-center justify-center gap-1 text-center px-4">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Map imagery not available — open the address in Google Maps</p>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Property Location</p>
            <p className="text-sm font-semibold text-secondary truncate">{address}</p>
          </div>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
          >
            View Map
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
