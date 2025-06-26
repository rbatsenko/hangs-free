import React from 'react';

import { useWeightUnits, WeightUnit } from '@/contexts/WeightUnitsContext';

import { SegmentedControl } from './SegmentedControl';

export function WeightUnitsSelector() {
  const { weightUnit, setWeightUnit } = useWeightUnits();

  const weightUnitOptions: WeightUnit[] = ['kg', 'lb'];
  const weightUnitLabels = ['Kilograms', 'Pounds'];

  const selectedIndex = weightUnitOptions.indexOf(weightUnit);

  const handleWeightUnitChange = (index: number) => {
    const selectedUnit = weightUnitOptions[index];
    setWeightUnit(selectedUnit);
  };

  return (
    <SegmentedControl
      values={weightUnitLabels}
      selectedIndex={selectedIndex}
      onChange={handleWeightUnitChange}
    />
  );
} 