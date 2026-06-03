"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, Users, IndianRupee, Trash2, Eye,
  PlusCircle, TrendingUp, Globe, Clock, CheckCircle2,
  Plane, BarChart3, Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface SavedTrip {
  id: number;
  destination: string;
  duration: number;
  travelers: number;
  budget: number;
  status: "upcoming" | "completed" | "draft";
  savedAt: string;
  startDate?: string;
  endDate?: string;
}

const defaultTrips: SavedTrip[] = [
  {
    id: 1,
    destination: "Goa, India",
    duration: 5,
    travelers: 2,
    budget: 45000,
    status: "upcoming",
    savedAt: "2026-05-28T10:00:00Z",
    startDate: "2026-07-15",
    endDate: "2026-07-20",
  },
  {
    id: 2,
    destination: "Bali, Indonesia",
    duration: 7,
    travelers: 4,
    budget: 120000,
    status: "completed",
    savedAt: "2026-04-10T14:30:00Z",
    startDate: "2026-05-01",
    endDate: "2026-05-08",
  },
  {
    id: 3,
    destination: "Rajasthan, India",
    duration: 8,
    travelers: 3,
    budget: 75000,
    status: "draft",
    savedAt: "2026-06-01T09:15:00Z",
  },
];

const statusConfig = {
  upcoming: { label: "Upcoming", color: "#0055CC", bg: "#EEF4FF", icon: "✈️" },
  completed: { label: "Completed", color: "#00A878", bg: "#EDFAF5", icon: "✅" },
  draft:     { label: "Draft", color: "#F59E0B", bg: "#FFFBEB", icon: "📝" },
};

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const destinationImages: Record<string, string> = {
  "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80",
  "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
  "Rajasthan": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80",
  "Kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80",
  "Maldives": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  "Ladakh": "https://images.unsplash.com/photo-1513415277900-a62401e19be4?w=400&q=80",
};

function getDestImage(destination: string) {
  for (const key of Object.keys(destinationImages)) {
    if (destination.includes(key)) return destinationImages[key];
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80";
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<SavedTrip[]>(defaultTrips);

  useEffect(() => {
    const stored = localStorage.getItem("travelopedia_trips");
    if (stored) {
      const parsed: SavedTrip[] = JSON.parse(stored);
      setTrips([...defaultTrips, ...parsed.filter(t => !defaultTrips.find(d => d.id === t.id))]);
    }
  }, []);

  const handleDelete = (id: number) => {
    const updated = trips.filter(t => t.id !== id);
    setTrips(updated);
    const withoutDefaults = updated.filter(t => !defaultTrips.find(d => d.id === t.id));
    localStorage.setItem("travelopedia_trips", JSON.stringify(withoutDefaults));
  };

  const totalBudget = trips.reduce((s, t) => s + t.budget, 0);
  const completed = trips.filter(t => t.status === "completed").length;
  const upcoming = trips.filter(t => t.status === "upcoming").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Profile header */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-8 text-white"
            style={{ background: "linear-gradient(135deg, #001A4D 0%, #0055CC 60%, #003D30 100%)" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar className="w-16 h-16 border-2 border-white/30">
                <AvatarFallback
                  className="text-white text-xl font-black"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #f7523a)" }}
                >
                  T
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-black mb-0.5">My Travel Dashboard</h1>
                <p className="text-white/70 text-sm">Your personal trip collection & travel history</p>
              </div>
              <Link href="/">
                <Button
                  className="gap-2 text-white font-semibold"
                  style={{ backgroundColor: "#FF6B35" }}
                >
                  <PlusCircle className="w-4 h-4" />
                  Plan New Trip
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { label: "Total Trips", value: trips.length, icon: Globe },
                { label: "Completed", value: completed, icon: CheckCircle2 },
                { label: "Upcoming", value: upcoming, icon: Plane },
                { label: "Total Budget", value: formatINR(totalBudget), icon: IndianRupee },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-white/70 mx-auto mb-2" />
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-white/60 text-xs font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trips list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-gray-900">
                  My Trips ({trips.length})
                </h2>
                <Link href="/" className="text-sm font-semibold" style={{ color: "#0055CC" }}>
                  + Add New
                </Link>
              </div>

              {trips.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-500 font-semibold mb-2">No trips yet</h3>
                  <p className="text-gray-400 text-sm mb-4">Start planning your first adventure!</p>
                  <Link href="/">
                    <Button style={{ backgroundColor: "#0055CC" }} className="text-white">
                      Plan a Trip
                    </Button>
                  </Link>
                </div>
              )}

              {trips.map((trip) => {
                const cfg = statusConfig[trip.status];
                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row card-hover"
                  >
                    {/* Image */}
                    <div className="sm:w-40 h-36 sm:h-auto shrink-0 overflow-hidden relative">
                      <img
                        src={getDestImage(trip.destination)}
                        alt={trip.destination}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                    </div>

                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900">{trip.destination}</h3>
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium border-0"
                              style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            >
                              {cfg.icon} {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Saved {new Date(trip.savedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                          aria-label="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 my-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {trip.duration} days
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          {trip.travelers} travelers
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold" style={{ color: "#0055CC" }}>
                          <IndianRupee className="w-3.5 h-3.5" />
                          {formatINR(trip.budget)}
                        </span>
                      </div>

                      {trip.startDate && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          {new Date(trip.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {trip.endDate && ` – ${new Date(trip.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                        </div>
                      )}

                      <Link
                        href={`/results?destination=${encodeURIComponent(trip.destination)}&travelers=${trip.travelers}&budget=${trip.budget}`}
                      >
                        <Button
                          size="sm"
                          className="gap-1.5 text-white font-semibold"
                          style={{ backgroundColor: "#0055CC" }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Itinerary
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Travel progress */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: "#0055CC" }} />
                  Travel Stats
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Trips Completed", value: completed, max: trips.length, color: "#00A878" },
                    { label: "Countries Visited", value: 3, max: 10, color: "#0055CC" },
                    { label: "Days Travelled", value: trips.filter(t => t.status === "completed").reduce((s, t) => s + t.duration, 0), max: 30, color: "#FF6B35" },
                  ].map(({ label, value, max, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 font-medium">{label}</span>
                        <span className="font-bold" style={{ color }}>{value}</span>
                      </div>
                      <Progress value={(value / max) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Wishlist teaser */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Wishlist
                </h3>
                <div className="space-y-3">
                  {["Santorini, Greece", "Kyoto, Japan", "Patagonia, Argentina"].map((dest) => (
                    <Link
                      key={dest}
                      href={`/results?destination=${encodeURIComponent(dest)}&travelers=2`}
                      className="flex items-center justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0 hover:text-blue-600 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{dest}</span>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-blue-500">Plan →</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* AI recommendation */}
              <div
                className="rounded-2xl p-5 text-white"
                style={{ background: "linear-gradient(135deg, #FF6B35, #f7523a)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold text-sm">AI Recommendation</span>
                </div>
                <p className="text-white/90 text-sm mb-4">
                  Based on your travel history, you&apos;d love <strong>Kerala Backwaters</strong> next — a perfect blend of nature and culture!
                </p>
                <Link href="/results?destination=Kerala%2C%20India&travelers=2">
                  <Button
                    className="bg-white hover:bg-white/90 font-bold text-sm w-full"
                    style={{ color: "#FF6B35" }}
                  >
                    Explore Kerala →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
