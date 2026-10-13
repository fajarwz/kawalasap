import { useT } from '../lib/i18n.ts';
import { citiesInRegion } from '../lib/places.ts';
import { NEIGHBOUR, REGIONS } from '../lib/regions.ts';
import { RegionScope } from '../lib/viewState.ts';
import { labelClass, selectClass } from './ui/styles.ts';

interface LocationSelectorProps {
  /** The region box the page or the map is scoped to. `RegionScope.All` means everywhere. */
  region: string;
  /** A monitored city, or empty for none. */
  place: string;
  onChange: (patch: { region?: string; place?: string }) => void;
  /** The Explore view can also point at a city; a region page only scopes. */
  showPlace?: boolean;
}

/**
 * Two selects, in the order a reader thinks in: the region box first, then a city
 * inside it. A city is never required before content appears, and the city list is
 * built from the cities we actually monitor, so no city implies a reading that
 * does not exist.
 */
export function LocationSelector({
  region,
  place,
  onChange,
  showPlace = true,
}: LocationSelectorProps) {
  const t = useT();
  const cities = citiesInRegion(region);

  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
      <label className={labelClass}>
        {t('selector.region')}
        <select
          className={selectClass}
          value={region}
          onChange={(event) => {
            const next = event.target.value;
            // The chosen city may not sit in the new region: clear it rather than
            // point at a place the page no longer covers.
            const stillThere = citiesInRegion(next).some((city) => city.id === place);
            onChange({ region: next, place: stillThere ? place : '' });
          }}
        >
          <option value={RegionScope.All}>{t('selector.allRegions')}</option>
          {REGIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
          <option value={NEIGHBOUR.id}>{t('filter.neighbour')}</option>
        </select>
      </label>

      {showPlace ? (
        <label className={labelClass}>
          {t('selector.place')}
          <select
            className={selectClass}
            value={place}
            onChange={(event) => onChange({ place: event.target.value })}
          >
            <option value="">{t('selector.allPlaces')}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
