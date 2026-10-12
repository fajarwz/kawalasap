import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  CONFIDENCE_LABEL_KEY,
  Confidence,
  ConfidenceFilter,
  WINDOW_KEYS,
  WINDOW_LABEL_KEY,
} from '../lib/fires.ts';
import { formatInt } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { InfoTip } from './ui/InfoTip.tsx';
import { Basemap, LayerMode, WindLevel, type DashboardSearch } from '../lib/viewState.ts';

interface FilterBarProps {
  search: DashboardSearch;
  onChange: (patch: Partial<DashboardSearch>) => void;
  shownCount: number;
  totalCount: number;
  layerForced: boolean;
  /**
   * Freshness stamp and the action that refreshes it. They sit on the right of this
   * row because a head of three stacked lines pushed the map down for no reason,
   * and the right of the toolbar row was empty.
   */
  meta?: ReactNode;
}

const selectClass =
  'rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1.5 text-label-13 text-[var(--text)] outline-none focus:border-[var(--accent)]';
const labelClass = 'flex flex-col gap-1 text-micro uppercase text-[var(--faint)]';
const ghostClass =
  'rounded-md px-3 py-1.5 text-label-13 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]';

const FRP_STEPS = [0, 10, 30, 60];

/**
 * A toolbar, not a form. Two controls are always visible because they change
 * what the map shows; the rest sit behind one disclosure so the page opens
 * quietly. Nothing here resets the scroll position: the view is in the URL.
 */
export function FilterBar({
  search,
  onChange,
  shownCount,
  totalCount,
  layerForced,
  meta,
}: FilterBarProps) {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState(false);

  const advancedCount = [
    search.confidence !== ConfidenceFilter.All,
    search.minFrp > 0,
    search.layer !== LayerMode.Density,
    search.basemap !== Basemap.Dark,
    search.wind,
  ].filter(Boolean).length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label={t('filter.timeWindow')}
          className="flex overflow-hidden rounded-md border border-[var(--border-strong)]"
        >
          {WINDOW_KEYS.map((key) => {
            const active = search.window === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ window: key })}
                className={`px-3 py-1.5 text-label-13 ${
                  active
                    ? 'bg-[var(--surface-2)] text-[var(--text)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {t(WINDOW_LABEL_KEY[key])}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={ghostClass}
        >
          {t('dash.filtersTitle')} ({formatInt(advancedCount, lang)}) {open ? '▴' : '▾'}
        </button>

        {meta ? <div className="ml-auto flex items-center gap-2">{meta}</div> : null}
      </div>

      {open ? (
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <label className={labelClass}>
            <span className="flex items-center gap-1">
              {t('filter.confidence')}
              <InfoTip label={t('glossary.confidence.label')}>
                {t('glossary.confidence.body')}
              </InfoTip>
            </span>
            <select
              className={selectClass}
              value={search.confidence}
              onChange={(event) =>
                onChange({ confidence: event.target.value as ConfidenceFilter })
              }
            >
              <option value={ConfidenceFilter.All}>{t('filter.any')}</option>
              <option value={ConfidenceFilter.Nominal}>
                {t('filter.andAbove', { level: t(CONFIDENCE_LABEL_KEY[Confidence.Nominal]) })}
              </option>
              <option value={ConfidenceFilter.High}>
                {t('filter.only', { level: t(CONFIDENCE_LABEL_KEY[Confidence.High]) })}
              </option>
            </select>
          </label>

          <label className={labelClass}>
            {t('filter.frp')}
            <select
              className={selectClass}
              value={String(search.minFrp)}
              onChange={(event) => onChange({ minFrp: Number(event.target.value) })}
            >
              {FRP_STEPS.map((step) => (
                <option key={step} value={String(step)}>
                  {step === 0
                    ? t('filter.any')
                    : t('filter.mwAndAbove', { value: formatInt(step, lang) })}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            {t('filter.layer')}
            <select
              className={selectClass}
              value={search.layer}
              onChange={(event) => onChange({ layer: event.target.value as LayerMode })}
            >
              <option value={LayerMode.Density}>{t('filter.density')}</option>
              <option value={LayerMode.Detections}>{t('filter.detections')}</option>
            </select>
          </label>

          <label className={labelClass}>
            {t('filter.basemap')}
            <select
              className={selectClass}
              value={search.basemap}
              onChange={(event) => onChange({ basemap: event.target.value as Basemap })}
            >
              <option value={Basemap.Dark}>{t('filter.dark')}</option>
              <option value={Basemap.Light}>{t('filter.light')}</option>
            </select>
          </label>

          <label className={labelClass}>
            {t('filter.windLayer')}
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--accent)]"
                checked={search.wind}
                onChange={(event) => onChange({ wind: event.target.checked })}
              />
              <select
                className={selectClass}
                value={search.windLevel}
                disabled={!search.wind}
                onChange={(event) => onChange({ windLevel: event.target.value as WindLevel })}
              >
                <option value={WindLevel.Ten}>10 m</option>
                <option value={WindLevel.Hpa850}>850 hPa</option>
              </select>
            </span>
          </label>
        </div>
      ) : null}

      <p className="flex items-center gap-1.5 text-label-12 leading-relaxed text-[var(--faint)]">
        <span className="num">
          {shownCount === totalCount
            ? t('filter.showingAll', { shown: formatInt(shownCount, lang) })
            : t('filter.showingSome', {
                shown: formatInt(shownCount, lang),
                total: formatInt(totalCount, lang),
              })}
        </span>
        {layerForced ? t('filter.layerForced') : ''}
        <InfoTip label={t('dash.filtersTitle')}>{t('dash.filtersSubtitle')}</InfoTip>
      </p>
    </div>
  );
}
