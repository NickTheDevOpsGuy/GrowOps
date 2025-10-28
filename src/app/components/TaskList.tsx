type Props = {
  onSelect: (name: string) => void;
  selected?: string | null;
  disabled?: boolean;
};

export default function TaskList({ onSelect, selected, disabled }: Props) {
  const tasks = ["AZ-400 Quiz Review", "Journal UI Polish", "Pinball Hook Refactor"];

  return (
    <div className="space-y-2 text-sm">
      <div className="rounded-lg border border-neutral-300 p-3 text-neutral-700">
        [+] Add Task
      </div>

      {tasks.map((name) => (
        <button
          key={name}
          disabled={disabled}
          onClick={() => onSelect(name)}
          className={`w-full rounded-lg border px-3 py-1.5 text-left
            ${selected === name ? "bg-green-100 border-green-500" : "border-neutral-300"}
            ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}