import type { ReactElement } from 'react';
import { GuideSlug } from '../lib/guide.ts';
import { SiteArt } from '../lib/illustrations.ts';

/**
 * One line drawing per guide, so a card carries a picture as well as a sentence.
 *
 * The rules are the design system's, not an illustrator's: a 64×64 box, a 1.5 stroke,
 * `currentColor` only, and exactly one accent element per drawing — the thing the guide
 * is about, so the eye lands on the subject before the words. Nothing here names a
 * colour, so the same drawing works in either theme, and `aria-hidden` keeps a decorative
 * picture out of the accessible name of the card that wraps it.
 *
 * They are meant to read at 40-56px beside a heading, which is why each one is a few
 * strokes rather than a scene: a shape that only resolves at 200px is clutter at this size.
 */
const FRAME = {
  width: 64,
  height: 64,
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

/** The single accent element in each drawing: the subject, not the decoration. */
const ACCENT = 'text-[var(--accent)]';

/** Somewhere to walk, drawn as ticks so it does not compete with the figure. */
const GROUND = 'M10 52h44';

function Outdoor() {
  return (
    <>
      <circle className={ACCENT} cx="47" cy="15" r="5" />
      <circle cx="24" cy="14" r="4.5" />
      <path d="M24 19v14" />
      <path d="M24 23l-6 7" />
      <path d="M24 23l7 6" />
      <path d="M24 33l7 16" />
      <path d="M24 33l-7 11-1 5" />
      <path d={GROUND} strokeDasharray="2 4" />
    </>
  );
}

function Masks() {
  return (
    <>
      <circle cx="32" cy="30" r="16" />
      <path d="M20 32h24v4c0 7-5 12-12 12s-12-5-12-12z" className={ACCENT} />
      <path d="M20 32 16 29M44 32 48 29" />
      <circle cx="26" cy="26" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="38" cy="26" r="1.3" fill="currentColor" stroke="none" />
    </>
  );
}

function Indoor() {
  return (
    <>
      <path d="M11 29 32 14l21 15" />
      <path d="M16 27v26h32V27" />
      <rect className={ACCENT} x="26" y="33" width="12" height="10" rx="1" />
      <path d="M21 48q4-3 8 0t8 0" />
      <path d="M10 56h44" strokeDasharray="2 4" />
    </>
  );
}

function Children() {
  return (
    <>
      <circle cx="22" cy="15" r="4.5" />
      <path d="M22 20v16M22 24l-6 8M22 24l6 8M22 36l-5 14M22 36l5 14" />
      <g className={ACCENT}>
        <circle cx="43" cy="27" r="3.6" />
        <path d="M43 31v10M43 34l-5 6M43 34l5 6M43 41l-4 9M43 41l4 9" />
      </g>
      <path d={GROUND} strokeDasharray="2 4" />
    </>
  );
}

function Symptoms() {
  return (
    <>
      <path d="M32 10v11M32 21l-7 6M32 21l7 6" />
      <path
        className={ACCENT}
        d="M25 27c-6 1-9 6-9 12v7c0 4 2.5 6.5 6 6.5 3 0 5-2.5 5-6.5V27z"
      />
      <path
        className={ACCENT}
        d="M39 27c6 1 9 6 9 12v7c0 4-2.5 6.5-6 6.5-3 0-5-2.5-5-6.5V27z"
      />
    </>
  );
}

function Data() {
  return (
    <>
      <path d="M13 10v42h42" />
      <path d="M13 40l10-8 9 4 10-13 11 5" />
      <circle className={ACCENT} cx="42" cy="23" r="2.8" fill="currentColor" stroke="none" />
      <path d="M15 31h38" strokeDasharray="2 4" />
    </>
  );
}

const DRAWINGS: Record<GuideSlug, () => ReactElement> = {
  [GuideSlug.Outdoor]: Outdoor,
  [GuideSlug.Masks]: Masks,
  [GuideSlug.Indoor]: Indoor,
  [GuideSlug.Children]: Children,
  [GuideSlug.Symptoms]: Symptoms,
  [GuideSlug.Data]: Data,
};

/**
 * The rest of the site's drawings. A guide gets one because its slug is an option the
 * site offers; a panel gets one because the panel has a subject, and the two registries
 * stay separate so adding a drawing for a panel can never leave a guide without one.
 *
 * Add a member to `SiteArt` and draw it here, and keep to the same rules: a few strokes,
 * `currentColor`, one accent element, legible at 34-104px.
 */
function Thermal() {
  return (
    <>
      <circle cx="12" cy="14" r="2.6" />
      <circle cx="32" cy="14" r="2.6" />
      <circle cx="52" cy="14" r="2.6" />
      <circle cx="12" cy="32" r="2.6" />
      <circle cx="58" cy="32" r="2.6" />
      <circle cx="32" cy="32" r="5" className={ACCENT} />
      <circle cx="12" cy="50" r="2.6" />
      <circle cx="32" cy="50" r="2.6" />
      <circle cx="52" cy="50" r="2.6" />
      <rect x="6" y="6" width="52" height="52" rx="3" strokeDasharray="2 4" />
    </>
  );
}

function Air() {
  return (
    <>
      <path d="M8 20h30a6 6 0 1 0-6-6" />
      <path d="M8 32h36a6 6 0 1 1-6 6" />
      <path d="M8 44h18" />
      <circle className={ACCENT} cx="50" cy="44" r="3.2" />
    </>
  );
}

function Report() {
  return (
    <>
      <path d="M14 10h26l10 10v34H14z" />
      <path d="M40 10v10h10" />
      <path className={ACCENT} d="M22 26h18" />
      <path d="M22 34h20M22 40h20M22 46h12" />
    </>
  );
}

const SITE_DRAWINGS: Record<SiteArt, () => ReactElement> = {
  [SiteArt.Thermal]: Thermal,
  [SiteArt.Air]: Air,
  [SiteArt.Report]: Report,
};

/** A drawing for a panel or a section. Decorative, so it stays out of the a11y tree. */
export function SiteIllustration({
  name,
  size = 34,
  className = '',
}: {
  name: SiteArt;
  size?: number;
  className?: string;
}) {
  const Drawing = SITE_DRAWINGS[name];
  if (!Drawing) return null;
  return (
    <svg {...FRAME} width={size} height={size} className={className}>
      <Drawing />
    </svg>
  );
}

export function GuideIllustration({
  slug,
  size = 64,
  className = '',
}: {
  slug: GuideSlug;
  size?: number;
  className?: string;
}) {
  const Drawing = DRAWINGS[slug];
  if (!Drawing) return null;
  return (
    <svg {...FRAME} width={size} height={size} className={className}>
      <Drawing />
    </svg>
  );
}
