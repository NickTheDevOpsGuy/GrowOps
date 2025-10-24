// src/app/pages/TaskGarden.tsx
import FocusTimer from "@/components/FocusTimer";
import { useEffect, useState } from "react";
import { PLANT_ICONS, PlantStage } from "@/lib/garden";

const [plants, setPlants] = useState<number[]>(Array(12).fill(0));

function handleComplete() {
  setPlants(prev => {
    const next = [...prev];
    const i = Math.floor(Math.random() * next.length);   // random tile
    next[i] = Math.min(next[i] + 1, PLANT_ICONS.length - 1); // bump stage
    return next;
  });
}

export default function TaskGarden() {
  const [stage, setStage] = useState(0);
  const [plants, setPlants] = useState<number[]>(Array(12).fill(0));
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">GrowOps 🌿</h1>

      {/* 1️⃣ tasks placeholder */}
      <div className="w-full max-w-md rounded-lg border p-4 text-center">
        <p className="text-sm text-gray-500">[TaskList coming soon]</p>
      </div>

      {/* 2️⃣ garden placeholder */}
      <div className="grid grid-cols-4 gap-3">
        {plants.map((stageIndex, i) => (
          <div key={i} className="...">
            {PLANT_ICONS[stageIndex]}
          </div>
        ))}
      </div>

      {/* 3️⃣ timer */}
      <FocusTimer durationMs={10_000} />
    </div>
  );
}
