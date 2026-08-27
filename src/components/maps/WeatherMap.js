"use client";

import React, { useState, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import { Thermometer, Wind, CloudRain, Cloud } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapToggleSwitch from './MapToggleSwitch';

import { supabase } from '@/supabase/util/supabase';

// OpenWeather Tile Map Layers
const WEATHER_LAYERS = [
  { op: 'temp_new', label: 'Temperature', Icon: Thermometer },
  { op: 'wind_new', label: 'Wind speed', Icon: Wind },
  { op: 'precipitation_new', label: 'Precipitation', Icon: CloudRain },
  { op: 'clouds_new', label: 'Clouds', Icon: Cloud },
];

export default function WeatherMap({ activeTab: externalTab, onTabChange: externalOnTabChange }) {
  const [internalTab, setInternalTab] = useState('Weather Telemetry');
  const activeTab = externalTab !== undefined ? externalTab : internalTab;
  const handleTabChange = externalOnTabChange || setInternalTab;

  const [activeLayer, setActiveLayer] = useState('temp_new');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Restrict map panning to Cebu & Visayas bounds
  const cebuBounds = [
    [122.00, 8.50],
    [125.50, 12.00]
  ];

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());

    // Supabase Realtime subscription for weather_telemetry updates
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
      <div className="absolute top-20 left-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ minWidth: '200px' }}>
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
                fontSize: '13px',
                fontWeight: isActive ? '700' : '500',
                transition: 'all 0.25s ease',
              }}
            >
              <layer.Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#0035A9]' : 'text-gray-500'} />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mapbox Canvas with OpenWeather Raster Tile Layers */}
      <Map
        initialViewState={{ latitude: 10.3157, longitude: 123.8854, zoom: 8.5 }}
        maxBounds={cebuBounds}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        style={{ width: '100%', height: '100%' }}
        scrollZoom={true}
        dragPan={true}
        dragRotate={true}
        doubleClickZoom={true}
        touchZoomRotate={true}
      >
        <NavigationControl position="top-right" />

        {/* Render Active OpenWeather Map Raster Layer */}
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
      </Map>
    </div>
  );
}
