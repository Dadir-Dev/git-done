"use client";

import { deleteProject, updateProject } from "@/src/actions/project.actions";
import {
  createTask,
  deleteTask,
  updateTaskStatus,
} from "@/src/actions/task.actions";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

type Status = "TODO" | "IN_PROGRESS" | "COMPLETE";
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
};
type Project = {
  id: string;
  name: string;
  description: string | null;
  tasks: Task[];
};
const statusMeta: Record<Status, { label: string; dot: string }> = {
  TODO: { label: "To do", dot: "bg-zinc-500" },
  IN_PROGRESS: { label: "In progress", dot: "bg-blue-400" },
  COMPLETE: { label: "Complete", dot: "bg-emerald-400" },
};

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#19191c] p-5 shadow-2xl"
      >
        {children}
      </section>
    </div>
  );
}

export default function ProjectWorkspace({ project }: { project: Project }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [dialog, setDialog] = useState<"task" | "edit" | "delete" | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const groups = useMemo(
    () =>
      (["TODO", "IN_PROGRESS", "COMPLETE"] as Status[])
        .map((status) => ({
          status,
          tasks: project.tasks.filter(
            (task) =>
              task.status === status && (filter === "ALL" || filter === status),
          ),
        }))
        .filter((group) => filter === "ALL" || group.tasks.length),
    [project.tasks, filter],
  );
  function run(
    work: () => Promise<{ success: boolean; error?: string }>,
    close = true,
  ) {
    setError("");
    startTransition(async () => {
      const result = await work();
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (close) setDialog(null);
      router.refresh();
    });
  }
  return (
    <main className="min-h-screen">
      <header className="flex min-h-15 items-center justify-between border-b border-white/[0.07] px-5 pl-15 lg:px-7">
        <Link
          href="/projects"
          className="text-sm text-zinc-400 transition hover:text-zinc-100"
        >
          ‹ Projects
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setDialog("edit")}
            className="hidden h-9 rounded-md border border-white/10 px-3 text-sm font-medium text-zinc-300 hover:bg-white/6 sm:block"
          >
            Edit project
          </button>
          <button
            onClick={() => setDialog("task")}
            className="h-9 rounded-md bg-brand px-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-hover"
          >
            + Add task
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand-text">
              Project
            </p>
            <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight text-zinc-50">
              {project.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              {project.description || "No description yet."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDialog("delete")}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-red-400/20 bg-red-400/10 px-3 text-xs font-medium text-red-300 transition hover:border-red-400/40 hover:bg-red-400/15 hover:text-red-200"
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete project
          </button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-white/[0.07] py-3">
          <span className="text-xs text-zinc-500">
            {project.tasks.length}{" "}
            {project.tasks.length === 1 ? "task" : "tasks"}
          </span>
          <div
            className="flex rounded-md border border-white/8 bg-white/3 p-0.5"
            aria-label="Filter tasks"
          >
            {(["ALL", "TODO", "IN_PROGRESS", "COMPLETE"] as const).map(
              (value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded px-2.5 py-1 text-xs transition ${filter === value ? "bg-white/10 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  {value === "ALL" ? "All" : statusMeta[value].label}
                </button>
              ),
            )}
          </div>
        </div>
        <section className="mt-6 space-y-6">
          {groups.map(({ status, tasks }) => (
            <div key={status}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className={`size-1.5 rounded-full ${statusMeta[status].dot}`}
                />
                <h2 className="text-xs font-medium text-zinc-400">
                  {statusMeta[status].label}
                </h2>
                <span className="text-xs text-zinc-600">{tasks.length}</span>
              </div>
              {tasks.length ?
                <ul className="overflow-hidden rounded-xl border border-white/8 bg-[#161618]">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3 last:border-0"
                    >
                      <span
                        aria-hidden="true"
                        className={`grid size-5 shrink-0 place-items-center rounded-full border ${task.status === "COMPLETE" ? "border-emerald-400 bg-emerald-400 text-zinc-950" : "border-zinc-600"}`}
                      >
                        {task.status === "COMPLETE" ? "✓" : ""}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm ${task.status === "COMPLETE" ? "text-zinc-500 line-through" : "text-zinc-200"}`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-0.5 truncate text-xs text-zinc-500">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <label className="sr-only" htmlFor={`status-${task.id}`}>
                        Status for {task.title}
                      </label>
                      <select
                        id={`status-${task.id}`}
                        value={task.status}
                        disabled={pending}
                        onChange={(event) =>
                          run(
                            () =>
                              updateTaskStatus(
                                task.id,
                                event.target.value as Status,
                              ),
                            false,
                          )
                        }
                        className="h-8 max-w-28 rounded-md border border-white/8 bg-[#202024] px-2 text-xs text-zinc-300 disabled:opacity-50"
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETE">Complete</option>
                      </select>
                      <button
                        type="button"
                        aria-label={`Delete ${task.title}`}
                        title={`Delete ${task.title}`}
                        disabled={pending}
                        onClick={() => run(() => deleteTask(task.id), false)}
                        className="grid size-8 place-items-center rounded-md border border-transparent text-red-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-400 lg:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              : <div className="rounded-lg border border-dashed border-white/8 px-4 py-5 text-sm text-zinc-600">
                  No tasks in this state.
                </div>
              }
            </div>
          ))}
        </section>
      </div>
      {dialog === "task" && (
        <Overlay onClose={() => setDialog(null)}>
          <h2 className="text-lg font-semibold text-zinc-100">Add task</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Start with a small, actionable next step.
          </p>
          {/* Form of creating a task */}
          <form
            className="mt-6 space-y-4"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              run(() =>
                createTask(project.id, {
                  title: String(form.get("title") ?? ""),
                  description:
                    String(form.get("description") ?? "") || undefined,
                }),
              );
            }}
          >
            <label className="block text-sm font-medium text-zinc-300">
              Task title
              <input
                name="title"
                autoFocus
                required
                maxLength={200}
                className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#121214] px-3 text-sm text-zinc-100"
                placeholder="e.g. Define the homepage content"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              Details{" "}
              <span className="font-normal text-zinc-500">optional</span>
              <textarea
                name="description"
                rows={3}
                maxLength={1000}
                className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-sm text-zinc-100"
                placeholder="Add context if it helps."
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="h-9 px-3 text-sm text-zinc-300"
              >
                Cancel
              </button>
              <button
                disabled={pending}
                className="h-9 rounded-md bg-brand px-4 text-sm font-semibold text-zinc-950 disabled:opacity-50"
              >
                {pending ? "Adding…" : "Add task"}
              </button>
            </div>
          </form>
        </Overlay>
      )}
      {dialog === "edit" && (
        <Overlay onClose={() => setDialog(null)}>
          <h2 className="text-lg font-semibold text-zinc-100">Edit project</h2>
          <form
            className="mt-6 space-y-4"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              run(() =>
                updateProject(project.id, {
                  name: String(form.get("name") ?? ""),
                  description:
                    String(form.get("description") ?? "") || undefined,
                }),
              );
            }}
          >
            <label className="block text-sm font-medium text-zinc-300">
              Project name
              <input
                name="name"
                defaultValue={project.name}
                autoFocus
                required
                maxLength={100}
                className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#121214] px-3 text-sm text-zinc-100"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              Description
              <textarea
                name="description"
                defaultValue={project.description ?? ""}
                rows={3}
                maxLength={500}
                className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-sm text-zinc-100"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="h-9 px-3 text-sm text-zinc-300"
              >
                Cancel
              </button>
              <button
                disabled={pending}
                className="h-9 rounded-md bg-brand px-4 text-sm font-semibold text-zinc-950 disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Overlay>
      )}
      {dialog === "delete" && (
        <Overlay onClose={() => setDialog(null)}>
          <h2 className="text-lg font-semibold text-zinc-100">
            Delete project?
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            This permanently removes{" "}
            <span className="font-medium text-zinc-200">{project.name}</span>{" "}
            and its {project.tasks.length} task
            {project.tasks.length === 1 ? "" : "s"}.
          </p>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="h-9 px-3 text-sm text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const result = await deleteProject(project.id);
                  if (result.success) router.push("/projects");
                  return result;
                })
              }
              className="inline-flex h-9 items-center gap-2 rounded-md bg-red-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={15} aria-hidden="true" />
              {pending ? "Deleting…" : "Delete project"}
            </button>
          </div>
        </Overlay>
      )}
    </main>
  );
}
