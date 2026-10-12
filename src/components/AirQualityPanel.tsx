import { aqiCategory, TONE_COLOUR } from '../lib/aqi.ts';
import type { CityReading } from '../lib/cities.ts';
import type { WindowKey } from '../lib/fires.ts';
import { formatOne } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { regionLabel } from '../lib/regions.ts';
import type { RegionRow } from '../lib/risk.ts';
import { CitySummary } from './CitySummary.tsx';
import { Badge } from './ui/Badge.tsx';
import { AqiIcon, IconUnknown } from './ui/icons.tsx';

interface AirQualityPanelProps {
  readings: CityReading[];
  /** The place the reader pinned, if any, read on its own. */
  pinned: CityReading | null;
  pinnedLoading: boolean;
  pinnedFailed: boolean;
  /** The city whose summary is open, chosen from this list or from the map. */
  selected: string | null;
  onSelect: (cityId: string | null) => void;
  onClearPin: () => void;
  /** Province rows, so the summary can say what is burning around the city. */
  rows: RegionRow[];
  windowKey: WindowKey;
  now: number;
  isLoading: boolean;
}

/** A pinned place carries its province; a curated city carries its region. */
function areaLine(reading: CityReading): string {
  return reading.city.area?.length ? reading.city.area : regionLabel(reading.city.region);
}

export function AirQualityPanel({
  readings,
  pinned,
  pinnedLoading,
  pinnedFailed,
  selected,
  onSelect,
  onClearPin,
  rows,
  windowKey,
  now,
  isLoading,
}: AirQualityPanelProps) {
  const t = useT();
  const lang = useLang();

  const sorted = [...readings].sort((a, b) => (b.usAqi ?? -1) - (a.usAqi ?? -1));
  const everyReading = pinned ? [pinned, ...readings] : readings;
  // Master and detail in one panel rather than two blocks in one column: the
  // list and the summary are never on screen together, so there is no question
  // of which one the numbers belong to, and no second scroll region.
  const active = selected
    ? everyReading.find((reading) => reading.city.id === selected) ?? null
    : null;

  const readingBadge = (reading: CityReading) => {
    const category = aqiCategory(reading.usAqi, t);
    return (
      <Badge
        colour={category ? TONE_COLOUR[category.tone] : '#64748b'}
        icon={category ? <AqiIcon tone={category.tone} /> : <IconUnknown />}
        title={category?.advice}
      >
        {reading.usAqi === null ? t('common.na') : Math.round(reading.usAqi)}
      </Badge>
    );
  };

  if (isLoading && !readings.length) {
    return <p className="text-copy-13 text-[var(--muted)]">{t('aq.loading')}</p>;
  }

  return (
    <div className="space-y-3">
      {active ? (
        <>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-label-13 text-[var(--muted)] hover:text-[var(--text)]"
          >
            ← {t('aq.backToList')}
          </button>
          <CitySummary
            key={active.city.id}
            reading={active}
            region={rows.find((row) => row.regionId === active.city.region) ?? null}
            windowKey={windowKey}
            now={now}
          />
        </>
      ) : (
        <>
          {pinned ? (
        <div className="rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-2">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onSelect(pinned.city.id)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate text-label-13 font-medium">{pinned.city.name}</span>
              <span className="block truncate text-micro text-[var(--faint)]">
                {t('aq.pinned')} · {areaLine(pinned)}
              </span>
            </button>
            <span className="flex shrink-0 items-center gap-2">
              <span className="num text-micro text-[var(--muted)]">
                {pinned.pm25 === null ? t('common.na') : `${formatOne(pinned.pm25, 0, lang)} µg/m³`}
              </span>
              {readingBadge(pinned)}
              <button
                type="button"
                onClick={onClearPin}
                aria-label={t('aq.clearPin')}
                className="rounded-sm px-1 text-label-13 text-[var(--faint)] hover:text-[var(--text)]"
              >
                ×
              </button>
            </span>
          </div>
          <p className="mt-1 text-micro leading-relaxed text-[var(--faint)]">
            {pinnedLoading
              ? t('aq.pinLoading')
              : pinnedFailed
                ? t('aq.pinFailed')
                : t('aq.pinModel')}
          </p>
        </div>
      ) : null}

      <ul className="max-h-72 divide-y divide-[var(--border)] overflow-y-auto pr-1">
        {sorted.map((reading) => (
          <li key={reading.city.id}>
            <button
              type="button"
              onClick={() => onSelect(reading.city.id)}
              className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-[var(--surface-2)]"
            >
              <span className="min-w-0">
                <span className="block truncate text-label-13 font-medium">
                  {reading.city.name}
                </span>
                <span className="block truncate text-micro text-[var(--faint)]">
                  {areaLine(reading)}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="num text-micro text-[var(--muted)]">
                  {reading.pm25 === null
                    ? t('common.na')
                    : `${formatOne(reading.pm25, 0, lang)} µg/m³`}
                </span>
                {readingBadge(reading)}
              </span>
            </button>
          </li>
        ))}
      </ul>

          <p className="text-micro leading-relaxed text-[var(--faint)]">{t('aq.listHint')}</p>
        </>
      )}
    </div>
  );
}
