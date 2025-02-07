import { StyleSheet, Pressable, Text, Platform, TextInput } from "react-native";
import ParallaxScrollView from "@/components/common/ParallaxScrollView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { WeightDisplay } from "@/components/WeightDisplay";
import { useScale } from "@/hooks/useScale";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LineGraph } from "react-native-graph";
import { useColorScheme } from "@/hooks/useColorScheme";
import { HandData, HandType, CycleData, WeightDataPoint } from "@/types/weight";

const getPercentage = (value: number, base: number) => (value / base) * 100;

const now = Date.now();
const INITIAL_CYCLE_HAND_DATA = [
  { weight: 0, timestamp: now },
  { weight: 5, timestamp: now + 1000 },
  { weight: 10, timestamp: now + 2000 },
  { weight: 5, timestamp: now + 3000 },
  { weight: 0, timestamp: now + 4000 },
];

const INITIAL_CYCLE_DATA: CycleData = {
  left: INITIAL_CYCLE_HAND_DATA,
  right: INITIAL_CYCLE_HAND_DATA,
};

const INITIAL_HAND_DATA: HandData = {
  left: { weight: 0, maxWeight: 0, unit: "kg" },
  right: { weight: 0, maxWeight: 0, unit: "kg" },
};

export default function LiftScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isLight = colorScheme === "light";
  const [selectedHand, setSelectedHand] = useState<HandType>("left");
  const [handData, setHandData] = useState<HandData>(INITIAL_HAND_DATA);
  const [cycleStarted, setCycleStarted] = useState(false);
  const [cycleData, setCycleData] = useState<CycleData>(INITIAL_CYCLE_DATA);
  const [currentPoint, setCurrentPoint] = useState<WeightDataPoint | null>(
    INITIAL_CYCLE_DATA.left[0]
  );
  const [userWeight, setUserWeight] = useState("");

  const { weightData, weightDataPoints, reset } = useScale();

  const handleResetHand = useCallback(() => {
    setHandData((prev) => ({
      ...prev,
      [selectedHand]: INITIAL_HAND_DATA[selectedHand],
    }));
    setCycleStarted(false);
    setCycleData((prev) => ({
      ...prev,
      [selectedHand]: INITIAL_CYCLE_HAND_DATA,
    }));
    reset();
  }, [selectedHand, reset]);

  const handleResetAll = useCallback(() => {
    setHandData(INITIAL_HAND_DATA);
    setCycleStarted(false);
    setCycleData(INITIAL_CYCLE_DATA);
    reset();
  }, [reset]);

  useEffect(() => {
    if (weightData && weightDataPoints.length > 0) {
      const currentWeight = weightData.weight;
      const latestPoint = weightDataPoints[weightDataPoints.length - 1];

      if (!cycleStarted && currentWeight > 1) {
        setCycleStarted(true);
        setCycleData((prev) => ({
          ...prev,
          [selectedHand]: [{ weight: 0, timestamp: latestPoint.timestamp }],
        }));
      }

      if (cycleStarted) {
        setCycleData((prev) => ({
          ...prev,
          [selectedHand]: [...prev[selectedHand], latestPoint],
        }));
      }

      if (cycleStarted && currentWeight < 1) {
        setCycleStarted(false);
        setCycleData((prev) => ({
          ...prev,
          [selectedHand]: [
            ...prev[selectedHand],
            { weight: 0, timestamp: latestPoint.timestamp },
          ],
        }));
      }

      setHandData((prev) => ({
        ...prev,
        [selectedHand]: {
          ...weightData,
          maxWeight: Math.max(weightData.weight, prev[selectedHand].maxWeight),
        },
      }));
    }
  }, [weightData, weightDataPoints, selectedHand, cycleStarted]);

  const percentages = useMemo(
    () => ({
      left:
        userWeight && handData.left.maxWeight
          ? `(${getPercentage(
              handData.left.maxWeight,
              parseFloat(userWeight)
            ).toFixed(1)}%)`
          : "",
      right:
        userWeight && handData.right.maxWeight
          ? `(${getPercentage(
              handData.right.maxWeight,
              parseFloat(userWeight)
            ).toFixed(1)}%)`
          : "",
    }),
    [userWeight, handData]
  );

  const isIpad = Platform.OS === "ios" && Platform.isPad;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={210}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.userWeightContainer}>
        <ThemedText>Your weight: </ThemedText>
        <TextInput
          style={{
            ...styles.input,
            borderColor: isLight ? "#000000" : "#FFFFFF",
            color: isLight ? "#000000" : "#FFFFFF",
          }}
          onChangeText={setUserWeight}
          value={userWeight}
          placeholder="Weight"
          keyboardType="numeric"
        />
      </ThemedView>
      <ThemedView style={styles.segmentContainer}>
        <SegmentedControl
          values={["Left Hand", "Right Hand"]}
          selectedIndex={selectedHand === "left" ? 0 : 1}
          onChange={(index) => setSelectedHand(index === 0 ? "left" : "right")}
          style={styles.segment}
        />
      </ThemedView>

      <ThemedView
        style={{
          ...styles.handContainer,
          backgroundColor: isLight ? "#E9E9EB" : "#2C2C2E",
        }}
      >
        <WeightDisplay data={handData[selectedHand]} />

        <ThemedView style={styles.chartContainer}>
          {cycleData[selectedHand].length > 0 && currentPoint && (
            <ThemedText>
              {currentPoint.weight}
              {handData[selectedHand].unit} at{" "}
              {new Date(currentPoint.timestamp).toLocaleString("pl-PL", {
                fractionalSecondDigits: 3,
              })}
            </ThemedText>
          )}
          {cycleData[selectedHand].length >= 2 && (
            <LineGraph
              points={cycleData[selectedHand].map((point) => ({
                value: point.weight,
                date: new Date(point.timestamp),
              }))}
              animated={!cycleStarted}
              enablePanGesture={!cycleStarted}
              enableIndicator={!cycleStarted}
              panGestureDelay={0}
              onPointSelected={(point) =>
                setCurrentPoint({
                  weight: point.value,
                  timestamp: point.date.getTime(),
                })
              }
              color={isLight ? "#000000" : "#FFFFFF"}
              verticalPadding={12}
              horizontalPadding={12}
              enableFadeInMask
              style={{
                alignSelf: "center",
                width: "100%",
                height: isIpad ? 360 : 200,
                backgroundColor: "transparent",
              }}
            />
          )}
        </ThemedView>

        <ThemedView style={styles.resetCycleContainer}>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? "rgba(212, 52, 76, 0.55)"
                  : "rgba(212, 52, 76, 0.85)",
              },
              styles.resetCycleButton,
            ]}
            onPress={handleResetHand}
          >
            <Text style={styles.resetCycleText}>Reset hand</Text>
          </Pressable>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.summaryContainer}>
        <ThemedText style={styles.summaryTitle}>Summary max</ThemedText>
        <ThemedView style={styles.summaryRow}>
          <ThemedView style={{ alignItems: "center" }}>
            <ThemedText style={styles.summaryText}>
              Left: {handData.left.maxWeight}
              {handData.left.unit}{" "}
            </ThemedText>
            <ThemedText style={styles.percentage}>
              {percentages.left}
            </ThemedText>
          </ThemedView>
          <ThemedView style={{ alignItems: "center" }}>
            <ThemedText style={styles.summaryText}>
              Right: {handData.right.maxWeight}
              {handData.right.unit}
            </ThemedText>
            <ThemedText style={styles.percentage}>
              {percentages.right}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? "rgba(212, 52, 76, 0.5)"
                : "rgb(212, 52, 76)",
            },
            styles.resetAllButton,
          ]}
          onPress={handleResetAll}
        >
          <Text style={styles.resetCycleText}>Reset</Text>
        </Pressable>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -70,
    left: -5,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  userWeightContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  segmentContainer: {},
  segment: {},
  handContainer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingTop: 16,
    elevation: 1,
  },
  chartContainer: { alignItems: "center", backgroundColor: "transparent" },
  resetCycleContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  resetCycleButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    margin: 12,
    width: 160,
  },
  resetCycleText: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 24,
  },
  summaryContainer: {
    marginTop: 8,
    padding: 8,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 20,
  },
  summaryText: {
    fontSize: 24,
    lineHeight: 24,
  },
  percentage: { marginTop: 4, fontSize: 16, lineHeight: 16 },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  resetAllButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    width: "100%",
  },
});
