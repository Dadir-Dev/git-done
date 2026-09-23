import { getProjects, createProject } from "@/src/actions/project.actions";
import Link from "next/link";

export default async function DashboardPage() {
  const result = await getProjects();
  const projects = result.success ? result.data : [];

  async function handleCreate(formData: FormData) {
    "use server";
    await createProject({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
    });
  }

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#17231e]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#5d7767]">
              Project workspace
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Your projects
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#68766d]">
              Keep your active work organized and see progress at a glance.
            </p>
          </div>
          <div className="hidden rounded-full border border-[#cfdbd1] bg-white px-4 py-2 text-sm font-medium text-[#4f6658] shadow-sm sm:block">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.5fr]">
          <aside className="rounded-4xl bg-[#173329] p-7 text-[#f4f7f2] shadow-[0_24px_60px_-30px_#173329] sm:p-8">
            <div className="mb-14 flex items-center justify-between">
              <span className="text-lg font-semibold tracking-[-0.02em]">
                PT / 00
              </span>
              <span className="h-3 w-3 rounded-full bg-[#b8df80] shadow-[0_0_0_5px_rgba(184,223,128,0.15)]" />
            </div>
            <p className="text-sm leading-6 text-[#b9c9be]">
              Start a new project and give your next piece of work a clear home.
            </p>
            <form action={handleCreate} className="mt-7 space-y-3">
              <label
                htmlFor="project-name"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8df80]"
              >
                New project
              </label>
              <input
                id="project-name"
                name="name"
                placeholder="Project name"
                required
                className="w-full rounded-xl border border-[#466254] bg-[#24483a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#8fa797] focus:border-[#b8df80]"
              />
              <input
                name="description"
                placeholder="Description (optional)"
                className="w-full rounded-xl border border-[#466254] bg-[#24483a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#8fa797] focus:border-[#b8df80]"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#b8df80] px-4 py-3 text-sm font-semibold text-[#173329] transition hover:bg-[#d0efa6]"
              >
                Create project
              </button>
            </form>
            <div className="mt-16 border-t border-[#466254] pt-5 text-xs leading-5 text-[#9eb4a4]">
              CREATE / TRACK / COMPLETE
              <br />
              Your workspace at a glance.
            </div>
          </aside>

          <section className="rounded-4xl border border-[#dce5dd] bg-white p-6 shadow-[0_20px_60px_-40px_#17231e] sm:p-9">
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#e5ebe6] pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78907e]">
                  Overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  All projects
                </h2>
              </div>
              <span className="text-sm text-[#748078]">
                {projects.length} total
              </span>
            </div>

            {projects.length > 0 ?
              <ul className="divide-y divide-[#e5ebe6]">
                {projects.map((project) => (
                  <li key={project.id} className="py-5 first:pt-0 last:pb-0">
                    <Link
                      href={`/projects/${project.id}`}
                      className="group flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-[#173329] transition group-hover:text-[#63874a]">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-sm text-[#748078]">
                          {project.completedCount}/{project.taskCount} tasks
                          complete
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#edf6df] px-3 py-1.5 text-xs font-semibold text-[#4d7133]">
                        View project
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            : <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d7e1d8] bg-[#fbfcfa] px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6df] text-2xl text-[#63874a]">
                  +
                </div>
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#748078]">
                  Create your first project from the panel to start tracking
                  work.
                </p>
              </div>
            }
          </section>
        </section>
      </div>
    </main>
  );
}
