import React, { ReactNode } from "react";

import { render, screen, fireEvent } from "@testing-library/react-native";

import { useWeightData } from "@/contexts/WeightDataContext";

import { ConnectionControls } from "../ConnectionControls";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// Mock the WeightDataContext
jest.mock("@/contexts/WeightDataContext", () => {
  const originalModule = jest.requireActual("@/contexts/WeightDataContext");

  return {
    ...originalModule,
    useWeightData: jest.fn(),
    WeightDataProvider: ({ children }: { children: ReactNode }) => children,
  };
});

const mockUseWeightData = useWeightData as jest.Mock;

describe("ConnectionControls", () => {
  const mockScanAndConnect = jest.fn();
  const mockStopScanning = jest.fn();
  const mockStopMonitoring = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseWeightData.mockReturnValue({
      scanAndConnect: mockScanAndConnect,
      stopScanning: mockStopScanning,
      stopMonitoring: mockStopMonitoring,
      isConnected: false,
      isMonitoring: false,
      isLoading: false,
      error: null,
    });
  });

  it("renders connect button when not connected and not loading", () => {
    render(<ConnectionControls />);

    expect(screen.getByText("Connect")).toBeTruthy();
    expect(screen.queryByText("Connected")).toBeNull();
    expect(screen.queryByText("Connecting...")).toBeNull();
    expect(screen.queryByText("Disconnect")).toBeNull();
    expect(screen.queryByText("Stop")).toBeNull();
  });

  it("renders connected state when connected and monitoring", () => {
    mockUseWeightData.mockReturnValue({
      scanAndConnect: mockScanAndConnect,
      stopScanning: mockStopScanning,
      stopMonitoring: mockStopMonitoring,
      isConnected: true,
      isMonitoring: true,
      isLoading: false,
      error: null,
    });

    render(<ConnectionControls />);

    expect(screen.getByText("Connected")).toBeTruthy();
    expect(screen.getByText("Disconnect")).toBeTruthy();
    expect(screen.queryByText("Connect")).toBeNull();
    expect(screen.queryByText("Connecting...")).toBeNull();
    expect(screen.queryByText("Stop")).toBeNull();
  });

  it("renders loading state when loading", () => {
    mockUseWeightData.mockReturnValue({
      scanAndConnect: mockScanAndConnect,
      stopScanning: mockStopScanning,
      stopMonitoring: mockStopMonitoring,
      isConnected: false,
      isMonitoring: false,
      isLoading: true,
      error: null,
    });

    render(<ConnectionControls />);

    expect(screen.getByText("Connecting...")).toBeTruthy();
    expect(screen.getByText("Stop")).toBeTruthy();
    expect(screen.queryByText("Connect")).toBeNull();
    expect(screen.queryByText("Connected")).toBeNull();
    expect(screen.queryByText("Disconnect")).toBeNull();
  });

  it("displays error message when error is provided", () => {
    mockUseWeightData.mockReturnValue({
      scanAndConnect: mockScanAndConnect,
      stopScanning: mockStopScanning,
      stopMonitoring: mockStopMonitoring,
      isConnected: false,
      isMonitoring: false,
      isLoading: false,
      error: "Test error message",
    });

    render(<ConnectionControls />);

    expect(screen.getByText("Test error message")).toBeTruthy();
  });

  it("calls scanAndConnect when Connect button is pressed", () => {
    render(<ConnectionControls />);

    fireEvent.press(screen.getByText("Connect"));
    expect(mockScanAndConnect).toHaveBeenCalledTimes(1);
  });

  it("calls stopScanning when Stop button is pressed during loading", () => {
    mockUseWeightData.mockReturnValue({
      scanAndConnect: mockScanAndConnect,
      stopScanning: mockStopScanning,
      stopMonitoring: mockStopMonitoring,
      isConnected: false,
      isMonitoring: false,
      isLoading: true,
      error: null,
    });

    render(<ConnectionControls />);

    fireEvent.press(screen.getByText("Stop"));
    expect(mockStopScanning).toHaveBeenCalledTimes(1);
  });

  it("calls stopMonitoring when Disconnect button is pressed", () => {
    mockUseWeightData.mockReturnValue({
      scanAndConnect: mockScanAndConnect,
      stopScanning: mockStopScanning,
      stopMonitoring: mockStopMonitoring,
      isConnected: true,
      isMonitoring: true,
      isLoading: false,
      error: null,
    });

    render(<ConnectionControls />);

    fireEvent.press(screen.getByText("Disconnect"));
    expect(mockStopMonitoring).toHaveBeenCalledTimes(1);
  });
});
