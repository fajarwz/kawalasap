import { NewsList } from '../components/NewsList.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { SourceTimestamp } from '../components/SourceTimestamp.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { PageLink } from '../components/ui/PageLink.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { arrow, linkClass } from '../components/ui/styles.ts';
import { useNews } from '../hooks/useNews.ts';
import { DataState } from '../lib/dataState.ts';
import { useT } from '../lib/i18n.ts';
import { NEWS_SOURCES } from '../lib/news.ts';

/**
 * News, honestly. A publisher's feed is read, filtered to fire, haze and air, and
 * listed with the headline, the publisher, their publication date and a link out.
 * There is no article page on this site on purpose: the publisher's own page is the
 * only complete version of their story, and copying it is not something we can do.
 *
 * The states are the point of this page as much as the list is: a feed that fails
 * shows as failed rather than as an empty list, because "no news" would be a claim
 * about the world made out of a timeout.
 *
 * The list is short because the feed is a rolling window rather than an archive, and
 * `news.will4` says so in visible text. Loosening the filter to fill the page would be
 * padding, which is the one thing the list must not do.
 */
const NEWS_RULE_KEYS = ['news.will1', 'news.will2', 'news.will3', 'news.will4'] as const;

export function NewsPage() {
  const t = useT();
  const news = useNews();
  const [source] = NEWS_SOURCES;
  /** When the feed was last read: a feed has no value of its own to timestamp. */
  const newsReadAt = news.dataUpdatedAt ? new Date(news.dataUpdatedAt).toISOString() : null;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-heading-24">{t('news.title')}</h1>
        <p className="mt-1 max-w-[68ch] text-copy-13 text-[var(--muted)]">{t('news.subtitle')}</p>
        {newsReadAt && source ? (
          <div className="mt-2">
            <SourceTimestamp
              name={source.publisher}
              href={source.homepage}
              time={newsReadAt}
              kind={t('news.feedKind')}
            />
          </div>
        ) : null}
      </div>

      <section>
        {news.isLoading ? (
          <ul className="space-y-4">
            {[0, 1, 2].map((row) => (
              <li key={row}>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-3.5 w-1/3" />
              </li>
            ))}
            <li className="text-label-12 text-[var(--muted)]">{t('state.loading')}</li>
          </ul>
        ) : news.isError ? (
          <EmptyState
            bordered
            state={DataState.Failed}
            title={t('news.failedTitle')}
            text={t('news.failedText', { publisher: source?.publisher ?? '' })}
            action={{ label: t('common.tryAgain'), onClick: () => void news.refetch() }}
          />
        ) : (
          <NewsList
            items={news.data ?? []}
            empty={
              <EmptyState
                bordered
                state={DataState.Empty}
                title={t('news.noItemsTitle')}
                text={t('news.noItemsText')}
              />
            }
          />
        )}
      </section>

      <section>
        <SectionHeading title={t('news.whyTitle')} subtitle={t('news.whySubtitle')} />
        <ul className="max-w-[80ch] list-disc space-y-1.5 pl-4 text-copy-13 leading-relaxed text-[var(--muted)]">
          {NEWS_RULE_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <p className="mt-4 max-w-[80ch] text-label-12 leading-relaxed text-[var(--faint)]">
          {t('news.sourceNote', { publisher: source?.publisher ?? '' })}
        </p>
        <p className="mt-2 max-w-[80ch] text-label-12 leading-relaxed text-[var(--faint)]">
          {t('news.attributionNote')}
        </p>
        <PageLink
          to="/$lang/method"
          className={`mt-4 inline-block text-label-13 text-[var(--text)] ${linkClass}`}
        >
          {t('footer.method')} {arrow}
        </PageLink>
      </section>
    </div>
  );
}
