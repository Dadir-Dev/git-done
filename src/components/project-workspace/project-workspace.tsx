"use client";

import { deleteProject, updateProject } from "@/src/actions/project.actions";
import {
  createTask,
  deleteTask,
  updateTaskStatus,
} from "@/src/actions/task.actions";
import ProjectDialogs from "@/src/components/project-workspace/project-dialogs";
import ProjectHeader from "@/src/components/project-workspace/project-header";
import TaskBoard from "@/src/components/project-workspace/task-board";
import type {
  ProjectDetail,
  TaskStatus,
} from "@/src/components/project-workspace/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function ProjectWorkspace({
  project,
}: {
  project: ProjectDetail;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"task" | "edit" | "delete" | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

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
      <ProjectHeader
        name={project.name}
        description={project.description}
        onEdit={() => setDialog("edit")}
        onAddTask={() => setDialog("task")}
        onDelete={() => setDialog("delete")}
      />
      <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6 lg:px-8 lg:pb-10">
        <TaskBoard
          tasks={project.tasks}
          pending={pending}
          onUpdateStatus={(taskId, status: TaskStatus) =>
            run(() => updateTaskStatus(taskId, status), false)
          }
          onDeleteTask={(taskId) => run(() => deleteTask(taskId), false)}
        />
      </div>
      <ProjectDialogs
        project={project}
        dialog={dialog}
        pending={pending}
        error={error}
        onClose={() => setDialog(null)}
        onCreateTask={(input) => run(() => createTask(project.id, input))}
        onUpdateProject={(input) => run(() => updateProject(project.id, input))}
        onDeleteProject={() =>
          run(async () => {
            const result = await deleteProject(project.id);
            if (result.success) router.push("/projects");
            return result;
          })
        }
      />
    </main>
  );
}
