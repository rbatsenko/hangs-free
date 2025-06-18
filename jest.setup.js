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

// Mock MMKV
jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(() => undefined),
    getNumber: jest.fn(() => undefined),
    getBoolean: jest.fn(() => undefined),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
    contains: jest.fn(() => false),
  })),
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
