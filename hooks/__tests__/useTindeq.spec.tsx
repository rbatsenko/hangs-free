import { Buffer } from "buffer";

import { renderHook, act } from "@testing-library/react-native";

import { useBLE } from "../useBLE";
import { useTindeq } from "../useTindeq";

jest.mock("../useBLE", () => ({
  useBLE: jest.fn(),
}));

jest.mock("@/contexts/WeightUnitsContext", () => ({
  useWeightUnits: jest.fn(() => ({
    weightUnit: "kg",
    convertWeight: (weight: number, fromUnit: string, toUnit: string) => weight,
  })),
}));

// Mock Date.now to return a consistent timestamp for testing
const mockTimestamp = 1234567890;
jest.spyOn(Date, "now").mockImplementation(() => mockTimestamp);

const mockUseWeightUnits = require("@/contexts/WeightUnitsContext").useWeightUnits;

describe("useTindeq", () => {
  const mockBleManager = {
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
  };

  const mockDevice = {
    id: "device-id-123",
    name: "Progressor_2068",
    discoverAllServicesAndCharacteristics: jest.fn().mockResolvedValue({}),
    monitorCharacteristicForService: jest.fn(),
    writeCharacteristicWithResponseForService: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBLE as jest.Mock).mockReturnValue({
      bleManager: mockBleManager,
      bleInitialized: true,
    });
    mockBleManager.connectToDevice.mockResolvedValue(mockDevice);
    
    // Reset WeightUnitsContext mock to default
    mockUseWeightUnits.mockReturnValue({
      weightUnit: "kg",
      convertWeight: (weight: number, fromUnit: string, toUnit: string) => weight,
    });
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useTindeq());

    expect(result.current.weightData).toEqual({
      weight: 0,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isMonitoring).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("starts scanning when scanAndConnect is called", () => {
    const { result } = renderHook(() => useTindeq());

    act(() => {
      result.current.scanAndConnect();
    });

    expect(result.current.isLoading).toBe(true);
    expect(mockBleManager.startDeviceScan).toHaveBeenCalled();
  });

  it("connects to device when found during scan", async () => {
    const { result } = renderHook(() => useTindeq());

    act(() => {
      result.current.scanAndConnect();
    });

    // Simulate finding the device
    const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
    await act(async () => {
      scanCallback(null, mockDevice);
    });

    expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
    expect(mockBleManager.connectToDevice).toHaveBeenCalledWith(mockDevice.id);
    expect(mockDevice.discoverAllServicesAndCharacteristics).toHaveBeenCalled();
    expect(mockDevice.monitorCharacteristicForService).toHaveBeenCalled();
    expect(
      mockDevice.writeCharacteristicWithResponseForService
    ).toHaveBeenCalled();
  });

  it("handles scan errors", () => {
    const { result } = renderHook(() => useTindeq());

    act(() => {
      result.current.scanAndConnect();
    });

    // Simulate scan error
    const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
    act(() => {
      scanCallback(new Error("Scan failed"), null);
    });

    expect(result.current.error).toBe("Failed to scan for devices");
    expect(result.current.isLoading).toBe(false);
  });

  it("updates weight data when monitoring data is received", async () => {
    const { result } = renderHook(() => useTindeq());

    // Setup monitoring callback capture
    let monitorCallback: Function;
    mockDevice.monitorCharacteristicForService.mockImplementation(
      (_, __, callback) => {
        monitorCallback = callback;
        return { remove: jest.fn() };
      }
    );

    // Connect to device
    await act(async () => {
      result.current.scanAndConnect();
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, mockDevice);
    });

    // Simulate receiving weight data (75.5kg)
    // Create a buffer with tag 0x01 and a float value of 75.5
    const buffer = Buffer.alloc(6);
    buffer[0] = 0x01; // Tag
    buffer.writeFloatLE(75.5, 2); // Weight at position 2
    const base64Data = buffer.toString("base64");

    await act(async () => {
      monitorCallback(null, { value: base64Data });
    });

    expect(result.current.weightData).toEqual({
      weight: 75.5,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(1);
    expect(result.current.weightDataPoints[0]).toEqual({
      weight: 75.5,
      timestamp: mockTimestamp,
    });
  });

  it("handles monitoring errors", async () => {
    const { result } = renderHook(() => useTindeq());

    // Setup monitoring callback capture
    let monitorCallback: Function;
    mockDevice.monitorCharacteristicForService.mockImplementation(
      (_, __, callback) => {
        monitorCallback = callback;
        return { remove: jest.fn() };
      }
    );

    // Connect to device
    await act(async () => {
      result.current.scanAndConnect();
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, mockDevice);
    });

    // Simulate monitoring error
    await act(async () => {
      monitorCallback(new Error("Connection lost"), null);
    });

    expect(result.current.error).toBe("Lost connection to device");
    expect(result.current.isMonitoring).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("resets weight data", () => {
    const { result } = renderHook(() => useTindeq());

    // First set some weight data
    act(() => {
      result.current.weightData = { weight: 75.5, unit: "kg" };
      result.current.weightDataPoints = [
        { weight: 75.5, timestamp: mockTimestamp },
      ];
    });

    // Then reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.weightData).toEqual({
      weight: 0,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toEqual([]);
  });

  it("stops scanning when stopScanning is called", () => {
    const { result } = renderHook(() => useTindeq());

    act(() => {
      result.current.scanAndConnect();
      result.current.stopScanning();
    });

    expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("stops monitoring when stopMonitoring is called", async () => {
    const { result } = renderHook(() => useTindeq());

    // Connect to device
    await act(async () => {
      result.current.scanAndConnect();
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, mockDevice);
    });

    // Stop monitoring
    await act(async () => {
      result.current.stopMonitoring();
    });

    expect(
      mockDevice.writeCharacteristicWithResponseForService
    ).toHaveBeenCalledTimes(2); // Once for start, once for stop
    expect(result.current.isMonitoring).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isConnected).toBe(false);
  });

  it("sends tare command when tare is called", async () => {
    const { result } = renderHook(() => useTindeq());

    // Connect to device
    await act(async () => {
      result.current.scanAndConnect();
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, mockDevice);
    });

    // Call tare
    await act(async () => {
      await result.current.tare();
    });

    expect(
      mockDevice.writeCharacteristicWithResponseForService
    ).toHaveBeenCalledTimes(2); // Once for start, once for tare
  });

  it("does not call tare when no device is connected", async () => {
    const { result } = renderHook(() => useTindeq());

    // Call tare without connecting
    await act(async () => {
      await result.current.tare();
    });

    expect(
      mockDevice.writeCharacteristicWithResponseForService
    ).not.toHaveBeenCalled();
  });

  it("handles connection errors", async () => {
    mockBleManager.connectToDevice.mockRejectedValue(
      new Error("Connection failed")
    );

    const { result } = renderHook(() => useTindeq());

    await act(async () => {
      result.current.scanAndConnect();
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, mockDevice);
    });

    expect(result.current.error).toBe("Failed to connect to Tindeq");
    expect(result.current.isLoading).toBe(false);
  });

  it("respects weight unit preference", () => {
    mockUseWeightUnits.mockReturnValue({
      weightUnit: "lb",
      convertWeight: jest.fn((weight, fromUnit, toUnit) => {
        if (fromUnit === "kg" && toUnit === "lb") {
          return weight * 2.20462;
        }
        return weight;
      }),
    });

    const { result } = renderHook(() => useTindeq());

    expect(result.current.weightData.unit).toBe("lb");
  });

  it("converts weight data from kg to user's preferred unit", async () => {
    const mockConvertWeight = jest.fn((weight, fromUnit, toUnit) => {
      if (fromUnit === "kg" && toUnit === "lb") {
        return weight * 2.20462;
      }
      return weight;
    });

    mockUseWeightUnits.mockReturnValue({
      weightUnit: "lb",
      convertWeight: mockConvertWeight,
    });

    const { result } = renderHook(() => useTindeq());

    // Start scanning
    act(() => {
      result.current.scanAndConnect();
    });

    // Simulate device found during scan - this triggers connection
    const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
    
    await act(async () => {
      scanCallback(null, mockDevice);
    });

    // Now we should have a monitor callback
    expect(mockDevice.monitorCharacteristicForService).toHaveBeenCalled();
    
    const monitorCallback = mockDevice.monitorCharacteristicForService.mock.calls[0][2];

    // Simulate receiving weight data (1 kg = 2.20462 lb)
    const weightInKg = 1.0;
    const expectedWeightInLb = 2.20462;
    
    const buffer = Buffer.alloc(8);
    buffer[0] = 0x01; // tag
    buffer.writeFloatLE(weightInKg, 2);
    const base64Data = buffer.toString("base64");
    
    act(() => {
      monitorCallback(null, { value: base64Data });
    });

    expect(mockConvertWeight).toHaveBeenCalledWith(weightInKg, "kg", "lb");
    expect(result.current.weightData).toEqual({
      weight: expectedWeightInLb,
      unit: "lb",
    });
  });
});
