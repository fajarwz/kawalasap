import type { DailyCount } from '../lib/fires.ts';
import { formatDayShort, formatInt } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { regionLabel } from '../lib/regions.ts';
import { RegionScope } from '../lib/viewState.ts';

interface TrendChartProps {
  daily: DailyCount[];
  /** A `RegionScope` member, or the id of one of our boxes. */
  region: string;
}

export function TrendChart({ daily, region }: TrendChartProps) {
  const t = useT();
  const lang = useLang();

  const series = daily.map((day) => ({
    date: day.date,
    value: region === RegionScope.All ? day.countIndonesia : (day.byRegion[region] ?? 0),
  }));
  const max = Math.max(1, ...series.map((point) => point.value));

  return (
    <div className="w-full">
      <div className="flex h-44 w-full items-end gap-1.5">
        {series.map((point) => {
          const height = Math.max(2, Math.round((point.value / max) * 100));
          return (
            <div key={point.date} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5">
              <span className="num text-center text-micro text-[var(--muted)]">
                {formatInt(point.value, lang)}
              </span>
              <div
                className="w-full rounded-t-sm bg-[var(--accent)]"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex w-full gap-1.5 border-t border-[var(--border)] pt-1.5">
        {series.map((point) => (
          <span key={point.date} className="min-w-0 flex-1 truncate text-center text-micro text-[var(--faint)]">
            {formatDayShort(point.date, lang).split(' ').slice(0, 2).join(' ')}
          </span>
        ))}
      </div>
      <p className="mt-2 text-label-12 leading-relaxed text-[var(--faint)]">
        {t('trend.note', {
          scope:
            region === RegionScope.All
              ? t('trend.scopeIndonesia')
              : t('trend.scopeRegion', { region: regionLabel(region) }),
        })}
      </p>
    </div>
  );
}
