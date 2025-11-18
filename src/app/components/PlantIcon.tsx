// PlantIcon.tsx
type IconProps = { className?: string; title?: string };
export function IconBase({
  children,
  className,
  title,
}: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={className ?? "size-10"}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
