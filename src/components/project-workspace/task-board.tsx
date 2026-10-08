"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "@/src/components/ui/button";
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
          role="group"
          className="flex rounded-md border border-white/8 bg-white/3 p-0.5"
          aria-label="Filter tasks"
        >
          {(["ALL", "TODO", "IN_PROGRESS", "COMPLETE"] as const).map(
            (value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`cursor-pointer rounded px-2.5 py-1 text-xs transition ${filter === value ? "bg-white/10 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
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
                    className="grid grid-cols-[20px_minmax(0,1fr)_7rem_2rem] items-center gap-2 border-b border-white/[0.07] px-3 py-3 last:border-0 sm:gap-3 sm:px-4"
                  >
                    {task.status === "COMPLETE" && (
                      <span
                        aria-hidden="true"
                        className="grid size-5 place-items-center rounded-full border border-emerald-400 bg-emerald-400 text-zinc-950"
                      >
                        ✓
                      </span>
                    )}
                    <div className="col-start-2 min-w-0">
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
                      className="col-start-3 h-9 w-full rounded-md border border-white/10 bg-[#202024] px-2 text-xs text-zinc-200 transition-colors scheme-dark hover:border-white/20 hover:bg-[#26262b] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="TODO">To do</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="COMPLETE">Complete</option>
                    </select>
                    <Button
                      type="button"
                      variant="destructive-quiet"
                      size="icon-sm"
                      aria-label={`Delete ${task.title}`}
                      title={`Delete ${task.title}`}
                      disabled={pending}
                      onClick={() => onDeleteTask(task.id)}
                      className="col-start-4 lg:text-zinc-600"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </Button>
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
