"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years Experience" },
  { value: "4.9", label: "Client Rating", icon: Star },
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
      video.playbackRate = 0.7; // Velocidad más lenta
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Logo */}
            <div className="mb-6">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/foto%20de%20perfil%20de%20LinkedIn%20creativo%20verde-50-7i7GgVpu8k3wMpgS3CQTjbTFiEtGMb.png"
                alt="DCS Logo"
                width={80}
                height={80}
                className="h-20 w-20"
              />
            </div>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">San Diego&apos;s Trusted Design-Build Partner</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Build Your Dream
              <span className="block text-primary">ADU or Home</span>
              <span className="block">With Confidence</span>
            </h1>

            <p className="text-lg text-white/80 max-w-xl mb-8 leading-relaxed">
              From concept to completion, we handle everything. Transparent pricing, 
              expert craftsmanship, and a dedicated team to bring your vision to life. 
              ADUs starting at $175,000.
            </p>

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
                Average 6-Month Build
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
              <Link href="/contact">
                <Button variant="outlineWhite" size="lg" rounded="full">
                  Free Consultation
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
                    {stat.icon && <stat.icon className="h-5 w-5 text-primary fill-primary" />}
                  </div>
                  <span className="text-xs sm:text-sm text-white/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Featured Info Card */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8">
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
                Why Choose DCS?
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Licensed & Insured</p>
                    <p className="text-sm text-white/60">CA License #1234567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">On-Time Delivery</p>
                    <p className="text-sm text-white/60">95% projects on schedule</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Top Rated</p>
                    <p className="text-sm text-white/60">4.9/5 from 200+ reviews</p>
                  </div>
                </div>
              </div>

              <Link href="/contact" className="block">
                <Button className="w-full" size="lg" rounded="full">
                  Get Free Quote
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
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
