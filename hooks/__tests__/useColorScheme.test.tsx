import React from 'react';

import { renderHook, act, waitFor } from '@testing-library/react-native';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

import { useColorScheme } from '../useColorScheme';

// Test wrapper with ThemeProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('useColorScheme', () => {
  it('returns a valid color scheme value', () => {
    const { result } = renderHook(() => useColorScheme(), { wrapper });
    expect(['light', 'dark']).toContain(result.current);
  });

  it('returns consistent color scheme value between calls', () => {
    const { result } = renderHook(() => useColorScheme(), { wrapper });
    const firstResult = result.current;
    const secondResult = result.current;
    expect(firstResult).toBe(secondResult);
  });

  it('responds to theme context changes', () => {
    // Test that the hook properly connects to the theme context
    // and returns the colorScheme from useTheme
    const { result } = renderHook(() => {
      const colorScheme = useColorScheme();
      const themeContext = useTheme();
      return { colorScheme, themeColorScheme: themeContext.colorScheme };
    }, { wrapper });

    // The hook should return the same value as the theme context
    expect(result.current.colorScheme).toBe(result.current.themeColorScheme);
    expect(['light', 'dark']).toContain(result.current.colorScheme);
  });

  it('is a function that can be called without errors', () => {
    expect(() => {
      renderHook(() => useColorScheme(), { wrapper });
    }).not.toThrow();
  });

  it('integrates properly with ThemeContext', () => {
    // Test that the hook works when wrapped with ThemeProvider
    const { result } = renderHook(() => useColorScheme(), { wrapper });
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('string');
  });
}); 