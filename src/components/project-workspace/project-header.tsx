import { Trash2 } from "lucide-react";
import Link from "next/link";
import Button from "@/src/components/ui/button";

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
          <Button
            variant="secondary"
            onClick={onEdit}
            className="hidden sm:inline-flex"
          >
            Edit project
          </Button>

          {/* add task button */}
          <Button onClick={onAddTask}>+ Add task</Button>
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
          <Button variant="destructive-subtle" size="sm" onClick={onDelete}>
            <Trash2 size={15} aria-hidden="true" />
            Delete project
          </Button>
        </div>
      </div>
    </>
  );
}
