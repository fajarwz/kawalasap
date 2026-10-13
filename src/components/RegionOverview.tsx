import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useAirQuality } from '../hooks/useAirQuality.ts';
import { useFires } from '../hooks/useFires.ts';
import { usePlaceNav } from '../hooks/usePlaceNav.ts';
import { useRegionClimate } from '../hooks/useWind.ts';
import { useNews } from '../hooks/useNews.ts';
import type { City, CityReading } from '../lib/cities.ts';
import { DataState } from '../lib/dataState.ts';
import { WINDOW_LABEL_KEY, type WindowKey } from '../lib/fires.ts';
import { formatInt, formatOne } from '../lib/format.ts';
import { GUIDES, HOME_GUIDE_SLUGS } from '../lib/guide.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { NEWS_SOURCES, newsForRegion } from '../lib/news.ts';
import { citiesInRegion } from '../lib/places.ts';
import { regionLabel } from '../lib/regions.ts';
import { BAND_COLOUR, BAND_LABEL_KEY, buildRegionRows, countForWindow } from '../lib/risk.ts';
import { regionFrom } from '../lib/viewState.ts';
import { DataSummaryCard } from './DataSummaryCard.tsx';
import { SiteArt } from '../lib/illustrations.ts';
import { NewsList } from './NewsList.tsx';
import { SectionHeading } from './SectionHeading.tsx';
import { TrendChart } from './TrendChart.tsx';
import { Badge } from './ui/Badge.tsx';
import { PageLink } from './ui/PageLink.tsx';
import { aqiCategory, TONE_COLOUR } from '../lib/aqi.ts';
import { EmptyState } from './ui/EmptyState.tsx';
import { InfoTip } from './ui/InfoTip.tsx';
import { Skeleton } from './ui/Skeleton.tsx';
import { arrow, labelClass, linkClass, selectClass } from './ui/styles.ts';
import { AqiIcon, BandIcon, IconUnknown } from './ui/icons.tsx';

const FIRMS_PAGE = 'https://firms.modaps.eosdis.nasa.gov/active_fire/';
const AIR_PAGE = 'https://open-meteo.com/en/docs/air-quality-api';

/** How many city readings a region page lists before it points at Explore. */
const CITY_LIMIT = 6;

interface RegionOverviewProps {
  /** The region box the page answers for. */
  regionId: string;
  /** The city or regency page, when the route named one. */
  place: City | null;
  window: WindowKey;
}

function CityRow({ reading, name }: { reading: CityReading; name: string }) {
  const t = useT();
  const lang = useLang();
  const category = aqiCategory(reading.usAqi, t);
  return (
    <li className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-2.5 last:border-b-0">
      <Link
        to="/$lang/region/$regionId/$placeId"
        params={{ lang, regionId: reading.city.region, placeId: reading.city.id }}
        search={(previous) => regionFrom(previous)}
        className="min-w-0 text-label-14 text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
      >
        {name}
      </Link>
      <span className="flex shrink-0 items-center gap-3">
        <span className="num text-label-13 text-[var(--muted)]">
          {reading.pm25 === null ? t('common.na') : `${formatOne(reading.pm25, 0, lang)} µg/m³`}
        </span>
        <Badge
          colour={category ? TONE_COLOUR[category.tone] : '#64748b'}
          icon={category ? <AqiIcon tone={category.tone} /> : <IconUnknown />}
        >
          {reading.usAqi === null ? t('common.na') : formatInt(Math.round(reading.usAqi), lang)}
        </Badge>
      </span>
    </li>
  );
}

/**
 * One template for every place. A region box and a city inside it differ only in
 * what the two summary cards answer for and in the wording that keeps the two
 * apart: a city's air is a model value at a point, and the hotspot counts around
 * it belong to the region box, not to its boundary.
 */
export function RegionOverview({ regionId, place, window }: RegionOverviewProps) {
  const t = useT();
  const lang = useLang();
  const fires = useFires(window);
  const air = useAirQuality();
  const climate = useRegionClimate();
  const news = useNews();
  const { goCity } = usePlaceNav();

  const payload = fires.data;
  const readings = useMemo(() => air.data ?? [], [air.data]);
  /**
   * Only stories the publisher tagged with this box. Our boxes are approximations and
   * a story about one province is not news about the whole region, so nothing here is
   * widened or inferred: the tag is theirs, and the section says so.
   */
  const regionNews = useMemo(() => newsForRegion(news.data ?? [], regionId), [news.data, regionId]);
  const inScope = useMemo(
    () => readings.filter((reading) => reading.city.region === regionId),
    [readings, regionId],
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
  const row = rows.find((item) => item.regionId === regionId) ?? null;
  const boxName = regionLabel(regionId);
  const placeName = place?.name ?? boxName;
  const detections = row ? countForWindow(row, window) : null;
  const citiesHere = citiesInRegion(regionId);

  const highest = useMemo(
    () =>
      inScope.reduce<CityReading | null>(
        (best, reading) =>
          reading.pm25 !== null && (best?.pm25 ?? -1) < reading.pm25 ? reading : best,
        null,
      ),
    [inScope],
  );

  const forPlace = useMemo(
    () => (place ? inScope.find((reading) => reading.city.id === place.id) ?? null : null),
    [inScope, place],
  );
  const placeCategory = forPlace ? aqiCategory(forPlace.usAqi, t) : null;

  const listed = useMemo(
    () =>
      [...inScope]
        .filter((reading) => reading.pm25 !== null)
        .sort((a, b) => (b.pm25 ?? 0) - (a.pm25 ?? 0)),
    [inScope],
  );

  return (
    <div className="space-y-12">
      <div>
        <nav className="flex flex-wrap items-center gap-2 text-label-12 text-[var(--muted)]">
          <PageLink to="/$lang" className={linkClass}>
            {t('nav.home')}
          </PageLink>
          <span aria-hidden="true">/</span>
          {place ? (
            <>
              <Link
                to="/$lang/region/$regionId"
                params={{ lang, regionId }}
                search={(previous) => regionFrom(previous)}
                className={linkClass}
              >
                {boxName}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span>{placeName}</span>
        </nav>

        <h1 className="mt-3 text-heading-24">{placeName}</h1>
        <p className="mt-1 text-micro uppercase text-[var(--faint)]">
          {place ? t('place.typeCity') : t('place.typeRegion')}
        </p>
        <p className="mt-2 max-w-[68ch] text-copy-13 text-[var(--muted)]">
          {t('region.subtitle', { place: placeName })}
        </p>

        {!place && citiesHere.length ? (
          <label className={`${labelClass} mt-5 max-w-64`}>
            {t('region.chooseCity')}
            <select
              className={selectClass}
              value=""
              onChange={(event) => {
                if (event.target.value) goCity(event.target.value);
              }}
            >
              <option value="">{t('region.chooseCityPlaceholder')}</option>
              {citiesHere.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fires.isLoading ? (
            <>
              <Skeleton className="h-[168px] rounded-lg" />
              <Skeleton className="h-[168px] rounded-lg" />
            </>
          ) : (
            <>
              <DataSummaryCard
                label={t('region.snapshotFires')}
                art={SiteArt.Thermal}
                value={detections === null ? null : formatInt(detections, lang)}
                state={DataState.Empty}
                detail={
                  place
                    ? t('region.firesDetailCity', { box: boxName })
                    : t('region.firesDetail', { window: t(WINDOW_LABEL_KEY[window]) })
                }
                source={
                  payload
                    ? {
                        name: 'NASA FIRMS',
                        href: FIRMS_PAGE,
                        time: payload.dataEnd,
                        kind: t('region.kindDetection'),
                      }
                    : undefined
                }
                link={{ label: t('region.firesAction'), to: '/$lang/explore' }}
              />

              {air.isLoading ? (
                <Skeleton className="h-[168px] rounded-lg" />
              ) : (
                <DataSummaryCard
                  label={t('region.snapshotAir')}
                  art={SiteArt.Air}
                  value={
                    place
                      ? forPlace?.pm25 == null
                        ? null
                        : `${formatOne(forPlace.pm25, 0, lang)} µg/m³`
                      : highest?.pm25 == null
                        ? null
                        : `${formatOne(highest.pm25, 0, lang)} µg/m³`
                  }
                  state={DataState.Empty}
                  detail={
                    place
                      ? placeCategory
                        ? t('region.airDetailCity', { index: formatInt(forPlace?.usAqi ?? 0, lang), category: placeCategory.label })
                        : t('region.noReading')
                      : t('region.airDetail', {
                          count: formatInt(inScope.filter((item) => item.pm25 !== null).length, lang),
                          city: highest?.city.name ?? t('common.na'),
                        })
                  }
                  source={{
                    name: 'Open-Meteo',
                    href: AIR_PAGE,
                    time: (place ? forPlace?.time : highest?.time) ?? null,
                    kind: t('region.kindModel'),
                  }}
                  link={{ label: t('region.airAction'), to: '/$lang/explore' }}
                />
              )}
            </>
          )}
        </div>

        {row ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-micro text-[var(--faint)]">
            <Badge
              colour={BAND_COLOUR[row.band]}
              icon={<BandIcon band={row.band} />}
            >
              {t('region.riskBand', { band: t(BAND_LABEL_KEY[row.band]) })}
            </Badge>
            <span>{t('region.riskNote', { score: formatInt(row.score, lang) })}</span>
            <InfoTip label={t('glossary.risk.label')}>
              {t('glossary.risk.body')}{' '}
              {t('risk.driversTip', { drivers: row.drivers.join('; ') })}
            </InfoTip>
          </p>
        ) : null}
      </section>

      <section>
        <SectionHeading
          title={t('region.activityTitle')}
          subtitle={place ? t('region.activitySubtitleCity', { box: boxName }) : t('region.activitySubtitle')}
          actions={
            <InfoTip label={t('glossary.detection.label')}>{t('glossary.detection.body')}</InfoTip>
          }
        />
        {payload ? (
          <>
            <TrendChart daily={payload.daily} region={regionId} />
            <PageLink
              to="/$lang/explore"
              search={{ region: regionId, place: '' }}
              className={`mt-4 inline-block text-label-13 text-[var(--text)] ${linkClass}`}
            >
              {t('region.activityAction')} {arrow}
            </PageLink>
          </>
        ) : fires.isLoading ? (
          <Skeleton className="h-[220px] rounded-lg" />
        ) : (
          <EmptyState
            bordered
            state={DataState.Failed}
            text={t('dash.errorNote')}
            action={{ label: t('common.tryAgain'), onClick: () => void fires.refetch() }}
          />
        )}
      </section>

      <section>
        <SectionHeading
          title={t('region.airTitle')}
          subtitle={t('region.airSubtitle')}
          actions={
            <>
              <InfoTip label={t('glossary.unitPm.label')}>{t('glossary.unitPm.body')}</InfoTip>
              <InfoTip label={t('glossary.aqi.label')}>{t('glossary.aqi.body')}</InfoTip>
            </>
          }
        />
        {place ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <p className="text-label-14 font-medium">{place.name}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-label-12 text-[var(--muted)]">
              <span className="num">
                {forPlace?.pm25 == null
                  ? t('common.na')
                  : `${formatOne(forPlace.pm25, 0, lang)} µg/m³`}
              </span>
              {placeCategory ? (
                <Badge
                  colour={TONE_COLOUR[placeCategory.tone]}
                  icon={<AqiIcon tone={placeCategory.tone} />}
                >
                  {placeCategory.label}
                </Badge>
              ) : null}
              <span>{t('region.airModelNote')}</span>
            </p>
          </div>
        ) : air.isLoading ? (
          <Skeleton className="h-[160px] rounded-lg" />
        ) : listed.length ? (
          <>
            <ul>
              {listed.slice(0, CITY_LIMIT).map((reading) => (
                <CityRow key={reading.city.id} reading={reading} name={reading.city.name} />
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {listed.length > CITY_LIMIT ? (
                <PageLink
                  to="/$lang/explore"
                  search={{ region: regionId, air: true }}
                  className={`text-label-13 text-[var(--text)] ${linkClass}`}
                >
                  {t('region.airMore', { count: formatInt(listed.length - CITY_LIMIT, lang) })} {arrow}
                </PageLink>
              ) : null}
              <span className="text-micro text-[var(--faint)]">{t('region.airModelNote')}</span>
            </div>
          </>
        ) : (
          <EmptyState
            state={DataState.Empty}
            title={t('region.noReading')}
            text={t('region.noReadingNote', { place: placeName })}
          />
        )}
      </section>

      <section>
        <SectionHeading
          title={t('region.newsTitle', { place: placeName })}
          subtitle={t('region.newsSubtitle', {
            scope: boxName,
            publisher: NEWS_SOURCES[0]?.publisher ?? '',
          })}
        />
        {news.isLoading ? (
          <p className="text-label-12 text-[var(--muted)]">{t('state.loading')}</p>
        ) : news.isError ? (
          <EmptyState
            bordered
            state={DataState.Failed}
            title={t('news.failedTitle')}
            text={t('news.failedText', { publisher: NEWS_SOURCES[0]?.publisher ?? '' })}
          />
        ) : (
          <NewsList
            items={regionNews}
            limit={3}
            empty={
              <EmptyState
                bordered
                state={DataState.Empty}
                title={t('region.newsNoneTitle', { place: placeName })}
                text={t('region.newsNoneText', { scope: boxName })}
                action={{ label: t('news.title'), to: '/$lang/news' }}
              />
            }
          />
        )}
      </section>

      <section>
        <SectionHeading title={t('region.doTitle')} subtitle={t('region.doNote')} />
        <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {HOME_GUIDE_SLUGS.map((slug) => {
            const guide = GUIDES.find((item) => item.slug === slug);
            if (!guide) return null;
            return (
              <li key={slug}>
                <Link
                  to="/$lang/guide/$guideSlug"
                  params={{ lang, guideSlug: slug }}
                  className={`text-label-14 text-[var(--text)] ${linkClass}`}
                >
                  {t(guide.titleKey)}
                </Link>
                <span className="block text-micro text-[var(--faint)]">{t(guide.summaryKey)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-[var(--border)] pt-4">
        <p className="max-w-[80ch] text-label-12 leading-relaxed text-[var(--faint)]">
          {t('region.dataNote')}{' '}
          <PageLink to="/$lang/method" className={linkClass}>
            {t('region.dataNoteLink')} {arrow}
          </PageLink>
        </p>
        <p className="mt-2 text-micro text-[var(--faint)]">
          {t('region.coversNote', { box: boxName })}
        </p>
      </section>
    </div>
  );
}
