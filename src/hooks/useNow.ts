import { useEffect, useState } from 'react';

/** A ticking clock, so "12 min ago" labels stay true without a reload. */
export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}
