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

  const prompt = `You are an expert Indian travel planner.

Generate a complete day-by-day travel itinerary with these details:
- Destination: ${destination}
- Start Date: ${startDate}
- End Date: ${endDate}
- Number of Days: ${days}
- Pace: ${preferences?.pace || "moderate"}
- Interests: ${preferences?.interests && Array.isArray(preferences.interests) ? preferences.interests.join(", ") : "General"}
- Number of Travelers: ${travelers}
- Maximum Budget: INR ${budget} (TOTAL for all travelers)

STRICT RULES:
1. totalCost MUST be less than or equal to INR ${budget} — this is a hard limit, never exceed it
2. accommodation + transport + food + activities + buffer MUST equal totalCost
3. totalCost MUST equal the sum of all activity costs across all days
4. All prices must be in Indian Rupees (INR)
5. Use only real places that actually exist
6. Include realistic travel times between places
7. Include breakfast, lunch, dinner recommendations
8. Be specific with timings

Return ONLY a valid JSON object with exactly this structure, no extra text:
{
  "destination": "city name",
  "totalDays": number,
  "totalCost": number,
  "budgetBreakdown": {
    "accommodation": number,
    "transport": number,
    "food": number,
    "activities": number,
    "buffer": number
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "2025-10-15",
      "title": "Arrival & Beach Exploration",
      "activities": [
        {
          "time": "09:00 AM",
          "name": "Place Name",
          "description": "What to do here",
          "cost": 0,
          "duration": "2 hours",
          "icon": "🏖",
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
