import React, { useCallback } from "react";

import { StyleSheet } from "react-native";

import { ConnectionControls, DeviceSelector } from "@/components";
import ParallaxScrollView from "@/components/common/ParallaxScrollView";
import { SettingsSection, ThemedText, ThemedView } from "@/components/ui";
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

      <SettingsSection title="Device">
        <DeviceSelector
          selectedDevice={selectedDevice}
          onDeviceSelect={handleDeviceSelect}
        />

        {selectedDevice === "tindeq" && <ConnectionControls />}
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
});
