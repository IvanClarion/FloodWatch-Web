"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import { X, Leaf, Microscope, Waves, Wind, Info, Clock, Filter, Maximize2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/supabase/util/supabase';
import GeneralCard from '../cards/GeneralCard';
import CardHeader from '../cards/CardHeader';
import CardSubHeader from '../cards/CardSubHeader';
import CardBasedText from '../cards/CardBasedText';
import SearchInput from '@/components/forms/SearchInput';
import MapFilterDropdown from './MapFilterDropdown';

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

export default function AirQualityMap({ isFullscreen = false }) {
  const [airData, setAirData] = useState([]);
  const [selectedMuni, setSelectedMuni] = useState(null);
  const [cursor, setCursor] = useState('auto');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

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
            rainfall_category: latestWeather.rainfall_category ?? null,
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

    // Realtime: Listen to ALL events across telemetry tables
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

  // Filter dataset based on SearchInput and category dropdown
  const filteredAirData = useMemo(() => {
    return airData.filter((item) => {
      const matchSearch = searchQuery.trim() === '' || 
        item.municipality_name.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (!matchSearch) return false;

      if (filterCategory === 'ALL') return true;
      const cat = getAqiCategory(item.aqi);
      return String(cat) === filterCategory;
    });
  }, [airData, searchQuery, filterCategory]);

  // Memoized GeoJSON FeatureCollection
  const geojsonData = useMemo(() => {
    const features = filteredAirData
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
  }, [filteredAirData]);

  // Handle Map Canvas Click
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

  // AQI Dropdown Options
  const aqiFilterOptions = useMemo(() => [
    { value: 'ALL', label: 'All Categories', badge: `${airData.length}`, color: '#3b82f6' },
    { value: '1', label: 'Good', badge: '0 – 25', color: '#22c55e' },
    { value: '2', label: 'Fair', badge: '25.1 – 35', color: '#eab308' },
    { value: '3', label: 'Unhealthy for Sensitive', badge: '35.1 – 45', color: '#f97316' },
    { value: '4', label: 'Very Unhealthy', badge: '45.1 – 55', color: '#ef4444' },
    { value: '5', label: 'Acutely Unhealthy', badge: '55.1 – 90', color: '#a855f7' },
    { value: '6', label: 'Emergency', badge: '91+', color: '#800000' },
  ], [airData.length]);

  return (
    <div className={`relative w-full ${isFullscreen ? 'h-screen rounded-none border-0 shadow-none' : 'h-[85vh] xl:h-screen min-h-[600px] rounded-2xl border border-gray-200/80 shadow-sm'} overflow-hidden`}>

      {/* ── Top Bar Overlay: Standalone SearchInput & Custom Dropdown ── */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2.5 pointer-events-auto">
        {/* Standalone SearchInput */}
        <SearchInput
          placeholder="Search LGU name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-48 sm:w-60 bg-white/95 backdrop-blur-md shadow-md border border-gray-200/80 rounded-xl"
        />

        {/* Custom MapFilterDropdown */}
        <MapFilterDropdown
          options={aqiFilterOptions}
          value={filterCategory}
          onChange={setFilterCategory}
          placeholder="Filter Category"
        />

        {/* Maximize Button to open map-only in a new tab */}
        {!isFullscreen && (
          <button
            type="button"
            onClick={() => window.open('/fullscreen-map?view=air', '_blank')}
            className="flex items-center justify-center bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md hover:shadow-lg hover:border-gray-300 rounded-xl p-2.5 text-gray-700 hover:text-primary transition-all cursor-pointer select-none"
            title="Open map only in new tab"
            aria-label="Maximize map in new tab"
          >
            <Maximize2 className="size-4" />
          </button>
        )}
      </div>

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

      {/* ── Floating Detail Panel (Top-Left under search) ── */}
      {selectedMuni && (
        <div
          className="absolute top-18 left-4 z-20 w-[280px] md:w-[320px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all animate-slide-left"
        >
          <GeneralCard className="p-0 border-none shadow-none">
            
            {/* Header with Close Button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <CardHeader className="text-sm font-bold text-gray-900 capitalize">
                  {selectedMuni.municipality_name}
                </CardHeader>
                <CardBasedText className="text-[11px] text-gray-400 font-medium">
                  Air Quality & Environmental Status
                </CardBasedText>
              </div>
              <button
                className="modal-icon-button hover:bg-gray-200"
                onClick={() => setSelectedMuni(null)}
                aria-label="Close"
              >
                <X className="size-4 text-gray-500" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 grid gap-4">
              
              {/* Primary AQI Alert Card */}
              {activeDetails && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${activeDetails.bg} border-gray-100`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-xs">
                      <Leaf className="size-5" style={{ color: activeDetails.color }} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Current Air Quality</span>
                      <h4 className="text-base font-extrabold text-gray-800 leading-tight">
                        {activeDetails.label}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black" style={{ color: activeDetails.color }}>
                      {selectedMuni.aqi != null ? selectedMuni.aqi : '—'}
                    </span>
                    <span className="text-[10px] block font-bold text-gray-400">AQI</span>
                  </div>
                </div>
              )}

              {/* Particulate Matter Readings */}
              <div className="grid gap-1">
                <CardSubHeader className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">
                  Pollutant Metrics
                </CardSubHeader>
                <Row icon={<Microscope className="size-4 text-indigo-500" />} label="PM2.5 (Fine particles)" value={selectedMuni.pm2_5} unit=" µg/m³" />
                <Row icon={<Waves className="size-4 text-sky-500" />} label="PM10 (Coarse particles)" value={selectedMuni.pm10} unit=" µg/m³" />
                <Row icon={<Wind className="size-4 text-teal-500" />} label="Wind Speed" value={selectedMuni.wind_speed} unit=" m/s" />
              </div>

              {/* Timestamp */}
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" /> Fetched
                </span>
                <span className="font-semibold text-gray-600">
                  {selectedMuni.air_recorded_at
                    ? new Date(selectedMuni.air_recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : selectedMuni.fetched_at
                    ? new Date(selectedMuni.fetched_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : "Realtime"}
                </span>
              </div>
            </div>
          </GeneralCard>
        </div>
      )}
    </div>
  );
}
