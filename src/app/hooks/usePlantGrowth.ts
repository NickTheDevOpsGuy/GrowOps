// src/app/hooks/usePlantGrowth.ts
import { useState } from 'react';

export function usePlantGrowth(maxStage = 3) {
  const [stage, setStage] = useState(0);
  const [isGrowing, setIsGrowing] = useState(false);

  const advance = () => setStage((s) => Math.min(s + 1, maxStage));
  const start = () => setIsGrowing(true);
  const stop = () => setIsGrowing(false);
  const reset = () => {
    setIsGrowing(false);
    setStage(0);
  };

  return { stage, isGrowing, start, stop, reset, advance };
}