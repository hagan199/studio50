import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    if (themeData.colors) {
      root.style.setProperty('--color-primary', themeData.colors.primary);
      root.style.setProperty('--color-primary-light', themeData.colors.primaryLight);
      root.style.setProperty('--color-secondary', themeData.colors.secondary);
      root.style.setProperty('--color-accent', themeData.colors.accent);
      root.style.setProperty('--color-bg', themeData.colors.background);
      root.style.setProperty('--color-bg-light', themeData.colors.backgroundLight);
      root.style.setProperty('--color-surface', themeData.colors.surface);
      root.style.setProperty('--color-text', themeData.colors.text);
      root.style.setProperty('--color-text-secondary', themeData.colors.textSecondary);
      root.style.setProperty('--color-text-dark', themeData.colors.textDark);
    }
    if (themeData.fonts) {
      root.style.setProperty('--font-heading', themeData.fonts.heading);
      root.style.setProperty('--font-body', themeData.fonts.body);
    }
  };

  useEffect(() => {
    api.get('/api/theme')
      .then((res) => {
        setTheme(res.data);
        applyTheme(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
