import type { CityReading } from './cities.ts';
import { WindowKey, type WindowCounts } from './fires.ts';
import { formatInt, formatOne } from './format.ts';
import type { Lang, StringKey, Translate } from './i18n.ts';
import { REGIONS, regionLabel } from './regions.ts';
import type { ClimateReading } from './wind.ts';

export enum RiskBand {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  VeryHigh = 'very-high',
}

export const BAND_LABEL_KEY: Record<RiskBand, StringKey> = {
  [RiskBand.Low]: 'band.low',
  [RiskBand.Moderate]: 'band.moderate',
  [RiskBand.High]: 'band.high',
  [RiskBand.VeryHigh]: 'band.veryHigh',
};

/** Same pairing rule as the AQI tones: dark ink on green and amber, white below. */
export const BAND_COLOUR: Record<RiskBand, string> = {
  [RiskBand.Low]: '#22c55e',
  [RiskBand.Moderate]: '#eab308',
  [RiskBand.High]: '#c2410c',
  [RiskBand.VeryHigh]: '#b91c1c',
};

export interface RegionRow {
  regionId: string;
  name: string;
  counts: WindowCounts;
  maxPm25: number | null;
  worstCity: string | null;
  precip7d: number | null;
  windKmh: number | null;
  windFrom: number | null;
  score: number;
  band: RiskBand;
  drivers: string[];
}

/**
 * A transparent heuristic, not a forecast and not an official index. Five
 * signals, each mapped to 0 to 1, then weighted. The method page spells this
 * out so nobody has to guess where the number comes from.
 */
export const RISK_WEIGHTS = {
  fires: 35,
  intensity: 15,
  airQuality: 25,
  dryness: 15,
  dispersion: 10,
} as const;

const SATURATION_FIRES = 600;
const SATURATION_FRP = 40;
const SATURATION_PM25 = 150;
const SATURATION_DRY_MM = 60;
const CALM_WIND_KMH = 18;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function bandOf(score: number): RiskBand {
  if (score < 20) return RiskBand.Low;
  if (score < 40) return RiskBand.Moderate;
  if (score < 60) return RiskBand.High;
  return RiskBand.VeryHigh;
}

interface ScoreInput {
  fires24h: number;
  meanFrp24h: number;
  maxPm25: number | null;
  precip7d: number | null;
  windKmh: number | null;
}

interface ScoreResult {
  score: number;
  band: RiskBand;
  drivers: string[];
}

export function scoreRegion(input: ScoreInput, t: Translate, lang: Lang): ScoreResult {
  const fires = clamp01(Math.log10(1 + input.fires24h) / Math.log10(1 + SATURATION_FIRES));
  const intensity = clamp01(input.meanFrp24h / SATURATION_FRP);
  const airQuality = clamp01((input.maxPm25 ?? 0) / SATURATION_PM25);
  const dryness = input.precip7d === null ? 0 : clamp01(1 - input.precip7d / SATURATION_DRY_MM);
  const dispersion =
    input.windKmh === null ? 0 : clamp01((CALM_WIND_KMH - input.windKmh) / CALM_WIND_KMH);

  const score =
    fires * RISK_WEIGHTS.fires +
    intensity * RISK_WEIGHTS.intensity +
    airQuality * RISK_WEIGHTS.airQuality +
    dryness * RISK_WEIGHTS.dryness +
    dispersion * RISK_WEIGHTS.dispersion;

  const contributions: { weight: number; text: string }[] = [
    {
      weight: fires * RISK_WEIGHTS.fires,
      text: t('risk.driverFires', { count: formatInt(input.fires24h, lang) }),
    },
    {
      weight: intensity * RISK_WEIGHTS.intensity,
      text: t('risk.driverIntensity', { frp: formatOne(input.meanFrp24h, 0, lang) }),
    },
    {
      weight: airQuality * RISK_WEIGHTS.airQuality,
      text: t('risk.driverPm25', { pm25: formatOne(input.maxPm25 ?? 0, 0, lang) }),
    },
    {
      weight: dryness * RISK_WEIGHTS.dryness,
      text: t('risk.driverDry', { mm: formatOne(input.precip7d ?? 0, 0, lang) }),
    },
    {
      weight: dispersion * RISK_WEIGHTS.dispersion,
      text: t('risk.driverWind', { wind: formatOne(input.windKmh ?? 0, 0, lang) }),
    },
  ];

  const drivers = contributions
    .filter((item) => item.weight >= 4)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((item) => item.text);

  return {
    score: Math.round(score),
    band: bandOf(score),
    drivers: drivers.length ? drivers : [t('risk.driverNone')],
  };
}

export function buildRegionRows(args: {
  byRegion: Record<string, WindowCounts>;
  readings: CityReading[];
  climate: ClimateReading[];
  t: Translate;
  lang: Lang;
}): RegionRow[] {
  const { t, lang } = args;
  return REGIONS.map((region) => {
    const counts =
      args.byRegion[region.id] ?? {
        last24h: 0,
        last48h: 0,
        last7d: 0,
        frpSum24h: 0,
        meanFrp24h: 0,
      };
    const inRegion = args.readings.filter((reading) => reading.city.region === region.id);
    const withValues = inRegion.filter((reading) => reading.pm25 !== null);
    const worst = withValues.sort((a, b) => (b.pm25 ?? 0) - (a.pm25 ?? 0))[0] ?? null;
    const climate = args.climate.find((item) => item.regionId === region.id) ?? null;
    const scored = scoreRegion(
      {
        fires24h: counts.last24h,
        meanFrp24h: counts.meanFrp24h,
        maxPm25: worst?.pm25 ?? null,
        precip7d: climate?.precip7d ?? null,
        windKmh: climate?.windKmh ?? null,
      },
      t,
      lang,
    );
    return {
      regionId: region.id,
      name: regionLabel(region.id),
      counts,
      maxPm25: worst?.pm25 ?? null,
      worstCity: worst?.city.name ?? null,
      precip7d: climate?.precip7d ?? null,
      windKmh: climate?.windKmh ?? null,
      windFrom: climate?.windFrom ?? null,
      score: scored.score,
      band: scored.band,
      drivers: scored.drivers,
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * The detection count for the window the reader has selected. One reader of this
 * mapping, one place to change it.
 */
export function countForWindow(row: RegionRow, window: WindowKey): number {
  if (window === WindowKey.D7) return row.counts.last7d;
  if (window === WindowKey.H48) return row.counts.last48h;
  return row.counts.last24h;
}

export function nationalRow(rows: RegionRow[]): { score: number; band: RiskBand } {
  if (!rows.length) return { score: 0, band: RiskBand.Low };
  const worst = rows[0];
  const average = rows.reduce((sum, row) => sum + row.score, 0) / rows.length;
  const blended = Math.round(worst.score * 0.6 + average * 0.4);
  return { score: blended, band: bandOf(blended) };
}
