"use client";

import Link from "next/link";
import { Star, MapPin, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const destinations = [
  {
    id: 1,
    name: "Goa",
    country: "India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80",
    rating: 4.8,
    duration: "5–7 days",
    priceFrom: "₹25,000",
    tags: ["Beach", "Nightlife", "Culture"],
    trending: true,
    description: "Golden sands, Portuguese heritage & vibrant beach parties",
  },
  {
    id: 2,
    name: "Rajasthan",
    country: "India",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=500&q=80",
    rating: 4.9,
    duration: "7–10 days",
    priceFrom: "₹35,000",
    tags: ["Heritage", "Desert", "Royal"],
    trending: false,
    description: "Majestic forts, opulent palaces and the Thar desert",
  },
  {
    id: 3,
    name: "Kerala",
    country: "India",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&q=80",
    rating: 4.9,
    duration: "6–8 days",
    priceFrom: "₹28,000",
    tags: ["Backwaters", "Nature", "Ayurveda"],
    trending: true,
    description: "Serene backwaters, lush tea gardens & Ayurvedic wellness",
  },
  {
    id: 4,
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80",
    rating: 4.8,
    duration: "7–10 days",
    priceFrom: "₹55,000",
    tags: ["Island", "Spiritual", "Adventure"],
    trending: true,
    description: "Terraced rice fields, temple ceremonies & surf culture",
  },
  {
    id: 5,
    name: "Ladakh",
    country: "India",
    image: "https://images.unsplash.com/photo-1513415277900-a62401e19be4?w=500&q=80",
    rating: 4.9,
    duration: "8–12 days",
    priceFrom: "₹45,000",
    tags: ["Mountains", "Adventure", "Scenic"],
    trending: false,
    description: "Dramatic landscapes, ancient monasteries and starry skies",
  },
  {
    id: 6,
    name: "Maldives",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
    rating: 5.0,
    duration: "5–7 days",
    priceFrom: "₹1,20,000",
    tags: ["Luxury", "Beach", "Snorkeling"],
    trending: true,
    description: "Overwater bungalows, crystal lagoons & pristine coral reefs",
  },
];

const tagColors: Record<string, string> = {
  Beach: "#0096C7",
  Nightlife: "#7C3AED",
  Culture: "#059669",
  Heritage: "#B45309",
  Desert: "#D97706",
  Royal: "#9333EA",
  Backwaters: "#0891B2",
  Nature: "#16A34A",
  Ayurveda: "#CA8A04",
  Island: "#0284C7",
  Spiritual: "#7C3AED",
  Adventure: "#DC2626",
  Mountains: "#374151",
  Scenic: "#065F46",
  Luxury: "#B45309",
  Snorkeling: "#0055CC",
};

export default function FeaturedDestinations() {
  return (
    <section id="destinations" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: "#EEF4FF", color: "#0055CC" }}
          >
            ✈️ Featured Destinations
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Dream Destinations Await
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Handpicked destinations loved by thousands of travellers — from misty mountains to sun-kissed beaches.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {destinations.map((dest, idx) => (
            <Link
              href={`/results?destination=${encodeURIComponent(dest.name + ", " + dest.country)}`}
              key={dest.id}
              className="block group"
            >
              <div
                className="card-hover rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative overflow-hidden h-52">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Trending badge */}
                  {dest.trending && (
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: "#FF6B35" }}
                    >
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </div>
                  )}

                  {/* Rating */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-gray-800">{dest.rating}</span>
                  </div>

                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-white text-xl font-black">{dest.name}</h3>
                        <p className="text-white/80 text-sm flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {dest.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-xs">from</p>
                        <p className="text-white font-bold text-base">{dest.priceFrom}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{dest.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {dest.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs font-medium px-2 py-0.5 rounded-full border-0"
                          style={{
                            backgroundColor: tagColors[tag] + "18",
                            color: tagColors[tag] || "#374151",
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {dest.duration}
                    </div>
                  </div>

                  <div
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-center text-white transition-all duration-200 group-hover:shadow-lg"
                    style={{ backgroundColor: "#0055CC" }}
                  >
                    Plan This Trip →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="px-8 py-3 h-auto rounded-full border-2 font-semibold text-base transition-all duration-200 hover:text-white"
            style={{ borderColor: "#0055CC", color: "#0055CC" }}
          >
            Explore All Destinations →
          </Button>
        </div>
      </div>
    </section>
  );
}
