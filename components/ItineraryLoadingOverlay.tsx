"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plane } from "lucide-react";

const loadingTexts = [
  "Analyzing your destination...",
  "Calculating best budget split...",
  "Finding hidden gems...",
  "Building your day-by-day plan...",
  "Almost ready...",
];

export default function ItineraryLoadingOverlay() {
  const [mounted, setMounted] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    const progressTimer = setTimeout(() => setProgress(90), 50);
    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => Math.min(prev + 1, loadingTexts.length - 1));
    }, 1200);

    return () => {
      clearTimeout(progressTimer);
      clearInterval(textInterval);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#040919] flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24 mb-8">
        <div
          className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <div className="absolute inset-0 bg-blue-500/40 rounded-full animate-pulse" />
        <div className="relative w-full h-full bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)]">
          <Plane className="w-10 h-10 text-white animate-bounce" />
        </div>
      </div>

      <h2
        className="text-xl md:text-2xl font-black text-white text-center h-8 transition-opacity duration-500"
        key={loadingTextIndex}
      >
        {loadingTexts[loadingTextIndex]}
      </h2>

      <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full mt-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full ease-linear"
          style={{
            width: `${progress}%`,
            transitionDuration: "8000ms",
            transitionProperty: "width",
          }}
        />
      </div>
    </div>,
    document.body
  );
}
