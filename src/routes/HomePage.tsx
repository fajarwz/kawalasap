import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { DataSummaryCard } from '../components/DataSummaryCard.tsx';
import { SiteArt } from '../lib/illustrations.ts';
import { GuideCard } from '../components/GuideCard.tsx';
import { LocationSearch } from '../components/LocationSearch.tsx';
import { MapView } from '../components/MapView.tsx';
import { NewsList } from '../components/NewsList.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { PageLink } from '../components/ui/PageLink.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { arrow, linkClass } from '../components/ui/styles.ts';
import { useAirQuality } from '../hooks/useAirQuality.ts';
import { useFires } from '../hooks/useFires.ts';
import { useNews } from '../hooks/useNews.ts';
import { usePlaceNav } from '../hooks/usePlaceNav.ts';
import { DataState } from '../lib/dataState.ts';
import { decodeCells, decodeHotspots, filterCells, filterHotspots, WindowKey } from '../lib/fires.ts';
import { formatInt, formatOne } from '../lib/format.ts';
import { GUIDES, HOME_GUIDE_SLUGS } from '../lib/guide.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { NEWS_SOURCES } from '../lib/news.ts';
import { REGIONS } from '../lib/regions.ts';
import { toHotspotFilter } from '../lib/viewFilters.ts';
import { LayerMode, WindLevel, EXPLORE_DEFAULTS, regionFrom, type HomeSearch } from '../lib/viewState.ts';

const FIRMS_PAGE = 'https://firms.modaps.eosdis.nasa.gov/active_fire/';
const AIR_PAGE = 'https://open-meteo.com/en/docs/air-quality-api';

/**
 * The front door: what this is, one way to find your place, a restrained snapshot
 * of what is known, and the way on to the map, the news and the guidance.
 *
 * Three cards, not a wall of tiles. Each one carries a real value from a real
 * source with that source's own time, and the one card with nothing behind it
 * says so instead of inventing a count.
 *
 * Home owns two filters and no more: the two layer switches on its preview map.
 * The window, the confidence filter and the rest belong to Explore, where the map
 * is the page rather than a picture of it.
 */
export function HomePage() {
  const t = useT();
  const lang = useLang();
  const search = useSearch({ from: '/$lang/' });
  const navigate = useNavigate({ from: '/$lang/' });
  /** Home's preview is a fixed 24 hour read; only the map lets you widen it. */
  const fires = useFires(WindowKey.H24);
  const air = useAirQuality();
  const news = useNews();
  const newsSource = NEWS_SOURCES[0];
  /** When the feed was last read: a feed has no value of its own to timestamp. */
  const newsReadAt = news.dataUpdatedAt ? new Date(news.dataUpdatedAt).toISOString() : null;

  const { goRegion, goCity, goPoint } = usePlaceNav();

  const payload = fires.data;
  const hotspots = useMemo(() => (payload ? decodeHotspots(payload) : []), [payload]);
  const cells = useMemo(() => (payload ? decodeCells(payload) : []), [payload]);
  const filter = useMemo(() => toHotspotFilter(search), [search]);
  const shownHotspots = useMemo(() => filterHotspots(hotspots, filter), [hotspots, filter]);
  const shownCells = useMemo(() => filterCells(cells, filter), [cells, filter]);

  const readings = useMemo(() => air.data ?? [], [air.data]);
  const highest = useMemo(
    () =>
      readings.reduce<(typeof readings)[number] | null>(
        (best, reading) =>
          reading.pm25 !== null && (best?.pm25 ?? -1) < reading.pm25 ? reading : best,
        null,
      ),
    [readings],
  );

  const onChange = (patch: Partial<HomeSearch>) => {
    void navigate({
      to: '/$lang',
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      // A filter change is not a page change: keep the reader where they were.
      resetScroll: false,
    });
  };

  const detections24h = payload?.counts.indonesia.last24h ?? null;

  return (
    <div className="space-y-14">
      <section className="max-w-[75ch]">
        <p className="text-micro uppercase text-[var(--faint)]">{t('home.eyebrow')}</p>
        <h1 className="mt-3 text-heading-32">{t('home.title')}</h1>
        <p className="mt-3 max-w-[62ch] text-copy-14 text-[var(--muted)]">{t('home.description')}</p>
        <div className="mt-6 max-w-xl">
          <LocationSearch
            onPickRegion={goRegion}
            onPickCity={goCity}
            onPickPoint={goPoint}
          />
        </div>
        <PageLink
          to="/$lang/explore"
          className={`mt-4 inline-block text-label-13 text-[var(--text)] ${linkClass}`}
        >
          {t('home.mapLink')} {arrow}
        </PageLink>
      </section>

      <section>
        <SectionHeading title={t('home.snapshotTitle')} subtitle={t('home.snapshotSubtitle')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fires.isLoading ? (
            <>
              <Skeleton className="h-[168px] rounded-lg" />
              <Skeleton className="h-[168px] rounded-lg" />
            </>
          ) : null}

          {fires.isError ? (
            <DataSummaryCard
              label={t('home.firesLabel')}
              art={SiteArt.Thermal}
              value={null}
              state={DataState.Failed}
              detail={t('dash.errorNote')}
              link={{ label: t('home.firesAction'), to: '/$lang/explore' }}
            />
          ) : payload ? (
            <DataSummaryCard
              label={t('home.firesLabel')}
              art={SiteArt.Thermal}
              value={detections24h === null ? null : formatInt(detections24h, lang)}
              detail={t('home.firesDetail', {
                window: t('window.24h'),
                week: formatInt(payload.counts.indonesia.last7d, lang),
              })}
              source={{
                name: 'NASA FIRMS',
                href: FIRMS_PAGE,
                time: payload.dataEnd,
                kind: t('home.firesKind'),
              }}
              link={{ label: t('home.firesAction'), to: '/$lang/explore' }}
            />
          ) : null}

          {air.isLoading ? <Skeleton className="h-[168px] rounded-lg" /> : null}

          {air.isError ? (
            <DataSummaryCard
              label={t('home.airLabel')}
              art={SiteArt.Air}
              value={null}
              state={DataState.Failed}
              detail={t('home.airFailed')}
              link={{ label: t('home.airAction'), to: '/$lang/explore' }}
            />
          ) : readings.length ? (
            <DataSummaryCard
              label={t('home.airLabel')}
              art={SiteArt.Air}
              value={highest?.pm25 == null ? null : `${formatOne(highest.pm25, 0, lang)} µg/m³`}
              state={DataState.Empty}
              detail={
                highest
                  ? t('home.airDetail', {
                      count: formatInt(readings.length, lang),
                      city: highest.city.name,
                    })
                  : t('home.airFailed')
              }
              source={{
                name: 'Open-Meteo',
                href: AIR_PAGE,
                time: highest?.time ?? null,
                kind: t('home.airKind'),
              }}
              link={{ label: t('home.airAction'), to: '/$lang/explore' }}
            />
          ) : null}

          <DataSummaryCard
            label={t('home.newsLabel')}
            art={SiteArt.Report}
            value={news.data ? formatInt(news.data.length, lang) : null}
            state={
              news.isError
                ? DataState.Failed
                : news.isLoading
                  ? DataState.Loading
                  : DataState.Empty
            }
            detail={
              news.isError
                ? t('home.newsFailed')
                : t('home.newsDetail', { publisher: newsSource?.publisher ?? '' })
            }
            source={
              news.data && newsSource
                ? {
                    name: newsSource.publisher,
                    href: newsSource.homepage,
                    time: newsReadAt,
                    kind: t('news.feedKind'),
                  }
                : undefined
            }
            link={{ label: t('home.newsAction'), to: '/$lang/news' }}
          />
        </div>
      </section>

      <section>
        <SectionHeading title={t('home.exploreTitle')} subtitle={t('home.exploreSubtitle')} />
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <Card title={t('home.mapTitle')}>
              <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-micro uppercase text-[var(--faint)]">
                  {t('explore.layers')}
                </span>
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
              {fires.isLoading ? (
                <Skeleton className="h-[300px] rounded-md sm:h-[380px]" />
              ) : payload ? (
                <div className="h-[300px] overflow-hidden rounded-md sm:h-[380px]">
                  <MapView
                    hotspots={search.hotspots ? shownHotspots : []}
                    cells={search.hotspots ? shownCells : []}
                    cities={search.air ? readings : []}
                    wind={[]}
                    sources={payload.sources}
                    layer={LayerMode.Density}
                    showWind={false}
                    windLevel={WindLevel.Ten}
                    basemap={EXPLORE_DEFAULTS.basemap}
                    selectedRegion={EXPLORE_DEFAULTS.region}
                    pin={null}
                    onPickPoint={goPoint}
                    onSelectCity={goCity}
                  />
                </div>
              ) : (
                <EmptyState
                  bordered
                  state={DataState.Failed}
                  text={t('dash.errorNote')}
                  action={{ label: t('common.tryAgain'), onClick: () => void fires.refetch() }}
                />
              )}
              <PageLink
                to="/$lang/explore"
                className={`mt-3 inline-block text-label-13 text-[var(--text)] ${linkClass}`}
              >
                {t('home.openMap')} {arrow}
              </PageLink>
            </Card>
          </div>

          <div className="min-w-0 lg:col-span-5">
            <Card title={t('home.latestTitle')}>
              {news.isLoading ? (
                <p className="text-label-12 text-[var(--muted)]">{t('state.loading')}</p>
              ) : (
                <NewsList
                  items={news.data ?? []}
                  limit={3}
                  empty={
                    <EmptyState
                      state={news.isError ? DataState.Failed : DataState.Empty}
                      title={news.isError ? t('news.failedTitle') : t('news.noItemsTitle')}
                      text={
                        news.isError
                          ? t('home.newsFailed')
                          : t('home.newsDetail', { publisher: newsSource?.publisher ?? '' })
                      }
                    />
                  }
                />
              )}
              <PageLink
                to="/$lang/news"
                className={`mt-3 inline-block text-label-13 text-[var(--text)] ${linkClass}`}
              >
                {t('home.viewAllNews')} {arrow}
              </PageLink>
            </Card>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading title={t('home.regionTitle')} subtitle={t('home.regionDescription')} />
        <ul className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {REGIONS.map((region) => {
            const count = payload?.byRegion[region.id]?.last24h ?? null;
            return (
              <li key={region.id} className="flex items-center justify-between gap-4 py-2.5">
                <Link
                  to="/$lang/region/$regionId"
                  params={{ lang, regionId: region.id }}
                  search={(previous) => regionFrom(previous)}
                  className="text-label-14 text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                >
                  {region.name}
                </Link>
                <span className="num text-label-13 text-[var(--muted)]">
                  {count === null ? t('common.na') : formatInt(count, lang)}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-micro text-[var(--faint)]">{t('home.regionCountNote')}</p>
      </section>

      <section>
        <SectionHeading
          title={t('home.guideTitle')}
          subtitle={t('home.guideDescription')}
          actions={
            <PageLink
              to="/$lang/guide"
              className={`text-label-13 text-[var(--text)] ${linkClass}`}
            >
              {t('home.allGuidance')} {arrow}
            </PageLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {HOME_GUIDE_SLUGS.map((slug) => {
            const guide = GUIDES.find((item) => item.slug === slug);
            if (!guide) return null;
            return (
              <GuideCard
                key={guide.slug}
                slug={guide.slug}
                title={t(guide.titleKey)}
                summary={t(guide.summaryKey)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
