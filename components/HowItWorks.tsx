"use client";

import { Search, Sparkles, Map, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Search Your Dream Destination",
    description:
      "Enter your destination, travel dates, number of travelers and budget in INR. Our smart autocomplete suggests popular spots instantly.",
    color: "#0055CC",
    bg: "#EEF4FF",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "AI Generates Your Itinerary",
    description:
      "Our AI engine creates a personalized day-wise plan covering hotels, flights, local experiences, food & hidden gems — all within your budget.",
    color: "#FF6B35",
    bg: "#FFF4EF",
  },
  {
    icon: Map,
    number: "03",
    title: "Explore & Customize",
    description:
      "Review the interactive itinerary, tweak activities, adjust hotel preferences and see a live budget breakdown. Everything is editable.",
    color: "#00A878",
    bg: "#EDFAF5",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Save & Share Your Trip",
    description:
      "Save your final plan to your dashboard, export as PDF or share with fellow travelers. Access it anytime, anywhere.",
    color: "#7C3AED",
    bg: "#F5F0FF",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: "#EDFAF5", color: "#00A878" }}
          >
            🗺️ Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            How TRAVEL-O-PEDIA Works
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            From dream to destination in 4 simple steps. AI-powered planning, human-curated perfection.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative group">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-full w-full h-0.5 z-0"
                    style={{
                      background: `linear-gradient(to right, ${step.color}40, ${steps[idx + 1].color}40)`,
                      width: "calc(100% - 4rem)",
                      left: "calc(50% + 2.5rem)",
                    }}
                  />
                )}

                <div className="relative z-10 text-center group-hover:scale-105 transition-transform duration-300">
                  {/* Step number badge */}
                  <div className="relative inline-block mb-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                      style={{ backgroundColor: step.bg }}
                    >
                      <Icon
                        className="w-8 h-8"
                        style={{ color: step.color }}
                      />
                    </div>
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shadow"
                      style={{ backgroundColor: step.color }}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  <h3 className="text-gray-900 font-bold text-lg mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div
          className="mt-20 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          style={{
            background: "linear-gradient(135deg, #0055CC 0%, #0077B6 50%, #00A878 100%)",
          }}
        >
          {[
            { value: "2M+", label: "Trips Planned" },
            { value: "150+", label: "Destinations" },
            { value: "4.9★", label: "Avg. Rating" },
            { value: "₹100Cr+", label: "Budget Saved" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
