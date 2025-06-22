import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

import { MMKV } from 'react-native-mmkv';

export type WeightUnit = 'kg' | 'lb';

interface WeightUnitsContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  convertWeight: (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit) => number;
  formatWeight: (weight: number) => string;
}

const WeightUnitsContext = createContext<WeightUnitsContextType | undefined>(undefined);

const WEIGHT_UNIT_STORAGE_KEY = 'weight_unit';

// Create MMKV storage instance
const storage = new MMKV();

// Conversion constants
const KG_TO_LB = 2.20462;
const LB_TO_KG = 1 / KG_TO_LB;

/**
 * WeightUnitsProvider component that manages weight unit preferences
 * 
 * Features:
 * - Supports 'kg' and 'lb' weight units
 * - Persists unit preference using MMKV storage
 * - Provides weight conversion utilities
 * - Formats weights with appropriate precision
 */
export function WeightUnitsProvider({ children }: { children: React.ReactNode }) {
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg');
  const isMounted = useRef(false);

  // Load saved weight unit preference on app start
  useEffect(() => {
    loadWeightUnit();
  }, []);

  // Save weight unit to storage whenever it changes
  useEffect(() => {
    if (isMounted.current) {
      saveWeightUnit(weightUnit);
    } else {
      isMounted.current = true;
    }
  }, [weightUnit]);

  const loadWeightUnit = () => {
    try {
      const savedUnit = storage.getString(WEIGHT_UNIT_STORAGE_KEY);
      if (savedUnit && ['kg', 'lb'].includes(savedUnit)) {
        setWeightUnitState(savedUnit as WeightUnit);
      }
    } catch (error) {
      console.error('Error loading weight unit:', error);
    }
  };

  const saveWeightUnit = (unit: WeightUnit) => {
    try {
      storage.set(WEIGHT_UNIT_STORAGE_KEY, unit);
    } catch (error) {
      console.error('Error saving weight unit:', error);
    }
  };

  const setWeightUnit = (unit: WeightUnit) => {
    setWeightUnitState(unit);
  };

  const convertWeight = (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
    if (fromUnit === toUnit) {
      return weight;
    }
    
    if (fromUnit === 'kg' && toUnit === 'lb') {
      return weight * KG_TO_LB;
    }
    
    if (fromUnit === 'lb' && toUnit === 'kg') {
      return weight * LB_TO_KG;
    }
    
    return weight;
  };

  const formatWeight = (weight: number): string => {
    // Round to 1 decimal place for display
    return weight.toFixed(1);
  };

  const value = {
    weightUnit,
    setWeightUnit,
    convertWeight,
    formatWeight,
  };

  return (
    <WeightUnitsContext.Provider value={value}>
      {children}
    </WeightUnitsContext.Provider>
  );
}

export function useWeightUnits() {
  const context = useContext(WeightUnitsContext);
  if (context === undefined) {
    throw new Error('useWeightUnits must be used within a WeightUnitsProvider');
  }
  return context;
} 