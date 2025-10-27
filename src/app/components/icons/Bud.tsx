// Bud.tsx
import { IconBase } from "../PlantIcon";
export function Bud(props: { className?: string }) {
  return (
    <IconBase title="bud" {...props}>
      {/* soil */}
      <path d="M3 17c5-4 13-4 18 0v4H3z" className="fill-amber-800" />
      {/* taller stem */}
      <rect
        x="11.3"
        y="9"
        width="1.4"
        height="8"
        rx="0.7"
        className="fill-green-500"
      />
      {/* leaves */}
      <ellipse
        cx="10"
        cy="12"
        rx="2"
        ry="1.2"
        transform="rotate(-18 10 12)"
        className="fill-green-500"
      />
      <ellipse
        cx="14"
        cy="12"
        rx="2"
        ry="1.2"
        transform="rotate(18 14 12)"
        className="fill-green-500"
      />
      {/* bud */}
      <circle cx="12" cy="9" r="1.8" className="fill-rose-300" />
    </IconBase>
  );
}
