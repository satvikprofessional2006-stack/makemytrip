"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Calendar, Users, IndianRupee, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const popularDestinations = [
  "Goa, India", "Rajasthan, India", "Kerala, India", "Manali, India",
  "Bali, Indonesia", "Paris, France", "Maldives", "Singapore",
  "Dubai, UAE", "Thailand", "Nepal", "Ladakh, India",
];

export default function SearchForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    budget: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleDestinationChange = (val: string) => {
    setForm({ ...form, destination: val });
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destination) return;
    const params = new URLSearchParams({
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      travelers: form.travelers,
      budget: form.budget,
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="glass-card-dark rounded-2xl p-6 md:p-8 w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Destination */}
        <div className="lg:col-span-3 relative">
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
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
              className="pl-10 bg-black/20 border-white/30 text-white placeholder:text-white/60 focus:border-white focus:ring-white/20 h-12 rounded-xl"
              autoComplete="off"
              required
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
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
            Departure Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none" />
            <Input
              id="start-date-input"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="pl-10 bg-black/20 border-white/30 text-white focus:border-white h-12 rounded-xl [color-scheme:dark]"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
            Return Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none" />
            <Input
              id="end-date-input"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="pl-10 bg-black/20 border-white/30 text-white focus:border-white h-12 rounded-xl [color-scheme:dark]"
              min={form.startDate || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Travelers */}
        <div>
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
            Travelers
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none z-10" />
            <Select
              value={form.travelers}
              onValueChange={(v) => setForm({ ...form, travelers: v as string })}
            >
              <SelectTrigger
                id="travelers-select"
                className="pl-10 bg-black/20 border-white/30 text-white h-12 rounded-xl focus:border-white data-[state=open]:border-white"
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
        </div>

        {/* Budget */}
        <div>
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
            Max Budget (INR)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 pointer-events-none" />
            <Input
              id="budget-input"
              type="number"
              placeholder="e.g. 50000"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="pl-10 bg-black/20 border-white/30 text-white placeholder:text-white/60 focus:border-white h-12 rounded-xl"
              min="0"
              step="1000"
            />
          </div>
        </div>

        {/* Search button */}
        <div className="md:col-span-2 lg:col-span-2 flex items-end">
          <Button
            id="search-btn"
            type="submit"
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

      {/* Popular quick picks */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="text-white/50 text-xs font-medium self-center">Popular:</span>
        {["Goa", "Bali", "Rajasthan", "Maldives", "Ladakh"].map((dest) => (
          <button
            key={dest}
            type="button"
            onClick={() => setForm({ ...form, destination: dest + ", " + (dest === "Bali" ? "Indonesia" : dest === "Maldives" ? "Maldives" : "India") })}
            className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200"
          >
            {dest}
          </button>
        ))}
      </div>
    </form>
  );
}
