"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

// Minimal type declarations for the new Google Places API (AutocompleteSuggestion)
declare global {
  interface Window {
    google?: {
      maps: {
        importLibrary: (name: string) => Promise<GooglePlacesLibrary>;
      };
    };
    initGoogleMaps?: () => void;
  }
}

interface GooglePlacesLibrary {
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (
      request: GoogleAutocompleteRequest
    ) => Promise<{ suggestions: GoogleAutocompleteSuggestion[] }>;
  };
}

interface GoogleAutocompleteRequest {
  input: string;
  includedRegionCodes?: string[];
  includedPrimaryTypes?: string[];
  sessionToken?: GoogleSessionToken;
}

interface GoogleSessionToken {
  // Opaque token type
}

interface GoogleAutocompleteSuggestion {
  placePrediction?: {
    placeId: string;
    text: { text: string };
    structuredFormat?: {
      mainText: { text: string };
      secondaryText: { text: string };
    };
  };
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.importLibrary) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      return;
    }

    if (!GOOGLE_API_KEY) {
      reject(new Error("Google Places API key not configured"));
      return;
    }

    window.initGoogleMaps = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string) => void;
  placeholder?: string;
  /** Form-field sizing (matches other inputs in a form) instead of the large hero search box. */
  compact?: boolean;
  /** Show error styling (compact mode). */
  invalid?: boolean;
  id?: string;
}

export function AddressAutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "Enter your property address",
  compact = false,
  invalid = false,
  id,
}: AddressAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [useGoogleApi, setUseGoogleApi] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLibRef = useRef<GooglePlacesLibrary | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Google Maps core and then import the Places library
  useEffect(() => {
    if (!GOOGLE_API_KEY) return;

    loadGoogleMapsScript()
      .then(async () => {
        if (window.google?.maps?.importLibrary) {
          const placesLib = await window.google.maps.importLibrary("places") as GooglePlacesLibrary;
          if (placesLib.AutocompleteSuggestion) {
            placesLibRef.current = placesLib;
            setUseGoogleApi(true);
          }
        }
      })
      .catch(() => {
        setUseGoogleApi(false);
      });
  }, []);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Google Places when a working key is configured; any error or empty result
  // (e.g. billing disabled -> PERMISSION_DENIED) falls through to the keyless
  // search so the box never goes blank.
  const searchWithGoogle = useCallback(async (inputValue: string): Promise<boolean> => {
    if (!placesLibRef.current) return false;
    try {
      const { suggestions: results } =
        await placesLibRef.current.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: inputValue,
          includedRegionCodes: ["us"],
          includedPrimaryTypes: ["street_address", "subpremise", "premise"],
        });

      const addresses = results
        .filter((s) => s.placePrediction?.text?.text)
        .map((s) => s.placePrediction!.text.text);

      if (addresses.length === 0) return false;
      setIsSearching(false);
      setSuggestions(addresses);
      setIsOpen(true);
      return true;
    } catch {
      // Key present but unusable — stop trying Google for this session.
      placesLibRef.current = null;
      setUseGoogleApi(false);
      return false;
    }
  }, []);

  // Keyless real-address search (ArcGIS via /api/address-suggest). Used when
  // no Google Places key is configured, or if Google fails to load.
  const requestSeqRef = useRef(0);
  const searchWithFallback = useCallback(async (inputValue: string) => {
    const seq = ++requestSeqRef.current;
    try {
      const res = await fetch(`/api/address-suggest?q=${encodeURIComponent(inputValue)}`);
      const data = (await res.json()) as { suggestions?: string[] };
      if (seq !== requestSeqRef.current) return; // a newer keystroke won
      const results = data.suggestions ?? [];
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch {
      if (seq !== requestSeqRef.current) return;
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      if (seq === requestSeqRef.current) setIsSearching(false);
    }
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setHighlightedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputValue.length >= 3) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(() => {
        void (async () => {
          const handled = useGoogleApi && (await searchWithGoogle(inputValue));
          if (!handled) await searchWithFallback(inputValue);
        })();
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
    }
  };

  const handleSelect = (address: string) => {
    onChange(address);
    onSelect(address);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative group">
        <MapPin
          className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors ${
            compact ? "left-3 h-4 w-4" : "left-5 h-5 w-5"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          id={id}
          aria-invalid={invalid || undefined}
          className={
            compact
              ? `w-full h-11 pl-9 pr-9 rounded-lg border bg-white text-sm text-secondary placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                  invalid ? "border-red-400 bg-red-50" : "border-border"
                }`
              : "w-full h-16 pl-14 pr-14 rounded-2xl border-2 border-border bg-white text-lg font-medium text-secondary placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:shadow-md"
          }
          autoComplete="off"
        />
        <div className={`absolute top-1/2 -translate-y-1/2 ${compact ? "right-3" : "right-5"}`}>
          {isSearching ? (
            <Loader2 className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-primary animate-spin`} />
          ) : (
            <Search className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-muted-foreground`} />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
          {suggestions.map((suggestion, index) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${
                index === highlightedIndex
                  ? "bg-primary/5 text-primary"
                  : "text-secondary hover:bg-muted"
              } ${index !== suggestions.length - 1 ? "border-b border-border/50" : ""}`}
            >
              <MapPin className={`h-4 w-4 flex-shrink-0 ${
                index === highlightedIndex ? "text-primary" : "text-muted-foreground"
              }`} />
              <span className="text-sm font-medium">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
