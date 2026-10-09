export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading dashboard"
      className="min-h-screen"
    >
      <div
        aria-hidden="true"
        className="animate-pulse motion-reduce:animate-none"
      >
        <header className="flex min-h-15 items-center justify-between border-b border-white/[0.07] px-5 pl-15 lg:px-7">
          <div className="h-4 w-20 rounded bg-white/8" />
          <div className="h-9 w-32 rounded-md bg-white/8" />
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="h-3 w-28 rounded bg-white/8" />
          <div className="mt-3 h-9 w-44 rounded bg-white/8" />
          <div className="mt-3 h-4 w-72 max-w-full rounded bg-white/8" />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="rounded-lg border border-white/10 bg-white/3 p-4"
              >
                <div className="h-3 w-24 rounded bg-white/8" />
                <div className="mt-3 h-8 w-16 rounded bg-white/8" />
              </div>
            ))}
          </div>
          <section className="mt-8 overflow-hidden rounded-xl border border-white/8 bg-[#161618]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
              <div className="h-4 w-28 rounded bg-white/8" />
              <div className="h-3 w-12 rounded bg-white/8" />
            </div>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-40 max-w-full rounded bg-white/8" />
                  <div className="mt-2 h-3 w-56 max-w-full rounded bg-white/8" />
                </div>
                <div className="h-3 w-16 rounded bg-white/8" />
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
