"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

// Mock address suggestions for demo - will be replaced with Google Places API
const mockSuggestions = [
  "1234 Sample St, San Diego, CA 92101",
  "1250 Garnet Ave, San Diego, CA 92109",
  "4567 University Ave, San Diego, CA 92105",
  "7890 La Jolla Blvd, La Jolla, CA 92037",
  "2345 El Cajon Blvd, San Diego, CA 92104",
  "3456 Adams Ave, San Diego, CA 92116",
  "5678 Clairemont Mesa Blvd, San Diego, CA 92117",
  "8901 Mira Mesa Blvd, San Diego, CA 92126",
];

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setHighlightedIndex(-1);

    if (inputValue.length >= 3) {
      setIsSearching(true);
      // Simulate API delay - replace with real Google Places API call
      setTimeout(() => {
        const filtered = mockSuggestions.filter((s) =>
          s.toLowerCase().includes(inputValue.toLowerCase())
        );
        // If no exact matches, show all as "nearby" suggestions
        setSuggestions(filtered.length > 0 ? filtered : mockSuggestions.slice(0, 5));
        setIsOpen(true);
        setIsSearching(false);
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
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
        </div>
      )}
    </div>
  );
}
