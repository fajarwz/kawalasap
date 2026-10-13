import { useId, useMemo, useRef, useState } from 'react';
import { MIN_QUERY_LENGTH, useGeocode } from '../hooks/useGeocode.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { matchCities, matchRegions } from '../lib/places.ts';
import type { PinPoint } from '../lib/viewState.ts';
import { inputClass } from './ui/styles.ts';

type Option =
  | { key: string; kind: 'region'; id: string; name: string; note: string }
  | { key: string; kind: 'city'; id: string; name: string; note: string }
  | { key: string; kind: 'point'; name: string; note: string; point: PinPoint };

interface LocationSearchProps {
  /** Our own regions, matched locally from the first letter. */
  onPickRegion: (regionId: string) => void;
  /** A city in the list we monitor. */
  onPickCity: (cityId: string) => void;
  /** A place we have no page for: the caller pins it instead. */
  onPickPoint?: (point: PinPoint) => void;
  autoFocus?: boolean;
  /** One short line under the field, usually where a choice leads. */
  helper?: string;
  className?: string;
}

/**
 * The one answer to "where". It is the same box in the header, on Home, and in
 * the Explore toolbar, and it always answers the same way: pick something and the
 * site opens that place's page.
 *
 * Our regions answer from the first letter with no request; the monitored cities
 * answer the same way; anything else is geocoded, and the results say which kind
 * of place each one is, because a region box is not a province.
 */
export function LocationSearch({
  onPickRegion,
  onPickCity,
  onPickPoint,
  autoFocus = false,
  helper,
  className = '',
}: LocationSearchProps) {
  const t = useT();
  const lang = useLang();
  // The header and the hero can both hold this box, so the ids must be unique.
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const geocode = useGeocode(open ? query : '', lang);

  const regions = useMemo(() => matchRegions(query, t('filter.neighbour')), [query, t]);
  const cities = useMemo(() => matchCities(query), [query]);

  /** A geocoded place we already list as a monitored city would be a duplicate. */
  const otherPlaces = useMemo(() => {
    if (!onPickPoint) return [];
    const known = new Set(cities.map((city) => city.name.toLowerCase()));
    return (geocode.data ?? [])
      .filter((match) => !known.has(match.name.toLowerCase()))
      .slice(0, 4);
  }, [geocode.data, cities, onPickPoint]);

  const options: Option[] = useMemo(
    () => [
      ...regions.map<Option>((region) => ({
        key: `region-${region.id}`,
        kind: 'region',
        id: region.id,
        name: region.name,
        note: t('place.typeRegion'),
      })),
      ...cities.map<Option>((city) => ({
        key: `city-${city.id}`,
        kind: 'city',
        id: city.id,
        name: city.name,
        note: t('place.typeCity'),
      })),
      ...otherPlaces.map<Option>((match) => ({
        key: `point-${match.key}`,
        kind: 'point',
        name: match.name,
        note: match.area,
        point: { lat: match.lat, lon: match.lon, name: match.name, area: match.area },
      })),
    ],
    [regions, cities, otherPlaces, t],
  );

  const typed = query.trim().length;
  const searching = typed >= MIN_QUERY_LENGTH;

  const choose = (option: Option) => {
    if (option.kind === 'region') onPickRegion(option.id);
    else if (option.kind === 'city') onPickCity(option.id);
    else onPickPoint?.(option.point);
    setQuery('');
    setOpen(false);
  };

  return (
    <div
      ref={boxRef}
      className={`relative ${className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label className="sr-only" htmlFor={inputId}>
        {t('place.label')}
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        autoFocus={autoFocus}
        aria-expanded={open}
        aria-controls={listId}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setQuery('');
            setOpen(false);
          }
          if (event.key === 'ArrowDown' && open) {
            event.preventDefault();
            boxRef.current?.querySelector('button')?.focus();
          }
        }}
        placeholder={t('place.placeholder')}
        className={inputClass}
      />
      {helper ? <p className="mt-1 text-micro text-[var(--faint)]">{helper}</p> : null}

      {open && typed > 0 ? (
        <ul
          id={listId}
          className="absolute z-[1200] mt-1 w-full min-w-64 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-[var(--shadow-overlay)]"
        >
          {options.map((option) => (
            <li key={option.key}>
              <button
                type="button"
                onClick={() => choose(option)}
                className="flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left hover:bg-[var(--surface-2)]"
              >
                <span className="truncate text-label-13">{option.name}</span>
                <span className="shrink-0 text-micro text-[var(--faint)]">{option.note}</span>
              </button>
            </li>
          ))}

          {geocode.isError ? (
            <li className="px-2 py-1.5 text-label-12 text-[var(--warn)]">{t('place.failed')}</li>
          ) : null}
          {!options.length && searching && geocode.isPending ? (
            <li className="px-2 py-1.5 text-label-12 text-[var(--faint)]">{t('place.searching')}</li>
          ) : null}
          {!options.length && (!searching || (!geocode.isPending && !geocode.isError)) ? (
            <li className="px-2 py-1.5 text-label-12 text-[var(--faint)]">
              {searching ? t('place.none') : t('place.hint')}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
