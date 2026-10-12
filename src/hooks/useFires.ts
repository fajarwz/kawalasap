import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { FiresPayload } from '../lib/fires.ts';
import { queryKeys, STALE_MS } from '../lib/queryClient.ts';

async function fetchFires(): Promise<FiresPayload> {
  const response = await fetch('/api/fires?window=48h');
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

export function useFires() {
  return useQuery({
    queryKey: queryKeys.fires,
    queryFn: fetchFires,
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  });
}
