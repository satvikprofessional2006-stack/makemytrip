import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Trave-o-pedia - Plan Your Dream Journey",
  description:
    "AI-powered travel planning. Discover destinations, get day-wise itineraries, budget breakdowns, and save your dream trips — all in one place.",
  keywords: ["travel", "itinerary", "vacation planner", "AI travel", "budget travel", "India travel"],
  openGraph: {
    title: "Trave-o-pedia - Plan Your Dream Journey",
    description: "AI-powered travel planning for your dream vacations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
