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

    // Create mock manufacturer data (weight of 75.5kg)
    // 75.5 * 100 = 7550 = 0x1D7E in hex = [29, 126] in decimal
    const weightBytes = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 126,
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

    // Create mock manufacturer data (weight of 75.5kg)
    // 75.5 * 100 = 7550 = 0x1D7E in hex = [29, 126] in decimal
    const weightBytes1 = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 126,
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
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 226,
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
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 88,
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

  it("should detect when device is sending lb data and avoid double conversion", () => {
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

    // Create mock manufacturer data for 150 lb
    // Device sends: 150 * 100 = 15000 = 0x3A98 = [58, 152] in decimal
    const weightInLb = 150;
    const encodedWeight = weightInLb * 100; // 15000
    const highByte = Math.floor(encodedWeight / 256); // 58
    const lowByte = encodedWeight % 256; // 152
    
    const weightBytes = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
      highByte, lowByte
    ]);
    const manufacturerData = weightBytes.toString("base64");

    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData,
      });
    });

    // Should detect device is sending lb and avoid double conversion
    // Expecting weight close to 150 lb, not ~330 lb from double conversion
    expect(scaleResult.current.weightData.weight).toBeCloseTo(150, 0);
    expect(scaleResult.current.weightData.unit).toBe("lb");
  });

  it("stops scanning on unmount", () => {
    const { unmount } = renderUseScale();
    unmount();
    expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
  });
});
