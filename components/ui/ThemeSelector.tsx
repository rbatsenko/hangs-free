import React from 'react';

import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

import { SegmentedControl } from './SegmentedControl';

export function ThemeSelector() {
  const { themeMode, setThemeMode } = useTheme();

  const themeOptions: ThemeMode[] = ['system', 'light', 'dark'];
  const themeLabels = ['System', 'Light', 'Dark'];

  const selectedIndex = themeOptions.indexOf(themeMode);

  const handleThemeChange = (index: number) => {
    const selectedTheme = themeOptions[index];
    setThemeMode(selectedTheme);
  };

  return (
    <SegmentedControl
      values={themeLabels}
      selectedIndex={selectedIndex}
      onChange={handleThemeChange}
    />
  );
} 