'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { formatConstituencyName, cn } from '@/lib/utils';

interface SearchControlProps {
    items: string[]; // List of IDs like "achham-1"
    onSelect: (id: string) => void;
    className?: string;
}

export default function SearchControl({ items, onSelect, className }: SearchControlProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter items based on query
    const filteredItems = useMemo(() => {
        if (!query) return [];

        const lowerQuery = query.toLowerCase();

        return items
            .filter((id) => {
                const name = formatConstituencyName(id).toLowerCase();
                return name.includes(lowerQuery) || id.toLowerCase().includes(lowerQuery);
            })
            .slice(0, 10); // Limit to 10 results
    }, [items, query]);

    // Handle outside click to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        setQuery(formatConstituencyName(id));
        setIsOpen(false);
        onSelect(id);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || filteredItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelect(filteredItems[selectedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Reset selection index when list changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredItems]);

    return (
        <div
            ref={containerRef}
            className={cn("w-64 md:w-80 group relative z-[500]", className)}
        >
            <div className={cn(
                "relative flex items-center bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md transition-all",
                isOpen ? "rounded-t-lg rounded-b-none" : "rounded-lg"
            )}>
                <Search className="w-4 h-4 text-gray-400 ml-3" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search constituency..."
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder:text-gray-400 py-3 px-2 h-10"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                            inputRef.current?.focus();
                        }}
                        className="p-2 hover:text-gray-600 text-gray-400"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {isOpen && filteredItems.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-lg max-h-64 overflow-y-auto divide-y divide-gray-50/50">
                    {filteredItems.map((id, index) => (
                        <li
                            key={id}
                            onClick={() => handleSelect(id)}
                            className={cn(
                                "px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center group/item",
                                index === selectedIndex ? "bg-gray-50 text-blue-600" : "text-gray-700"
                            )}
                        >
                            <span className="font-medium text-xs md:text-sm">{formatConstituencyName(id)}</span>
                            <span className="text-[10px] text-gray-400 opacity-0 group-hover/item:opacity-100 uppercase tracking-wider">Select</span>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && query && filteredItems.length === 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-lg p-3 text-xs text-center text-gray-400">
                    No matches found
                </div>
            )}
        </div>
    );
}
