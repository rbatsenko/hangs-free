import { ThemedText } from "@/components/ui";
import { useWeightUnits } from "@/contexts/WeightUnitsContext";
import { WeightDataPoint } from "@/types/weight";

const formatElapsedTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
    .toString()
    .padStart(2, "0");
  const milliseconds = (ms % 1000).toString().padStart(3, "0");
  return `${seconds}s ${milliseconds}ms`;
};

type CycleWeightDisplayProps = {
  cycleStarted: boolean;
  currentWeight: number;
  unit: string;
  elapsedTime: number;
  currentPoint: WeightDataPoint | null;
  lastPoint: WeightDataPoint;
  cycleStartTime: number;
};

export function CycleWeightDisplay({
  cycleStarted,
  currentWeight,
  unit,
  elapsedTime,
  currentPoint,
  lastPoint,
  cycleStartTime,
}: CycleWeightDisplayProps) {
  const { formatWeight } = useWeightUnits();
  
  const formatTimestamp = (timestamp: number) => {
    const elapsedMs = timestamp - cycleStartTime;
    return formatElapsedTime(elapsedMs);
  };

  if (cycleStarted) {
    return (
      <ThemedText>
        {formatWeight(currentWeight)}
        {unit} at {formatElapsedTime(elapsedTime)}
      </ThemedText>
    );
  }

  const weight = currentPoint?.weight ?? lastPoint.weight;
  const timestamp = currentPoint?.timestamp ?? lastPoint.timestamp;

  return (
    <ThemedText>
      {formatWeight(weight)}
      {unit} at {formatTimestamp(timestamp)}
    </ThemedText>
  );
}
