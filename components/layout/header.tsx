"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { COMPANY_INFO } from "@/lib/data/site-data";
import { Logo } from "@/components/layout/logo";

const SHOWROOM_HREF = "/showroom";
const AI_DESIGN_HREF = "https://www.distinctcsolutions.com/showroom/design-ai";

type NavLink = { name: string; href: string; description?: string };
type NavGroup = { name: string; href?: string; children?: NavLink[]; columns?: 1 | 2 };

const navigation: NavGroup[] = [
  {
    name: "Services",
    href: "/services",
    columns: 2,
    children: [
      { name: "ADU Solutions", href: "/services/adu-solutions" },
      { name: "Custom Homes", href: "/services/new-construction" },
      { name: "Remodeling", href: "/services/remodeling" },
      { name: "Kitchen Remodeling", href: "/services/kitchen" },
      { name: "Bathroom Renovation", href: "/services/bathroom" },
      { name: "Roofing", href: "/services/roofing" },
      { name: "Windows", href: "/services/windows" },
      { name: "Concrete", href: "/services/concrete" },
      { name: "Exterior Improvements", href: "/services/exterior" },
      { name: "General Construction", href: "/services/general-construction" },
    ],
  },
  {
    name: "Plan & Design",
    children: [
      { name: "Build Your ADU", href: "/build-your-adu", description: "See what fits on your lot" },
      { name: "Floor Plans", href: "/floor-plans", description: "Browse ready-to-adapt layouts" },
      { name: "Planning Tools", href: "/planning-tools", description: "Calculators and estimators" },
      { name: "Showroom", href: SHOWROOM_HREF, description: "Finishes and materials" },
      { name: "AI 3D Design", href: AI_DESIGN_HREF, description: "Visualize your project" },
    ],
  },
  { name: "Gallery", href: "/gallery" },
  {
    name: "Company",
    children: [
      { name: "About", href: "/about" },
      { name: "Our Process", href: "/process" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

function isActive(pathname: string, href?: string) {
  if (!href || href.startsWith("http")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function groupActive(pathname: string, item: NavGroup) {
  return isActive(pathname, item.href) || !!item.children?.some((c) => isActive(pathname, c.href));
}

export function Header() {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus whenever the route changes (derived-state pattern, no effect needed)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setIsOpen(false);
    setActiveDropdown(null);
  }

  // Any link click inside a menu closes it (covers links to the current page)
  const closeOnLinkClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) {
      setIsOpen(false);
      setActiveDropdown(null);
    }
  };

  // Lock page scroll behind the mobile menu; Escape closes everything
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const openMenu = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(name);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  // Light (white) header when scrolled or when the mobile sheet is open
  const light = scrolled || isOpen;

  const linkTone = light
    ? "text-secondary/70 hover:text-secondary"
    : "text-white/75 hover:text-white";
  const activeTone = light ? "text-secondary" : "text-white";

  return (
    <header
      className={`fixed top-0 left-0 right-0 transition-colors duration-300 ${isOpen ? "z-[60]" : "z-50"} ${
        isOpen
          ? "bg-white border-b border-secondary/8"
          : light
            ? "bg-white/95 backdrop-blur-md border-b border-secondary/8"
            : "bg-secondary/90 backdrop-blur-md border-b border-white/6"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="TruthCore — Home">
            {/* TruthCore wordmark: emerald + gold on white, white + gold on the dark bar */}
            <Logo variant={light ? "color" : "light"} className="h-[22px] sm:h-[26px] w-auto" />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) => {
              const active = groupActive(pathname, item);
              if (!item.children) {
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    aria-current={active ? "page" : undefined}
                    className={`relative px-3.5 py-2 text-[14px] font-medium tracking-[-0.005em] whitespace-nowrap transition-colors ${
                      active ? activeTone : linkTone
                    }`}
                  >
                    {item.name}
                    {active && (
                      <span className={`absolute left-3.5 right-3.5 -bottom-0.5 h-px ${light ? "bg-primary" : "bg-primary-light"}`} aria-hidden />
                    )}
                  </Link>
                );
              }
              const open = activeDropdown === item.name;
              return (
                <div
                  key={item.name}
                  className="relative"
                  data-nav={item.name}
                  onMouseEnter={() => openMenu(item.name)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => (open ? setActiveDropdown(null) : openMenu(item.name))}
                    className={`relative flex items-center gap-1 px-3.5 py-2 text-[14px] font-medium tracking-[-0.005em] whitespace-nowrap transition-colors ${
                      active || open ? activeTone : linkTone
                    }`}
                  >
                    {item.name}
                    <ChevronDown
                      className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                    {active && (
                      <span className={`absolute left-3.5 right-7 -bottom-0.5 h-px ${light ? "bg-primary" : "bg-primary-light"}`} aria-hidden />
                    )}
                  </button>

                  {open && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3" onClick={closeOnLinkClick}>
                      <div
                        className={`rounded-2xl bg-white p-2 shadow-[0_12px_40px_-12px_rgba(26,43,43,0.25)] ring-1 ring-secondary/8 ${
                          item.columns === 2 ? "w-[30rem]" : item.children.some((c) => c.description) ? "w-72" : "w-56"
                        }`}
                      >
                        <div className={item.columns === 2 ? "grid grid-cols-2 gap-x-1" : ""}>
                          {item.children.map((child) => {
                            const external = child.href.startsWith("http");
                            const childActive = isActive(pathname, child.href);
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className={`group flex items-start justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-colors hover:bg-muted ${
                                  childActive ? "bg-muted" : ""
                                }`}
                              >
                                <span>
                                  <span className="block text-[14px] font-medium text-secondary">{child.name}</span>
                                  {child.description && (
                                    <span className="mt-0.5 block text-[13px] text-muted-foreground">
                                      {child.description}
                                    </span>
                                  )}
                                </span>
                                {external && (
                                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                        {item.href && (
                          <div className="mt-2 border-t border-secondary/6 pt-2">
                            <Link
                              href={item.href}
                              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-secondary/70 hover:bg-muted hover:text-secondary transition-colors"
                            >
                              View all {item.name.toLowerCase()}
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex lg:items-center lg:gap-5 shrink-0">
            <Link
              href={SHOWROOM_HREF}
              className={`hidden xl:inline text-[14px] font-medium whitespace-nowrap transition-colors ${linkTone}`}
            >
              Showroom
            </Link>
            <Link
              href="/contact"
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors ${
                light
                  ? "bg-secondary text-white hover:bg-secondary-light"
                  : "bg-white text-secondary hover:bg-white/90"
              }`}
            >
              Start a Project
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={`lg:hidden -mr-2.5 rounded-full p-2.5 transition-colors ${
              light ? "text-secondary hover:bg-secondary/5" : "text-white hover:bg-white/10"
            }`}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — full-height sheet below the bar */}
      {isOpen && (
        <div
          id="mobile-menu"
          onClick={closeOnLinkClick}
          className="lg:hidden absolute inset-x-0 top-full h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-2 pb-10">
            <div className="py-4">
              <Link
                href="/"
                className={`flex min-h-11 items-center text-[17px] font-medium ${pathname === "/" ? "text-secondary" : "text-secondary/80"}`}
              >
                Home
              </Link>
            </div>

            {navigation.map((item) => (
              <div key={item.name} className="border-t border-secondary/8 py-4">
                {item.children ? (
                  <>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {item.name}
                    </p>
                    <div className={item.columns === 2 ? "grid grid-cols-2 gap-x-4" : ""}>
                      {item.children.map((child) => {
                        const external = child.href.startsWith("http");
                        const childActive = isActive(pathname, child.href);
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className={`flex min-h-11 items-center gap-1 text-[15px] ${
                              childActive ? "font-medium text-primary-dark" : "text-secondary/85"
                            }`}
                          >
                            {child.name}
                            {external && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
                          </Link>
                        );
                      })}
                    </div>
                    {item.href && (
                      <Link
                        href={item.href}
                        className="inline-flex min-h-11 items-center gap-1 text-[14px] font-medium text-secondary"
                      >
                        View all {item.name.toLowerCase()}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex min-h-11 items-center text-[17px] font-medium ${
                      isActive(pathname, item.href) ? "text-secondary" : "text-secondary/80"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="border-t border-secondary/8 pt-6 space-y-3">
              <Link
                href="/contact"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-[15px] font-semibold text-white"
              >
                Start a Project
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={`tel:${COMPANY_INFO.phoneHref}`}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-secondary/15 px-6 py-3.5 text-[15px] font-medium text-secondary"
              >
                <Phone className="h-4 w-4" aria-hidden />
                {COMPANY_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
