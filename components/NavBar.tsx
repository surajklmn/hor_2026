"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogIn,
  UserPlus,
  LogOut,
  MapPin,
  ChevronDown,
  Megaphone,
  TrendingUp,
  Home,
  Info,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/petitions", label: "View Petitions", icon: TrendingUp },
  { href: "/petition/new", label: "Make a Petition", icon: Megaphone },
  { href: "/about", label: "About", icon: Info },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-[700] bg-blue-950/95 backdrop-blur-sm border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-stretch justify-between">
        {/* Brand */}
        <div className="flex items-center pr-6 border-r border-white/10 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 select-none group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-extrabold text-sm leading-none">
                NV
              </span>
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight">
              NepalVoice
            </span>
          </Link>
        </div>

        {/* Desktop nav — full-height boxy tabs */}
        <div className="hidden md:flex flex-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group relative h-full px-6 flex items-center gap-2.5 text-base font-semibold border-r border-white/5 transition-all duration-150 ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-blue-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon
                  size={17}
                  className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
                />
                {label}
                {/* Active bottom bar */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-400 transition-opacity duration-150 ${
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-40"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Auth area */}
        {user ? (
          <div className="relative flex items-center pl-6 border-l border-white/10">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl px-4 py-2.5 text-base font-semibold transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {user.name}
              </span>
              <ChevronDown
                size={12}
                className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-bold text-sm text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin size={10} />
                      <span className="truncate">{user.constituencyName}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {user.province} · {user.district}
                    </div>
                  </div>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Voter ID
                    </div>
                    <div className="text-sm font-mono text-gray-700 mt-0.5">
                      {user.voterID}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors"
                  >
                    <LogOut size={14} />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-6 border-l border-white/10">
            <Link
              href="/auth?mode=login"
              className="flex items-center gap-2 px-4 py-2.5 text-base font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Log In</span>
            </Link>
            <Link
              href="/auth?mode=signup"
              className="flex items-center gap-2 px-5 py-2.5 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all duration-200 hover:scale-[1.03] shadow-md shadow-emerald-600/30"
            >
              <UserPlus size={16} />
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex border-t border-white/10">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "text-white bg-white/10 border-t-2 border-emerald-400"
                  : "text-blue-300 hover:text-white border-t-2 border-transparent"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
