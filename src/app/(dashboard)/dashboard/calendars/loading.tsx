export default function CalendarsLoading() {
  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-40 rounded bg-muted/60 animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted/40 animate-pulse" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-muted/60 animate-pulse" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 p-4 flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-1/3 rounded bg-muted/60 animate-pulse" />
              <div className="h-3 w-1/4 rounded bg-muted/40 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded-lg bg-muted/40 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-muted/40 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
