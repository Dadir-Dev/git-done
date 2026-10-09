export default function ProjectsLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading projects"
      className="min-h-screen"
    >
      <div
        aria-hidden="true"
        className="animate-pulse motion-reduce:animate-none"
      >
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="h-3 w-28 rounded bg-white/8" />
              <div className="mt-3 h-9 w-36 rounded bg-white/8" />
              <div className="mt-3 h-4 w-72 max-w-full rounded bg-white/8" />
            </div>
            <div className="h-7 w-24 rounded-md bg-white/8" />
          </div>
          <section className="mt-8 overflow-hidden rounded-xl border border-white/8 bg-[#161618]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
              <div className="h-4 w-24 rounded bg-white/8" />
              <div className="h-3 w-14 rounded bg-white/8" />
            </div>
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="grid gap-4 border-b border-white/[0.07] px-5 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_180px_24px] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="h-4 w-48 max-w-full rounded bg-white/8" />
                  <div className="mt-2 h-3 w-64 max-w-full rounded bg-white/8" />
                </div>
                <div>
                  <div className="flex justify-between">
                    <div className="h-3 w-20 rounded bg-white/8" />
                    <div className="h-3 w-8 rounded bg-white/8" />
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-white/8" />
                </div>
                <div className="hidden size-4 rounded bg-white/8 sm:block" />
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
