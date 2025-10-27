// Bloom.tsx
import { IconBase } from "../PlantIcon";
export function Bloom(props: { className?: string }) {
  return (
    <IconBase title="bloom" {...props}>
      {/* soil */}
      <path d="M3 17c5-4 13-4 18 0v4H3z" className="fill-amber-800" />
      {/* tallest stem */}
      <rect
        x="11.3"
        y="8"
        width="1.4"
        height="9"
        rx="0.7"
        className="fill-green-500"
      />
      {/* center */}
      <circle cx="12" cy="7" r="1.5" className="fill-amber-300" />
      {/* petals */}
      <ellipse cx="12" cy="5.2" rx="2.0" ry="1.2" className="fill-rose-400" />
      <ellipse cx="12" cy="8.8" rx="2.0" ry="1.2" className="fill-rose-400" />
      <ellipse
        cx="9.8"
        cy="7"
        rx="2.0"
        ry="1.2"
        transform="rotate(-90 9.8 7)"
        className="fill-rose-400"
      />
      <ellipse
        cx="14.2"
        cy="7"
        rx="2.0"
        ry="1.2"
        transform="rotate(90 14.2 7)"
        className="fill-rose-400"
      />
    </IconBase>
  );
}
