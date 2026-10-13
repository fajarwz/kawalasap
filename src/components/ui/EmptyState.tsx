import { DATA_STATE_KEY, DataState } from '../../lib/dataState.ts';
import { useT } from '../../lib/i18n.ts';
import { PageLink, type SiteTarget } from './PageLink.tsx';

interface EmptyStateProps {
  /** Which of the four states this is. It decides the default wording. */
  state: Exclude<DataState, DataState.Ready>;
  /** Overrides the default wording when the specific case needs saying. */
  title?: string;
  /** One or two sentences at most: what it means and what to do about it. */
  text?: string;
  /** One action, at most. */
  action?: { label: string; to?: SiteTarget; onClick?: () => void };
  /** Standalone on a page, rather than inside a card that already has a border. */
  bordered?: boolean;
}

/**
 * One shape for every state where there is nothing to show. A missing source, a
 * failed source and a source with no recent reading are different things, so the
 * copy differs, but the reader should not have to learn three layouts to spot
 * all three.
 */
export function EmptyState({ state, title, text, action, bordered = false }: EmptyStateProps) {
  const t = useT();
  return (
    <div
      className={
        bordered
          ? 'rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4'
          : 'py-1'
      }
    >
      <p className="text-copy-13 font-medium">{title ?? t(DATA_STATE_KEY[state])}</p>
      {text ? (
        <p className="mt-1 max-w-[68ch] text-label-12 leading-relaxed text-[var(--muted)]">{text}</p>
      ) : null}
      {action ? (
        <div className="mt-3">
          {action.to ? (
            <PageLink
              to={action.to}
              className="rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-label-13 hover:border-[var(--accent)]"
            >
              {action.label}
            </PageLink>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-label-13 hover:border-[var(--accent)]"
            >
              {action.label}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
