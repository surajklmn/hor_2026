"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Megaphone,
  X,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Petition } from "@/types";

// Dynamically import Map to avoid SSR issues with Leaflet
const NepalMap = dynamic(() => import("@/components/Map/NepalMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400">
      Loading Map…
    </div>
  ),
});

export default function ElectionPage() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [candidatesData, setCandidatesData] = useState<
    Record<string, Array<{ name: string; party: string }>>
  >({});
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<
    string | null
  >(null);
  const [selectedConstituencyName, setSelectedConstituencyName] = useState<
    string | null
  >(null);
  const [panelTab, setPanelTab] = useState<"candidates" | "petitions">(
    "candidates",
  );
  const mapRef = useRef<HTMLDivElement>(null);

  // ── Load data ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/data/petitions.json")
      .then((r) => r.json())
      .then((data: Petition[]) => setPetitions(data))
      .catch(console.error);

    fetch("/data/candidates.json")
      .then((r) => r.json())
      .then((data: Record<string, Array<{ name: string; party: string }>>) =>
        setCandidatesData(data),
      )
      .catch(console.error);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleConstituencySelect = useCallback(
    (id: string | null, name: string | null) => {
      setSelectedConstituencyId(id);
      setSelectedConstituencyName(name);
      if (id) setPanelTab("candidates");
    },
    [],
  );

  const scrollToMap = () =>
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ── Derived ─────────────────────────────────────────────────────────────
  const localPetitions = selectedConstituencyId
    ? petitions.filter((p) => p.constituency_id === selectedConstituencyId)
    : [];

  const candidates = selectedConstituencyId
    ? (candidatesData[selectedConstituencyId] ?? [])
    : [];

  const resolvedCount = petitions.filter((p) => p.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ════ HERO ════════════════════════════════════════════════════════ */}
      <section className="relative bg-blue-900 text-white overflow-hidden min-h-[calc(100vh-5rem)] flex flex-col justify-center">
        {/* Decorative blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-700/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-blue-800/30 blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex flex-col lg:flex-row lg:items-center gap-12 w-full">
          {/* ── Left: text content ── */}
          <div className="flex-1 max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold text-white/80 mb-6 select-none">
              <Megaphone size={12} />
              Civic Petition Platform — Nepal 2026
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Make A Petition,
              <br />
              <span className="text-emerald-400">Raise Your Voice.</span>
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed mb-10 max-w-xl">
              Select your constituency on the map below, then start or sign
              petitions on issues that matter — from road repairs to policy
              reform. Every signature drives Parliamentary Discussion.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/petition/new"
                className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
              >
                <Megaphone size={18} />
                Start a Petition
              </Link>
              <button
                onClick={scrollToMap}
                className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl backdrop-blur-sm transition-all"
              >
                <TrendingUp size={18} />
                View Petitions
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-4">
              {[
                {
                  label: "Active Petitions",
                  value: String(petitions.length),
                  icon: <FileText size={16} />,
                },
                {
                  label: "Constituencies",
                  value: "165",
                  icon: <Users size={16} />,
                },
                {
                  label: "Resolved Issues",
                  value: String(resolvedCount),
                  icon: <AlertCircle size={16} />,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3"
                >
                  <span className="text-emerald-400">{stat.icon}</span>
                  <div>
                    <div className="text-2xl font-extrabold leading-none">
                      {stat.value}
                    </div>
                    <div className="text-sm text-blue-200 mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: megaphone with wave rings ── */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="relative flex items-center justify-center w-64 h-64">
              {/* Wave rings */}
              <span
                className="absolute inset-0 rounded-full border-2 border-emerald-400/50 wave-ring"
                style={{ animationDelay: "0s" }}
              />
              <span
                className="absolute inset-0 rounded-full border-2 border-emerald-400/40 wave-ring"
                style={{ animationDelay: "0.75s" }}
              />
              <span
                className="absolute inset-0 rounded-full border-2 border-emerald-400/30 wave-ring"
                style={{ animationDelay: "1.5s" }}
              />
              {/* Icon container */}
              <div className="relative z-10 w-36 h-36 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                <Megaphone
                  size={64}
                  className="text-emerald-400 drop-shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ MAP SECTION ═════════════════════════════════════════════════ */}
      <section ref={mapRef} className="bg-white border-b border-gray-200">
        {/* Section heading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight">
              Constituency Map
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click any constituency to explore 2026 candidates and local
              petitions.
            </p>
          </div>
          <span className="text-sm text-gray-400 font-medium">
            165 constituencies · Nepal 2026
          </span>
        </div>

        {/* Map container */}
        <div className="relative" style={{ height: 600 }}>
          <NepalMap onConstituencySelect={handleConstituencySelect} />

          {/* ── Constituency panel overlay ── */}
          {selectedConstituencyId && (
            <aside className="absolute top-0 right-0 bottom-0 w-[300px] bg-white border-l border-gray-200 z-[600] flex flex-col shadow-2xl overflow-hidden">
              {/* Panel header – Deep Blue */}
              <div className="bg-blue-900 text-white px-4 py-3 flex items-start justify-between flex-shrink-0">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-0.5">
                    Selected Constituency
                  </div>
                  <h3 className="font-bold text-sm leading-tight truncate">
                    {selectedConstituencyName}
                  </h3>
                </div>
                <button
                  onClick={() => handleConstituencySelect(null, null)}
                  className="ml-3 mt-0.5 p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Close panel"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 flex-shrink-0 bg-white">
                {(["candidates", "petitions"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPanelTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 uppercase tracking-wide ${
                      panelTab === tab
                        ? "border-blue-900 text-blue-900 bg-blue-50/50"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab === "candidates"
                      ? `Candidates (${candidates.length})`
                      : `Petitions (${localPetitions.length})`}
                  </button>
                ))}
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto">
                {panelTab === "candidates" ? (
                  <div className="p-3 space-y-2">
                    {candidates.length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-6 text-center">
                        No 2026 candidates registered yet.
                      </p>
                    ) : (
                      candidates.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">
                              {c.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {c.party}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {localPetitions.length === 0 ? (
                      <div className="py-8 text-center px-4">
                        <div className="text-3xl mb-2">📋</div>
                        <p className="text-sm text-gray-400 mb-3">
                          No petitions yet for this constituency.
                        </p>
                        <Link
                          href="/petition/new"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 hover:text-blue-700"
                        >
                          <Megaphone size={13} />
                          Be the first to raise a petition
                        </Link>
                      </div>
                    ) : (
                      localPetitions.map((p) => (
                        <Link
                          key={p.id}
                          href={`/petitions?constituency=${selectedConstituencyId}`}
                          className="block p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-white transition-all"
                        >
                          <div className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
                            {p.title}
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                p.status === "Resolved"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : p.status === "Under Review"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {p.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {p.upvotes.toLocaleString()} votes
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Panel footer */}
              <div className="p-3 border-t border-gray-100 flex-shrink-0 space-y-2 bg-gray-50/80">
                <Link
                  href="/petition/new"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm shadow-blue-900/20"
                >
                  <Megaphone size={13} />
                  Start a Petition for {selectedConstituencyName}
                </Link>
                <Link
                  href={`/petitions?constituency=${selectedConstituencyId}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  <ArrowRight size={13} />
                  View Petitions in {selectedConstituencyName}
                </Link>
              </div>
            </aside>
          )}
        </div>
        {/* end map container */}
      </section>
    </div>
  );
}
