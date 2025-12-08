import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'light',
    label: 'Yorug\'',
  },
  dark: {
    name: 'dark',
    label: 'Qorong\'i',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('pos-theme');
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    // Default to light (Odoo style)
    return 'light';
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('pos-theme', theme);

    // Apply data-theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', theme);

    // Apply Tailwind dark class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const saved = localStorage.getItem('pos-theme-manual');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    // Mark as manually set
    localStorage.setItem('pos-theme-manual', 'true');
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeManually = (newTheme) => {
    localStorage.setItem('pos-theme-manual', 'true');
    setTheme(newTheme);
  };

  const currentTheme = themes[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeManually,
        toggleTheme,
        currentTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
