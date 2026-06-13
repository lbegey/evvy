export default function DashboardLoading() {
  return (
    <>
      {/* header band */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-6 sm:px-8 lg:py-8">
          <div className="hidden h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-evvy-soft sm:block" />
          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded bg-line" />
            <div className="h-4 w-64 animate-pulse rounded bg-line" />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
        <div className="space-y-4 rounded-xl2 border border-line bg-white p-4 shadow-card sm:p-6">
          {/* toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-line" />
              <div className="h-8 w-20 animate-pulse rounded-lg bg-line" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-32 animate-pulse rounded-lg bg-line" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-line" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-line" />
            </div>
          </div>

          {/* calendar grid */}
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="grid grid-cols-7 border-b border-line">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="px-2 py-2 text-center">
                  <div className="mx-auto h-3 w-6 animate-pulse rounded bg-line" />
                </div>
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, week) => (
              <div key={week} className="grid grid-cols-7 border-b border-line last:border-0">
                {Array.from({ length: 7 }).map((_, day) => (
                  <div key={day} className="min-h-[90px] space-y-1 border-r border-line p-1.5 last:border-0">
                    <div className="h-3 w-4 animate-pulse rounded bg-line" />
                    {week === 1 && day % 2 === 0 && <div className="h-5 animate-pulse rounded bg-paper" />}
                    {week === 2 && day % 3 === 1 && <div className="h-5 animate-pulse rounded bg-paper" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
