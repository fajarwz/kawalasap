import { DEFAULT_LANG, translate, type Lang } from './i18n.ts';

/**
 * Indonesian numbers group with a dot and use a comma for decimals, English the
 * other way round, so every number goes through Intl with the current language.
 */
const NUMBER_LOCALE: Record<Lang, string> = { id: 'id-ID', en: 'en-US' };
const DATE_LOCALE: Record<Lang, string> = { id: 'id-ID', en: 'en-GB' };

const numberFormats = new Map<string, Intl.NumberFormat>();

function numberFormat(lang: Lang, digits: number): Intl.NumberFormat {
  const key = `${lang}|${digits}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(NUMBER_LOCALE[lang], { maximumFractionDigits: digits });
    numberFormats.set(key, format);
  }
  return format;
}

export function formatInt(value: number, lang: Lang = DEFAULT_LANG): string {
  if (!Number.isFinite(value)) return translate(lang, 'common.na');
  return numberFormat(lang, 0).format(Math.round(value));
}

export function formatOne(
  value: number | null | undefined,
  digits = 1,
  lang: Lang = DEFAULT_LANG,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return translate(lang, 'common.na');
  }
  return numberFormat(lang, digits).format(value);
}

export function relativeTime(
  iso: string | null | undefined,
  nowMs: number,
  lang: Lang = DEFAULT_LANG,
): string {
  if (!iso) return translate(lang, 'common.unknown');
  const diff = nowMs - Date.parse(iso);
  if (!Number.isFinite(diff)) return translate(lang, 'common.unknown');
  if (diff < 0) return translate(lang, 'common.justNow');
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return translate(lang, 'common.justNow');
  if (minutes < 60) return translate(lang, 'common.minutesAgo', { n: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 36) return translate(lang, 'common.hoursAgo', { n: hours });
  const days = Math.round(hours / 24);
  return translate(lang, 'common.daysAgo', { n: days });
}

export function formatClockWib(
  iso: string | null | undefined,
  lang: Lang = DEFAULT_LANG,
): string {
  if (!iso) return translate(lang, 'common.unknown');
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return translate(lang, 'common.unknown');
  const clock = date.toLocaleTimeString(DATE_LOCALE[lang], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
  return `${clock} WIB`;
}

export function formatDateTimeWib(
  iso: string | null | undefined,
  lang: Lang = DEFAULT_LANG,
): string {
  if (!iso) return translate(lang, 'common.unknown');
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return translate(lang, 'common.unknown');
  const day = date.toLocaleDateString(DATE_LOCALE[lang], {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Jakarta',
  });
  return `${day}, ${formatClockWib(iso, lang)}`;
}

export function formatDayShort(dateIso: string, lang: Lang = DEFAULT_LANG): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateIso;
  const label = date.toLocaleDateString(DATE_LOCALE[lang], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  // Some Indonesian locales write a trailing dot after the weekday: "Min."
  return label.replace(/\.$/, '');
}

export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function signedPercent(value: number | null, lang: Lang = DEFAULT_LANG): string {
  if (value === null || !Number.isFinite(value)) return translate(lang, 'common.noComparison');
  const rounded = Math.round(value);
  if (rounded === 0) return translate(lang, 'common.flat');
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}
