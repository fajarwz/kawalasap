import { useState } from 'react';
import { MIN_QUERY_LENGTH, useGeocode } from '../hooks/useGeocode.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { NEIGHBOUR, REGIONS, regionLabel } from '../lib/regions.ts';
import type { PinPoint } from '../lib/viewState.ts';

interface PlaceSearchProps {
  /** The region the whole page is scoped to, so the chip can show and clear it. */
  region: string;
  onPick: (point: PinPoint) => void;
  onPickRegion: (regionId: string) => void;
}

/**
 * The single answer to "where". A province scopes the whole page; a city points
 * the map and opens its own reading. Both are typed into this one box, because
 * two controls that both looked like place pickers, sitting in different corners
 * of the page, was the confusing part, not either behaviour on its own.
 */
export function PlaceSearch({ region, onPick, onPickRegion }: PlaceSearchProps) {
  const t = useT();
  const lang = useLang();
  const [query, setQuery] = useState('');
  const geocode = useGeocode(query, lang);
  const matches = geocode.data ?? [];
  const typed = query.trim().length;
  const searching = typed >= MIN_QUERY_LENGTH;

  /**
   * Our own seven regions, so they match from the first letter, no request and no
   * guessing at a geocoder's idea of a province. The neighbouring-areas bucket is
   * listed with them: like a province it is a scope, and unlike one it is a scope
   * we cannot put on a map as a boundary.
   */
  const needle = query.trim().toLowerCase();
  const regionMatches = needle
    ? [
        ...REGIONS,
        { id: NEIGHBOUR.id, name: t('filter.neighbour') },
      ].filter((candidate) => candidate.name.toLowerCase().includes(needle))
    : [];

  const pick = (match: { name: string; area: string; lat: number; lon: number }) => {
    onPick({ name: match.name, area: match.area, lat: match.lat, lon: match.lon });
    setQuery('');
  };

  const scope = region === NEIGHBOUR.id ? t('filter.neighbour') : regionLabel(region);

  return (
    <div className="relative z-[1100] flex w-full items-center gap-2 sm:w-auto">
      <div className="relative w-full sm:w-72">
        <label className="sr-only" htmlFor="place-search">
          {t('place.label')}
        </label>
        <input
          id="place-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('place.placeholder')}
          className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1.5 text-label-13 text-[var(--text)] outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]"
        />
        {typed > 0 ? (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-lg">
            {regionMatches.length ? (
              <>
                <li className="px-2 pb-1 pt-1.5 text-micro uppercase tracking-wide text-[var(--faint)]">
                  {t('place.regions')}
                </li>
                {regionMatches.map((candidate) => (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onPickRegion(candidate.id);
                        setQuery('');
                      }}
                      className="flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left hover:bg-[var(--surface-2)]"
                    >
                      <span className="truncate text-label-13">{candidate.name}</span>
                      <span className="shrink-0 text-micro text-[var(--faint)]">
                        {t('place.scopeHint')}
                      </span>
                    </button>
                  </li>
                ))}
              </>
            ) : null}

            {searching ? (
              <>
                <li className="px-2 pb-1 pt-1.5 text-micro uppercase tracking-wide text-[var(--faint)]">
                  {t('place.cities')}
                </li>
                {geocode.isError ? (
                  <li className="px-2 py-1.5 text-label-12 text-[var(--warn)]">{t('place.failed')}</li>
                ) : null}
                {geocode.isPending && !matches.length ? (
                  <li className="px-2 py-1.5 text-label-12 text-[var(--faint)]">
                    {t('place.searching')}
                  </li>
                ) : null}
                {!geocode.isPending && !geocode.isError && !matches.length ? (
                  <li className="px-2 py-1.5 text-label-12 text-[var(--faint)]">{t('place.none')}</li>
                ) : null}
                {matches.map((match) => (
                  <li key={match.key}>
                    <button
                      type="button"
                      onClick={() => pick(match)}
                      className="flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left hover:bg-[var(--surface-2)]"
                    >
                      <span className="truncate text-label-13">{match.name}</span>
                      <span className="shrink-0 text-micro text-[var(--faint)]">{match.area}</span>
                    </button>
                  </li>
                ))}
              </>
            ) : (
              <li className="px-2 py-1.5 text-label-12 text-[var(--faint)]">{t('place.hint')}</li>
            )}
          </ul>
        ) : null}
      </div>

      {/*
       * The scope has to be visible somewhere, and the toolbar select that used to
       * say it is gone: a chip next to the box that set it is the cheapest place to
       * read the state and the only place to clear it.
       */}
      {region !== 'all' ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-1 text-label-12 text-[var(--muted)]">
          <span className="max-w-40 truncate">{scope}</span>
          <button
            type="button"
            onClick={() => onPickRegion('all')}
            aria-label={t('place.clearRegion')}
            className="text-[var(--faint)] hover:text-[var(--text)]"
          >
            ×
          </button>
        </span>
      ) : null}
    </div>
  );
}
