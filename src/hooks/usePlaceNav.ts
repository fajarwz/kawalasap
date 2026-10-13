import { useNavigate, useParams } from '@tanstack/react-router';
import { useCallback } from 'react';
import { coerceLang } from '../lib/i18n.ts';
import { cityById } from '../lib/places.ts';
import { regionOf } from '../lib/regions.ts';
import { exploreFrom, formatPin, regionFrom, type PinPoint } from '../lib/viewState.ts';

/**
 * Where a place goes when it is picked.
 *
 * - A region box and a monitored city have pages of their own.
 * - Any other place has no page to open, so it opens on Explore with that point
 *   read out, which is the one surface that can answer for a coordinate.
 *
 * One hook, so the header, the hero and the Explore toolbar cannot disagree about
 * where a choice leads. The language is carried as a path parameter, so a reader
 * who is reading in English stays in English when a place is chosen.
 */
export function usePlaceNav() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { lang?: string };
  const lang = coerceLang(params.lang);

  const goRegion = useCallback(
    (regionId: string) => {
      void navigate({
        to: '/$lang/region/$regionId',
        params: { lang, regionId },
        search: (previous) => regionFrom(previous),
        resetScroll: false,
      });
    },
    [navigate, lang],
  );

  const goCity = useCallback(
    (cityId: string) => {
      const city = cityById(cityId);
      if (!city) return;
      void navigate({
        to: '/$lang/region/$regionId/$placeId',
        params: { lang, regionId: city.region, placeId: city.id },
        search: (previous) => regionFrom(previous),
        resetScroll: false,
      });
    },
    [navigate, lang],
  );

  const goPoint = useCallback(
    (point: PinPoint) => {
      const region = regionOf(point.lat, point.lon);
      void navigate({
        to: '/$lang/explore',
        params: { lang },
        search: (previous) => ({ ...exploreFrom(previous), region, pin: formatPin(point) }),
        resetScroll: false,
      });
    },
    [navigate, lang],
  );

  return { goRegion, goCity, goPoint };
}
