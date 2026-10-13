/**
 * Ink for a solid fill.
 *
 * Severity is carried by a coloured fill, and the text on top of it has to stay
 * readable whatever colour that is: dark ink on yellow or green, white ink on
 * deep red or purple. The choice is made with the WCAG contrast ratio rather
 * than a fixed brightness cut, so it holds for any colour a palette adds later.
 */

export const INK_DARK = '#0b0f14';
export const INK_LIGHT = '#ffffff';

/** 0 to 255 per channel, or null when the value is not a colour we can read. */
function channels(value: string): [number, number, number] | null {
  const colour = value.trim();
  if (colour.startsWith('#')) {
    const hex = colour.slice(1);
    if (hex.length === 3 || hex.length === 6) {
      const full =
        hex.length === 3
          ? hex
              .split('')
              .map((character) => character + character)
              .join('')
          : hex;
      if (!/^[0-9a-f]{6}$/i.test(full)) return null;
      return [
        Number.parseInt(full.slice(0, 2), 16),
        Number.parseInt(full.slice(2, 4), 16),
        Number.parseInt(full.slice(4, 6), 16),
      ];
    }
    return null;
  }
  const match = colour.match(/^rgba?\(([^)]+)\)$/i);
  if (!match) return null;
  const parts = match[1].split(/[,/\s]+/).filter(Boolean).slice(0, 3).map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
  return [parts[0], parts[1], parts[2]];
}

/** WCAG relative luminance. */
function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Dark or light ink for this background.
 *
 * The convention comes first: a light fill (green, amber) takes dark ink, a dark
 * fill (deep orange, red, purple) takes white ink. The WCAG contrast ratio is
 * the safety net underneath: if the conventional choice cannot be read at small
 * sizes (under 4.5:1), the other ink wins.
 */
const LIGHT_BACKGROUND = 0.4;
const MIN_RATIO = 4.5;

export function contrastInk(background: string): string {
  const parsed = channels(background);
  if (!parsed) return INK_LIGHT;
  const backgroundLuminance = luminance(parsed);
  const options = [
    { ink: INK_DARK, ratio: ratio(backgroundLuminance, luminance(channels(INK_DARK) ?? [11, 15, 20])) },
    { ink: INK_LIGHT, ratio: ratio(backgroundLuminance, 1) },
  ];
  const preferred = backgroundLuminance > LIGHT_BACKGROUND ? INK_DARK : INK_LIGHT;
  const chosen = options.find((option) => option.ink === preferred) ?? options[1];
  if (chosen.ratio >= MIN_RATIO) return chosen.ink;
  const fallback = options.find((option) => option.ink !== preferred) ?? options[1];
  return fallback.ink;
}
