import { useCallback, useMemo, useState } from 'react';
import { AirQualityPanel } from './AirQualityPanel.tsx';
import { FilterBar } from './FilterBar.tsx';
import { MapLegend } from './MapLegend.tsx';
import { PlaceSearch } from './PlaceSearch.tsx';
import { MapView } from './MapView.tsx';
import { RegionTable } from './RegionTable.tsx';
import { SourcesPanel } from './SourcesPanel.tsx';
import { StatCards } from './StatCards.tsx';
import { TrendChart } from './TrendChart.tsx';
import { Card } from './ui/Card.tsx';
import { InfoTip } from './ui/InfoTip.tsx';
import { Skeleton } from './ui/Skeleton.tsx';
import { useAirQuality, usePinnedAirQuality } from '../hooks/useAirQuality.ts';
import { useFires } from '../hooks/useFires.ts';
import { useNow } from '../hooks/useNow.ts';
import { useRegionClimate, useWindField } from '../hooks/useWind.ts';
import {
  WindowKey,
  decodeCells,
  decodeHotspots,
  filterCells,
  filterHotspots,
  summariseHotspots,
  type Hotspot,
} from '../lib/fires.ts';
import { formatDateTimeWib, formatInt, relativeTime } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { BAND_COLOUR, BAND_LABEL_KEY, RiskBand, buildRegionRows, nationalRow } from '../lib/risk.ts';
import { DRAW_LIMIT, toHotspotFilter } from '../lib/viewFilters.ts';
import { LayerMode, formatPin, parsePin, type DashboardSearch, type PinPoint } from '../lib/viewState.ts';

interface DashboardViewProps {
  search: DashboardSearch;
  onChange: (patch: Partial<DashboardSearch>) => void;
  lockedRegion?: string;
  title: string;
  subtitle: string;
}

export function DashboardView({
  search,
  onChange,
  lockedRegion,
  title,
  subtitle,
}: DashboardViewProps) {
  const t = useT();
  const lang = useLang();
  const now = useNow();
  const fires = useFires();
  const air = useAirQuality();
  const wind = useWindField();
  const climate = useRegionClimate();

  // A pinned place lives in the URL, so a shared link opens the same point.
  const pin = useMemo(() => parsePin(search.pin), [search.pin]);
  const pinnedAir = usePinnedAirQuality(pin);
  const setPin = useCallback((point: PinPoint) => onChange({ pin: formatPin(point) }), [onChange]);
  const [selected, setSelected] = useState<string | null>(null);
  const clearPin = useCallback(() => {
    onChange({ pin: '' });
    setSelected(null);
  }, [onChange]);
  const selectCity = useCallback((cityId: string | null) => setSelected(cityId), []);

  const effective = useMemo(
    () => (lockedRegion ? { ...search, region: lockedRegion } : search),
    [search, lockedRegion],
  );

  const payload = fires.data;
  const hotspots = useMemo(() => (payload ? decodeHotspots(payload) : []), [payload]);
  const cells = useMemo(() => (payload ? decodeCells(payload) : []), [payload]);
  const filter = useMemo(() => toHotspotFilter(effective), [effective]);
  const shown = useMemo(() => filterHotspots(hotspots, filter), [hotspots, filter]);
  const shownCells = useMemo(() => filterCells(cells, filter), [cells, filter]);
  const readings = useMemo(() => air.data ?? [], [air.data]);
  const rows = useMemo(
    () =>
      buildRegionRows({
        byRegion: payload?.byRegion ?? {},
        readings,
        climate: climate.data ?? [],
        t,
        lang,
      }),
    [payload, readings, climate.data, t, lang],
  );
  const strongest = useMemo(
    () =>
      shown.reduce<Hotspot | null>(
        (best, spot) => (best === null || spot.frp > best.frp ? spot : best),
        null,
      ),
    [shown],
  );

  const layerForced = effective.layer === LayerMode.Detections && shown.length > DRAW_LIMIT;
  const layer = layerForced ? LayerMode.Density : effective.layer;
  const national = nationalRow(rows);
  const topRegion = rows[0] ?? null;
  const bannerBand =
    topRegion && (topRegion.band === RiskBand.High || topRegion.band === RiskBand.VeryHigh)
      ? topRegion
      : null;
  const refreshing =
    fires.isFetching || air.isFetching || wind.isFetching || climate.isFetching;

  const refresh = () => {
    void fires.refetch();
    void air.refetch();
    void wind.refetch();
    void climate.refetch();
  };

  // Title and subtitle belong to the page, so every state shows them.
  const heading = (
    <div className="min-w-0">
      <h1 className="text-heading-24">{title}</h1>
      <p className="mt-1 max-w-[68ch] text-copy-13 text-[var(--muted)]">{subtitle}</p>
    </div>
  );

  if (fires.isLoading) {
    return (
      <div className="space-y-6">
        {heading}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((tile) => (
            <Skeleton key={tile} className="h-[104px] rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-lg sm:h-[500px] xl:h-[600px]" />
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-copy-13">{t('dash.loadingTitle')}</p>
          <p className="mt-1 text-label-12 leading-relaxed text-[var(--muted)]">
            {t('dash.loadingNote')}
          </p>
        </div>
      </div>
    );
  }

  if (fires.isError || !payload) {
    return (
      <div className="space-y-6">
        {heading}
        <div
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
          style={{ borderLeft: '3px solid var(--warn)' }}
        >
          <p className="text-copy-13">
            {fires.error instanceof Error ? fires.error.message : t('dash.errorFallback')}
          </p>
          <p className="mt-1 max-w-[68ch] text-label-12 leading-relaxed text-[var(--muted)]">
            {t('dash.errorNote')}
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-label-13 hover:border-[var(--accent)]"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page head: one title, one stamp, one action. */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-heading-24">{title}</h1>
          <p className="mt-1 max-w-[68ch] text-copy-13 text-[var(--muted)]">{subtitle}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-micro text-[var(--faint)]">
            <span className="num">
              {t('dash.updatedShort', {
                rel: relativeTime(payload.generatedAt, now, lang),
                stamp: formatDateTimeWib(payload.generatedAt, lang),
              })}
            </span>
            <InfoTip label={t('glossary.freshness.label')}>
              {t('dash.assembled', {
                rel: relativeTime(payload.generatedAt, now, lang),
                stamp: formatDateTimeWib(payload.generatedAt, lang),
                newest: formatDateTimeWib(payload.dataEnd, lang),
                count: formatInt(payload.sources.length, lang),
              })}
            </InfoTip>
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-label-13 hover:border-[var(--accent)]"
        >
          {refreshing ? t('common.refreshing') : t('common.refresh')}
        </button>
      </div>

      {/* Toolbar: window, region, and one disclosure. Everything else waits behind it. */}
      <FilterBar
        search={effective}
        onChange={onChange}
        shownCount={shown.length}
        totalCount={hotspots.length}
        layerForced={layerForced}
      />

      {bannerBand ? (
        <div
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-copy-13"
          style={{ borderLeft: `3px solid ${BAND_COLOUR[bannerBand.band]}` }}
        >
          <p className="font-medium">
            {t('dash.banner', {
              band: t(BAND_LABEL_KEY[bannerBand.band]),
              region: bannerBand.name,
              score: formatInt(bannerBand.score, lang),
            })}
          </p>
          <p className="mt-1 text-label-12 leading-relaxed text-[var(--muted)]">
            {t('dash.bannerNote', { drivers: bannerBand.drivers.join('; ') })}
          </p>
        </div>
      ) : null}

      <StatCards payload={payload} strongest={strongest} readings={readings} />

      {/* An empty map must never read as "no fires": explain what it means. */}
      {shown.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-copy-13 font-medium">{t('dash.emptyTitle')}</p>
              <p className="mt-1 max-w-[70ch] text-label-12 leading-relaxed text-[var(--muted)]">
                {t('dash.emptyNote')}
              </p>
            </div>
            {effective.window !== WindowKey.D7 ? (
              <button
                type="button"
                onClick={() => onChange({ window: WindowKey.D7 })}
                className="rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-label-13 hover:border-[var(--accent)]"
              >
                {t('dash.emptyAction')}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <Card
        title={t('dash.title')}
        actions={
          <span className="flex items-center gap-1.5">
            {pin ? (
              <span className="flex items-center gap-1 rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-micro text-[var(--muted)]">
                <span className="max-w-[14ch] truncate">{pin.name}</span>
                <button
                  type="button"
                  onClick={clearPin}
                  aria-label={t('aq.clearPin')}
                  className="text-[var(--faint)] hover:text-[var(--text)]"
                >
                  ×
                </button>
              </span>
            ) : null}
            <span className="num text-micro text-[var(--faint)]">
              {t('dash.mapCount', { count: formatInt(shown.length, lang) })}
            </span>
            <InfoTip label={t('glossary.detection.label')}>
              {t('glossary.detection.body')}
            </InfoTip>
          </span>
        }
      >
        {/* The two ways to choose a point sit together, on the thing they change. */}
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <PlaceSearch onPick={setPin} />
          <span className="text-label-12 text-[var(--faint)]">{t('map.pickHint')}</span>
        </div>
        <div className="h-[420px] overflow-hidden rounded-md sm:h-[500px] xl:h-[600px]">
          <MapView
            hotspots={shown}
            cells={shownCells}
            cities={readings}
            wind={wind.data ?? []}
            sources={payload.sources}
            layer={layer}
            showWind={effective.wind}
            windLevel={effective.windLevel}
            basemap={effective.basemap}
            selectedRegion={effective.region}
            pin={pin}
            onPickPoint={setPin}
            onSelectCity={selectCity}
          />
        </div>
        <div className="mt-3">
          <MapLegend layer={layer} windLevel={effective.windLevel} />
        </div>
        <p className="mt-2 text-label-12 leading-relaxed text-[var(--faint)]">
          {t('dash.mapNote', { summary: summariseHotspots(shown, t, lang) })}
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <Card
            title={t('trend.title')}
            subtitle={`${t('trend.subtitle')}${
              effective.region === 'all' ? '' : t('trend.subtitleFiltered')
            }`}
          >
            <TrendChart daily={payload.daily} region={effective.region} />
          </Card>
        </div>
        <div className="xl:col-span-5">
          <Card
            title={t('dash.airTitle')}
            subtitle={t('dash.airSubtitle')}
            actions={
              <InfoTip label={t('glossary.unitPm.label')}>{t('glossary.unitPm.body')}</InfoTip>
            }
          >
            <AirQualityPanel
              readings={readings}
              pinned={pinnedAir.data ?? null}
              pinnedLoading={pinnedAir.isPending && pin !== null}
              pinnedFailed={pinnedAir.isError}
              selected={selected}
              onSelect={selectCity}
              onClearPin={clearPin}
              rows={rows}
              windowKey={effective.window}
              now={now}
              isLoading={air.isLoading}
            />
          </Card>
        </div>
      </div>

      <Card title={t('dash.regionTitle')} subtitle={t('dash.regionSubtitle')}>
        <RegionTable rows={rows} window={effective.window} />
      </Card>

      {/* The source table is reference material: closed by default, one click away. */}
      <Card
        title={t('dash.sourcesTitle')}
        subtitle={t('dash.sourcesSubtitle', {
          score: formatInt(national.score, lang),
          band: t(BAND_LABEL_KEY[national.band]),
        })}
      >
        <details>
          <summary className="cursor-pointer list-none text-label-13 text-[var(--muted)] hover:text-[var(--text)]">
            {t('sources.openTable')}
          </summary>
          <div className="mt-3">
            <SourcesPanel
              payload={payload}
              climateTime={climate.data?.[0]?.time ?? null}
              airTime={readings.find((reading) => reading.time)?.time ?? null}
              now={now}
            />
          </div>
        </details>
      </Card>
    </div>
  );
}
