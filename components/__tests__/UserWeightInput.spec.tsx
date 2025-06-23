import React from "react";

import { fireEvent, render, screen } from "@testing-library/react-native";

import { WeightUnitsProvider } from "@/contexts/WeightUnitsContext";
import { UserWeightInput } from "../UserWeightInput";

jest.mock("@/hooks/useColorScheme", () => ({
  __esModule: true,
  default: jest.fn(),
  useColorScheme: jest.fn(),
}));

const mockOnChangeText = jest.fn();
const defaultProps = {
  value: "",
  onChangeText: mockOnChangeText,
};

describe("UserWeightInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the input with correct label", () => {
    render(
      <WeightUnitsProvider>
        <UserWeightInput {...defaultProps} />
      </WeightUnitsProvider>
    );

    expect(screen.getByText("Your weight (kg):")).toBeTruthy();
    expect(screen.getByPlaceholderText("Weight in kg")).toBeTruthy();
  });

  it("displays the provided value", () => {
    render(
      <WeightUnitsProvider>
        <UserWeightInput {...defaultProps} value="75" />
      </WeightUnitsProvider>
    );

    expect(screen.getByDisplayValue("75")).toBeTruthy();
  });

  it("calls onChangeText when input changes", async () => {
    render(
      <WeightUnitsProvider>
        <UserWeightInput {...defaultProps} />
      </WeightUnitsProvider>
    );

    const input = screen.getByPlaceholderText("Weight in kg");
    fireEvent.changeText(input, "80");

    expect(mockOnChangeText).toHaveBeenCalledWith("80");
  });
});
