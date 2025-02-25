import React from "react";

import { render, fireEvent, screen } from "@testing-library/react-native";

import { DeviceSelector } from "../DeviceSelector";

describe("DeviceSelector", () => {
  const mockOnDeviceSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with whc06 selected", () => {
    render(
      <DeviceSelector
        selectedDevice="whc06"
        onDeviceSelect={mockOnDeviceSelect}
      />
    );

    expect(screen.getByText("WH-C06 Scale")).toBeTruthy();
    expect(screen.getByText("Tindeq Progressor")).toBeTruthy();
  });

  it("renders correctly with tindeq selected", () => {
    render(
      <DeviceSelector
        selectedDevice="tindeq"
        onDeviceSelect={mockOnDeviceSelect}
      />
    );

    expect(screen.getByText("WH-C06 Scale")).toBeTruthy();
    expect(screen.getByText("Tindeq Progressor")).toBeTruthy();
  });

  it("calls onDeviceSelect when WH-C06 Scale is pressed", () => {
    render(
      <DeviceSelector
        selectedDevice="tindeq"
        onDeviceSelect={mockOnDeviceSelect}
      />
    );

    fireEvent.press(screen.getByText("WH-C06 Scale"));
    expect(mockOnDeviceSelect).toHaveBeenCalledWith("whc06");
  });

  it("calls onDeviceSelect when Tindeq Progressor is pressed", () => {
    render(
      <DeviceSelector
        selectedDevice="whc06"
        onDeviceSelect={mockOnDeviceSelect}
      />
    );

    fireEvent.press(screen.getByText("Tindeq Progressor"));
    expect(mockOnDeviceSelect).toHaveBeenCalledWith("tindeq");
  });
});
