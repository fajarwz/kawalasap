import { useEffect, useRef, useState } from 'react';

const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A number that counts up to its value instead of appearing at it. The movement
 * is what tells the reader the panel just changed, so a figure that swaps while
 * they are looking at it does not go unnoticed.
 *
 * The animation is driven by `requestAnimationFrame` and the value is written
 * from the frame callback, never from the effect body. It also steps aside for
 * `prefers-reduced-motion`: motion is a courtesy here, not information, and the
 * number is the same either way.
 */
export function useCountUp(value: number | null, duration = 560): number | null {
  const [shown, setShown] = useState<number | null>(() =>
    REDUCED || value === null ? value : 0,
  );
  const fromRef = useRef(value ?? 0);

  useEffect(() => {
    if (REDUCED || value === null) {
      fromRef.current = value ?? 0;
      return;
    }
    const from = fromRef.current;
    const span = value - from;
    const start = performance.now();
    let frame = 0;
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setShown(from + span * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = value;
    };
  }, [value, duration]);

  if (REDUCED || value === null) return value;
  return shown;
}
