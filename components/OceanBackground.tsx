"use client";

export default function OceanBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">

      {/* ── Your real underwater ocean video ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{
          objectPosition: "center center",
          filter: "brightness(0.75) saturate(0.9) contrast(1.1)",
          transform: "scale(1.05)",
        }}
      >
        <source src="/ocean.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Edge Blur Overlay — much softer edge blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        }}
      />

      {/* Deep cinematic dark blue tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(2, 6, 23, 0.35)", mixBlendMode: "multiply" }}
      />

      {/* Extremely subtle shimmer to keep it minimal and undistracting */}
      <div
        className="absolute inset-0 pointer-events-none caustic-layer"
        style={{ opacity: 0.05 }}
      />

      {/* Premium Radial Vignette — keeps center ultra clean, darkens edges smoothly */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, transparent 15%, rgba(2, 6, 23, 0.75) 100%)",
        }}
      />

      {/* Bottom depth fade — very dark base for the UI card */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "40%",
          background:
            "linear-gradient(to top, rgba(2, 6, 23, 0.95) 0%, transparent 100%)",
        }}
      />

      {/* Top surface haze — sunlight from above so navbar is readable */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background:
            "linear-gradient(to bottom, rgba(0,25,70,0.4) 0%, transparent 100%)",
        }}
      />

      {/* Horizontal water ripple lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 58px, rgba(255,255,255,0.022) 60px)",
          animation: "waterShimmer 10s ease-in-out infinite alternate",
        }}
      />

    </div>
  );
}
