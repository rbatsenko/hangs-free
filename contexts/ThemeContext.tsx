import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

import { useColorScheme as useSystemColorScheme, Appearance } from 'react-native';
import { MMKV } from 'react-native-mmkv';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_mode';

// Create MMKV storage instance
const storage = new MMKV();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const isMounted = useRef(false);

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Save theme mode to storage whenever it changes
  useEffect(() => {
    if (isMounted.current) {
      saveThemeMode(themeMode);
    } else {
      isMounted.current = true;
    }
  }, [themeMode]);

  // Sync system appearance when manually changing themes (for better consistency)
  useEffect(() => {
    if (themeMode !== 'system') {
      // When manually setting light/dark mode, update system appearance to match
      // This helps with status bar, keyboard, and other system UI elements
      try {
        Appearance.setColorScheme(themeMode === 'dark' ? 'dark' : 'light');
      } catch (error) {
        // Appearance.setColorScheme might not be available on all platforms
        console.log('Could not sync system appearance:', error);
      }
    } else {
      // When switching back to 'system', reset appearance to follow system setting
      try {
        Appearance.setColorScheme(null); // null means follow system setting
      } catch (error) {
        console.log('Could not reset system appearance:', error);
      }
    }
  }, [themeMode]);

  const loadThemeMode = () => {
    try {
      const savedMode = storage.getString(THEME_STORAGE_KEY);
      if (savedMode && ['system', 'light', 'dark'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  };

  const saveThemeMode = (mode: ThemeMode) => {
    try {
      storage.set(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  // Determine the actual color scheme based on theme mode and system preference
  const colorScheme: ColorScheme = 
    themeMode === 'system' 
      ? (systemColorScheme ?? 'light')
      : themeMode === 'dark' 
        ? 'dark' 
        : 'light';

  return (
    <ThemeContext.Provider value={{ themeMode, colorScheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 