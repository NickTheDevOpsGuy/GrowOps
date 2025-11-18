// src/hooks/useCountdown.ts
import { useEffect, useRef, useState } from 'react';

export function useCountdown() {
  const [remainingMs, setRemainingMs] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef<number | null>(null);

  const start = (durationMs: number) => {
    if (isActive || intervalRef.current) return;

    setIsActive(true);
    targetRef.current = Date.now() + durationMs;
    setRemainingMs(durationMs);

    intervalRef.current = setInterval(() => {
      if (!targetRef.current) return;

      const next = Math.max(0, targetRef.current - Date.now());
      setRemainingMs(next);

      if (next === 0) {
        window.clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsActive(false);
      }
    }, 1000);
  };

  const abort = () => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    setRemainingMs(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    remainingMs,
    isActive,
    start,
    abort,
  };
}
