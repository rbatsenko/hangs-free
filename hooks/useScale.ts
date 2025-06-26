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
const WEIGHT_OFFSET = 10; // Weight value starts here (2 bytes)
const STABLE_OFFSET = 14; // Unit and stable flag are here (1 byte)

// Unit mapping for WH-C06 scale
const DEVICE_UNIT_MAP: Record<number, WeightUnit> = {
  1: 'kg',
  2: 'lb',
  // Note: 3='st' (stone) and 4='jin' are not supported in our app yet
};

const getWeightData = (manufacturerData: string, targetUnit: WeightUnit, convertWeight: (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit) => number): WeightData | undefined => {
  try {
    const bytes = Array.from(Buffer.from(manufacturerData, "base64"));

    // Ensure manufacturer data is at least 15 bytes long
    if (bytes.length < 15) {
      throw new Error("Invalid manufacturer data length");
    }

    // Extract weight: 2 bytes starting at offset 10, big-endian, in 0.01kg units
    // According to WH-C06 protocol, weight data is ALWAYS transmitted in kg units
    const rawWeightInKg = ((bytes[WEIGHT_OFFSET] << 8) | bytes[WEIGHT_OFFSET + 1]) / 100;

    // Extract unit and stable flag from offset 14
    const unitByte = bytes[STABLE_OFFSET];
    const stableFlag = (unitByte & 0xf0) >> 4;
    const deviceUnitCode = unitByte & 0x0f;
    
    // Get device unit from mapping (this is what the device display shows, not the transmission unit)
    const deviceUnit = DEVICE_UNIT_MAP[deviceUnitCode];
    
    // Validate extracted values
    if (isNaN(rawWeightInKg) || rawWeightInKg < 0 || rawWeightInKg > 1000) {
      throw new Error("Invalid weight value");
    }
    
    if (!deviceUnit) {
      throw new Error(`Unsupported device unit code: ${deviceUnitCode}`);
    }

    // Convert weight from kg (transmission unit) to target unit
    // The device always transmits in kg, regardless of its display unit setting
    const weight = convertWeight(rawWeightInKg, 'kg', targetUnit);

    return { 
      weight, 
      unit: targetUnit,
      // Additional metadata that could be useful for debugging
      deviceUnit,
      stable: stableFlag > 0,
      rawWeight: rawWeightInKg 
    };
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
