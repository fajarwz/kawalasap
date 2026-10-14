import { Link, useParams } from '@tanstack/react-router';
import { NotFound } from '../components/NotFound.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { PageLink } from '../components/ui/PageLink.tsx';
import { arrow, linkClass } from '../components/ui/styles.ts';
import { DataState } from '../lib/dataState.ts';
import { GUIDES, guideBySlug } from '../lib/guide.ts';
import { GuideIllustration } from '../components/illustrations.tsx';
import { useLang, useT } from '../lib/i18n.ts';
import { NewsList } from '../components/NewsList.tsx';
import { useNews } from '../hooks/useNews.ts';

/**
 * One article template for every guide. The body is never wrapped in a single
 * card: it reads as a page, with a column narrow enough to read comfortably, and
 * the practical steps reuse the same wording the site shows beside each index
 * band, so the guide and the number cannot drift apart.
 */
export function GuideArticlePage() {
  const t = useT();
  const lang = useLang();
  const { guideSlug } = useParams({ strict: false }) as { guideSlug?: string };
  const guide = guideSlug ? guideBySlug(guideSlug) : undefined;
  const news = useNews();

  if (!guide) return <NotFound />;

  const related = GUIDES.filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <article className="space-y-10">
      <header className="sm:flex sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <nav className="flex flex-wrap items-center gap-2 text-label-12 text-[var(--muted)]">
            <PageLink to="/$lang" className={linkClass}>
              {t('nav.home')}
            </PageLink>
            <span aria-hidden="true">/</span>
            <PageLink to="/$lang/guide" className={linkClass}>
              {t('guide.title')}
            </PageLink>
            <span aria-hidden="true">/</span>
            <span>{t(guide.titleKey)}</span>
          </nav>
          <h1 className="mt-3 max-w-[24ch] text-heading-32">{t(guide.titleKey)}</h1>
          <p className="mt-3 max-w-[68ch] text-copy-14 text-[var(--muted)]">{t(guide.introKey)}</p>
        </div>
        <GuideIllustration
          slug={guide.slug}
          size={104}
          className="mt-5 hidden shrink-0 text-[var(--muted)] sm:mt-0 sm:block"
        />
      </header>

      <section className="max-w-[68ch]">
        <h2 className="text-heading-16">{t('guide.article.steps')}</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-copy-14 leading-relaxed">
          {guide.stepKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ol>
        <p className="mt-3 text-label-12 leading-relaxed text-[var(--faint)]">
          {t('guide.article.stepsNote')}
        </p>
      </section>

      <section className="max-w-[68ch]">
        <h2 className="text-heading-16">{t('guide.article.sources')}</h2>
        <ul className="mt-2 space-y-1.5 text-label-13">
          {guide.sources.map((source) => (
            <li key={source.href}>
              {source.internal ? (
                <PageLink to="/$lang/method" className={linkClass}>
                  {source.label}
                </PageLink>
              ) : (
                <a href={source.href} target="_blank" rel="noreferrer" className={linkClass}>
                  {source.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-[68ch]">
        <h2 className="text-heading-16">{t('guide.article.related')}</h2>
        <ul className="mt-2 space-y-1.5">
          {related.map((item) => (
            <li key={item.slug}>
              <Link
                to="/$lang/guide/$guideSlug"
                params={{ lang, guideSlug: item.slug }}
                className={`text-label-14 text-[var(--text)] ${linkClass}`}
              >
                {t(item.titleKey)} {arrow}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {guide.slug === 'understanding-air-quality' ? (
        <section className="max-w-[68ch]">
          <h2 className="text-heading-16">{t('news.title')}</h2>
          {news.isLoading ? (
            <p className="text-label-12 text-[var(--muted)]">{t('state.loading')}</p>
          ) : (
            <NewsList
              items={news.data ?? []}
              limit={3}
              empty={
                <EmptyState
                  state={news.isError ? DataState.Failed : DataState.Empty}
                  title={news.isError ? t('news.failedTitle') : t('news.noItemsTitle')}
                  text={news.isError ? t('home.newsFailed') : t('news.noItemsText')}
                  action={{ label: t('news.title'), to: '/$lang/news' }}
                />
              }
            />
          )}
        </section>
      ) : null}

      <p className="max-w-[80ch] border-t border-[var(--border)] pt-4 text-label-12 leading-relaxed text-[var(--faint)]">
        {t('guide.disclaimer')}
      </p>
    </article>
  );
}
