import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();

    // Extract city name only (remove country if present)
    let cityName = destination.split(',')[0].trim();

    // Map common regions/states to their main indexed city for accurate geocoding
    const regionMapping: Record<string, string> = {
      "kerala": "Thiruvananthapuram",
      "rajasthan": "Jaipur",
      "goa": "Panaji",
      "ladakh": "Leh",
      "kashmir": "Srinagar",
      "uttarakhand": "Dehradun",
      "himachal": "Shimla",
      "bali": "Denpasar",
      "maldives": "Male",
      "nepal": "Kathmandu"
    };

    const queryLower = cityName.toLowerCase();
    for (const [key, value] of Object.entries(regionMapping)) {
      if (queryLower.includes(key)) {
        cityName = value;
        break;
      }
    }

    // Step 1: Get coordinates from destination name (request up to 10 to filter by country)
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`
    );

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return NextResponse.json(
        { error: `Location not found for ${cityName}` },
        { status: 404 }
      );
    }

    // Pick the best match (favor India if original query mentions India)
    let bestMatch = geoData.results[0];
    const isIndiaQuery = destination.toLowerCase().includes("india");

    if (isIndiaQuery) {
      const indiaMatch = geoData.results.find(
        (r: { country_code?: string; country?: string }) => r.country_code === "IN" || (r.country && r.country.toLowerCase().includes("india"))
      );
      if (indiaMatch) {
        bestMatch = indiaMatch;
      }
    }

    const { latitude, longitude } = bestMatch;

    // Step 2: Get weather data using coordinates
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    const weatherData = await weatherResponse.json();

    const current = weatherData.current;
    const daily = weatherData.daily;

    // Convert weather code to condition text
    const getWeatherCondition = (code: number) => {
      if (code === 0 || code === 1) return "Clear";
      if (code === 2) return "Partly Cloudy";
      if (code === 3) return "Cloudy";
      if (code === 45 || code === 48) return "Foggy";
      if (code >= 51 && code <= 67) return "Rain";
      if (code >= 71 && code <= 77) return "Snow";
      if (code >= 80 && code <= 82) return "Rain";
      if (code >= 85 && code <= 86) return "Snow";
      if (code >= 90 && code <= 99) return "Thunderstorm";
      return "Cloudy";
    };

    return NextResponse.json({
      temp: Math.round(current.temperature_2m),
      condition: getWeatherCondition(current.weather_code),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      feelsLike: Math.round(current.apparent_temperature),
      forecast: daily.time.slice(0, 4).map((date: string, index: number) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round((daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2),
        condition: getWeatherCondition(daily.weather_code[index])
      }))
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}