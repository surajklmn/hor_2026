"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Petition, VoteDelta } from "@/types";
import PetitionFeed from "@/components/Petitions/PetitionFeed";

function formatConstituencyName(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function PetitionsPage() {
  const searchParams = useSearchParams();
  const initialConstituencyId = searchParams.get("constituency") ?? null;

  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [voteDeltas, setVoteDeltas] = useState<Record<string, VoteDelta>>({});
  const [constituencyOptions, setConstituencyOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
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
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <PetitionFeed
        petitions={petitions}
        voteDeltas={voteDeltas}
        onVote={handleVote}
        selectedConstituencyId={null}
        initialConstituencyId={initialConstituencyId}
        constituencyOptions={constituencyOptions}
      />
    </div>
  );
}
