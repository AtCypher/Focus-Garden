export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="text-muted mt-2">Coming in a later phase.</p>
    </div>
  );
}
