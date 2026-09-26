"use client";

import type { ProjectSummary } from "@/src/types";
import ProjectDialog from "@/src/components/projects/project-dialog";
import { useState } from "react";
import ProjectsList from "@/src/components/projects/projects-list";
import ProjectsListHeader from "@/src/components/projects/projects-list-header";

export default function ProjectsListWorkspace({
  projects,
}: {
  projects: ProjectSummary[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <main className="min-h-screen">
      <ProjectsListHeader onCreateProject={() => setOpen(true)} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand-text">
              Personal workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
              Projects
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              A focused view of the work you&apos;re moving forward.
            </p>
          </div>
          <span className="rounded-md border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium text-zinc-400">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>
        <ProjectsList
          projects={projects}
          onCreateProject={() => setOpen(true)}
        />
      </div>
      <ProjectDialog open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
