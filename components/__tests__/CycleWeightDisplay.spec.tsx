import React from "react";

import { render, screen } from "@testing-library/react-native";

import { CycleWeightDisplay } from "../CycleWeightDisplay";

const defaultProps = {
  cycleStarted: false,
  currentWeight: 100,
  unit: "kg",
  elapsedTime: 3500, // 3.5 seconds
  currentPoint: null,
  lastPoint: {
    weight: 150,
    timestamp: 1000, // 1 second after cycle start
  },
  cycleStartTime: 0,
};

describe("CycleWeightDisplay", () => {
  it("displays current weight and elapsed time when cycle is active", () => {
    render(
      <CycleWeightDisplay
        {...defaultProps}
        cycleStarted={true}
        currentWeight={125}
        elapsedTime={2500}
      />
    );

    expect(screen.getByText("125kg at 02s 500ms")).toBeTruthy();
  });

  it("displays last point when cycle is complete and no current point", () => {
    render(<CycleWeightDisplay {...defaultProps} />);

    expect(screen.getByText("150kg at 01s 000ms")).toBeTruthy();
  });

  it("displays current point when available and cycle is complete", () => {
    render(
      <CycleWeightDisplay
        {...defaultProps}
        currentPoint={{
          weight: 175,
          timestamp: 2000,
        }}
      />
    );

    expect(screen.getByText("175kg at 02s 000ms")).toBeTruthy();
  });

  it("formats time correctly for different durations", () => {
    render(
      <CycleWeightDisplay
        {...defaultProps}
        cycleStarted={true}
        currentWeight={100}
        elapsedTime={59999} // 59.999 seconds
      />
    );

    expect(screen.getByText("100kg at 59s 999ms")).toBeTruthy();
  });
});
