// src/app/components/TaskList.tsx
import { useState } from 'react';
import type React from 'react';

type Props = {
  tasks: string[];
  onAdd: (name: string) => void;
  onRemove?: (name: string) => void;
  onSelect: (name: string) => void;
  selected?: string | null;
  disabled?: boolean;
};

export default function TaskList({
  tasks,
  onAdd,
  onRemove,
  onSelect,
  selected,
  disabled,
}: Props) {
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft('');
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task…"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          disabled={!!disabled}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!!disabled || !draft.trim()}
          className="rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </div>

      <div className="space-y-1">
        {tasks.length === 0 && (
          <div className="text-sm text-neutral-500">
            No tasks yet — add one above.
          </div>
        )}

        {tasks.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!!disabled}
              onClick={() => onSelect(name)}
              className={`w-full rounded-lg border px-3 py-1.5 text-left text-sm
                ${
                  selected === name
                    ? 'bg-emerald-100 border-emerald-500'
                    : 'border-neutral-300'
                }
                ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              title={disabled ? 'Timer running' : 'Select task'}
            >
              {name}
            </button>

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(name)}
                disabled={!!disabled}
                className="rounded-lg border border-neutral-300 px-2 py-1 text-xs disabled:opacity-60"
                title="Remove task"
              >
                ✖︎
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}