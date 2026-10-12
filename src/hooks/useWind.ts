import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient.ts';
import { REGIONS } from '../lib/regions.ts';
import { WIND_GRID, type ClimateReading, type WindPoint } from '../lib/wind.ts';

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoCurrent {
  time?: string;
  wind_speed_10m?: number | null;
  wind_direction_10m?: number | null;
  wind_speed_850hPa?: number | null;
  wind_direction_850hPa?: number | null;
  precipitation?: number | null;
}

interface OpenMeteoForecast {
  current?: OpenMeteoCurrent;
  daily?: { time: string[]; precipitation_sum: (number | null)[] };
}

function asArray(payload: OpenMeteoForecast[] | OpenMeteoForecast): OpenMeteoForecast[] {
  return Array.isArray(payload) ? payload : [payload];
}

async function fetchWindField(): Promise<WindPoint[]> {
  const params = new URLSearchParams({
    latitude: WIND_GRID.map(([lat]) => lat).join(','),
    longitude: WIND_GRID.map(([, lon]) => lon).join(','),
    current: 'wind_speed_10m,wind_direction_10m,wind_speed_850hPa,wind_direction_850hPa',
    wind_speed_unit: 'kmh',
    timezone: 'Asia/Jakarta',
  });
  const response = await fetch(`${FORECAST_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo wind answered with HTTP ${response.status}.`);
  }
  const locations = asArray((await response.json()) as OpenMeteoForecast[]);
  return WIND_GRID.map(([lat, lon], index) => {
    const current = locations[index]?.current ?? {};
    return {
      lat,
      lon,
      speed10: current.wind_speed_10m ?? 0,
      dir10: current.wind_direction_10m ?? 0,
      speed850: current.wind_speed_850hPa ?? null,
      dir850: current.wind_direction_850hPa ?? null,
    };
  });
}

async function fetchRegionClimate(): Promise<ClimateReading[]> {
  const params = new URLSearchParams({
    latitude: REGIONS.map((region) => region.centre[0]).join(','),
    longitude: REGIONS.map((region) => region.centre[1]).join(','),
    current: 'wind_speed_10m,wind_direction_10m,precipitation',
    daily: 'precipitation_sum',
    past_days: '7',
    forecast_days: '1',
    wind_speed_unit: 'kmh',
    timezone: 'Asia/Jakarta',
  });
  const response = await fetch(`${FORECAST_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo rain history answered with HTTP ${response.status}.`);
  }
  const locations = asArray((await response.json()) as OpenMeteoForecast[]);
  return REGIONS.map((region, index) => {
    const location = locations[index];
    const daily = location?.daily?.precipitation_sum ?? [];
    const total = daily.reduce<number | null>(
      (sum, value) => (value === null ? sum : (sum ?? 0) + value),
      null,
    );
    return {
      regionId: region.id,
      precip7d: total === null ? null : Math.round(total * 10) / 10,
      windKmh: location?.current?.wind_speed_10m ?? null,
      windFrom: location?.current?.wind_direction_10m ?? null,
      time: location?.current?.time ? `${location.current.time}:00+07:00` : new Date().toISOString(),
    };
  });
}

export function useWindField() {
  return useQuery({
    queryKey: queryKeys.wind,
    queryFn: fetchWindField,
    staleTime: 30 * 60 * 1000,
  });
}

export function useRegionClimate() {
  return useQuery({
    queryKey: queryKeys.climate,
    queryFn: fetchRegionClimate,
    staleTime: 60 * 60 * 1000,
  });
}
