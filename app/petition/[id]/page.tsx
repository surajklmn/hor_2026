"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Lock,
  Calendar,
} from "lucide-react";
import { Petition, PetitionStatus, PetitionCategory } from "@/types";
import { useAuth } from "@/context/AuthContext";

// ─── Config maps (mirror PetitionCard) ──────────────────────────────────────

const STATUS_CONFIG: Record<
  PetitionStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  "Collecting Signatures": {
    label: "Collecting Signatures",
    icon: <Clock size={13} className="flex-shrink-0" />,
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  "Under Review": {
    label: "Under Review",
    icon: <AlertCircle size={13} className="flex-shrink-0" />,
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  Resolved: {
    label: "Resolved",
    icon: <CheckCircle2 size={13} className="flex-shrink-0" />,
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
};

const CATEGORY_COLORS: Record<PetitionCategory, string> = {
  Roads: "bg-orange-100 text-orange-700",
  Water: "bg-cyan-100 text-cyan-700",
  Policy: "bg-violet-100 text-violet-700",
  Education: "bg-indigo-100 text-indigo-700",
  Healthcare: "bg-rose-100 text-rose-700",
  Environment: "bg-emerald-100 text-emerald-700",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = params?.id as string;

  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Local vote state
  const [upvoteDelta, setUpvoteDelta] = useState(0);
  const [downvoteDelta, setDownvoteDelta] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    fetch("/data/petitions.json")
      .then((r) => r.json())
      .then((data: Petition[]) => {
        const found = data.find((p) => p.id === id);
        if (found) {
          setPetition(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading petition…
      </div>
    );
  }

  if (notFound || !petition) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-sm">Petition not found.</p>
        <button
          onClick={() => router.push("/petitions")}
          className="text-blue-600 hover:underline text-sm font-semibold"
        >
          ← Back to petitions
        </button>
      </div>
    );
  }

  const totalUpvotes = petition.upvotes + upvoteDelta;
  const totalDownvotes = petition.downvotes + downvoteDelta;
  const progressPct = Math.min(
    100,
    Math.round((totalUpvotes / petition.target) * 100),
  );
  const isResolved = petition.status === "Resolved";
  const isOwnConstituency =
    user !== null && user.constituencyId === petition.constituency_id;
  const canVote = !isResolved && isOwnConstituency;
  const statusConfig = STATUS_CONFIG[petition.status];

  const handleVote = (direction: "up" | "down") => {
    if (!user) {
      router.push("/auth?mode=login");
      return;
    }
    if (!isOwnConstituency || isResolved || userVote === direction) return;
    if (direction === "up") setUpvoteDelta((d) => d + 1);
    else setDownvoteDelta((d) => d + 1);
    setUserVote(direction);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-700 font-medium mb-10 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to petitions
        </button>

        <article>
          {/* Category + status tags */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${CATEGORY_COLORS[petition.category]}`}
            >
              {petition.category}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${statusConfig.className}`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
            {petition.title}
          </h1>

          {/* Byline row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-100 mb-8">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {petition.constituency_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {petition.created_at}
            </span>
          </div>

          {/* Body */}
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line mb-12">
            {petition.description}
          </p>

          {/* Signature progress */}
          <div className="border-t border-gray-100 pt-8 mb-8 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Signature Progress
            </h2>
            <div className="flex justify-between text-sm font-semibold">
              <span
                className={isResolved ? "text-emerald-600" : "text-blue-900"}
              >
                {totalUpvotes.toLocaleString()} signatures
              </span>
              <span
                className={isResolved ? "text-emerald-600" : "text-gray-400"}
              >
                Goal: {petition.target.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isResolved
                    ? "bg-emerald-500"
                    : progressPct >= 80
                      ? "bg-blue-600"
                      : "bg-blue-400"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 text-right">
              {progressPct}% of goal reached
            </p>
          </div>

          {/* Community vote */}
          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              Community Vote
            </h2>

            {isResolved ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold mb-4">
                <CheckCircle2 size={16} />
                This issue has been resolved.
              </div>
            ) : !user ? (
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => router.push("/auth?mode=login")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
                >
                  <Lock size={13} />
                  Log in to vote
                </button>
                <span className="text-sm text-gray-400">
                  Voting is open to registered constituents only.
                </span>
              </div>
            ) : !isOwnConstituency ? (
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-4">
                <Lock size={13} />
                You can only vote on petitions in your own constituency.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                Cast your vote as a resident of {petition.constituency_name}.
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote("up")}
                disabled={!canVote}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  userVote === "up" && canVote
                    ? "bg-blue-600 text-white shadow"
                    : canVote
                      ? "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed"
                } disabled:opacity-50`}
              >
                <ThumbsUp size={15} />
                Support · {totalUpvotes.toLocaleString()}
              </button>

              <button
                onClick={() => handleVote("down")}
                disabled={!canVote}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  userVote === "down" && canVote
                    ? "bg-rose-600 text-white shadow"
                    : canVote
                      ? "bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed"
                } disabled:opacity-50`}
              >
                <ThumbsDown size={15} />
                Oppose · {totalDownvotes.toLocaleString()}
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
