/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Base colors
const tintColorLight = "#000";
const tintColorDark = "#fff";

// iOS system colors
const iosBlue = "#007AFF";
const iosRed = "#FF3B30";
const iosGreen = "#34C759";
const iosGray = "#8E8E93";
const iosLightGray = "#E9E9EB";
const iosDarkGray = "#2C2C2E";
const iosDarkerGray = "#4C4C4E";

export const colors = {
  light: {
    // Base UI
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,

    // Semantic colors
    primary: iosBlue,
    primaryPressed: "rgba(0, 122, 255, 0.55)",
    primaryTransparent: "rgba(0, 122, 255, 0.85)",

    danger: iosRed,
    dangerPressed: "rgba(255, 59, 48, 0.55)",
    dangerTransparent: "rgba(255, 59, 48, 0.85)",

    success: iosGreen,
    successTransparent: "rgba(52, 199, 89, 0.85)",

    warning: "#FFCC00",

    // UI Elements
    segmentedControlBackground: iosLightGray,
    segmentedControlSelected: "#FFFFFF",

    inputBorder: "#000000",
    inputText: "#000000",
    inputPlaceholder: "#808080",

    link: "#0a7ea4",

    // Custom colors
    hangRed: "rgb(212, 52, 76)",
    hangRedTransparent: "rgba(212, 52, 76, 0.85)",
    hangRedPressed: "rgba(212, 52, 76, 0.55)",
    hangRedBackground: "rgba(212, 52, 76, 0.5)",
  },
  dark: {
    // Base UI
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,

    // Semantic colors
    primary: iosBlue,
    primaryPressed: "rgba(0, 122, 255, 0.55)",
    primaryTransparent: "rgba(0, 122, 255, 0.85)",

    danger: iosRed,
    dangerPressed: "rgba(255, 59, 48, 0.55)",
    dangerTransparent: "rgba(255, 59, 48, 0.85)",

    success: iosGreen,
    successTransparent: "rgba(52, 199, 89, 0.85)",

    warning: "#FFCC00",

    // UI Elements
    segmentedControlBackground: iosDarkGray,
    segmentedControlSelected: iosDarkerGray,

    inputBorder: "#FFFFFF",
    inputText: "#FFFFFF",
    inputPlaceholder: "#808080",

    link: "#0a7ea4",

    // Custom colors
    hangRed: "rgb(212, 52, 76)",
    hangRedTransparent: "rgba(212, 52, 76, 0.85)",
    hangRedPressed: "rgba(212, 52, 76, 0.55)",
    hangRedBackground: "rgba(212, 52, 76, 0.5)",
  },
};

// Helper function to get iOS system colors
export const systemColors = {
  blue: iosBlue,
  red: iosRed,
  green: iosGreen,
  gray: iosGray,
  lightGray: iosLightGray,
  darkGray: iosDarkGray,
  darkerGray: iosDarkerGray,
};
