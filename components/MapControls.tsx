'use client';

import { Layers, Map } from 'lucide-react';

interface MapControlsProps {
    isSatellite: boolean;
    onToggle: () => void;
}

export default function MapControls({ isSatellite, onToggle }: MapControlsProps) {
    return (
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <button
                onClick={onToggle}
                className="bg-white p-3 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all group"
                title={isSatellite ? "Switch to Election Mode" : "Switch to Satellite Mode"}
            >
                {isSatellite ? (
                    <Map size={24} className="text-gray-700" />
                ) : (
                    <Layers size={24} className="text-gray-700" />
                )}
                <span className="sr-only">Toggle Map Layer</span>
            </button>
        </div>
    );
}
