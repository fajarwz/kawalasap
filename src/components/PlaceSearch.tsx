import { useState } from 'react';
import { MIN_QUERY_LENGTH, useGeocode } from '../hooks/useGeocode.ts';
import { useLang, useT } from '../lib/i18n.ts';
import type { PinPoint } from '../lib/viewState.ts';

interface PlaceSearchProps {
  onPick: (point: PinPoint) => void;
}

/**
 * One of the two ways to point the map at a place, typing it here; the other is
 * a click on the map itself. That is why this input lives with the map instead
 * of beside the readings it produces: the reading lands in the air quality
 * panel below, and the way to ask for it belongs where the asking happens.
 */
export function PlaceSearch({ onPick }: PlaceSearchProps) {
  const t = useT();
  const lang = useLang();
  const [query, setQuery] = useState('');
  const geocode = useGeocode(query, lang);
  const matches = geocode.data ?? [];
  const typed = query.trim().length;
  const searching = typed >= MIN_QUERY_LENGTH;

  const pick = (match: { name: string; area: string; lat: number; lon: number }) => {
    onPick({ name: match.name, area: match.area, lat: match.lat, lon: match.lon });
    setQuery('');
  };

  return (
    <div className="relative z-[1100] w-full sm:w-72">
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
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-lg">
          {typed < MIN_QUERY_LENGTH ? (
            <li className="px-2 py-1.5 text-label-12 text-[var(--faint)]">{t('place.hint')}</li>
          ) : null}
          {searching && geocode.isError ? (
            <li className="px-2 py-1.5 text-label-12 text-[var(--warn)]">{t('place.failed')}</li>
          ) : null}
          {searching && geocode.isPending && !matches.length ? (
            <li className="px-2 py-1.5 text-label-12 text-[var(--faint)]">{t('place.searching')}</li>
          ) : null}
          {searching && !geocode.isPending && !geocode.isError && !matches.length ? (
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
        </ul>
      ) : null}
    </div>
  );
}
