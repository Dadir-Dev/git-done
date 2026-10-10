"use client";

import Button from "@/src/components/ui/button";
import ProjectDialog from "@/src/components/projects/project-dialog";
import type { ProjectSummary } from "@/src/types";
import Link from "next/link";
import { useState } from "react";

export default function RecentProjectsSection({
  projects,
}: {
  projects: ProjectSummary[];
}) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <section className="mt-8 rounded-xl border border-white/8 bg-[#161618]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
          <h2 className="text-sm font-medium text-zinc-200">Recent projects</h2>
          {projects.length > 0 && (
            <Link
              href="/projects"
              className="text-xs font-medium text-brand-text hover:text-brand-hover"
            >
              See all
            </Link>
          )}
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
            <Button
              className="mt-3"
              onClick={() => setCreateDialogOpen(true)}
            >
              Create your first project
            </Button>
          </div>
        )}
      </section>
      {createDialogOpen && (
        <ProjectDialog
          open
          onClose={() => setCreateDialogOpen(false)}
        />
      )}
    </>
  );
}