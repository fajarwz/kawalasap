import type { HotspotFilter } from './fires.ts';
import { WindowKey } from './fires.ts';
import { DEFAULT_SEARCH } from './viewState.ts';
import type { DashboardSearch } from './viewState.ts';

export const DRAW_LIMIT = 25000;

/** The server sends one window of detections; everything else is filtered here. */
export function toHotspotFilter(search: DashboardSearch): HotspotFilter {
  return {
    window: search.window,
    confidence: search.confidence,
    minFrp: search.minFrp,
    region: search.region,
    includeNeighbour: search.region === 'all' || search.region === 'neighbour',
  };
}

export function isDefaultSearch(search: DashboardSearch): boolean {
  return (
    search.window === WindowKey.H24 &&
    search.region === DEFAULT_SEARCH.region &&
    search.confidence === DEFAULT_SEARCH.confidence &&
    search.minFrp === DEFAULT_SEARCH.minFrp &&
    search.layer === DEFAULT_SEARCH.layer
  );
}
