"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

// Extend Window to include google maps types
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          AutocompleteService: new () => GoogleAutocompleteService;
          AutocompleteSessionToken: new () => object;
          PlacesServiceStatus: { OK: string };
        };
      };
    };
    initGooglePlaces?: () => void;
  }
}

interface GooglePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GoogleAutocompleteService {
  getPlacePredictions: (
    request: {
      input: string;
      componentRestrictions?: { country: string };
      types?: string[];
      sessionToken?: object;
    },
    callback: (predictions: GooglePrediction[] | null, status: string) => void
  ) => void;
}

// Fallback suggestions when Google API is not available
const fallbackSuggestions = [
  "1234 Sample St, San Diego, CA 92101",
  "1250 Garnet Ave, San Diego, CA 92109",
  "4567 University Ave, San Diego, CA 92105",
  "7890 La Jolla Blvd, La Jolla, CA 92037",
  "2345 El Cajon Blvd, San Diego, CA 92104",
];

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

function loadGooglePlacesScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      return;
    }

    if (!GOOGLE_API_KEY) {
      reject(new Error("Google Places API key not configured"));
      return;
    }

    window.initGooglePlaces = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Places script"));
    document.head.appendChild(script);
  });
}

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string) => void;
  placeholder?: string;
}

export function AddressAutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "Enter your property address",
}: AddressAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [useGoogleApi, setUseGoogleApi] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<GoogleAutocompleteService | null>(null);
  const sessionTokenRef = useRef<object | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Google Places API on mount
  useEffect(() => {
    if (!GOOGLE_API_KEY) return;

    loadGooglePlacesScript()
      .then(() => {
        if (window.google?.maps?.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
          setUseGoogleApi(true);
        }
      })
      .catch(() => {
        // Fall back to mock suggestions
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

  const searchWithGoogle = useCallback((inputValue: string) => {
    if (!autocompleteServiceRef.current) return;

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: inputValue,
        componentRestrictions: { country: "us" },
        types: ["address"],
        sessionToken: sessionTokenRef.current || undefined,
      },
      (predictions, status) => {
        setIsSearching(false);
        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
          setSuggestions(predictions.map((p) => p.description));
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      }
    );
  }, []);

  const searchWithFallback = useCallback((inputValue: string) => {
    const filtered = fallbackSuggestions.filter((s) =>
      s.toLowerCase().includes(inputValue.toLowerCase())
    );
    setSuggestions(filtered.length > 0 ? filtered : fallbackSuggestions.slice(0, 5));
    setIsOpen(true);
    setIsSearching(false);
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
        if (useGoogleApi) {
          searchWithGoogle(inputValue);
        } else {
          searchWithFallback(inputValue);
        }
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
    // Reset session token after selection for billing optimization
    if (useGoogleApi && window.google?.maps?.places) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
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
        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-16 pl-14 pr-14 rounded-2xl border-2 border-border bg-white text-lg font-medium text-secondary placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:shadow-md"
          autoComplete="off"
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
          {suggestions.map((suggestion, index) => (
            <button
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
          {useGoogleApi && (
            <div className="px-5 py-2 bg-muted/30 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground">Powered by Google</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
