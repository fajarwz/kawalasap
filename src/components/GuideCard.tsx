import { Link } from '@tanstack/react-router';
import type { GuideSlug } from '../lib/guide.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { GuideIllustration } from './illustrations.tsx';
import { arrow } from './ui/styles.ts';

interface GuideCardProps {
  slug: GuideSlug;
  title: string;
  /** One line. What the guide answers, not how good it is. */
  summary: string;
}

/**
 * A guide link: a drawing, the title, one line, and the whole card is the link.
 *
 * The drawing is what makes the row scannable — a reader looking for the mask guide
 * finds the mask before they read anything — so it sits first and stays quiet, in the
 * muted ink with one accent element from the drawing itself. No promotional tile and no
 * image file: it is inline SVG, so it costs no request and follows the theme.
 */
export function GuideCard({ slug, title, summary }: GuideCardProps) {
  const t = useT();
  const lang = useLang();
  return (
    <Link
      to="/$lang/guide/$guideSlug"
      params={{ lang, guideSlug: slug }}
      className="flex items-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--border-strong)]"
    >
      <GuideIllustration slug={slug} size={44} className="mt-0.5 shrink-0 text-[var(--muted)]" />
      <span className="min-w-0">
        <span className="block text-heading-16">{title}</span>
        <span className="mt-1 block text-copy-13 text-[var(--muted)]">{summary}</span>
        <span className="mt-2 inline-block text-micro text-[var(--faint)]">
          {t('guide.read')} {arrow}
        </span>
      </span>
    </Link>
  );
}
