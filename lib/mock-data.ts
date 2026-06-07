// Mock data for AI itinerary generation

export interface DayActivity {
  time: string;
  title: string;
  description: string;
  type: "food" | "activity" | "transport" | "accommodation" | "sightseeing";
  cost: number;
  duration: string;
  tip?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: DayActivity[];
}

export interface BudgetItem {
  category: string;
  amount: number;
  color: string;
  icon: string;
}

export interface ItineraryData {
  destination: string;
  duration: number;
  travelers: number;
  totalBudget: number;
  usedBudget: number;
  days: ItineraryDay[];
  budget: BudgetItem[];
  hotels: HotelOption[];
  flights: FlightOption[];
}

export interface HotelOption {
  name: string;
  type: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  image: string;
}

export interface FlightOption {
  airline: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  stops: number;
}

const activityTemplates: Record<string, DayActivity[][]> = {
  default: [
    [
      { time: "07:00", title: "Breakfast at Hotel", description: "Start your day with a hearty local breakfast featuring regional specialties and fresh tropical fruits.", type: "food", cost: 400, duration: "1 hr", tip: "Ask the hotel for local breakfast recommendations." },
      { time: "09:00", title: "City Orientation Walk", description: "Explore the old town with a guided walking tour through historic streets, local markets and cultural landmarks.", type: "sightseeing", cost: 800, duration: "2 hrs" },
      { time: "12:00", title: "Lunch at Local Restaurant", description: "Authentic regional cuisine at a well-reviewed local restaurant. Try the thali or chef's special.", type: "food", cost: 600, duration: "1.5 hrs", tip: "Avoid tourist-trap restaurants near major landmarks." },
      { time: "14:00", title: "Main Attraction Visit", description: "Visit the iconic landmark — the crown jewel of this destination. Book tickets in advance to skip queues.", type: "activity", cost: 1200, duration: "3 hrs" },
      { time: "17:30", title: "Sunset Viewpoint", description: "Witness a breathtaking sunset from the best vantage point in the city. Bring your camera!", type: "sightseeing", cost: 0, duration: "1 hr", tip: "Arrive 30 minutes early for the best spots." },
      { time: "20:00", title: "Dinner & Local Entertainment", description: "Dinner at a rooftop restaurant followed by local cultural performance or night market exploration.", type: "food", cost: 1500, duration: "2.5 hrs" },
    ],
    [
      { time: "06:30", title: "Early Morning Nature Walk", description: "Beat the crowds with an early morning nature walk or beach/mountain trek. Golden hour photography opportunity.", type: "activity", cost: 500, duration: "2 hrs" },
      { time: "09:00", title: "Local Breakfast Café", description: "Fuel up at a beloved local café known for its fresh breads and authentic regional breakfast fare.", type: "food", cost: 350, duration: "1 hr" },
      { time: "10:30", title: "Cultural Museum / Heritage Site", description: "Deep dive into the local history and culture at the region's finest museum or heritage site.", type: "sightseeing", cost: 700, duration: "2.5 hrs", tip: "Audio guides available in multiple languages." },
      { time: "13:30", title: "Street Food Lunch", description: "Explore the famous street food scene. Try the local chaats, snacks and regional delicacies.", type: "food", cost: 300, duration: "1 hr", tip: "Look for stalls with high turnover for freshest food." },
      { time: "15:00", title: "Adventure / Water Sports", description: "Get your adrenaline pumping with a local adventure activity — parasailing, kayaking, trekking or cycling.", type: "activity", cost: 2000, duration: "3 hrs" },
      { time: "19:30", title: "Sunset Cruise / River Ride", description: "Magical evening on the water with sunset views, cocktails and live music.", type: "activity", cost: 1800, duration: "2 hrs" },
    ],
    [
      { time: "08:00", title: "Yoga / Wellness Session", description: "Rejuvenating morning yoga or meditation session with a certified local instructor.", type: "activity", cost: 600, duration: "1.5 hrs", tip: "Book in advance, sessions fill up quickly." },
      { time: "10:00", title: "Cooking Class", description: "Learn to cook 3 authentic local dishes with a master chef. Take home recipes and a foodie memory.", type: "activity", cost: 2500, duration: "3 hrs" },
      { time: "13:30", title: "The Meal You Cooked!", description: "Enjoy the fruits of your cooking class labour — a full local meal you prepared yourself.", type: "food", cost: 0, duration: "1 hr" },
      { time: "15:00", title: "Local Market Shopping", description: "Browse handcrafted souvenirs, textiles, spices and local produce at the vibrant bazaar.", type: "activity", cost: 1500, duration: "2 hrs", tip: "Bargain respectfully — 20-30% off is usually fair." },
      { time: "18:00", title: "Spa / Massage", description: "Pamper yourself with a traditional local massage therapy — the perfect end to a busy day.", type: "activity", cost: 2000, duration: "2 hrs" },
      { time: "20:30", title: "Farewell Dinner", description: "Special farewell dinner at the best-rated restaurant. Book the window table for the best view.", type: "food", cost: 3000, duration: "2.5 hrs" },
    ],
  ],
};

function generateDays(
  destination: string,
  numDays: number,
  travelers: number,
  startDate?: string
): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const themes = [
    "Arrival & City Exploration",
    "Adventure & Nature",
    "Culture & Cuisine",
    "Hidden Gems & Local Life",
    "Relaxation & Shopping",
    "Day Trips & Excursions",
    "Beach & Leisure",
    "Spiritual & Heritage",
    "Farewell & Memories",
  ];

  const tripStart = startDate ? new Date(startDate) : new Date();
  if (!startDate) tripStart.setDate(tripStart.getDate() + 7);

  for (let i = 0; i < numDays; i++) {
    const dayDate = new Date(tripStart);
    dayDate.setDate(tripStart.getDate() + i);
    const templateActivities = activityTemplates.default[i % 3];

    days.push({
      day: i + 1,
      date: dayDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      theme: themes[i % themes.length],
      activities: templateActivities.map(act => ({
        ...act,
        cost: Math.round(act.cost * travelers * (0.9 + Math.random() * 0.2)),
      })),
    });
  }
  return days;
}

export function generateItinerary(
  destination: string,
  startDate: string,
  endDate: string,
  travelers: number,
  budget: number,
): ItineraryData {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 5 * 86400000);
  const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));

  const days = generateDays(destination, duration, travelers, startDate);
  const activityTotal = days.reduce(
    (sum, day) => sum + day.activities.reduce((s, a) => s + a.cost, 0),
    0
  );

  const maxBudget = budget > 0 ? budget : activityTotal + travelers * 11500 + duration * travelers * 3500;
  const scale = activityTotal > 0 && maxBudget < activityTotal + travelers * 11500 + duration * travelers * 3500
    ? maxBudget / (activityTotal + travelers * 11500 + duration * travelers * 3500)
    : 1;

  const scaledDays = days.map((day) => ({
    ...day,
    activities: day.activities.map((act) => ({
      ...act,
      cost: Math.max(0, Math.round(act.cost * scale)),
    })),
  }));

  const scaledActivityTotal = scaledDays.reduce(
    (sum, day) => sum + day.activities.reduce((s, a) => s + a.cost, 0),
    0
  );

  const flightCost = Math.round(travelers * 8000 * scale);
  const hotelCost = Math.round(duration * travelers * 3500 * scale);
  const foodCost = Math.round(scaledActivityTotal * 0.35);
  const transportCost = Math.round(travelers * 1500 * scale);
  const miscCost = Math.max(
    0,
    maxBudget - scaledActivityTotal - flightCost - hotelCost - foodCost - transportCost
  );
  const budgetBreakdown: BudgetItem[] = [
    { category: "Flights", amount: flightCost, color: "#0055CC", icon: "✈️" },
    { category: "Hotels", amount: hotelCost, color: "#FF6B35", icon: "🏨" },
    { category: "Activities", amount: scaledActivityTotal, color: "#00A878", icon: "🎯" },
    { category: "Food & Dining", amount: foodCost, color: "#F59E0B", icon: "🍽️" },
    { category: "Transport", amount: transportCost, color: "#6366F1", icon: "🚗" },
    { category: "Miscellaneous", amount: miscCost, color: "#EC4899", icon: "🛍️" },
  ];

  const usedBudget = budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);

  const hotels: HotelOption[] = [
    {
      name: `The Grand ${destination.split(",")[0]} Palace`,
      type: "5-Star Luxury",
      rating: 4.8,
      pricePerNight: 8500,
      amenities: ["Pool", "Spa", "Free WiFi", "Restaurant", "Airport Pickup"],
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80",
    },
    {
      name: `${destination.split(",")[0]} Heritage Inn`,
      type: "4-Star Boutique",
      rating: 4.5,
      pricePerNight: 4500,
      amenities: ["Free WiFi", "Breakfast", "Rooftop Bar", "Concierge"],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
    },
    {
      name: "Budget Comfort Stays",
      type: "3-Star Value",
      rating: 4.1,
      pricePerNight: 2200,
      amenities: ["Free WiFi", "A/C", "24hr Reception"],
      image: "https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=400&q=80",
    },
  ];

  const flights: FlightOption[] = [
    { airline: "IndiGo", departure: "07:30", arrival: "09:45", duration: "2h 15m", price: travelers * 4500, stops: 0 },
    { airline: "Air India", departure: "11:00", arrival: "13:40", duration: "2h 40m", price: travelers * 5200, stops: 0 },
    { airline: "SpiceJet", departure: "15:30", arrival: "18:50", duration: "3h 20m", price: travelers * 3800, stops: 1 },
  ];

  return {
    destination,
    duration,
    travelers,
    totalBudget: maxBudget,
    usedBudget,
    days: scaledDays,
    budget: budgetBreakdown,
    hotels,
    flights,
  };
}
