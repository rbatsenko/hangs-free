import React from "react";

import { Text } from "react-native";

import { render, screen } from "@testing-library/react-native";

import { SettingsSection } from "../SettingsSection";

describe("SettingsSection", () => {
  it("renders the title correctly", () => {
    render(<SettingsSection title="Test Section" children={null} />);

    expect(screen.getByText("Test Section")).toBeTruthy();
  });

  it("renders children correctly", () => {
    render(
      <SettingsSection title="Test Section">
        <Text testID="child-element">Child Content</Text>
      </SettingsSection>
    );

    expect(screen.getByText("Test Section")).toBeTruthy();
    expect(screen.getByTestId("child-element")).toBeTruthy();
    expect(screen.getByText("Child Content")).toBeTruthy();
  });

  it("renders multiple children correctly", () => {
    render(
      <SettingsSection title="Test Section">
        <Text testID="child-1">First Child</Text>
        <Text testID="child-2">Second Child</Text>
      </SettingsSection>
    );

    expect(screen.getByText("Test Section")).toBeTruthy();
    expect(screen.getByTestId("child-1")).toBeTruthy();
    expect(screen.getByTestId("child-2")).toBeTruthy();
    expect(screen.getByText("First Child")).toBeTruthy();
    expect(screen.getByText("Second Child")).toBeTruthy();
  });
});
