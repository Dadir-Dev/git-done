import type { ProjectSummary } from "@/src/types";
import Link from "next/link";

export default function ProjectsList({
  projects,
  onCreateProject,
}: {
  projects: ProjectSummary[];
  onCreateProject: () => void;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-white/8 bg-[#161618]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
        <h2 className="text-sm font-medium text-zinc-200">All projects</h2>
        <span className="text-xs text-zinc-500">Progress</span>
      </div>
      {projects.length ? (
        <ul>
          {projects.map((project) => {
            const percent =
              project.taskCount
                ? Math.round(
                    (project.completedCount / project.taskCount) * 100,
                  )
                : 0;

            return (
              <li
                key={project.id}
                className="border-b border-white/[0.07] last:border-0"
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="group grid gap-4 px-5 py-4 transition hover:bg-white/[0.035] sm:grid-cols-[minmax(0,1fr)_180px_24px] sm:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-zinc-100 group-hover:text-brand-text">
                      {project.name}
                    </h3>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>
                        {project.completedCount}/{project.taskCount} tasks
                      </span>
                      <span>{percent}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden text-zinc-600 sm:block"
                  >
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <span className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/3 text-xl text-brand-text">
            +
          </span>
          <h3 className="mt-4 text-sm font-medium text-zinc-200">
            Nothing in motion yet
          </h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-500">
            Create a project to turn an idea into a focused list of next
            actions.
          </p>
          <button
            type="button"
            onClick={onCreateProject}
            className="mt-5 text-sm font-medium text-brand-text hover:text-brand-hover"
          >
            Create your first project
          </button>
        </div>
      )}
    </section>
  );
}