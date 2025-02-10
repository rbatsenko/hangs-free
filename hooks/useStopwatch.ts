import { useCallback, useEffect, useRef, useState } from "react";

export const useStopwatch = (isRunning: boolean) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
    startTimeRef.current = null;
    setElapsedTime(0);
  }, []);

  const updateTimer = useCallback(() => {
    if (!startTimeRef.current) return;

    setElapsedTime(Date.now() - startTimeRef.current);
    frameIdRef.current = requestAnimationFrame(updateTimer);
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    frameIdRef.current = requestAnimationFrame(updateTimer);
  }, [updateTimer]);

  useEffect(() => {
    if (isRunning) {
      startTimer();
    } else {
      stopTimer();
    }

    return stopTimer;
  }, [isRunning, startTimer, stopTimer]);

  return elapsedTime;
};
