"use client";

import { useEffect, useRef, useState } from "react";
import { Map, Layers, Eye, EyeOff } from "lucide-react";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";

interface MapboxMapProps {
  analysisData: PropertyAnalysisResult;
}

type LayerVisibility = {
  parcel: boolean;
  structure: boolean;
  setbacks: boolean;
  buildable: boolean;
  aduZones: boolean;
};

export function MapboxMap({ analysisData }: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [layers, setLayers] = useState<LayerVisibility>({
    parcel: true,
    structure: true,
    setbacks: true,
    buildable: true,
    aduZones: true,
  });

  const geocoded = analysisData.geocoded;
  const visualization = analysisData.parcelVisualization;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainerRef.current || !geocoded || !token) {
      if (!token) setMapError(true);
      return;
    }

    let map: mapboxgl.Map;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;

        // Load Mapbox CSS via link tag (dynamic import of CSS not supported in Next.js build)
        if (!document.getElementById("mapbox-gl-css")) {
          const link = document.createElement("link");
          link.id = "mapbox-gl-css";
          link.rel = "stylesheet";
          link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
          document.head.appendChild(link);
        }

        mapboxgl.accessToken = token;

        map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: [geocoded.lng, geocoded.lat],
          zoom: 18,
          pitch: 0,
          bearing: 0,
          attributionControl: false,
        });

        mapRef.current = map;

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        // Add property marker
        new mapboxgl.Marker({ color: "#1EAEDB" })
          .setLngLat([geocoded.lng, geocoded.lat])
          .addTo(map);

        map.on("load", () => {
          setMapLoaded(true);
          addVisualizationLayers(map);
        });

        map.on("error", () => {
          setMapError(true);
        });
      } catch {
        setMapError(true);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocoded?.lat, geocoded?.lng, token]);

  const addVisualizationLayers = (map: mapboxgl.Map) => {
    if (!visualization) return;

    // Parcel boundary
    if (visualization.parcelBoundary) {
      map.addSource("parcel-boundary", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: visualization.parcelBoundary as GeoJSON.Geometry,
          properties: {},
        },
      });
      map.addLayer({
        id: "parcel-boundary-fill",
        type: "fill",
        source: "parcel-boundary",
        paint: {
          "fill-color": "#1EAEDB",
          "fill-opacity": 0.08,
        },
      });
      map.addLayer({
        id: "parcel-boundary-line",
        type: "line",
        source: "parcel-boundary",
        paint: {
          "line-color": "#1EAEDB",
          "line-width": 2.5,
          "line-dasharray": [2, 1],
        },
      });
    }

    // Structure footprint
    if (visualization.structureFootprint) {
      map.addSource("structure-footprint", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: visualization.structureFootprint as GeoJSON.Geometry,
          properties: {},
        },
      });
      map.addLayer({
        id: "structure-footprint-fill",
        type: "fill",
        source: "structure-footprint",
        paint: {
          "fill-color": "#4A5568",
          "fill-opacity": 0.35,
        },
      });
      map.addLayer({
        id: "structure-footprint-line",
        type: "line",
        source: "structure-footprint",
        paint: {
          "line-color": "#2D3748",
          "line-width": 1.5,
        },
      });
    }

    // Setback lines
    if (visualization.setbackLines.length > 0) {
      const setbackFeatures = visualization.setbackLines.map((line) => ({
        type: "Feature" as const,
        geometry: line as GeoJSON.Geometry,
        properties: {},
      }));
      map.addSource("setback-lines", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: setbackFeatures,
        },
      });
      map.addLayer({
        id: "setback-lines",
        type: "line",
        source: "setback-lines",
        paint: {
          "line-color": "#E53E3E",
          "line-width": 1.5,
          "line-dasharray": [4, 3],
        },
      });
    }

    // Buildable envelope
    if (visualization.buildableEnvelope) {
      map.addSource("buildable-envelope", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: visualization.buildableEnvelope as GeoJSON.Geometry,
          properties: {},
        },
      });
      map.addLayer({
        id: "buildable-envelope-fill",
        type: "fill",
        source: "buildable-envelope",
        paint: {
          "fill-color": "#38A169",
          "fill-opacity": 0.15,
        },
      });
      map.addLayer({
        id: "buildable-envelope-line",
        type: "line",
        source: "buildable-envelope",
        paint: {
          "line-color": "#38A169",
          "line-width": 2,
        },
      });
    }

    // ADU candidate zones (detached)
    if (visualization.detachedCandidateZones.length > 0) {
      const zoneFeatures = visualization.detachedCandidateZones.map((zone) => ({
        type: "Feature" as const,
        geometry: zone as GeoJSON.Geometry,
        properties: {},
      }));
      map.addSource("adu-zones", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: zoneFeatures,
        },
      });
      map.addLayer({
        id: "adu-zones-fill",
        type: "fill",
        source: "adu-zones",
        paint: {
          "fill-color": "#D69E2E",
          "fill-opacity": 0.25,
        },
      });
      map.addLayer({
        id: "adu-zones-line",
        type: "line",
        source: "adu-zones",
        paint: {
          "line-color": "#D69E2E",
          "line-width": 2,
          "line-dasharray": [3, 2],
        },
      });
    }
  };

  // Toggle layer visibility
  const toggleLayer = (layerKey: keyof LayerVisibility) => {
    setLayers((prev) => {
      const newLayers = { ...prev, [layerKey]: !prev[layerKey] };

      if (mapRef.current && mapLoaded) {
        const map = mapRef.current;
        const visibility = newLayers[layerKey] ? "visible" : "none";

        const layerMapping: Record<string, string[]> = {
          parcel: ["parcel-boundary-fill", "parcel-boundary-line"],
          structure: ["structure-footprint-fill", "structure-footprint-line"],
          setbacks: ["setback-lines"],
          buildable: ["buildable-envelope-fill", "buildable-envelope-line"],
          aduZones: ["adu-zones-fill", "adu-zones-line"],
        };

        const layerIds = layerMapping[layerKey] || [];
        for (const id of layerIds) {
          if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", visibility);
          }
        }
      }

      return newLayers;
    });
  };

  // Fallback: static map or placeholder
  if (mapError || !token) {
    return (
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-secondary">Property Map</h3>
          </div>
        </div>
        {analysisData.staticMapUrl ? (
          <div className="relative">
            <img
              src={analysisData.staticMapUrl}
              alt="Satellite view of property"
              className="w-full h-[300px] object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              Satellite View
            </div>
          </div>
        ) : geocoded ? (
          <a
            href={`https://www.google.com/maps/@${geocoded.lat},${geocoded.lng},18z`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="h-[300px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <div className="text-center">
                <Map className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click to view on Google Maps</p>
              </div>
            </div>
          </a>
        ) : (
          <div className="h-[300px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <p className="text-sm text-slate-400">Map unavailable</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-secondary">Parcel Visualization</h3>
          </div>
          {visualization && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {visualization.geometryConfidence}% geometry confidence
            </span>
          )}
        </div>
      </div>

      {/* Map container */}
      <div className="relative">
        <div ref={mapContainerRef} className="h-[350px] w-full" />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Layer controls */}
      {visualization && mapLoaded && (
        <div className="p-3 border-t border-border bg-slate-50/50">
          <div className="flex items-center gap-1 mb-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Layers</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "parcel" as const, label: "Parcel", color: "#1EAEDB" },
              { key: "structure" as const, label: "Structure", color: "#4A5568" },
              { key: "setbacks" as const, label: "Setbacks", color: "#E53E3E" },
              { key: "buildable" as const, label: "Buildable", color: "#38A169" },
              { key: "aduZones" as const, label: "ADU Zones", color: "#D69E2E" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                  layers[key]
                    ? "bg-white border border-border shadow-sm"
                    : "bg-slate-100 border border-transparent text-muted-foreground"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: layers[key] ? color : "#CBD5E0" }}
                />
                {label}
                {layers[key] ? (
                  <Eye className="h-2.5 w-2.5" />
                ) : (
                  <EyeOff className="h-2.5 w-2.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
