import { useEffect } from "react";

import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { LightNavigationTheme, DarkNavigationTheme } from "@/constants/navigation-themes";
import { SelectedDeviceProvider } from "@/contexts/SelectedDeviceContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { WeightDataProvider } from "@/contexts/WeightDataContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function ThemedApp() {
  const { colorScheme } = useTheme();

  return (
    <SelectedDeviceProvider>
      <WeightDataProvider>
        <NavigationThemeProvider
          value={colorScheme === "dark" ? DarkNavigationTheme : LightNavigationTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </NavigationThemeProvider>
      </WeightDataProvider>
    </SelectedDeviceProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
