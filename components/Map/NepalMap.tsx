'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, GeoJSON, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ConstituenciesMap, Candidate, ConstituencyProperties } from '@/types';
import { formatConstituencyName } from '@/lib/utils';

import MapControls from '@/components/MapControls';
import SearchControl from '@/components/Map/SearchControl';

interface NepalMapProps {
    onConstituencySelect?: (geoId: string) => void;
}

// Styles
const ELECTION_STYLE = {
    fillColor: '#FFFFFF',
    color: '#D1D5DB', // Gray-300
    weight: 1,
    fillOpacity: 1,
};

const SATELLITE_STYLE = {
    fillColor: '#FFFFFF',
    color: '#FBBF24',     // Amber-400 (Yellow/Gold)
    weight: 2,
    fillOpacity: 0.1,
};

// Updated Hover Styles per requirements
const HOVER_STYLE_ELECTION = {
    fillColor: '#E5E7EB', // Highlight Gray
    color: '#000000',     // Black
    weight: 2,
    fillOpacity: 1,
};

const HOVER_STYLE_SATELLITE = {
    fillColor: '#FFFFFF',
    color: '#FBBF24',     // Yellow/Gold Border
    weight: 3,
    fillOpacity: 0.3      // Transparent to see satellite
};

const SELECTED_STYLE = {
    fillColor: '#DC143C',
    color: '#DC143C',
    weight: 3,
    fillOpacity: 0.4
};

const PARTY_COLORS: Record<string, string> = {
    'CPN-UML': '#DC143C',
    'Nepali Congress': '#2E8B57',
    'RSP': '#0056b3',
    'RPP': '#FFD700',
    'Maoist': '#b91c1c',
};

const getPartyColor = (party: string) => {
    const p = party.replace(/[-_]/g, ' ').toLowerCase();

    if (p.includes('uml')) return PARTY_COLORS['CPN-UML'];
    if (p.includes('congress') || p === 'nc') return PARTY_COLORS['Nepali Congress'];
    if (p.includes('rsp') || p.includes('swatantra')) return PARTY_COLORS['RSP'];
    if (p.includes('rpp') || p.includes('prajatantra')) return PARTY_COLORS['RPP'];
    if (p.includes('maoist')) return PARTY_COLORS['Maoist'];

    return '#6B7280';
};

function MapBounds({ geoJson }: { geoJson: import('geojson').FeatureCollection | null }) {
    const map = useMap();
    useEffect(() => {
        if (geoJson) {
            const layer = L.geoJSON(geoJson);
            map.fitBounds(layer.getBounds());
            map.setMinZoom(6);
        }
    }, [geoJson, map]);
    return null;
}

function MapEvents({ onClear, setAnimating }: { onClear: () => void, setAnimating: (v: boolean) => void }) {
    useMapEvents({
        click() {
            onClear();
        },
        movestart() { setAnimating(true); },
        moveend() { setAnimating(false); },
        zoomstart() { setAnimating(true); },
        zoomend() { setAnimating(false); },
    });
    return null;
}

export default function NepalMap({ }: NepalMapProps) {
    const [geoData, setGeoData] = useState<import('geojson').FeatureCollection | null>(null);
    const [constituenciesMap, setConstituenciesMap] = useState<ConstituenciesMap | null>(null);
    const [isSatellite, setIsSatellite] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const geoJsonRef = useRef<L.GeoJSON>(null);
    const mapRef = useRef<L.Map>(null); // Reference to Map instance

    useEffect(() => {
        Promise.all([
            fetch('/data/nepal_constituencies.geojson').then(r => r.json()),
            fetch('/data/candidates.json').then(r => r.json())
        ]).then(([geo, candidates]) => {
            setGeoData(geo);
            setConstituenciesMap(candidates);
        }).catch(err => console.error("Error loading data:", err));
    }, []);

    const getCandidates = (id: string): Candidate[] => {
        return constituenciesMap ? (constituenciesMap[id] || []) : [];
    };

    const handleSearchSelect = (geoId: string) => {
        setSelectedId(geoId);

        if (!mapRef.current || !geoJsonRef.current) return;

        const map = mapRef.current;
        const layers = geoJsonRef.current.getLayers();

        // Find the layer with matching ID
        const foundLayer = layers.find((layer) => {
            // Safe access to feature property using 'in' check or casting to unknown first
            // But we know these are GeoJSON layers which have a feature property
            const l = layer as L.Layer & { feature?: import('geojson').Feature<import('geojson').Geometry, ConstituencyProperties> };
            return l.feature?.properties?.orig_id === geoId;
        });

        if (foundLayer && foundLayer instanceof L.Polygon) {
            // Zoom to bounds
            const bounds = foundLayer.getBounds();
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 12,
                animate: true,
                duration: 1.5
            });

            // Open Tooltip
            foundLayer.openTooltip();
        }
    };

    const getFeatureStyle = useCallback((feature: import('geojson').Feature<import('geojson').Geometry, ConstituencyProperties> | undefined) => {
        if (feature?.properties?.orig_id === selectedId) {
            return SELECTED_STYLE;
        }
        return isSatellite ? SATELLITE_STYLE : ELECTION_STYLE;
    }, [isSatellite, selectedId]);

    const createTooltipContent = (properties: ConstituencyProperties) => {
        const candidates = getCandidates(properties.orig_id);
        const name = formatConstituencyName(properties.orig_id);

        let listHtml = '';
        if (candidates.length > 0) {
            listHtml = candidates.map(c => `
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${getPartyColor(c.party)}"></span>
                    <div class="text-xs">
                        <span class="font-medium text-gray-900">${c.name}</span>
                        <span class="text-gray-500 mx-1">•</span>
                        <span class="text-gray-500">${c.party}</span>
                    </div>
                </div>
            `).join('');
        } else {
            listHtml = '<div class="text-xs text-gray-400 italic">No candidates data</div>';
        }

        return `
            <div class="min-w-[200px] font-sans">
                <div class="font-bold text-sm text-gray-900 border-b pb-1 mb-2">${name}</div>
                <div class="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">${listHtml}</div>
            </div>
        `;
    };

    const onEachFeature = (feature: import('geojson').Feature<import('geojson').Geometry, ConstituencyProperties>, layer: L.Layer) => {
        // We set the initial style via the GeoJSON prop, but ensure safety here
        if (layer instanceof L.Path) {
            // Redundant if GeoJSON style prop is used, but harmless.
        }

        layer.on({
            mouseover: (e) => {
                if (isAnimating) return; // Prevent ghost hovers

                const l = e.target;
                if (feature.properties.orig_id === selectedId) return; // Maintain selected style

                if (l instanceof L.Path) {
                    // Dynamic Style based on mode
                    l.setStyle(isSatellite ? HOVER_STYLE_SATELLITE : HOVER_STYLE_ELECTION);
                    l.bringToFront();
                }
            },
            mouseout: (e) => {
                const l = e.target;
                if (geoJsonRef.current) {
                    geoJsonRef.current.resetStyle(l);
                }
            },
            click: (e) => {
                L.DomEvent.stopPropagation(e);
                setSelectedId(feature.properties.orig_id);

                const l = e.target;
                // Type guard and zoom logic
                if (l instanceof L.Polygon && mapRef.current) {
                    const bounds = l.getBounds();
                    mapRef.current.fitBounds(bounds, {
                        padding: [20, 20],
                        maxZoom: 12,
                        animate: true,
                        duration: 1
                    });
                }
            }
        });

        layer.bindTooltip(createTooltipContent(feature.properties), {
            sticky: true,
            className: 'leaflet-tooltip-rich',
            direction: 'auto',
            opacity: 1
        });
    };

    if (!geoData) return <div className="h-full w-full flex items-center justify-center text-gray-400">Loading Election Map...</div>;

    return (
        <div className="h-full w-full bg-white relative">
            <style jsx global>{`
                .leaflet-tooltip-rich {
                    background-color: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    padding: 12px;
                }
                .leaflet-tooltip-rich::before { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
            `}</style>

            <MapControls isSatellite={isSatellite} onToggle={() => setIsSatellite(!isSatellite)} />

            {/* Search Control */}
            <SearchControl
                items={constituenciesMap ? Object.keys(constituenciesMap) : []}
                onSelect={handleSearchSelect}
            />

            <MapContainer
                ref={mapRef}
                center={[28.3949, 84.1240]}
                zoom={7}
                scrollWheelZoom={true}
                className={`h-full w-full z-0 outline-none ${isSatellite ? 'bg-gray-900' : 'bg-white'} ${isAnimating ? 'pointer-events-none' : ''}`}
                zoomControl={false}
                attributionControl={false}
            >
                {isSatellite && (
                    <TileLayer
                        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                        attribution="Google Maps"
                    />
                )}

                {/* Key prop ensures re-mount when mode switches, refreshing event hooks with new state */}
                <GeoJSON
                    key={isSatellite ? 'sat' : 'elect'}
                    ref={geoJsonRef}
                    data={geoData}
                    style={getFeatureStyle}
                    onEachFeature={onEachFeature}
                />
                <MapEvents onClear={() => setSelectedId(null)} setAnimating={setIsAnimating} />
                <MapBounds geoJson={geoData} />
            </MapContainer>

            <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded border border-gray-100 text-[10px] text-gray-400 z-[400] pointer-events-none">
                Nepal Election 2026 • {isSatellite ? "Satellite View" : "Map View"}
            </div>
        </div>
    );
}
