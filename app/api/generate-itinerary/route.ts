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

  const prompt = `You are a travel planning AI for India. IMPORTANT RULES:

BUDGET IS ABSOLUTE - NEVER exceed it. NEVER leave unused budget > 5000.

VALIDATION - Check if budget is realistic FIRST:
- Paris per person minimum: ₹15,000-20,000/day (flights ₹25K-40K + hotel ₹5K + food ₹3K + activity ₹2K)
- Goa per person: ₹1,500-2,500/day (hotel ₹1.5K + food ₹800 + activity ₹500)
- Bangkok per person: ₹2,000-3,000/day
- Delhi per person: ₹1,000-1,500/day

IF BUDGET IS REALISTIC, create detailed itinerary:

Trip Details:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate} (${days} days)
- Travelers: ${travelers}
- Total Budget: ₹${budget}
- Per person per day: ₹${Math.round(budget / (days * travelers))}

STRICT BUDGET BREAKDOWN (must total exactly = ₹${budget}):
- Flights: ₹[EXACT]
- Accommodation: ₹[EXACT] 
- Food: ₹[EXACT]
- Activities: ₹[EXACT]
- Local Transport: ₹[EXACT]
- Emergency Buffer: ₹[EXACT]
TOTAL = ₹${budget}

RULES:
1. Flights cost realistic for ${travelers} people
2. Hotel cost realistic for ${days} nights
3. Food realistic for ${days} days
4. All activities must fit budget
5. NO unused budget (difference < ₹1000)
6. Provide day-by-day breakdown with exact costs

Return ONLY valid JSON:
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
      "title": "TITLE",
      "activities": [
        {
          "time": "09:00",
          "name": "Activity",
          "description": "Description",
          "cost": NUMBER,
          "duration": "2 hours",
          "type": "activity"
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
      "paris": 15000,
      "london": 16000,
      "goa": 1500,
      "bangkok": 2000,
      "bali": 2500,
      "dubai": 5000,
      "delhi": 1000,
      "mumbai": 1500,
      "rajasthan": 1200,
      "kerala": 1800,
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
