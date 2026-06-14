'use client';

import { useState, useEffect } from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  CloudLightning, 
  Droplet, 
  Wind, 
  Thermometer,
  CloudSun
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  forecast: ForecastDay[];
}

export function WeatherWidget({ destination }: { destination: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/get-weather?t=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination }),
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Weather data not found');
        }

        const data = await response.json();
        if (active) {
          setWeather(data);
        }
      } catch (err) {
        if (active) {
          setError('Could not fetch weather');
          console.error(err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (destination) {
      fetchWeather();
    } else {
      setTimeout(() => {
        if (active) setLoading(false);
      }, 0);
    }

    return () => {
      active = false;
    };
  }, [destination]);

  if (loading) {
    return (
      <Card className="border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md">
        <CardContent className="p-6 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-[#0055CC] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Fetching local forecast...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-100 dark:border-red-950/20 bg-red-500/5 dark:bg-red-950/10">
        <CardContent className="p-4 text-center text-sm text-red-500 dark:text-red-400 font-medium">
          ⚠️ {error} for {destination}
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  // Resolve Premium Lucide Icon based on condition
  const getWeatherIcon = (cond: string, sizeClass = "w-8 h-8") => {
    const c = cond.toLowerCase();
    if (c.includes('clear') || c.includes('sun')) {
      return <Sun className={`${sizeClass} text-amber-500 animate-spin-slow`} />;
    }
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudRain className={`${sizeClass} text-blue-500`} />;
    }
    if (c.includes('storm') || c.includes('thunder')) {
      return <CloudLightning className={`${sizeClass} text-purple-500`} />;
    }
    if (c.includes('snow') || c.includes('ice') || c.includes('freeze')) {
      return <Snowflake className={`${sizeClass} text-cyan-400 animate-pulse`} />;
    }
    if (c.includes('cloud')) {
      if (c.includes('few') || c.includes('scattered') || c.includes('partly')) {
        return <CloudSun className={`${sizeClass} text-amber-500`} />;
      }
      return <Cloud className={`${sizeClass} text-slate-400 dark:text-slate-500`} />;
    }
    return <CloudSun className={`${sizeClass} text-gray-400`} />;
  };

  const getEmojiIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('clear') || c.includes('sun')) return "☀️";
    if (c.includes('rain') || c.includes('drizzle')) return "🌧️";
    if (c.includes('storm') || c.includes('thunder')) return "⛈️";
    if (c.includes('snow')) return "❄️";
    return "⛅";
  };

  return (
    <Card className="border border-gray-200/60 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/60 dark:to-gray-900/10 shadow-sm overflow-hidden relative">
      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">
              Local Weather
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
              Current Conditions
            </p>
          </div>
          <Badge variant="secondary" className="font-bold text-xs bg-[#0055CC]/10 text-[#0055CC] dark:bg-blue-500/10 dark:text-blue-400">
            {destination.split(',')[0]}
          </Badge>
        </div>

        {/* Current Weather Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          {/* Temp */}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl flex items-center justify-center shrink-0">
              <Thermometer className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                Temp
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {weather.temp}°C
              </p>
              <p className="text-[9px] text-gray-400">
                Feels {weather.feelsLike}°C
              </p>
            </div>
          </div>

          {/* Condition */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 dark:bg-sky-500/5 rounded-xl flex items-center justify-center shrink-0">
              {getWeatherIcon(weather.condition, "w-6 h-6")}
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                Sky
              </p>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                {weather.condition}
              </p>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/5 rounded-xl flex items-center justify-center shrink-0">
              <Droplet className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                Humidity
              </p>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                {weather.humidity}%
              </p>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-500/10 dark:bg-teal-500/5 rounded-xl flex items-center justify-center shrink-0">
              <Wind className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                Wind
              </p>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                {weather.windSpeed} m/s
              </p>
            </div>
          </div>
        </div>

        {/* 4-Day Forecast Row */}
        {weather.forecast && weather.forecast.length > 0 && (
          <div className="pt-4 border-t border-gray-200/60 dark:border-gray-800">
            <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">
              Forecast Plan
            </p>
            <div className="grid grid-cols-4 gap-2">
              {weather.forecast.map((f, i) => (
                <div 
                  key={i} 
                  className="bg-gray-50/50 dark:bg-gray-950/45 border border-gray-100 dark:border-gray-800/80 rounded-xl p-2.5 text-center transition-all hover:scale-[1.03]"
                >
                  <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                    {f.day}
                  </div>
                  <div className="text-lg my-1">
                    {getEmojiIcon(f.condition)}
                  </div>
                  <div className="text-xs font-extrabold text-gray-900 dark:text-white">
                    {f.temp}°C
                  </div>
                  <div className="text-[9px] text-gray-400 dark:text-gray-500 font-medium truncate mt-0.5">
                    {f.condition}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}