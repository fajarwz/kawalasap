import { CITIES, CITY_BY_ID, type City } from './cities.ts';
import { NEIGHBOUR, REGIONS, regionById } from './regions.ts';
import { RegionScope } from './viewState.ts';

/** How many results each group may show before the list stops being a list. */
const LIMIT = 5;

export interface RegionOption {
  id: string;
  name: string;
}

export function cityById(id: string): City | undefined {
  return CITY_BY_ID.get(id);
}

/** The cities inside a region box. `all` means every city we cover. */
export function citiesInRegion(regionId: string): City[] {
  if (regionId === RegionScope.All) return CITIES;
  return CITIES.filter((city) => city.region === regionId);
}

/** Our own regions, matched locally so a single letter answers immediately. */
export function matchRegions(needle: string, neighbourLabel: string): RegionOption[] {
  const term = needle.trim().toLowerCase();
  if (!term) return [];
  const options: RegionOption[] = [
    ...REGIONS.map((region) => ({ id: region.id, name: region.name })),
    { id: NEIGHBOUR.id, name: neighbourLabel },
  ];
  return options.filter((option) => option.name.toLowerCase().includes(term)).slice(0, LIMIT);
}

/** Cities come from the curated list, so a match costs no request. */
export function matchCities(needle: string): City[] {
  const term = needle.trim().toLowerCase();
  if (!term) return [];
  return CITIES.filter((city) => city.name.toLowerCase().includes(term)).slice(0, LIMIT);
}

export function regionName(regionId: string): string {
  if (regionId === NEIGHBOUR.id) return NEIGHBOUR.name;
  return regionById(regionId)?.name ?? regionId;
}
