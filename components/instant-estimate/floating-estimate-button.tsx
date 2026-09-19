"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Calculator } from "lucide-react";
import { isLandingPage } from "@/components/layout/site-chrome";
import { InstantEstimateModal } from "./instant-estimate-modal";

// Show the floating button only once the visitor has scrolled past the top of
// the page, so it never sits on top of hero content or the hero's own CTAs.
const REVEAL_AFTER_PX = 480;

export function FloatingEstimateButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Tuck it away again once the footer (which has its own CTA, legal line
      // and credits in the bottom-right corner) scrolls into view.
      const footerTop = document.querySelector("footer")?.getBoundingClientRect().top ?? Infinity;
      setRevealed(window.scrollY > REVEAL_AFTER_PX && footerTop > window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ad landing pages (/lp/*) keep visitors on their single lead form
  if (isLandingPage(pathname)) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Instant Estimate"
        aria-hidden={!revealed}
        tabIndex={revealed ? 0 : -1}
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        className={`fixed right-4 sm:right-6 z-40 flex h-14 w-14 sm:w-auto items-center justify-center gap-2 rounded-full bg-primary text-white font-semibold sm:px-6 shadow-lg shadow-secondary/30 ring-1 ring-white/15 transition-all duration-300 hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent print:hidden ${
          revealed ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <Calculator className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Instant Estimate</span>
      </button>

      {/* Modal */}
      <InstantEstimateModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
