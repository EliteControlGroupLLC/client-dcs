import { MapPin, ExternalLink } from "lucide-react";

interface MapPreviewProps {
  address: string;
}

export function MapPreview({ address }: MapPreviewProps) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-muted to-border/30">
        {/* Map placeholder - grid pattern to simulate map */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(15,42,74,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,42,74,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }} />

        {/* Simulated streets */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-secondary/10" />
        <div className="absolute top-0 bottom-0 left-1/3 w-[2px] bg-secondary/10" />
        <div className="absolute top-0 bottom-0 right-1/4 w-[2px] bg-secondary/10" />
        <div className="absolute left-0 right-0 top-1/4 h-[2px] bg-secondary/10" />

        {/* Pin marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/20 animate-ping absolute inset-0" />
            <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Parcel outline */}
        <div className="absolute top-[35%] left-[38%] w-[24%] h-[30%] border-2 border-primary/40 bg-primary/5 rounded-sm" />
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
