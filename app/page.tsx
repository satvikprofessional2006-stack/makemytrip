"use client";

import { ChevronDown, Award, Headphones, Zap } from "lucide-react";
import OceanBackground from "@/components/OceanBackground";
import Navbar from "@/components/Navbar";
import SearchForm from "@/components/SearchForm";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai → Goa",
    text: "Travel-o-pedia planned our family trip in under 5 minutes. The budget breakdown was spot-on and the hotel suggestions were perfect!",
    avatar: "PS",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    location: "Delhi → Bali",
    text: "I've used 10 travel apps — this is the only one that feels like a real travel agent. The AI itinerary was incredibly detailed.",
    avatar: "AM",
    rating: 5,
  },
  {
    name: "Kavya Nair",
    location: "Bangalore → Kerala",
    text: "Discovered hidden gems I would have never found on my own. The day-wise plan is genius. Saved us ₹15,000 vs. a travel agency!",
    avatar: "KN",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ============ HERO SECTION ============ */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center"
        style={{ minHeight: "100svh" }}
      >
        {/* Ocean background */}
        <OceanBackground />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 pt-20 pb-10 w-full max-w-5xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold mb-6 animate-fade-in-up drop-shadow-md"
            style={{ backgroundColor: "rgba(255,107,53,0.95)", backdropFilter: "blur(10px)" }}
          >
            <Zap className="w-4 h-4" />
            AI-Powered Travel Planning · Free Forever
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 hero-text-shadow animate-fade-in-up delay-100"
          >
            Your Perfect Trip,
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B35, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                display: "inline-block",
                filter: "drop-shadow(0 0 40px rgba(255, 107, 53, 0.4))",
              }}
            >
              Planned by AI
            </span>
          </h1>

          {/* Sub headline */}
          <p
            className="text-white/95 text-base sm:text-lg md:text-xl font-medium mb-10 hero-text-shadow animate-fade-in-up delay-200"
            style={{ maxWidth: "720px", marginInline: "auto", lineHeight: 1.7 }}
          >
            Tell us where you want to go, your budget in INR, and trip duration.
            <br />
            Get a complete AI-generated itinerary with hotels, flights, and budget planning.
          </p>

          {/* Ambient Glow Behind Form */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none z-0" />
          
          {/* Search Form */}
          <div className="w-full relative z-10 animate-fade-in-up delay-300">
            <SearchForm />
          </div>

          {/* Trust bar */}
          <div
            className="flex flex-wrap justify-center gap-6 mt-8 animate-fade-in-up delay-400"
          >
            {[
              { icon: Award, text: "2M+ Trips Planned" },
              { icon: Headphones, text: "24/7 Support" },
              { icon: Zap, text: "Instant Itinerary" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white text-sm font-medium drop-shadow-md">
                <Icon className="w-4 h-4 text-green-300" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <button
            onClick={() => document.getElementById("destinations")?.scrollIntoView({ behavior: "smooth" })}
            className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors drop-shadow-lg"
            aria-label="Scroll to destinations"
          >
            <span className="text-xs font-medium">Explore</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ============ FEATURED DESTINATIONS ============ */}
      <FeaturedDestinations />

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #EEF4FF 0%, #F0FDF9 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ backgroundColor: "#FFF4EF", color: "#FF6B35" }}
            >
              ❤️ Traveller Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Loved by Thousands of Travellers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100/80 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,85,204,0.06)] hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <svg key={s} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">
                    &quot;{t.text}&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #0055CC, #00A878)" }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-gray-900 font-bold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <HowItWorks />

      {/* ============ CTA BANNER ============ */}
      <section
        className="py-20 px-4 text-center"
        style={{
          background: "linear-gradient(135deg, #0055CC 0%, #0077B6 50%, #00A878 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Join 2 million+ travellers who plan smarter with TRAVEL-O-PEDIA.
            Your dream trip is just a search away.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-10 py-4 rounded-2xl text-white font-black text-lg shadow-[0_8px_30px_rgba(255,107,53,0.3)] hover:shadow-[0_12px_35px_rgba(255,107,53,0.45)] transition-all duration-300 hover:scale-[1.03] cursor-pointer"
            style={{ background: "linear-gradient(135deg, #FF6B35, #f7523a)" }}
          >
            Plan My Trip Now →
          </button>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <Footer />
    </main>
  );
}


