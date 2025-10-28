import { IconBase } from "../PlantIcon";

export function Seed(props: { className?: string }) {
  return (
    <IconBase title="seed" {...props}>
      {/* soil */}
      <path d="M3 17c5-4 13-4 18 0v4H3z" className="fill-amber-800" />
      {/* seed */}
      <ellipse cx="13" cy="16" rx="2.4" ry="1.6" className="fill-amber-400" />
    </IconBase>
  );
}
