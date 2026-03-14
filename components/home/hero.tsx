"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Users, Palette, Bitcoin } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years Experience" },
  { value: "$50M+", label: "Value Delivered" },
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
              From concept to completion, we manage the entire process — design, permitting, 
              and construction. Transparent pricing, thoughtful design, and a dedicated team 
              focused on delivering exceptional results.
            </p>

            {/* Pricing info */}
            <div className="mb-8 space-y-1">
              <p className="text-white/90 font-medium">Detached ADUs at <span className="text-primary font-bold">$427/sq ft</span></p>
              <p className="text-white/90 font-medium">Garage conversions starting at <span className="text-primary font-bold">$120,000</span></p>
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
                    <p className="text-sm text-white/60">Architects, designers, and builders working together under one team for a seamless process from concept to completion.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Palette className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Interactive Online Showroom</p>
                    <p className="text-sm text-white/60">Explore materials, finishes, fixtures, and design options through our online showroom platform.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bitcoin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Cryptocurrency Payments Accepted</p>
                    <p className="text-sm text-white/60">We accept Bitcoin, Ethereum, and USDC for construction projects.</p>
                  </div>
                </div>
              </div>

              {/* Crypto Badge */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">We Accept Cryptocurrency</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#F7931A]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/>
                        <path fill="#fff" d="M14.625 10.19c.206-1.376-.842-2.115-2.275-2.61l.465-1.866-1.135-.283-.453 1.815c-.298-.074-.603-.144-.91-.214l.456-1.827-1.134-.283-.465 1.865c-.247-.056-.49-.112-.724-.171l.001-.007-1.565-.391-.302 1.212s.842.193.825.205c.459.115.542.418.528.659l-.529 2.122c.032.008.073.02.118.038l-.12-.03-.742 2.975c-.056.14-.199.35-.52.27.012.017-.825-.206-.825-.206l-.564 1.3 1.478.368c.275.069.544.141.81.209l-.47 1.887 1.133.283.465-1.865c.31.084.61.161.903.234l-.464 1.858 1.134.283.47-1.883c1.934.366 3.388.218 4.002-1.532.495-1.407-.025-2.219-1.041-2.749.74-.17 1.297-.656 1.446-1.661zm-2.588 3.628c-.352 1.413-2.73.649-3.503.457l.625-2.505c.772.193 3.246.574 2.878 2.048zm.352-3.65c-.32 1.285-2.3.632-2.943.472l.567-2.273c.642.16 2.712.46 2.376 1.8z"/>
                      </svg>
                    </div>
                    <span className="text-white/70 text-sm">Bitcoin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#627EEA]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#627EEA]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                      </svg>
                    </div>
                    <span className="text-white/70 text-sm">Ethereum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2775CA]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#2775CA]" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <path fill="#fff" d="M15.5 10.5c0-1.9-1.1-2.6-3.3-2.9V5h-1.4v2.5h-1.1V5H8.3v2.6H5.5v1.6h1.2c.5 0 .7.2.7.5v5.8c0 .2-.1.4-.5.4H5.5V18h2.8v2.6h1.4V18h1.1v2.6h1.4V18c2.5-.2 3.8-1.1 3.8-3.2 0-1.6-.9-2.5-2.3-2.8 1-.4 1.8-1.1 1.8-2.5zm-4.7-.4c1.5.2 2.2.6 2.2 1.6 0 .9-.6 1.4-2.2 1.5v-3.1zm0 7.1v-3.3c1.8.2 2.7.6 2.7 1.7 0 1.1-.9 1.5-2.7 1.6z"/>
                      </svg>
                    </div>
                    <span className="text-white/70 text-sm">USDC</span>
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">Pay for your construction project using major cryptocurrencies.</p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-4 border-primary/30 rounded-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-4 border-primary/20 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
