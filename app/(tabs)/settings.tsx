import React, { useCallback } from "react";

import { Pressable, StyleSheet } from "react-native";

import { Link } from "expo-router";

import { ConnectionControls, DeviceSelector } from "@/components";
import ParallaxScrollView from "@/components/common/ParallaxScrollView";
import { SettingsSection, ThemedText, ThemedView, ThemeSelector } from "@/components/ui";
import {
  useSelectedDevice,
  DeviceType,
} from "@/contexts/SelectedDeviceContext";

export default function SettingsScreen() {
  const { selectedDevice, setDevice } = useSelectedDevice();

  const handleDeviceSelect = useCallback(
    (device: DeviceType) => {
      setDevice(device);
    },
    [setDevice]
  );

  return (
    <ParallaxScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <SettingsSection title="Appearance">
        <ThemeSelector />
      </SettingsSection>

      <SettingsSection title="Device">
        <DeviceSelector
          selectedDevice={selectedDevice}
          onDeviceSelect={handleDeviceSelect}
        />

        {selectedDevice === "tindeq" && <ConnectionControls />}
      </SettingsSection>

      <SettingsSection title="Troubleshooting">
        <Link href={"/debug" as never} asChild>
          <Pressable style={styles.debugRow}>
            <ThemedText type="defaultSemiBold">BLE Debug</ThemedText>
            <ThemedText style={styles.debugHint}>
              Inspect BLE advertisements. Use if your scale is visible in
              system Bluetooth but the app shows no weight.
            </ThemedText>
          </Pressable>
        </Link>
      </SettingsSection>
    </ParallaxScrollView>
  );
}

export const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 24,
  },
  debugRow: {
    paddingVertical: 8,
    gap: 4,
  },
  debugHint: {
    fontSize: 13,
    opacity: 0.7,
  },
});
