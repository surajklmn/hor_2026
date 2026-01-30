import { Layers, Map, Type } from 'lucide-react';

interface MapControlsProps {
    isSatellite: boolean;
    onToggle: () => void;
    showDistrictNames: boolean;
    onToggleNames: () => void;
    showLocalLevels: boolean;
    onToggleLocalLevels: () => void;
}

export default function MapControls({
    isSatellite,
    onToggle,
    showDistrictNames,
    onToggleNames,
    showLocalLevels,
    onToggleLocalLevels
}: MapControlsProps) {
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

            <button
                onClick={onToggleLocalLevels}
                className={`p-3 rounded-lg shadow-md border transition-all group ${showLocalLevels ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                title={showLocalLevels ? "Hide Local Levels" : "Show Local Levels"}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={showLocalLevels ? "text-purple-600" : "text-gray-700"}
                >
                    <rect x="3" y="21" width="18" height="2" />
                    <path d="M5 21V7l8-4 8 4v14" />
                    <path d="M13 21V12" />
                    <path d="M9 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                </svg>
                <span className="sr-only">Toggle Local Levels</span>
            </button>
        </div>
    );
}
