"use client";

import { useState, useMemo } from "react";
import { TrendingUp, MapPin, Filter } from "lucide-react";
import { Petition, PetitionCategory, VoteDelta } from "@/types";
import PetitionCard from "./PetitionCard";

interface PetitionFeedProps {
  petitions: Petition[];
  voteDeltas: Record<string, VoteDelta>;
  onVote: (id: string, direction: "up" | "down") => void;
  selectedConstituencyId: string | null;
  selectedConstituencyName: string | null;
}

type TabKey = "trending" | "constituency";
type SortKey = "votes" | "recent" | "progress";

const CATEGORY_FILTERS: Array<{
  value: PetitionCategory | "All";
  label: string;
}> = [
  { value: "All", label: "All" },
  { value: "Roads", label: "Roads" },
  { value: "Water", label: "Water" },
  { value: "Policy", label: "Policy" },
  { value: "Education", label: "Education" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Environment", label: "Environment" },
];

export default function PetitionFeed({
  petitions,
  voteDeltas,
  onVote,
  selectedConstituencyId,
  selectedConstituencyName,
}: PetitionFeedProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("trending");
  const [categoryFilter, setCategoryFilter] = useState<
    PetitionCategory | "All"
  >("All");
  const [sortBy, setSortBy] = useState<SortKey>("votes");

  const filtered = useMemo(() => {
    let list = petitions;

    if (activeTab === "constituency" && selectedConstituencyId) {
      list = list.filter((p) => p.constituency_id === selectedConstituencyId);
    }

    if (categoryFilter !== "All") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    return [...list].sort((a, b) => {
      const aUp = a.upvotes + (voteDeltas[a.id]?.upvotes ?? 0);
      const bUp = b.upvotes + (voteDeltas[b.id]?.upvotes ?? 0);
      if (sortBy === "votes") return bUp - aUp;
      if (sortBy === "recent") return b.created_at.localeCompare(a.created_at);
      if (sortBy === "progress") return bUp / b.target - aUp / a.target;
      return 0;
    });
  }, [
    petitions,
    activeTab,
    categoryFilter,
    sortBy,
    selectedConstituencyId,
    voteDeltas,
  ]);

  return (
    <section
      id="petition-feed"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-1">Petitions</h2>
          <p className="text-sm text-gray-500">
            {petitions.length} active petitions across Nepal
          </p>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2 text-xs">
          <Filter size={13} className="text-gray-400" />
          <span className="text-gray-500 font-medium">Sort by</span>
          {(["votes", "recent", "progress"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
                sortBy === s
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "votes"
                ? "Most Votes"
                : s === "recent"
                  ? "Newest"
                  : "Progress"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab("trending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "trending"
              ? "bg-white text-blue-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <TrendingUp size={15} />
          Trending Nationwide
        </button>
        <button
          onClick={() => setActiveTab("constituency")}
          disabled={!selectedConstituencyId}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "constituency" && selectedConstituencyId
              ? "bg-white text-blue-900 shadow-sm"
              : !selectedConstituencyId
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:text-gray-700"
          }`}
          title={
            !selectedConstituencyId
              ? "Click a constituency on the map to filter"
              : undefined
          }
        >
          <MapPin size={15} />
          {selectedConstituencyName
            ? `${selectedConstituencyName}`
            : "My Constituency"}
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() =>
              setCategoryFilter(f.value as PetitionCategory | "All")
            }
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              categoryFilter === f.value
                ? "bg-blue-900 text-white border-blue-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-sm">
            {activeTab === "constituency" && !selectedConstituencyId
              ? "Click a constituency on the map to see local petitions."
              : "No petitions match the selected filters."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PetitionCard
              key={p.id}
              petition={p}
              voteDelta={voteDeltas[p.id] ?? { upvotes: 0, downvotes: 0 }}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </section>
  );
}
