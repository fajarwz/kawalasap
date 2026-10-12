import { useQuery } from '@tanstack/react-query';
import { usAqiFromPm25 } from '../lib/aqi.ts';
import type { City, CityReading } from '../lib/cities.ts';
import { CITIES } from '../lib/cities.ts';
import { queryKeys } from '../lib/queryClient.ts';
import { regionOf } from '../lib/regions.ts';
import { formatPin, type PinPoint } from '../lib/viewState.ts';

const ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const HALF_HOUR = 30 * 60 * 1000;

interface OpenMeteoLocation {
  location_id?: number;
  current?: {
    time?: string;
    pm2_5?: number | null;
    pm10?: number | null;
    us_aqi?: number | null;
    european_aqi?: number | null;
  };
  hourly?: { time: string[]; pm2_5: (number | null)[] };
}

/**
 * One request for every point: the API accepts comma separated coordinate
 * lists, so a pinned place costs no extra call, and the answer is matched back
 * to the points by position.
 */
async function requestReadings(points: City[]): Promise<CityReading[]> {
  const params = new URLSearchParams({
    latitude: points.map((point) => point.lat).join(','),
    longitude: points.map((point) => point.lon).join(','),
    current: 'pm2_5,pm10,us_aqi,european_aqi',
    hourly: 'pm2_5',
    past_days: '7',
    forecast_days: '1',
    timezone: 'Asia/Jakarta',
  });
  const response = await fetch(`${ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo air quality answered with HTTP ${response.status}.`);
  }
  const payload = (await response.json()) as OpenMeteoLocation[] | OpenMeteoLocation;
  const locations = Array.isArray(payload) ? payload : [payload];
  return points.map((city, index) => {
    const location = locations[index];
    const pm25 = location?.current?.pm2_5 ?? null;
    return {
      city,
      pm25,
      pm10: location?.current?.pm10 ?? null,
      // Derived from PM2.5, not read from the response: see `usAqiFromPm25`.
      usAqi: usAqiFromPm25(pm25),
      europeanAqi: location?.current?.european_aqi ?? null,
      time: location?.current?.time ? `${location.current.time}:00+07:00` : null,
      series: {
        time: location?.hourly?.time ?? [],
        pm25: location?.hourly?.pm2_5 ?? [],
      },
    };
  });
}

export function useAirQuality() {
  return useQuery({
    queryKey: queryKeys.airQuality,
    queryFn: () => requestReadings(CITIES),
    staleTime: HALF_HOUR,
  });
}

/** The pinned point is not a city in the curated list, but it reads like one. */
export const PINNED_CITY_ID = 'pinned';

/**
 * The place the reader pinned, read on demand from the same model. It is cached
 * per place, so going back to a point you already read costs nothing.
 */
export function usePinnedAirQuality(point: PinPoint | null) {
  return useQuery({
    queryKey: queryKeys.pinnedAirQuality(point ? formatPin(point) : ''),
    enabled: point !== null,
    staleTime: HALF_HOUR,
    queryFn: async (): Promise<CityReading | null> => {
      if (!point) return null;
      const city: City = {
        id: PINNED_CITY_ID,
        name: point.name,
        area: point.area,
        region: regionOf(point.lat, point.lon),
        lat: point.lat,
        lon: point.lon,
      };
      const [reading] = await requestReadings([city]);
      return reading ?? null;
    },
  });
}
