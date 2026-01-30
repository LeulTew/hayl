import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('hayl-theme');
    return (saved as Theme) || 'system';
  });

  const applyTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme !== 'system') {
      root.classList.add(newTheme);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('hayl-theme', newTheme);
  }, []);

  return { theme, setTheme };
}
