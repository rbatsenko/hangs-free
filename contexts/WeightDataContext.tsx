import { createContext, useContext, ReactNode, useMemo } from "react";

import { useScale } from "@/hooks/useScale";
import { useTindeq } from "@/hooks/useTindeq";
import { WeightData, WeightDataPoint } from "@/types/weight";

import { useSelectedDevice } from "./SelectedDeviceContext";

interface WeightDataContextType {
  weightData: WeightData;
  weightDataPoints: WeightDataPoint[];
  reset: () => void;
  scanAndConnect?: () => void;
  stopScanning?: () => void;
  stopMonitoring?: () => void;
  tare?: () => void;
  isConnected?: boolean;
  isMonitoring?: boolean;
  error?: string | null;
  isLoading?: boolean;
}

const WeightDataContext = createContext<WeightDataContextType | undefined>(
  undefined
);

export function WeightDataProvider({ children }: { children: ReactNode }) {
  const { selectedDevice } = useSelectedDevice();
  const tindeq = useTindeq();
  const scale = useScale({ selectedDevice });

  const deviceState = useMemo(
    () => (selectedDevice === "whc06" ? scale : tindeq),
    [selectedDevice, scale, tindeq]
  );

  return (
    <WeightDataContext.Provider value={deviceState}>
      {children}
    </WeightDataContext.Provider>
  );
}

export function useWeightData() {
  const context = useContext(WeightDataContext);
  if (context === undefined) {
    throw new Error("useWeightData must be used within a WeightDataProvider");
  }
  return context;
}
