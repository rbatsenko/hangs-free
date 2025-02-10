import { PermissionsAndroid, Platform } from "react-native";

import { renderHook, waitFor } from "@testing-library/react-native";

import { useBLE } from "../useBLE";

jest.mock("react-native-ble-plx", () => ({
  BleManager: jest.fn(),
}));

jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
    Version: "30",
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: "android.permission.ACCESS_FINE_LOCATION",
      BLUETOOTH_SCAN: "android.permission.BLUETOOTH_SCAN",
      BLUETOOTH_CONNECT: "android.permission.BLUETOOTH_CONNECT",
    },
    RESULTS: {
      GRANTED: "granted",
      DENIED: "denied",
    },
    request: jest.fn(),
    requestMultiple: jest.fn(),
  },
}));

describe("useBLE", () => {
  const originalPlatform = Platform;
  const originalVersion = Platform.Version;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore Platform after all tests
    Platform.OS = originalPlatform.OS;
    Platform.Version = originalVersion;
  });

  describe("iOS", () => {
    beforeEach(() => {
      Platform.OS = "ios";
    });

    it("initializes BLE without requesting permissions", async () => {
      const { result } = renderHook(() => useBLE());

      await waitFor(() => {
        expect(result.current.bleInitialized).toBe(true);
      });
      await waitFor(() => {
        expect(result.current.bleManager).toBeDefined();
      });
    });
  });

  describe("Android", () => {
    beforeEach(() => {
      Platform.OS = "android";
    });

    describe("API Level < 31", () => {
      beforeEach(() => {
        Platform.Version = "30";
      });

      it("requests only FINE_LOCATION permission", async () => {
        const requestSpy = jest
          .spyOn(PermissionsAndroid, "request")
          .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);

        const { result } = renderHook(() => useBLE());

        await waitFor(() => {
          expect(requestSpy).toHaveBeenCalledWith(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            expect.any(Object)
          );
        });

        await waitFor(() => {
          expect(result.current.bleInitialized).toBe(true);
        });
      });

      it("does not initialize if permission is denied", async () => {
        jest
          .spyOn(PermissionsAndroid, "request")
          .mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

        const { result } = renderHook(() => useBLE());

        await waitFor(() => {
          expect(result.current.bleInitialized).toBe(false);
        });
      });
    });

    describe("API Level >= 31", () => {
      beforeEach(() => {
        Platform.Version = "31";
      });

      it("requests multiple permissions", async () => {
        const requestMultipleSpy = jest
          .spyOn(PermissionsAndroid, "requestMultiple")
          .mockResolvedValue({
            "android.permission.BLUETOOTH_CONNECT":
              PermissionsAndroid.RESULTS.GRANTED,
            "android.permission.BLUETOOTH_SCAN":
              PermissionsAndroid.RESULTS.GRANTED,
            "android.permission.ACCESS_FINE_LOCATION":
              PermissionsAndroid.RESULTS.GRANTED,
          } as any);

        const { result } = renderHook(() => useBLE());

        await waitFor(() => {
          expect(requestMultipleSpy).toHaveBeenCalledWith([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
        });

        await waitFor(() => {
          expect(result.current.bleInitialized).toBe(true);
        });
      });

      it("does not initialize if any permission is denied", async () => {
        jest.spyOn(PermissionsAndroid, "requestMultiple").mockResolvedValue({
          "android.permission.BLUETOOTH_CONNECT":
            PermissionsAndroid.RESULTS.GRANTED,
          "android.permission.BLUETOOTH_SCAN":
            PermissionsAndroid.RESULTS.DENIED,
          "android.permission.ACCESS_FINE_LOCATION":
            PermissionsAndroid.RESULTS.GRANTED,
        } as any);

        const { result } = renderHook(() => useBLE());

        await waitFor(() => {
          expect(result.current.bleInitialized).toBe(false);
        });
      });
    });

    it("handles errors during initialization", async () => {
      jest
        .spyOn(PermissionsAndroid, "request")
        .mockRejectedValue(new Error("Permission request failed"));

      const { result } = renderHook(() => useBLE());

      await waitFor(() => {
        expect(result.current.bleInitialized).toBe(false);
      });
    });
  });
});
