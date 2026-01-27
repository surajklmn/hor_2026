import { Layers, Map, Type } from 'lucide-react';

interface MapControlsProps {
    isSatellite: boolean;
    onToggle: () => void;
    showDistrictNames: boolean;
    onToggleNames: () => void;
}

export default function MapControls({ isSatellite, onToggle, showDistrictNames, onToggleNames }: MapControlsProps) {
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

            <button
                onClick={onToggleNames}
                className={`p-3 rounded-lg shadow-md border transition-all group ${showDistrictNames ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                title={showDistrictNames ? "Hide District Names" : "Show District Names"}
            >
                <Type size={24} className={showDistrictNames ? "text-blue-600" : "text-gray-700"} />
                <span className="sr-only">Toggle District Names</span>
            </button>
        </div>
    );
}
