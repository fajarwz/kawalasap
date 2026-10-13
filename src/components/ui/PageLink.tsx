import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useLang } from '../../lib/i18n.ts';
import { exploreFrom, homeFrom } from '../../lib/viewState.ts';

/**
 * The destinations that carry no parameters of their own, so a panel can offer a
 * way on without knowing where the reader is.
 *
 * Typed as literals on purpose: a link is a route, not a string. It is the one
 * place that knows which pages need a search object and which must not have one,
 * so `/news` and `/guide` links stay clean and `/explore` gets its own defaults.
 * The language comes from the same context the copy does, so the two can never
 * disagree.
 */
export type SiteTarget =
  | '/$lang'
  | '/$lang/explore'
  | '/$lang/news'
  | '/$lang/guide'
  | '/$lang/method';

export function PageLink({
  to,
  search,
  className,
  children,
}: {
  to: SiteTarget;
  /** Anything the page carries that the target also understands. */
  search?: Parameters<typeof exploreFrom>[0];
  className?: string;
  children: ReactNode;
}) {
  const lang = useLang();

  if (to === '/$lang') {
    return (
      <Link to="/$lang" params={{ lang }} search={homeFrom} className={className}>
        {children}
      </Link>
    );
  }

  if (to === '/$lang/explore') {
    return (
      <Link
        to="/$lang/explore"
        params={{ lang }}
        search={(previous) => ({ ...exploreFrom(previous), ...(search ?? {}) })}
        className={className}
      >
        {children}
      </Link>
    );
  }

  if (to === '/$lang/news') {
    return (
      <Link to="/$lang/news" params={{ lang }} className={className}>
        {children}
      </Link>
    );
  }

  if (to === '/$lang/guide') {
    return (
      <Link to="/$lang/guide" params={{ lang }} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/$lang/method" params={{ lang }} className={className}>
      {children}
    </Link>
  );
}
