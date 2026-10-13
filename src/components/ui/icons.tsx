import type { AqiTone } from '../../lib/aqi.ts';
import type { RiskBand } from '../../lib/risk.ts';

/**
 * Severity glyphs for badges, drawn in `currentColor` only so they read on any
 * fill the badge puts behind them. No icon font, no dependency: five glyphs on
 * one ladder, and both scales map onto it.
 */
const FRAME = {
  width: 12,
  height: 12,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function IconCheck() {
  return (
    <svg {...FRAME}>
      <path d="M3.2 8.6l3.1 3.1L12.8 4.9" />
    </svg>
  );
}

export function IconBars() {
  return (
    <svg {...FRAME}>
      <path d="M3.5 6.2h9M3.5 9.8h9" />
    </svg>
  );
}

export function IconTriangle() {
  return (
    <svg {...FRAME} strokeWidth={1.4}>
      <path d="M8 2.4 14.4 13.6H1.6z" />
      <path d="M8 6.4v3.1" />
      <circle cx="8" cy="11.6" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconOctagon() {
  return (
    <svg {...FRAME} strokeWidth={1.4}>
      <path d="M5.6 2h4.8L14 5.6v4.8L10.4 14H5.6L2 10.4V5.6z" />
      <path d="M8 5.6v3.2" />
      <circle cx="8" cy="11" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBurst() {
  return (
    <svg {...FRAME} strokeWidth={1.4}>
      <path d="M8 2 9.6 5.2 13 4.1 11.9 7.4 15 9l-3.1 1.6L13 13.9 9.6 12.8 8 16l-1.6-3.2L3 13.9l1.1-3.3L1 9l3.1-1.6L3 4.1l3.4 1.1z" />
    </svg>
  );
}

export function IconUnknown() {
  return (
    <svg {...FRAME}>
      <path d="M4 8h8" />
    </svg>
  );
}

/**
 * The GitHub mark, filled rather than stroked because that is what the mark is.
 * It sits in the header beside the theme switch, so it takes the size of the
 * control it lives in rather than the 12px of a badge glyph.
 */
export function GitHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** AQI categories and risk bands share one severity ladder. */
export function AqiIcon({ tone }: { tone: AqiTone }) {
  switch (tone) {
    case 'good':
      return <IconCheck />;
    case 'moderate':
      return <IconBars />;
    case 'sensitive':
    case 'unhealthy':
      return <IconTriangle />;
    case 'very-unhealthy':
      return <IconOctagon />;
    case 'hazardous':
      return <IconBurst />;
  }
}

export function BandIcon({ band }: { band: RiskBand }) {
  switch (band) {
    case 'low':
      return <IconCheck />;
    case 'moderate':
      return <IconBars />;
    case 'high':
      return <IconTriangle />;
    case 'very-high':
      return <IconOctagon />;
  }
}
