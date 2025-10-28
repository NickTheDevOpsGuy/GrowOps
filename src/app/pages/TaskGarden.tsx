import { useState } from "react";
import FocusTimer from "@/components/FocusTimer";
import TaskList from "@/components/TaskList";
import { PLANT_STAGES } from "@/components/icons";

// Small helper to render an icon component safely
function StageIcon({ stage, className }: { stage: number; className?: string }) {
  const Icon = PLANT_STAGES[Math.max(0, Math.min(stage, PLANT_STAGES.length - 1))];
  return <Icon className={className ?? "h-5 w-5"} />;
}

export default function TaskGarden() {
  // Garden: 8 tiles (4×2)
  const [plants, setPlants] = useState<number[]>(Array(8).fill(0));

  // “Which task am I doing?”
  const [currentTask, setCurrentTask] = useState<string | null>(null);

  // Timer state surfaced from FocusTimer
  const [isActive, setIsActive] = useState(false);

  // Session length (minutes)
  const [sessionMinutes, setSessionMinutes] = useState(25);

  // Visual feedback: which tile just grew, and to which stage
  const [lastGrownIndex, setLastGrownIndex] = useState<number | null>(null);
  const [lastGrownStage, setLastGrownStage] = useState<number | null>(null);

  function handleComplete() {
    // Grow a random plant one stage
    setPlants((prev) => {
      const next = [...prev];
      const i = Math.floor(Math.random() * next.length);
      next[i] = Math.min(next[i] + 1, PLANT_STAGES.length - 1);
      setLastGrownIndex(i);
      setLastGrownStage(next[i]);
      // MVP “session log”
      console.log({
        event: "session_complete",
        task: currentTask,
        minutes: sessionMinutes,
        endedAt: new Date().toISOString(),
        grewTile: i,
        newStageIndex: next[i],
      });
      return next;
    });
  }

  function handleResetGarden() {
    setPlants(Array(plants.length).fill(0));
    setLastGrownIndex(null);
    setLastGrownStage(null);
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-[#FBF7EF] p-6 text-neutral-900 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-bold">Task Garden 🌱</h1>
        <span className="text-sm text-neutral-700">[Day Streak: —]</span>
        <span className="text-sm text-neutral-700">[Total Focus: —]</span>
      </div>

      {/* 2×2 Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* TL: Tasks */}
        <section className="rounded-2xl border border-neutral-300 bg-[#FBF7EF] p-5">
          <h2 className="mb-3 text-lg font-semibold">Tasks</h2>
          <TaskList
            onSelect={setCurrentTask}
            selected={currentTask}
            disabled={isActive}
          />
        </section>

        {/* TR: Garden */}
        <section className="rounded-2xl border border-neutral-300 bg-[#FBF7EF] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Garden</h2>
            <button
              className="rounded-lg border px-3 py-1.5 text-sm"
              onClick={handleResetGarden}
              disabled={isActive}
              title={isActive ? "Stop the timer to reset" : "Reset garden"}
            >
              Reset Garden
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {plants.map((stageIndex, i) => (
              <div
                key={i}
                className={`grid h-16 w-16 place-items-center rounded-xl border ${
                  i === lastGrownIndex ? "score-bump ring-2 ring-green-400" : ""
                }`}
              >
                <StageIcon stage={stageIndex} className="h-7 w-7" />
              </div>
            ))}
          </div>
        </section>

        {/* BL: Timer */}
        <section className="rounded-2xl border border-neutral-300 bg-[#FBF7EF] p-5">
          <h2 className="mb-3 text-lg font-semibold">Timer</h2>

          {/* Optional context line */}
          {currentTask && (
            <div className="mb-2 text-sm text-neutral-700">Task: {currentTask}</div>
          )}

          <div className="space-y-4">
            <FocusTimer
              durationMs={sessionMinutes * 60_000}
              onComplete={handleComplete}
              startDisabled={!currentTask}
              onActiveChange={setIsActive}
            />

            {/* Simple progress track (static visual for MVP vibe) */}
            <div className="h-4 rounded-lg border">
              <div className="h-4 rounded-lg" style={{ width: "28%" }} />
            </div>
          </div>
        </section>

        {/* BR: Session */}
        <section className="rounded-2xl border border-neutral-300 bg-[#FBF7EF] p-5">
          <h2 className="mb-3 text-lg font-semibold">Timer / Session</h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-neutral-600">Task: </span>
              <span className="font-medium">{currentTask ?? "—"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-600">Stage: </span>
              <span
                key={lastGrownStage ?? -1}
                className={lastGrownStage !== null ? "score-bump" : ""}
                title={
                  lastGrownStage === null
                    ? "Soil"
                    : `Stage ${lastGrownStage + 1}`
                }
              >
                {/* If nothing grown yet, show stage 0 icon as “soil/seed” */}
                <StageIcon stage={lastGrownStage ?? 0} className="h-5 w-5" />
              </span>
            </div>

            <div className="text-sm">
              <span className="text-neutral-600">Session length: </span>
              <select
                className="ml-1 rounded border px-2 py-1"
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                disabled={isActive}
              >
                {[5, 10, 15, 25, 45].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="rounded-lg border px-4 py-2"
                onClick={() => {
                  // optional: add explicit abort trigger if you surface it later
                  alert("Use Abort in the Timer panel.");
                }}
              >
                Abort ✖︎
              </button>
              <button
                className="rounded-lg border px-4 py-2 font-medium"
                onClick={() => {
                  // optional: focus mode hook (future)
                  alert("Focus Mode coming soon.");
                }}
              >
                Focus Mode 🐦
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer tips */}
      <p className="mt-6 text-sm text-neutral-700">
        Tips: Stay in app for growth • Break: 5m after session
      </p>
    </div>
  );
}