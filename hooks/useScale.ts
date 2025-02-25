import { useEffect, useState, useCallback } from "react";

import { Platform } from "react-native";
import { BleError, Device, ScanMode } from "react-native-ble-plx";

import { Buffer } from "buffer";

import { DeviceType } from "@/contexts/SelectedDeviceContext";
import { WeightData, WeightDataPoint } from "@/types/weight";

import { useBLE } from "./useBLE";

const isAndroid = Platform.OS === "android";

// Constants
const DEVICE_NAME_PATTERN = "IF_B7"; // WH-C06 Bluetooth Scale
const MAX_DATA_POINTS = 1000; // Prevent memory leaks by limiting data points
const WEIGHT_DATA_BYTE_OFFSET = 12;

const getWeightData = (manufacturerData: string): WeightData | undefined => {
  try {
    const data = Array.from(Buffer.from(manufacturerData, "base64"));

    // Add validation for data length
    if (data.length < WEIGHT_DATA_BYTE_OFFSET + 2) {
      throw new Error("Invalid manufacturer data length");
    }

    // Convert two bytes to a 16-bit integer (big-endian)
    const weight =
      (data[WEIGHT_DATA_BYTE_OFFSET] * 256 +
        data[WEIGHT_DATA_BYTE_OFFSET + 1]) /
      100;

    // Validate weight is a reasonable number
    if (isNaN(weight) || weight < 0 || weight > 1000) {
      throw new Error("Invalid weight value");
    }

    return { weight, unit: "kg" };
  } catch (e) {
    console.error("Error parsing weight data:", e);
    return undefined;
  }
};

const initialWeightData: WeightData = {
  weight: 0,
  unit: "kg",
};

export const useScale = ({
  selectedDevice,
}: {
  selectedDevice: DeviceType;
}) => {
  const [weightData, setWeightData] = useState<WeightData>(initialWeightData);
  const [weightDataPoints, setWeightDataPoints] = useState<WeightDataPoint[]>(
    []
  );
  const { bleManager, bleInitialized } = useBLE();

  const reset = useCallback(() => {
    setWeightData(initialWeightData);
    setWeightDataPoints([]);
  }, []);

  const scan = useCallback((error: BleError | null, device: Device | null) => {
    if (error) {
      console.error("Scan error:", error);
      return;
    }

    const manufacturerData = device?.manufacturerData;
    if (!manufacturerData || !device?.name?.includes(DEVICE_NAME_PATTERN)) {
      return;
    }

    const data = getWeightData(manufacturerData);
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
  }, []);

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
