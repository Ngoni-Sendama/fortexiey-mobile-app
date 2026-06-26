import { createContext, useContext, useState, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  colorScheme: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  colorScheme: 'light',
  toggle: () => {},
});

export function ThemeProvider({ children, systemScheme }: { children: ReactNode; systemScheme: 'light' | 'dark' }) {
  const [mode, setMode] = useState<ThemeMode>('system');

  const colorScheme = mode === 'system' ? systemScheme : mode;

  const toggle = () => {
    setMode((prev) => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, colorScheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
