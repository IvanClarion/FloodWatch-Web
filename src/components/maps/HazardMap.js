"use client";

import React, { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import { Waves, Mountain, Compass } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import HazardMapToogleButton from '../monitoring/HazardMapToogleButton';

export default function HazardMap() {
  const [activeHazard, setActiveHazard] = useState('flood'); // 'flood' | 'landslide'
  const mapRef = useRef(null);

  const mapStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const landslideTileset = process.env.NEXT_PUBLIC_LANDSLIDE_TILESET;
  const floodTileset = process.env.NEXT_PUBLIC_FLOOD_TILESET;

  // Exact vector source layer names from Mapbox Studio
  const [floodSourceLayer, setFloodSourceLayer] = useState("19a4b9f3ff2a64cacb03");
  const [landslideSourceLayer, setLandslideSourceLayer] = useState("6d3862b7307de146083d");

  const [viewState, setViewState] = useState({
    latitude: 10.3157,
    longitude: 123.8854,
    zoom: 9.5
  });

  // Dynamically inspect Mapbox vector tileset metadata if available
  const handleSourceData = (e) => {
    if (!e.map) return;
    try {
      if (floodTileset) {
        const fSrc = e.map.getSource('flood-hazard-source');
        if (fSrc && fSrc.vectorLayerIds && fSrc.vectorLayerIds.length > 0) {
          setFloodSourceLayer(fSrc.vectorLayerIds[0]);
        }
      }
      if (landslideTileset) {
        const lSrc = e.map.getSource('landslide-hazard-source');
        if (lSrc && lSrc.vectorLayerIds && lSrc.vectorLayerIds.length > 0) {
          setLandslideSourceLayer(lSrc.vectorLayerIds[0]);
        }
      }
    } catch (err) {
      console.error("Error inspecting vector source layer:", err);
    }
  };

  // Toggle visibility of any style layers pre-baked into Mapbox Studio style
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap?.();
    if (!map || !map.isStyleLoaded()) return;

    try {
      const layers = map.getStyle()?.layers || [];
      layers.forEach((l) => {
        const idLower = l.id.toLowerCase();
        if (idLower.includes('flood')) {
          map.setLayoutProperty(l.id, 'visibility', activeHazard === 'flood' ? 'visible' : 'none');
        }
        if (idLower.includes('landslide')) {
          map.setLayoutProperty(l.id, 'visibility', activeHazard === 'landslide' ? 'visible' : 'none');
        }
      });
    } catch (err) {
      // Ignore if layout property doesn't exist
    }
  }, [activeHazard]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[550px] rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-gray-900 group">
      {/* Mapbox Canvas */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onSourceData={handleSourceData}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
      >
        <NavigationControl position="top-right" />

        {/* Flood Hazard Vector Source */}
        {floodTileset && (
          <Source id="flood-hazard-source" type="vector" url={floodTileset}>
            <Layer
              id="flood-hazard-fill"
              type="fill"
              source="flood-hazard-source"
              source-layer={floodSourceLayer}
              layout={{
                visibility: activeHazard === 'flood' ? 'visible' : 'none'
              }}
              paint={{
                'fill-color': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  '#1d4ed8',
                  [
                    'match',
                    ['to-number', ['coalesce', ['get', 'Var'], ['get', 'HAZ'], ['get', 'Hazard'], 1]],
                    1, '#93C5FD',
                    2, '#3B82F6',
                    3, '#1D4ED8',
                    '#1D4ED8'
                  ]
                ],
                'fill-opacity': 0.65
              }}
            />
            <Layer
              id="flood-hazard-line"
              type="line"
              source="flood-hazard-source"
              source-layer={floodSourceLayer}
              layout={{
                visibility: activeHazard === 'flood' ? 'visible' : 'none'
              }}
              paint={{
                'line-color': '#1E40AF',
                'line-width': 1.5,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Landslide Hazard Vector Source */}
        {landslideTileset && (
          <Source id="landslide-hazard-source" type="vector" url={landslideTileset}>
            <Layer
              id="landslide-hazard-fill"
              type="fill"
              source="landslide-hazard-source"
              source-layer={landslideSourceLayer}
              layout={{
                visibility: activeHazard === 'landslide' ? 'visible' : 'none'
              }}
              paint={{
                'fill-color': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  '#991b1b',
                  [
                    'match',
                    ['to-number', ['coalesce', ['get', 'Var'], ['get', 'HAZ'], ['get', 'Hazard'], 1]],
                    1, '#FACC15',
                    2, '#FB923C',
                    3, '#DC2626',
                    '#DC2626'
                  ]
                ],
                'fill-opacity': 0.65
              }}
            />
            <Layer
              id="landslide-hazard-line"
              type="line"
              source="landslide-hazard-source"
              source-layer={landslideSourceLayer}
              layout={{
                visibility: activeHazard === 'landslide' ? 'visible' : 'none'
              }}
              paint={{
                'line-color': '#991B1B',
                'line-width': 1.5,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}
      </Map>

      {/* Floating Header Toggle Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-3 max-w-[calc(100%-80px)]">
        <HazardMapToogleButton
          activeHazard={activeHazard}
          onHazardChange={setActiveHazard}
        />
      </div>

      {/* Floating Info Legend Card (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 max-w-xs w-full bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-4 shadow-xl grid gap-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            {activeHazard === 'flood' ? (
              <Waves className="size-5 text-[#1D4ED8] shrink-0" />
            ) : (
              <Mountain className="size-5 text-[#DC2626] shrink-0" />
            )}
            <h4 className="font-extrabold text-sm text-gray-800">
              {activeHazard === 'flood' ? 'Flood Risk Susceptibility' : 'Landslide Risk Susceptibility'}
            </h4>
          </div>
          <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold uppercase">
            GIS Tileset
          </span>
        </div>

        {/* Susceptibility Legend Bars */}
        <div className="grid gap-2 text-xs font-semibold">
          {activeHazard === 'flood' ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#1D4ED8]/[0.65] shadow-xs border border-[#1E40AF]" />
                  <span className="text-gray-700">High Flood Risk</span>
                </div>
                <span className="text-gray-400 text-[11px]">Severe / Deep</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#3B82F6]/[0.65] shadow-xs border border-[#1E40AF]" />
                  <span className="text-gray-700">Moderate Flood Risk</span>
                </div>
                <span className="text-gray-400 text-[11px]">Medium Depth</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#93C5FD]/[0.65] shadow-xs border border-[#1E40AF]" />
                  <span className="text-gray-700">Low Flood Risk</span>
                </div>
                <span className="text-gray-400 text-[11px]">Low Depth</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#DC2626]/[0.65] shadow-xs border border-[#991B1B]" />
                  <span className="text-gray-700">High Landslide Risk</span>
                </div>
                <span className="text-gray-400 text-[11px]">Steep Slopes</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#FB923C]/[0.65] shadow-xs border border-[#991B1B]" />
                  <span className="text-gray-700">Moderate Landslide Risk</span>
                </div>
                <span className="text-gray-400 text-[11px]">Moderate Slopes</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#FACC15]/[0.65] shadow-xs border border-[#991B1B]" />
                  <span className="text-gray-700">Low Landslide Risk</span>
                </div>
                <span className="text-gray-400 text-[11px]">Stable Terrain</span>
              </div>
            </>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <Compass className="size-3 text-primary" /> Cebu Province GIS
          </span>
          <span className="text-primary font-bold">Live Layer Active</span>
        </div>
      </div>
    </div>
  );
}
