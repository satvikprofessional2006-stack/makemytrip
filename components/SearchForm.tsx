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
  const [suggestedBudget, setSuggestedBudget] = useState<number | null>(null);

  useEffect(() => {
    if (form.destination && form.startDate && form.endDate && form.travelers) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const travelers = parseInt(form.travelers, 10);
      
      const minBudget = getMinimumBudget(form.destination, days, travelers);
      
      if (!form.budget || parseInt(form.budget, 10) < minBudget) {
        setSuggestedBudget(minBudget);
      } else {
        setSuggestedBudget(null);
      }
    } else {
      setSuggestedBudget(null);
    }
  }, [form.destination, form.startDate, form.endDate, form.travelers, form.budget]);

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
        className="glass-card-dark rounded-2xl p-6 md:p-8 w-full max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Destination */}
          <div className="lg:col-span-3 relative">
            <label className="block text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">
              Where do you want to go?
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none"
              />
              <Input
                id="destination-input"
                type="text"
                placeholder="e.g. Goa, Bali, Paris..."
                value={form.destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => form.destination.length > 1 && setShowSuggestions(true)}
                className={`pl-10 bg-black/20 border-white/30 text-white placeholder:text-white/60 focus:border-white focus:ring-white/20 h-12 rounded-xl md:text-sm text-base ${errors.destination ? "border-red-400" : ""}`}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                  {suggestions.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-blue-50 text-gray-700 text-sm transition-colors"
                      onMouseDown={() => {
                        setForm({ ...form, destination: s });
                        setShowSuggestions(false);
                        clearFieldError("destination");
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.destination && (
              <p className="text-red-400 text-sm mt-1.5">{errors.destination}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none" />
              <Input
                id="start-date-input"
                type="date"
                value={form.startDate}
                onChange={(e) => {
                  setForm({ ...form, startDate: e.target.value });
                  clearFieldError("startDate");
                }}
                className={`pl-10 bg-black/20 border-white/30 text-white focus:border-white h-12 rounded-xl [color-scheme:dark] md:text-sm text-base ${errors.startDate ? "border-red-400" : ""}`}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            {errors.startDate && (
              <p className="text-red-400 text-sm mt-1.5">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none" />
              <Input
                id="end-date-input"
                type="date"
                value={form.endDate}
                onChange={(e) => {
                  setForm({ ...form, endDate: e.target.value });
                  clearFieldError("endDate");
                }}
                className={`pl-10 bg-black/20 border-white/30 text-white focus:border-white h-12 rounded-xl [color-scheme:dark] md:text-sm text-base ${errors.endDate ? "border-red-400" : ""}`}
                min={form.startDate || new Date().toISOString().split("T")[0]}
              />
            </div>
            {errors.endDate && (
              <p className="text-red-400 text-sm mt-1.5">{errors.endDate}</p>
            )}
          </div>

          {/* Travelers */}
          <div>
            <label className="block text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">
              Travelers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none z-10" />
              <Select
                value={form.travelers}
                onValueChange={(v) => {
                  setForm({ ...form, travelers: v as string });
                  clearFieldError("travelers");
                }}
              >
                <SelectTrigger
                  id="travelers-select"
                  className={`pl-10 bg-black/20 border-white/30 text-white h-12 rounded-xl focus:border-white data-[state=open]:border-white md:text-sm text-base ${errors.travelers ? "border-red-400" : ""}`}
                >
                  <SelectValue placeholder="Travelers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "Traveler" : "Travelers"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.travelers && (
              <p className="text-red-400 text-sm mt-1.5">{errors.travelers}</p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">
              Max Budget (INR)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none" />
              <Input
                id="budget-input"
                type="number"
                placeholder="e.g. 50000"
                value={form.budget}
                onChange={(e) => {
                  setForm({ ...form, budget: e.target.value });
                  clearFieldError("budget");
                }}
                className={`pl-10 bg-black/20 border-white/30 text-white placeholder:text-white/60 focus:border-white h-12 rounded-xl md:text-sm text-base ${errors.budget ? "border-red-400" : ""}`}
                min="0"
                step="1000"
              />
            </div>
            {errors.budget && (
              <p className="text-red-400 text-sm mt-1.5">{errors.budget}</p>
            )}
            {suggestedBudget !== null && (
              <div className="mt-2.5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-md">
                <p className="text-blue-100 font-medium text-xs flex items-start gap-1.5">
                  <span className="text-sm leading-none">💡</span>
                  <span>Recommended minimum: <strong>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(suggestedBudget)}</strong></span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, budget: String(suggestedBudget) });
                    clearFieldError("budget");
                  }}
                  className="mt-1.5 text-blue-300 hover:text-white text-xs font-semibold flex items-center transition-colors ml-5"
                >
                  Apply this budget →
                </button>
              </div>
            )}
          </div>

          {/* Search button */}
          <div className="md:col-span-2 lg:col-span-2 flex items-end">
            <Button
              id="search-btn"
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold rounded-xl btn-premium-hover gap-2 text-white"
              style={{
                background: "linear-gradient(135deg, #FF6B35 0%, #f7523a 100%)",
              }}
            >
              <Sparkles className="w-5 h-5" />
              Generate AI Itinerary
              <Search className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {submitError && (
          <p className="text-red-400 text-sm mt-4 text-center font-medium">{submitError}</p>
        )}

        {/* Popular quick picks */}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="text-white/50 text-sm font-medium self-center">Popular:</span>
          {["Goa", "Bali", "Rajasthan", "Maldives", "Ladakh"].map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => {
                setForm({ ...form, destination: dest + ", " + (dest === "Bali" ? "Indonesia" : dest === "Maldives" ? "Maldives" : "India") });
                clearFieldError("destination");
              }}
              className="text-sm px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200"
            >
              {dest}
            </button>
          ))}
        </div>
      </form>
    </>
  );
}
