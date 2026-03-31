"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Users, Palette, Bitcoin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { COMPANY_INFO, SERVICE_PRICING, getYearsExperience } from "@/lib/data/site-data";

const stats = [
  { value: COMPANY_INFO.stats.projectsCompleted, label: "Projects Completed" },
  { value: `${getYearsExperience()}+`, label: "Years Experience" },
  { value: COMPANY_INFO.stats.valueDelivered, label: "Value Delivered" },
];

const heroVideos = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AI_Generates_Architectural_Video_Prompt-2-EsaGIxuHEi6G6SimcXS7HvLnXclJst.mp4",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Video_de_Construccio%CC%81n_Estilo_Documental-tcHMOROeTia9zXEArtXUktIUS9dNfk.mp4",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Video_Generado_Listo-8dMvHgWFLWATLRFax4BdkyBEvHKwCI.mp4",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AI_Generates_Architectural_Video_Prompt-9EmmEZf8o9NOaPUmDsu4jjFdXxGu5j.mp4",
];

export function Hero() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
        setIsTransitioning(false);
      }, 500);
    };

    video.addEventListener("ended", handleVideoEnd);
    return () => video.removeEventListener("ended", handleVideoEnd);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 0.7;
      video.load();
      video.play().catch(() => {});
    }
  }, [currentVideoIndex]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          key={currentVideoIndex}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <source src={heroVideos[currentVideoIndex]} type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-secondary/70" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 via-transparent to-transparent" />
      </div>

      {/* Animated shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">San Diego&apos;s Trusted Design-Build Partner</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Build Your Dream <span className="text-primary">Home</span> or <span className="text-primary">ADU</span>
              <span className="block">with confidence</span>
            </h1>

            <p className="text-lg text-white/80 max-w-xl mb-4 leading-relaxed">
              From concept to completion, we manage design, permitting, and construction with
              one disciplined team. You get clearer pricing, tighter coordination, and a
              finished project that feels premium from day one.
            </p>

            {/* Pricing info */}
            <div className="mb-8 space-y-1">
              <p className="text-white/90 font-medium">
                Detached ADU starting at <span className="text-primary font-bold">{SERVICE_PRICING.adu.detachedStartingPrice}</span>
              </p>
              <p className="text-white/90 font-medium">
                Garage conversions starting at <span className="text-primary font-bold">{SERVICE_PRICING.adu.startingPrice}</span>
              </p>
            </div>

            {/* Key benefits */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Fixed-Price Contracts
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-2 h-2 rounded-full bg-primary" />
                In-House Design Team
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="h-4 w-4 text-primary" />
                Average 4-Month Build
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/build-your-adu">
                <Button size="lg" rounded="full" className="group">
                  Build Your ADU
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/showroom">
                <Button variant="outlineWhite" size="lg" rounded="full">
                  Visit Our Showroom
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-white/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Featured Info Card */}
          <div className="relative hidden md:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 animate-pulse-glow">
              {/* Video progress indicator */}
              <div className="flex gap-2 mb-6">
                {heroVideos.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      index === currentVideoIndex
                        ? "bg-primary"
                        : index < currentVideoIndex
                        ? "bg-white/60"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                What Sets Us Apart?
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Integrated Design-Build Team</p>
                    <p className="text-sm text-white/60">Design, estimating, permitting, and construction stay coordinated under one team so decisions move faster and scope stays aligned.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Palette className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Interactive Online Showroom</p>
                    <p className="text-sm text-white/60">Review finishes, fixtures, and material directions before selections become expensive field changes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bitcoin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Cryptocurrency Payments Accepted</p>
                    <p className="text-sm text-white/60">Flexible payment options are available for qualified projects, including Bitcoin, Ethereum, and USDC.</p>
                  </div>
                </div>
              </div>

              {/* Crypto Badge */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">We Accept Cryptocurrency</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F7931A]/20 flex items-center justify-center">
                      <img 
                        src="/images/crypto/bitcoin.png" 
                        alt="Bitcoin logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white/70 text-sm">Bitcoin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#627EEA]/20 flex items-center justify-center">
                      <img 
                        src="/images/crypto/ethereum.jpg" 
                        alt="Ethereum logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white/70 text-sm">Ethereum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2775CA]/20 flex items-center justify-center">
                      <img 
                        src="/images/crypto/usdc.jpg" 
                        alt="USDC logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white/70 text-sm">USDC</span>
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">Pay for your construction project using major cryptocurrencies.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
