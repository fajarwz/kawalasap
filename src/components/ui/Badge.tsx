import type { ReactNode } from 'react';
import { contrastInk } from '../../lib/colour.ts';

/**
 * One badge, one standard. The severity colour is the fill and the ink on top is
 * chosen for contrast, so the label reads black on green and amber and white on the
 * deeper reds: never coloured text on a tinted background, which is the low-contrast
 * version of this. The air reading and our own risk score wear the same badge; the
 * label, the icon and the `InfoTip` beside it are what say which is which.
 *
 * A badge carries no `title`: a native tooltip is slow to appear and looks like the
 * browser rather than the site. When a badge needs explaining, the `InfoTip` that
 * sits beside it carries the words.
 */
interface BadgeProps {
  /** The severity colour: the fill. The ink on top is chosen for contrast. */
  colour: string;
  /** An `icons.tsx` glyph, drawn at 12px in the badge's own ink. */
  icon?: ReactNode;
  children: ReactNode;
}

export function Badge({ colour, icon, children }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 text-micro font-medium"
      style={{ background: colour, color: contrastInk(colour) }}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

export function Dot({ colour, size = 9 }: { colour: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: colour }}
    />
  );
}

export function PlainBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-micro text-[var(--muted)]">
      {children}
    </span>
  );
}
