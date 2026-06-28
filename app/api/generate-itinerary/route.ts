import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  clampApiItineraryToBudget,
  generateFallbackApiItinerary,
  type ItineraryRequest,
} from "@/lib/itinerary-api";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function generateWithOpenAI(request: ItineraryRequest) {
  const openai = getOpenAIClient();
  if (!openai) return null;

  const { destination, startDate, endDate, travelers, budget, preferences } = request;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `You are an expert travel planner creating DESTINATION-SPECIFIC itineraries with REAL hotel and restaurant names.

CRITICAL RULES:
1. BUDGET IS ABSOLUTE - NEVER exceed ₹${budget}
2. Use ONLY REAL specific names (hotels, restaurants, landmarks)
3. Make it DESTINATION-SPECIFIC to ${destination}
4. NO unused budget (difference < ₹1000)

Trip Details:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate} (${days} days)
- Travelers: ${travelers}
- Total Budget: ₹${budget}
- Per person per day: ₹${Math.round(budget / (days * travelers))}

REAL HOTEL & RESTAURANT NAMES BY DESTINATION:

If destination is GOA or includes "Goa":
Real Hotels: Taj Exotica, Sunbeam Holiday Resort, Nilaya Hermitage, Goan Heritage, Fort Aguada Resort
Real Restaurants: Fisherman's Wharf, Pepper's, Thalassa, Cafe Bodega, Martin's Corner
Real Activities: Fort Aguada, Dudhsagar Falls, Baga Beach, Anjuna Beach
FLIGHT PRICE: ₹3,500-₹5,000 (NEVER exceed ₹5,000, even if budget is higher)

If destination is PARIS or includes "Paris":
Real Hotels: Le Marais Hotel, Montmartre Inn, Latin Quarter Lodge
Real Restaurants: L'Ami Jean, Bistro Paul Bert, Angelina, Cafe de Flore
Real Activities: Eiffel Tower, Louvre, Notre-Dame, Seine Cruise
FLIGHT PRICE: ₹24,000-₹32,000 (NEVER exceed ₹32,000)

If destination is LONDON or includes "London":
Real Hotels: South Kensington Lodge, King's Cross Inn, Westminster Hotel
Real Restaurants: Borough Market, The Ivy, Dishoom, Afternoon Tea
Real Activities: Big Ben, Tower of London, British Museum, Thames Cruise
FLIGHT PRICE: ₹22,000-₹30,000 (NEVER exceed ₹30,000)

If destination is BANGKOK or includes "Bangkok":
Real Hotels: Silom Thai House, Sukhumvit Backpackers, Riverside Lodge
Real Restaurants: Pad Thai Stand, Khao Tom Market, Boat Noodles, Night Market
Real Activities: Grand Palace, Floating Markets, Wat Arun, Tuk-Tuk Tour
FLIGHT PRICE: ₹10,000-₹15,000 (NEVER exceed ₹15,000)

If destination is JAIPUR or includes "Jaipur":
Real Hotels: Alsisar Haveli, Diggi Palace, Rambagh Palace, Samode Palace
Real Restaurants: 1135 AD, Chokhi Dhani, Peacock Restaurant, Niros
Real Activities: City Palace, Jantar Mantar, Hawa Mahal, Albert Hall
FLIGHT PRICE: ₹4,000-₹6,000 (NEVER exceed ₹6,000)

If destination is KERALA or includes "Kerala":
Real Hotels: Munnar Plantation Resort, Kumarakom Backwaters, Beach Shack
Real Restaurants: Seafood Kitchen, Spice Garden, Kerala Samudra
Real Activities: Backwater Cruise, Tea Plantation, Kochi Fort, Houseboat Ride
FLIGHT PRICE: ₹4,500-₹7,000 (NEVER exceed ₹7,000)

If destination is RAJASTHAN or includes "Rajasthan":
Real Hotels: Pushkar Heritage, Jodhpur Blue House, Udaipur Palace, Desert Camp
Real Restaurants: Local Thali, Street Food, Desert Restaurant, Palace Cafe
Real Activities: Camel Safari, Mehrangarh Fort, City Palace, Local Markets
FLIGHT PRICE: ₹4,000-₹6,500 (NEVER exceed ₹6,500)

BUDGET BREAKDOWN (must total exactly ₹${budget}):
- Flights: ₹[EXACT amount]
- Accommodation: ₹[EXACT amount]
- Food: ₹[EXACT amount]
- Activities: ₹[EXACT amount]
- Transport: ₹[EXACT amount]
- Buffer: ₹[EXACT amount]
TOTAL = ₹${budget}

CRITICAL - FLIGHT PRICE LIMITS:
⚠️ FLIGHTS have MAX LIMITS:
- Goa flights: max ₹5,000 per person
- Paris flights: max ₹32,000 per person
- London flights: max ₹30,000 per person
- Bangkok flights: max ₹15,000 per person
- Jaipur flights: max ₹6,000 per person
- Kerala flights: max ₹7,000 per person

NEVER exceed these limits, even if total budget allows.
The remaining budget must be allocated to: accommodation, food, activities, transport.

IMPORTANT - USE REAL NAMES IN ACTIVITIES:
✅ "Breakfast at Fisherman's Wharf - ₹250" (CORRECT)
✅ "Stay at Taj Exotica - ₹3,500/night" (CORRECT)
✅ "Visit Fort Aguada - ₹100" (CORRECT)
❌ "Breakfast at Hotel" (WRONG)
❌ "Lunch at Local Restaurant" (WRONG)

Return ONLY valid JSON (no markdown, no backticks):
{
  "destination": "${destination}",
  "totalDays": ${days},
  "totalCost": ${budget},
  "budgetBreakdown": {
    "flights": NUMBER,
    "accommodation": NUMBER,
    "food": NUMBER,
    "activities": NUMBER,
    "transport": NUMBER,
    "buffer": NUMBER
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "DATE",
      "title": "SPECIFIC TITLE",
      "activities": [
        {
          "time": "09:00",
          "name": "REAL NAME (e.g., Breakfast at Fisherman's Wharf)",
          "description": "Description",
          "cost": NUMBER,
          "duration": "1 hr",
          "type": "food"
        }
      ]
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert travel planner. Always respond with valid JSON only. Never exceed the stated budget.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const responseText = completion.choices[0].message.content;
  if (!responseText) {
    throw new Error("No response from AI");
  }

  const cleanedResponse = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedResponse);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, startDate, endDate, travelers, budget } = body;

    if (!destination || !startDate || !endDate || !travelers || !budget) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const itineraryRequest: ItineraryRequest = {
      destination: String(destination),
      startDate: String(startDate),
      endDate: String(endDate),
      travelers: Number(travelers),
      budget: Number(budget),
    };

    // Validate budget is realistic
    const minBudgetPerPersonPerDay: Record<string, number> = {
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

    const start = new Date(String(startDate));
    const end = new Date(String(endDate));
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    let dailyMin = 3000;
    const destLower = String(destination).toLowerCase();
    for (const [key, value] of Object.entries(minBudgetPerPersonPerDay)) {
      if (destLower.includes(key)) {
        dailyMin = value;
        break;
      }
    }

    const minBudgetRequired = dailyMin * Number(travelers) * days;

    if (Number(budget) < minBudgetRequired) {
      return NextResponse.json({
        error: true,
        message: `Budget too low for ${destination}`,
        minimum_required: minBudgetRequired,
        travelers: travelers,
        days: days,
        suggestion: `Minimum budget needed: ₹${minBudgetRequired.toLocaleString('en-IN')}. Try a cheaper destination or increase budget.`
      }, { status: 400 });
    }

    try {
      const itinerary = await generateWithOpenAI(itineraryRequest);
      if (itinerary) {
        const clamped = clampApiItineraryToBudget(
          itinerary,
          itineraryRequest.budget
        );
        return NextResponse.json({ success: true, itinerary: clamped });
      }
    } catch (error) {
      console.error("OpenAI itinerary generation failed, using fallback:", error);
    }

    const fallback = generateFallbackApiItinerary(itineraryRequest);
    return NextResponse.json({
      success: true,
      itinerary: fallback,
      fallback: true,
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary. Please try again." },
      { status: 500 }
    );
  }
}
