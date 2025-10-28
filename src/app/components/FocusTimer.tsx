import { useEffect, useRef } from 'react';
import { useCountdown } from '@/hooks/useCountdown';

type Props = {
  durationMs: number;
  onComplete?: () => void;
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
  const wasRunningRef = useRef(false);

  // Fire completion once when countdown hits 0
  useEffect(() => {
    if (remainingMs <= 0 && wasRunningRef.current) {
      onComplete?.();
      onActiveChange?.(false);
      wasRunningRef.current = false;
    }
  }, [remainingMs, onComplete, onActiveChange]);

  function formatMs(ms: number) {
    const safe = Math.max(ms, 0);
    const totalSeconds = Math.ceil(safe / 1000);
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
        disabled={isActive || !!startDisabled}
        title={
          isActive
            ? 'Timer is already running'
            : startDisabled
              ? 'Select a task to enable Start'
              : 'Start session'
        }
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
        title={!isActive ? 'Timer is not running' : 'Abort current session'}
      >
        Abort
      </button>
    </div>
  );
}
