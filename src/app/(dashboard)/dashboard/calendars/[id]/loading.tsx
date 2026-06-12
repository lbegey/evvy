export default function CalendarDetailLoading() {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-paper">
      {/* topbar */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
        <div className="h-6 w-16 animate-pulse rounded bg-line" />
        <div className="ml-auto h-8 w-32 animate-pulse rounded-lg bg-line" />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-line p-4 lg:block">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-line/70" />
            ))}
          </div>
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="border-b border-line bg-white px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-[1400px] space-y-4">
              <div className="h-8 w-64 animate-pulse rounded bg-line" />
              <div className="mt-6 grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl2 border border-line bg-paper/70" />
                ))}
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 sm:px-8">
            <div className="h-40 animate-pulse rounded-xl2 border border-line bg-white" />
            <div className="h-56 animate-pulse rounded-xl2 border border-line bg-white" />
          </div>
        </main>
      </div>
    </div>
  );
}
