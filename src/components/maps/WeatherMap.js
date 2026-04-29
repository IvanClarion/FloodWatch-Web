"use client";

import React, { useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import { Thermometer, Gauge, Wind, CloudRain, Cloud } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Weather Maps 1.0 layers
const WEATHER_LAYERS = [
  { op: 'temp_new', label: 'Temperature', Icon: Thermometer },
  { op: 'pressure_new', label: 'Pressure', Icon: Gauge },
  { op: 'wind_new', label: 'Wind speed', Icon: Wind },
  { op: 'precipitation_new', label: 'Precipitation', Icon: CloudRain },
  { op: 'clouds_new', label: 'Clouds', Icon: Cloud },
];

export default function WeatherMap() {
  const [activeLayer, setActiveLayer] = useState('temp_new');

  // Restrict the map panning to Cebu bounds
  const cebuBounds = [
    [123.00, 9.20],
    [124.50, 11.50]
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* Floating Layer Selector — matching the reference UI */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-2xl shadow-lg overflow-hidden" style={{ minWidth: '180px' }}>
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

      <Map
        initialViewState={{ latitude: 10.3157, longitude: 123.8854, zoom: 8.5 }}
        maxBounds={cebuBounds}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* OpenWeather Map 1.0 Tile Layer */}
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
