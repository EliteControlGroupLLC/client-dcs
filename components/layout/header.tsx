"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Phone } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Services",
    href: "/services",
    children: [
      { name: "ADU Solutions", href: "/services/adu-solutions" },
      { name: "New Construction", href: "/services/new-construction" },
      { name: "Remodeling", href: "/services/remodeling" },
      { name: "All Services", href: "/services" },
    ],
  },
  { name: "Floor Plans", href: "/floor-plans" },
  { name: "Gallery", href: "/gallery" },
  {
    name: "Tools",
    href: "/tools",
    children: [
      { name: "Build Your ADU", href: "/build-your-adu" },
      { name: "ADU Calculator", href: "/calculators/adu" },
      { name: "ROI Calculator", href: "/calculators/roi" },
      { name: "All Calculators", href: "/calculators" },
    ],
  },
  { name: "Process", href: "/process" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div>
              <span className={`text-lg font-bold tracking-tight ${scrolled ? "text-secondary" : "text-white"}`}>
                DISTINCT
              </span>
              <span className={`block text-xs tracking-widest ${scrolled ? "text-muted-foreground" : "text-white/80"}`}>
                CONSTRUCTION SOLUTIONS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    scrolled
                      ? "text-secondary hover:text-primary hover:bg-primary/10"
                      : "text-white hover:text-primary-light hover:bg-white/10"
                  }`}
                >
                  {item.name}
                  {item.children && <ChevronDown className="h-4 w-4" />}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.name && (
                  <div className="absolute left-0 top-full pt-2 w-56">
                    <div className="bg-white rounded-xl shadow-xl border border-border overflow-hidden">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-4 py-3 text-sm text-secondary hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            <a
              href="tel:+18588330705"
              className={`flex items-center gap-2 text-sm font-medium ${
                scrolled ? "text-secondary" : "text-white"
              }`}
            >
              <Phone className="h-4 w-4" />
              858-833-0705
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all hover:scale-105"
            >
              Free Consultation
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden rounded-lg p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className={`h-6 w-6 ${scrolled ? "text-secondary" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${scrolled ? "text-secondary" : "text-white"}`} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden bg-white rounded-2xl shadow-xl mt-2 p-4 border border-border">
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-base font-medium text-secondary hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.children && (
                    <div className="pl-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link
                href="/contact"
                className="block w-full text-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg"
                onClick={() => setIsOpen(false)}
              >
                Free Consultation
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
