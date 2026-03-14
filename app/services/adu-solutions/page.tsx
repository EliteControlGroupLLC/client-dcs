import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Shield
} from "lucide-react";
import Link from "next/link";

const aduTypes = [
  {
    title: "Detached ADU",
    description: "A standalone structure separate from your main home. Offers maximum privacy and flexibility.",
    sqFt: "400-1,200 sq ft",
    timeline: "10-12 months",
    features: ["Complete privacy", "Flexible placement", "Highest rental potential"],
  },
  {
    title: "Attached ADU",
    description: "Built as an addition to your existing home, sharing one or more walls.",
    sqFt: "400-1,000 sq ft",
    timeline: "11-13 months",
    features: ["Perfect for family living", "Blends seamlessly with your home", "Smart solution for tighter lots"],
  },
  {
    title: "Garage Conversion",
    description: "Transform your existing garage into a fully functional living space. Ideal for homeowners looking to convert underutilized square footage into a comfortable ADU.",
    sqFt: "400-600 sq ft",
    timeline: "6-8 months",
    features: ["Uses existing structure", "Efficient conversion process", "Great rental potential"],
  },
  {
    title: "Junior ADU (JADU)",
    description: "Built within your existing home, a Junior ADU makes efficient use of your current footprint. Streamlined permitting is available for qualifying properties, making this a smart option for homeowners ready to add a private living space without a ground-up build.",
    sqFt: "200-500 sq ft",
    timeline: "2-4 months",
    features: ["Built inside existing home", "Efficient use of space", "Streamlined permitting for qualifying homes"],
  },
];

const process = [
  { step: 1, title: "Design Your ADU and Get Pricing", description: "Use our online tools to explore ADU options for your property. Choose your type, layout, and style to see realistic pricing." },
  { step: 2, title: "Funding and Pre-Approval Guidance", description: "We help review funding options and confirm your project budget so the project is financially ready to move forward." },
  { step: 3, title: "Plans, Engineering, and Permits", description: "Our team prepares architectural plans, coordinates engineering, and manages the full permitting process with the city." },
  { step: 4, title: "Construction and Project Management", description: "Our construction team builds your ADU with organized scheduling, quality oversight, and clear progress updates." },
  { step: 5, title: "Final Walkthrough and Delivery", description: "We walk through the completed ADU with you, address final details, and hand over the keys." },
];

export default function ADUSolutionsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ADU Solutions in San Diego
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Add value to your property with a professionally designed and built Accessory Dwelling Unit. 
              From design to completion, we handle everything.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/build-your-adu">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                  Open ADU Calculator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ADU Types */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Types of ADUs We Build
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every property is unique. We&apos;ll help you choose the ADU type that best fits your lot, budget, and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {aduTypes.map((type) => (
              <Card key={type.title} className="overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 h-48 flex items-center justify-center">
                  <Home className="h-16 w-16 text-primary/50" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-secondary mb-2">{type.title}</h3>
                  <p className="text-muted-foreground mb-4">{type.description}</p>
                  <div className="flex gap-4 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Home className="h-4 w-4 text-primary" />
                      {type.sqFt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      {type.timeline}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {type.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Why Build an ADU?
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Rental Income</h3>
              <p className="text-sm text-muted-foreground">
                Generate $2,000-$4,000+ monthly in San Diego
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Property Value</h3>
              <p className="text-sm text-muted-foreground">
                Increase home value by 20-30%
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Multi-Gen Living</h3>
              <p className="text-sm text-muted-foreground">
                Housing for family with privacy
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Financial Security</h3>
              <p className="text-sm text-muted-foreground">
                Hedge against rising costs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Our ADU Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From first conversation to move-in day, here is how we bring your ADU to life.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {process.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-secondary text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your ADU?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation to explore your options. We&apos;ll assess your property and provide a detailed estimate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Design Your ADU
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
