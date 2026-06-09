export default function BrandingLoading() {
  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <div className="space-y-1.5">
        <div className="h-7 w-48 rounded bg-muted/60 animate-pulse" />
        <div className="h-4 w-80 rounded bg-muted/40 animate-pulse" />
      </div>
      <div className="rounded-xl border border-border/60 p-5 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-muted/50 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-muted/40 animate-pulse" />
          </div>
        ))}
        <div className="h-9 w-36 rounded-lg bg-muted/60 animate-pulse mt-2" />
      </div>
    </section>
  );
}
