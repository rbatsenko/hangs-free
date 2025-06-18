/* eslint-env jest */

// Mock react-native-ble-plx
jest.mock("react-native-ble-plx", () => {
  return {
    BleManager: jest.fn().mockImplementation(() => ({
      startDeviceScan: jest.fn(),
      stopDeviceScan: jest.fn(),
      connectToDevice: jest.fn(),
      monitorCharacteristicForDevice: jest.fn(),
      cancelTransaction: jest.fn(),
      isDeviceConnected: jest.fn(),
      discoverAllServicesAndCharacteristicsForDevice: jest.fn(),
      readCharacteristicForDevice: jest.fn(),
      writeCharacteristicWithResponseForDevice: jest.fn(),
      destroy: jest.fn(),
    })),
  };
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock ThemeContext
jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: jest.fn(() => ({
    themeMode: 'system',
    colorScheme: 'light',
    setThemeMode: jest.fn(),
  })),
  ThemeProvider: ({ children }) => children,
}));

// Add any other global mocks your tests need
