import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";

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
    { name: "ADU Calculator", href: "/calculators/adu" },
    { name: "ROI Calculator", href: "/calculators/roi" },
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
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "YouTube", href: "#", icon: Youtube },
];

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image
                src="/images/logo-icon.png"
                alt="DCS Logo"
                width={56}
                height={56}
                className="h-14 w-14"
              />
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
              San Diego&apos;s premier design-build construction company. Specializing in ADUs, 
              custom homes, and renovations with transparent pricing and exceptional craftsmanship.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-white/70" />
                <div className="flex items-center gap-2">
                  <a href="tel:+18588330705" className="text-white/70 hover:text-primary transition-colors">
                    858-833-0705
                  </a>
                  <span className="text-white/30">|</span>
                  <a href="sms:+18588330705" className="text-white/70 hover:text-primary transition-colors text-xs">
                    Texto
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
            <div className="flex gap-4 mt-6">
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
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} Distinct Construction Solutions. All rights reserved | Desarrollado por{" "}
              <a 
                href="https://ikingdom.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative inline-block text-[#2DD4BF] hover:text-[#5EEAD4] transition-colors font-medium"
              >
                iKingdom
                <span className="absolute -bottom-0.5 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#2DD4BF]/60 to-transparent rounded-full" />
              </a>
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/50">License #123456</span>
              <span className="text-xs text-white/50">•</span>
              <span className="text-xs text-white/50">Bonded & Insured</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
