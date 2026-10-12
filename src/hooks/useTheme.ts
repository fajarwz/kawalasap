import { useEffect, useState } from 'react';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
}
const STORAGE_KEY = 'kawalasap-theme';

function readTheme(): Theme {
  if (typeof window === 'undefined') return Theme.Dark;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === Theme.Light ? Theme.Light : Theme.Dark;
}

export function useTheme(): [Theme, (next: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}
