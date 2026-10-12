import type { ReactNode } from 'react';
import { BadgeVariant, contrastInk } from '../../lib/colour.ts';

/**
 * Two kinds of number wear a badge and they must never look alike: a value read
 * from a source gets the solid fill, a value we computed ourselves gets the
 * outline. The province risk band is our own heuristic and it sits a line away from
 * a modelled air reading, so filling both meant an amber "Sedang" and an amber
 * "Sedang" that meant different things.
 */
interface BadgeProps {
  /**
   * The severity colour. Solid, it becomes the fill and the ink on top is chosen
   * for contrast, so the wording is never coloured text on a coloured tint.
   * Outlined, it becomes the border and the glyph only.
   */
  colour: string;
  /** An `icons.tsx` glyph, drawn at 12px in whichever ink the variant earned. */
  icon?: ReactNode;
  children: ReactNode;
  title?: string;
  variant?: BadgeVariant;
}

export function Badge({
  colour,
  icon,
  children,
  title,
  variant = BadgeVariant.Solid,
}: BadgeProps) {
  const outlined = variant === BadgeVariant.Outlined;
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full text-micro font-medium ${
        outlined ? 'px-2 py-0.5' : 'px-1.5 py-0.5'
      }`}
      style={
        outlined
          ? { border: `1px solid ${colour}`, background: 'transparent', color: 'var(--text)' }
          : { background: colour, color: contrastInk(colour) }
      }
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0"
          style={outlined ? { color: colour } : undefined}
        >
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
