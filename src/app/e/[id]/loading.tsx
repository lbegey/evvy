export default function PublicEventLoading() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-muted/20 py-6 px-4 sm:py-8">
      <div className="mx-auto w-full max-w-xl space-y-3">
        {/* logo placeholder */}
        <div className="flex justify-center pb-1">
          <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse" />
        </div>

        {/* main card */}
        <div className="rounded-2xl border border-border/60 bg-background shadow-sm p-5 space-y-4">
          <div className="h-6 w-3/4 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-1/2 rounded bg-muted/40 animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-muted/40 animate-pulse" />
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full rounded bg-muted/30 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-muted/30 animate-pulse" />
          </div>
        </div>

        {/* add to calendar */}
        <div className="rounded-xl border border-border/60 bg-background px-5 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 w-9 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
