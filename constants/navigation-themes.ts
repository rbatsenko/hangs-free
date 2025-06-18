import { DefaultTheme, DarkTheme } from "@react-navigation/native";

import { colors } from "./colors";

export const LightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.light.primary,
    background: colors.light.background,
    card: colors.light.background,
    text: colors.light.text,
    border: colors.light.segmentedControlBackground,
    notification: colors.light.hangRed,
  },
};

export const DarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.dark.primary,
    background: colors.dark.background,
    card: colors.dark.background,
    text: colors.dark.text,
    border: colors.dark.segmentedControlBackground,
    notification: colors.dark.hangRed,
  },
};
