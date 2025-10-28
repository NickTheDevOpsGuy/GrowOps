type CardProps = { title: string; children: React.ReactNode };
export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-2xl border bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
