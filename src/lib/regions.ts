import {
  INDONESIA_BBOX,
  NEIGHBOUR,
  REGIONS,
  REGION_IDS,
  regionOf,
  type Region,
} from '../../shared/regions.ts';

export { INDONESIA_BBOX, NEIGHBOUR, REGIONS, REGION_IDS, regionOf };
export type { Region };

/** Indonesian regions only: the neighbouring-areas bucket is excluded. */
export const INDONESIA_REGION_IDS: string[] = REGION_IDS;

export function regionLabel(id: string): string {
  if (id === NEIGHBOUR.id) return NEIGHBOUR.name;
  return REGIONS.find((region) => region.id === id)?.name ?? id;
}

export function regionById(id: string): Region | undefined {
  return REGIONS.find((region) => region.id === id);
}
