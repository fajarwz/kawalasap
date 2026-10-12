import { useNavigate, useSearch } from '@tanstack/react-router';
import { DashboardView } from '../components/DashboardView.tsx';
import { useT } from '../lib/i18n.ts';
import type { DashboardSearch } from '../lib/viewState.ts';

export function DashboardPage() {
  const search = useSearch({ from: '/' });
  const navigate = useNavigate({ from: '/' });
  const t = useT();

  const onChange = (patch: Partial<DashboardSearch>) => {
    void navigate({
      to: '/',
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      // Filter changes are not page changes. Without this the router scrolls
      // back to the top on every checkbox, which loses the reader's place.
      resetScroll: false,
    });
  };

  return (
    <DashboardView
      search={search}
      onChange={onChange}
      title={t('dash.pageTitle')}
      subtitle={t('dash.subtitle')}
    />
  );
}
