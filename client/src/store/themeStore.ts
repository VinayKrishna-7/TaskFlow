import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemDark = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyThemeToDOM = (theme: Theme): boolean => {
  if (typeof document === 'undefined') return false;
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  return isDark;
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const savedTheme = (typeof localStorage !== 'undefined' ? localStorage.getItem('taskflow_theme') : null) as Theme | null;
  const initialTheme: Theme = savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system' ? savedTheme : 'system';
  const initialIsDark = applyThemeToDOM(initialTheme);

  // Set up OS system theme change listener
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (get().theme === 'system') {
        const isDark = applyThemeToDOM('system');
        set({ isDark });
      }
    };
    try {
      mediaQuery.addEventListener('change', handleSystemChange);
    } catch {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemChange);
    }
  }

  return {
    theme: initialTheme,
    isDark: initialIsDark,
    setTheme: (theme: Theme) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('taskflow_theme', theme);
      }
      const isDark = applyThemeToDOM(theme);
      set({ theme, isDark });
    },
    toggleTheme: () => {
      const rootIsDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      const nextTheme: Theme = rootIsDark ? 'light' : 'dark';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('taskflow_theme', nextTheme);
      }
      const isDark = applyThemeToDOM(nextTheme);
      set({ theme: nextTheme, isDark });
    },
  };
});