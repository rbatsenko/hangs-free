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
        {/* 
          In Expo Router, we use ThemeProvider with 'value' prop instead of 
          NavigationContainer with 'theme' prop. This is the recommended approach
          as Expo Router manages the NavigationContainer internally.
          See: https://docs.expo.dev/router/migrate/from-react-navigation/#themes
        */}
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
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      // Hide splash screen when fonts are loaded OR if there's an error
      // This prevents the splash screen from staying forever if font loading fails
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Don't render anything until fonts are loaded (or failed to load)
  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
