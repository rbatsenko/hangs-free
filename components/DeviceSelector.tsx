import React, { memo, useCallback } from "react";

import { StyleSheet, Pressable } from "react-native";

import { DeviceType } from "@/contexts/SelectedDeviceContext";

import { RadioButton } from "./ui/RadioButton";
import { ThemedText } from "./ui/ThemedText";

interface DeviceOptionProps {
  deviceType: DeviceType;
  selected: boolean;
  onSelect: (device: DeviceType) => void;
  label: string;
}

const DeviceOption = memo(
  ({ deviceType, selected, onSelect, label }: DeviceOptionProps) => (
    <Pressable style={styles.radioOption} onPress={() => onSelect(deviceType)}>
      <RadioButton selected={selected} />
      <ThemedText style={styles.radioText}>{label}</ThemedText>
    </Pressable>
  )
);

DeviceOption.displayName = "DeviceOption";

interface DeviceSelectorProps {
  selectedDevice: DeviceType;
  onDeviceSelect: (device: DeviceType) => void;
}

export function DeviceSelector({
  selectedDevice,
  onDeviceSelect,
}: DeviceSelectorProps) {
  const handleDeviceSelect = useCallback(
    (device: DeviceType) => {
      onDeviceSelect(device);
    },
    [onDeviceSelect]
  );

  return (
    <>
      <DeviceOption
        deviceType="whc06"
        selected={selectedDevice === "whc06"}
        onSelect={handleDeviceSelect}
        label="WH-C06 Scale"
      />

      <DeviceOption
        deviceType="tindeq"
        selected={selectedDevice === "tindeq"}
        onSelect={handleDeviceSelect}
        label="Tindeq Progressor"
      />
    </>
  );
}

const styles = StyleSheet.create({
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  radioText: {
    fontSize: 18,
    lineHeight: 18,
  },
});
