"use client";

import type { SubmitEvent } from "react";
import { Trash2 } from "lucide-react";
import type { ProjectDetail } from "./types";

type ProjectDialogType = "task" | "edit" | "delete" | null;
type CreateTaskInput = { title: string; description?: string };
type UpdateProjectInput = { name: string; description?: string };

function DialogShell({
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

export default function ProjectDialogs({
  project,
  dialog,
  pending,
  error,
  onClose,
  onCreateTask,
  onUpdateProject,
  onDeleteProject,
}: {
  project: ProjectDetail;
  dialog: ProjectDialogType;
  pending: boolean;
  error: string;
  onClose: () => void;
  onCreateTask: (input: CreateTaskInput) => void;
  onUpdateProject: (input: UpdateProjectInput) => void;
  onDeleteProject: () => void;
}) {
  if (dialog === "task") {
    return (
      <DialogShell onClose={onClose}>
        <h2 className="text-lg font-semibold text-zinc-100">Add task</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Start with a small, actionable next step.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event: SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            onCreateTask({
              title: String(form.get("title") ?? ""),
              description: String(form.get("description") ?? "") || undefined,
            });
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
            Details <span className="font-normal text-zinc-500">optional</span>
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
              onClick={onClose}
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
      </DialogShell>
    );
  }

  if (dialog === "edit") {
    return (
      <DialogShell onClose={onClose}>
        <h2 className="text-lg font-semibold text-zinc-100">Edit project</h2>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event: SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            onUpdateProject({
              name: String(form.get("name") ?? ""),
              description: String(form.get("description") ?? "") || undefined,
            });
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
              onClick={onClose}
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
      </DialogShell>
    );
  }

  if (dialog === "delete") {
    return (
      <DialogShell onClose={onClose}>
        <h2 className="text-lg font-semibold text-zinc-100">Delete project?</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          This permanently removes{" "}
          <span className="font-medium text-zinc-200">{project.name}</span> and
          its {project.tasks.length} task
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
            onClick={onClose}
            className="h-9 px-3 text-sm text-zinc-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onDeleteProject}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-red-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} aria-hidden="true" />
            {pending ? "Deleting…" : "Delete project"}
          </button>
        </div>
      </DialogShell>
    );
  }

  return null;
}
