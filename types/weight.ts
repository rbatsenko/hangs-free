export interface WeightData {
  weight: number;
  unit: "kg" | "lb";
}

export interface WeightDataWithMax extends WeightData {
  maxWeight: number;
}

export interface WeightDataPoint {
  weight: number;
  timestamp: number;
}
