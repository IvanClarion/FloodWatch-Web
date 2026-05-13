-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: live_municipality_weather
-- Joins the latest weather telemetry + latest air quality per municipality.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW live_municipality_weather AS
WITH latest_weather AS (
  SELECT DISTINCT ON (municipality_id)
    municipality_id,
    temperature,
    rainfall_mm,
    wind_speed,
    weather_condition,
    fetched_at
  FROM weather_telemetry
  ORDER BY municipality_id, fetched_at DESC
),
latest_air AS (
  SELECT DISTINCT ON (municipality_id)
    municipality_id,
    aqi,
    pm2_5,
    pm10,
    status        AS air_quality_status,
    recorded_at   AS air_recorded_at
  FROM air_quality
  ORDER BY municipality_id, recorded_at DESC
)
SELECT
  m.id                         AS municipality_id,
  m.name,

  -- Spatial (pre-computed columns on municipality_or_city)
  m.latitude,
  m.longitude,

  -- Weather
  w.temperature,
  w.rainfall_mm,
  w.wind_speed,
  w.weather_condition,
  w.fetched_at,

  -- Air Quality
  a.aqi,
  a.pm2_5,
  a.pm10,
  a.air_quality_status,
  a.air_recorded_at

FROM municipality_or_city m
LEFT JOIN latest_weather w ON w.municipality_id = m.id
LEFT JOIN latest_air     a ON a.municipality_id = m.id;
