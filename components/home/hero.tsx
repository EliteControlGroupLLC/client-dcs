"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Star, Shield, Clock } from "lucide-react";
import { useState } from "react";

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years Experience" },
  { value: "4.9", label: "Client Rating", icon: Star },
  { value: "$50M+", label: "Value Delivered" },
];

export function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-secondary-light">
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent" />
      </div>

      {/* Animated shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
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

          {/* Right Content - Video/Image Card */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-secondary/50 aspect-[4/3]">
              {/* Placeholder for project image/video */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto hover:bg-white/30 transition-colors group"
                  >
                    <Play className="h-8 w-8 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                  <p className="text-sm text-white/80">Watch Our Story</p>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Star className="h-6 w-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">4.9/5 Rating</p>
                    <p className="text-xs text-white/70">Based on 200+ reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-4 border-primary/30 rounded-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-4 border-primary/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-secondary rounded-2xl flex items-center justify-center">
            <p className="text-white/60">Video placeholder - Add your video here</p>
            <button 
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              onClick={() => setIsVideoOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
