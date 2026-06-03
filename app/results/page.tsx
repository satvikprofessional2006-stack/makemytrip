"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  MapPin, Calendar, Users, IndianRupee, Star, Wifi, Car, Utensils,
  Coffee, Plane, Clock, ChevronDown, ChevronUp, Bookmark, Share2,
  Download, ArrowLeft, CheckCircle, Zap, Hotel,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateItinerary, type ItineraryData, type DayActivity } from "@/lib/mock-data";

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

function DayCard({ day, index }: { day: ItineraryData["days"][0]; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
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
            <span className="text-xs leading-none">Day</span>
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
              {formatINR(day.activities.reduce((s, a) => s + a.cost, 0))}
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
                <div key={ai} className="relative flex gap-4">
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
                          className="text-xs font-medium border-0 px-2"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-gray-900 text-sm">{formatINR(activity.cost)}</div>
                        <div className="text-gray-400 text-xs flex items-center gap-0.5 justify-end">
                          <Clock className="w-3 h-3" />
                          {activity.duration}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{activity.description}</p>
                    {activity.tip && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                        <span className="text-base leading-none">💡</span>
                        <span><strong>Pro tip:</strong> {activity.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetChart({ data }: { data: ItineraryData["budget"] }) {
  const total = data.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-black text-gray-900 text-lg mb-5">💰 Budget Breakdown</h3>

      {/* Visual bar */}
      <div className="flex rounded-full overflow-hidden h-4 mb-6">
        {data.map((item) => (
          <div
            key={item.category}
            style={{
              width: `${(item.amount / total) * 100}%`,
              backgroundColor: item.color,
            }}
            title={`${item.category}: ${formatINR(item.amount)}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.category} className="flex items-center gap-3">
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.category}</span>
                <span className="text-sm font-bold text-gray-900">{formatINR(item.amount)}</span>
              </div>
              <Progress
                value={(item.amount / total) * 100}
                className="h-1.5"
                style={{ "--progress-color": item.color } as React.CSSProperties}
              />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right">
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
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const destination = searchParams.get("destination") || "Goa, India";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const travelers = parseInt(searchParams.get("travelers") || "2");
  const budget = parseInt(searchParams.get("budget") || "0");

  useEffect(() => {
    setLoading(true);
    // Simulate AI generation delay
    const t = setTimeout(() => {
      setItinerary(generateItinerary(destination, startDate, endDate, travelers, budget));
      setLoading(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [destination, startDate, endDate, travelers, budget]);

  const handleSave = () => {
    if (!itinerary) return;
    const trips = JSON.parse(localStorage.getItem("travelopedia_trips") || "[]");
    const newTrip = {
      id: Date.now(),
      destination: itinerary.destination,
      duration: itinerary.duration,
      travelers: itinerary.travelers,
      budget: itinerary.usedBudget,
      status: "upcoming",
      savedAt: new Date().toISOString(),
      startDate,
      endDate,
    };
    trips.push(newTrip);
    localStorage.setItem("travelopedia_trips", JSON.stringify(trips));
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, #0055CC, #00A878)" }}
            >
              <Zap className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900 mb-2">AI is crafting your itinerary…</h2>
              <p className="text-gray-500">Analyzing {destination}, curating experiences & optimizing budget</p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: "#0055CC",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

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
                  <h1 className="text-3xl md:text-4xl font-black mb-3">{destination}</h1>
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
                      {formatINR(itinerary.usedBudget)} estimated
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saved}
                    className="gap-2 font-semibold"
                    style={{ backgroundColor: saved ? "#00A878" : "#FF6B35" }}
                  >
                    {saved ? <CheckCircle className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {saved ? "Saved!" : "Save Trip"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-2 text-white hover:bg-white/10 border border-white/20"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-2 text-white hover:bg-white/10 border border-white/20"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
              </div>

              {/* Budget gauge */}
              <div className="mt-6 bg-white/10 rounded-xl p-4">
                <div className="flex justify-between text-sm text-white/80 mb-2">
                  <span>Budget Usage</span>
                  <span>{formatINR(itinerary.usedBudget)} / {formatINR(itinerary.totalBudget)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (itinerary.usedBudget / itinerary.totalBudget) * 100)}%`,
                      background: itinerary.usedBudget > itinerary.totalBudget ? "#EF4444" : "#00A878",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Itinerary tabs */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="itinerary">
                  <TabsList className="mb-5 bg-white border border-gray-200 p-1 rounded-xl h-auto gap-1 flex-wrap">
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
                      <DayCard key={day.day} day={day} index={i} />
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
                              <div className="text-gray-400 text-xs">per night</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-700">{hotel.rating}</span>
                            <span className="text-gray-400 text-xs ml-1">· Excellent</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {hotel.amenities.map((a) => (
                              <Badge key={a} variant="secondary" className="text-xs font-medium rounded-full">
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
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xs"
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
                              <div className="text-gray-400 text-xs">Departure</div>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                              <div className="text-xs text-gray-400 mb-1">{flight.duration}</div>
                              <div className="flex items-center gap-1 w-full">
                                <div className="h-0.5 flex-1 bg-gray-300" />
                                <Plane className="w-4 h-4 text-gray-400" />
                                <div className="h-0.5 flex-1 bg-gray-300" />
                              </div>
                              {flight.stops === 0 && (
                                <div className="text-xs text-green-600 font-medium mt-1">Direct</div>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-black text-gray-900">{flight.arrival}</div>
                              <div className="text-gray-400 text-xs">Arrival</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-black" style={{ color: "#FF6B35" }}>
                              {formatINR(flight.price)}
                            </div>
                            <div className="text-gray-400 text-xs mb-3">total · {travelers} pax</div>
                            <Button
                              size="sm"
                              className="text-white font-semibold"
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
              </div>

              {/* Right sidebar */}
              <div className="space-y-5">
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
                    {["Mon", "Tue", "Wed", "Thu"].map((day) => (
                      <div key={day} className="bg-white/15 rounded-xl p-2.5">
                        <div className="text-white/70 text-xs mb-1">{day}</div>
                        <div className="text-lg">☀️</div>
                        <div className="font-bold text-sm">{28 + Math.round(Math.random() * 4)}°C</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
