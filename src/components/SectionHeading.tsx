import type { ReactNode } from 'react';

interface SectionHeadingProps {
  /** Two to six words. One section, one idea. */
  title: string;
  /** One short sentence, when the heading alone would leave a question open. */
  subtitle?: string;
  /** At most one quiet action or link on the right. */
  actions?: ReactNode;
}

/**
 * The heading that starts a section. It is 20px, one step above the 16px of a
 * card title, so the page reads as sections rather than as a stack of cards.
 */
export function SectionHeading({ title, subtitle, actions }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2 className="text-heading-20">{title}</h2>
        {subtitle ? (
          <p className="mt-1 max-w-[68ch] text-copy-13 text-[var(--muted)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
