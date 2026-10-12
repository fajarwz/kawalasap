import { regionOf } from '../../shared/regions.ts';
import { formatInt } from './format.ts';
import type { Lang, StringKey, Translate } from './i18n.ts';

/**
 * Every option the UI offers is an enum, not a bare string, so a typo is a
 * compile error and the member names read in the code.
 */
export enum WindowKey {
  H24 = '24h',
  H48 = '48h',
  D7 = '7d',
}

export const WINDOW_KEYS: WindowKey[] = [WindowKey.H24, WindowKey.H48, WindowKey.D7];
/** Translation keys, so the wording lives in the locale files, not in the code. */
export const WINDOW_LABEL_KEY: Record<WindowKey, StringKey> = {
  [WindowKey.H24]: 'window.24h',
  [WindowKey.H48]: 'window.48h',
  [WindowKey.D7]: 'window.7d',
};
export const WINDOW_MINUTES: Record<WindowKey, number> = {
  [WindowKey.H24]: 1440,
  [WindowKey.H48]: 2880,
  [WindowKey.D7]: 10080,
};

export enum Confidence {
  Low = 'low',
  Nominal = 'nominal',
  High = 'high',
}
export const CONFIDENCE_KEYS: Confidence[] = [Confidence.Low, Confidence.Nominal, Confidence.High];
export const CONFIDENCE_LABEL_KEY: Record<Confidence, StringKey> = {
  [Confidence.Low]: 'confidence.low',
  [Confidence.Nominal]: 'confidence.nominal',
  [Confidence.High]: 'confidence.high',
};
const CONFIDENCE_BY_RANK: Confidence[] = CONFIDENCE_KEYS;

/** The filter offers the three levels plus "all", so it is its own enum. */
export enum ConfidenceFilter {
  All = 'all',
  Low = 'low',
  Nominal = 'nominal',
  High = 'high',
}

export interface WindowCounts {
  last24h: number;
  last48h: number;
  last7d: number;
  frpSum24h: number;
  meanFrp24h: number;
}

export interface SourceMeta {
  id: string;
  label: string;
  page: string;
  file: string;
  fetchedAt: string;
  bytes: number;
  rowsInFile: number;
  rowsInBox: number;
  coversFrom: string | null;
  coversTo: string | null;
  error: string | null;
  satellites: string[];
}

export interface DailyCount {
  date: string;
  count: number;
  countIndonesia: number;
  frpSum: number;
  byRegion: Record<string, number>;
}

/** [lat, lon, frp, confidence rank, night, minutes ago, source index] */
export type PointTuple = [number, number, number, number, number, number, number];
/** [lat, lon, count, max frp] */
export type CellTuple = [number, number, number, number];

export interface FiresPayload {
  generatedAt: string;
  window: string;
  dataEnd: string;
  bbox: [number, number, number, number];
  sources: SourceMeta[];
  counts: { indonesia: WindowCounts; neighbour: WindowCounts };
  byRegion: Record<string, WindowCounts>;
  daily: DailyCount[];
  cells: CellTuple[];
  points: PointTuple[];
  pointsInWindow: number;
  pointsTruncated: boolean;
}

export interface Hotspot {
  id: string;
  lat: number;
  lon: number;
  frp: number;
  confidence: Confidence;
  night: boolean;
  minutesAgo: number;
  acquiredAt: string;
  sourceIndex: number;
  region: string;
}

export interface HotspotCell {
  id: string;
  lat: number;
  lon: number;
  count: number;
  maxFrp: number;
  region: string;
}

export function decodeHotspots(payload: FiresPayload): Hotspot[] {
  const dataEnd = Date.parse(payload.dataEnd);
  return payload.points.map((point) => {
    const [lat, lon, frp, confidence, night, minutesAgo, sourceIndex] = point;
    return {
      id: `${lat},${lon},${minutesAgo},${sourceIndex}`,
      lat,
      lon,
      frp,
      confidence: CONFIDENCE_BY_RANK[confidence] ?? Confidence.Nominal,
      night: night === 1,
      minutesAgo,
      acquiredAt: new Date(dataEnd - minutesAgo * 60000).toISOString(),
      sourceIndex,
      region: regionOf(lat, lon),
    };
  });
}

export function decodeCells(payload: FiresPayload): HotspotCell[] {
  return payload.cells.map(([lat, lon, count, maxFrp]) => ({
    id: `${lat},${lon}`,
    lat,
    lon,
    count,
    maxFrp,
    region: regionOf(lat, lon),
  }));
}

export interface HotspotFilter {
  window: WindowKey;
  confidence: ConfidenceFilter;
  minFrp: number;
  region: string;
  includeNeighbour: boolean;
}

/** The filter's members are the same values as Confidence, minus "all". */
export function asConfidence(value: ConfidenceFilter): Confidence | null {
  switch (value) {
    case ConfidenceFilter.Low:
      return Confidence.Low;
    case ConfidenceFilter.Nominal:
      return Confidence.Nominal;
    case ConfidenceFilter.High:
      return Confidence.High;
    case ConfidenceFilter.All:
      return null;
  }
}

export function filterHotspots(hotspots: Hotspot[], filter: HotspotFilter): Hotspot[] {
  const maxMinutes = WINDOW_MINUTES[filter.window];
  const level = asConfidence(filter.confidence);
  const minConfidence = level === null ? 0 : CONFIDENCE_KEYS.indexOf(level);
  return hotspots.filter((spot) => {
    if (spot.minutesAgo > maxMinutes) return false;
    if (spot.frp < filter.minFrp) return false;
    if (CONFIDENCE_KEYS.indexOf(spot.confidence) < minConfidence) return false;
    if (!filter.includeNeighbour && spot.region === 'neighbour') return false;
    if (filter.region !== 'all' && spot.region !== filter.region) return false;
    return true;
  });
}

export function filterCells(cells: HotspotCell[], filter: HotspotFilter): HotspotCell[] {
  return cells.filter((cell) => {
    if (!filter.includeNeighbour && cell.region === 'neighbour') return false;
    if (filter.region !== 'all' && cell.region !== filter.region) return false;
    return true;
  });
}

export function frpColour(frp: number): string {
  if (frp >= 120) return '#b91c1c';
  if (frp >= 60) return '#ef4444';
  if (frp >= 30) return '#f97316';
  if (frp >= 10) return '#fbbf24';
  return '#fde68a';
}

export function cellRadius(count: number, factor = 1): number {
  const base = 3 + Math.min(14, Math.log2(count + 1) * 2.7);
  // A merged box already summarises many detections, so a big circle on top of
  // it turns the country into one blob.
  const scale = factor >= 10 ? 0.42 : factor >= 5 ? 0.6 : factor >= 2 ? 0.8 : 1;
  return Math.max(2.5, base * scale);
}

/**
 * Below zoom 7 the 0.1° grid packs several circles into every pixel, so the
 * boxes are merged into coarser ones as the map zooms out. This is the same
 * trick the FIRMS viewer uses, and it keeps the picture countable.
 */
export function cellMergeFactor(zoom: number): number {
  if (zoom <= 4) return 10; // 1.0° boxes
  if (zoom <= 5) return 5; // 0.5°
  if (zoom <= 6) return 2; // 0.2°
  return 1; // 0.1°, the server grid
}

export function mergeCells(cells: HotspotCell[], factor: number): HotspotCell[] {
  if (factor <= 1) return cells;
  const merged = new Map<string, HotspotCell>();
  for (const cell of cells) {
    const latIndex = Math.round(Math.round(cell.lat / 0.1) / factor) * factor;
    const lonIndex = Math.round(Math.round(cell.lon / 0.1) / factor) * factor;
    const key = `${latIndex}|${lonIndex}`;
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, {
        ...existing,
        count: existing.count + cell.count,
        maxFrp: Math.max(existing.maxFrp, cell.maxFrp),
      });
    } else {
      merged.set(key, {
        ...cell,
        id: key,
        lat: Number((latIndex * 0.1).toFixed(2)),
        lon: Number((lonIndex * 0.1).toFixed(2)),
      });
    }
  }
  return [...merged.values()];
}

/** Detection dots stay small until the map is zoomed in far enough to separate them. */
export function pointRadius(frp: number, zoom: number): number {
  const base = frp >= 60 ? 4.6 : frp >= 20 ? 3.6 : 2.6;
  const scale = zoom <= 5 ? 0.55 : zoom <= 7 ? 0.8 : 1;
  return Math.max(1.5, base * scale);
}

export function summariseHotspots(hotspots: Hotspot[], t: Translate, lang: Lang): string {
  const total = hotspots.length;
  const intense = hotspots.filter((spot) => spot.frp >= 60).length;
  return t('summary.hotspots', {
    count: formatInt(total, lang),
    intense: formatInt(intense, lang),
  });
}
