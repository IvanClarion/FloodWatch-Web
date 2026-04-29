"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import CircleSkeleton from '@/components/skeleton/CircleSkeleton';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/supabase/util/supabase'; 

export default function FloodWatchMap() {
  const [weatherData, setWeatherData] = useState([]);
  const [selectedMuni, setSelectedMuni] = useState(null);

  useEffect(() => {
    // 1. Fetch initial map data
    const fetchWeather = async () => {
      const { data } = await supabase.from('live_municipality_weather').select('*');
      if (data) setWeatherData(data);
    };

    fetchWeather();

    // 2. Listen for Realtime updates from your Edge Function
    const channel = supabase
      .channel('live-weather')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'weather_telemetry' }, (payload) => {
        setWeatherData((currentData) => 
          currentData.map((muni) => 
            muni.municipality_id === payload.new.municipality_id 
              ? { ...muni, ...payload.new } 
              : muni
          )
        );
      })
      .subscribe();

    // Cleanup when component unmounts
    return () => supabase.removeChannel(channel);
  }, []);

  // Simple function to decide marker color
  const getColor = (rain) => {
    if (rain >= 30) return 'map-pin-icon-default-red';
    if (rain >= 15) return 'map-pin-icon-default-orange';
    if (rain >= 7.5) return 'map-pin-icon-default-yellow';
    return 'map-pin-icon-default';
  };

  // Restrict the map panning to Cebu bounds to save rendering/loading
  const cebuBounds = [
    [123.00, 9.20], // Southwest coordinates [lng, lat]
    [124.50, 11.50] // Northeast coordinates [lng, lat]
  ];

  return (
    <div style={{ width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden' }}>
      <Map
        initialViewState={{ latitude: 10.3157, longitude: 123.8854, zoom: 8.5 }}
        maxBounds={cebuBounds}
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* Loop through data and place markers */}
        {weatherData.map((muni) => (
          <Marker
            key={muni.municipality_id}
            longitude={muni.longitude}
            latitude={muni.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedMuni(muni);
            }}
          >
            {/* The Dot on the map */}
            <Suspense fallback={<CircleSkeleton />}>
              <div 
                className={getColor(muni.rainfall_mm)}
              />
            </Suspense>
          </Marker>
        ))}

        {/* Show Popup only if a town is clicked */}
        {selectedMuni && (
          <Popup
            longitude={selectedMuni.longitude}
            latitude={selectedMuni.latitude}
            onClose={() => setSelectedMuni(null)}
            anchor="bottom"
            closeButton={false}
          >
            <div style={{ color: '#333', padding: '4px', minWidth: '150px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{selectedMuni.name}</h3>
              <p style={{ margin: '4px 0' }}>🌧️ Rain: <b>{selectedMuni.rainfall_mm}</b> mm/h</p>
              <p style={{ margin: '4px 0' }}>💨 Wind: <b>{selectedMuni.wind_speed}</b> m/s</p>
              <p style={{ margin: '4px 0', fontSize: '0.9em', color: 'gray' }}>{selectedMuni.weather_condition}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}