import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Star, ArrowRight, Shield, CheckCircle2, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  services: [
    { name: "ADU Solutions", href: "/services/adu-solutions" },
    { name: "New Construction", href: "/services/new-construction" },
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
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "YouTube", href: "#", icon: Youtube },
  { name: "Google Reviews", href: "#", icon: Star },
];

const trustBadges = [
  { icon: Shield, label: "CSLB Licensed #1098531" },
  { icon: CheckCircle2, label: "Bonded & Insured" },
  { icon: Building2, label: "Serving San Diego County" },
  { icon: CreditCard, label: "Financing Available" },
];

export function Footer() {
  return (
    <footer className="relative bg-secondary text-white overflow-hidden">
      {/* Subtle architectural grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      {/* Soft CTA Section - Replaces Newsletter */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Still Exploring Your Options?</h3>
              <p className="text-white/70 max-w-md">
                Explore what you can build on your property in minutes using our interactive ADU builder.
              </p>
            </div>
            <Link href="/build-your-adu">
              <Button variant="default" size="lg" rounded="full" className="group">
                Start Building Your ADU
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <badge.icon className="h-4 w-4 text-primary" />
                </div>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-white">D</span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  DISTINCT
                </span>
                <span className="block text-xs tracking-widest text-white/70">
                  CONSTRUCTION SOLUTIONS
                </span>
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              San Diego&apos;s premier design-build construction company specializing in ADUs, 
              custom homes, and high-quality residential construction. Transparent pricing, 
              professional project management, and exceptional results.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-white/70" />
                <div className="flex items-center gap-2">
                  <a href="tel:+18588330705" className="text-white/70 hover:text-primary transition-colors">
                    +1 (858) - 833 - 0705
                  </a>
                  <span className="text-white/30">|</span>
                  <a href="sms:+18588330705" className="text-white/70 hover:text-primary transition-colors text-xs">
                    Text
                  </a>
                </div>
              </div>
              <a href="mailto:Office@distinctcsolutions.com" className="flex items-center gap-3 text-sm text-white/70 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                Office@distinctcsolutions.com
              </a>
              <div className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Chula Vista, CA</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Tools</h3>
            <ul className="space-y-3">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Legal links separately */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-xs text-white/50 hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-xs text-white/50 hover:text-primary transition-colors">
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
                © {new Date().getFullYear()} Distinct Construction Solutions
              </p>
              <p className="text-xs text-white/50">
                California CSLB License #1098531 • Bonded & Insured
              </p>
            </div>
            <p className="text-xs text-white/40">
              Designed & Developed by{" "}
              <a 
                href="https://www.ikingdom.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/50 hover:text-primary transition-colors"
              >
                iKingdom
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
