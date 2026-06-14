"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  MapPin, Calendar, Users, IndianRupee, Star, Wifi, Car, Utensils,
  Coffee, Plane, Clock, ChevronDown, ChevronUp, Bookmark, Share2,
  Download, ArrowLeft, CheckCircle, Zap, Hotel, Settings2, X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { type ItineraryData, type DayActivity } from "@/lib/mock-data";
import {
  fetchItinerary,
  loadItineraryFromStorage,
  saveItineraryToStorage,
  getBudgetUsagePercent,
  getBudgetRemaining,
  ITINERARY_STORAGE_KEY,
  type ItineraryRequest,
} from "@/lib/itinerary-api";
import ItineraryLoadingOverlay from "@/components/ItineraryLoadingOverlay";
import { DestinationReviews } from "@/components/DestinationReviews";

const activityTypeConfig: Record<DayActivity["type"], { label: string; color: string; bg: string; icon: string }> = {
  food:          { label: "Food & Dining", color: "#F59E0B", bg: "#FFFBEB", icon: "🍽️" },
  activity:      { label: "Activity", color: "#6366F1", bg: "#EEF2FF", icon: "🎯" },
  transport:     { label: "Transport", color: "#0055CC", bg: "#EEF4FF", icon: "🚗" },
  accommodation: { label: "Hotel", color: "#EC4899", bg: "#FDF2F8", icon: "🏨" },
  sightseeing:   { label: "Sightseeing", color: "#00A878", bg: "#ECFDF5", icon: "🗺️" },
};

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function getCategoryAmount(itinerary: ItineraryData, ...keywords: string[]): number {
  const item = itinerary.budget.find((b) =>
    keywords.some((k) => b.category.toLowerCase().includes(k.toLowerCase()))
  );
  return item?.amount ?? 0;
}

function countPlannedActivities(itinerary: ItineraryData): number {
  return itinerary.days.reduce((sum, day) => sum + day.activities.length, 0);
}

function DayCard({ day, index, itinerary }: { day: ItineraryData["days"][0]; index: number; itinerary: ItineraryData }) {
  const [open, setOpen] = useState(index === 0);

  const dailyHotel = Math.round(getCategoryAmount(itinerary, "accommodation", "hotel") / Math.max(1, itinerary.duration));
  const dailyMeals = Math.round(getCategoryAmount(itinerary, "food", "dining") / Math.max(1, itinerary.duration));
  const dailyTransport = Math.round(getCategoryAmount(itinerary, "transport", "flight") / Math.max(1, itinerary.duration));
  const activitiesTotal = day.activities.reduce((s, a) => s + a.cost, 0);
  const dailyTotal = dailyHotel + dailyMeals + dailyTransport + activitiesTotal;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Day header */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white font-black shadow-md shrink-0"
            style={{ background: "linear-gradient(135deg, #0055CC, #00A878)" }}
          >
            <span className="text-sm leading-none">Day</span>
            <span className="text-lg leading-none">{day.day}</span>
          </div>
          <div className="text-left">
            <div className="font-bold text-gray-900">{day.theme}</div>
            <div className="text-gray-400 text-sm flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {day.date}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm text-gray-400">Day budget</div>
            <div className="font-bold text-gray-900">
              {formatINR(dailyTotal)}
            </div>
          </div>
          {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {/* Activities */}
      {open && (
        <div className="border-t border-gray-50">
          <div className="relative pl-14 pr-5 py-4 space-y-5">
            {/* Timeline line */}
            <div className="timeline-line" style={{ left: "28px" }} />

            {day.activities.map((activity, ai) => {
              const cfg = activityTypeConfig[activity.type];
              return (
                <div key={ai} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${ai * 0.05}s` }}>
                  {/* Timeline dot */}
                  <div
                    className="timeline-dot absolute shrink-0"
                    style={{ left: "-31px", top: "6px", backgroundColor: cfg.color, boxShadow: `0 0 0 3px ${cfg.color}` }}
                  />

                  <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-blue-600 font-bold text-sm font-mono">{activity.time}</span>
                        <span>{cfg.icon}</span>
                        <h4 className="font-bold text-gray-900 text-sm">{activity.title}</h4>
                        <Badge
                          variant="secondary"
                          className="text-sm font-medium border-0 px-2"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-gray-900 text-sm">{formatINR(activity.cost)}</div>
                        <div className="text-gray-400 text-sm flex items-center gap-0.5 justify-end">
                          <Clock className="w-3 h-3" />
                          {activity.duration}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{activity.description}</p>
                    {activity.tip && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                        <span className="text-base leading-none">💡</span>
                        <span><strong>Pro tip:</strong> {activity.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Daily Expense Summary */}
            <div className="mt-8 pt-5 border-t border-gray-100 pl-0 sm:pl-8">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                Daily Expense Breakdown
              </h4>
              <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">🏨 Hotel / Stay</span>
                  <span className="font-semibold">{formatINR(dailyHotel)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">🍽️ Meals (Breakfast + Lunch + Dinner)</span>
                  <span className="font-semibold">{formatINR(dailyMeals)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">🚗 Transport</span>
                  <span className="font-semibold">{formatINR(dailyTransport)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">🎯 Planned Activities</span>
                  <span className="font-semibold">{formatINR(activitiesTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-black pt-3 border-t border-gray-200 mt-2">
                  <span>Day Total</span>
                  <span className="text-blue-600">{formatINR(dailyTotal)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function BudgetChart({ data }: { data: ItineraryData["budget"] }) {
  const total = data.reduce((s, b) => s + b.amount, 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <h3 className="font-black text-gray-900 text-lg mb-5">💰 Budget Breakdown</h3>

      {/* Visual bar */}
      <div className="flex rounded-full overflow-hidden h-4 mb-6 bg-gray-100">
        {data.map((item, i) => (
          <div
            key={item.category}
            style={{
              width: mounted ? `${(item.amount / total) * 100}%` : "0%",
              backgroundColor: item.color,
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: `${i * 0.1}s`
            }}
            title={`${item.category}: ${formatINR(item.amount)}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.category} className="flex items-center gap-3">
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.category}</span>
                <span className="text-sm font-bold text-gray-900">{formatINR(item.amount)}</span>
              </div>
              <Progress
                value={mounted ? (item.amount / total) * 100 : 0}
                className="h-1.5 transition-all duration-1000"
                style={{ "--progress-color": item.color, transitionDelay: `${i * 0.1}s` } as React.CSSProperties}
              />
            </div>
            <span className="text-sm text-gray-400 w-10 text-right">
              {Math.round((item.amount / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);
  
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [prefs, setPrefs] = useState({
    style: "⚖ Balanced",
    stay: "🏨 Hotel",
    food: "🍗 Non-Veg",
    pace: "⚡ Moderate",
    interests: [] as string[]
  });

  const destination = searchParams.get("destination") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const travelers = parseInt(searchParams.get("travelers") || "2");
  const budget = parseInt(searchParams.get("budget") || "0");

  const request: ItineraryRequest = {
    destination,
    startDate,
    endDate,
    travelers,
    budget,
    preferences: prefs,
  };

  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadItinerary() {
      const cached = loadItineraryFromStorage(request);
      if (cached && refreshKey === 0) {
        setItinerary(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      if (!destination || !startDate || !endDate || !budget) {
        setLoading(false);
        setError("Something went wrong, please try again");
        return;
      }

      try {
        const data = await fetchItinerary(request);
        if (!cancelled) {
          saveItineraryToStorage(request, data);
          setItinerary(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setError(err instanceof Error ? err.message : "Something went wrong, please try again");
        }
      }
    }

    loadItinerary();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, startDate, endDate, travelers, budget, refreshKey]);

  const handleSave = async () => {
    if (!itinerary) return;
    if (!user) {
      router.push("/login");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    const { error } = await supabase.from("trips").insert({
      user_id: user.id,
      destination: itinerary.destination,
      start_date: startDate,
      end_date: endDate,
      num_travelers: itinerary.travelers,
      budget: itinerary.usedBudget,
      itinerary: itinerary
    });

    setIsSaving(false);

    if (error) {
      console.error("Failed to save trip:", error);
      alert("Failed to save trip. Please try again.");
    } else {
      setSaved(true);
      alert("✓ Trip saved to dashboard!");
    }
  };

  const handleBookTrip = () => {
    setIsBooking(true);
  };

  const handleRegenerate = () => {
    setIsEditPanelOpen(false);
    sessionStorage.removeItem(ITINERARY_STORAGE_KEY);
    setRefreshKey((k) => k + 1);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <ItineraryLoadingOverlay />;
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20">
          <p className="text-red-500 text-lg font-semibold mb-6">
            {error || "Something went wrong, please try again"}
          </p>
          <Button
            onClick={() => router.push("/")}
            className="gap-2"
            style={{ backgroundColor: "#0055CC" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        {!loading && itinerary && (
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div
              className="rounded-2xl p-6 md:p-8 mb-8 text-white"
              style={{
                background: "linear-gradient(135deg, #001A4D 0%, #0055CC 50%, #003D30 100%)",
              }}
            >
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to search
              </button>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    AI-Generated Itinerary
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black mb-3">{itinerary.destination}</h1>
                  <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {itinerary.duration} days
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {travelers} traveler{travelers > 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4" />
                      {formatINR(itinerary.usedBudget)} planned
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleBookTrip}
                    className="gap-2 font-semibold shadow-xl hover:shadow-orange-500/30 transition-all btn-premium-hover text-white h-11"
                    style={{ background: "linear-gradient(135deg, #FF6B35 0%, #f7523a 100%)" }}
                  >
                    <Zap className="w-4 h-4" />
                    Book Entire Trip
                  </Button>
                  <Button
                    onClick={user ? handleSave : () => router.push("/login")}
                    disabled={saved || isSaving}
                    className="gap-2 font-semibold h-11"
                    style={{ backgroundColor: saved ? "#00A878" : "rgba(255,255,255,0.15)", color: "white" }}
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : saved ? "Saved ✓" : user ? "Save This Trip" : "Sign in to Save Trip"}
                  </Button>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => setIsShareOpen(!isShareOpen)}
                      className="gap-2 text-white hover:bg-white/10 border border-white/20 h-11"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    
                    {isShareOpen && (
                      <>
                        <div className="fixed inset-0 z-[150] bg-black/40 sm:bg-transparent" onClick={() => setIsShareOpen(false)} />
                        <div className="fixed top-1/2 left-4 right-4 -translate-y-1/2 sm:absolute sm:top-[calc(100%+0.5rem)] sm:right-0 sm:left-auto sm:translate-y-0 sm:w-[280px] bg-white rounded-2xl shadow-2xl z-[160] p-5 border border-gray-100 flex flex-col gap-3 animate-scale-in text-left origin-center sm:origin-top-right">
                          <h3 className="font-bold text-gray-900 mb-1">Share This Trip Plan</h3>
                          
                          <Button 
                            className="w-full justify-start gap-3 bg-[#25D366] hover:bg-[#20b858] text-white font-bold h-11 rounded-xl"
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my ${itinerary.destination} trip plan on Travelopedia!`)}`, "_blank")}
                          >
                            <span className="text-xl leading-none">📱</span> Share on WhatsApp
                          </Button>

                          <Button 
                            className="w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl"
                            onClick={handleCopyLink}
                          >
                            <span className="text-xl leading-none">🔗</span> {copied ? "✓ Copied!" : "Copy Link"}
                          </Button>

                          <Button 
                            className="w-full justify-start gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold h-11 rounded-xl"
                            onClick={() => window.location.href = `mailto:?subject=Check out my trip plan`}
                          >
                            <span className="text-xl leading-none">📧</span> Share via Email
                          </Button>

                          <p className="text-sm text-gray-500 mt-2 text-center">
                            Anyone with the link can view this plan for free
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="gap-2 text-white hover:bg-white/10 border border-white/20 h-11"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => setIsEditPanelOpen(true)}
                    variant="ghost"
                    className="gap-2 text-white hover:bg-white/10 border border-white/20 h-11"
                  >
                    <Settings2 className="w-4 h-4" />
                    Edit This Plan
                  </Button>
                </div>
              </div>

              {/* Budget gauge */}
              <div className="mt-6 bg-white/10 rounded-xl p-4">
                <div className="flex flex-wrap justify-between gap-2 text-sm text-white/80 mb-2">
                  <span>Budget Usage</span>
                  <span>
                    {formatINR(itinerary.usedBudget)} planned of {formatINR(itinerary.totalBudget)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${getBudgetUsagePercent(itinerary)}%`,
                      background:
                        itinerary.usedBudget > itinerary.totalBudget
                          ? "#EF4444"
                          : getBudgetUsagePercent(itinerary) >= 95
                            ? "#F59E0B"
                            : "#00A878",
                    }}
                  />
                </div>
                <div className="flex flex-wrap justify-between gap-2 mt-2 text-xs text-white/60">
                  <span>{getBudgetUsagePercent(itinerary)}% of your max budget</span>
                  {getBudgetRemaining(itinerary) > 0 && (
                    <span className="text-green-300">
                      {formatINR(getBudgetRemaining(itinerary))} remaining
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Itinerary tabs */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="itinerary">
                  <TabsList className="mb-5 bg-white border border-gray-200 p-1 rounded-xl h-auto gap-1 flex-nowrap overflow-x-auto whitespace-nowrap justify-start w-full no-scrollbar">
                    <TabsTrigger value="itinerary" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
                      📅 Day-wise Plan
                    </TabsTrigger>
                    <TabsTrigger value="hotels" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
                      🏨 Hotels
                    </TabsTrigger>
                    <TabsTrigger value="flights" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
                      ✈️ Flights
                    </TabsTrigger>
                  </TabsList>

                  {/* Itinerary tab */}
                  <TabsContent value="itinerary" className="space-y-4 mt-0">
                    {itinerary.days.map((day, i) => (
                      <DayCard key={day.day} day={day} index={i} itinerary={itinerary} />
                    ))}
                  </TabsContent>

                  {/* Hotels tab */}
                  <TabsContent value="hotels" className="space-y-4 mt-0">
                    {itinerary.hotels.map((hotel, i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
                        <div className="sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden">
                          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5 flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                              <span className="text-gray-500 text-sm">{hotel.type}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black" style={{ color: "#0055CC" }}>
                                {formatINR(hotel.pricePerNight)}
                              </div>
                              <div className="text-gray-400 text-sm">per night</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-700">{hotel.rating}</span>
                            <span className="text-gray-400 text-sm ml-1">· Excellent</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {hotel.amenities.map((a) => (
                              <Badge key={a} variant="secondary" className="text-sm font-medium rounded-full">
                                {a === "Free WiFi" ? <Wifi className="w-3 h-3 mr-1" /> : a === "Airport Pickup" ? <Car className="w-3 h-3 mr-1" /> : a === "Restaurant" || a === "Breakfast" ? <Utensils className="w-3 h-3 mr-1" /> : a === "Rooftop Bar" ? <Coffee className="w-3 h-3 mr-1" /> : null}
                                {a}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            className="text-white text-sm font-semibold"
                            style={{ backgroundColor: "#0055CC" }}
                          >
                            <Hotel className="w-4 h-4 mr-2" />
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Flights tab */}
                  <TabsContent value="flights" className="space-y-4 mt-0">
                    {itinerary.flights.map((flight, i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm"
                              style={{ backgroundColor: i === 0 ? "#0055CC" : i === 1 ? "#FF6B35" : "#00A878" }}
                            >
                              {flight.airline.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{flight.airline}</div>
                              <div className="text-gray-400 text-sm">
                                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-1 justify-center">
                            <div className="text-center">
                              <div className="text-xl font-black text-gray-900">{flight.departure}</div>
                              <div className="text-gray-400 text-sm">Departure</div>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                              <div className="text-sm text-gray-400 mb-1">{flight.duration}</div>
                              <div className="flex items-center gap-1 w-full">
                                <div className="h-0.5 flex-1 bg-gray-300" />
                                <Plane className="w-4 h-4 text-gray-400" />
                                <div className="h-0.5 flex-1 bg-gray-300" />
                              </div>
                              {flight.stops === 0 && (
                                <div className="text-sm text-green-600 font-medium mt-1">Direct</div>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-black text-gray-900">{flight.arrival}</div>
                              <div className="text-gray-400 text-sm">Arrival</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-black" style={{ color: "#FF6B35" }}>
                              {formatINR(flight.price)}
                            </div>
                            <div className="text-gray-400 text-sm mb-3">total · {travelers} pax</div>
                            <Button
                              className="text-white font-semibold h-11 w-full sm:w-auto mt-2 sm:mt-0"
                              style={{ backgroundColor: "#0055CC" }}
                            >
                              Book
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <DestinationReviews destination={destination} />
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-5 lg:sticky lg:top-24 h-fit">
                <BudgetChart data={itinerary.budget} />

                {/* Quick tips */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-900 mb-4">🌟 Travel Tips</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    {[
                      "Book flights 6–8 weeks in advance for best prices",
                      "Carry a photocopy of your passport at all times",
                      "Download offline maps before you travel",
                      "Always keep emergency contact numbers handy",
                      "Check local customs & dress codes before visiting",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weather */}
                <div
                  className="rounded-2xl p-5 text-white"
                  style={{ background: "linear-gradient(135deg, #0096C7, #00B4D8)" }}
                >
                  <h3 className="font-black mb-3">🌤️ Weather Forecast</h3>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    {["Mon", "Tue", "Wed", "Thu"].map((day, index) => (
                      <div key={day} className="bg-white/15 rounded-xl p-2.5">
                        <div className="text-white/70 text-sm mb-1">{day}</div>
                        <div className="text-lg">☀️</div>
                        <div className="font-bold text-sm">{28 + (index % 4)}°C</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBooking} onOpenChange={setIsBooking}>
        <DialogContent className="sm:max-w-md w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:w-[95vw] overflow-y-auto p-0 border-0 shadow-2xl rounded-none sm:rounded-2xl md:rounded-3xl bg-gray-50 flex flex-col">
          <div className="p-5 md:p-8 flex-1">
            <DialogTitle className="text-2xl font-black text-gray-900 mb-1">Complete Your Booking</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mb-6">
              Book each part separately on our trusted partners
            </DialogDescription>

            <div className="space-y-4">
              {/* Card 1 — Flights */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 text-lg leading-none">✈️</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900">Flights</h4>
                    <div className="text-sm text-gray-600">Delhi → {itinerary.destination.split(",")[0]}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{startDate}, {travelers} travelers</div>
                    <div className="text-sm font-bold text-blue-600 mt-1">
                      {formatINR(getCategoryAmount(itinerary, "transport", "flight"))} total
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl"
                  onClick={() => window.open("https://www.makemytrip.com", "_blank")}
                >
                  Book on MakeMyTrip →
                </Button>
              </div>

              {/* Card 2 — Hotels */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="text-orange-600 text-lg leading-none">🏨</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900">Hotels</h4>
                    <div className="text-sm text-gray-600">{itinerary.destination.split(",")[0]} · {startDate} – {endDate}</div>
                    <div className="text-sm text-gray-400 mt-0.5">1 room, {travelers} guests</div>
                    <div className="text-sm font-bold text-orange-600 mt-1">
                      {formatINR(Math.round(getCategoryAmount(itinerary, "accommodation", "hotel") / Math.max(1, itinerary.duration)))} per night
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-[#FF6B35] hover:bg-[#e55a29] text-white font-bold h-11 rounded-xl"
                  onClick={() => window.open("https://www.booking.com", "_blank")}
                >
                  Book on Booking.com →
                </Button>
              </div>

              {/* Card 3 — Activities */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-lg leading-none">🎯</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900">Activities & Experiences</h4>
                    <div className="text-sm text-gray-600">{countPlannedActivities(itinerary)} experiences planned</div>
                    <div className="text-sm text-gray-400 mt-0.5">Across {itinerary.duration} days</div>
                    <div className="text-sm font-bold text-green-600 mt-1">
                      {formatINR(getCategoryAmount(itinerary, "activities"))} total
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-[#00A878] hover:bg-[#008f65] text-white font-bold h-11 rounded-xl"
                  onClick={() => window.open("https://www.thrillophilia.com", "_blank")}
                >
                  Explore on Thrillophilia →
                </Button>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5 text-center">
              <div className="font-black text-gray-900 text-lg mb-1">
                Total planned: {itinerary ? formatINR(itinerary.usedBudget) : "—"}
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Each partner opens in a new tab. Book in any order you prefer.
              </p>
              <Button 
                variant="outline"
                className="w-full h-11 font-bold text-gray-600 border-gray-200 hover:bg-gray-100 rounded-xl bg-gray-100/50"
                onClick={() => setIsBooking(false)}
              >
                I&apos;ll Book Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Trip Preferences Slide-over */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[110] transition-opacity duration-300 ${isEditPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsEditPanelOpen(false)}
      />
      
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-white z-[120] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isEditPanelOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-black text-gray-900">Customize Your Trip</h2>
          <button onClick={() => setIsEditPanelOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Section 1 */}
          <div>
            <label className="block font-bold text-gray-900 mb-3">Travel Style</label>
            <div className="flex flex-col gap-2">
              {[
                {name: "Budget", icon: "🎒", desc: "Keep it light on the pocket"},
                {name: "Balanced", icon: "⚖", desc: "A mix of comfort and savings"},
                {name: "Premium", icon: "💎", desc: "Luxury and premium experiences"}
              ].map(pref => (
                <button
                  key={pref.name}
                  onClick={() => setPrefs({...prefs, style: pref.name})}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all border ${
                    prefs.style === pref.name ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-2xl">{pref.icon}</div>
                  <div className="flex-1 text-left">
                    <div className={`font-bold ${prefs.style === pref.name ? "text-blue-900" : "text-gray-900"}`}>{pref.name}</div>
                    <div className="text-xs text-gray-500">{pref.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <label className="block font-bold text-gray-900 mb-3">Stay Preference</label>
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
              {["🛏 Hostel", "🏨 Hotel", "🏖 Resort"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setPrefs({...prefs, stay: opt})}
                  className={`flex-1 py-2.5 px-1 text-sm sm:text-sm font-semibold rounded-lg transition-all ${
                    prefs.stay === opt ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <label className="block font-bold text-gray-900 mb-3">Food Preference</label>
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
              {["🌿 Vegetarian", "🍗 Non-Veg", "🍽 Both"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setPrefs({...prefs, food: opt})}
                  className={`flex-1 py-2.5 px-1 text-sm sm:text-sm font-semibold rounded-lg transition-all ${
                    prefs.food === opt ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <label className="block font-bold text-gray-900 mb-3">How packed should it be?</label>
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
              {["😌 Relaxed", "⚡ Moderate", "🔥 Packed"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setPrefs({...prefs, pace: opt})}
                  className={`flex-1 py-2.5 px-1 text-sm sm:text-sm font-semibold rounded-lg transition-all ${
                    prefs.pace === opt ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <label className="block font-bold text-gray-900 mb-3">What do you enjoy?</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Adventure & Sports", "History & Culture", 
                "Food & Nightlife", "Nature & Wildlife", 
                "Shopping", "Photography Spots", 
                "Hidden Gems", "Family Friendly"
              ].map(interest => {
                const isSelected = prefs.interests.includes(interest);
                return (
                  <label key={interest} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors select-none ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-600'}`}>{interest}</span>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setPrefs({...prefs, interests: prefs.interests.filter(i => i !== interest)});
                        } else {
                          setPrefs({...prefs, interests: [...prefs.interests, interest]});
                        }
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button 
            onClick={handleRegenerate} 
            className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl mb-3 shadow-lg shadow-blue-600/20"
          >
            🔄 Regenerate My Plan
          </Button>
          <p className="text-center text-sm text-gray-500 font-medium">Your preferences are saved for future trips</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading…</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
