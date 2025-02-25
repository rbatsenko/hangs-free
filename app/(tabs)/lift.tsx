import { useCallback, useEffect, useMemo, useState } from "react";

import { StyleSheet, Pressable, Text, Platform } from "react-native";
import { LineGraph } from "react-native-graph";

import ParallaxScrollView from "@/components/common/ParallaxScrollView";
import { CycleWeightDisplay } from "@/components/CycleWeightDisplay";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { UserWeightInput } from "@/components/UserWeightInput";
import { WeightDisplay } from "@/components/WeightDisplay";
import { useWeightData } from "@/contexts/WeightDataContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useStopwatch } from "@/hooks/useStopwatch";
import { WeightDataPoint, WeightDataWithMax } from "@/types/weight";

const getPercentage = (value: number, base: number) => (value / base) * 100;

const now = Date.now();
const INITIAL_CYCLE_HAND_DATA = [
  { weight: 0, timestamp: now },
  { weight: 5, timestamp: now + 1000 },
  { weight: 10, timestamp: now + 2000 },
  { weight: 5, timestamp: now + 3000 },
  { weight: 0, timestamp: now + 4000 },
];

type HandType = "left" | "right";

interface HandData {
  left: WeightDataWithMax;
  right: WeightDataWithMax;
}

interface CycleData {
  left: WeightDataPoint[];
  right: WeightDataPoint[];
}

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

  const elapsedTime = useStopwatch(cycleStarted);
  const { weightData, weightDataPoints, reset } = useWeightData();

  const handleWeightChange = useCallback((weight: string) => {
    setUserWeight(weight);
  }, []);

  const handleHandChange = useCallback(
    (index: number) => {
      const newHand = index === 0 ? "left" : "right";
      setSelectedHand(newHand);
      setCycleStarted(false);
      const handCycleData = cycleData[newHand];
      setCurrentPoint(handCycleData[handCycleData.length - 1]);
      reset();
    },
    [cycleData, reset]
  );

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
    setCurrentPoint(INITIAL_CYCLE_HAND_DATA[0]);
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
        const finalPoint = { weight: 0, timestamp: latestPoint.timestamp };
        setCycleData((prev) => ({
          ...prev,
          [selectedHand]: [...prev[selectedHand], finalPoint],
        }));
        setCurrentPoint(finalPoint);
      }

      setHandData((prev) => ({
        ...prev,
        [selectedHand]: {
          ...weightData,
          maxWeight:
            weightData.weight > 1
              ? Math.max(weightData.weight, prev[selectedHand].maxWeight)
              : prev[selectedHand].maxWeight,
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

  const summaryView = useMemo(
    () => (
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
    ),
    [
      handData.left.maxWeight,
      handData.left.unit,
      handData.right.maxWeight,
      handData.right.unit,
      handleResetAll,
      percentages.left,
      percentages.right,
    ]
  );

  return (
    <ParallaxScrollView>
      <UserWeightInput value={userWeight} onChangeText={handleWeightChange} />
      <ThemedView style={styles.segmentContainer}>
        <SegmentedControl
          values={["Left Hand", "Right Hand"]}
          selectedIndex={selectedHand === "left" ? 0 : 1}
          onChange={handleHandChange}
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
          {cycleData[selectedHand].length > 0 && (
            <CycleWeightDisplay
              cycleStarted={cycleStarted}
              currentWeight={weightData?.weight ?? 0}
              unit={handData[selectedHand].unit}
              elapsedTime={elapsedTime}
              currentPoint={currentPoint}
              lastPoint={
                cycleData[selectedHand][cycleData[selectedHand].length - 1]
              }
              cycleStartTime={cycleData[selectedHand][0].timestamp}
            />
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
              onGestureEnd={() => {
                const lastPoint =
                  cycleData[selectedHand][cycleData[selectedHand].length - 1];
                setCurrentPoint(lastPoint);
              }}
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
      {summaryView}
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
  resetAllButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    width: "100%",
  },
});
