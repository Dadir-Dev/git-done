"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import type { ProjectTask, TaskStatus } from "./types";

const statusMeta: Record<TaskStatus, { label: string; dot: string }> = {
  TODO: { label: "To do", dot: "bg-zinc-500" },
  IN_PROGRESS: { label: "In progress", dot: "bg-blue-400" },
  COMPLETE: { label: "Complete", dot: "bg-emerald-400" },
};

export default function TaskBoard({
  tasks,
  pending,
  onUpdateStatus,
  onDeleteTask,
}: {
  tasks: ProjectTask[];
  pending: boolean;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");
  const groups = useMemo(
    () =>
      (["TODO", "IN_PROGRESS", "COMPLETE"] as TaskStatus[])
        .map((status) => ({
          status,
          tasks: tasks.filter(
            (task) =>
              task.status === status && (filter === "ALL" || filter === status),
          ),
        }))
        .filter((group) => filter === "ALL" || group.tasks.length),
    [tasks, filter],
  );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-white/[0.07] py-3">
        <span className="text-xs text-zinc-500">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>
        <div
          className="flex rounded-md border border-white/8 bg-white/3 p-0.5"
          aria-label="Filter tasks"
        >
          {(["ALL", "TODO", "IN_PROGRESS", "COMPLETE"] as const).map(
            (value) => (
              <button
                key={value}
                type="button"
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
        {groups.map(({ status, tasks: groupTasks }) => (
          <div key={status}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span
                className={`size-1.5 rounded-full ${statusMeta[status].dot}`}
              />
              <h2 className="text-xs font-medium text-zinc-400">
                {statusMeta[status].label}
              </h2>
              <span className="text-xs text-zinc-600">{groupTasks.length}</span>
            </div>
            {groupTasks.length ?
              <ul className="overflow-hidden rounded-xl border border-white/8 bg-[#161618]">
                {groupTasks.map((task) => (
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
                        onUpdateStatus(
                          task.id,
                          event.target.value as TaskStatus,
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
                      onClick={() => onDeleteTask(task.id)}
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
    </>
  );
}
