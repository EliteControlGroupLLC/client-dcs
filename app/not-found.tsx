import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Home, LayoutGrid, Image as ImageIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

const links = [
  { href: "/services", icon: Home, title: "Services", text: "ADUs, custom homes, remodeling and more." },
  { href: "/floor-plans", icon: LayoutGrid, title: "Floor Plans", text: "Browse ADU layouts with real pricing." },
  { href: "/gallery", icon: ImageIcon, title: "Gallery", text: "See completed TruthCore projects." },
  { href: "/contact", icon: Phone, title: "Contact", text: "Talk to our team about your project." },
];

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              404 · PAGE NOT FOUND
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">We couldn&apos;t find that page</h1>
            <p className="text-xl text-white/80 mb-8">
              The page may have moved or the link may be out of date. Here are a few good places to pick up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="w-full sm:w-auto">
                <Button size="lg" rounded="full" className="w-full sm:w-auto">
                  Back to Home <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/build-your-adu" className="w-full sm:w-auto">
                <Button size="lg" variant="outlineWhite" rounded="full" className="w-full sm:w-auto">
                  Build Your ADU
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {links.map(({ href, icon: Icon, title, text }) => (
              <Link
                key={href}
                href={href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-secondary mb-2">{title}</h2>
                <p className="text-muted-foreground mb-4">{text}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Visit <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
