"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
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

interface SavedTrip {
  id: string | number;
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
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallbackDates, setFallbackDates] = useState<Record<string, { start: string; end: string }>>({});

  useEffect(() => {
    let mounted = true;
    const fetchUserAndTrips = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }
      
      if (mounted) setUser(user);

      const { data: tripsData } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (tripsData && mounted) {
        const mappedTrips: SavedTrip[] = tripsData.map(t => {
          const duration = t.itinerary?.duration || Math.max(1, Math.ceil((new Date(t.end_date).getTime() - new Date(t.start_date).getTime()) / (1000 * 60 * 60 * 24)));
          return {
            id: t.id,
            destination: t.destination,
            duration: duration,
            travelers: t.num_travelers,
            budget: t.budget,
            status: new Date(t.start_date) > new Date() ? "upcoming" : "completed",
            savedAt: t.created_at,
            startDate: t.start_date,
            endDate: t.end_date,
          };
        });
        setTrips(mappedTrips);

        // Precompute fallback dates on client to keep render pure
        const now = Date.now();
        const dates: Record<string, { start: string; end: string }> = {};
        mappedTrips.forEach(trip => {
          dates[String(trip.id)] = {
            start: trip.startDate || new Date(now + 7 * 86400000).toISOString().split("T")[0],
            end: trip.endDate || new Date(now + (7 + trip.duration) * 86400000).toISOString().split("T")[0]
          };
        });
        setFallbackDates(dates);
      }
      if (mounted) setLoading(false);
    };

    fetchUserAndTrips();
    return () => { mounted = false; };
  }, [router]);

  const handleDelete = async (id: string | number) => {
    const updated = trips.filter(t => t.id !== id);
    setTrips(updated);
    
    const supabase = createClient();
    await supabase.from("trips").delete().eq("id", id);
  };

  const totalBudget = trips.reduce((s, t) => s + t.budget, 0);
  const completed = trips.filter(t => t.status === "completed").length;
  const upcoming = trips.filter(t => t.status === "upcoming").length;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Profile header */}
          <div
            className="rounded-3xl p-6 md:p-8 mb-8 text-white shadow-xl"
            style={{ background: "linear-gradient(135deg, #0055CC 0%, #0077B6 50%, #00A878 100%)" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar className="w-16 h-16 border-2 border-white/30">
                <AvatarFallback
                  className="text-white text-xl font-black uppercase"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #f7523a)" }}
                >
                  {user?.email?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-black mb-0.5 tracking-tight">Welcome, {user?.email}</h1>
                <p className="text-white/80 text-sm font-semibold">Your personal trip collection & travel history</p>
              </div>
              <Link href="/">
                <Button
                  className="gap-2 text-white font-extrabold px-6 rounded-xl hover:shadow-[0_8px_20px_rgba(255,107,53,0.3)] transition-all cursor-pointer"
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
                <div key={label} className="bg-black/10 rounded-2xl p-4 text-center border border-white/5">
                  <Icon className="w-5 h-5 text-white/80 mx-auto mb-2" />
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-white/70 text-xs font-semibold mt-0.5">{label}</div>
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

              {loading && (
                <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
                  <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Loading your trips...</p>
                </div>
              )}
              
              {!loading && trips.length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-500 font-semibold mb-2">No trips yet</h3>
                  <p className="text-gray-400 text-sm mb-4">Start planning your first adventure!</p>
                  <Link href="/">
                    <Button style={{ backgroundColor: "#0055CC" }} className="text-white font-semibold rounded-xl">
                      Plan a Trip
                    </Button>
                  </Link>
                </div>
              )}

              {!loading && trips.map((trip) => {
                const cfg = statusConfig[trip.status];
                const fDates = fallbackDates[String(trip.id)] || { start: "", end: "" };
                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col sm:flex-row card-hover transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,85,204,0.04)]"
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
                        href={`/results?destination=${encodeURIComponent(trip.destination)}&travelers=${trip.travelers}&budget=${trip.budget}&startDate=${trip.startDate || fDates.start}&endDate=${trip.endDate || fDates.end}`}
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
            <div className="space-y-6">
              {/* Travel progress */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100/80 card-hover transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,85,204,0.04)]">
                <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#0055CC]" />
                  Travel Stats
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Trips Completed", value: completed, max: trips.length, color: "#00A878" },
                    { label: "Countries Visited", value: 3, max: 10, color: "#0055CC" },
                    { label: "Days Travelled", value: trips.filter(t => t.status === "completed").reduce((s, t) => s + t.duration, 0), max: 30, color: "#FF6B35" },
                  ].map(({ label, value, max, color }) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold mb-0.5">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-black" style={{ color }}>{value} / {max}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wishlist teaser */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100/80 card-hover transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,85,204,0.04)]">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                  Wishlist
                </h3>
                <div className="space-y-2">
                  {["Santorini, Greece", "Kyoto, Japan", "Patagonia, Argentina"].map((dest) => (
                    <Link
                      key={dest}
                      href={`/results?destination=${encodeURIComponent(dest)}&travelers=2`}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-100/80 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#0055CC] transition-colors">{dest}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0055CC] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 shrink-0">Plan →</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* AI recommendation */}
              <div
                className="rounded-[2rem] p-6 text-white shadow-xl hover:shadow-[0_20px_40px_rgba(255,107,53,0.15)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #FF6B35 0%, #f7523a 100%)" }}
              >
                {/* Decorative background shape */}
                <div className="absolute right-[-10%] top-[-10%] w-24 h-24 rounded-full bg-white/10 blur-md pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-extrabold text-sm uppercase tracking-wider">AI Recommendation</span>
                </div>
                <p className="text-white/90 text-sm font-medium mb-5 leading-relaxed">
                  Based on your travel history, you&apos;d love <strong>Kerala Backwaters</strong> next — a perfect blend of serene nature and rich culture!
                </p>
                <Link href="/results?destination=Kerala%2C%20India&travelers=2">
                  <Button
                    className="bg-white hover:bg-white/95 font-bold text-sm w-full py-5 rounded-2xl transition-all duration-300 hover:shadow-lg cursor-pointer"
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
