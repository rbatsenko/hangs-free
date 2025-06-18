import React from 'react';

import { render, fireEvent, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/contexts/ThemeContext';

import { ThemeSelector } from '../ThemeSelector';

// Mock the SegmentedControl
jest.mock('../SegmentedControl', () => ({
  SegmentedControl: ({ values, selectedIndex, onChange }: any) => {
    const MockedSegmentedControl = require('react-native').View;
    return (
      <MockedSegmentedControl testID="segmented-control">
        {values.map((value: string, index: number) => (
          <MockedSegmentedControl
            key={value}
            testID={`segment-${index}`}
            onPress={() => onChange(index)}
          >
            {value}
          </MockedSegmentedControl>
        ))}
      </MockedSegmentedControl>
    );
  },
}));

// Test wrapper with ThemeProvider
const ThemeSelectorWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeSelector', () => {
  it('renders without crashing', () => {
    render(
      <ThemeSelectorWrapper>
        <ThemeSelector />
      </ThemeSelectorWrapper>
    );

    const segmentedControl = screen.getByTestId('segmented-control');
    expect(segmentedControl).toBeTruthy();
  });

  it('displays all three theme options', () => {
    render(
      <ThemeSelectorWrapper>
        <ThemeSelector />
      </ThemeSelectorWrapper>
    );

    // Check all three segments exist
    expect(screen.getByTestId('segment-0')).toBeTruthy(); // System
    expect(screen.getByTestId('segment-1')).toBeTruthy(); // Light
    expect(screen.getByTestId('segment-2')).toBeTruthy(); // Dark
  });

  it('handles press events on segments', () => {
    render(
      <ThemeSelectorWrapper>
        <ThemeSelector />
      </ThemeSelectorWrapper>
    );

    // Test that segments can be pressed without errors
    expect(() => {
      fireEvent.press(screen.getByTestId('segment-0')); // System
      fireEvent.press(screen.getByTestId('segment-1')); // Light
      fireEvent.press(screen.getByTestId('segment-2')); // Dark
    }).not.toThrow();
  });

  it('integrates properly with ThemeProvider', () => {
    // Test that the component works when wrapped with ThemeProvider
    expect(() => {
      render(
        <ThemeSelectorWrapper>
          <ThemeSelector />
        </ThemeSelectorWrapper>
      );
    }).not.toThrow();
  });

  it('uses SegmentedControl component', () => {
    render(
      <ThemeSelectorWrapper>
        <ThemeSelector />
      </ThemeSelectorWrapper>
    );

    // Verify that the mocked SegmentedControl is rendered
    const segmentedControl = screen.getByTestId('segmented-control');
    expect(segmentedControl).toBeTruthy();
  });
}); 