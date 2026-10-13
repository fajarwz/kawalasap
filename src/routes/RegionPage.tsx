import { Navigate, useParams, useSearch } from '@tanstack/react-router';
import { RegionOverview } from '../components/RegionOverview.tsx';
import { cityById } from '../lib/places.ts';
import { useLang } from '../lib/i18n.ts';
import { regionById } from '../lib/regions.ts';
import { exploreFrom, regionFrom } from '../lib/viewState.ts';

/**
 * One route file for two paths: a region box, and a city or regency inside it.
 * The rendering is the same template in both cases, because a reader asking about
 * Pekanbaru and a reader asking about Kalimantan want the same four answers: what
 * is detected, what the air is like, what is happening nearby, and what to do.
 */
export function RegionPage() {
  const params = useParams({ strict: false }) as { regionId?: string; placeId?: string };
  const lang = useLang();
  const search = useSearch({ from: '/$lang/region/$regionId' });
  const regionId = params.regionId ?? '';
  const region = regionById(regionId);
  const city = params.placeId ? cityById(params.placeId) ?? null : null;

  // A place we cannot resolve is not a page. Send the reader to the map rather
  // than an empty template that would look like missing data.
  if (!region) {
    return (
      <Navigate
        to="/$lang/explore"
        params={{ lang }}
        search={(previous) => exploreFrom(previous)}
        replace
      />
    );
  }

  /** A city only exists inside its own region box, so a mismatched pair is fixed. */
  if (params.placeId && (!city || city.region !== regionId)) {
    if (city) {
      return (
        <Navigate
          to="/$lang/region/$regionId/$placeId"
          params={{ lang, regionId: city.region, placeId: city.id }}
          search={(previous) => regionFrom(previous)}
          replace
        />
      );
    }
    return (
      <Navigate
        to="/$lang/region/$regionId"
        params={{ lang, regionId }}
        search={(previous) => regionFrom(previous)}
        replace
      />
    );
  }

  return <RegionOverview regionId={regionId} place={city} window={search.window} />;
}
