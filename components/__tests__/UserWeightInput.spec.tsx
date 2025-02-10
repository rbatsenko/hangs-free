import React from "react";

import { fireEvent, render, screen } from "@testing-library/react-native";

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
    render(<UserWeightInput {...defaultProps} />);

    expect(screen.getByText("Your weight:")).toBeTruthy();
    expect(screen.getByPlaceholderText("Weight")).toBeTruthy();
  });

  it("displays the provided value", () => {
    render(<UserWeightInput {...defaultProps} value="75" />);

    expect(screen.getByDisplayValue("75")).toBeTruthy();
  });

  it("calls onChangeText when input changes", async () => {
    render(<UserWeightInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("Weight");
    fireEvent.changeText(input, "80");

    expect(mockOnChangeText).toHaveBeenCalledWith("80");
  });
});
