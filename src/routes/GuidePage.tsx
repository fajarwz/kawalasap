import { Link } from '@tanstack/react-router';
import { GuideCard } from '../components/GuideCard.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { GUIDES, GuideSlug } from '../lib/guide.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { linkClass } from '../components/ui/styles.ts';

/**
 * The guide index: one line per question, no categories invented to fill space,
 * and no search box, because a search that searches nothing is worse than none.
 */
export function GuidePage() {
  const t = useT();
  const lang = useLang();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-heading-24">{t('guide.title')}</h1>
        <p className="mt-1 max-w-[68ch] text-copy-13 text-[var(--muted)]">{t('guide.subtitle')}</p>
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
        <h2 className="text-heading-16">{t('guide.featuredTitle')}</h2>
        <p className="mt-1 max-w-[68ch] text-copy-13 text-[var(--muted)]">
          {t('guide.featuredText')}
        </p>
        <Link
          to="/$lang/guide/$guideSlug"
          params={{ lang, guideSlug: GuideSlug.Data }}
          className={`mt-3 inline-block text-label-13 text-[var(--text)] ${linkClass}`}
        >
          {t('guide.featuredLink')}
        </Link>
      </section>

      <section>
        <SectionHeading title={t('guide.indexTitle')} />
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <GuideCard
              key={guide.slug}
              slug={guide.slug}
              title={t(guide.titleKey)}
              summary={t(guide.summaryKey)}
            />
          ))}
        </div>
      </section>

      <p className="max-w-[80ch] border-t border-[var(--border)] pt-4 text-label-12 leading-relaxed text-[var(--faint)]">
        {t('guide.disclaimer')}
      </p>
    </div>
  );
}
