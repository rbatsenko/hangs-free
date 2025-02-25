import { useCallback, useState } from "react";

import { Device } from "react-native-ble-plx";

import { Buffer } from "buffer";

import { WeightData, WeightDataPoint } from "@/types/weight";

import { useBLE } from "./useBLE";

const PROGRESSOR_SERVICE_UUID = "7e4e1701-1ea6-40c9-9dcc-13d34ffead57";
const PROGRESSOR_CONTROL_CHAR_UUID = "7e4e1703-1ea6-40c9-9dcc-13d34ffead57";
const PROGRESSOR_DATA_CHAR_UUID = "7e4e1702-1ea6-40c9-9dcc-13d34ffead57";

const COMMAND_TARE = Buffer.from([0x64, 0x00]).toString("base64");
const COMMAND_START = Buffer.from([0x65, 0x00]).toString("base64");
const COMMAND_STOP = Buffer.from([0x66, 0x00]).toString("base64");
// const COMMAND_SHUTDOWN = Buffer.from([0x6e, 0x00]).toString("base64");
// const COMMAND_BATTERY = Buffer.from([0x6f, 0x00]).toString("base64");

export const useTindeq = () => {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weightData, setWeightData] = useState<WeightData>({
    weight: 0,
    unit: "kg",
  });
  const [weightDataPoints, setWeightDataPoints] = useState<WeightDataPoint[]>(
    []
  );
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { bleManager } = useBLE();

  const reset = useCallback(() => {
    setWeightData({ weight: 0, unit: "kg" });
    setWeightDataPoints([]);
  }, []);

  const setupDeviceMonitoring = useCallback((discoveredDevice: Device) => {
    setIsMonitoring(false);

    discoveredDevice.monitorCharacteristicForService(
      PROGRESSOR_SERVICE_UUID,
      PROGRESSOR_DATA_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          setIsMonitoring(false);
          setError("Lost connection to device");
          setIsLoading(false);
          return;
        }

        if (!characteristic?.value) return;

        const buffer = Buffer.from(characteristic.value, "base64");
        const tag = buffer[0];

        if (tag === 0x01) {
          try {
            const weightInKg = Math.round(buffer.readFloatLE(2) * 100) / 100;
            const timestamp = Date.now();

            if (weightInKg >= 0 && weightInKg < 300) {
              setWeightData({ weight: weightInKg, unit: "kg" });
              setWeightDataPoints((prev) => [
                ...prev,
                { weight: weightInKg, timestamp },
              ]);
            }
          } catch (e) {
            console.error("Error parsing weight data:", e);
          }
        }
      }
    );

    discoveredDevice
      .writeCharacteristicWithResponseForService(
        PROGRESSOR_SERVICE_UUID,
        PROGRESSOR_CONTROL_CHAR_UUID,
        COMMAND_START
      )
      .then(() => {
        setIsMonitoring(true);
        setIsLoading(false);
      })
      .catch((e) => {
        setError("Failed to start measurement");
        setIsLoading(false);
      });
  }, []);

  const connect = useCallback(
    async (deviceId: string) => {
      try {
        const connectedDevice = await bleManager.connectToDevice(deviceId);
        setConnectedDevice(connectedDevice);
        await connectedDevice.discoverAllServicesAndCharacteristics();
        setupDeviceMonitoring(connectedDevice);
      } catch (e) {
        console.error("Connection failed:", e);
        setError("Failed to connect to Tindeq");
        setIsLoading(false);
      }
    },
    [bleManager, setupDeviceMonitoring]
  );

  const stopScanning = useCallback(() => {
    bleManager.stopDeviceScan();
    setIsLoading(false);
    setConnectedDevice(null);
  }, [bleManager]);

  const startScan = useCallback(() => {
    bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        setError("Failed to scan for devices");
        setIsLoading(false);
        return;
      }

      if (scannedDevice?.name === "Progressor_2068") {
        bleManager.stopDeviceScan();
        connect(scannedDevice.id);
      }
    });
  }, [bleManager, connect]);

  const scanAndConnect = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setIsMonitoring(false);
    startScan();
  }, [startScan]);

  const tare = useCallback(async () => {
    if (!connectedDevice) return;
    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        PROGRESSOR_SERVICE_UUID,
        PROGRESSOR_CONTROL_CHAR_UUID,
        COMMAND_TARE
      );
    } catch (e) {
      console.error("Failed to tare:", e);
    }
  }, [connectedDevice]);

  const stopMonitoring = useCallback(() => {
    connectedDevice
      ?.writeCharacteristicWithResponseForService(
        PROGRESSOR_SERVICE_UUID,
        PROGRESSOR_CONTROL_CHAR_UUID,
        COMMAND_STOP
      )
      .then(() => {
        setIsMonitoring(false);
        setIsLoading(false);
      });
    setConnectedDevice(null);
  }, [connectedDevice]);

  return {
    weightData,
    weightDataPoints,
    scanAndConnect,
    stopScanning,
    stopMonitoring,
    tare,
    reset,
    isConnected: !!connectedDevice,
    isMonitoring,
    error,
    isLoading,
  };
};
