import { StyleSheet } from "react-native";

import { HelloWave } from "@/components/common/HelloWave";
import ParallaxScrollView from "@/components/common/ParallaxScrollView";
import { ThemedText, ThemedView } from "@/components/ui";

export default function HomeScreen() {
  return (
    <ParallaxScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">
            Step 1: View Current Weight (force)
          </ThemedText>
          <ThemedText>
            Check the current weight displayed on the screen. The app will
            continuously update the weight in real-time when your crane scale
            device is on.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 2: Measure Max force</ThemedText>
          <ThemedText>
            Use the app to measure your maximum force. It will remember the
            highest value from your try. We don't support saving results for
            now, so make sure you note them down somewhere.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 3: Analyze Recent Cycle</ThemedText>
          <ThemedText>
            View the recent cycle graph to analyze your weight (force) changes
            over time. The graph provides a visual representation of your weight
            data points. When there is no data yet, the graph shows example data
            points.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 24,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
});
