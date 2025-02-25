import React from "react";

import { Platform, StyleSheet } from "react-native";

import { WeightDataWithMax } from "@/types/weight";

import { ThemedText } from "./ui/ThemedText";
import { ThemedView } from "./ui/ThemedView";

interface WeightDisplayProps {
  data: WeightDataWithMax;
}

export const WeightDisplay = ({ data }: WeightDisplayProps) => {
  const isIpad = Platform.OS === "ios" && Platform.isPad;

  return (
    <>
      <ThemedView style={{ ...styles.weightContainer, marginBottom: 12 }}>
        <ThemedText style={isIpad ? styles.weightTextIpad : styles.weightText}>
          {data
            ? `${data.weight > 1 ? data.weight : 0}${data.unit}`
            : "No data"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={{ ...styles.weightContainer, marginBottom: 8 }}>
        <ThemedText style={isIpad ? styles.weightTextIpad : styles.weightText}>
          {data ? `Max: ${data.maxWeight}${data.unit}` : "No max weight"}
        </ThemedText>
      </ThemedView>
    </>
  );
};

const styles = StyleSheet.create({
  weightContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    backgroundColor: "transparent",
  },
  weightText: {
    fontSize: 40,
    lineHeight: 40,
    fontWeight: "bold",
  },
  weightTextIpad: {
    fontSize: 72,
    lineHeight: 72,
    fontWeight: "bold",
  },
});
