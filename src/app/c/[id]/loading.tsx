export default function PublicCalendarLoading() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-muted/20 py-6 px-4 sm:py-8">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="flex justify-center pb-1">
          <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse" />
        </div>

        {/* header card */}
        <div className="rounded-2xl border border-border/60 bg-background shadow-sm p-5 space-y-3">
          <div className="h-7 w-1/2 rounded bg-muted/60 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
        </div>

        {/* events */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-background shadow-sm p-4 flex gap-4">
            <div className="w-12 shrink-0 space-y-1">
              <div className="h-3 w-full rounded bg-muted/40 animate-pulse" />
              <div className="h-5 w-full rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-muted/40 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
