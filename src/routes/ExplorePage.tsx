import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { AirQualityPanel } from '../components/AirQualityPanel.tsx';
import { FilterBar } from '../components/FilterBar.tsx';
import { LocationSelector } from '../components/LocationSelector.tsx';
import { MapLegend } from '../components/MapLegend.tsx';
import { MapView } from '../components/MapView.tsx';
import { RegionTable } from '../components/RegionTable.tsx';
import { SourcesPanel } from '../components/SourcesPanel.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { InfoTip } from '../components/ui/InfoTip.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { arrow, linkClass } from '../components/ui/styles.ts';
import { PINNED_CITY_ID, useAirQuality, usePinnedAirQuality } from '../hooks/useAirQuality.ts';
import { useFires } from '../hooks/useFires.ts';
import { useNow } from '../hooks/useNow.ts';
import { useRegionClimate, useWindField } from '../hooks/useWind.ts';
import { DataState } from '../lib/dataState.ts';
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
import { cityById } from '../lib/places.ts';
import { regionLabel } from '../lib/regions.ts';
import { BAND_LABEL_KEY, buildRegionRows, nationalRow } from '../lib/risk.ts';
import { DRAW_LIMIT, toHotspotFilter } from '../lib/viewFilters.ts';
import { RegionScope, regionFrom } from '../lib/viewState.ts';
import { PageLink } from '../components/ui/PageLink.tsx';
import {
  LayerMode,
  formatPin,
  parsePin,
  type ExploreSearch,
} from '../lib/viewState.ts';

/**
 * Where the map lives. One toolbar above it and one panel beside it: the map is
 * the largest element on the page and it stays that way, because everything else
 * here is context for a place the reader is already looking at.
 */
export function ExplorePage() {
  const t = useT();
  const lang = useLang();
  const search = useSearch({ from: '/$lang/explore' });
  const navigate = useNavigate({ from: '/$lang/explore' });
  const now = useNow();
  const fires = useFires(search.window);
  const air = useAirQuality();
  const wind = useWindField();
  const climate = useRegionClimate();

  const pin = useMemo(() => parsePin(search.pin), [search.pin]);
  const pinnedAir = usePinnedAirQuality(pin);

  const onChange = useCallback(
    (patch: Partial<ExploreSearch>) => {
      void navigate({
        to: '/$lang/explore',
        // The route validates every search object it is given, so this only has to
        // produce the next view, not a complete one.
        search: (previous) => ({ ...previous, ...patch }),
        replace: true,
        // A filter change is not a page change: the reader keeps their place.
        resetScroll: false,
      });
    },
    [navigate],
  );

  const payload = fires.data;
  const hotspots = useMemo(() => (payload ? decodeHotspots(payload) : []), [payload]);
  const cells = useMemo(() => (payload ? decodeCells(payload) : []), [payload]);
  const filter = useMemo(() => toHotspotFilter(search), [search]);
  const shown = useMemo(() => filterHotspots(hotspots, filter), [hotspots, filter]);
  const shownCells = useMemo(() => filterCells(cells, filter), [cells, filter]);
  const readings = useMemo(() => air.data ?? [], [air.data]);
  const scopedReadings = useMemo(
    () =>
      search.region === RegionScope.All
        ? readings
        : readings.filter((reading) => reading.city.region === search.region),
    [readings, search.region],
  );
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

  /**
   * One place is selected at a time and it is always in the URL: a city from the
   * selector, or a point the reader clicked or searched for. The panel answers for
   * whichever it is, and never shows both at once.
   */
  const activeCity = search.place ? cityById(search.place) ?? null : null;
  const selected = search.place || (pin ? PINNED_CITY_ID : null);
  const selectPlace = useCallback(
    (cityId: string | null) => {
      if (!cityId) onChange({ place: '', pin: '' });
      else if (cityId === PINNED_CITY_ID) onChange({ place: '' });
      else onChange({ place: cityId, pin: '' });
    },
    [onChange],
  );

  const scopeName =
    search.region === RegionScope.All
      ? t('selector.allRegions')
      : search.region === RegionScope.Neighbour
        ? t('filter.neighbour')
        : regionLabel(search.region);
  const focusRegion = search.region !== RegionScope.All ? search.region : activeCity?.region ?? null;
  const layerForced = search.layer === LayerMode.Detections && shown.length > DRAW_LIMIT;
  const layer = layerForced ? LayerMode.Density : search.layer;
  const national = nationalRow(rows);
  const refreshing = fires.isFetching || air.isFetching || wind.isFetching || climate.isFetching;

  const refresh = () => {
    void fires.refetch();
    void air.refetch();
    void wind.refetch();
    void climate.refetch();
  };

  const head = (
    <div className="min-w-0">
      <h1 className="text-heading-24">{t('explore.title')}</h1>
      <p className="mt-1 max-w-[68ch] text-copy-13 text-[var(--muted)]">{t('explore.subtitle')}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {head}

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <LocationSelector
            region={search.region}
            place={search.place}
            onChange={onChange}
          />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-micro uppercase text-[var(--faint)]">{t('explore.layers')}</span>
            <label className="flex items-center gap-2 text-label-13">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--accent)]"
                checked={search.hotspots}
                onChange={(event) => onChange({ hotspots: event.target.checked })}
              />
              {t('explore.layerHotspots')}
            </label>
            <label className="flex items-center gap-2 text-label-13">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--accent)]"
                checked={search.air}
                onChange={(event) => onChange({ air: event.target.checked })}
              />
              {t('explore.layerAir')}
            </label>
          </div>
        </div>

        <FilterBar
          search={search}
          onChange={onChange}
          shownCount={shown.length}
          /**
           * The window's own total, from the payload, not the length of the
           * points array: that array is capped at 60,000, so on a seven day view
           * it would report 60,000 as "all in this window" when 93,070 were
           * detected.
           */
          totalCount={payload?.pointsInWindow ?? hotspots.length}
          layerForced={layerForced}
          meta={
            <>
              {payload ? (
                <span className="num flex items-center gap-1.5 text-micro text-[var(--faint)]">
                  {t('dash.updatedShort', {
                    rel: relativeTime(payload.generatedAt, now, lang),
                    stamp: formatDateTimeWib(payload.generatedAt, lang),
                  })}
                  <InfoTip label={t('glossary.freshness.label')}>
                    {t('dash.assembled', {
                      rel: relativeTime(payload.generatedAt, now, lang),
                      stamp: formatDateTimeWib(payload.generatedAt, lang),
                      newest: formatDateTimeWib(payload.dataEnd, lang),
                      count: formatInt(payload.sources.length, lang),
                    })}
                  </InfoTip>
                </span>
              ) : null}
              <button
                type="button"
                onClick={refresh}
                className="rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-label-13 hover:border-[var(--accent)]"
              >
                {refreshing ? t('common.refreshing') : t('common.refresh')}
              </button>
            </>
          }
        />
      </div>

      {fires.isLoading ? (
        <>
          <Skeleton className="h-[420px] rounded-lg sm:h-[520px]" />
          <div className="mt-3">
            <p className="text-label-14 font-medium">{t('dash.loadingTitle')}</p>
            <p className="mt-1 max-w-[80ch] text-label-12 leading-relaxed text-[var(--muted)]">
              {t('dash.loadingNote')}
            </p>
          </div>
        </>
      ) : !payload ? (
        <EmptyState
          bordered
          state={DataState.Failed}
          title={fires.error instanceof Error ? fires.error.message : t('dash.errorFallback')}
          text={t('dash.errorNote')}
          action={{ label: t('common.tryAgain'), onClick: refresh }}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* `min-w-0` because a grid item is as wide as its content wants by default, so one
              non-wrapping row inside a card can widen the track and take the page with it. */}
          <div className="min-w-0 lg:col-span-8">
            <Card
              title={t('explore.mapTitle')}
              actions={
                <span className="num text-micro text-[var(--faint)]">
                  {t('dash.mapCount', { count: formatInt(shown.length, lang) })}
                </span>
              }
            >
              <div className="h-[420px] overflow-hidden rounded-md sm:h-[500px] xl:h-[600px]">
                <MapView
                  hotspots={search.hotspots ? shown : []}
                  cells={search.hotspots ? shownCells : []}
                  cities={search.air ? readings : []}
                  wind={wind.data ?? []}
                  sources={payload.sources}
                  layer={layer}
                  showWind={search.wind}
                  windLevel={search.windLevel}
                  basemap={search.basemap}
                  selectedRegion={search.region}
                  pin={pin}
                  onPickPoint={(point) => onChange({ pin: formatPin(point), place: '' })}
                  onSelectCity={(cityId) => selectPlace(cityId)}
                />
              </div>
              <div className="mt-3">
                <MapLegend layer={layer} windLevel={search.windLevel} />
              </div>
              <p className="mt-2 text-label-12 text-[var(--text)]">{t('map.pickHint')}</p>
              <p className="mt-1 max-w-[80ch] text-label-12 leading-relaxed text-[var(--faint)]">
                {t('explore.dataNote')}{' '}
                <PageLink to="/$lang/method" className={linkClass}>
                  {t('explore.howToInterpret')} {arrow}
                </PageLink>
              </p>
            </Card>
          </div>

          <div className="min-w-0 lg:col-span-4">
            <Card
              title={activeCity ? activeCity.name : pin ? pin.name : t('explore.selectTitle')}
              subtitle={
                activeCity || pin
                  ? t('explore.panelScope', { scope: scopeName })
                  : t('explore.selectText')
              }
            >
              <AirQualityPanel
                readings={scopedReadings}
                pinned={pinnedAir.data ?? null}
                pinnedLoading={pinnedAir.isPending && pin !== null}
                pinnedFailed={pinnedAir.isError}
                selected={selected}
                onSelect={selectPlace}
                onClearPin={() => onChange({ pin: '', place: '' })}
                rows={rows}
                windowKey={search.window}
                now={now}
                isLoading={air.isLoading}
              />
              {focusRegion ? (
                <Link
                  to="/$lang/region/$regionId"
                  params={{ lang, regionId: focusRegion }}
                  search={(previous) => regionFrom(previous)}
                  className={`mt-3 inline-block text-label-13 text-[var(--text)] ${linkClass}`}
                >
                  {t('explore.viewRegion', { scope: regionLabel(focusRegion) })} {arrow}
                </Link>
              ) : null}
            </Card>
          </div>
        </div>
      )}

      {shown.length === 0 && payload ? (
        <EmptyState
          bordered
          state={DataState.Empty}
          title={t('dash.emptyTitle')}
          text={t('dash.emptyNote')}
          action={
            search.window !== WindowKey.D7
              ? { label: t('dash.emptyAction'), onClick: () => onChange({ window: WindowKey.D7 }) }
              : undefined
          }
        />
      ) : null}

      <section>
        <h2 className="text-heading-20">{t('dash.regionTitle')}</h2>
        <p className="mt-1 max-w-[68ch] text-copy-13 text-[var(--muted)]">
          {t('dash.regionSubtitle')}
        </p>
        <div className="mt-4">
          <RegionTable rows={rows} window={search.window} />
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-micro text-[var(--faint)]">
          {t('explore.strongest', {
            value: strongest
              ? `${formatInt(Math.round(strongest.frp), lang)} MW`
              : t('common.na'),
            time: strongest ? formatDateTimeWib(strongest.acquiredAt, lang) : '',
            summary: summariseHotspots(shown, t, lang),
          })}
          <InfoTip label={t('glossary.frp.label')}>{t('glossary.frp.body')}</InfoTip>
        </p>
      </section>

      {payload ? (
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
      ) : null}
    </div>
  );
}
