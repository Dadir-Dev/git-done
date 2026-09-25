import Link from "next/link";

type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  taskCount: number;
  completedCount: number;
};

export default function DashboardOverview({
  projects,
}: {
  projects: ProjectSummary[];
}) {
  const taskCount = projects.reduce((total, project) => total + project.taskCount, 0);
  const completedCount = projects.reduce(
    (total, project) => total + project.completedCount,
    0,
  );
  const completion = taskCount ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <main className="min-h-screen">
      <header className="flex min-h-15 items-center justify-between border-b border-white/[0.07] px-5 pl-15 lg:px-7">
        <span className="text-sm font-medium text-zinc-400">Overview</span>
        <Link
          href="/projects"
          className="h-9 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-brand-hover"
        >
          View projects
        </Link>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand-text">
            Personal workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            A quick read on the work moving through your workspace.
          </p>
        </div>
        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/3 p-4">
            <p className="text-xs text-zinc-500">Projects</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">
              {projects.length}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/3 p-4">
            <p className="text-xs text-zinc-500">Tasks completed</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">
              {completedCount}/{taskCount}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/3 p-4">
            <p className="text-xs text-zinc-500">Overall progress</p>
            <p className="mt-2 text-2xl font-semibold text-brand-text">
              {completion}%
            </p>
          </div>
        </section>
        <section className="mt-8 rounded-xl border border-white/8 bg-[#161618]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
            <h2 className="text-sm font-medium text-zinc-200">Recent projects</h2>
            <Link
              href="/projects"
              className="text-xs font-medium text-brand-text hover:text-brand-hover"
            >
              See all
            </Link>
          </div>
          {projects.length ? (
            <ul>
              {projects.slice(0, 3).map((project) => (
                <li
                  key={project.id}
                  className="border-b border-white/[0.07] last:border-0"
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.035]"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-zinc-100">
                        {project.name}
                      </h3>
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {project.description || "No description"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {project.completedCount}/{project.taskCount} tasks
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-zinc-400">No projects yet.</p>
              <Link
                href="/projects"
                className="mt-2 inline-block text-sm font-medium text-brand-text hover:text-brand-hover"
              >
                Create your first project
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}