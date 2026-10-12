import type { StringKey, Translate } from './i18n.ts';

export enum AqiTone {
  Good = 'good',
  Moderate = 'moderate',
  Sensitive = 'sensitive',
  Unhealthy = 'unhealthy',
  VeryUnhealthy = 'very-unhealthy',
  Hazardous = 'hazardous',
}

export interface AqiCategory {
  tone: AqiTone;
  label: string;
  advice: string;
}

/**
 * Solid fills, each paired with the ink the badge puts on top: light fills take
 * dark ink, dark fills take white. Both sides of every pair clear 4.5:1, which
 * is why the orange, red and purple are deeper than the map-only shades.
 */
export const TONE_COLOUR: Record<AqiTone, string> = {
  [AqiTone.Good]: '#22c55e',
  [AqiTone.Moderate]: '#eab308',
  [AqiTone.Sensitive]: '#c2410c',
  [AqiTone.Unhealthy]: '#b91c1c',
  [AqiTone.VeryUnhealthy]: '#7e22ce',
  [AqiTone.Hazardous]: '#7f1d1d',
};

/** Only thresholds live here. The wording lives in the locale files. */
const CATEGORIES: { max: number; tone: AqiTone }[] = [
  { max: 50, tone: AqiTone.Good },
  { max: 100, tone: AqiTone.Moderate },
  { max: 150, tone: AqiTone.Sensitive },
  { max: 200, tone: AqiTone.Unhealthy },
  { max: 300, tone: AqiTone.VeryUnhealthy },
  { max: Number.POSITIVE_INFINITY, tone: AqiTone.Hazardous },
];

/**
 * US EPA breakpoints for PM2.5, the 24 hour table in force before the May 2024
 * revision: `Clo` to `Chi` in µg/m³ maps to `Ilo` to `Ihi` on the index. Pull the
 * current published table before changing these numbers.
 */
const PM25_BREAKPOINTS: { chi: number; ilo: number; ihi: number }[] = [
  { chi: 12.0, ilo: 0, ihi: 50 },
  { chi: 35.4, ilo: 51, ihi: 100 },
  { chi: 55.4, ilo: 101, ihi: 150 },
  { chi: 150.4, ilo: 151, ihi: 200 },
  { chi: 250.4, ilo: 201, ihi: 300 },
  { chi: 350.4, ilo: 301, ihi: 400 },
  { chi: 500.4, ilo: 401, ihi: 500 },
];
const AQI_CEILING = 500;

/**
 * The index is derived here rather than taken from the provider's `us_aqi`,
 * because that field can contradict its own particle value: Open-Meteo has
 * reported `us_aqi 550` next to `pm2_5 33.3 µg/m³`, which reads as a
 * contradiction to anyone looking at both numbers. Deriving it means the badge
 * can never disagree with the µg/m³ beside it.
 */
export function usAqiFromPm25(pm25: number | null | undefined): number | null {
  if (pm25 === null || pm25 === undefined || !Number.isFinite(pm25) || pm25 < 0) return null;
  let lo = 0;
  for (const step of PM25_BREAKPOINTS) {
    if (pm25 <= step.chi) {
      const index = ((step.ihi - step.ilo) / (step.chi - lo)) * (pm25 - lo) + step.ilo;
      return Math.min(AQI_CEILING, Math.round(index));
    }
    lo = step.chi;
  }
  return AQI_CEILING;
}

const CATEGORY_KEYS: Record<AqiTone, { label: StringKey; advice: StringKey }> = {
  [AqiTone.Good]: { label: 'aqi.good.label', advice: 'aqi.good.advice' },
  [AqiTone.Moderate]: { label: 'aqi.moderate.label', advice: 'aqi.moderate.advice' },
  [AqiTone.Sensitive]: { label: 'aqi.sensitive.label', advice: 'aqi.sensitive.advice' },
  [AqiTone.Unhealthy]: { label: 'aqi.unhealthy.label', advice: 'aqi.unhealthy.advice' },
  [AqiTone.VeryUnhealthy]: {
    label: 'aqi.veryUnhealthy.label',
    advice: 'aqi.veryUnhealthy.advice',
  },
  [AqiTone.Hazardous]: { label: 'aqi.hazardous.label', advice: 'aqi.hazardous.advice' },
};

export function aqiCategory(
  usAqi: number | null | undefined,
  t: Translate,
): AqiCategory | null {
  if (usAqi === null || usAqi === undefined || !Number.isFinite(usAqi)) return null;
  const found = CATEGORIES.find((category) => usAqi <= category.max);
  if (!found) return null;
  const keys = CATEGORY_KEYS[found.tone];
  return { tone: found.tone, label: t(keys.label), advice: t(keys.advice) };
}

/**
 * What someone living there can actually do, per band. Three lines, shortest
 * useful sentence each: this is the only part of the page a reader may act on,
 * so it stays concrete and it stays in visible text.
 */
const ACTION_KEYS: Record<AqiTone, StringKey[]> = {
  [AqiTone.Good]: ['aqi.good.do1', 'aqi.good.do2', 'aqi.good.do3'],
  [AqiTone.Moderate]: ['aqi.moderate.do1', 'aqi.moderate.do2', 'aqi.moderate.do3'],
  [AqiTone.Sensitive]: ['aqi.sensitive.do1', 'aqi.sensitive.do2', 'aqi.sensitive.do3'],
  [AqiTone.Unhealthy]: ['aqi.unhealthy.do1', 'aqi.unhealthy.do2', 'aqi.unhealthy.do3'],
  [AqiTone.VeryUnhealthy]: [
    'aqi.veryUnhealthy.do1',
    'aqi.veryUnhealthy.do2',
    'aqi.veryUnhealthy.do3',
  ],
  [AqiTone.Hazardous]: ['aqi.hazardous.do1', 'aqi.hazardous.do2', 'aqi.hazardous.do3'],
};

export function aqiActions(tone: AqiTone, t: Translate): string[] {
  return ACTION_KEYS[tone].map((key) => t(key));
}
