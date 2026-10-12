import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Lang } from '../lib/i18n.ts';
import { queryKeys } from '../lib/queryClient.ts';

const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
/** Place names do not change, so one lookup is cached for a day. */
const DAY = 24 * 60 * 60 * 1000;
const MIN_LENGTH = 3;
/**
 * Indonesia only. The dashboard is about Indonesian haze, so a search for
 * anywhere else is a wrong answer, not a bonus. The filter is asked for
 * server-side and checked again on the way in: a foreign place never reaches
 * the list even if the API changes its mind.
 */
const COUNTRY = 'ID';

/** A result the reader can pin. `area` is the province or country line. */
export interface PlaceMatch {
  key: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
}

interface GeoResult {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  admin1?: string;
  admin2?: string;
  country?: string;
  country_code?: string;
}

interface GeoPayload {
  results?: GeoResult[];
}

/**
 * Reading the payload is kept apart from requesting it, because a cached answer
 * never runs the query function. The filtering therefore has to happen on every
 * read, a read from localStorage included, or an answer stored before the rule
 * existed would be shown as though the rule had been applied to it.
 */
function toMatches(payload: GeoPayload | undefined): PlaceMatch[] {
  return (payload?.results ?? [])
    .filter(
      (result): result is GeoResult & { name: string; latitude: number; longitude: number } =>
        Boolean(result.name) &&
        typeof result.latitude === 'number' &&
        typeof result.longitude === 'number' &&
        result.country_code === COUNTRY,
    )
    .map((result, index) => ({
      key: String(result.id ?? `${result.name}-${index}`),
      name: result.name,
      area: [result.admin1, result.country].filter(Boolean).join(', '),
      lat: result.latitude,
      lon: result.longitude,
    }));
}

/**
 * Place search through Open-Meteo's keyless geocoding endpoint, the same family
 * as the air quality model we already read. Nothing is fetched until three
 * characters are typed, and the answer is cached per term, language and country
 * scope, so widening the scope later cannot serve an answer from the narrower
 * one.
 */
export function useGeocode(query: string, lang: Lang) {
  const term = query.trim();
  return useQuery({
    queryKey: queryKeys.geocode(`${COUNTRY}|${term.toLowerCase()}|${lang}`),
    enabled: term.length >= MIN_LENGTH,
    staleTime: DAY,
    placeholderData: keepPreviousData,
    select: toMatches,
    queryFn: async (): Promise<GeoPayload> => {
      const params = new URLSearchParams({
        name: term,
        count: '8',
        countryCode: COUNTRY,
        language: lang,
        format: 'json',
      });
      const response = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Geocoding answered with HTTP ${response.status}.`);
      }
      return (await response.json()) as GeoPayload;
    },
  });
}

export const MIN_QUERY_LENGTH = MIN_LENGTH;
