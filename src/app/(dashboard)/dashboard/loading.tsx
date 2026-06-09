export default function DashboardLoading() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-muted/60 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse" />
        </div>
      </div>

      {/* calendar grid */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        {/* day headers */}
        <div className="grid grid-cols-7 border-b border-border/60">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="px-2 py-2 text-center">
              <div className="h-3 w-6 rounded bg-muted/60 animate-pulse mx-auto" />
            </div>
          ))}
        </div>
        {/* weeks */}
        {Array.from({ length: 5 }).map((_, week) => (
          <div key={week} className="grid grid-cols-7 border-b border-border/60 last:border-0">
            {Array.from({ length: 7 }).map((_, day) => (
              <div key={day} className="min-h-[90px] p-1.5 border-r border-border/60 last:border-0 space-y-1">
                <div className="h-3 w-4 rounded bg-muted/60 animate-pulse" />
                {week === 1 && day % 2 === 0 && (
                  <div className="h-5 rounded bg-muted/40 animate-pulse" />
                )}
                {week === 2 && day % 3 === 1 && (
                  <div className="h-5 rounded bg-muted/40 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
