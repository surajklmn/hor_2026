"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  GeoJSON,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – CSS side-effect import handled by Next.js webpack
import "leaflet/dist/leaflet.css";
import {
  ConstituenciesMap,
  Candidate,
  ConstituencyProperties,
  ElectionResultsMap,
  ElectionResult,
} from "@/types";
import * as turf from "@turf/turf";

import MapControls from "@/components/MapControls";
import SearchControl from "@/components/Map/SearchControl";

interface NepalMapProps {
  onConstituencySelect?: (geoId: string | null, name: string | null) => void;
}

// Styles
const ELECTION_STYLE = {
  fillColor: "#FFFFFF",
  color: "#D1D5DB", // Gray-300
  weight: 1,
  fillOpacity: 1,
};

const SATELLITE_STYLE = {
  fillColor: "#FFFFFF",
  color: "#FBBF24", // Amber-400 (Yellow/Gold)
  weight: 2,
  fillOpacity: 0.1,
};

// Updated Hover Styles per requirements
const HOVER_STYLE_ELECTION = {
  fillColor: "#E5E7EB", // Highlight Gray
  color: "#000000", // Black
  weight: 2,
  fillOpacity: 1,
};

const HOVER_STYLE_SATELLITE = {
  fillColor: "#FFFFFF",
  color: "#FBBF24", // Yellow/Gold Border
  weight: 3,
  fillOpacity: 0.3, // Transparent to see satellite
};

const SELECTED_STYLE = {
  fillColor: "#DC143C",
  color: "#DC143C",
  weight: 3,
  fillOpacity: 0.4,
};

const getPartyColor = (party: string) => {
  const p = party.toLowerCase();

  // Nepali Congress - Green
  if (p.includes("congress") || p === "nc" || p.includes("काँग्र"))
    return "#2E8B57"; // SeaGreen

  // RSP - Blue
  if (
    p.includes("rsp") ||
    p === "rastriya swatantra party" ||
    p.includes("राष्ट्रिय स्वतन्त्र पार्टी")
  )
    return "#0056b3";

  // RPP - Yellow
  if (
    p.includes("rpp") ||
    p.includes("prajatantra") ||
    p.includes("प्रजातन्त्र")
  )
    return "#FFD700"; // Gold

  // Communist Parties (UML, Maoist, Unified Socialist, etc.) - Red
  if (
    p.includes("communist") ||
    p.includes("कम्युनिष्ट") ||
    p.includes("uml") ||
    p.includes("maoist") ||
    p.includes("एमाले") ||
    p.includes("माओवादी")
  )
    return "#DC143C"; // Crimson Red

  // Others - Grey
  return "#6B7280";
};

function MapBounds({
  geoJson,
}: {
  geoJson: import("geojson").FeatureCollection | null;
}) {
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

function MapEvents({
  onClear,
  setAnimating,
}: {
  onClear: () => void;
  setAnimating: (v: boolean) => void;
}) {
  useMapEvents({
    click() {
      onClear();
    },
    movestart() {
      setAnimating(true);
    },
    moveend() {
      setAnimating(false);
    },
    zoomstart() {
      setAnimating(true);
    },
    zoomend() {
      setAnimating(false);
    },
  });
  return null;
}

export default function NepalMap({ onConstituencySelect }: NepalMapProps) {
  const [geoData, setGeoData] = useState<
    import("geojson").FeatureCollection | null
  >(null);
  const [districtGeoData, setDistrictGeoData] = useState<
    import("geojson").FeatureCollection | null
  >(null);
  const [protectedAreasGeoData, setProtectedAreasGeoData] = useState<
    import("geojson").FeatureCollection | null
  >(null);
  const [localLevelGeoData, setLocalLevelGeoData] = useState<
    import("geojson").FeatureCollection | null
  >(null);
  const [constituenciesMap, setConstituenciesMap] =
    useState<ConstituenciesMap | null>(null);
  const [electionResults2079, setElectionResults2079] =
    useState<ElectionResultsMap | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [electionYear, setElectionYear] = useState<"2026" | "2079">("2026");
  const [showDistrictNames, setShowDistrictNames] = useState(true);
  const [showLocalLevels, setShowLocalLevels] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const geoJsonRef = useRef<L.GeoJSON>(null);
  const mapRef = useRef<L.Map>(null); // Reference to Map instance

  useEffect(() => {
    Promise.all([
      fetch("/data/nepal_constituencies.geojson").then((r) => r.json()),
      fetch("/data/nepal_districts.geojson").then((r) => r.json()),
      fetch("/data/candidates.json").then((r) => r.json()),
      fetch("/data/nepal_protected_areas.geojson").then((r) => r.json()),
      fetch("/data/nepal_municipalities.geojson").then((r) => r.json()),
      fetch("/data/nepal_municipalities.geojson").then((r) => r.json()),
    ])
      .then(([geo, districts, candidates, protectedAreas, localLevels]) => {
        // FIX: Kailali 3 overlaps Kailali 1. We geometricall subtract Kailali 1 from Kailali 3.
        if (geo && geo.features) {
          const k1 = geo.features.find(
            (f: import("geojson").Feature) => f.properties?.id === "kailali-1",
          );
          const k2 = geo.features.find(
            (f: import("geojson").Feature) => f.properties?.id === "kailali-2",
          );
          const k3 = geo.features.find(
            (f: import("geojson").Feature) => f.properties?.id === "kailali-3",
          );

          if (k3) {
            try {
              let fixedK3 = turf.feature(k3.geometry);

              // Subtract K1
              if (k1) {
                const diff1 = turf.difference(
                  turf.featureCollection([fixedK3, turf.feature(k1.geometry)]),
                );
                if (diff1) fixedK3 = diff1;
              }

              // Subtract K2
              if (k2) {
                const diff2 = turf.difference(
                  turf.featureCollection([fixedK3, turf.feature(k2.geometry)]),
                );
                if (diff2) fixedK3 = diff2;
              }

              if (fixedK3) {
                // Preserve properties
                fixedK3.properties = k3.properties;
                fixedK3.id = k3.id;

                // Replace in array
                const k3Index = geo.features.findIndex(
                  (f: import("geojson").Feature) =>
                    f.properties?.id === "kailali-3",
                );
                if (k3Index !== -1) {
                  geo.features[k3Index] = fixedK3;
                }
              }
            } catch (e) {
              console.error("Failed to fix Kailali overlap:", e);
            }
          }

          // FIX: Jhapa 1 overlaps Ilam 1. Subtract Ilam 1 from Jhapa 1.
          const i1 = geo.features.find(
            (f: import("geojson").Feature) => f.properties?.id === "ilam-1",
          );
          const j1 = geo.features.find(
            (f: import("geojson").Feature) => f.properties?.id === "jhapa-1",
          );

          if (j1 && i1) {
            try {
              const fixedJ1 = turf.difference(
                turf.featureCollection([
                  turf.feature(j1.geometry),
                  turf.feature(i1.geometry),
                ]),
              );
              if (fixedJ1) {
                fixedJ1.properties = j1.properties;
                fixedJ1.id = j1.id;
                const index = geo.features.findIndex(
                  (f: import("geojson").Feature) =>
                    f.properties?.id === "jhapa-1",
                );
                if (index !== -1) geo.features[index] = fixedJ1;
              }
            } catch (e) {
              console.error("Failed to fix Jhapa-Ilam overlap:", e);
            }
          }
        }

        setGeoData(geo);
        setDistrictGeoData(districts);
        setConstituenciesMap(candidates);
        setProtectedAreasGeoData(protectedAreas);
        setLocalLevelGeoData(localLevels);
        setLocalLevelGeoData(localLevels);
      })
      .catch((err) => console.error("Error loading data:", err));

    // Load 2079 results separately to avoid blocking map render
    fetch("/data/results_2079.json")
      .then((r) => r.json())
      .then((data: Record<string, ElectionResult>) => {
        // Normalize keys to lowercase for matching with GeoJSON IDs
        const normalized: ElectionResultsMap = {};
        Object.entries(data).forEach(([key, val]) => {
          normalized[key.toLowerCase()] = val as ElectionResult;
        });
        setElectionResults2079(normalized);
      })
      .catch((err) => console.error("Error loading 2079 results:", err));
  }, []);

  const getCandidates = (id: string): Candidate[] => {
    return constituenciesMap ? constituenciesMap[id] || [] : [];
  };

  const handleSearchSelect = (geoId: string) => {
    setSelectedId(geoId);

    // Notify parent about selection
    if (geoData) {
      const feat = geoData.features.find(
        (f: import("geojson").Feature) => f.properties?.id === geoId,
      );
      onConstituencySelect?.(
        geoId,
        (feat?.properties as { name?: string } | null)?.name ?? geoId,
      );
    }

    if (!mapRef.current || !geoJsonRef.current) return;

    const map = mapRef.current;
    const layers = geoJsonRef.current.getLayers();

    // Find the layer with matching ID
    const foundLayer = layers.find((layer) => {
      // Safe access to feature property using 'in' check or casting to unknown first
      // But we know these are GeoJSON layers which have a feature property
      const l = layer as L.Layer & {
        feature?: import("geojson").Feature<
          import("geojson").Geometry,
          ConstituencyProperties
        >;
      };
      return l.feature?.properties?.id === geoId;
    });

    if (foundLayer && foundLayer instanceof L.Polygon) {
      // Zoom to bounds
      const bounds = foundLayer.getBounds();
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 12,
        animate: true,
        duration: 1.5,
      });

      // Open Tooltip
      foundLayer.openTooltip();
    }
  };

  const getFeatureStyle = useCallback(
    (
      feature:
        | import("geojson").Feature<
            import("geojson").Geometry,
            ConstituencyProperties
          >
        | undefined,
    ) => {
      if (feature?.properties?.id === selectedId) {
        return SELECTED_STYLE;
      }
      if (electionYear === "2079" && feature?.properties?.id) {
        const result = electionResults2079?.[feature.properties.id];

        // Find winner (Elected status)
        const winner = result?.candidates?.find(
          (c: { status: string }) => c.status === "Elected",
        );

        if (winner?.party) {
          return {
            fillColor: getPartyColor(winner.party),
            color: "#D1D5DB",
            weight: 1,
            fillOpacity: 0.7,
          };
        }
      }
      return isSatellite ? SATELLITE_STYLE : ELECTION_STYLE;
    },
    [isSatellite, selectedId, electionYear, electionResults2079],
  );

  const createTooltipContent = (properties: ConstituencyProperties) => {
    const candidates = getCandidates(properties.id);
    const name = properties.name;

    let listHtml = "";
    if (candidates.length > 0) {
      listHtml = candidates
        .map(
          (c) => `
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${getPartyColor(c.party)}"></span>
                    <div class="text-xs">
                        <span class="font-medium text-gray-900">${c.name}</span>
                        <span class="text-gray-500 mx-1">•</span>
                        <span class="text-gray-500">${c.party}</span>
                    </div>
                </div>
            `,
        )
        .join("");
    } else {
      listHtml =
        '<div class="text-xs text-gray-400 italic">No candidates data</div>';
    }

    return `
            <div class="min-w-[200px] font-sans">
                <div class="font-bold text-sm text-gray-900 border-b pb-1 mb-2">${name}</div>
                <div class="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">${listHtml}</div>
            </div>
        `;
  };

  const createTooltipContent2079 = (properties: ConstituencyProperties) => {
    const result = electionResults2079?.[properties.id];
    const name = properties.name;

    if (!result) {
      return `
                <div class="min-w-[200px] font-sans">
                    <div class="font-bold text-sm text-gray-900 border-b pb-1 mb-2">${name}</div>
                    <div class="text-xs text-gray-400 italic">No 2079 data available</div>
                </div>
            `;
    }

    // Sort candidates by votes (descending) just in case
    const sortedCandidates = [...result.candidates].sort(
      (a, b) => b.votes - a.votes,
    );

    // Show top 5 and summary for others
    const topCandidates = sortedCandidates.slice(0, 5);
    const otherCandidates = sortedCandidates.slice(5);

    const candidatesHtml = topCandidates
      .map(
        (c) => `
             <div class="flex items-center gap-2 mb-1 p-1 rounded hover:bg-gray-50 ${c.status === "Elected" ? "bg-yellow-50/50" : ""}">
                <div class="relative w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    ${c.symbol ? `<img src="/${c.symbol}" alt="Symbol" class="w-full h-full object-contain" />` : `<span class="w-2 h-2 rounded-full" style="background-color: ${getPartyColor(c.party)}"></span>`}
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between items-baseline">
                        <span class="font-medium text-xs text-gray-900 truncate mr-2">${c.name}</span>
                        <span class="text-[10px] font-mono text-gray-500">${c.votes.toLocaleString()}</span>
                    </div>
                    <div class="text-[10px] text-gray-500 truncate flex justify-between">
                         <span>${c.party}</span>
                         ${c.status === "Elected" ? '<span class="text-green-600 font-bold ml-1">WINNER</span>' : ""}
                    </div>
                </div>
            </div>
        `,
      )
      .join("");

    const othersHtml =
      otherCandidates.length > 0
        ? `
            <div class="mt-2 pt-1 border-t border-gray-100 text-[10px] text-gray-500 text-center font-medium">
                +${otherCandidates.length} other candidates
                <div class="text-[9px] text-gray-400 font-normal">
                    (${otherCandidates.reduce((sum, c) => sum + c.votes, 0).toLocaleString()} votes combined)
                </div>
            </div>
        `
        : "";

    return `
            <div class="min-w-[240px] font-sans">
                <div class="font-bold text-sm text-gray-900 border-b pb-1 mb-2 sticky top-0 bg-white z-10 flex justify-between items-center">
                    <span>${name}</span>
                    <span class="text-[10px] font-normal text-gray-500 border border-gray-200 px-1 rounded">2079</span>
                </div>
                <div class="space-y-0.5 max-h-[300px] overflow-visible">
                    ${candidatesHtml}
                    ${othersHtml}
                </div>
            </div>
        `;
  };

  const onEachFeature = (
    feature: import("geojson").Feature<
      import("geojson").Geometry,
      ConstituencyProperties
    >,
    layer: L.Layer,
  ) => {
    // We set the initial style via the GeoJSON prop, but ensure safety here
    if (layer instanceof L.Path) {
      // Redundant if GeoJSON style prop is used, but harmless.
    }

    layer.on({
      mouseover: (e) => {
        if (isAnimating) return; // Prevent ghost hovers

        const l = e.target;
        if (feature.properties.id === selectedId) return; // Maintain selected style

        if (l instanceof L.Path) {
          // Dynamic Style based on mode
          l.setStyle(
            isSatellite ? HOVER_STYLE_SATELLITE : HOVER_STYLE_ELECTION,
          );
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
        setSelectedId(feature.properties.id);
        onConstituencySelect?.(feature.properties.id, feature.properties.name);

        const l = e.target;
        // Type guard and zoom logic
        if (l instanceof L.Polygon && mapRef.current) {
          const bounds = l.getBounds();
          mapRef.current.fitBounds(bounds, {
            padding: [20, 20],
            maxZoom: 12,
            animate: true,
            duration: 1,
          });
        }
      },
    });

    const tooltipContent =
      electionYear === "2079"
        ? createTooltipContent2079(feature.properties)
        : createTooltipContent(feature.properties);

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: "leaflet-tooltip-rich",
      direction: "auto",
      opacity: 1,
    });
  };

  if (!geoData)
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400">
        Loading Election Map...
      </div>
    );

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
        .leaflet-tooltip-rich::before {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        .district-label {
          background: transparent;
          border: none;
          box-shadow: none;
          font-size: 10px;
          font-weight: 600;
          color: #374151; /* Gray-700 */
          text-shadow:
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff;
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>

      <MapControls
        isSatellite={isSatellite}
        onToggle={() => setIsSatellite(!isSatellite)}
        showDistrictNames={showDistrictNames}
        onToggleNames={() => setShowDistrictNames(!showDistrictNames)}
        showLocalLevels={showLocalLevels}
        onToggleLocalLevels={() => setShowLocalLevels(!showLocalLevels)}
      />

      {/* Top Left Controls Group */}
      <div className="absolute top-4 left-4 z-[500] flex gap-2 items-start">
        {/* Search Control */}
        <SearchControl
          items={constituenciesMap ? Object.keys(constituenciesMap) : []}
          onSelect={handleSearchSelect}
        />

        {/* Year Toggle Button */}
        <button
          onClick={() =>
            setElectionYear((prev) => (prev === "2026" ? "2079" : "2026"))
          }
          className={`
                        h-10 px-4 rounded-lg shadow-md border font-bold text-sm flex items-center justify-center transition-all whitespace-nowrap
                        ${
                          electionYear === "2079"
                            ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }
                    `}
          title="Switch Election Year"
        >
          {electionYear === "2079" ? "2079 Results" : "2079 Results"}
        </button>
      </div>

      <MapContainer
        ref={mapRef}
        center={[28.3949, 84.124]}
        zoom={7}
        scrollWheelZoom={true}
        className={`h-full w-full z-0 outline-none ${isSatellite ? "bg-gray-900" : "bg-white"} ${isAnimating ? "pointer-events-none" : ""}`}
        zoomControl={false}
        attributionControl={false}
      >
        {isSatellite && (
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution="Google Maps"
          />
        )}

        {/* Protected Areas Layer */}
        {protectedAreasGeoData && (
          <GeoJSON
            data={protectedAreasGeoData}
            style={{
              fillColor: "#10B981", // Emerald-500
              color: "#059669", // Emerald-600
              weight: 1,
              fillOpacity: 0.3,
              dashArray: "4, 4",
            }}
            onEachFeature={(feature, layer) => {
              layer.bindTooltip(feature.properties.name, {
                sticky: true,
                direction: "center",
                className:
                  "font-bold text-xs text-emerald-800 bg-white/80 border-emerald-200",
              });
            }}
          />
        )}

        {/* Local Levels Layer */}
        {showLocalLevels && localLevelGeoData && (
          <GeoJSON
            data={localLevelGeoData}
            style={{
              fillColor: "transparent",
              color: "#9333ea", // Purple-600
              weight: 0.5,
              opacity: 0.6,
              dashArray: "2, 4",
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                // Tooltip: "Deumai Nagarpalika, Ilam"
                const name = `${feature.properties.GaPa_NaPa} ${feature.properties.Type_GN}`;
                const district = feature.properties.DISTRICT;
                const tooltipContent = `
                                    <div class="text-xs font-sans">
                                        <div class="font-bold text-purple-700">${name}</div>
                                        <div class="text-gray-500">${district}</div>
                                    </div>
                                `;
                layer.bindTooltip(tooltipContent, {
                  className: "leaflet-tooltip-rich",
                  sticky: true,
                  direction: "top",
                });
              }
            }}
          />
        )}

        {/* District Layer - Below features to keep tooltips work, but above base tile */}
        {districtGeoData && (
          <GeoJSON
            key={`districts-${showDistrictNames}`}
            data={districtGeoData}
            style={{
              fillColor: "transparent",
              color: "#374151", // Gray-700
              weight: 1.5,
              opacity: 0.5,
              fillOpacity: 0,
            }}
            onEachFeature={(feature, layer) => {
              // Only bind tooltip if showDistrictNames is true
              if (
                showDistrictNames &&
                feature.properties &&
                feature.properties.district &&
                feature.properties.district !== "Protected Area"
              ) {
                layer.bindTooltip(feature.properties.district, {
                  permanent: true,
                  direction: "center",
                  className: "district-label",
                  interactive: false,
                });
              }
            }}
            // Ensure it doesn't capture clicks
            interactive={false}
          />
        )}

        {/* Key prop ensures re-mount when mode switches, refreshing event hooks with new state */}
        <GeoJSON
          key={isSatellite ? "sat" : `elect-${electionYear}`}
          ref={geoJsonRef}
          data={geoData}
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
        />
        <MapEvents
          onClear={() => {
            setSelectedId(null);
            onConstituencySelect?.(null, null);
          }}
          setAnimating={setIsAnimating}
        />
        <MapBounds geoJson={geoData} />
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded border border-gray-100 text-[10px] text-gray-400 z-[400] pointer-events-none">
        Nepal Election {electionYear} •{" "}
        {isSatellite ? "Satellite View" : "Map View"}
      </div>

      {/* Results Summary Modal (2079 only) */}
      {electionYear === "2079" && electionResults2079 && (
        <div className="absolute bottom-4 right-4 z-[500] w-64 bg-white/10 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 p-5 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 drop-shadow-sm">
              📊 2079 Seat Tally
            </h3>
            <span className="text-[10px] font-mono text-gray-500">
              Total: 165
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {(() => {
              // Calculate tally
              const tally: Record<string, { seats: number; color: string }> =
                {};
              Object.values(electionResults2079).forEach((res) => {
                const winner = res.candidates.find(
                  (c) => c.status === "Elected",
                );
                if (winner) {
                  const party = winner.party;
                  if (!tally[party]) {
                    tally[party] = { seats: 0, color: getPartyColor(party) };
                  }
                  tally[party].seats += 1;
                }
              });

              // Sort by seats
              return Object.entries(tally)
                .sort((a, b) => b[1].seats - a[1].seats)
                .map(([party, data]) => (
                  <div
                    key={party}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="text-xs text-gray-700 truncate font-medium group-hover:text-blue-600 transition-colors">
                        {party}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-[32px] justify-end">
                      <span className="text-xs font-bold text-gray-900">
                        {data.seats}
                      </span>
                    </div>
                  </div>
                ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
