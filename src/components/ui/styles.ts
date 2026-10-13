/**
 * The shared field and control styles.
 *
 * One place, so the select on the Explore toolbar and the select on a region
 * page cannot drift apart, and a change to the border token reaches both.
 */
export const selectClass =
  'rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1.5 text-label-13 text-[var(--text)] outline-none focus:border-[var(--accent)]';

export const inputClass =
  'w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1.5 text-label-13 text-[var(--text)] outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]';

export const labelClass = 'flex flex-col gap-1 text-micro uppercase text-[var(--faint)]';

export const ghostButtonClass =
  'rounded-md px-3 py-1.5 text-label-13 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]';

export const outlineButtonClass =
  'rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-label-13 hover:border-[var(--accent)]';

export const linkClass =
  'underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]';

/** The arrow that ends an action line. Decorative: the text carries the meaning. */
export const arrow = '→';

/** One centred column, the same width on every page. */
export const containerClass = 'mx-auto w-full max-w-[1400px] px-4 sm:px-6';
