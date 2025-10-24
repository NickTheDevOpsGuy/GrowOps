// src/hooks/useCountdown.ts
import { useEffect, useRef, useState } from "react";

export function useCountdown() {
  // 🕒 internal state
  const [remainingMs, setRemainingMs] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // 🔁 store interval id here (DOM version so TS is happy)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 🕓 finish-line timestamp
  const targetRef = useRef<number | null>(null);

  // 🚀 start timer
  const start = (durationMs: number) => {
    // prevent double-starts
    if (isActive || intervalRef.current) return;

    setIsActive(true);
    targetRef.current = Date.now() + durationMs;
    setRemainingMs(durationMs); // show full duration instantly

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

  // ⏹️ abort timer
  const abort = () => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  };

  // 🧹 cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // 📦 expose API
  return {
    remainingMs,
    isActive,
    start,
    abort,
  };
}
