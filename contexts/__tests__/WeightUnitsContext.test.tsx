import React from 'react';

import { renderHook, act } from '@testing-library/react-native';

import { WeightUnitsProvider, useWeightUnits } from '@/contexts/WeightUnitsContext';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
  })),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WeightUnitsProvider>{children}</WeightUnitsProvider>
);

describe('WeightUnitsContext', () => {
  it('initializes with default kg unit', () => {
    const { result } = renderHook(() => useWeightUnits(), { wrapper });

    expect(result.current.weightUnit).toBe('kg');
  });

  it('changes weight unit', () => {
    const { result } = renderHook(() => useWeightUnits(), { wrapper });

    act(() => {
      result.current.setWeightUnit('lb');
    });

    expect(result.current.weightUnit).toBe('lb');
  });

  it('converts kg to lb correctly', () => {
    const { result } = renderHook(() => useWeightUnits(), { wrapper });

    const converted = result.current.convertWeight(10, 'kg', 'lb');
    expect(converted).toBeCloseTo(22.0462, 3);
  });

  it('converts lb to kg correctly', () => {
    const { result } = renderHook(() => useWeightUnits(), { wrapper });

    const converted = result.current.convertWeight(22.0462, 'lb', 'kg');
    expect(converted).toBeCloseTo(10, 3);
  });

  it('returns same weight when converting to same unit', () => {
    const { result } = renderHook(() => useWeightUnits(), { wrapper });

    const converted = result.current.convertWeight(10, 'kg', 'kg');
    expect(converted).toBe(10);
  });

  it('formats weight correctly', () => {
    const { result } = renderHook(() => useWeightUnits(), { wrapper });

    expect(result.current.formatWeight(10.456)).toBe('10.5');
    expect(result.current.formatWeight(10)).toBe('10.0');
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useWeightUnits());
    }).toThrow('useWeightUnits must be used within a WeightUnitsProvider');
  });
}); 