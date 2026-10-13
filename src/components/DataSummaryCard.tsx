import { DATA_STATE_KEY, DataState } from '../lib/dataState.ts';
import { useT } from '../lib/i18n.ts';
import type { SiteArt } from '../lib/illustrations.ts';
import { SiteIllustration } from './illustrations.tsx';
import { PageLink, type SiteTarget } from './ui/PageLink.tsx';
import { SourceTimestamp } from './SourceTimestamp.tsx';
import { arrow } from './ui/styles.ts';

interface DataSummaryCardProps {
  /** Two or three words. What this number is about. */
  label: string;
  /** The value, already formatted. Null when there is no value to show. */
  value: string | null;
  /** The state to draw when there is no value. Defaults to "not connected". */
  state?: Exclude<DataState, DataState.Ready>;
  /** One supporting line: a window, a place, the coverage behind the number. */
  detail?: string;
  source?: { name: string; href?: string; time?: string | null; kind?: string };
  /** One action, at most. */
  link?: { label: string; to: SiteTarget };
  /** The subject of the card, drawn quietly at the top. It stays when the data fails. */
  art?: SiteArt;
}

/**
 * Label, value or state, one supporting line, at most one action. No mini chart,
 * no badge, no colour on the figure: colour in this product means a reading, and
 * a value that is not available says so in words.
 *
 * The drawing is the one ornament: it says what the card is about before the label is
 * read, in faint ink, so it never competes with the figure it sits above.
 */
export function DataSummaryCard({
  label,
  value,
  state = DataState.NotConnected,
  detail,
  source,
  link,
  art,
}: DataSummaryCardProps) {
  const t = useT();

  return (
    <section className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-micro uppercase text-[var(--faint)]">{label}</h3>
        {art ? (
          <SiteIllustration name={art} size={34} className="-mt-1 shrink-0 text-[var(--faint)]" />
        ) : null}
      </div>
      {value === null ? (
        <p className="mt-2 text-heading-16 text-[var(--muted)]">{t(DATA_STATE_KEY[state])}</p>
      ) : (
        <p className="num mt-2 text-heading-20">{value}</p>
      )}
      {detail ? (
        <p className="mt-1 text-label-12 leading-snug text-[var(--muted)]">{detail}</p>
      ) : null}
      <div className="mt-auto pt-3">
        {source ? (
          <SourceTimestamp
            name={source.name}
            href={source.href}
            time={source.time}
            kind={source.kind}
          />
        ) : null}
        {link ? (
          <PageLink
            to={link.to}
            className="mt-2 inline-block text-label-13 text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
          >
            {link.label} {arrow}
          </PageLink>
        ) : null}
      </div>
    </section>
  );
}
