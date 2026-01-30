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
