export interface Candidate {
  name: string;
  party: string;
}

export interface ConstituenciesMap {
  [key: string]: Candidate[];
}

export interface ConstituencyProperties {
  id: string;
  name: string;
  district: string;
  constituencyNumber: number;
  [key: string]: unknown;
}

export interface ResultCandidate {
  name: string;
  party: string;
  votes: number;
  status: string;
  symbol: string;
}

export interface ElectionResult {
  district: string;
  constituency: string;
  candidates: ResultCandidate[];
}

export type ElectionResultsMap = Record<string, ElectionResult>;

// ─── Petition types ──────────────────────────────────────────────────────────

export type PetitionCategory =
  | "Roads"
  | "Water"
  | "Policy"
  | "Education"
  | "Healthcare"
  | "Environment";

export type PetitionStatus =
  | "Collecting Signatures"
  | "Under Review"
  | "Resolved";

export interface Petition {
  id: string;
  title: string;
  description: string;
  constituency_id: string;
  constituency_name: string;
  upvotes: number;
  downvotes: number;
  category: PetitionCategory;
  status: PetitionStatus;
  created_at: string;
  target: number;
}

export interface VoteDelta {
  upvotes: number;
  downvotes: number;
}

// ─── Auth types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  voterID: string;
  name: string;
  dob: string; // ISO date string (YYYY-MM-DD)
  constituencyId: string; // lowercase-hyphen e.g. "jhapa-1"
  constituencyName: string; // display name e.g. "Jhapa 1"
  province: string;
  district: string;
}
