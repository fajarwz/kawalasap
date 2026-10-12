import { Link } from '@tanstack/react-router';
import { useT } from '../lib/i18n.ts';
import { DEFAULT_SEARCH } from '../lib/viewState.ts';

export function NotFound() {
  const t = useT();
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-8 text-center">
      <p className="text-heading-16">{t('notFound.title')}</p>
      <p className="mt-1 text-copy-13 text-[var(--muted)]">{t('notFound.note')}</p>
      <Link
        to="/"
        search={{ ...DEFAULT_SEARCH }}
        className="mt-4 inline-block rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-label-13 hover:border-[var(--accent)]"
      >
        {t('notFound.back')}
      </Link>
    </div>
  );
}
