"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Globe, Menu, X, Plane, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/login/actions";
import { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/results", label: "Itinerary" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
          : "bg-[rgba(8,12,22,0.5)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.05)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200"
              style={{ background: "linear-gradient(135deg, #0055CC, #00A878)" }}
            >
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xl font-black tracking-tight transition-colors duration-300 ${
                scrolled || !isHome ? "text-gray-900" : "text-white drop-shadow-lg"
              }`}
            >
              TRAVEL<span style={{ color: "#FF6B35" }}>OPEDIA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-white drop-shadow-md"
                    : scrolled || !isHome
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-white/90 hover:text-white hover:bg-white/20 drop-shadow-lg"
                }`}
                style={
                  pathname === link.href
                    ? { backgroundColor: "#0055CC" }
                    : {}
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link 
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: `gap-2 ${
                      scrolled || !isHome
                        ? "text-gray-600 hover:text-gray-900"
                        : "text-white hover:bg-white/20 drop-shadow-lg"
                    }`
                  })}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Trips
                </Link>
                <div className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-300/30">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${scrolled || !isHome ? 'bg-gray-100 text-gray-700' : 'bg-white/20 text-white'}`}>
                    {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    className={`gap-2 px-2 ${
                      scrolled || !isHome
                        ? "text-gray-600 hover:text-red-600"
                        : "text-white hover:text-red-400 hover:bg-white/20 drop-shadow-lg"
                    }`}
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link 
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: `font-medium ${
                    scrolled || !isHome
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-white hover:bg-white/20 drop-shadow-lg"
                  }`
                })}
              >
                Log In
              </Link>
            )}
            <Link 
              href="/"
              className={buttonVariants({
                size: "sm",
                className: "gap-2 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ml-1"
              })}
              style={{ backgroundColor: "#FF6B35" }}
            >
              <Plane className="w-4 h-4" />
              Plan Trip
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled || !isHome
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
                style={
                  pathname === link.href
                    ? { backgroundColor: "#0055CC" }
                    : {}
                }
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </Button>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileOpen(false)}
                className={buttonVariants({
                  variant: "ghost",
                  className: "w-full justify-start text-gray-700 hover:bg-gray-50"
                })}
              >
                Log In
              </Link>
            )}
            <Link 
              href="/" 
              onClick={() => setMobileOpen(false)}
              className={buttonVariants({
                className: "w-full gap-2 text-white font-semibold"
              })}
              style={{ backgroundColor: "#FF6B35" }}
            >
              <Plane className="w-4 h-4" />
              Plan a Trip
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
