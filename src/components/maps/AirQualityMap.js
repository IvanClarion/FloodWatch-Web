"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import { X, Leaf, Microscope, Waves, Wind, Info, Clock } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/supabase/util/supabase';
import GeneralCard from '../cards/GeneralCard';
import CardHeader from '../cards/CardHeader';
import CardSubHeader from '../cards/CardSubHeader';
import CardBasedText from '../cards/CardBasedText';

// ─── Layer Style Definitions for GPU Canvas Rendering ──────────────────────
const pinCircleLayer = {
  id: 'air-quality-pins',
  type: 'circle',
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      7, 5,
      10, 8,
      14, 12
    ],
    'circle-color': [
      'match',
      ['get', 'aqiCategory'],
      1, '#22c55e', // Good
      2, '#eab308', // Fair
      3, '#f97316', // Unhealthy for sensitive
      4, '#ef4444', // Very unhealthy
      5, '#a855f7', // Acutely unhealthy
      6, '#800000', // Emergency
      '#3b82f6'     // No Data / Default
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.95,
  }
};

const pinLabelLayer = {
  id: 'air-quality-labels',
  type: 'symbol',
  layout: {
    'text-field': ['get', 'municipality_name'],
    'text-size': [
      'interpolate',
      ['linear'],
      ['zoom'],
      8, 10,
      11, 12,
      14, 14
    ],
    'text-offset': [0, 1.2],
    'text-anchor': 'top',
    'text-optional': true,
  },
  paint: {
    'text-color': '#1f2937',
    'text-halo-color': '#ffffff',
    'text-halo-width': 1.5,
  }
};

// ─── AQI Thresholds & Helpers ──────────────────────────────────────────────
const AQI_LEGEND = [
  { range: '0 - 25', label: 'Good', color: '#22c55e', pinClass: 'map-pin-icon-default-green', bg: 'bg-green-50', iconBg: 'summary-data-icon-green' },
  { range: '25.1 - 35', label: 'Fair', color: '#eab308', pinClass: 'map-pin-icon-default-yellow', bg: 'bg-yellow-50', iconBg: 'summary-data-icon-yellow' },
  { range: '35.1 - 45', label: 'Unhealthy for sensitive groups', color: '#f97316', pinClass: 'map-pin-icon-default-orange', bg: 'bg-orange-50', iconBg: 'summary-data-icon-orange' },
  { range: '45.1 - 55', label: 'Very unhealthy', color: '#ef4444', pinClass: 'map-pin-icon-default-red', bg: 'bg-red-50', iconBg: 'summary-data-icon-red' },
  { range: '55.1 - 90', label: 'Acutely unhealthy', color: '#a855f7', pinClass: 'map-pin-icon-default-purple', bg: 'bg-purple-50', iconBg: 'summary-data-icon-purple' },
  { range: '91+', label: 'Emergency', color: '#800000', pinClass: 'map-pin-icon-default-maroon', bg: 'bg-rose-950/10', iconBg: 'summary-data-icon-red' },
];

const getAqiCategory = (aqi) => {
  if (aqi == null || isNaN(aqi)) return 0;
  if (aqi <= 25) return 1;
  if (aqi <= 35) return 2;
  if (aqi <= 45) return 3;
  if (aqi <= 55) return 4;
  if (aqi <= 90) return 5;
  return 6;
};

const getAqiDetails = (aqi) => {
  if (aqi == null || isNaN(aqi)) {
    return { label: 'No Data', pinClass: 'map-pin-icon-default', color: '#3b82f6', bg: 'bg-blue-50', iconBg: 'summary-data-icon' };
  }
  if (aqi <= 25) return AQI_LEGEND[0];
  if (aqi <= 35) return AQI_LEGEND[1];
  if (aqi <= 45) return AQI_LEGEND[2];
  if (aqi <= 55) return AQI_LEGEND[3];
  if (aqi <= 90) return AQI_LEGEND[4];
  return AQI_LEGEND[5];
};

// ─── Popup Row helper ────────────────────────────────────────────────────────
const Row = ({ icon, label, value, unit = '' }) => (
  <div className="flex items-center gap-2.5 my-1.5 py-1 border-b border-gray-100 last:border-0">
    <span className="text-gray-500">{icon}</span>
    <span className="text-gray-500 text-xs font-semibold flex-1">{label}</span>
    <span className="font-bold text-sm text-gray-800">
      {value != null && value !== '' ? `${value}${unit}` : '—'}
    </span>
  </div>
);

export default function AirQualityMap() {
  const [airData, setAirData] = useState([]);
  const [selectedMuni, setSelectedMuni] = useState(null);
  const [cursor, setCursor] = useState('auto');

  useEffect(() => {
    // Fetch directly from main tables: municipality_or_city, air_quality, weather_telemetry
    const fetchData = async () => {
      try {
        const [munisRes, airRes, weatherRes] = await Promise.all([
          supabase.from('municipality_or_city').select('*'),
          supabase.from('air_quality').select('*').order('recorded_at', { ascending: false }),
          supabase.from('weather_telemetry').select('*').order('fetched_at', { ascending: false })
        ]);

        const munis = munisRes.data || [];
        const airRecords = airRes.data || [];
        const weatherRecords = weatherRes.data || [];

        const mergedData = munis.map((muni) => {
          const id = muni.municipality_id || muni.id;
          const latestAir = airRecords.find((a) => a.municipality_id === id) || {};
          const latestWeather = weatherRecords.find((w) => w.municipality_id === id) || {};

          const latVal = muni.center_latitude ?? muni.latitude;
          const lngVal = muni.center_longitude ?? muni.longitude;

          const lat = parseFloat(latVal);
          const lng = parseFloat(lngVal);

          return {
            ...muni,
            municipality_id: id,
            latitude: !isNaN(lat) && lat !== 0 ? lat : null,
            longitude: !isNaN(lng) && lng !== 0 ? lng : null,
            municipality_name: muni.name || muni.municipality_name || "Unknown Municipality",
            
            // Air quality fields from air_quality
            aqi: latestAir.aqi != null ? Number(latestAir.aqi) : null,
            pm2_5: latestAir.pm2_5 != null ? Number(latestAir.pm2_5) : null,
            pm10: latestAir.pm10 != null ? Number(latestAir.pm10) : null,
            air_quality_status: latestAir.status ?? null,
            air_recorded_at: latestAir.recorded_at ?? null,

            // Weather telemetry fields from weather_telemetry
            temperature: latestWeather.temperature ?? null,
            rainfall_mm: latestWeather.rainfall_mm ?? null,
            wind_speed: latestWeather.wind_speed ?? null,
            weather_condition: latestWeather.weather_condition ?? null,
            fetched_at: latestWeather.fetched_at ?? null,
          };
        });

        setAirData(mergedData);

        // Keep selected municipality popup details updated in real-time
        setSelectedMuni((prev) => {
          if (!prev) return null;
          const updated = mergedData.find((m) => String(m.municipality_id) === String(prev.municipality_id));
          return updated || prev;
        });
      } catch (err) {
        console.error("Error fetching AirQualityMap data:", err);
      }
    };

    fetchData();

    // Realtime: Listen to ALL events (INSERT, UPDATE, DELETE) across telemetry tables
    const channelId = `realtime-air-quality-map-${Date.now()}`;
    const realtimeChannel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'air_quality' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weather_telemetry' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'municipality_or_city' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // 30-second heartbeat auto-sync fallback
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // ── Step 1: Memoized GeoJSON FeatureCollection ─────────────────────────────
  const geojsonData = useMemo(() => {
    const features = airData
      .filter(
        (m) =>
          m.latitude != null &&
          m.longitude != null &&
          isFinite(m.latitude) &&
          isFinite(m.longitude)
      )
      .map((muni) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [muni.longitude, muni.latitude],
        },
        properties: {
          ...muni,
          aqiCategory: getAqiCategory(muni.aqi),
        },
      }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [airData]);

  // ── Step 5: Handle Map Canvas Click ───────────────────────────────────────
  const handleMapClick = useCallback((event) => {
    const feature = event.features && event.features[0];
    if (feature) {
      const muniId = feature.properties?.municipality_id;
      const matchedMuni = airData.find(
        (m) => String(m.municipality_id) === String(muniId)
      ) || feature.properties;

      setSelectedMuni(matchedMuni);
    }
  }, [airData]);

  const handleMouseEnter = useCallback(() => setCursor('pointer'), []);
  const handleMouseLeave = useCallback(() => setCursor('auto'), []);

  const activeDetails = selectedMuni ? getAqiDetails(selectedMuni.aqi) : null;

  return (
    <div className="relative w-full h-[85vh] xl:h-screen min-h-[600px] rounded-2xl overflow-hidden shadow-sm border border-gray-200/80">

      {/* ── Mapbox Canvas with WebGL GPU Rendering ── */}
      <Map
        initialViewState={{ latitude: 10.3157, longitude: 123.8854, zoom: 8.5 }}
        mapStyle="mapbox://styles/apex-yoshi/cmp0s3wq700bg01sx2y9i69pw"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['air-quality-pins']}
        onClick={handleMapClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        cursor={cursor}
      >
        <NavigationControl position="top-right" />

        {/* ── Step 3 & 4: Single GeoJSON Source + GPU Circle & Symbol Layers ── */}
        <Source id="air-quality-source" type="geojson" data={geojsonData} cluster={false}>
          <Layer {...pinCircleLayer} />
          <Layer {...pinLabelLayer} />
        </Source>
      </Map>

      {/* ── Floating Legend Card (Bottom-Right) ── */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:block">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 max-w-[260px] transition-all">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
            <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="size-4 text-primary" /> AQI Index Legend
            </span>
          </div>
          <div className="grid gap-2">
            {AQI_LEGEND.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span 
                    className="size-3 rounded-full shrink-0 shadow-xs" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-gray-700 truncate max-w-[140px]" title={item.label}>
                    {item.label}
                  </span>
                </div>
                <span className="text-gray-400 font-mono text-[11px] shrink-0">
                  {item.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating Detail Panel (Top-Left) ── */}
      {selectedMuni && (
        <div
          className="absolute top-4 left-4 z-20 w-[280px] md:w-[320px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all animate-slide-left"
        >
          <GeneralCard className="p-0 border-none shadow-none">
            
            {/* Panel Header */}
            <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <div>
                <CardHeader className="text-gray-800 capitalize text-lg font-extrabold">
                  {selectedMuni.municipality_name}
                </CardHeader>
                <CardBasedText className="text-gray-400 text-xs">
                  Municipality Air Monitor
                </CardBasedText>
              </div>
              <button
                onClick={() => setSelectedMuni(null)}
                className="modal-icon-button bg-gray-200/60 hover:bg-gray-200"
                aria-label="Close panel"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="p-4 grid gap-4 max-h-[75vh] overflow-y-auto">
              
              {/* AQI Primary Status Box */}
              <div className={`p-4 rounded-xl flex flex-col gap-2 border ${activeDetails.bg} border-gray-200/50`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={activeDetails.iconBg}>
                      <Leaf className="size-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Air Quality
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-3xl font-extrabold" style={{ color: activeDetails.color }}>
                    {selectedMuni.aqi != null ? selectedMuni.aqi : '—'} 
                    <span className="text-xs font-semibold text-gray-500 ml-1">AQI</span>
                  </span>
                  <span className="text-sm font-bold text-gray-800 text-right">
                    {activeDetails.label}
                  </span>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div>
                <CardSubHeader className="text-gray-700 text-sm font-bold mb-2 flex items-center gap-1.5">
                  <Wind className="size-4 text-primary" /> Pollutant Density
                </CardSubHeader>
                <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                  <Row 
                    icon={<Microscope className="size-4 text-primary" />} 
                    label="Particulate Matter (PM2.5)" 
                    value={selectedMuni.pm2_5} 
                    unit=" µg/m³" 
                  />
                  <Row 
                    icon={<Waves className="size-4 text-primary" />} 
                    label="Coarse Particles (PM10)" 
                    value={selectedMuni.pm10} 
                    unit=" µg/m³" 
                  />
                </div>
              </div>

              {/* Timestamp Indicator */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-gray-400 text-[11px] font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" /> Recorded At
                </span>
                <span>
                  {selectedMuni.air_recorded_at 
                    ? new Date(selectedMuni.air_recorded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Recent'}
                </span>
              </div>

            </div>
          </GeneralCard>
        </div>
      )}
    </div>
  );
}
