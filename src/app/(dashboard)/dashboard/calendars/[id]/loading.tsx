export default function CalendarDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-8">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 rounded-lg bg-muted/60 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-8 w-24 rounded-lg bg-muted/60 animate-pulse" />
        </div>
      </div>

      <div className="lg:flex lg:items-start lg:gap-8">
        {/* sidebar nav */}
        <aside className="hidden shrink-0 space-y-2 lg:block lg:w-44">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </aside>

        <div className="min-w-0 max-w-4xl flex-1 space-y-6 sm:space-y-8">
          {/* title + description */}
          <div className="space-y-2">
            <div className="h-7 w-2/3 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted/40 animate-pulse" />
          </div>

          {/* public link */}
          <div className="space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
            <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-8 flex-1 rounded-md bg-muted/30 animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-muted/40 animate-pulse" />
            </div>
          </div>

          {/* branding */}
          <div className="space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
            <div className="h-4 w-24 rounded bg-muted/40 animate-pulse" />
            <div className="h-24 rounded-lg bg-muted/30 animate-pulse" />
          </div>

          {/* events list */}
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
