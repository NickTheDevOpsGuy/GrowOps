// src/components/FocusTimer.tsx
import { useEffect, useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { PLANT_ICONS, PlantStage } from "@/lib/garden";

type Props = {
  durationMs: number;
  onComplete?: () => void; // (wire later)
};

export default function FocusTimer({ durationMs, onComplete }: Props) {
  const { remainingMs, isActive, start, abort } = useCountdown();
  const [stage, setStage] = useState<PlantStage>(PLANT_ICONS[0]);

  // TODO: replace with proper mm:ss formatting
  const formatMs = (ms: number) => `${Math.ceil(ms / 1000)}s`;

  // TODO (later): call onComplete exactly once when a run hits 0
  useEffect(() => {
    // if (remainingMs === 0 && onComplete) onComplete();
  }, [remainingMs, onComplete]);

  return (
    <div className="flex items-center gap-4">
      <div className="font-mono text-5xl tabular-nums">
        {formatMs(remainingMs)}
      </div>

      <button
        className="rounded border px-3 py-1"
        onClick={() => start(durationMs)}
        disabled={isActive}
      >
        Start
      </button>

      <button
        className="rounded border px-3 py-1"
        onClick={abort}
        disabled={!isActive}
      >
        Abort
      </button>
    </div>
  );
}
