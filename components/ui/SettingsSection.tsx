import React, { ReactNode } from "react";

import { StyleSheet } from "react-native";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={styles.subtitle}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
    gap: 8,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 20,
    marginBottom: 8,
  },
});
