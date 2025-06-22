import React from 'react';

import { render, fireEvent, screen } from '@testing-library/react-native';

import { WeightUnitsSelector } from '@/components/ui/WeightUnitsSelector';

// Mock the context
const mockSetWeightUnit = jest.fn();
jest.mock('@/contexts/WeightUnitsContext', () => ({
  useWeightUnits: () => ({
    weightUnit: 'kg',
    setWeightUnit: mockSetWeightUnit,
  }),
}));

// Mock SegmentedControl
jest.mock('@/components/ui/SegmentedControl', () => ({
  SegmentedControl: ({ values, selectedIndex, onChange }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View>
        {values.map((value: string, index: number) => (
          <Pressable
            key={value}
            testID={`segment-${index}`}
            onPress={() => onChange(index)}
          >
            <Text>{value}</Text>
          </Pressable>
        ))}
      </View>
    );
  },
}));

describe('WeightUnitsSelector', () => {
  beforeEach(() => {
    mockSetWeightUnit.mockClear();
  });

  it('renders with correct labels', () => {
    render(<WeightUnitsSelector />);
    
    expect(screen.getByText('Kilograms')).toBeTruthy();
    expect(screen.getByText('Pounds')).toBeTruthy();
  });

  it('calls setWeightUnit when selection changes to pounds', () => {
    render(<WeightUnitsSelector />);
    
    fireEvent.press(screen.getByTestId('segment-1'));
    
    expect(mockSetWeightUnit).toHaveBeenCalledWith('lb');
  });

  it('calls setWeightUnit when selection changes to kilograms', () => {
    render(<WeightUnitsSelector />);
    
    fireEvent.press(screen.getByTestId('segment-0'));
    
    expect(mockSetWeightUnit).toHaveBeenCalledWith('kg');
  });
}); 