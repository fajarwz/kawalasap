/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Variable', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono Variable', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      /**
       * The Geist type scale, trimmed to the sizes this dashboard uses.
       * Headings are 600 weight with tight tracking; labels and copy stay at 400.
       * Prefer these over ad hoc `text-[13px]` values.
       */
      fontSize: {
        'heading-32': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-24': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-20': ['20px', { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-16': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'copy-14': ['14px', { lineHeight: '22px' }],
        'copy-13': ['13px', { lineHeight: '20px' }],
        'label-14': ['14px', { lineHeight: '20px' }],
        'label-13': ['13px', { lineHeight: '16px' }],
        'label-12': ['12px', { lineHeight: '16px' }],
        micro: ['11px', { lineHeight: '16px', letterSpacing: '0.04em' }],
      },
      /** Geist materials: small radii on purpose. Nothing is a pill except badges. */
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
      },
      /**
       * Motion is small and short: a panel arriving, a bar growing. Nothing
       * bounces. `index.css` turns all of it off under prefers-reduced-motion,
       * and any number that animates must still read correctly standing still.
       */
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'rise-in': 'rise-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 220ms ease-out both',
      },
    },
  },
  plugins: [],
};
