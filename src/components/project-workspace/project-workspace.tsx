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

  // useTransition to show pending state for async actions
  const [pending, startTransition] = useTransition();

  const [error, setError] = useState("");

  // helper functions - reusable pipeline for running async actions
  function run(
    work: () => Promise<{ success: boolean; error?: string }>,
    close = true,
  ) {
    // reset error state before running the action
    setError("");

    // run the action in a transition to show pending state
    startTransition(async () => {
      const result = await work();
      // if it fails, extract the error and do not close the dialog
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      // if it succeeds, close the dialog
      if (close) setDialog(null);

      // refresh the page to get the latest data
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
        // if we delete the project, redirect to the projects page instead of refreshing the current page
        onDeleteProject={() =>
          run(async () => {
            const result = await deleteProject(project.id); // 1. Run the database mutation
            if (result.success) router.push("/projects"); // 2. If it worked, escape to the index page!
            return result; // 3. Return the exact object structure `run` demands
          })
        }
      />
    </main>
  );
}
