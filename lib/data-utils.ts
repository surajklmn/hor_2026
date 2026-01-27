import fs from 'fs';
import path from 'path';
import { ConstituenciesMap, Candidate } from '@/types';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'candidates.json');

export async function getCandidatesData(): Promise<ConstituenciesMap> {
    const fileContent = await fs.promises.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(fileContent);
}

// Helper to look up by ID
export async function getCandidatesByKey(geoId: string): Promise<Candidate[]> {
    const data = await getCandidatesData();
    // keys are lower case already in candidates.json
    return data[geoId.toLowerCase()] || [];
}
