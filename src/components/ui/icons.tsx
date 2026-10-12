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
