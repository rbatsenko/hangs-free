import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";

export type DeviceType = "tindeq" | "whc06";

interface SelectedDeviceContextType {
  selectedDevice: DeviceType;
  setDevice: (device: DeviceType) => void;
}

const SelectedDeviceContext = createContext<
  SelectedDeviceContextType | undefined
>(undefined);

export function SelectedDeviceProvider({ children }: { children: ReactNode }) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("whc06");

  const setDevice = useCallback((device: DeviceType) => {
    setSelectedDevice(device);
  }, []);

  const value = useMemo(
    () => ({
      selectedDevice,
      setDevice,
    }),
    [selectedDevice, setDevice]
  );

  return (
    <SelectedDeviceContext.Provider value={value}>
      {children}
    </SelectedDeviceContext.Provider>
  );
}

export function useSelectedDevice() {
  const context = useContext(SelectedDeviceContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedDevice must be used within a SelectedDeviceProvider"
    );
  }
  return context;
}
