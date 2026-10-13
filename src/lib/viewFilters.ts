import type { HotspotFilter } from './fires.ts';
import { WindowKey } from './fires.ts';
import { EXPLORE_DEFAULTS, RegionScope, type ExploreSearch } from './viewState.ts';

export const DRAW_LIMIT = 25000;

/**
 * The server sends one window of detections; everything else is filtered here.
 *
 * The search arrives from whichever page is asking, and a page that carries only
 * part of the map's filter (home, a region page) gets the map's defaults for the
 * rest rather than an undefined that would quietly drop every detection.
 */
export function toHotspotFilter(search: Partial<ExploreSearch>): HotspotFilter {
  const region = search.region ?? EXPLORE_DEFAULTS.region;
  return {
    window: search.window ?? EXPLORE_DEFAULTS.window,
    confidence: search.confidence ?? EXPLORE_DEFAULTS.confidence,
    minFrp: search.minFrp ?? EXPLORE_DEFAULTS.minFrp,
    region,
    includeNeighbour: region === RegionScope.All || region === RegionScope.Neighbour,
  };
}

export function isDefaultSearch(search: Partial<ExploreSearch>): boolean {
  return (
    (search.window ?? EXPLORE_DEFAULTS.window) === WindowKey.H24 &&
    (search.region ?? EXPLORE_DEFAULTS.region) === EXPLORE_DEFAULTS.region &&
    (search.confidence ?? EXPLORE_DEFAULTS.confidence) === EXPLORE_DEFAULTS.confidence &&
    (search.minFrp ?? EXPLORE_DEFAULTS.minFrp) === EXPLORE_DEFAULTS.minFrp &&
    (search.layer ?? EXPLORE_DEFAULTS.layer) === EXPLORE_DEFAULTS.layer
  );
}
