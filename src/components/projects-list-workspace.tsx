"use client";

import { createProject } from "@/src/actions/project.actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  taskCount: number;
  completedCount: number;
};

function ProjectDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  useEffect(() => {
    const listener = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);
  if (!open) return null;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createProject({
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? "") || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#19191c] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="new-project-title"
              className="text-lg font-semibold text-zinc-100"
            >
              New project
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Give the work a clear, memorable name.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-zinc-300">
            Project name
            <input
              autoFocus
              name="name"
              required
              maxLength={100}
              placeholder="e.g. Website refresh"
              className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#121214] px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand/80 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-300">
            Description{" "}
            <span className="font-normal text-zinc-500">optional</span>
            <textarea
              name="description"
              maxLength={500}
              rows={3}
              placeholder="What are you trying to accomplish?"
              className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-[#121214] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand/80 focus:outline-none"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md px-3 text-sm font-medium text-zinc-300 hover:bg-white/[0.07]"
            >
              Cancel
            </button>
            <button
              disabled={pending}
              className="h-9 rounded-md bg-brand px-4 text-sm font-semibold text-zinc-950 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function ProjectsListWorkspace({
  projects,
}: {
  projects: ProjectSummary[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <main className="min-h-screen">
      <header className="flex min-h-15 items-center justify-between border-b border-white/[0.07] px-5 pl-15 lg:px-7">
        <span className="text-sm font-medium text-zinc-400">Workspace</span>
        <button
          onClick={() => setOpen(true)}
          className="h-9 rounded-md bg-brand px-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-hover"
        >
          + New project
        </button>
      </header>
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
        <section className="mt-8 overflow-hidden rounded-xl border border-white/8 bg-[#161618]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
            <h2 className="text-sm font-medium text-zinc-200">All projects</h2>
            <span className="text-xs text-zinc-500">Progress</span>
          </div>
          {projects.length ?
            <ul>
              {projects.map((project) => {
                const percent =
                  project.taskCount ?
                    Math.round(
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
          : <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
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
                onClick={() => setOpen(true)}
                className="mt-5 text-sm font-medium text-brand-text hover:text-brand-hover"
              >
                Create your first project
              </button>
            </div>
          }
        </section>
      </div>
      <ProjectDialog open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
