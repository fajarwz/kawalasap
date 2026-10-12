import type { CityReading } from '../lib/cities.ts';
import { aqiCategory } from '../lib/aqi.ts';
import type { FiresPayload, Hotspot } from '../lib/fires.ts';
import { formatDateTimeWib, formatInt, formatOne, percentChange, signedPercent } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { InfoTip } from './ui/InfoTip.tsx';

interface StatCardsProps {
  payload: FiresPayload;
  strongest: Hotspot | null;
  readings: CityReading[];
}

interface StatProps {
  label: string;
  value: string;
  detail: string;
  info?: { label: string; body: string };
}

/**
 * Four figures of equal weight. Values stay in the page text colour on purpose:
 * colour in this product means a reading, not emphasis. A unit that needs
 * explaining gets an info button rather than a line of footnote under the card.
 */
function Stat({ label, value, detail, info }: StatProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="flex items-center gap-1.5 text-micro uppercase text-[var(--faint)]">
        <span>{label}</span>
        {info ? <InfoTip label={info.label}>{info.body}</InfoTip> : null}
      </p>
      <p className="num mt-2 text-heading-20">{value}</p>
      <p className="mt-1 text-label-12 leading-snug text-[var(--muted)]">{detail}</p>
    </div>
  );
}

export function StatCards({ payload, strongest, readings }: StatCardsProps) {
  const t = useT();
  const lang = useLang();

  const days = payload.daily;
  const today = days.at(-1);
  const yesterday = days.at(-2);
  const change =
    today && yesterday ? percentChange(today.countIndonesia, yesterday.countIndonesia) : null;

  const withAqi = readings.filter((reading) => reading.usAqi !== null);
  const worstCity = [...withAqi].sort((a, b) => (b.usAqi ?? 0) - (a.usAqi ?? 0))[0] ?? null;
  const worstCategory = worstCity ? aqiCategory(worstCity.usAqi, t) : null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Stat
        label={t('stat.detections24h')}
        value={formatInt(payload.counts.indonesia.last24h, lang)}
        detail={t('stat.indonesiaOnly', {
          change:
            change === null
              ? t('stat.noComparisonYet')
              : t('stat.changeDetail', { value: signedPercent(change, lang) }),
        })}
      />
      <Stat
        label={t('stat.detections7d')}
        value={formatInt(payload.counts.indonesia.last7d, lang)}
        detail={t('stat.neighbourDetail', {
          count: formatInt(payload.counts.neighbour.last24h, lang),
        })}
      />
      <Stat
        label={t('stat.strongest')}
        info={{ label: t('glossary.frp.label'), body: t('glossary.frp.body') }}
        value={strongest ? `${formatOne(strongest.frp, 0, lang)} MW` : t('common.na')}
        detail={
          strongest
            ? `${formatDateTimeWib(strongest.acquiredAt, lang)} at ${strongest.lat.toFixed(2)}, ${strongest.lon.toFixed(2)}.`
            : t('stat.noMatch')
        }
      />
      <Stat
        label={t('stat.worstCity')}
        info={{ label: t('glossary.aqi.label'), body: t('glossary.aqi.body') }}
        value={worstCity?.usAqi ? `${formatInt(worstCity.usAqi, lang)} AQI` : t('common.na')}
        detail={
          worstCity
            ? t('stat.worstCityDetail', {
                city: worstCity.city.name,
                pm25: formatOne(worstCity.pm25, 0, lang),
                category: worstCategory ? worstCategory.label : '',
              })
            : t('stat.noModelAir')
        }
      />
    </div>
  );
}
