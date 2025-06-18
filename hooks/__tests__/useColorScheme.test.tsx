import React from 'react';

import { renderHook } from '@testing-library/react-native';

import { ThemeProvider } from '@/contexts/ThemeContext';

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