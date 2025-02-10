import React from "react";

import { render, screen } from "@testing-library/react-native";

import { WeightDisplay } from "../WeightDisplay";

const mockData = {
  weight: 42.5,
  maxWeight: 45.0,
  unit: "kg" as const,
};

describe("WeightDisplay", () => {
  it("renders weight and max weight correctly", () => {
    render(<WeightDisplay data={mockData} />);

    expect(screen.getByText("42.5kg")).toBeTruthy();
    expect(screen.getByText("Max: 45kg")).toBeTruthy();
  });

  it("renders fallback text when no data is provided", () => {
    // @ts-ignore - no data
    render(<WeightDisplay data={undefined} />);

    expect(screen.getByText("No data")).toBeTruthy();
    expect(screen.getByText("No max weight")).toBeTruthy();
  });

  it("handles different units correctly", () => {
    const lbData = {
      weight: 100,
      maxWeight: 120,
      unit: "lb" as const,
    };

    render(<WeightDisplay data={lbData} />);

    expect(screen.getByText("100lb")).toBeTruthy();
    expect(screen.getByText("Max: 120lb")).toBeTruthy();
  });
});
