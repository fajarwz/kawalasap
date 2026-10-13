import { ConfidenceFilter, WindowKey } from './fires.ts';

export enum LayerMode {
  Density = 'density',
  Detections = 'detections',
}
export enum WindLevel {
  Ten = '10m',
  Hpa850 = '850hPa',
}
/**
 * How a wind height is written for the reader. These are units, so they read the
 * same in both languages; the point is that the enum value ("10m") never reaches
 * the page. One map, used by the legend and the filter.
 */
export const WIND_LEVEL_LABEL: Record<WindLevel, string> = {
  [WindLevel.Ten]: '10 m',
  [WindLevel.Hpa850]: '850 hPa',
};
export enum Basemap {
  Dark = 'dark',
  Light = 'light',
}
/**
 * The map's region filter. Not region ids: those are data, read from
 * `shared/regions.ts`. These two are options the UI offers, so they are an enum
 * like every other choice, and `Neighbour` must match `NEIGHBOUR.id`.
 */
export enum RegionScope {
  All = 'all',
  Neighbour = 'neighbour',
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

/**
 * One search schema per page, and nothing else.
 *
 * A query string is a page's own state, so a page only declares the keys it
 * actually reads. `/news`, `/guide` and `/method` read none at all: their URLs
 * carry no parameters, and a link to them cannot smuggle the map's filters along.
 * The language is not here either: it is a path segment, see `router.tsx`.
 *
 * Every value still comes through the coercer below, and every route strips the
 * keys that are at their default, so a URL only shows what the reader changed.
 */

/** Everything the map shows: the whole of `/explore`, and nothing else. */
export interface ExploreSearch {
  window: WindowKey;
  /** A `RegionScope` member, or the id of one of our boxes. */
  region: string;
  confidence: ConfidenceFilter;
  minFrp: number;
  layer: LayerMode;
  wind: boolean;
  windLevel: WindLevel;
  basemap: Basemap;
  /** A pinned place, encoded with `formatPin`. Empty means none. */
  pin: string;
  /**
   * A monitored city chosen from the selector, by id. It is the city the map and
   * the air panel answer for, and it rides in the URL like every other filter.
   */
  place: string;
  /** Map layers. Two independent switches, so a reader can isolate one layer. */
  hotspots: boolean;
  air: boolean;
}

/** Home owns its two preview switches, and no filter the reader never set here. */
export interface HomeSearch {
  hotspots: boolean;
  air: boolean;
}

/** A region page reads one thing: the window its counts and its chart cover. */
export interface RegionSearch {
  window: WindowKey;
}

export const EXPLORE_DEFAULTS: ExploreSearch = {
  window: WindowKey.H24,
  region: RegionScope.All,
  confidence: ConfidenceFilter.All,
  minFrp: 0,
  layer: LayerMode.Density,
  wind: true,
  windLevel: WindLevel.Ten,
  basemap: Basemap.Dark,
  pin: '',
  place: '',
  hotspots: true,
  air: true,
};

export const HOME_DEFAULTS: HomeSearch = { hotspots: true, air: true };

export const REGION_DEFAULTS: RegionSearch = { window: WindowKey.H24 };

const WINDOWS = new Set<string>(Object.values(WindowKey));
const CONFIDENCE = new Set<string>(Object.values(ConfidenceFilter));
const LAYERS = new Set<string>(Object.values(LayerMode));
const LEVELS = new Set<string>(Object.values(WindLevel));
const BASEMAPS = new Set<string>(Object.values(Basemap));

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** A boolean in the URL arrives as `true`/`false` or as `"true"`/`"false"`. */
function asBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  return value !== false && value !== 'false' && value !== '0';
}

function asWindow(value: unknown): WindowKey {
  const raw = asString(value);
  return raw && WINDOWS.has(raw) ? (raw as WindowKey) : EXPLORE_DEFAULTS.window;
}

/** `/explore`: the reader's map, whole. */
export function coerceExplore(raw: Record<string, unknown>): ExploreSearch {
  const confidence = asString(raw.confidence);
  const layer = asString(raw.layer);
  const windLevel = asString(raw.windLevel);
  const basemap = asString(raw.basemap);
  const minFrp = Number(raw.minFrp);
  return {
    window: asWindow(raw.window),
    region: asString(raw.region) || EXPLORE_DEFAULTS.region,
    confidence:
      confidence && CONFIDENCE.has(confidence)
        ? (confidence as ConfidenceFilter)
        : EXPLORE_DEFAULTS.confidence,
    minFrp: Number.isFinite(minFrp) && minFrp > 0 ? minFrp : 0,
    layer: layer && LAYERS.has(layer) ? (layer as LayerMode) : EXPLORE_DEFAULTS.layer,
    wind: raw.wind === undefined ? EXPLORE_DEFAULTS.wind : asBoolean(raw.wind, EXPLORE_DEFAULTS.wind),
    windLevel:
      windLevel && LEVELS.has(windLevel) ? (windLevel as WindLevel) : EXPLORE_DEFAULTS.windLevel,
    basemap: basemap && BASEMAPS.has(basemap) ? (basemap as Basemap) : EXPLORE_DEFAULTS.basemap,
    pin: (asString(raw.pin) ?? '').slice(0, 200),
    place: (asString(raw.place) ?? '').slice(0, 60),
    // A layer switch is on unless the address says otherwise, so a link that has
    // never mentioned it still shows both layers.
    hotspots:
      raw.hotspots === undefined
        ? EXPLORE_DEFAULTS.hotspots
        : asBoolean(raw.hotspots, EXPLORE_DEFAULTS.hotspots),
    air: raw.air === undefined ? EXPLORE_DEFAULTS.air : asBoolean(raw.air, EXPLORE_DEFAULTS.air),
  };
}

/** `/`: two layer switches for the preview map, nothing else. */
export function coerceHome(raw: Record<string, unknown>): HomeSearch {
  return {
    hotspots:
      raw.hotspots === undefined
        ? HOME_DEFAULTS.hotspots
        : asBoolean(raw.hotspots, HOME_DEFAULTS.hotspots),
    air: raw.air === undefined ? HOME_DEFAULTS.air : asBoolean(raw.air, HOME_DEFAULTS.air),
  };
}

/** A region or city page: the window, and everything else is ignored. */
export function coerceRegion(raw: Record<string, unknown>): RegionSearch {
  return { window: asWindow(raw.window) };
}

/**
 * Moving between pages: what the target page should inherit from wherever the
 * reader is now.
 *
 * A link to a page that has no filters carries none, so `/news` and `/guide/...`
 * stay clean. A link into the map carries the map's own state, and a link from
 * the map into a region page carries the window they were both reading.
 */
export function exploreFrom(previous: Partial<ExploreSearch>): ExploreSearch {
  return { ...EXPLORE_DEFAULTS, ...previous };
}

export function homeFrom(previous: Partial<HomeSearch>): HomeSearch {
  return { ...HOME_DEFAULTS, ...previous };
}

export function regionFrom(previous: Partial<RegionSearch>): RegionSearch {
  return { window: previous.window ?? REGION_DEFAULTS.window };
}

/**
 * The map's filter, from whatever the current page carries. A page that carries
 * less than the map (home) simply gets the defaults for the rest.
 */
export type AnySearch = Partial<ExploreSearch> & Partial<HomeSearch> & Partial<RegionSearch>;
