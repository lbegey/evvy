export default function BrandingPresetsLoading() {
  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <div className="space-y-1.5">
        <div className="h-4 w-32 rounded bg-muted/40 animate-pulse" />
        <div className="h-7 w-64 rounded bg-muted/60 animate-pulse" />
        <div className="h-4 w-80 rounded bg-muted/40 animate-pulse" />
      </div>
      <div className="rounded-xl border border-border/60 p-5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}
