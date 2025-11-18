// src/app/pages/TaskGarden.tsx
import { useEffect, useMemo, useState } from 'react';
import FocusTimer from '@/components/FocusTimer';
import TaskList from '@/components/TaskList';
import { PLANT_STAGES } from '@/components/icons';

// ---- localStorage keys
const LS_TASKS = 'growops_tasks';
const LS_MINUTES = 'growops_minutes';
const LS_PLANTS = 'growops_plants';
const LS_SESSIONS = 'growops_sessions';

type Session = {
  task: string | null;
  minutes: number;
  endedAt: string; // ISO timestamp
};

// Compute a simple streak: number of days (including today) that have at least
// one session, counting backwards until a gap is found.
function computeDayStreak(sessions: Session[]): number {
  if (!sessions.length) return 0;
  const byDate = new Set(
    sessions.map((s) => new Date(s.endedAt).toISOString().slice(0, 10))
  );
  const cursor = new Date();
  let streak = 0;

  while (true) {
    const isoDay = cursor.toISOString().slice(0, 10);
    if (!byDate.has(isoDay)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function computeTotalMinutes(sessions: Session[]): number {
  return sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
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

  const [tasks, setTasks] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dayStreak, setDayStreak] = useState(0);
  const [totalFocusMin, setTotalFocusMin] = useState(0);

  // ---------- Persistence: hydrate on mount
  useEffect(() => {
    try {
      const rawTasks = localStorage.getItem(LS_TASKS);
      if (rawTasks) {
        const parsed = JSON.parse(rawTasks);
        if (Array.isArray(parsed)) {
          setTasks(parsed.filter((t) => typeof t === 'string'));
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawMinutes = localStorage.getItem(LS_MINUTES);
      if (rawMinutes) {
        const parsed = Number.parseInt(rawMinutes, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          setSessionMinutes(parsed);
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawPlants = localStorage.getItem(LS_PLANTS);
      if (rawPlants) {
        const parsed = JSON.parse(rawPlants);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.map((v: unknown) =>
            typeof v === 'number' && Number.isFinite(v) ? v : 0
          );
          const next = Array(8)
            .fill(0)
            .map((_, i) => cleaned[i] ?? 0);
          setPlants(next);
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawSessions = localStorage.getItem(LS_SESSIONS);
      if (rawSessions) {
        const parsed = JSON.parse(rawSessions);
        if (Array.isArray(parsed)) {
          const cleaned: Session[] = (parsed as unknown[])
            .map((raw: unknown) => {
              const s = raw as Partial<Session>;
              return {
                task:
                  typeof s.task === 'string' || s.task === null ? s.task : null,
                minutes:
                  typeof s.minutes === 'number' && Number.isFinite(s.minutes)
                    ? s.minutes
                    : 25,
                endedAt:
                  typeof s.endedAt === 'string'
                    ? s.endedAt
                    : new Date().toISOString(),
              };
            })
            .sort(
              (a, b) =>
                new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime()
            );
          setSessions(cleaned);
          setDayStreak(computeDayStreak(cleaned));
          setTotalFocusMin(computeTotalMinutes(cleaned));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem(LS_TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_MINUTES, String(sessionMinutes));
    } catch {
      // ignore
    }
  }, [sessionMinutes]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_PLANTS, JSON.stringify(plants));
    } catch {
      // ignore
    }
  }, [plants]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  // ---------- Task helpers
  function addTask(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTasks((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }

  function removeTask(name: string) {
    setTasks((prev) => prev.filter((t) => t !== name));
    setCurrentTask((prev) => (prev === name ? null : prev));
  }

  // ---------- Timer + plants
  function handleComplete() {
    const endedAt = new Date().toISOString();

    setSessions((prev) => {
      const next = [
        ...prev,
        { task: currentTask, minutes: sessionMinutes, endedAt },
      ];
      setDayStreak(computeDayStreak(next));
      setTotalFocusMin(computeTotalMinutes(next));
      return next;
    });

    setPlants((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      const index = Math.floor(Math.random() * next.length);
      const maxStage = PLANT_STAGES.length - 1;
      const newStage = Math.min(next[index] + 1, maxStage);
      next[index] = newStage;
      setLastGrownIndex(index);
      setLastGrownStage(newStage);
      return next;
    });
  }

  function handleResetGarden() {
    setPlants(Array(8).fill(0));
    setLastGrownIndex(null);
    setLastGrownStage(null);
  }

  function handleResetStats() {
    setSessions([]);
    setDayStreak(0);
    setTotalFocusMin(0);
  }

  const totalSessions = sessions.length;
  const totalHours = useMemo(
    () => (totalFocusMin / 60).toFixed(1),
    [totalFocusMin]
  );

  function openFocusMode() {
    setFocusMode(true);
  }

  function closeFocusMode() {
    setFocusMode(false);
  }

  // ---------- Render
  return (
    <div className='min-h-screen bg-emerald-50 px-4 py-6 text-neutral-900'>
      <div className='mx-auto max-w-5xl space-y-6'>
        <header className='flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold'>GrowOps</h1>
            <p className='text-sm text-neutral-600'>
              Grow a tiny productivity garden with each focus session.
            </p>
          </div>
          <div className='rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-neutral-700 shadow-sm'>
            <div>
              <span className='font-semibold'>{dayStreak}</span> day streak
            </div>
            <div>
              <span className='font-semibold'>{totalSessions}</span> sessions ·{' '}
              <span className='font-semibold'>{totalFocusMin}</span> min (
              {totalHours} h)
            </div>
          </div>
        </header>

        <main className='grid gap-4 md:grid-cols-[2fr,2fr] lg:grid-cols-[2fr,2fr]'>
          {/* Tasks + Timer */}
          <section className='space-y-4'>
            <div className='rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm'>
              <div className='mb-3 flex items-center justify-between gap-2'>
                <h2 className='text-sm font-semibold uppercase tracking-wide text-neutral-600'>
                  Tasks
                </h2>
                {currentTask && (
                  <p className='text-xs text-neutral-500'>
                    Selected:{' '}
                    <span className='font-medium text-neutral-800'>
                      {currentTask}
                    </span>
                  </p>
                )}
              </div>

              <TaskList
                tasks={tasks}
                onAdd={addTask}
                onRemove={removeTask}
                onSelect={setCurrentTask}
                selected={currentTask}
                disabled={isActive}
              />
            </div>

            <div className='rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm'>
              <div className='mb-3 flex items-center justify-between gap-2'>
                <h2 className='text-sm font-semibold uppercase tracking-wide text-neutral-600'>
                  Timer &amp; Session
                </h2>
                <div className='flex items-center gap-2 text-xs text-neutral-500'>
                  <label className='flex items-center gap-1'>
                    Length:
                    <input
                      type='number'
                      min={5}
                      max={120}
                      step={5}
                      value={sessionMinutes}
                      onChange={(e) =>
                        setSessionMinutes(
                          Math.max(5, Number.parseInt(e.target.value, 10) || 25)
                        )
                      }
                      className='w-14 rounded border border-neutral-300 px-1 py-0.5 text-xs'
                      disabled={isActive}
                    />
                    min
                  </label>
                </div>
              </div>

              <FocusTimer
                durationMs={sessionMinutes * 60_000}
                onComplete={handleComplete}
                startDisabled={!currentTask}
                onActiveChange={setIsActive}
              />

              <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
                <button
                  type='button'
                  onClick={openFocusMode}
                  className='rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-1 font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-60'
                  disabled={!currentTask}
                >
                  Focus Mode
                </button>
                <button
                  type='button'
                  onClick={handleResetStats}
                  className='rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1 text-neutral-700 hover:bg-neutral-100'
                  disabled={!sessions.length}
                >
                  Reset Stats
                </button>
              </div>
            </div>
          </section>

          {/* Garden */}
          <section className='space-y-4'>
            <div className='rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm'>
              <div className='mb-3 flex items-center justify-between gap-2'>
                <h2 className='text-sm font-semibold uppercase tracking-wide text-neutral-600'>
                  Garden
                </h2>
                {lastGrownIndex != null && lastGrownStage != null && (
                  <p className='text-xs text-neutral-500'>
                    Last growth: plot {lastGrownIndex + 1} · stage{' '}
                    {lastGrownStage + 1}/{PLANT_STAGES.length}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-4 gap-3'>
                {plants.map((stage, index) => {
                  const StageIcon =
                    PLANT_STAGES[Math.min(stage, PLANT_STAGES.length - 1)];
                  const isLast = index === lastGrownIndex;
                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/60 p-2 text-center text-xs ${
                        isLast ? 'ring-2 ring-emerald-400' : ''
                      }`}
                    >
                      <StageIcon
                        className='mb-1 h-8 w-8 text-emerald-700'
                        title={`Plant ${index + 1}, stage ${stage + 1}`}
                      />
                      <span className='text-[10px] text-neutral-600'>
                        Plot {index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
                <button
                  type='button'
                  onClick={handleResetGarden}
                  className='rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1 text-neutral-700 hover:bg-neutral-100'
                  disabled={plants.every((p) => p === 0)}
                >
                  Reset Garden
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Focus Mode Overlay */}
      {focusMode && (
        <div
          className='fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4'
          onClick={closeFocusMode}
        >
          <div
            className='max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-5 text-neutral-50 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mb-4 flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-sm font-semibold uppercase tracking-wide text-neutral-400'>
                  Focus Mode
                </h2>
                <p className='text-sm text-neutral-200'>
                  Working on:{' '}
                  <span className='font-semibold'>
                    {currentTask ?? 'No task selected'}
                  </span>
                </p>
              </div>
              <button
                type='button'
                onClick={closeFocusMode}
                className='rounded-lg border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs hover:bg-neutral-700'
              >
                Exit
              </button>
            </div>

            <div className='mb-4'>
              <FocusTimer
                durationMs={sessionMinutes * 60_000}
                onComplete={() => {
                  handleComplete();
                  closeFocusMode();
                }}
                startDisabled={!currentTask}
              />
            </div>

            <p className='text-xs text-neutral-400'>
              Tip: Click the dark backdrop, press <kbd>Esc</kbd>, or use Exit to
              leave focus mode.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
