import { Link } from '@tanstack/react-router';
import { useCountUp } from '../hooks/useCountUp.ts';
import { aqiActions, aqiCategory, AqiTone, TONE_COLOUR } from '../lib/aqi.ts';
import type { CityReading } from '../lib/cities.ts';
import { WindowKey, WINDOW_LABEL_KEY } from '../lib/fires.ts';
import { formatClockWib, formatInt, formatOne, relativeTime } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { regionLabel } from '../lib/regions.ts';
import { BAND_COLOUR, BAND_LABEL_KEY, countForWindow, type RegionRow } from '../lib/risk.ts';
import { regionFrom } from '../lib/viewState.ts';
import { Badge } from './ui/Badge.tsx';
import { InfoTip } from './ui/InfoTip.tsx';
import { AqiIcon, BandIcon, IconUnknown } from './ui/icons.tsx';

/** The index scale, split into the bands the tone colours describe. */
const SCALE: { tone: AqiTone; span: number }[] = [
  { tone: AqiTone.Good, span: 50 },
  { tone: AqiTone.Moderate, span: 50 },
  { tone: AqiTone.Sensitive, span: 50 },
  { tone: AqiTone.Unhealthy, span: 50 },
  { tone: AqiTone.VeryUnhealthy, span: 100 },
  { tone: AqiTone.Hazardous, span: 200 },
];
const SCALE_MAX = SCALE.reduce((total, band) => total + band.span, 0);

function Sparkline({ values }: { values: (number | null)[] }) {
  const t = useT();
  const points = values.filter((value): value is number => value !== null);
  if (points.length < 2) {
    return <p className="text-label-12 text-[var(--faint)]">{t('aq.noHistory')}</p>;
  }
  const max = Math.max(...points, 1);
  const step = 100 / (points.length - 1);
  const path = points
    .map(
      (value, index) =>
        `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(2)},${(100 - (value / max) * 96).toFixed(2)}`,
    )
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-16 w-full">
      <path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** One figure of the summary. The numbers are what the reader came for. */
function Figure({
  label,
  value,
  unit,
  caption,
  whole = false,
}: {
  label: string;
  value: number | null;
  unit?: string;
  caption?: string;
  whole?: boolean;
}) {
  const t = useT();
  const lang = useLang();
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2">
      <p className="text-micro text-[var(--faint)]">{label}</p>
      <p className="num text-heading-20">
        {value === null ? t('common.na') : whole ? formatInt(Math.round(value), lang) : formatOne(value, 0, lang)}
        {unit && value !== null ? (
          <span className="ml-1 text-micro text-[var(--muted)]">{unit}</span>
        ) : null}
      </p>
      {caption ? <p className="mt-0.5 text-micro leading-relaxed text-[var(--faint)]">{caption}</p> : null}
    </div>
  );
}

interface CitySummaryProps {
  reading: CityReading;
  /** The province row, for the detections and the heuristic score around it. */
  region: RegionRow | null;
  windowKey: WindowKey;
  now: number;
}

/**
 * What a reader gets when they pick a place: the model values as numbers, where
 * this place sits on the index, the trend behind it, and what the category means
 * for someone living there.
 *
 * The guidance is the one part a reader might act on, so it is written as the
 * category's general guidance, it stays in visible text rather than behind a
 * tip, and it says plainly what it is not: not medical advice, not an official
 * warning, and built on a model rather than a measurement at their door.
 */
export function CitySummary({ reading, region, windowKey, now }: CitySummaryProps) {
  const t = useT();
  const lang = useLang();
  const category = aqiCategory(reading.usAqi, t);
  const index = useCountUp(reading.usAqi);
  const pm25 = useCountUp(reading.pm25);
  const pm10 = useCountUp(reading.pm10);
  const detections = useCountUp(region ? countForWindow(region, windowKey) : null);
  const area = reading.city.area?.length ? reading.city.area : regionLabel(reading.city.region);
  const markerAt = Math.min(100, Math.max(0, ((index ?? 0) / SCALE_MAX) * 100));
  const actions = category ? aqiActions(category.tone, t) : [];

  return (
    <section className="animate-rise-in rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] p-3">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-heading-16">{reading.city.name}</h3>
          <p className="text-micro text-[var(--faint)]">
            {area} ·{' '}
            {t('aq.modelValue', {
              clock: formatClockWib(reading.time, lang),
              rel: relativeTime(reading.time, now, lang),
            })}
          </p>
        </div>
        <Badge
          colour={category ? TONE_COLOUR[category.tone] : '#64748b'}
          icon={category ? <AqiIcon tone={category.tone} /> : <IconUnknown />}
        >
          {category ? category.label : t('common.na')}
        </Badge>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Figure label={t('summary.pm25')} value={pm25} unit="µg/m³" />
        <Figure label={t('summary.index')} value={index} />
        <Figure label={t('summary.pm10')} value={pm10} unit="µg/m³" />
        <Figure
          label={t('summary.detections')}
          value={detections}
          whole
          caption={region ? t('summary.detectionsWindow', { window: t(WINDOW_LABEL_KEY[windowKey]) }) : undefined}
        />
      </div>

      <div className="mt-3">
        <div className="flex h-1.5 gap-px overflow-hidden rounded-full">
          {SCALE.map((band) => (
            <span key={band.tone} style={{ flexGrow: band.span, background: TONE_COLOUR[band.tone] }} />
          ))}
        </div>
        <div className="relative h-3">
          <span
            className="absolute -top-2 h-3 w-0.5 -translate-x-1/2 rounded-full bg-[var(--text)]"
            style={{ left: `${markerAt}%` }}
          />
        </div>
        <div className="num flex justify-between text-micro text-[var(--faint)]">
          <span>0</span>
          <span>{t('summary.indexScale')}</span>
          <span>{formatInt(SCALE_MAX, lang)}</span>
        </div>
      </div>

      {region ? (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-micro text-[var(--faint)]">
          <Badge
            colour={BAND_COLOUR[region.band]}
            icon={<BandIcon band={region.band} />}
          >
            {t('summary.riskBand', { band: t(BAND_LABEL_KEY[region.band]) })}
          </Badge>
          <InfoTip label={t('glossary.risk.label')}>
            {t('glossary.risk.body')}{' '}
            {t('risk.driversTip', { drivers: region.drivers.join('; ') })}
          </InfoTip>
          <span>{t('summary.risk', { score: formatInt(region.score, lang), region: region.name })}</span>
          <Link
            to="/$lang/region/$regionId"
            params={{ lang, regionId: region.regionId }}
            search={(previous) => regionFrom(previous)}
            className="inline-flex items-center gap-1.5"
          >
            <span className="underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]">
              {t('summary.focusRegion', { region: region.name })}
            </span>
          </Link>
        </p>
      ) : null}

      <div className="mt-3">
        <p className="text-micro text-[var(--faint)]">
          {t('summary.trend', { city: reading.city.name })}
        </p>
        <Sparkline values={reading.series.pm25} />
      </div>

      {category ? (
        <div className="mt-2 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2.5">
          <p className="text-label-13 leading-relaxed text-[var(--muted)]">{category.advice}</p>
          <p className="mt-2 text-micro text-[var(--faint)]">{t('summary.doTitle')}</p>
          <ul className="mt-1 space-y-1">
            {actions.map((action, position) => (
              <li
                key={action}
                className="animate-rise-in flex gap-2 text-label-12 leading-relaxed text-[var(--text)]"
                style={{ animationDelay: `${80 + position * 80}ms` }}
              >
                <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-micro leading-relaxed text-[var(--faint)]">{t('summary.doNote')}</p>
        </div>
      ) : (
        <p className="mt-2 text-label-12 text-[var(--faint)]">{t('aq.none')}</p>
      )}
    </section>
  );
}
