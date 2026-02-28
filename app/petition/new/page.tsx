"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Lock } from "lucide-react";
import { Petition, VoteDelta } from "@/types";
import { useAuth } from "@/context/AuthContext";
import PetitionForm from "@/components/Petitions/PetitionForm";
import PetitionFeed from "@/components/Petitions/PetitionFeed";

function formatConstituencyName(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function NewPetitionPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [voteDeltas, setVoteDeltas] = useState<Record<string, VoteDelta>>({});
  const [constituencyOptions, setConstituencyOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [submitted, setSubmitted] = useState(false);

  // Gate: redirect to auth after brief hydration wait
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/auth?mode=signup&redirect=/petition/new");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!user) return; // don't bother fetching until auth confirmed
    fetch("/data/petitions.json")
      .then((r) => r.json())
      .then((data: Petition[]) => setPetitions(data))
      .catch(console.error);
    fetch("/data/candidates.json")
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const opts = Object.keys(data)
          .map((id) => ({ id, name: formatConstituencyName(id) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setConstituencyOptions(opts);
      })
      .catch(console.error);
  }, [user]);

  const handleVote = useCallback(
    (petitionId: string, direction: "up" | "down") => {
      setVoteDeltas((prev) => {
        const cur = prev[petitionId] ?? { upvotes: 0, downvotes: 0 };
        return {
          ...prev,
          [petitionId]: {
            upvotes: cur.upvotes + (direction === "up" ? 1 : 0),
            downvotes: cur.downvotes + (direction === "down" ? 1 : 0),
          },
        };
      });
    },
    [],
  );

  const handleNewPetition = useCallback((petition: Petition) => {
    setPetitions((prev) => [petition, ...prev]);
    setSubmitted(true);
  }, []);

  // Not yet hydrated or not logged in → loading / redirect
  if (!hydrated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Lock size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Please log in to make a petition…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-blue-900 text-white py-10 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-4">
          <Megaphone size={12} />
          {user.constituencyName}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          Make A Petition
        </h1>
        <p className="text-blue-200 text-sm max-w-md mx-auto">
          Raise an issue that matters in your constituency. Every signature
          drives Parliamentary Discussion.
        </p>
      </div>

      {/* Petition form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {submitted ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Megaphone size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Petition Submitted!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Your petition is now live and collecting signatures below.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 rounded-xl bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              Start Another Petition
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <PetitionForm
              preselectedConstituencyId={user.constituencyId}
              preselectedConstituencyName={user.constituencyName}
              constituencyOptions={constituencyOptions}
              onSubmit={handleNewPetition}
              onClose={() => router.push("/petitions")}
            />
          </div>
        )}
      </div>

      {/* Existing petitions below */}
      <PetitionFeed
        petitions={petitions}
        voteDeltas={voteDeltas}
        onVote={handleVote}
        selectedConstituencyId={null}
        initialConstituencyId={user.constituencyId}
        constituencyOptions={constituencyOptions}
      />
    </div>
  );
}
