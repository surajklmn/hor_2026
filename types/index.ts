export interface Candidate {
    name: string;
    party: string;
}

export interface ConstituenciesMap {
    [key: string]: Candidate[];
}

export interface ConstituencyProperties {
    orig_id: string;
    district: string;
    const_id: string;
    [key: string]: unknown;
}
