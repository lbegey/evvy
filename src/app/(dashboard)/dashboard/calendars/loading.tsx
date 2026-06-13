export default function CalendarsLoading() {
  return (
    <>
      {/* header band */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-6 sm:px-8 lg:py-8">
          <div className="hidden h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-evvy-soft sm:block" />
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded bg-line" />
            <div className="h-4 w-64 animate-pulse rounded bg-line" />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] space-y-4 px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="h-9 w-full max-w-md animate-pulse rounded-lg bg-line" />
          <div className="ml-2 h-9 w-28 animate-pulse rounded-lg bg-evvy-soft" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl2 border border-line bg-white p-3 shadow-card">
              <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-line" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/3 animate-pulse rounded bg-line" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-paper" />
              </div>
              <div className="flex gap-1.5">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-line" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-line" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
