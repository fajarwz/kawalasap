import { ConfidenceFilter, WindowKey } from './fires.ts';
import { coerceLang, type Lang } from './i18n.ts';

export enum LayerMode {
  Density = 'density',
  Detections = 'detections',
}
export enum WindLevel {
  Ten = '10m',
  Hpa850 = '850hPa',
}
export enum Basemap {
  Dark = 'dark',
  Light = 'light',
}
export { ConfidenceFilter };

/**
 * A place the reader pinned, either from the search box or from a click on the
 * map. It is stored as one string so it rides along in the URL like every other
 * piece of view state.
 */
export interface PinPoint {
  lat: number;
  lon: number;
  /** City name, or the coordinates when the point came from the map. */
  name: string;
  /** Province, region or country, for the second line in the panel. */
  area: string;
}

const PIN_SEPARATOR = '~';

export function formatPin(point: PinPoint): string {
  return [
    point.lat.toFixed(4),
    point.lon.toFixed(4),
    point.name.slice(0, 60),
    point.area.slice(0, 60),
  ].join(PIN_SEPARATOR);
}

export function parsePin(value: string): PinPoint | null {
  if (!value) return null;
  const [rawLat, rawLon, name = '', area = ''] = value.split(PIN_SEPARATOR);
  const lat = Number(rawLat);
  const lon = Number(rawLon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon, name, area };
}

/** The whole dashboard state lives in the URL, so any view is shareable. */
export interface DashboardSearch {
  window: WindowKey;
  region: string;
  confidence: ConfidenceFilter;
  minFrp: number;
  layer: LayerMode;
  wind: boolean;
  windLevel: WindLevel;
  basemap: Basemap;
  /** A pinned place, encoded with `formatPin`. Empty means none. */
  pin: string;
  /** Indonesian by default: this is an Indonesian public interest tool. */
  lang: Lang;
}

export const DEFAULT_SEARCH: DashboardSearch = {
  window: WindowKey.H24,
  region: 'all',
  confidence: ConfidenceFilter.All,
  minFrp: 0,
  layer: LayerMode.Density,
  wind: true,
  windLevel: WindLevel.Ten,
  basemap: Basemap.Dark,
  pin: '',
  lang: 'id' as Lang,
};

const WINDOWS = new Set<string>(Object.values(WindowKey));
const CONFIDENCE = new Set<string>(Object.values(ConfidenceFilter));
const LAYERS = new Set<string>(Object.values(LayerMode));
const LEVELS = new Set<string>(Object.values(WindLevel));
const BASEMAPS = new Set<string>(Object.values(Basemap));

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function coerceSearch(raw: Record<string, unknown>): DashboardSearch {
  const window = asString(raw.window);
  const confidence = asString(raw.confidence);
  const layer = asString(raw.layer);
  const windLevel = asString(raw.windLevel);
  const basemap = asString(raw.basemap);
  const region = asString(raw.region);
  const pin = asString(raw.pin);
  const minFrp = Number(raw.minFrp);
  return {
    window: window && WINDOWS.has(window) ? (window as WindowKey) : DEFAULT_SEARCH.window,
    region: region || DEFAULT_SEARCH.region,
    confidence:
      confidence && CONFIDENCE.has(confidence)
        ? (confidence as ConfidenceFilter)
        : DEFAULT_SEARCH.confidence,
    minFrp: Number.isFinite(minFrp) && minFrp > 0 ? minFrp : 0,
    layer: layer && LAYERS.has(layer) ? (layer as LayerMode) : DEFAULT_SEARCH.layer,
    wind: raw.wind === undefined ? DEFAULT_SEARCH.wind : raw.wind !== false && raw.wind !== 'false',
    windLevel:
      windLevel && LEVELS.has(windLevel) ? (windLevel as WindLevel) : DEFAULT_SEARCH.windLevel,
    basemap: basemap && BASEMAPS.has(basemap) ? (basemap as Basemap) : DEFAULT_SEARCH.basemap,
    pin: (pin ?? '').slice(0, 200),
    lang: coerceLang(raw.lang),
  };
}
