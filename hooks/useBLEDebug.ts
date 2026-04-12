import { useCallback, useEffect, useRef, useState } from "react";

import { Platform } from "react-native";
import { BleError, Device, ScanMode } from "react-native-ble-plx";

import { Buffer } from "buffer";

import { useBLE } from "./useBLE";

const isAndroid = Platform.OS === "android";
const MAX_LOG_ENTRIES = 200;
const SWEEP_MAX_OFFSET = 20;

export type DebugAdvertisement = {
  id: string;
  name: string | null;
  localName: string | null;
  rssi: number | null;
  manufacturerDataB64: string | null;
  manufacturerDataHex: string | null;
  manufacturerDataBytes: number[] | null;
  serviceUUIDs: string[] | null;
  firstSeen: number;
  lastSeen: number;
  seenCount: number;
};

export type DebugLogEntry = {
  timestamp: number;
  level: "info" | "error";
  message: string;
};

export type OffsetCandidate = {
  offset: number;
  endianness: "big" | "little";
  divisor: number;
  value: number;
};

const toHex = (bytes: number[]): string =>
  bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");

export const computeOffsetSweep = (bytes: number[]): OffsetCandidate[] => {
  const candidates: OffsetCandidate[] = [];
  const divisors = [10, 100];
  const maxOffset = Math.min(SWEEP_MAX_OFFSET, bytes.length - 2);

  for (let offset = 0; offset <= maxOffset; offset++) {
    const b0 = bytes[offset];
    const b1 = bytes[offset + 1];
    const big = b0 * 256 + b1;
    const little = b1 * 256 + b0;

    for (const divisor of divisors) {
      const bigVal = big / divisor;
      if (bigVal > 0 && bigVal <= 500) {
        candidates.push({ offset, endianness: "big", divisor, value: bigVal });
      }
      const littleVal = little / divisor;
      if (littleVal > 0 && littleVal <= 500) {
        candidates.push({
          offset,
          endianness: "little",
          divisor,
          value: littleVal,
        });
      }
    }
  }
  return candidates;
};

export const useBLEDebug = () => {
  const { bleManager, bleInitialized } = useBLE();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Record<string, DebugAdvertisement>>(
    {}
  );
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);

  const appendLog = useCallback((level: DebugLogEntry["level"], message: string) => {
    setLogs((prev) => {
      const next = [...prev, { timestamp: Date.now(), level, message }];
      return next.length > MAX_LOG_ENTRIES
        ? next.slice(-MAX_LOG_ENTRIES)
        : next;
    });
  }, []);

  const handleScan = useCallback(
    (error: BleError | null, device: Device | null) => {
      if (error) {
        appendLog("error", `Scan error: ${error.message}`);
        return;
      }
      if (!device) return;

      const mfgB64 = device.manufacturerData ?? null;
      let bytes: number[] | null = null;
      let hex: string | null = null;
      if (mfgB64) {
        try {
          bytes = Array.from(Buffer.from(mfgB64, "base64"));
          hex = toHex(bytes);
        } catch (e) {
          appendLog(
            "error",
            `Failed to decode manufacturerData for ${device.id}: ${String(e)}`
          );
        }
      }

      setDevices((prev) => {
        const existing = prev[device.id];
        const now = Date.now();
        const next: DebugAdvertisement = {
          id: device.id,
          name: device.name ?? existing?.name ?? null,
          localName: device.localName ?? existing?.localName ?? null,
          rssi: device.rssi ?? null,
          manufacturerDataB64: mfgB64,
          manufacturerDataHex: hex,
          manufacturerDataBytes: bytes,
          serviceUUIDs: device.serviceUUIDs ?? existing?.serviceUUIDs ?? null,
          firstSeen: existing?.firstSeen ?? now,
          lastSeen: now,
          seenCount: (existing?.seenCount ?? 0) + 1,
        };
        return { ...prev, [device.id]: next };
      });
    },
    [appendLog]
  );

  const handleScanRef = useRef(handleScan);
  handleScanRef.current = handleScan;

  const startScan = useCallback(() => {
    if (!bleInitialized) {
      appendLog("error", "BLE not initialized (permissions?)");
      return;
    }
    appendLog("info", "Starting scan (no filter)");
    setIsScanning(true);
    const scanOptions = isAndroid ? { scanMode: ScanMode.LowLatency } : null;
    bleManager.startDeviceScan(null, scanOptions, (err, dev) =>
      handleScanRef.current(err, dev)
    );
  }, [appendLog, bleInitialized, bleManager]);

  const stopScan = useCallback(() => {
    bleManager.stopDeviceScan();
    setIsScanning(false);
    appendLog("info", "Stopped scan");
  }, [appendLog, bleManager]);

  const clear = useCallback(() => {
    setDevices({});
    setLogs([]);
  }, []);

  useEffect(() => {
    return () => {
      bleManager.stopDeviceScan();
    };
  }, [bleManager]);

  return {
    bleInitialized,
    isScanning,
    devices,
    logs,
    startScan,
    stopScan,
    clear,
  };
};
