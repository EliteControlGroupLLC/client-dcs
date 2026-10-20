import Link from "next/link";
import { Mail, Phone, MapPin, Star, Shield, CheckCircle2, Building2, CreditCard } from "lucide-react";
import { COMPANY_INFO } from "@/lib/data/site-data";
import { Logo } from "@/components/layout/logo";
import { SiteChrome } from "@/components/layout/site-chrome";

const footerLinks = {
  services: [
    { name: "ADU Solutions", href: "/services/adu-solutions" },
    { name: "Custom Homes", href: "/services/new-construction" },
    { name: "Remodeling", href: "/services/remodeling" },
    { name: "Kitchen Remodeling", href: "/services/kitchen" },
    { name: "Bathroom Remodeling", href: "/services/bathroom" },
  ],
  tools: [
    { name: "Build Your ADU", href: "/build-your-adu" },
    { name: "Floor Plans Library", href: "/floor-plans" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Story", href: "/our-story" },
    { name: "Meet the Team", href: "/team" },
    { name: "Our Process", href: "/process" },
    { name: "Gallery", href: "/gallery" },
    { name: "Financing", href: "/financing" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "ADU Guide", href: "/guides/adu" },
    { name: "ADU Cost Calculator", href: "/adu-calculator" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
  ],
};

const socialLinks = [
  {
    name: "Google Reviews",
    href: "https://www.google.com/search?q=Distinct+Construction+Solutions+Chula+Vista+reviews",
    icon: Star,
  },
];

const trustBadges = [
  { icon: Shield, label: "CSLB #1098531" },
  { icon: CheckCircle2, label: "Bonded & Insured" },
  { icon: Building2, label: "San Diego County" },
  { icon: CreditCard, label: "Financing Available" },
];

// Footer link: 44px tap target on touch layouts, compact rhythm from lg up.
const linkClass =
  "inline-flex min-h-11 items-center text-sm text-white/70 hover:text-primary-light transition-colors lg:min-h-0";
const legalLinkClass =
  "inline-flex min-h-11 items-center text-xs text-white/50 hover:text-primary-light transition-colors lg:min-h-0";
const listClass = "lg:space-y-3";

export function Footer() {
  return (
    // Ad landing pages (/lp/*) render their own minimal footer
    <SiteChrome>
    <footer className="relative bg-secondary text-white overflow-hidden">

      {/* Trust Badges */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <badge.icon className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="whitespace-nowrap">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-8 gap-y-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-3" aria-label="TruthCore — Home">
              {/* TruthCore wordmark, two-color version for dark backgrounds */}
              <Logo variant="light" className="h-7 w-auto" />
            </Link>
            <p className="text-xs text-white/60 mb-6">
              TruthCore is a DBA of {COMPANY_INFO.name}
            </p>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              A boutique design-build firm rooted in San Diego, specializing in ADUs, custom homes, 
              and full-scale renovations. We combine organized systems, transparent pricing, and 
              premium craftsmanship to deliver an experience as refined as the finished product.
            </p>
            
            {/* Contact Info */}
            <div className="lg:space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="flex items-center gap-2">
                  <a href={`tel:${COMPANY_INFO.phoneHref}`} className="inline-flex min-h-11 items-center hover:text-primary-light transition-colors lg:min-h-0">
                    {COMPANY_INFO.phone}
                  </a>
                  <span className="text-white/30" aria-hidden="true">|</span>
                  <a href={`sms:${COMPANY_INFO.phoneHref}`} className="inline-flex min-h-11 items-center px-1 text-xs hover:text-primary-light transition-colors lg:min-h-0 lg:px-0">
                    Text
                  </a>
                </div>
              </div>
              <a href={`mailto:${COMPANY_INFO.email}`} className="flex min-h-11 items-center gap-3 text-sm text-white/70 hover:text-primary-light transition-colors lg:min-h-0">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-all">{COMPANY_INFO.email}</span>
              </a>
              <div className="flex items-start gap-3 py-3 text-sm text-white/70 lg:py-0">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{COMPANY_INFO.office}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-medium text-white/85 hover:bg-white/15 hover:text-white transition-colors"
                >
                  <social.icon className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Services</h3>
            <ul className={listClass}>
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Tools</h3>
            <ul className={listClass}>
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
            <ul className={listClass}>
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
            <ul className={listClass}>
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Legal links separately */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <ul className={listClass}>
                <li>
                  <Link href="/privacy" className={legalLinkClass}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={legalLinkClass}>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-sm text-white/70">
                © {new Date().getFullYear()} TruthCore
              </p>
              <p className="text-xs text-white/50">
                {COMPANY_INFO.name} dba TruthCore • California CSLB License #1098531 • Bonded & Insured
              </p>
            </div>
            <p className="text-xs text-white/50">
              Made by{" "}
              <a
                href="https://www.ikingdom.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary-light transition-colors"
              >
                iKingdom
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
    </SiteChrome>
  );
}
