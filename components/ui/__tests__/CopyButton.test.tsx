import React from "react";

import { render, fireEvent, screen, act } from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";

// Import the component after mocks are set up
import { CopyButton } from "../CopyButton";

// Mock the Clipboard module
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));

// Mock the useColorScheme hook
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

describe("CopyButton", () => {
  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders correctly with copy icon initially", async () => {
    render(<CopyButton textToCopy="Test text" />);
    expect(screen.getByTestId("copy-button")).toBeTruthy();

    // Check that the initial icon is the copy icon
    const icon = await screen
      .getByTestId("copy-button")
      .findByProps({ name: "doc.on.doc" });
    expect(icon).toBeTruthy();
  });

  it("uses custom testID when provided", () => {
    render(<CopyButton textToCopy="Test text" testID="custom-copy-button" />);
    expect(screen.getByTestId("custom-copy-button")).toBeTruthy();
  });

  it("copies text to clipboard and shows checkmark when pressed", async () => {
    const textToCopy = "Test text to copy";
    render(<CopyButton textToCopy={textToCopy} />);

    const copyButton = screen.getByTestId("copy-button");
    fireEvent.press(copyButton);

    // Check that clipboard was called
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(textToCopy);

    // Check that the icon changed to checkmark
    const checkmarkIcon = await screen
      .getByTestId("copy-button")
      .findByProps({ name: "checkmark" });
    expect(checkmarkIcon).toBeTruthy();

    // Advance timers to see if it reverts back
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Check that the icon changed back to copy icon
    const copyIcon = await screen
      .getByTestId("copy-button")
      .findByProps({ name: "doc.on.doc" });
    expect(copyIcon).toBeTruthy();
  });
});
