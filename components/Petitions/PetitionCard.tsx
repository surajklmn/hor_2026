"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ThumbsUp,
  ThumbsDown,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Petition, PetitionStatus, PetitionCategory } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface PetitionCardProps {
  petition: Petition;
  /** Delta applied on top of the seed data (managed by parent) */
  voteDelta: { upvotes: number; downvotes: number };
  onVote: (id: string, direction: "up" | "down") => void;
  viewMode?: "list" | "grid";
}

const STATUS_CONFIG: Record<
  PetitionStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  "Collecting Signatures": {
    label: "Collecting Signatures",
    icon: <Clock size={11} className="flex-shrink-0" />,
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  "Under Review": {
    label: "Under Review",
    icon: <AlertCircle size={11} className="flex-shrink-0" />,
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  Resolved: {
    label: "Resolved",
    icon: <CheckCircle2 size={11} className="flex-shrink-0" />,
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

export default function PetitionCard({
  petition,
  voteDelta,
  onVote,
  viewMode = "grid",
}: PetitionCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const totalUpvotes = petition.upvotes + voteDelta.upvotes;
  const totalDownvotes = petition.downvotes + voteDelta.downvotes;
  const progressPct = Math.min(
    100,
    Math.round((totalUpvotes / petition.target) * 100),
  );
  const statusConfig = STATUS_CONFIG[petition.status];

  // Voting rules: must be logged in AND petition must be in own constituency
  const isResolved = petition.status === "Resolved";
  const isOwnConstituency =
    user !== null && user.constituencyId === petition.constituency_id;
  const canVote = !isResolved && isOwnConstituency;

  const handleVote = (direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push("/auth?mode=login");
      return;
    }
    if (!isOwnConstituency) return; // silently blocked (button is disabled)
    if (isResolved) return;
    if (userVote === direction) return;
    onVote(petition.id, direction);
    setUserVote(direction);
  };

  const handleCardClick = () => {
    router.push(`/petition/${petition.id}`);
  };

  // ─── Shared sub-elements ──────────────────────────────────────────────────

  const badges = (
    <div className="flex flex-wrap gap-1.5">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[petition.category]}`}
      >
        {petition.category}
      </span>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}
      >
        {statusConfig.icon}
        {statusConfig.label}
      </span>
    </div>
  );

  const progressBar = (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span
          className={
            petition.status === "Resolved"
              ? "text-emerald-600"
              : "text-blue-900"
          }
        >
          {totalUpvotes.toLocaleString()} / {petition.target.toLocaleString()}{" "}
          signatures
        </span>
        <span
          className={
            petition.status === "Resolved"
              ? "text-emerald-600 font-bold"
              : "text-gray-500"
          }
        >
          {progressPct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            petition.status === "Resolved"
              ? "bg-emerald-500"
              : progressPct >= 80
                ? "bg-blue-600"
                : "bg-blue-400"
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );

  const voteRow = (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => handleVote("up", e)}
        disabled={canVote ? false : isResolved}
        title={
          !user
            ? "Log in to vote"
            : !isOwnConstituency
              ? "You can only vote on petitions in your own constituency"
              : undefined
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          userVote === "up" && canVote
            ? "bg-blue-600 text-white shadow-sm"
            : canVote
              ? "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
        } disabled:opacity-40`}
      >
        {!user ? <Lock size={11} /> : <ThumbsUp size={13} />}
        <span>{totalUpvotes.toLocaleString()}</span>
      </button>

      <button
        onClick={(e) => handleVote("down", e)}
        disabled={canVote ? false : isResolved}
        title={
          !user
            ? "Log in to vote"
            : !isOwnConstituency
              ? "You can only vote on petitions in your own constituency"
              : undefined
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          userVote === "down" && canVote
            ? "bg-rose-600 text-white shadow-sm"
            : canVote
              ? "bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-700"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
        } disabled:opacity-40`}
      >
        {!user ? <Lock size={11} /> : <ThumbsDown size={13} />}
        <span>{totalDownvotes.toLocaleString()}</span>
      </button>

      {isResolved ? (
        <span className="ml-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
          <CheckCircle2 size={12} /> Resolved
        </span>
      ) : !user ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push("/auth?mode=login");
          }}
          className="ml-1 text-xs text-blue-600 hover:underline font-semibold"
        >
          Log in to vote
        </button>
      ) : !isOwnConstituency ? (
        <span className="ml-1 text-xs text-gray-400 flex items-center gap-0.5">
          <Lock size={9} /> Own constituency only
        </span>
      ) : null}
    </div>
  );

  // ─── List layout ──────────────────────────────────────────────────────────

  if (viewMode === "list") {
    return (
      <article
        onClick={handleCardClick}
        className="group cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 p-4 flex gap-4 items-start"
      >
        {/* Left: main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {badges}
            <span className="text-xs text-gray-400 ml-auto">
              {petition.created_at}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-900 transition-colors">
            {petition.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {petition.description}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={11} />
            <span>{petition.constituency_name}</span>
          </div>
        </div>

        {/* Right: progress + votes */}
        <div className="flex flex-col gap-3 shrink-0 w-56">
          {progressBar}
          {voteRow}
        </div>

        <ChevronRight
          size={16}
          className="text-gray-300 group-hover:text-blue-400 transition-colors self-center shrink-0"
        />
      </article>
    );
  }

  // ─── Grid layout (original) ───────────────────────────────────────────────

  return (
    <article
      onClick={handleCardClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 p-5 flex flex-col gap-3"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        {badges}
        <span className="flex-shrink-0 text-xs text-gray-400 mt-0.5">
          {petition.created_at}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-900 transition-colors">
        {petition.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
        {petition.description}
      </p>

      {/* Constituency badge */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <MapPin size={11} />
        <span>{petition.constituency_name}</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-medium">
          <span
            className={
              petition.status === "Resolved"
                ? "text-emerald-600"
                : "text-blue-900"
            }
          >
            {totalUpvotes.toLocaleString()} / {petition.target.toLocaleString()}{" "}
            for Parliamentary Discussion
          </span>
          <span
            className={
              petition.status === "Resolved"
                ? "text-emerald-600 font-bold"
                : "text-gray-500"
            }
          >
            {progressPct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              petition.status === "Resolved"
                ? "bg-emerald-500"
                : progressPct >= 80
                  ? "bg-blue-600"
                  : "bg-blue-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Vote row */}
      <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
        <button
          onClick={(e) => handleVote("up", e)}
          disabled={canVote ? false : isResolved}
          title={
            !user
              ? "Log in to vote"
              : !isOwnConstituency
                ? "You can only vote on petitions in your own constituency"
                : undefined
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            userVote === "up" && canVote
              ? "bg-blue-600 text-white shadow-sm"
              : canVote
                ? "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                : "bg-gray-50 text-gray-300 cursor-not-allowed"
          } disabled:opacity-40`}
        >
          {!user ? <Lock size={11} /> : <ThumbsUp size={13} />}
          <span>{totalUpvotes.toLocaleString()}</span>
        </button>

        <button
          onClick={(e) => handleVote("down", e)}
          disabled={canVote ? false : isResolved}
          title={
            !user
              ? "Log in to vote"
              : !isOwnConstituency
                ? "You can only vote on petitions in your own constituency"
                : undefined
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            userVote === "down" && canVote
              ? "bg-rose-600 text-white shadow-sm"
              : canVote
                ? "bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-700"
                : "bg-gray-50 text-gray-300 cursor-not-allowed"
          } disabled:opacity-40`}
        >
          {!user ? <Lock size={11} /> : <ThumbsDown size={13} />}
          <span>{totalDownvotes.toLocaleString()}</span>
        </button>

        {isResolved ? (
          <span className="ml-auto text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> Issue Resolved
          </span>
        ) : !user ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push("/auth?mode=login");
            }}
            className="ml-auto text-xs text-blue-600 hover:underline font-semibold"
          >
            Log in to vote
          </button>
        ) : !isOwnConstituency ? (
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-0.5">
            <Lock size={9} /> Own constituency only
          </span>
        ) : null}
      </div>
    </article>
  );
}
