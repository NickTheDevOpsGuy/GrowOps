// src/app/pages/TaskGarden.tsx
import { useEffect, useState } from 'react';
import FocusTimer from '@/components/FocusTimer';
import TaskList from '@/components/TaskList';
import { PLANT_STAGES } from '@/components/icons';

// ---- localStorage keys
const LS_TASKS = 'growops_tasks';
const LS_MINUTES = 'growops_minutes';
const LS_PLANTS = 'growops_plants';
const LS_SESSIONS = 'growops_sessions';

// ---- types
type Session = {
  task: string | null;
  minutes: number;
  endedAt: string; // ISO timestamp
};

// Safe stage icon renderer
function StageIcon({
  stage,
  className,
}: {
  stage: number;
  className?: string;
}) {
  const idx = Math.max(0, Math.min(stage, PLANT_STAGES.length - 1));
  const Icon = PLANT_STAGES[idx];
  return <Icon className={className ?? 'h-5 w-5'} />;
}

// yyyy-mm-dd
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function TaskGarden() {
  // ---------- State
  const [plants, setPlants] = useState<number[]>(Array(8).fill(0));
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [lastGrownIndex, setLastGrownIndex] = useState<number | null>(null);
  const [lastGrownStage, setLastGrownStage] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  // Dynamic tasks
  const [tasks, setTasks] = useState<string[]>([]);

  // Sessions + derived metrics
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dayStreak, setDayStreak] = useState(0);
  const [totalFocusMin, setTotalFocusMin] = useState(0);

  // ---------- Persistence: hydrate on mount
  useEffect(() => {
    try {
      const rawTasks = localStorage.getItem(LS_TASKS);
      if (rawTasks) {
        const parsed = JSON.parse(rawTasks);
        if (Array.isArray(parsed))
          setTasks(parsed.filter((t) => typeof t === 'string'));
      }
    } catch {}

    try {
      const rawMin = localStorage.getItem(LS_MINUTES);
      if (rawMin) {
        const num = Number(rawMin);
        if (!Number.isNaN(num) && num > 0) setSessionMinutes(num);
      }
    } catch {}

    try {
      const rawPlants = localStorage.getItem(LS_PLANTS);
      if (rawPlants) {
        const parsed = JSON.parse(rawPlants);
        if (Array.isArray(parsed) && parsed.every((n) => Number.isInteger(n))) {
          const eight = Array(8)
            .fill(0)
            .map((_, i) => parsed[i] ?? 0);
          setPlants(eight);
        }
      }
    } catch {}

    try {
      const rawSessions = localStorage.getItem(LS_SESSIONS);
      if (rawSessions) {
        const parsed = JSON.parse(rawSessions);
        if (Array.isArray(parsed)) {
          const clean: Session[] = parsed
            .filter(
              (s) =>
                s &&
                typeof s.minutes === 'number' &&
                typeof s.endedAt === 'string'
            )
            .map((s) => ({
              task: typeof s.task === 'string' ? s.task : null,
              minutes: s.minutes,
              endedAt: s.endedAt,
            }));
          setSessions(clean);
        }
      }
    } catch {}
  }, []);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem(LS_TASKS, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_MINUTES, String(sessionMinutes));
    } catch {}
  }, [sessionMinutes]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_PLANTS, JSON.stringify(plants));
    } catch {}
  }, [plants]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
    } catch {}

    // Recompute metrics whenever sessions change
    const total = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);

    const daysWithSessions = new Set(
      sessions.map((s) => s.endedAt.slice(0, 10))
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; ; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (daysWithSessions.has(ymd(d))) streak++;
      else break;
    }

    setTotalFocusMin(total);
    setDayStreak(streak);
  }, [sessions]);

  // Esc to close focus mode
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFocusMode(false);
    }
    if (focusMode) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusMode]);

  // ---------- Task handlers
  function addTask(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTasks((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }
  function removeTask(name: string) {
    setTasks((prev) => prev.filter((t) => t !== name));
    if (currentTask === name) setCurrentTask(null);
  }

  // ---------- Timer completion → grow plant + add session + log
  function handleComplete() {
    // 1) Record session
    const endedAt = new Date().toISOString();
    setSessions((prev) => [
      ...prev,
      { task: currentTask, minutes: sessionMinutes, endedAt },
    ]);

    // 2) Grow a random plant one stage
    setPlants((prev) => {
      const next = [...prev];
      const i = Math.floor(Math.random() * next.length);
      next[i] = Math.min(next[i] + 1, PLANT_STAGES.length - 1);
      setLastGrownIndex(i);
      setLastGrownStage(next[i]);
      return next;
    });

    // 3) Console log (MVP telemetry)
    console.log({
      event: 'session_complete',
      task: currentTask,
      minutes: sessionMinutes,
      endedAt,
    });
  }

  function handleResetGarden() {
    setPlants(Array(plants.length).fill(0));
    setLastGrownIndex(null);
    setLastGrownStage(null);
  }

  return (
    <div className='relative mx-auto min-h-screen max-w-5xl bg-[#FBF7EF] p-6 text-neutral-900 md:p-8'>
      {/* Header */}
      <div className='mb-6 flex flex-wrap items-baseline gap-3'>
        <h1 className='text-2xl font-bold'>Task Garden 🌱</h1>
        <span className='text-sm text-neutral-700'>
          [Day Streak: {dayStreak}]
        </span>
        <span className='text-sm text-neutral-700'>
          [Total Focus: {totalFocusMin}m]
        </span>
      </div>

      {/* 2×2 Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* TL: Tasks */}
        <section className='rounded-2xl border border-neutral-300 bg-[#FBF7EF] p-5'>
          <h2 className='mb-3 text-lg font-semibold'>Tasks</h2>
          <TaskList
            tasks={tasks}
            onAdd={addTask}
            onRemove={removeTask}
            onSelect={setCurrentTask}
            selected={currentTask}
            disabled={isActive}
          />
        </section>

        {/* TR: Garden */}
        <section className='rounded-2xl border border-neutral-300 bg-[#FBF7EF] p-5'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Garden</h2>
            <button
              className='rounded-lg border px-3 py-1.5 text-sm'
              onClick={handleResetGarden}
              disabled={isActive}
              title={isActive ? 'Stop the timer to reset' : 'Reset garden'}
            >
              Reset Garden
            </button>
          </div>

          <div className='grid grid-cols-4 gap-3'>
            {plants.map((stageIndex, i) => (
              <div
                key={i}
                className={`grid h-16 w-16 place-items-center rounded-xl border ${
                  i === lastGrownIndex ? 'score-bump ring-2 ring-green-400' : ''
                }`}
                title={`Tile ${i + 1} — Stage ${stageIndex + 1}`}
              >
                <StageIcon stage={stageIndex} className='h-7 w-7' />
              </div>
            ))}
          </div>
        </section>

        {/* BL: Timer */}
        <section className='rounded-2xl border border-neutral-300 bg-[#FBF7EF] p-5'>
          <h2 className='mb-3 text-lg font-semibold'>Timer</h2>

          {currentTask && (
            <div className='mb-2 text-sm text-neutral-700'>
              Task: {currentTask}
            </div>
          )}

          <div className='space-y-4'>
            <FocusTimer
              durationMs={sessionMinutes * 60_000}
              onComplete={handleComplete}
              startDisabled={!currentTask}
              onActiveChange={setIsActive}
            />

            {/* Static track (visual only) */}
            <div className='h-4 rounded-lg border'>
              <div className='h-4 rounded-lg' style={{ width: '28%' }} />
            </div>
          </div>
        </section>

        {/* BR: Session */}
        <section className='rounded-2xl border border-neutral-300 bg-[#FBF7EF] p-5'>
          <h2 className='mb-3 text-lg font-semibold'>Timer / Session</h2>
          <div className='space-y-4 text-sm'>
            <div>
              <span className='text-neutral-600'>Task: </span>
              <span className='font-medium'>{currentTask ?? '—'}</span>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-neutral-600'>Stage: </span>
              <span
                key={lastGrownStage ?? -1}
                className={lastGrownStage !== null ? 'score-bump' : ''}
                title={
                  lastGrownStage === null
                    ? 'Soil'
                    : `Stage ${lastGrownStage + 1}`
                }
              >
                <StageIcon stage={lastGrownStage ?? 0} className='h-5 w-5' />
              </span>
            </div>

            <div className='text-sm'>
              <span className='text-neutral-600'>Session length: </span>
              <select
                className='ml-1 rounded border px-2 py-1'
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

            <div className='flex gap-3'>
              <button
                className='rounded-lg border px-4 py-2'
                onClick={() => setFocusMode(true)}
                disabled={!currentTask}
                title={currentTask ? 'Enter focus mode' : 'Select a task first'}
              >
                Focus Mode 🐦
              </button>
              <button
                className='rounded-lg border px-4 py-2'
                onClick={handleResetGarden}
                disabled={isActive}
              >
                Reset Garden
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Focus Mode Overlay ---------- */}
      {focusMode && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm'
          // Close on backdrop click
          onClick={(e) => {
            if (e.target === e.currentTarget) setFocusMode(false);
          }}
        >
          <div
            className='w-full max-w-xl rounded-2xl border border-neutral-700 bg-[#0c0c0c] p-6 text-white shadow-2xl'
            onClick={(e) => e.stopPropagation()} // don't close when clicking inside
          >
            <div className='mb-4 flex items-center justify-between'>
              <div className='text-sm text-neutral-300'>
                Task: <span className='font-medium'>{currentTask}</span>
              </div>
              <div className='flex gap-2'>
                {isActive && (
                  <button
                    type='button'
                    className='rounded-lg border border-red-600 px-3 py-1.5 text-sm text-red-400'
                    onClick={() => setIsActive(false)}
                  >
                    Abort ✖︎
                  </button>
                )}
                <button
                  type='button'
                  className='rounded-lg border border-neutral-600 px-3 py-1.5 text-sm'
                  onClick={() => setFocusMode(false)}
                  title='Exit focus mode'
                >
                  Exit
                </button>
              </div>
            </div>

            <div className='space-y-6'>
              <FocusTimer
                durationMs={sessionMinutes * 60_000}
                onComplete={() => {
                  handleComplete();
                  setIsActive(false);
                  setFocusMode(false); // auto-exit on complete
                }}
                startDisabled={!currentTask}
                onActiveChange={setIsActive}
              />

              <div className='h-3 rounded-lg border border-neutral-700'>
                <div
                  className='h-3 rounded-lg bg-neutral-200'
                  style={{ width: '28%' }}
                />
              </div>

              <p className='text-xs text-neutral-400'>
                Tip: Click the dark backdrop, press <kbd>Esc</kbd>, or use Exit
                to leave focus mode.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
