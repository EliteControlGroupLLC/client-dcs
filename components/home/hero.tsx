"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, BadgeCheck, Scale, Eye, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { COMPANY_INFO, getYearsExperience } from "@/lib/data/site-data";

const stats = [
  { value: COMPANY_INFO.stats.projectsCompleted, label: "Projects Completed" },
  { value: `${getYearsExperience()}+`, label: "Years Experience" },
  { value: COMPANY_INFO.stats.valueDelivered, label: "Value Delivered" },
];

// The standard the company runs by — Colossians 3:23-24, Easy-to-Read Version (ERV).
const scripture = {
  text: "In all the work you are doing, work the best you can. Work as if you are working for the Lord, not for people. Remember that you will receive your reward from the Lord, who will give you what he promised his people. You are serving the Lord Christ.",
  reference: "Colossians 3:23-24",
};

const pillars = [
  { icon: Scale, title: "Truth", text: "Honest answers and real numbers, even when it isn't what you hoped to hear." },
  { icon: Eye, title: "Transparency", text: "Clear pricing and scope, so you know what you're paying for and why." },
  { icon: MessageCircle, title: "Communication", text: "You always know where your project stands and what comes next." },
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
              <span className="text-sm">San Diego Design-Build &middot; Restoring Truth to Construction</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Home.
              <span className="block">Every Project.</span>
              <span className="block text-primary">One Honest Team.</span>
            </h1>

            <p className="text-lg text-white/80 max-w-xl mb-8 leading-relaxed">
              Whatever your home needs &mdash; big or small, inside or out &mdash; we design,
              permit, and build it with one accountable team. No runaround, no surprise
              costs, and no guessing where your project stands.
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
                <BadgeCheck className="h-4 w-4 text-primary" />
                Design, Permits &amp; Construction
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/contact">
                <Button size="lg" rounded="full" className="group">
                  Start Your Project
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/planning-tools">
                <Button variant="outlineWhite" size="lg" rounded="full">
                  Get an Instant Estimate
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
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 animate-pulse-glow">
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

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                The Standard We Build By
              </p>

              <blockquote className="mb-3">
                <p className="font-serif text-lg lg:text-xl leading-relaxed text-white">
                  &ldquo;{scripture.text}&rdquo;
                </p>
              </blockquote>
              <p className="text-sm text-white/60 mb-6">&mdash; {scripture.reference}</p>

              <p className="text-sm text-white/80 leading-relaxed mb-5">
                We don&apos;t build to impress people &mdash; we build as if the work is for the
                Lord. That&apos;s how we&apos;re working to restore truth, transparency, and
                communication to construction and real estate.
              </p>

              <div className="space-y-3">
                {pillars.map((pillar) => (
                  <div key={pillar.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <pillar.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{pillar.title}</p>
                      <p className="text-sm text-white/60">{pillar.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
