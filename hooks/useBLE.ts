import { useEffect, useRef, useState } from "react";

import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

const requestPermissions = async () => {
  if (Platform.OS === "ios") {
    return true;
  }

  if (
    Platform.OS === "android" &&
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  ) {
    const apiLevel = parseInt(Platform.Version.toString(), 10);

    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "Bluetooth Low Energy requires Location",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        result["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.BLUETOOTH_SCAN"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.ACCESS_FINE_LOCATION"] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
  }

  return false;
};

export const useBLE = () => {
  const [bleInitialized, setBleInitialized] = useState(false);
  const bleManagerRef = useRef<BleManager>(new BleManager());

  useEffect(() => {
    const initBLE = async () => {
      try {
        const isPermissionGranted = await requestPermissions();

        if (isPermissionGranted) {
          bleManagerRef.current = new BleManager();
          setBleInitialized(true);
        }
      } catch (error) {
        console.error("BLE initialization failed:", error);
      }
    };

    initBLE();
  }, []);

  return { bleInitialized, bleManager: bleManagerRef.current };
};
