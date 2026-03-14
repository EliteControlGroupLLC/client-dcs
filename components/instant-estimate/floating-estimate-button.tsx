"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { InstantEstimateModal } from "./instant-estimate-modal";

export function FloatingEstimateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-3.5 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
        aria-label="Instant Estimate"
      >
        <Calculator className="h-5 w-5" />
        <span className="hidden sm:inline">Instant Estimate</span>
      </button>

      {/* Modal */}
      <InstantEstimateModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
