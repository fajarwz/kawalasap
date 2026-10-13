import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { FiresPayload } from '../lib/fires.ts';
import { WindowKey } from '../lib/fires.ts';
import { queryKeys, STALE_MS } from '../lib/queryClient.ts';

async function fetchFires(window: WindowKey): Promise<FiresPayload> {
  const response = await fetch(`/api/fires?window=${window}`);
  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { error?: string };
      detail = body.error ?? '';
    } catch {
      detail = '';
    }
    throw new Error(
      detail || `The hotspot service answered with HTTP ${response.status}.`,
    );
  }
  return (await response.json()) as FiresPayload;
}

/**
 * Ask for the window the reader has selected. The function returns the points,
 * the density cells and the filtered total for that window, so the map and the
 * number beside it describe the same set of detections.
 */
export function useFires(window: WindowKey) {
  return useQuery({
    queryKey: queryKeys.fires(window),
    queryFn: () => fetchFires(window),
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  });
}
