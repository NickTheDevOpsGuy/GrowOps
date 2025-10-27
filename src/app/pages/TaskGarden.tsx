// src/app/pages/TaskGarden.tsx
import FocusTimer from "@/components/FocusTimer";
import { useState } from "react";
import { PLANT_STAGES } from "@/components/icons";

export default function TaskGarden() {
  const [stage, setStage] = useState(0);
  const Icon = PLANT_STAGES[stage];

  const [plants, setPlants] = useState<number[]>(Array(12).fill(0));

  function handleComplete() {
    setPlants((prev) => {
      const next = [...prev];
      const i = Math.floor(Math.random() * next.length);
      next[i] = Math.min(next[i] + 1, PLANT_STAGES.length - 1);
      return next;
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">GrowOps 🌿</h1>

      {/* 1️⃣ tasks placeholder */}
      <div className="w-full max-w-md rounded-lg border p-4 text-center">
        <p className="text-sm text-gray-500">[TaskList coming soon]</p>
      </div>

      {/* 2️⃣ garden placeholder */}
      <div className="grid grid-cols-4 gap-3">
        {plants.map((stageIndex, i) => {
          const TileIcon = PLANT_STAGES[stageIndex];
          return (
            <div
              key={i}
              className="grid h-12 w-12 place-items-center rounded-lg border"
            >
              <TileIcon className="size-6" />
            </div>
          );
        })}
      </div>

      {/* 3️⃣ timer */}
      <FocusTimer durationMs={10_000} onComplete={handleComplete} />
    </div>
  );
}
