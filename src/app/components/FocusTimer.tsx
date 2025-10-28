// src/components/FocusTimer.tsx
import { useEffect, useState, useRef } from 'react';
import { useCountdown } from '@/hooks/useCountdown';

type Props = {
  durationMs: number;
  onComplete?: () => void; // (wire later);
  startDisabled?: boolean;
  onActiveChange?: (active: boolean) => void;
};

export default function FocusTimer({
  durationMs,
  onComplete,
  startDisabled,
  onActiveChange,
}: Props) {
  const { remainingMs, isActive, start, abort } = useCountdown();

  // TODO: replace with proper mm:ss formatting
  const wasRunningRef = useRef(false); // set true when you start the timer

  useEffect(() => {
    if (remainingMs <= 0 && wasRunningRef.current) {
      onComplete?.(); // 1) tell parent “we finished”
      onActiveChange?.(false); // 2) unlock TaskList / UI
      wasRunningRef.current = false; // 3) prevent double-fire
    }
  }, [remainingMs, onComplete, onActiveChange]);

  function formatMs(ms: number) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className='flex items-center gap-4'>
      <div className='font-mono text-5xl tabular-nums'>
        {formatMs(remainingMs)}
      </div>

      <button
        className='rounded border px-3 py-1'
        onClick={() => {
          wasRunningRef.current = true;
          start(durationMs);
          onActiveChange?.(true);
        }}
        disabled={isActive || startDisabled}
      >
        Start
      </button>

      <button
        className='rounded border px-3 py-1'
        onClick={() => {
          abort();
          wasRunningRef.current = false;
          onActiveChange?.(false);
        }}
        disabled={!isActive}
      >
        Abort
      </button>
    </div>
  );
}
