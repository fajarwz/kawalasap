import { QueryClient } from '@tanstack/react-query';

/**
 * Cache policy, sized to keep the load on the free data sources tiny:
 * fresh for 15 minutes (matches the CDN cache on the hotspot proxy), kept for
 * a day so a reload or a return visit reads localStorage instead of the network.
 */
export const STALE_MS = 15 * 60 * 1000;
export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

export const queryKeys = {
  /**
   * One entry per window: the proxy answers with the detections, density cells
   * and counts for the window that was asked for, so a 7 day view cannot be
   * served from a 48 hour payload.
   */
  fires: (window: string) => ['fires', window] as const,
  airQuality: ['air-quality'] as const,
  /** Per place, so two pinned points never share a cache entry. */
  pinnedAirQuality: (key: string) => ['air-quality-pin', key] as const,
  geocode: (key: string) => ['geocode', key] as const,
  wind: ['wind-field'] as const,
  climate: ['region-climate'] as const,
  /** One entry for every configured feed, since they are read and filtered together. */
  news: ['news'] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_MS,
      gcTime: PERSIST_MAX_AGE,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});
