import type { ItineraryData, DayActivity } from "@/lib/mock-data";
import { generateItinerary } from "@/lib/mock-data";

export interface ItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferences?: {
    style: string;
    stay: string;
    food: string;
    pace: string;
    interests: string[];
  };
}

export interface ApiItinerary {
  destination: string;
  totalDays: number;
  totalCost: number;
  budgetBreakdown: {
    flights: number;
    accommodation: number;
    transport: number;
    food: number;
    activities: number;
    buffer: number;
  };
  days: {
    dayNumber: number;
    date: string;
    title: string;
    activities: {
      time: string;
      name: string;
      description: string;
      cost: number;
      duration: string;
      icon?: string;
      type: string;
    }[];
  }[];
}

export const ITINERARY_STORAGE_KEY = "travelopedia_current_itinerary";

const BUDGET_BREAKDOWN_KEYS = [
  "flights",
  "accommodation",
  "transport",
  "food",
  "activities",
  "buffer",
] as const;

export function sumBreakdown(breakdown: ApiItinerary["budgetBreakdown"]): number {
  return BUDGET_BREAKDOWN_KEYS.reduce((sum, key) => sum + breakdown[key], 0);
}

export function getBudgetUsagePercent(itinerary: ItineraryData): number {
  if (!itinerary.totalBudget) return 0;
  return Math.min(100, Math.round((itinerary.usedBudget / itinerary.totalBudget) * 100));
}

export function getBudgetRemaining(itinerary: ItineraryData): number {
  return Math.max(0, itinerary.totalBudget - itinerary.usedBudget);
}

function sumActivityCosts(days: ApiItinerary["days"]): number {
  return days.reduce(
    (sum, day) => sum + day.activities.reduce((s, a) => s + a.cost, 0),
    0
  );
}

/** Ensures total cost and all line items stay within the user's budget. */
export function clampApiItineraryToBudget(
  itinerary: ApiItinerary,
  budget: number
): ApiItinerary {
  if (!budget || budget <= 0) return itinerary;

  const breakdownSum = sumBreakdown(itinerary.budgetBreakdown);
  const activitySum = sumActivityCosts(itinerary.days);
  const currentTotal = Math.max(
    itinerary.totalCost,
    breakdownSum,
    activitySum
  );

  if (currentTotal <= budget) {
    const adjustedBreakdown = { ...itinerary.budgetBreakdown };
    if (breakdownSum > budget) {
      const ratio = budget / breakdownSum;
      for (const key of BUDGET_BREAKDOWN_KEYS) {
        adjustedBreakdown[key] = Math.round(adjustedBreakdown[key] * ratio);
      }
      adjustedBreakdown.buffer += budget - sumBreakdown(adjustedBreakdown);
    }
    const plannedCost = sumBreakdown(adjustedBreakdown);
    return {
      ...itinerary,
      totalCost: plannedCost,
      budgetBreakdown: adjustedBreakdown,
    };
  }

  const ratio = budget / currentTotal;

  const budgetBreakdown = BUDGET_BREAKDOWN_KEYS.reduce(
    (acc, key) => {
      acc[key] = Math.round(itinerary.budgetBreakdown[key] * ratio);
      return acc;
    },
    {} as ApiItinerary["budgetBreakdown"]
  );
  budgetBreakdown.buffer += budget - sumBreakdown(budgetBreakdown);

  const days = itinerary.days.map((day) => ({
    ...day,
    activities: day.activities.map((activity) => ({
      ...activity,
      cost: Math.max(0, Math.round(activity.cost * ratio)),
    })),
  }));

  const plannedCost = sumBreakdown(budgetBreakdown);

  return {
    ...itinerary,
    totalCost: plannedCost,
    budgetBreakdown,
    days,
  };
}

function mapActivityType(type: string): DayActivity["type"] {
  const valid: DayActivity["type"][] = [
    "food",
    "activity",
    "transport",
    "accommodation",
    "sightseeing",
  ];
  return valid.includes(type as DayActivity["type"])
    ? (type as DayActivity["type"])
    : "activity";
}

function formatDayDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function scaleHotelsToBudget(
  hotels: ItineraryData["hotels"],
  accommodation: number,
  nights: number
): ItineraryData["hotels"] {
  const nightlyBase = nights > 0 ? accommodation / nights : accommodation;
  const multipliers = [1.35, 1.0, 0.55];
  return hotels.map((hotel, i) => ({
    ...hotel,
    pricePerNight: Math.max(
      1200,
      Math.round(nightlyBase * (multipliers[i] ?? 1))
    ),
  }));
}

function scaleFlightsToBudget(
  flights: ItineraryData["flights"],
  transport: number
): ItineraryData["flights"] {
  const baseTotal = flights.reduce((sum, f) => sum + f.price, 0) || 1;
  const ratio = transport / baseTotal;
  return flights.map((flight) => ({
    ...flight,
    price: Math.max(2000, Math.round(flight.price * ratio)),
  }));
}

export function mapApiToItineraryData(
  api: ApiItinerary,
  request: ItineraryRequest
): ItineraryData {
  const { travelers, budget } = request;
  const clamped = clampApiItineraryToBudget(api, budget);
  const plannedCost = sumBreakdown(clamped.budgetBreakdown);
  const fallback = generateItinerary(
    api.destination,
    request.startDate,
    request.endDate,
    travelers,
    budget
  );

  let adaptedHotels = fallback.hotels;
  if (request.preferences?.stay) {
    const stay = request.preferences.stay.toLowerCase();
    if (stay.includes("hostel")) {
      adaptedHotels = adaptedHotels.map((h, i) => ({
        ...h,
        type: "Hostel / Backpacker",
        name: i === 0 ? "Nomads Backpacker Hostel" : i === 1 ? "Zostel Center" : "Wanderer's Hub",
        amenities: ["Free WiFi", "Bunk Beds", "Common Area"],
        pricePerNight: Math.max(500, Math.round(h.pricePerNight * 0.3)),
      }));
    } else if (stay.includes("resort")) {
      adaptedHotels = adaptedHotels.map((h, i) => ({
        ...h,
        type: "Luxury Resort & Spa",
        name: i === 0 ? "The Grand Resort & Spa" : i === 1 ? "Beachfront Luxury Resort" : "Mountain View Resort",
        pricePerNight: Math.round(h.pricePerNight * 1.5),
      }));
    }
  }

  return {
    destination: clamped.destination,
    duration: clamped.totalDays,
    travelers,
    totalBudget: budget,
    usedBudget: plannedCost,
    days: clamped.days.map((day) => ({
      day: day.dayNumber,
      date: formatDayDate(day.date),
      theme: day.title,
      activities: day.activities.map((activity) => ({
        time: activity.time,
        title: activity.name,
        description: activity.description,
        type: mapActivityType(activity.type),
        cost: activity.cost,
        duration: activity.duration,
      })),
    })),
    budget: [
      {
        category: "Accommodation",
        amount: clamped.budgetBreakdown.accommodation,
        color: "#FF6B35",
        icon: "🏨",
      },
      {
        category: "Transport",
        amount: clamped.budgetBreakdown.transport,
        color: "#6366F1",
        icon: "🚗",
      },
      {
        category: "Food & Dining",
        amount: clamped.budgetBreakdown.food,
        color: "#F59E0B",
        icon: "🍽️",
      },
      {
        category: "Activities",
        amount: clamped.budgetBreakdown.activities,
        color: "#00A878",
        icon: "🎯",
      },
      {
        category: "Buffer",
        amount: clamped.budgetBreakdown.buffer,
        color: "#EC4899",
        icon: "🛍️",
      },
    ],
    hotels: scaleHotelsToBudget(
      adaptedHotels,
      clamped.budgetBreakdown.accommodation,
      clamped.totalDays
    ),
    flights: scaleFlightsToBudget(
      fallback.flights,
      clamped.budgetBreakdown.transport
    ),
  };
}

export function saveItineraryToStorage(
  request: ItineraryRequest,
  itinerary: ItineraryData
) {
  sessionStorage.setItem(
    ITINERARY_STORAGE_KEY,
    JSON.stringify({ request, itinerary })
  );
}

export function loadItineraryFromStorage(
  request: ItineraryRequest
): ItineraryData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ITINERARY_STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as {
      request: ItineraryRequest;
      itinerary: ItineraryData;
    };
    const matches =
      stored.request.destination === request.destination &&
      stored.request.startDate === request.startDate &&
      stored.request.endDate === request.endDate &&
      stored.request.travelers === request.travelers &&
      stored.request.budget === request.budget;
    return matches ? stored.itinerary : null;
  } catch {
    return null;
  }
}

export function generateFallbackApiItinerary(
  request: ItineraryRequest
): ApiItinerary {
  const { budget } = request;
  const targetSpend = Math.round(budget * 0.88);

  const accommodation = Math.round(targetSpend * 0.32);
  const transport = Math.round(targetSpend * 0.22);
  const food = Math.round(targetSpend * 0.22);
  let activitiesBudget = Math.round(targetSpend * 0.19);
  let buffer = targetSpend - accommodation - transport - food - activitiesBudget;

  const data = generateItinerary(
    request.destination,
    request.startDate,
    request.endDate,
    request.travelers,
    targetSpend
  );

  const start = new Date(request.startDate);
  const activitySum = data.days.reduce(
    (sum, day) => sum + day.activities.reduce((s, a) => s + a.cost, 0),
    0
  );
  const activityRatio =
    activitySum > 0 ? activitiesBudget / activitySum : 1;

  const days = data.days.map((day) => {
    const date = new Date(start);
    date.setDate(start.getDate() + day.day - 1);
    return {
      dayNumber: day.day,
      date: date.toISOString().split("T")[0],
      title: day.theme,
      activities: day.activities.map((activity) => ({
        time: activity.time,
        name: activity.title,
        description: activity.description,
        cost: Math.max(0, Math.round(activity.cost * activityRatio)),
        duration: activity.duration,
        type: activity.type,
      })),
    };
  });

  const actualActivitySum = sumActivityCosts(days);
  activitiesBudget = actualActivitySum;
  buffer = targetSpend - accommodation - transport - food - activitiesBudget;

  return clampApiItineraryToBudget(
    {
      destination: data.destination,
      totalDays: data.duration,
      totalCost: targetSpend,
      budgetBreakdown: {
        flights: 0,
        accommodation,
        transport,
        food,
        activities: activitiesBudget,
        buffer: Math.max(0, buffer),
      },
      days,
    },
    budget
  );
}

export async function fetchItinerary(
  request: ItineraryRequest
): Promise<ItineraryData> {
  const response = await fetch("/api/generate-itinerary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (errorData?.suggestion) {
      throw new Error(errorData.suggestion);
    }
    throw new Error(errorData?.error || "Failed to generate itinerary");
  }

  const data = await response.json();
  if (!data.success || !data.itinerary) {
    throw new Error("Invalid itinerary response");
  }

  return mapApiToItineraryData(data.itinerary as ApiItinerary, request);
}
