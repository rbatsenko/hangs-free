export interface WeightData {
  weight: number;
  unit: "kg" | "lb";
  // Optional metadata from scale device
  deviceUnit?: "kg" | "lb";
  stable?: boolean;
  rawWeight?: number;
}

export interface WeightDataWithMax extends WeightData {
  maxWeight: number;
}

export interface WeightDataPoint {
  weight: number;
  timestamp: number;
}
