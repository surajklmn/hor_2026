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
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/petitions", label: "View Petitions", icon: TrendingUp },
  { href: "/petition/new", label: "Make a Petition", icon: Megaphone },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-[700] bg-blue-950/95 backdrop-blur-sm border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand + desktop nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 select-none flex-shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-extrabold text-xs leading-none">
                NV
              </span>
            </div>
            <span className="text-white font-extrabold text-sm tracking-tight">
              NepalVoice
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-blue-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Auth area */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0">
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
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                      <MapPin size={10} />
                      <span className="truncate">{user.constituencyName}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {user.province} · {user.district}
                    </div>
                  </div>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      Voter ID
                    </div>
                    <div className="text-xs font-mono text-gray-700 mt-0.5">
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
          <div className="flex items-center gap-2">
            <Link
              href="/auth?mode=login"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-colors"
            >
              <LogIn size={13} />
              <span className="hidden sm:inline">Log In</span>
            </Link>
            <Link
              href="/auth?mode=signup"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-sm shadow-emerald-600/30"
            >
              <UserPlus size={13} />
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
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                isActive
                  ? "text-white bg-white/10"
                  : "text-blue-300 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
