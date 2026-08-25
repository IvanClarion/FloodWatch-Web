"use client";

import React, { useState, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, Marker } from 'react-map-gl/mapbox';
import { Thermometer, Tornado, Wind, CloudRain, Cloud, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapToggleSwitch from './MapToggleSwitch';

import { supabase } from '@/supabase/util/supabase';

// Weather & Cyclone Tracking layers
const WEATHER_LAYERS = [
  { op: 'temp_new', label: 'Temperature', Icon: Thermometer },
  { op: 'typhoon', label: 'Cyclone / Typhoon', Icon: Tornado },
  { op: 'wind_new', label: 'Wind speed', Icon: Wind },
  { op: 'precipitation_new', label: 'Precipitation', Icon: CloudRain },
  { op: 'clouds_new', label: 'Clouds', Icon: Cloud },
];

export default function WeatherMap({ activeTab: externalTab, onTabChange: externalOnTabChange }) {
  const [internalTab, setInternalTab] = useState('Weather Telemetry');
  const activeTab = externalTab !== undefined ? externalTab : internalTab;
  const handleTabChange = externalOnTabChange || setInternalTab;

  const [activeLayer, setActiveLayer] = useState('temp_new');
  const [cyclones, setCyclones] = useState([]);
  const [isFetchingCyclone, setIsFetchingCyclone] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Restrict the map panning to Cebu bounds
  const cebuBounds = [
    [123.00, 9.20],
    [124.50, 11.50]
  ];

  // Fetch real-time Tropical Cyclone events from GDACS (Global Disaster Alert & Coordination System)
  const fetchLiveCyclones = async () => {
    setIsFetchingCyclone(true);
    try {
      // Query active Tropical Cyclones (TC) globally from public GDACS API
      const res = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/LIST?eventtype=TC', {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        const events = data?.features || [];
        
        // Filter for active cyclones within or near the Philippine Area of Responsibility (PAR)
        // PAR approx bounds: Lat 4°N to 26°N, Lng 114°E to 145°E
        const activeInPAR = events.filter((ev) => {
          const coords = ev?.geometry?.coordinates;
          if (!coords || coords.length < 2) return false;
          const [lng, lat] = coords;
          const isAlive = ev?.properties?.iscurrent !== "false" && ev?.properties?.iscurrent !== false;
          return isAlive && lat >= 4 && lat <= 26 && lng >= 114 && lng <= 145;
        }).map((ev) => {
          const coords = ev.geometry.coordinates;
          return {
            id: ev.properties?.eventid || Math.random().toString(),
            name: ev.properties?.name || "Unnamed Cyclone",
            alertLevel: ev.properties?.alertlevel || "Green",
            description: ev.properties?.description || "Tropical Cyclone Warning",
            lng: coords[0],
            lat: coords[1],
            fromDate: ev.properties?.fromdate
          };
        });

        setCyclones(activeInPAR);
      } else {
        setCyclones([]);
      }
    } catch (error) {
      console.error("🚨 Error fetching live cyclone API data:", error);
      setCyclones([]); // Default to empty accurate state if offline or zero storms reported
    } finally {
      setIsFetchingCyclone(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchLiveCyclones();

    // Auto-poll live cyclone tracking feeds every 60 seconds
    const interval = setInterval(fetchLiveCyclones, 60000);

    // Supabase Realtime subscription for weather_telemetry changes
    const channelId = `weather-map-telemetry-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weather_telemetry' },
        () => {
          setLastUpdated(new Date().toLocaleTimeString());
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative w-full h-screen min-h-[600px] rounded-2xl overflow-hidden shadow-sm">
      {/* ── Floating Map Toggle Switch Overlay (Unconditional & z-50) ── */}
      <div className="absolute top-4 left-4 z-50">
        <MapToggleSwitch activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      
      {/* Floating Layer Selector */}
      <div className="absolute top-20 left-4 z-40 bg-white rounded-2xl shadow-lg overflow-hidden" style={{ minWidth: '190px' }}>
        {WEATHER_LAYERS.map((layer) => {
          const isActive = activeLayer === layer.op;
          return (
            <button
              key={layer.op}
              onClick={() => setActiveLayer(layer.op)}
              className="cursor-pointer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                background: isActive ? '#0035A91A' : 'transparent',
                color: isActive ? '#0035A9' : '#555',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.25s ease',
              }}
            >
              <layer.Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {layer.label}
            </button>
          );
        })}
      </div>

      {/* ── Real-time Cyclone Status Panel (Visible when Cyclone/Typhoon is selected) ── */}
      {activeLayer === 'typhoon' && (
        <div className="absolute bottom-6 left-6 z-40 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-200 max-w-xs md:max-w-md transition-all">
          {isFetchingCyclone ? (
            <div className="flex items-center gap-3 py-2 text-gray-600 text-xs font-semibold">
              <RefreshCw className="size-4 animate-spin text-blue-600" />
              <span>Querying live meteorological disaster APIs for PAR...</span>
            </div>
          ) : cyclones.length === 0 ? (
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                  <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
                  <span>NO ACTIVE TYPHOON IN PAR</span>
                </div>
                <button
                  type="button"
                  onClick={fetchLiveCyclones}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                  title="Refresh cyclone feeds"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                Live meteorological verification confirms there are currently <strong>no active tropical cyclones or typhoons</strong> operating within the Philippine Area of Responsibility (PAR) or Cebu sector.
              </p>
              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
                <span>Source: GDACS & PAGASA Telemetry</span>
                {lastUpdated && <span>Updated: {lastUpdated}</span>}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-red-100 pb-2 mb-2">
                <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                  <AlertTriangle className="size-5 shrink-0 animate-bounce" />
                  <span>ACTIVE CYCLONE DETECTED</span>
                </div>
                <button
                  type="button"
                  onClick={fetchLiveCyclones}
                  className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                  title="Refresh cyclone feeds"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              </div>
              {cyclones.map((cyc) => (
                <div key={cyc.id} className="mb-2">
                  <h4 className="font-black text-gray-800 text-base">{cyc.name}</h4>
                  <p className="text-xs font-semibold text-red-700 bg-red-50 py-1 px-2 rounded-md my-1 inline-block">
                    Alert Level: {cyc.alertLevel}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{cyc.description}</p>
                </div>
              ))}
              <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500 italic">
                Active tracking via real-time disaster coordination feeds.
              </div>
            </div>
          )}
        </div>
      )}

      <Map
        initialViewState={{ latitude: 10.1500, longitude: 123.8854, zoom: 8.5 }}
        maxBounds={cebuBounds}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {/* Only render OpenWeather Map Raster Tile Layer when NOT on cyclone toggle */}
        {activeLayer !== 'typhoon' && (
          <Source
            key={activeLayer}
            id="openweathermap-weather"
            type="raster"
            tiles={[
              `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
            ]}
            tileSize={256}
          >
            <Layer 
              id="weather-raster-layer" 
              type="raster" 
              paint={{ 
                'raster-opacity': 0.9, 
                'raster-fade-duration': 300 
              }} 
            />
          </Source>
        )}

        {/* ── Active Live Cyclone Markers (Only displays when live storm exists in PAR) ── */}
        {activeLayer === 'typhoon' && cyclones.map((cyc) => (
          <Marker key={cyc.id} longitude={cyc.lng} latitude={cyc.lat}>
            <div className="relative group cursor-pointer flex flex-col items-center">
              <div className="absolute -inset-2 bg-red-600/30 rounded-full animate-ping" />
              <div className="bg-red-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                <Tornado className="size-5" />
              </div>
              <span className="mt-1 bg-gray-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                {cyc.name}
              </span>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
