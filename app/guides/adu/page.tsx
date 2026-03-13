import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Home, DollarSign, FileText, Clock } from "lucide-react";

const sections = [
  {
    icon: Home,
    title: "What Is an ADU?",
    content: "An Accessory Dwelling Unit (ADU) is a secondary housing unit built on a single-family residential lot. ADUs can be detached structures, attached additions, garage conversions, or junior ADUs within your existing home. In San Diego, ADUs can be up to 1,200 square feet and must include a kitchen, bathroom, and sleeping area.",
  },
  {
    icon: DollarSign,
    title: "How Much Does an ADU Cost?",
    content: "ADU costs in San Diego typically range from $120,000 to $350,000+ depending on size, type, and finishes. Garage conversions start around $120,000, while new detached ADUs start at $175,000. Costs include design, permits, construction, and finishes. We provide fixed-price contracts so you know exactly what to expect.",
  },
  {
    icon: Clock,
    title: "How Long Does It Take?",
    content: "The typical ADU timeline in San Diego is 12-16 months from start to finish. This includes 1-2 months for design and engineering, 6-9 months for permitting (the longest phase), and 3-4 months for construction. Our team manages every step of the process.",
  },
  {
    icon: FileText,
    title: "Permits & Regulations",
    content: "All ADUs in San Diego require building permits. California state law (AB 68, SB 13) has streamlined the ADU approval process, eliminating many previous barriers. San Diego allows ADUs on most single-family lots without additional parking requirements. We handle the entire permitting process for you.",
  },
];

const benefits = [
  "Generate $2,000-$4,000+ monthly rental income",
  "Increase property value by 20-35%",
  "Provide housing for family members with privacy",
  "Average payback period of 5-8 years",
  "No additional parking required in most cases",
  "Streamlined permit process under California law",
];

export default function ADUGuidePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              ADU GUIDE
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The Complete Guide to Building an ADU in San Diego
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Everything you need to know about ADU costs, timelines, permits, and financing in San Diego County.
            </p>
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Design Your ADU <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-16">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-secondary">{section.title}</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
              Benefits of Building an ADU
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your ADU?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Use our interactive ADU builder to explore what you can build on your property and see real pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Start Building Your ADU <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Free Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
