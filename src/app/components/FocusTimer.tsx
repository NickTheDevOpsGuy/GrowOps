// src/app/components/FocusTimer.tsx
import { useEffect, useRef } from 'react';
import type React from 'react';
import { useCountdown } from '@/hooks/useCountdown';

type Props = {
  /** Length of a focus session in milliseconds. */
  durationMs: number;
  /** Called when the timer finishes naturally (not on abort). */
  onComplete?: () => void;
  /** If true, Start button is disabled (e.g. when no task selected). */
  startDisabled?: boolean;
  /** Notify parent when timer becomes active/inactive. */
  onActiveChange?: (active: boolean) => void;
};

export default function FocusTimer({
  durationMs,
  onComplete,
  startDisabled,
  onActiveChange,
}: Props) {
  const { remainingMs, isActive, start, abort } = useCountdown();
  const wasRunningRef = useRef(false);

  // Fallback duration in case durationMs is bad (NaN, 0, etc.)
  const fallbackDurationMs = 25 * 60_000; // 25 minutes
  const effectiveDurationMs =
    Number.isFinite(durationMs) && durationMs > 0
      ? durationMs
      : fallbackDurationMs;

  // Let parent know when active state changes
  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  // Fire onComplete once when we hit 0 after a run
  useEffect(() => {
    if (!isActive && wasRunningRef.current && remainingMs === 0) {
      wasRunningRef.current = false;
      onComplete?.();
      onActiveChange?.(false);
    }
  }, [isActive, remainingMs, onComplete, onActiveChange]);

  // Decide what to display:
  // - if running or we still have a remaining value, show that
  // - otherwise show the normalized session length
  const displayMs =
    isActive || remainingMs > 0 ? remainingMs : effectiveDurationMs;

  const safeMs = Number.isFinite(displayMs) && displayMs > 0 ? displayMs : 0;

  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const handleStartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isActive || startDisabled) return;
    wasRunningRef.current = true;
    start(effectiveDurationMs);
    onActiveChange?.(true);
  };

  const handleAbortClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isActive) return;
    abort();
    wasRunningRef.current = false;
    onActiveChange?.(false);
  };

  return (
    <div className='flex items-center justify-between gap-4 rounded-xl border border-neutral-300 bg-white px-4 py-3 shadow-sm'>
      <div className='flex flex-col'>
        <span className='text-xs uppercase tracking-wide text-neutral-500'>
          Focus Time
        </span>
        <span className='font-mono text-3xl tabular-nums text-neutral-900'>
          {formatted}
        </span>
        <span className='text-xs text-neutral-500'>
          {isActive ? 'Session in progress' : 'Ready to start'}
        </span>
      </div>

      <div className='flex gap-2'>
        <button
          type='button'
          className='rounded border border-emerald-500 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60'
          onClick={handleStartClick}
          disabled={isActive || !!startDisabled}
          title={
            isActive
              ? 'Timer is already running'
              : startDisabled
                ? 'Select a task to enable Start'
                : 'Start focus session'
          }
        >
          Start
        </button>

        <button
          type='button'
          className='rounded border border-neutral-400 bg-neutral-50 px-3 py-1 text-sm text-neutral-800 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60'
          onClick={handleAbortClick}
          disabled={!isActive}
          title={!isActive ? 'Timer is not running' : 'Abort current session'}
        >
          Abort
        </button>
      </div>
    </div>
  );
}
