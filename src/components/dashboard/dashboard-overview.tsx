import Link from "next/link";
import type { ProjectSummary } from "@/src/types";
import DashboardStats from "./dashboard-stats";
import RecentProjectsSection from "./recent-projects-section";

export default function DashboardOverview({
  projects,
}: {
  projects: ProjectSummary[];
}) {
  const taskCount = projects.reduce(
    (total, project) => total + project.taskCount,
    0,
  );
  const completedCount = projects.reduce(
    (total, project) => total + project.completedCount,
    0,
  );
  const completion =
    taskCount ? Math.round((completedCount / taskCount) * 100) : 0;

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
        <DashboardStats
          projectCount={projects.length}
          completedTaskCount={completedCount}
          taskCount={taskCount}
          completion={completion}
        />
        <RecentProjectsSection projects={projects} />
      </div>
    </main>
  );
}
