"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  MapPin,
  Filter,
  Search,
  Lock,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { Petition, PetitionCategory, VoteDelta } from "@/types";
import { useAuth } from "@/context/AuthContext";
import PetitionCard from "./PetitionCard";

interface PetitionFeedProps {
  petitions: Petition[];
  voteDeltas: Record<string, VoteDelta>;
  onVote: (id: string, direction: "up" | "down") => void;
  /** ID from map selection — pre-populates the Browse tab */
  selectedConstituencyId: string | null;
  /** ID passed from URL ?constituency= param — opens Browse tab on mount */
  initialConstituencyId?: string | null;
  constituencyOptions: Array<{ id: string; name: string }>;
}

type TabKey = "my-constituency" | "trending" | "browse";
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
  initialConstituencyId,
  constituencyOptions,
}: PetitionFeedProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Default tab: 'my-constituency' if logged in, else 'trending'
  const defaultTab: TabKey = user ? "my-constituency" : "trending";
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [categoryFilter, setCategoryFilter] = useState<
    PetitionCategory | "All"
  >("All");
  const [sortBy, setSortBy] = useState<SortKey>("votes");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Browse-tab constituency (pre-populated from URL param or map selection)
  const [browseConstituencyId, setBrowseConstituencyId] = useState<string>(
    initialConstituencyId ?? selectedConstituencyId ?? "",
  );
  const [browseSearch, setBrowseSearch] = useState("");

  // When initialConstituencyId is provided (from URL), open Browse tab
  useEffect(() => {
    if (initialConstituencyId) {
      setBrowseConstituencyId(initialConstituencyId);
      setActiveTab("browse");
    }
  }, [initialConstituencyId]);

  // When user logs in, switch to my-constituency tab
  useEffect(() => {
    if (user) setActiveTab("my-constituency");
  }, [user?.constituencyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // When map selection changes, update browse tab selection
  useEffect(() => {
    if (selectedConstituencyId) {
      setBrowseConstituencyId(selectedConstituencyId);
    }
  }, [selectedConstituencyId]);

  const filteredConstituencyOptions = useMemo(
    () =>
      constituencyOptions.filter(
        (o) =>
          !browseSearch ||
          o.name.toLowerCase().includes(browseSearch.toLowerCase()),
      ),
    [constituencyOptions, browseSearch],
  );

  const filtered = useMemo(() => {
    let list = petitions;

    if (activeTab === "my-constituency" && user) {
      list = list.filter((p) => p.constituency_id === user.constituencyId);
    } else if (activeTab === "browse" && browseConstituencyId) {
      list = list.filter((p) => p.constituency_id === browseConstituencyId);
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
    user,
    browseConstituencyId,
    voteDeltas,
  ]);

  const browseConstituencyName =
    constituencyOptions.find((o) => o.id === browseConstituencyId)?.name ??
    null;

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

        {/* Controls: sort + view toggle */}
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <div className="flex items-center gap-2">
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

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutList size={14} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6 flex-wrap">
        {/* My Constituency tab */}
        <button
          onClick={() => {
            if (!user) {
              router.push("/auth?mode=login");
              return;
            }
            setActiveTab("my-constituency");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "my-constituency" && user
              ? "bg-white text-blue-900 shadow-sm"
              : user
                ? "text-gray-500 hover:text-gray-700"
                : "text-gray-400 hover:text-gray-500"
          }`}
          title={
            !user ? "Log in to see your constituency's petitions" : undefined
          }
        >
          {!user && <Lock size={12} />}
          <MapPin size={15} />
          {user ? user.constituencyName : "My Constituency"}
        </button>

        {/* Trending tab */}
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

        {/* Browse tab */}
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "browse"
              ? "bg-white text-blue-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Search size={15} />
          Browse
        </button>
      </div>

      {/* Browse constituency selector */}
      {activeTab === "browse" && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-700 font-semibold mb-2">
            Select a constituency to browse petitions
            {selectedConstituencyId && !browseConstituencyId && (
              <span className="ml-1 text-blue-500">
                (or click a constituency on the map)
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={browseSearch}
                onChange={(e) => setBrowseSearch(e.target.value)}
                placeholder="Search constituencies…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <select
              value={browseConstituencyId}
              onChange={(e) => setBrowseConstituencyId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All constituencies</option>
              {filteredConstituencyOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          {browseConstituencyName && (
            <p className="text-sm text-blue-600 mt-2 font-medium">
              Showing petitions for: {browseConstituencyName}
            </p>
          )}
        </div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() =>
              setCategoryFilter(f.value as PetitionCategory | "All")
            }
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-all ${
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
          {activeTab === "my-constituency" && user ? (
            <div>
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium text-gray-500">
                No petitions yet in {user.constituencyName}.
              </p>
              <p className="text-sm mt-1">Be the first to start a petition!</p>
            </div>
          ) : activeTab === "browse" && !browseConstituencyId ? (
            <p className="text-sm">
              Select a constituency above to browse its petitions.
            </p>
          ) : (
            <p className="text-sm">No petitions match the selected filters.</p>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {filtered.map((p) => (
            <PetitionCard
              key={p.id}
              petition={p}
              voteDelta={voteDeltas[p.id] ?? { upvotes: 0, downvotes: 0 }}
              onVote={onVote}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </section>
  );
}
