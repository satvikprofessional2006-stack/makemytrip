"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Users, IndianRupee, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ItineraryLoadingOverlay from "@/components/ItineraryLoadingOverlay";
import { fetchItinerary, saveItineraryToStorage } from "@/lib/itinerary-api";

const popularDestinations = [
  "Goa, India", "Rajasthan, India", "Kerala, India", "Manali, India",
  "Bali, Indonesia", "Paris, France", "Maldives", "Singapore",
  "Dubai, UAE", "Thailand", "Nepal", "Ladakh, India",
];

const DESTINATION_BUDGETS: Record<string, number> = {
  "paris": 8000,
  "london": 9000,
  "goa": 1500,
  "bangkok": 2000,
  "bali": 2500,
  "dubai": 5000,
  "delhi": 1000,
  "mumbai": 1500,
  "jaipur": 1200,
  "rajasthan": 1300,
  "kerala": 1800,
  "maldives": 4000,
  "singapore": 3500,
  "japan": 6000,
  "new york": 8000,
  "barcelona": 5000,
  "amsterdam": 5000,
  "sydney": 7000,
  "hong kong": 4000,
  "thailand": 1800,
};

function getMinimumBudget(destination: string, days: number, travelers: number) {
  const destLower = destination.toLowerCase();
  let dailyRate = 3000; // default minimum if not matched
  
  for (const [key, value] of Object.entries(DESTINATION_BUDGETS)) {
    if (destLower.includes(key)) {
      dailyRate = value;
      break;
    }
  }
  
  return dailyRate * days * travelers;
}

type FormFields = {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: string;
};

type FieldErrors = Partial<Record<keyof FormFields, string>>;

export default function SearchForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormFields>({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    budget: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const minimumBudget = (() => {
    if (form.destination && form.startDate && form.endDate && form.travelers) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const travelers = parseInt(form.travelers, 10);
      return getMinimumBudget(form.destination, days, travelers);
    }
    return null;
  })();

  const handleDestinationChange = (val: string) => {
    setForm({ ...form, destination: val });
    if (errors.destination) setErrors({ ...errors, destination: undefined });
    if (val.length > 1) {
      const filtered = popularDestinations.filter((d) =>
        d.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!form.destination.trim()) {
      newErrors.destination = "Please enter a destination";
    }
    if (!form.startDate) {
      newErrors.startDate = "Please select a departure date";
    }
    if (!form.endDate) {
      newErrors.endDate = "Please select a return date";
    }
    if (!form.travelers) {
      newErrors.travelers = "Please select number of travelers";
    }
    if (!form.budget || Number(form.budget) <= 0) {
      newErrors.budget = "Please enter your budget";
    } else if (minimumBudget && Number(form.budget) < minimumBudget) {
      newErrors.budget = `Budget must be at least ₹${new Intl.NumberFormat('en-IN').format(minimumBudget)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    const request = {
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      travelers: parseInt(form.travelers, 10),
      budget: parseInt(form.budget, 10),
    };

    setLoading(true);

    try {
      const itinerary = await fetchItinerary(request);
      saveItineraryToStorage(request, itinerary);

      const params = new URLSearchParams({
        destination: request.destination,
        startDate: request.startDate,
        endDate: request.endDate,
        travelers: String(request.travelers),
        budget: String(request.budget),
      });
      router.push(`/results?${params.toString()}`);
    } catch {
      setLoading(false);
      setSubmitError("Something went wrong, please try again");
    }
  };

  const clearFieldError = (field: keyof FormFields) => {
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  return (
    <>
      {loading && <ItineraryLoadingOverlay />}

      <form
        onSubmit={handleSearch}
        className="glass-card-dark rounded-3xl p-6 md:p-8 w-full max-w-4xl mx-auto border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.08)] bg-white relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Destination */}
          <div className="lg:col-span-3 relative">
            <label className="block text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              Where do you want to go?
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none"
              />
              <Input
                id="destination-input"
                type="text"
                placeholder="e.g. Goa, Bali, Paris..."
                value={form.destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => form.destination.length > 1 && setShowSuggestions(true)}
                className={`pl-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0055CC] focus:ring-4 focus:ring-blue-100/50 h-12.5 rounded-xl md:text-sm text-base transition-all ${errors.destination ? "border-red-400" : ""}`}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-100 z-20 overflow-hidden divide-y divide-slate-50">
                  {suggestions.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-2.5 px-4.5 py-3 cursor-pointer hover:bg-blue-50/50 text-slate-700 text-sm font-semibold transition-colors"
                      onMouseDown={() => {
                        setForm({ ...form, destination: s });
                        setShowSuggestions(false);
                        clearFieldError("destination");
                      }}
                    >
                      <MapPin className="w-4 h-4 text-[#0055CC] shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.destination && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.destination}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" />
              <Input
                id="start-date-input"
                type="date"
                value={form.startDate}
                onChange={(e) => {
                  setForm({ ...form, startDate: e.target.value });
                  clearFieldError("startDate");
                }}
                className={`pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#0055CC] focus:ring-4 focus:ring-blue-100/50 h-12.5 rounded-xl [color-scheme:light] md:text-sm text-base transition-all ${errors.startDate ? "border-red-400" : ""}`}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            {errors.startDate && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" />
              <Input
                id="end-date-input"
                type="date"
                value={form.endDate}
                onChange={(e) => {
                  setForm({ ...form, endDate: e.target.value });
                  clearFieldError("endDate");
                }}
                className={`pl-11 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#0055CC] focus:ring-4 focus:ring-blue-100/50 h-12.5 rounded-xl [color-scheme:light] md:text-sm text-base transition-all ${errors.endDate ? "border-red-400" : ""}`}
                min={form.startDate || new Date().toISOString().split("T")[0]}
              />
            </div>
            {errors.endDate && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.endDate}</p>
            )}
          </div>

          {/* Travelers */}
          <div>
            <label className="block text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              Travelers
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none z-10" />
              <Select
                value={form.travelers}
                onValueChange={(v) => {
                  setForm({ ...form, travelers: v as string });
                  clearFieldError("travelers");
                }}
              >
                <SelectTrigger
                  id="travelers-select"
                  className={`pl-11 bg-slate-50 border-slate-200 text-slate-900 h-12.5 rounded-xl focus:bg-white focus:border-[#0055CC] focus:ring-4 focus:ring-blue-100/50 data-[state=open]:border-[#0055CC] md:text-sm text-base transition-all ${errors.travelers ? "border-red-400" : ""}`}
                >
                  <SelectValue placeholder="Travelers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)} className="font-semibold text-slate-700">
                      {n} {n === 1 ? "Traveler" : "Travelers"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.travelers && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">{errors.travelers}</p>
            )}
          </div>

          {/* Budget */}
          <div className="relative">
            <label className="block text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-2 h-[20px]">
              Max Budget (INR)
              {minimumBudget !== null && (
                <span className="text-[#FF6B35] ml-2 normal-case tracking-normal font-bold">
                  Min: ₹{new Intl.NumberFormat('en-IN').format(minimumBudget)}
                </span>
              )}
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" />
              <Input
                id="budget-input"
                type="number"
                placeholder="e.g. 50000"
                value={form.budget}
                onChange={(e) => {
                  setForm({ ...form, budget: e.target.value });
                  clearFieldError("budget");
                }}
                className={`pl-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0055CC] focus:ring-4 focus:ring-blue-100/50 h-12.5 rounded-xl md:text-sm text-base transition-all ${errors.budget ? "border-red-400" : ""}`}
                min={minimumBudget !== null ? minimumBudget : "0"}
                step="1000"
              />
            </div>
            {errors.budget && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1 whitespace-nowrap">{errors.budget}</p>
            )}
            {!errors.budget && minimumBudget !== null && Number(form.budget) > 0 && Number(form.budget) < minimumBudget && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 pl-1 whitespace-nowrap">
                <span>❌</span> 
                <span>Minimum ₹{new Intl.NumberFormat('en-IN').format(minimumBudget)}</span>
              </p>
            )}
          </div>

          {/* Search button */}
          <div className="md:col-span-2 lg:col-span-2 flex items-start pt-[28px]">
            <Button
              id="search-btn"
              type="submit"
              disabled={loading || (minimumBudget !== null && Number(form.budget) > 0 && Number(form.budget) < minimumBudget)}
              className={`w-full h-12.5 text-base font-bold rounded-xl btn-premium-hover gap-2 text-white transition-all cursor-pointer ${
                minimumBudget !== null && Number(form.budget) > 0 && Number(form.budget) < minimumBudget
                  ? "bg-slate-300 hover:bg-slate-300 opacity-50 cursor-not-allowed text-slate-500"
                  : ""
              }`}
              style={{
                background: minimumBudget !== null && Number(form.budget) > 0 && Number(form.budget) < minimumBudget
                  ? "#E2E8F0" 
                  : "linear-gradient(135deg, #FF6B35 0%, #f7523a 100%)",
              }}
            >
              {minimumBudget !== null && Number(form.budget) > 0 && Number(form.budget) < minimumBudget ? (
                "Enter Valid Details"
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Itinerary
                  <Search className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {submitError && (
          <p className="text-red-500 text-xs font-semibold mt-4 text-center">{submitError}</p>
        )}

        {/* Popular quick picks */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider self-center mr-1">Popular Quick Picks:</span>
          {["Goa", "Bali", "Rajasthan", "Maldives", "Ladakh"].map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => {
                setForm({ ...form, destination: dest + ", " + (dest === "Bali" ? "Indonesia" : dest === "Maldives" ? "Maldives" : "India") });
                clearFieldError("destination");
              }}
              className="text-xs px-3.5 py-2 rounded-full border border-slate-200/80 text-slate-600 hover:text-[#0055CC] hover:border-[#0055CC]/40 hover:bg-blue-50/50 transition-all duration-200 bg-slate-50/50 font-semibold cursor-pointer"
            >
              {dest}
            </button>
          ))}
        </div>
      </form>
    </>
  );
}
