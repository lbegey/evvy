export default function EventDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* back + actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 rounded-lg bg-muted/60 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-muted/60 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* main content */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 p-5 space-y-4">
            <div className="h-6 w-3/4 rounded bg-muted/60 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-1/2 rounded bg-muted/40 animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-muted/40 animate-pulse" />
              <div className="h-4 w-2/5 rounded bg-muted/40 animate-pulse" />
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-full rounded bg-muted/30 animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-muted/30 animate-pulse" />
            </div>
          </div>

          {/* calendar buttons */}
          <div className="rounded-xl border border-border/60 p-5">
            <div className="h-4 w-32 rounded bg-muted/40 animate-pulse mb-3" />
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 w-9 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* sidebar */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
