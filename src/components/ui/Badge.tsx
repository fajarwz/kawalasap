import type { ReactNode } from 'react';
import { contrastInk } from '../../lib/colour.ts';

interface BadgeProps {
  /**
   * The severity colour. It becomes the fill, and the ink on top is chosen for
   * contrast, so the wording is never coloured text on a coloured tint.
   */
  colour: string;
  /** An `icons.tsx` glyph, drawn at 12px in whichever ink the fill earned. */
  icon?: ReactNode;
  children: ReactNode;
  title?: string;
}

export function Badge({ colour, icon, children, title }: BadgeProps) {
  return (
    <span
      title={title}
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
