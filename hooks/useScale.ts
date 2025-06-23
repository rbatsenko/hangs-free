import { useEffect, useState, useCallback } from "react";

import { Platform } from "react-native";
import { BleError, Device, ScanMode } from "react-native-ble-plx";

import { Buffer } from "buffer";

import { DeviceType } from "@/contexts/SelectedDeviceContext";
import { useWeightUnits, WeightUnit } from "@/contexts/WeightUnitsContext";
import { WeightData, WeightDataPoint } from "@/types/weight";

import { useBLE } from "./useBLE";

const isAndroid = Platform.OS === "android";

// Constants
const DEVICE_NAME_PATTERN = "IF_B7"; // WH-C06 Bluetooth Scale
const MAX_DATA_POINTS = 1000; // Prevent memory leaks by limiting data points
const WEIGHT_DATA_BYTE_OFFSET = 12;

const getWeightData = (manufacturerData: string, targetUnit: WeightUnit, convertWeight: (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit) => number): WeightData | undefined => {
  try {
    const data = Array.from(Buffer.from(manufacturerData, "base64"));

    // Add validation for data length
    if (data.length < WEIGHT_DATA_BYTE_OFFSET + 2) {
      throw new Error("Invalid manufacturer data length");
    }

    // Convert two bytes to a 16-bit integer (big-endian)
    const rawValue = (data[WEIGHT_DATA_BYTE_OFFSET] * 256 + data[WEIGHT_DATA_BYTE_OFFSET + 1]) / 100;

    // Validate raw value is reasonable
    if (isNaN(rawValue) || rawValue < 0 || rawValue > 1000) {
      throw new Error("Invalid weight value");
    }

    // Smart detection of device unit:
    // The WH-C06 scale can be configured to display in kg or lb.
    // When configured for lb, it appears to send the weight data in lb units directly,
    // rather than always in kg as initially assumed.
    // 
    // Heuristic approach:
    // - If app is set to lb and the raw value is in a reasonable range for human weight in lb (50-500)
    // - AND converting it as if it were kg would result in an unreasonably high value (>400 lb)
    // - Then assume the device is already sending lb data
    
    let deviceUnit: WeightUnit = "kg"; // Default assumption
    let weightInDeviceUnit = rawValue;
    
    if (targetUnit === "lb") {
      // If raw value is reasonable for lb (50-300 for most people)
      if (rawValue >= 50 && rawValue <= 300) {
        // Calculate what it would be if we treated it as kg and converted
        const ifTreatedAsKg = rawValue * 2.20462;
        
        // If treating as kg would result in >250 lb (heavy but reasonable as kg->lb conversion), 
        // but raw value itself is reasonable as lb, assume device is sending lb data directly
        if (ifTreatedAsKg > 250) {
          deviceUnit = "lb";
          weightInDeviceUnit = rawValue;
        }
      }
    }

    // Convert to target unit only if device unit differs from target
    const weight = convertWeight(weightInDeviceUnit, deviceUnit, targetUnit);

    return { weight, unit: targetUnit };
  } catch (e) {
    console.error("Error parsing weight data:", e);
    return undefined;
  }
};

export const useScale = ({
  selectedDevice,
}: {
  selectedDevice: DeviceType;
}) => {
  const { weightUnit, convertWeight } = useWeightUnits();
  const initialWeightData: WeightData = {
    weight: 0,
    unit: weightUnit,
  };
  
  const [weightData, setWeightData] = useState<WeightData>(initialWeightData);
  const [weightDataPoints, setWeightDataPoints] = useState<WeightDataPoint[]>(
    []
  );
  const { bleManager, bleInitialized } = useBLE();

  const reset = useCallback(() => {
    setWeightData({ weight: 0, unit: weightUnit });
    setWeightDataPoints([]);
  }, [weightUnit]);

  // Update weightData unit when weightUnit changes
  useEffect(() => {
    setWeightData(prev => ({ ...prev, unit: weightUnit }));
  }, [weightUnit]);

  const scan = useCallback((error: BleError | null, device: Device | null) => {
    if (error) {
      console.error("Scan error:", error);
      return;
    }

    const manufacturerData = device?.manufacturerData;
    if (!manufacturerData || !device?.name?.includes(DEVICE_NAME_PATTERN)) {
      return;
    }

    const data = getWeightData(manufacturerData, weightUnit, convertWeight);
    if (!data) return;

    setWeightData({
      unit: data.unit,
      weight: data.weight,
    });

    setWeightDataPoints((prev) => {
      const newPoints = [
        ...prev,
        { weight: data.weight, timestamp: Date.now() },
      ].slice(-MAX_DATA_POINTS); // Keep only the last MAX_DATA_POINTS
      return newPoints;
    });
  }, [weightUnit, convertWeight]);

  useEffect(() => {
    if (!bleInitialized) return;

    const scanOptions = isAndroid ? { scanMode: ScanMode.LowLatency } : null;
    if (selectedDevice === "whc06") {
      bleManager.startDeviceScan(null, scanOptions, scan);
    } else {
      bleManager.stopDeviceScan();
    }

    return () => {
      bleManager.stopDeviceScan();
    };
  }, [bleInitialized, bleManager, scan, selectedDevice]);

  return { weightData, weightDataPoints, reset };
};
