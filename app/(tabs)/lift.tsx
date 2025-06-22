import { useCallback, useEffect, useMemo, useState } from "react";

import { StyleSheet, Pressable, Text, Platform } from "react-native";
import { LineGraph } from "react-native-graph";

import {
  CycleWeightDisplay,
  UserWeightInput,
  WeightDisplay,
} from "@/components";
import { ParallaxScrollView } from "@/components/common";
import {
  CopyButton,
  SegmentedControl,
  ThemedText,
  ThemedView,
} from "@/components/ui";
import { useWeightData } from "@/contexts/WeightDataContext";
import { useWeightUnits } from "@/contexts/WeightUnitsContext";
import { useStopwatch } from "@/hooks";
import { useColorScheme } from "@/hooks/useColorScheme";
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

export default function LiftScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isLight = colorScheme === "light";
  const { weightUnit } = useWeightUnits();
  
  const INITIAL_HAND_DATA: HandData = {
    left: { weight: 0, maxWeight: 0, unit: weightUnit },
    right: { weight: 0, maxWeight: 0, unit: weightUnit },
  };

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
    const initialHandData = { weight: 0, maxWeight: 0, unit: weightUnit };
    setHandData((prev) => ({
      ...prev,
      [selectedHand]: initialHandData,
    }));
    setCycleStarted(false);
    setCycleData((prev) => ({
      ...prev,
      [selectedHand]: INITIAL_CYCLE_HAND_DATA,
    }));
    setCurrentPoint(INITIAL_CYCLE_HAND_DATA[0]);
    reset();
  }, [selectedHand, reset, weightUnit]);

  const handleResetAll = useCallback(() => {
    const initialData = {
      left: { weight: 0, maxWeight: 0, unit: weightUnit },
      right: { weight: 0, maxWeight: 0, unit: weightUnit },
    };
    setHandData(initialData);
    setCycleStarted(false);
    setCycleData(INITIAL_CYCLE_DATA);
    reset();
  }, [reset, weightUnit]);

  // Update hand data units when weight unit changes
  useEffect(() => {
    setHandData((prev) => ({
      left: { ...prev.left, unit: weightUnit },
      right: { ...prev.right, unit: weightUnit },
    }));
  }, [weightUnit]);

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

  const summaryText = useMemo(
    () =>
      `Left: ${handData.left.maxWeight}${handData.left.unit} ${percentages.left}\nRight: ${handData.right.maxWeight}${handData.right.unit} ${percentages.right}`,
    [
      handData.left.maxWeight,
      handData.left.unit,
      handData.right.maxWeight,
      handData.right.unit,
      percentages.left,
      percentages.right,
    ]
  );

  const summaryView = useMemo(
    () => (
      <ThemedView style={styles.summaryContainer}>
        <ThemedView style={styles.summaryTitleContainer}>
          <ThemedText style={{ ...styles.summaryTitle, marginTop: 2 }}>
            Summary max
          </ThemedText>
          <CopyButton textToCopy={summaryText} />
        </ThemedView>
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
      summaryText,
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
          variant="connected"
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
  summaryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "bold",
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
