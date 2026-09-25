"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@/src/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import {
  createTaskSchema,
  updateTaskSchema,
  taskStatusEnum,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskStatus,
} from "@/src/lib/validations/task.schema";
import type { ActionResult } from "@/src/types/index";
import type { Task } from "@/src/app/generated/prisma/client";

export async function createTask(
  projectId: string,
  input: CreateTaskInput,
): Promise<ActionResult<Task>> {
  // auth guard
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // validate input
  const parsed = createTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // create() has no `where` clause, so there's no query-level ownership trick here —
  // we have to explicitly confirm the parent project is this user's, first.
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) {
    return { success: false, error: "Project not found" };
  }

  // create task
  try {
    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        projectId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: task };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function getTasksByProjectId(
  projectId: string,
  status?: TaskStatus,
): Promise<ActionResult<Task[]>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId, status, project: { userId } },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Failed to get tasks:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<ActionResult<Task>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const task = await prisma.task.update({
      where: { id: taskId, project: { userId } },
      data: parsed.data,
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${task.projectId}`);

    return { success: true, data: task };
  } catch (error) {
    // P2025: Record not found
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Task not found" };
    } else if (
      // P2002: Unique violation
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Task already exists" };
    } else if (
      // P2003: Foreign key violation
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { success: false, error: "Project not found" };
    }
    console.error("Failed to update task:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// updatae task status
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<ActionResult<Task>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsedStatus = taskStatusEnum.safeParse(status);

  if (!parsedStatus.success) {
    return {
      success: false,
      error: parsedStatus.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const task = await prisma.task.update({
      where: { id: taskId, project: { userId } },
      data: { status: parsedStatus.data },
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${task.projectId}`);

    return { success: true, data: task };
  } catch (error) {
    // P2025: Record not found
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Task not found" };
    }

    console.error("Failed to update task status:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteTask(taskId: string): Promise<ActionResult<void>> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const task = await prisma.task.delete({
      where: { id: taskId, project: { userId } },
    });

    revalidatePath(`/projects/${task.projectId}`);
    return { success: true, data: undefined };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Task not found" };
    }
    console.error("Failed to delete task:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
