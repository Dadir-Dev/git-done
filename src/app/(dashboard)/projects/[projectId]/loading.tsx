export default function ProjectLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading project"
      className="min-h-screen"
    >
      <div
        aria-hidden="true"
        className="animate-pulse motion-reduce:animate-none"
      >
        <header className="flex min-h-15 items-center justify-between border-b border-white/[0.07] px-5 pl-15 lg:px-7">
          <div className="h-4 w-20 rounded bg-white/8" />
          <div className="flex gap-2">
            <div className="hidden h-9 w-28 rounded-md bg-white/8 sm:block" />
            <div className="h-9 w-24 rounded-md bg-white/8" />
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              <div className="h-3 w-16 rounded bg-white/8" />
              <div className="mt-3 h-9 w-72 max-w-full rounded bg-white/8" />
              <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/8" />
            </div>
            <div className="h-9 w-28 rounded-md bg-white/8" />
          </div>
          <div className="mt-8 flex items-center justify-between gap-3 border-y border-white/[0.07] py-3">
            <div className="h-3 w-14 rounded bg-white/8" />
            <div className="h-8 w-52 max-w-[70%] rounded-md bg-white/8" />
          </div>
          <section className="mt-6 space-y-6">
            {Array.from({ length: 3 }, (_, groupIndex) => (
              <div key={groupIndex}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <div className="size-1.5 rounded-full bg-white/10" />
                  <div className="h-3 w-16 rounded bg-white/8" />
                  <div className="h-3 w-4 rounded bg-white/8" />
                </div>
                <div className="overflow-hidden rounded-xl border border-white/8 bg-[#161618]">
                  {Array.from({ length: 2 }, (_, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="grid grid-cols-[20px_minmax(0,1fr)_7rem_2rem] items-center gap-2 border-b border-white/[0.07] px-3 py-3 last:border-0 sm:gap-3 sm:px-4"
                    >
                      <div className="size-5 rounded-full bg-white/8" />
                      <div className="col-start-2 min-w-0">
                        <div className="h-4 w-56 max-w-full rounded bg-white/8" />
                        <div className="mt-2 h-3 w-40 max-w-full rounded bg-white/8" />
                      </div>
                      <div className="col-start-3 h-9 rounded-md bg-white/8" />
                      <div className="col-start-4 size-8 rounded-md bg-white/8" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
