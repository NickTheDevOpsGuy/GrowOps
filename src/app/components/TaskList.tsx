import { useState } from "react";

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
  const [draft, setDraft] = useState("");

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
  }

  return (
    <div className="space-y-3 text-sm">
      {/* Add Task */}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          disabled={!!disabled}
          placeholder="Add new task…"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 disabled:opacity-60"
        />
        <button
          onClick={submit}
          disabled={!!disabled || !draft.trim()}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 disabled:opacity-60"
        >
          Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 p-3 text-neutral-600">
            No tasks yet — add one above.
          </div>
        )}

        {tasks.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <button
              disabled={!!disabled}
              onClick={() => onSelect(name)}
              className={`w-full rounded-lg border px-3 py-1.5 text-left
                ${selected === name ? "bg-green-100 border-green-500" : "border-neutral-300"}
                ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              title={disabled ? "Timer running" : "Select task"}
            >
              {name}
            </button>

            {onRemove && (
              <button
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