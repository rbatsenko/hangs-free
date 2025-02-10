import { renderHook, act } from "@testing-library/react-native";

import { useStopwatch } from "../useStopwatch";

describe("useStopwatch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock requestAnimationFrame and cancelAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) =>
      setTimeout(callback, 16)
    );
    global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));
    jest.spyOn(Date, "now").mockImplementation(() => 1000); // Start at 1000ms
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("starts at 0 when not running", () => {
    const { result } = renderHook(() => useStopwatch(false));
    expect(result.current).toBe(0);
  });

  it("starts counting when isRunning becomes true", () => {
    const { result, rerender } = renderHook(
      ({ isRunning }) => useStopwatch(isRunning),
      {
        initialProps: { isRunning: false },
      }
    );

    // Start the stopwatch
    jest.spyOn(Date, "now").mockReturnValue(1000);
    rerender({ isRunning: true });

    // Advance time by 500ms
    jest.spyOn(Date, "now").mockReturnValue(1500);
    act(() => {
      jest.advanceTimersByTime(16); // One frame
    });

    expect(result.current).toBe(500);
  });

  it("stops counting when isRunning becomes false", () => {
    const { result, rerender } = renderHook(
      ({ isRunning }) => useStopwatch(isRunning),
      {
        initialProps: { isRunning: true },
      }
    );

    // Advance time
    jest.spyOn(Date, "now").mockReturnValue(2000);
    act(() => {
      jest.advanceTimersByTime(16);
    });

    // Stop the stopwatch
    rerender({ isRunning: false });

    expect(result.current).toBe(0);
  });

  it("resets to 0 when stopped", () => {
    const { result, rerender } = renderHook(
      ({ isRunning }) => useStopwatch(isRunning),
      {
        initialProps: { isRunning: true },
      }
    );

    // Advance time
    jest.spyOn(Date, "now").mockReturnValue(2000);
    act(() => {
      jest.advanceTimersByTime(16);
    });

    // Stop and verify reset
    rerender({ isRunning: false });

    expect(result.current).toBe(0);
  });

  it("cancels animation frame on cleanup", () => {
    const { unmount } = renderHook(() => useStopwatch(true));

    act(() => {
      unmount();
    });

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("updates continuously while running", () => {
    const { result } = renderHook(() => useStopwatch(true));

    // Advance time in multiple steps
    jest.spyOn(Date, "now").mockReturnValue(1100);
    act(() => {
      jest.advanceTimersByTime(16);
    });
    expect(result.current).toBe(100);

    jest.spyOn(Date, "now").mockReturnValue(1200);
    act(() => {
      jest.advanceTimersByTime(16);
    });
    expect(result.current).toBe(200);
  });
});
