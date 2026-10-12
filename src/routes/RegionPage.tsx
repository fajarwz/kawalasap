import { Link, Navigate, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { DashboardView } from '../components/DashboardView.tsx';
import { useT } from '../lib/i18n.ts';
import { regionById } from '../lib/regions.ts';
import type { DashboardSearch } from '../lib/viewState.ts';
import { coerceSearch, DEFAULT_SEARCH } from '../lib/viewState.ts';

export function RegionPage() {
  const { regionId } = useParams({ from: '/region/$regionId' });
  const search = useSearch({ from: '/region/$regionId' });
  const navigate = useNavigate({ from: '/region/$regionId' });
  const t = useT();
  const region = regionById(regionId);

  if (!region) return <Navigate to="/" search={{ ...DEFAULT_SEARCH }} replace />;

  /**
   * On a province page the view is locked to the route, so writing `region` into
   * the query string would change nothing and the select would snap back, which
   * reads as a dead control. Choosing a province here means going to it, so the
   * control navigates instead.
   */
  const onChange = (patch: Partial<DashboardSearch>) => {
    if (patch.region !== undefined && patch.region !== regionId) {
      const target = regionById(patch.region);
      if (target) {
        void navigate({
          to: '/region/$regionId',
          params: { regionId: target.id },
          search: (previous) => coerceSearch({ ...previous, ...patch }),
          replace: true,
          resetScroll: false,
        });
      } else {
        void navigate({
          to: '/',
          search: (previous) => coerceSearch({ ...previous, ...patch }),
          replace: true,
          resetScroll: false,
        });
      }
      return;
    }
    void navigate({
      to: '/region/$regionId',
      params: { regionId },
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <div className="space-y-4">
      <Link
        to="/"
        search={(previous) => coerceSearch({ ...previous, region: 'all' })}
        className="inline-block text-xs text-[var(--muted)] hover:text-[var(--text)]"
      >
        {t('regionPage.back')}
      </Link>
      <DashboardView
        search={search}
        onChange={onChange}
        lockedRegion={regionId}
        title={t('regionPage.title', { region: region.name })}
        subtitle={t('regionPage.subtitle', { region: region.name })}
      />
    </div>
  );
}
