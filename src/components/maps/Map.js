"use client";

import React, { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { X, Thermometer, CloudRain, Wind, Cloud, Microscope, Waves, Leaf } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/supabase/util/supabase';
import GeneralCard from '../cards/GeneralCard';
import CardHeader from '../cards/CardHeader';
import CardSubHeader from '../cards/CardSubHeader';
// ─── AQI helpers ────────────────────────────────────────────────────────────
const AQI_LEVELS = [
  { max: 50, label: 'Good', color: '#22c55e' }, // green
  { max: 100, label: 'Moderate', color: '#eab308' }, // yellow
  { max: 150, label: 'Unhealthy (Sensitive)', color: '#f97316' }, // orange
  { max: 200, label: 'Unhealthy', color: '#ef4444' }, // red
  { max: 300, label: 'Very Unhealthy', color: '#a855f7' }, // purple
  { max: Infinity, label: 'Hazardous', color: '#7f1d1d' }, // dark-red
];

const getAqiMeta = (aqi) => {
  if (aqi == null) return { label: 'N/A', color: '#9ca3af' };
  return AQI_LEVELS.find((l) => aqi <= l.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1];
};

// ─── Rainfall severity (0-3) ─────────────────────────────────────────────────
const rainSeverity = (mm) => {
  if (mm >= 30) return 3; // red
  if (mm >= 15) return 2; // orange
  if (mm >= 7.5) return 1; // yellow
  return 0;
};

// ─── AQI severity (0-3) ──────────────────────────────────────────────────────
const aqiSeverity = (aqi) => {
  if (aqi == null) return 0;
  if (aqi > 150) return 3;
  if (aqi > 100) return 2;
  if (aqi > 50) return 1;
  return 0;
};

// ─── Marker class based on worst of rain or AQI ──────────────────────────────
const getMarkerClass = (muni) => {
  const sev = Math.max(rainSeverity(muni.rainfall_mm), aqiSeverity(muni.aqi));
  if (sev >= 3) return 'map-pin-icon-default-red';
  if (sev === 2) return 'map-pin-icon-default-orange';
  if (sev === 1) return 'map-pin-icon-default-yellow';
  return 'map-pin-icon-default';
};

// ─── Popup row helper ────────────────────────────────────────────────────────
const Row = ({ icon, label, value, unit = '' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
    <span style={{ fontSize: '14px' }}>{icon}</span>
    <span style={{ color: '#6b7280', fontSize: '12px', flex: 1 }}>{label}</span>
    <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>
      {value != null ? `${value}${unit}` : '—'}
    </span>
  </div>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
const Divider = () => (
  <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '8px 0' }} />
);

// ─── Severity Color Helper ───────────────────────────────────────────────────
const getSeverityIconClass = (severity) => {
  if (severity >= 3) return 'summary-data-icon-red';
  if (severity === 2) return 'summary-data-icon-orange';
  if (severity === 1) return 'summary-data-icon-yellow';
  return 'summary-data-icon'; // Default (blue)
};

// ─── Severity Background Helper ──────────────────────────────────────────────
const getSeverityBgClass = (severity) => {
  if (severity >= 3) return 'bg-red-50';
  if (severity === 2) return 'bg-orange-50';
  if (severity === 1) return 'bg-yellow-50';
  return 'bg-gray-100'; // Default
};

// ─── Air Quality Status → Background Color ────────────────────────────────────
const getAqiStatusBgClass = (status) => {
  if (!status) return 'bg-gray-100';
  const s = status.toLowerCase();
  if (s === 'good') return 'bg-green-50';
  if (s === 'fair') return 'bg-yellow-50';
  if (s.includes('sensitive')) return 'bg-orange-50';
  if (s === 'very unhealthy') return 'bg-red-50';
  if (s === 'acutely unhealthy') return 'bg-purple-50';
  if (s === 'emergency') return 'bg-rose-950/10'; // maroon tint
  return 'bg-gray-100';
};

export default function FloodWatchMap() {
  const [weatherData, setWeatherData] = useState([]);
  const [selectedMuni, setSelectedMuni] = useState(null);

  useEffect(() => {
    // ── 1. Initial fetch from the combined view ──────────────────────────────
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('live_municipality_weather')
        .select('*');

      if (error) {
        // THIS WILL PRINT THE EXACT REASON IT CRASHED!
        console.error("🚨 EXACT SUPABASE ERROR 🚨:", error.message, error.details, error.hint);
      }

      if (!error && data) setWeatherData(data);
    };

    fetchData();

    // ── 2. Realtime: weather_telemetry inserts ───────────────────────────────
    const weatherChannel = supabase
      .channel('live-weather')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'weather_telemetry' },
        (payload) => {
          setWeatherData((cur) =>
            cur.map((muni) =>
              muni.municipality_id === payload.new.municipality_id
                ? {
                  ...muni,
                  temperature: payload.new.temperature,
                  rainfall_mm: payload.new.rainfall_mm,
                  wind_speed: payload.new.wind_speed,
                  weather_condition: payload.new.weather_condition,
                  fetched_at: payload.new.fetched_at,
                }
                : muni
            )
          );
        }
      )
      .subscribe();

    // ── 3. Realtime: air_quality inserts ─────────────────────────────────────
    const airChannel = supabase
      .channel('live-air-quality')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'air_quality' },
        (payload) => {
          setWeatherData((cur) =>
            cur.map((muni) =>
              muni.municipality_id === payload.new.municipality_id
                ? {
                  ...muni,
                  aqi: payload.new.aqi,
                  pm2_5: payload.new.pm2_5,
                  pm10: payload.new.pm10,
                  air_quality_status: payload.new.status,
                  air_recorded_at: payload.new.recorded_at,
                }
                : muni
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(weatherChannel);
      supabase.removeChannel(airChannel);
    };
  }, []);

  // Restrict panning to Cebu bounds
  const cebuBounds = [
    [123.00, 9.20],
    [124.50, 11.50],
  ];

  // Only render municipalities that have valid coordinates
  const validMarkers = weatherData.filter(
    (m) =>
      m.latitude != null && m.longitude != null &&
      isFinite(m.latitude) && isFinite(m.longitude)
  );

  if (weatherData.length > 0 && validMarkers.length === 0) {
    console.warn(
      '[FloodWatchMap] All municipalities were filtered out — latitude/longitude are null in the view. ' +
      'Run the updated live_municipality_weather_view.sql in Supabase.',
      weatherData[0] // log first row so you can inspect the column names
    );
  }

  const aqiMeta = selectedMuni ? getAqiMeta(selectedMuni.aqi) : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden' }}>

      {/* ── Map ── */}
      <Map
        initialViewState={{ latitude: 10.3157, longitude: 123.8854, zoom: 8.5 }}
        maxBounds={cebuBounds}
        mapStyle="mapbox://styles/apex-yoshi/cmp0s3wq700bg01sx2y9i69pw"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* ── Markers ── */}
        {validMarkers.map((muni) => (
          <Marker
            key={muni.municipality_id}
            longitude={muni.longitude}
            latitude={muni.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedMuni(muni);
            }}
          >
            <div className={getMarkerClass(muni)} />
          </Marker>
        ))}
      </Map>

      {/* ── Floating detail panel (left side) ── */}
      {selectedMuni && (
        <div
          key={selectedMuni.municipality_id}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            bottom: '12px',
            width: '260px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            animation: 'panelSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <style>{`
            @keyframes panelSlideIn {
              from { opacity: 0; transform: translateX(-18px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          <GeneralCard className="flex flex-col gap-0 p-0 h-full overflow-hidden">

            {/* ── Panel header ── */}
            <div className='flex items-center justify-between'>
              <div>
                <CardHeader className="text-gray-500 capitalize text-base">
                  {selectedMuni.municipality_name}
                </CardHeader>
              </div>
              <button
                onClick={() => setSelectedMuni(null)}
                className='modal-icon-button'
                aria-label="Close panel"
              >
                <X className='size-5' />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '12px 14px 14px' }}>
              <div className='grid gap-3'>
                {/* Weather section */}
                <CardSubHeader>
                  Weather
                </CardSubHeader>
                {selectedMuni.weather_condition && (
                  <div className={`flex items-center p-2 rounded-lg gap-2 text-sm ${getSeverityBgClass(rainSeverity(selectedMuni.rainfall_mm))}`}>
                    <span className={getSeverityIconClass(rainSeverity(selectedMuni.rainfall_mm))}>
                      <Cloud className='size-5' />
                    </span>
                    <span className="text-gray-700 font-medium">{selectedMuni.weather_condition}</span>
                  </div>
                )}
                <Row icon={<Thermometer className='text-gray-600 size-5' />} label="Temperature" value={selectedMuni.temperature} unit=" °C" />
                <Row icon={<CloudRain className='text-gray-600 size-5' />} label="Rainfall" value={selectedMuni.rainfall_mm} unit=" mm/h" />
                <Row icon={<Wind className='text-gray-600 size-5' />} label="Wind Speed" value={selectedMuni.wind_speed} unit=" m/s" />

              </div>
              <Divider />

              {/* Air Quality section */}
              <div className='grid gap-3'>
                <CardSubHeader>
                  Air Quality
                </CardSubHeader>

                {selectedMuni.aqi != null ? (
                  <>
                    {/* AQI badge */}
                    {selectedMuni.air_quality_status && (
                      <div className={`p-2 flex items-center gap-2 rounded-lg text-sm ${getAqiStatusBgClass(selectedMuni.air_quality_status)}`}>
                        <span className={getSeverityIconClass(aqiSeverity(selectedMuni.aqi))}>
                          <Leaf className='size-5' />
                        </span>
                        <span className="text-gray-700 font-medium">{selectedMuni.air_quality_status}</span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: aqiMeta.color + '14',
                      border: `1px solid ${aqiMeta.color}33`,
                      marginBottom: '8px',
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>AQI</span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: aqiMeta.color,
                      }}>
                        {selectedMuni.aqi} — {aqiMeta.label}
                      </span>
                    </div>
                    <Row icon={<Microscope className='size-5 text-gray-600' />} label="PM2.5" value={selectedMuni.pm2_5} unit=" µg/m³" />
                    <Row icon={<Waves className='size-5 text-gray-600' />} label="PM10" value={selectedMuni.pm10} unit=" µg/m³" />


                  </>
                ) : (
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 6px', fontStyle: 'italic' }}>No air quality data available</p>
                )}
              </div>

              <Divider />
              {/* Timestamps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {selectedMuni.fetched_at && (
                  <p className='text-xs text-gray-500'>
                    Update At: {new Date(selectedMuni.fetched_at).toLocaleTimeString()}
                  </p>
                )}
              </div>

            </div>
          </GeneralCard>
        </div>
      )}
    </div>
  );
}