"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import { X, Thermometer, CloudRain, Wind, Cloud, Microscope, Waves, Leaf, Sun, Droplets, Filter, Maximize2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/supabase/util/supabase';
import GeneralCard from '../cards/GeneralCard';
import CardHeader from '../cards/CardHeader';
import CardSubHeader from '../cards/CardSubHeader';
import MapToggleSwitch from './MapToggleSwitch';
import WeatherMap from './WeatherMap';
import SearchInput from '@/components/forms/SearchInput';
import MapFilterDropdown from './MapFilterDropdown';

// ─── Layer Style Definitions for GPU Canvas Rendering ──────────────────────
const pinCircleLayer = {
  id: 'municipality-pins',
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
      ['get', 'severity'],
      3, '#ef4444', // red
      2, '#f97316', // orange
      1, '#eab308', // yellow
      '#0035A9'     // default primary blue
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.95,
  }
};

const pinLabelLayer = {
  id: 'municipality-labels',
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

// ─── Rainfall category helper (PAGASA Thresholds) ───────────────────────────
const getRainfallCategory = (mm) => {
  if (mm == null || mm <= 0) return 'No Rain';
  if (mm < 2.5) return 'Light Rain';
  if (mm < 7.5) return 'Moderate Rain';
  if (mm < 15.0) return 'Heavy Rain';
  if (mm <= 30.0) return 'Intense Rain';
  return 'Torrential Rain';
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

export default function FloodWatchMap({ activeTab: externalTab, onTabChange: externalOnTabChange, isFullscreen = false }) {
  const [internalTab, setInternalTab] = useState('Risk Mapping');
  const activeTab = externalTab !== undefined ? externalTab : internalTab;
  const handleTabChange = externalOnTabChange || setInternalTab;

  const [weatherData, setWeatherData] = useState([]);
  const [selectedMuni, setSelectedMuni] = useState(null);
  const [cursor, setCursor] = useState('auto');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    // ── 1. Fetch directly from main tables (municipality_or_city, weather_telemetry, air_quality) ──
    const fetchData = async () => {
      try {
        const [munisRes, weatherRes, airRes] = await Promise.all([
          supabase.from('municipality_or_city').select('*'),
          supabase.from('weather_telemetry').select('*').order('fetched_at', { ascending: false }),
          supabase.from('air_quality').select('*').order('recorded_at', { ascending: false })
        ]);

        const munis = munisRes.data || [];
        const weatherRecords = weatherRes.data || [];
        const airRecords = airRes.data || [];

        const mergedData = munis.map((muni) => {
          const mId = muni.municipality_id;
          const latestWeather = weatherRecords.find((w) => w.municipality_id === mId) || {};
          const latestAir = airRecords.find((a) => a.municipality_id === mId) || {};

          const latVal = muni.center_latitude ?? muni.latitude;
          const lngVal = muni.center_longitude ?? muni.longitude;
          const lat = parseFloat(latVal);
          const lng = parseFloat(lngVal);

          return {
            ...muni,
            municipality_id: mId,
            municipality_name: muni.name || muni.municipality_name || "Unknown Municipality",
            latitude: !isNaN(lat) && lat !== 0 ? lat : null,
            longitude: !isNaN(lng) && lng !== 0 ? lng : null,

            // Weather telemetry from weather_telemetry
            temperature: latestWeather.temperature ?? null,
            humidity: latestWeather.humidity ?? null,
            heat_index: latestWeather.heat_index ?? null,
            heat_index_category: latestWeather.heat_index_category ?? null,
            rainfall_mm: latestWeather.rainfall_mm ?? null,
            rainfall_category: latestWeather.rainfall_category || (latestWeather.rainfall_mm != null ? getRainfallCategory(latestWeather.rainfall_mm) : null),
            wind_speed: latestWeather.wind_speed ?? null,
            weather_condition: latestWeather.weather_condition ?? null,
            fetched_at: latestWeather.fetched_at ?? null,

            // Air quality from air_quality
            aqi: latestAir.aqi != null ? Number(latestAir.aqi) : null,
            pm2_5: latestAir.pm2_5 != null ? Number(latestAir.pm2_5) : null,
            pm10: latestAir.pm10 != null ? Number(latestAir.pm10) : null,
            air_quality_status: latestAir.status ?? null,
            air_recorded_at: latestAir.recorded_at ?? null,
          };
        });

        setWeatherData(mergedData);

        // Keep selected municipality popup details updated in real-time
        setSelectedMuni((prev) => {
          if (!prev) return null;
          const updated = mergedData.find((m) => String(m.municipality_id) === String(prev.municipality_id));
          return updated || prev;
        });
      } catch (err) {
        console.error("Error fetching map telemetry data:", err);
      }
    };

    fetchData();

    // ── 2. Realtime: Subscribe to all changes on telemetry & municipalities ───
    const channelId = `live-map-telemetry-${Date.now()}`;
    const liveChannel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weather_telemetry' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'air_quality' },
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
      supabase.removeChannel(liveChannel);
    };
  }, []);

  // Restrict panning to Cebu bounds
  const cebuBounds = [
    [123.00, 9.20],
    [124.50, 11.50],
  ];

  // Filter dataset based on SearchInput and Risk level dropdown
  const filteredWeatherData = useMemo(() => {
    return weatherData.filter((item) => {
      const name = item.name || item.municipality_name || '';
      const matchSearch = searchQuery.trim() === '' || 
        name.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (!matchSearch) return false;

      if (filterCategory === 'ALL') return true;
      const rSev = rainSeverity(item.rainfall_mm);
      const aSev = aqiSeverity(item.aqi);
      const severity = Math.max(rSev, aSev);

      if (filterCategory === 'RED') return severity >= 3;
      if (filterCategory === 'ORANGE') return severity === 2;
      if (filterCategory === 'YELLOW') return severity === 1;
      if (filterCategory === 'BLUE') return severity === 0;

      return true;
    });
  }, [weatherData, searchQuery, filterCategory]);

  // ── Step 1: Memoized GeoJSON FeatureCollection ─────────────────────────────
  const geojsonData = useMemo(() => {
    const features = filteredWeatherData
      .filter(
        (m) =>
          m.latitude != null &&
          m.longitude != null &&
          isFinite(m.latitude) &&
          isFinite(m.longitude)
      )
      .map((muni) => {
        const rSev = rainSeverity(muni.rainfall_mm);
        const aSev = aqiSeverity(muni.aqi);
        const severity = Math.max(rSev, aSev);

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [muni.longitude, muni.latitude],
          },
          properties: {
            ...muni,
            severity,
          },
        };
      });

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [filteredWeatherData]);

  // Risk Level Dropdown Options
  const riskFilterOptions = useMemo(() => [
    { value: 'ALL', label: 'All Risk Levels', badge: `${weatherData.length}`, color: '#3b82f6' },
    { value: 'RED', label: 'Critical Risk', badge: 'High Alert', color: '#ef4444' },
    { value: 'ORANGE', label: 'Moderate Risk', badge: 'Alert', color: '#f97316' },
    { value: 'YELLOW', label: 'Minor Risk', badge: 'Warning', color: '#eab308' },
    { value: 'BLUE', label: 'Normal / Low Risk', badge: 'Normal', color: '#22c55e' },
  ], [weatherData.length]);

  // ── Step 5: Handle Map Feature Click ──────────────────────────────────────
  const handleMapClick = useCallback((event) => {
    const feature = event.features && event.features[0];
    if (feature) {
      const muniId = feature.properties?.municipality_id;
      const matchedMuni = weatherData.find(
        (m) => String(m.municipality_id) === String(muniId)
      ) || feature.properties;

      setSelectedMuni(matchedMuni);
    }
  }, [weatherData]);

  const handleMouseEnter = useCallback(() => setCursor('pointer'), []);
  const handleMouseLeave = useCallback(() => setCursor('auto'), []);

  const aqiMeta = selectedMuni ? getAqiMeta(selectedMuni.aqi) : null;

  // Immediately display Weather Telemetry map when the tab toggle switch is flipped
  if (activeTab === 'Weather Telemetry') {
    return <WeatherMap activeTab={activeTab} onTabChange={handleTabChange} />;
  }

  return (
    <div className={`relative w-full ${isFullscreen ? 'h-screen rounded-none border-0 shadow-none' : 'h-screen min-h-[600px] rounded-2xl shadow-sm'} overflow-hidden`}>
      {/* ── Floating Controls Overlay: Toggle Switch + Standalone SearchInput & Custom Dropdown ── */}
      <div className={`absolute top-4 z-50 flex flex-wrap items-center gap-2.5 pointer-events-auto transition-all duration-300 ${selectedMuni ? 'left-4 md:left-[280px]' : 'left-4'}`}>
        <MapToggleSwitch activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Standalone SearchInput */}
        <SearchInput
          placeholder="Search LGU name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-44 sm:w-56 bg-white/95 backdrop-blur-md shadow-md border border-gray-200/80 rounded-xl"
        />

        {/* Custom MapFilterDropdown */}
        <MapFilterDropdown
          options={riskFilterOptions}
          value={filterCategory}
          onChange={setFilterCategory}
          placeholder="Risk Level"
        />

        {/* Maximize Button to open map-only in a new tab */}
        {!isFullscreen && (
          <button
            type="button"
            onClick={() => window.open('/fullscreen-map?view=risk', '_blank')}
            className="flex items-center justify-center bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md hover:shadow-lg hover:border-gray-300 rounded-xl p-2.5 text-gray-700 hover:text-primary transition-all cursor-pointer select-none"
            title="Open map only in new tab"
            aria-label="Maximize map in new tab"
          >
            <Maximize2 className="size-4" />
          </button>
        )}
      </div>

      {/* ── Map with WebGL Layer Rendering ── */}
      <Map
        initialViewState={{ latitude: 10.3157, longitude: 123.8854, zoom: 8.5 }}
        maxBounds={cebuBounds}
        mapStyle="mapbox://styles/apex-yoshi/cmp0s3wq700bg01sx2y9i69pw"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        interactiveLayerIds={['municipality-pins']}
        onClick={handleMapClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        cursor={cursor}
      >
        <NavigationControl position="top-right" />

        {/* ── Step 3 & 4: Single GeoJSON Source + GPU Circle & Symbol Layers ── */}
        <Source id="municipalities-source" type="geojson" data={geojsonData} cluster={false}>
          <Layer {...pinCircleLayer} />
          <Layer {...pinLabelLayer} />
        </Source>
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

                {/* Weather condition badge */}
                {selectedMuni.weather_condition && (
                  <div className={`flex items-center p-2 rounded-lg gap-2 text-sm ${getSeverityBgClass(rainSeverity(selectedMuni.rainfall_mm))}`}>
                    <span className={getSeverityIconClass(rainSeverity(selectedMuni.rainfall_mm))}>
                      <Cloud className='size-5' />
                    </span>
                    <span className="text-gray-700 font-medium">{selectedMuni.weather_condition}</span>
                  </div>
                )}

                {/* Rainfall Category Status Badge */}
                {selectedMuni.rainfall_category && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    background: (rainSeverity(selectedMuni.rainfall_mm) >= 3 ? '#ef4444' :
                                 rainSeverity(selectedMuni.rainfall_mm) === 2 ? '#f97316' :
                                 rainSeverity(selectedMuni.rainfall_mm) === 1 ? '#eab308' :
                                 '#3b82f6') + '14',
                    border: `1px solid ${
                      rainSeverity(selectedMuni.rainfall_mm) >= 3 ? '#ef4444' :
                      rainSeverity(selectedMuni.rainfall_mm) === 2 ? '#f97316' :
                      rainSeverity(selectedMuni.rainfall_mm) === 1 ? '#eab308' :
                      '#3b82f6'
                    }33`,
                    marginBottom: '2px',
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Category</span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: rainSeverity(selectedMuni.rainfall_mm) >= 3 ? '#dc2626' :
                             rainSeverity(selectedMuni.rainfall_mm) === 2 ? '#ea580c' :
                             rainSeverity(selectedMuni.rainfall_mm) === 1 ? '#ca8a04' :
                             '#2563eb',
                    }}>
                      {selectedMuni.rainfall_category}
                    </span>
                  </div>
                )}

                <Row icon={<Thermometer className='text-gray-600 size-5' />} label="Temperature" value={selectedMuni.temperature} unit=" °C" />
                {selectedMuni.heat_index != null && (
                  <Row 
                    icon={<Sun className='text-amber-500 size-5' />} 
                    label="Heat Index" 
                    value={`${selectedMuni.heat_index} °C (${selectedMuni.heat_index_category || 'Normal'})`} 
                  />
                )}
                {selectedMuni.humidity != null && (
                  <Row icon={<Droplets className='text-blue-500 size-5' />} label="Humidity" value={selectedMuni.humidity} unit=" %" />
                )}
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