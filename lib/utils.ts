import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatConstituencyName(id: string): string {
    // Input: "achham-1" -> Output: "Achham 1"
    if (!id) return "";

    const parts = id.split('-');
    if (parts.length !== 2) return id; // Fallback

    const district = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const constituency = parts[1];

    return `${district} ${constituency}`;
}
