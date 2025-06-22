import { useEffect, useState, useCallback } from "react";

import { Platform } from "react-native";
import { BleError, Device, ScanMode } from "react-native-ble-plx";

import { Buffer } from "buffer";

import { DeviceType } from "@/contexts/SelectedDeviceContext";
import { useWeightUnits } from "@/contexts/WeightUnitsContext";
import { WeightData, WeightDataPoint } from "@/types/weight";

import { useBLE } from "./useBLE";

const isAndroid = Platform.OS === "android";

// Constants
const DEVICE_NAME_PATTERN = "IF_B7"; // WH-C06 Bluetooth Scale
const MAX_DATA_POINTS = 1000; // Prevent memory leaks by limiting data points
const WEIGHT_DATA_BYTE_OFFSET = 12;

const getWeightData = (manufacturerData: string, targetUnit: string, convertWeight: (weight: number, fromUnit: string, toUnit: string) => number): WeightData | undefined => {
  try {
    const data = Array.from(Buffer.from(manufacturerData, "base64"));

    // Add validation for data length
    if (data.length < WEIGHT_DATA_BYTE_OFFSET + 2) {
      throw new Error("Invalid manufacturer data length");
    }

    // Convert two bytes to a 16-bit integer (big-endian)
    // The scale returns weight in kg
    const weightInKg =
      (data[WEIGHT_DATA_BYTE_OFFSET] * 256 +
        data[WEIGHT_DATA_BYTE_OFFSET + 1]) /
      100;

    // Validate weight is a reasonable number
    if (isNaN(weightInKg) || weightInKg < 0 || weightInKg > 1000) {
      throw new Error("Invalid weight value");
    }

    // Convert to target unit
    const weight = convertWeight(weightInKg, "kg", targetUnit);

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
