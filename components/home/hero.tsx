"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Scale, Eye, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { COMPANY_INFO, getYearsExperience } from "@/lib/data/site-data";
import { HeroReviewTicker } from "@/components/home/hero-review-ticker";

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

const benefits = ["Fixed-Price Contracts", "In-House Design Team", "Design, Permits & Construction"];

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

const PLAYBACK_RATE = 0.7;
const CROSSFADE_S = 1.2; // start the next clip this many seconds before the current one ends

export function Hero() {
  // All clips stay mounted and stacked; only the active one is visible. The
  // next clip starts underneath shortly before the current one ends and fades
  // in, so playback never gaps, reloads, or stops (loops forever).
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const advancingRef = useRef(false);

  const playClip = useCallback((index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.defaultPlaybackRate = PLAYBACK_RATE;
    video.playbackRate = PLAYBACK_RATE;
    video.play().catch(() => {});
  }, []);

  const advance = useCallback(
    (from: number) => {
      if (advancingRef.current) return;
      advancingRef.current = true;
      const next = (from + 1) % heroVideos.length;
      const nextVideo = videoRefs.current[next];
      if (nextVideo) nextVideo.currentTime = 0;
      playClip(next);
      setActiveIndex(next);
      // Let the outgoing clip finish its fade, then park it at the start.
      window.setTimeout(() => {
        const prev = videoRefs.current[from];
        if (prev && from !== next) {
          prev.pause();
          prev.currentTime = 0;
        }
        advancingRef.current = false;
      }, CROSSFADE_S * 1000 + 200);
    },
    [playClip]
  );

  // Start the first clip, and resume whenever the tab becomes visible again.
  useEffect(() => {
    playClip(activeIndex);
    const onVisible = () => {
      if (document.visibilityState === "visible") playClip(activeIndex);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [activeIndex, playClip]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-secondary">
      {/* Video Background */}
      <div className="absolute inset-0">
        {heroVideos.map((src, index) => (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={src}
            muted
            playsInline
            autoPlay={index === 0}
            preload={index === activeIndex || index === (activeIndex + 1) % heroVideos.length ? "auto" : "metadata"}
            aria-hidden="true"
            onTimeUpdate={(e) => {
              if (index !== activeIndex) return;
              const v = e.currentTarget;
              if (v.duration && v.duration - v.currentTime <= CROSSFADE_S) advance(index);
            }}
            onEnded={() => index === activeIndex && advance(index)}
            onError={() => index === activeIndex && advance(index)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity ease-linear ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: `${CROSSFADE_S}s` }}
          />
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-secondary/70" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Trust badge — on narrow columns (phones, tablets) the short form drops
                the repeated "TruthCore" (the logo is right above) to stay on one line. */}
            <div className="inline-flex max-w-full items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Shield className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span className="text-sm whitespace-nowrap">
                <span className="lg:hidden">A DBA of {COMPANY_INFO.name}</span>
                <span className="hidden lg:inline">TruthCore &middot; a DBA of {COMPANY_INFO.name}</span>
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Home.
              <span className="block">Every Project.</span>
              <span className="block text-accent">One Honest Team.</span>
            </h1>

            <p className="text-lg text-white/80 max-w-xl mb-8 leading-relaxed">
              Whatever your home needs &mdash; big or small, inside or out &mdash; we design,
              permit, and build it with one accountable team. No runaround, no surprise
              costs, and no guessing where your project stands.
            </p>

            {/* Key benefits */}
            <ul className="flex flex-wrap gap-x-6 gap-y-3 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" rounded="full" className="group w-full sm:w-auto">
                  Start Your Project
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/planning-tools" className="w-full sm:w-auto">
                <Button variant="outlineWhite" size="lg" rounded="full" className="w-full sm:w-auto">
                  Get an Instant Estimate
                </Button>
              </Link>
            </div>

            {/* Stats */}
            {/* Phones: content-width columns spread edge to edge so every label stays on one line */}
            <div className="flex justify-between gap-4 sm:grid sm:grid-cols-3 sm:gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/60 min-[380px]:whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Featured Info Card */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">
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
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <pillar.icon className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{pillar.title}</p>
                      <p className="text-sm text-white/60">{pillar.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real client reviews glide in one at a time, set off to the side of the standard */}
            <div className="relative z-10 mt-6">
              <HeroReviewTicker />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
