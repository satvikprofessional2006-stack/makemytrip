"use client";

import Link from "next/link";
import {
  Phone, Mail, MapPin, MessageCircle, Share2, Radio, PlayCircle, Link2,
  Plane, CreditCard, Shield, Clock, Star, ArrowRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Destinations: [
    { label: "Goa, India", href: "/results?destination=Goa" },
    { label: "Rajasthan, India", href: "/results?destination=Rajasthan" },
    { label: "Kerala, India", href: "/results?destination=Kerala" },
    { label: "Bali, Indonesia", href: "/results?destination=Bali" },
    { label: "Maldives", href: "/results?destination=Maldives" },
    { label: "View All →", href: "#destinations" },
  ],
  "Travel Services": [
    { label: "AI Itinerary Planner", href: "/" },
    { label: "Hotel Bookings", href: "/" },
    { label: "Flight Search", href: "/" },
    { label: "Travel Insurance", href: "/" },
    { label: "Visa Assistance", href: "/" },
    { label: "Airport Transfers", href: "/" },
  ],
  Company: [
    { label: "About Us", href: "/" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Blog & Stories", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Press & Media", href: "/" },
    { label: "Partner With Us", href: "/" },
  ],
  Support: [
    { label: "Help Center", href: "/" },
    { label: "Contact Us", href: "/" },
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
    { label: "Refund Policy", href: "/" },
    { label: "Sitemap", href: "/" },
  ],
};

const socialLinks = [
  { Icon: MessageCircle, href: "#", label: "Facebook" },
  { Icon: Radio, href: "#", label: "Twitter" },
  { Icon: Share2, href: "#", label: "Instagram" },
  { Icon: PlayCircle, href: "#", label: "YouTube" },
  { Icon: Link2, href: "#", label: "LinkedIn" },
];

const trustBadges = [
  { Icon: Shield, text: "SSL Secured" },
  { Icon: CreditCard, text: "Safe Payments" },
  { Icon: Clock, text: "24/7 Support" },
  { Icon: Star, text: "4.9★ Rated" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Newsletter strip */}
      <div style={{ background: "linear-gradient(135deg, #0055CC, #00A878)" }} className="py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-xl font-black mb-1">
              Get Travel Deals & Inspiration
            </h3>
            <p className="text-white/70 text-sm">
              Join 500,000+ smart travellers. No spam, ever.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email..."
              className="flex-1 md:w-72 px-4 py-3 rounded-xl text-gray-900 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              className="px-5 py-3 rounded-xl text-white font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: "#FF6B35" }}
            >
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <img
                src="/logo-icon-white.png"
                alt="Travel-o-pedia Logo"
                className="w-9 h-9 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
              />
              <span className="text-xl font-black text-white">
                TRAVEL-<span style={{ color: "#0055FF" }}>O-PEDIA</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              India&apos;s #1 AI-powered travel planning platform. We make unforgettable journeys accessible to every traveller — from weekend getaways to once-in-a-lifetime adventures.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                42, Cyber Hub, Gurugram, Haryana 122002
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-green-400 shrink-0" />
                +91 1800 123 4567 (Toll Free)
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                hello@travel-o-pedia.in
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="md:col-span-1">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustBadges.map(({ Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 bg-gray-900 rounded-xl px-4 py-3 border border-gray-800"
            >
              <Icon className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-gray-300 text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TRAVEL-O-PEDIA Pvt. Ltd. · All rights reserved · Made with ❤️ in India
          </p>
          <div className="flex items-center gap-4">
            {/* Payment logos */}
            {["UPI", "Visa", "MC", "PayTm", "GPay"].map((pay) => (
              <span
                key={pay}
                className="text-xs font-bold px-2.5 py-1.5 rounded bg-gray-800 text-gray-400 border border-gray-700"
              >
                {pay}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Plane className="w-3.5 h-3.5" />
            <span>IATA Accredited · ATOL Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
