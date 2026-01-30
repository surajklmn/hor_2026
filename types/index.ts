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
