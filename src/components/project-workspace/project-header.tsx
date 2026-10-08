import { Trash2 } from "lucide-react";
import Link from "next/link";

export default function ProjectHeader({
  name,
  description,
  onEdit,
  onAddTask,
  onDelete,
}: {
  name: string;
  description: string | null;
  onEdit: () => void;
  onAddTask: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <header className="flex min-h-15 items-center justify-between border-b border-white/[0.07] px-5 pl-15 lg:px-7">
        <Link
          href="/projects"
          className="text-sm text-zinc-400 transition hover:text-zinc-100"
        >
          ‹ Projects
        </Link>
        <div className="flex gap-2">
          {/* edit project button */}
          <button
            type="button"
            onClick={onEdit}
            className="hidden h-9 rounded-md border border-white/10 px-3 text-sm font-medium text-zinc-300 hover:bg-white/6 sm:block"
          >
            Edit project
          </button>

          {/* add task button */}
          <button
            type="button"
            onClick={onAddTask}
            className="h-9 rounded-md bg-brand px-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-hover"
          >
            + Add task
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand-text">
              Project
            </p>
            <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight text-zinc-50">
              {name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              {description || "No description yet."}
            </p>
          </div>

          {/* delete project button */}
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-red-400/20 bg-red-400/10 px-3 text-xs font-medium text-red-300 transition hover:border-red-400/40 hover:bg-red-400/15 hover:text-red-200"
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete project
          </button>
        </div>
      </div>
    </>
  );
}
