import { Buffer } from "buffer";

import { renderHook, act } from "@testing-library/react-native";

import { useBLE } from "../useBLE";
import { useScale } from "../useScale";

jest.mock("../useBLE", () => ({
  useBLE: jest.fn(),
}));

jest.mock("@/contexts/WeightUnitsContext", () => ({
  useWeightUnits: jest.fn(() => ({
    weightUnit: "kg",
    convertWeight: (weight: number, fromUnit: string, toUnit: string) => weight,
    formatWeight: (weight: number) => weight.toFixed(1),
    setWeightUnit: jest.fn(),
  })),
}));

const renderUseScale = () => {
  return renderHook(() => useScale({ selectedDevice: "whc06" }));
};

describe("useScale", () => {
  const mockBleManager = {
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBLE as jest.Mock).mockReturnValue({
      bleManager: mockBleManager,
      bleInitialized: true,
    });
  });

  it("initializes with default values", () => {
    const { result } = renderUseScale();

    expect(result.current.weightData).toEqual({
      weight: 0,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toEqual([]);
  });

  it("starts scanning when initialized", () => {
    renderUseScale();

    expect(mockBleManager.startDeviceScan).toHaveBeenCalled();
  });

  it("does not start scanning when BLE is not initialized", () => {
    (useBLE as jest.Mock).mockReturnValue({
      bleManager: mockBleManager,
      bleInitialized: false,
    });

    renderUseScale();
    expect(mockBleManager.startDeviceScan).not.toHaveBeenCalled();
  });

  it("updates weight data when valid data is received", () => {
    const { result } = renderUseScale();

    // Create mock manufacturer data following WH-C06 protocol
    // Weight: 75.5kg at offset 10-11 (big-endian)
    // 75.5 * 100 = 7550 = 0x1D7E in hex = [29, 126] in decimal  
    // Unit: kg (1) and stable flag (1) at offset 14 = 0x11 = 17
    const weightBytes = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,     // bytes 0-9
      29, 126,                          // bytes 10-11: weight 75.5kg
      0, 0,                             // bytes 12-13: padding
      0x11                              // byte 14: stable=1, unit=kg=1
    ]);
    const manufacturerData = weightBytes.toString("base64");

    // Simulate device scan callback
    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData,
      });
    });

    expect(result.current.weightData).toEqual({
      weight: 75.5,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(1);
    expect(result.current.weightDataPoints[0]).toMatchObject({
      weight: 75.5,
    });
  });

  it("adds more weight data points when the weight changes", () => {
    const { result } = renderUseScale();

    // Create mock manufacturer data following WH-C06 protocol
    // Weight: 75.5kg at offset 10-11 (big-endian)
    // 75.5 * 100 = 7550 = 0x1D7E in hex = [29, 126] in decimal
    const weightBytes1 = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,     // bytes 0-9
      29, 126,                          // bytes 10-11: weight 75.5kg
      0, 0,                             // bytes 12-13: padding
      0x11                              // byte 14: stable=1, unit=kg=1
    ]);
    const manufacturerData1 = weightBytes1.toString("base64");

    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData: manufacturerData1,
      });
    });

    expect(result.current.weightDataPoints).toHaveLength(1);
    expect(result.current.weightDataPoints[0]).toMatchObject({
      weight: 75.5,
    });

    // Create mock manufacturer data (weight of 76.5kg)
    // 76.5 * 100 = 7650 = 0x1DE2 in hex = [29, 226] in decimal
    const weightBytes2 = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,     // bytes 0-9
      29, 226,                          // bytes 10-11: weight 76.5kg
      0, 0,                             // bytes 12-13: padding
      0x11                              // byte 14: stable=1, unit=kg=1
    ]);
    const manufacturerData2 = weightBytes2.toString("base64");

    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData: manufacturerData2,
      });
    });

    expect(result.current.weightData).toEqual({
      weight: 76.5,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(2);
    expect(result.current.weightDataPoints[1]).toMatchObject({
      weight: 76.5,
    });

    // Create mock manufacturer data (weight of 70kg)
    // 70 * 100 = 7000 = 0x1B58 in hex = [27, 88] in decimal
    const weightBytes3 = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,     // bytes 0-9
      27, 88,                           // bytes 10-11: weight 70kg
      0, 0,                             // bytes 12-13: padding
      0x11                              // byte 14: stable=1, unit=kg=1
    ]);
    const manufacturerData3 = weightBytes3.toString("base64");

    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData: manufacturerData3,
      });
    });

    expect(result.current.weightData).toEqual({
      weight: 70,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(3);
    expect(result.current.weightDataPoints[2]).toMatchObject({
      weight: 70,
    });
  });

  it("resets weight data", () => {
    const { result } = renderUseScale();

    act(() => {
      result.current.reset();
    });

    expect(result.current.weightData).toEqual({
      weight: 0,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toEqual([]);
  });

  it("should correctly handle device unit setting and always convert from kg transmission data", () => {
    const mockUseWeightUnits = jest.mocked(
      jest.requireMock("@/contexts/WeightUnitsContext").useWeightUnits
    );
    
    // Mock target unit as lb with proper conversion logic
    mockUseWeightUnits.mockReturnValue({
      weightUnit: "lb",
      convertWeight: (weight: number, fromUnit: string, toUnit: string) => {
        if (fromUnit === "kg" && toUnit === "lb") return weight * 2.20462;
        if (fromUnit === "lb" && toUnit === "kg") return weight / 2.20462;
        return weight;
      },
      formatWeight: (weight: number) => weight.toFixed(1),
      setWeightUnit: jest.fn(),
    });

    const { result: scaleResult } = renderUseScale();

    // Create mock manufacturer data following WH-C06 protocol
    // Device display is set to lb mode (unit code 2) and shows ~150 lb
    // But weight data is ALWAYS transmitted in kg units (68.04 kg = 150 lb)
    // Weight: 68.04 kg * 100 = 6804 = 0x1A8C = [26, 140] in decimal
    // Unit: lb (2) and stable flag (1) at offset 14 = 0x12 = 18
    const weightInKg = 68.04; // This equals about 150 lb
    const encodedWeight = Math.round(weightInKg * 100); // 6804
    const highByte = Math.floor(encodedWeight / 256); // 26
    const lowByte = encodedWeight % 256; // 140
    
    const weightBytes = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,     // bytes 0-9
      highByte, lowByte,                // bytes 10-11: weight 68.04kg (transmitted in kg)
      0, 0,                             // bytes 12-13: padding  
      0x12                              // byte 14: stable=1, unit=lb=2 (device display unit)
    ]);
    const manufacturerData = weightBytes.toString("base64");

    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData,
      });
    });

    // Should correctly convert from kg transmission data to lb app unit
    // 68.04 kg transmitted -> converted to ~150 lb for app display
    expect(scaleResult.current.weightData.weight).toBeCloseTo(150, 0);
    expect(scaleResult.current.weightData.unit).toBe("lb");
  });

  it("stops scanning on unmount", () => {
    const { unmount } = renderUseScale();
    unmount();
    expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
  });
});
