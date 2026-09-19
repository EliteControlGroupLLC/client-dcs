import { Hero } from "@/components/home/hero";
import { TrustBar } from "@/components/home/trust-bar";
import { Services } from "@/components/home/services";
import { Process } from "@/components/home/process";
import { SmartTools } from "@/components/home/smart-tools";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { FounderStory } from "@/components/home/founder-story";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { CTASection } from "@/components/home/cta-section";
import { GoogleReviews } from "@/components/google-reviews";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Services />
      <Process />
      <SmartTools />
      <WhyChooseUs />
      <FounderStory />
      <GalleryPreview />
      <GoogleReviews />
      <CTASection />
    </>
  );
}
