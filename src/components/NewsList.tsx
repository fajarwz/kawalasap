import type { ReactNode } from 'react';
import { formatDateTimeWib } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import type { NewsItem } from '../lib/news.ts';
import { regionName } from '../lib/places.ts';
import { arrow, linkClass } from './ui/styles.ts';

interface NewsListProps {
  items: NewsItem[];
  /** Home and a region page show a few; the news page shows them all. */
  limit?: number;
  /** What to draw when there is nothing: each place says it differently. */
  empty: ReactNode;
}

/**
 * An editorial list, not a grid of image cards: the headline is the loudest thing on
 * the row, and the publisher, the date and the place tag stay quiet beside it.
 *
 * Every row links out to the original report and nothing is copied back in: no
 * summary of the publisher's own words, no image, no article page of our own. The
 * publisher's page is the only complete version of their story, so that is where the
 * reader goes.
 */
export function NewsList({ items, limit, empty }: NewsListProps) {
  const t = useT();
  const lang = useLang();

  if (!items.length) return <>{empty}</>;
  const shown = typeof limit === 'number' ? items.slice(0, limit) : items;

  return (
    <ul className="divide-y divide-[var(--border)]">
      {shown.map((item) => (
        <li key={item.id} className="py-3 first:pt-0 last:pb-0">
          <h3 className="text-heading-16">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className={`${linkClass} decoration-[var(--border-strong)] hover:decoration-[var(--accent)]`}
            >
              {item.headline}
            </a>
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-micro text-[var(--faint)]">
            <span>{item.publisher}</span>
            <span aria-hidden="true">·</span>
            <span className="num">
              {item.publishedAt ? formatDateTimeWib(item.publishedAt, lang) : t('common.na')}
            </span>
            {item.region ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{regionName(item.region)}</span>
              </>
            ) : null}
          </p>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1.5 inline-block text-label-13 text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
          >
            {t('news.readOriginal')} {arrow}
          </a>
        </li>
      ))}
    </ul>
  );
}
