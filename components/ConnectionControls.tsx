import React from "react";

import { StyleSheet, Pressable, ActivityIndicator } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/constants/colors";
import { useWeightData } from "@/contexts/WeightDataContext";
import { useColorScheme } from "@/hooks/useColorScheme";

import { ThemedText } from "./ui/ThemedText";
import { ThemedView } from "./ui/ThemedView";

export const ConnectionControls = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const {
    scanAndConnect,
    stopScanning,
    stopMonitoring,
    isConnected,
    isMonitoring,
    error,
    isLoading,
  } = useWeightData();

  if (isConnected && isMonitoring) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.connectButton, styles.connectedButton]}>
          <ThemedText style={styles.buttonText}>Connected</ThemedText>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
        </ThemedView>
        <Pressable
          onPress={stopMonitoring}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? colors[theme].dangerPressed
                : colors[theme].dangerTransparent,
            },
            styles.connectButton,
          ]}
        >
          <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
        </Pressable>
        {error && <ErrorMessage error={error} />}
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.connectionContainer}>
          <ThemedView
            style={[
              styles.connectButton,
              { backgroundColor: colors[theme].primaryTransparent },
            ]}
          >
            <ThemedText style={styles.buttonText}>Connecting...</ThemedText>
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.loader}
            />
          </ThemedView>
          <Pressable
            onPress={stopScanning}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? colors[theme].dangerPressed
                  : colors[theme].dangerTransparent,
              },
              styles.connectButton,
            ]}
          >
            <ThemedText style={styles.buttonText}>Stop</ThemedText>
          </Pressable>
        </ThemedView>
        {error && <ErrorMessage error={error} />}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.connectionContainer}>
        <Pressable
          onPress={scanAndConnect}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? colors[theme].primaryPressed
                : colors[theme].primaryTransparent,
            },
            styles.connectButton,
          ]}
        >
          <ThemedText style={styles.buttonText}>Connect</ThemedText>
        </Pressable>
      </ThemedView>
      {error && <ErrorMessage error={error} />}
    </ThemedView>
  );
};

function ErrorMessage({ error }: { error: string | null }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  if (!error) return null;
  return (
    <ThemedView style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={20} color={colors[theme].danger} />
      <ThemedText style={styles.errorText}>{error}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 8,
  },
  connectionContainer: {
    flexDirection: "row",
    gap: 8,
  },
  connectButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  connectedButton: {
    backgroundColor: colors.light.successTransparent, // We'll use light theme color as it's the same in both themes
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  errorText: {
    color: colors.light.danger, // We'll use light theme color as it's the same in both themes
    fontSize: 14,
    lineHeight: 18,
  },
  loader: {
    marginLeft: 4,
  },
});
