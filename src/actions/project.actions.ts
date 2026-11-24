"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import {
  createProjectSchema,
  type CreateProjectInput,
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/src/lib/validations/project.schema";
import type { ActionResult, ProjectDetail, ProjectSummary } from "@/src/types";
import { Project } from "@/src/app/generated/prisma/client";
import { Prisma } from "@/src/app/generated/prisma/client";
import { ensureAppUser } from "@/src/lib/ensure-app-user";

export async function createProject(
  input: CreateProjectInput,
): Promise<ActionResult<Project>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createProjectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await ensureAppUser(userId);
    const { dueDate, ...rest } = parsed.data;

    const project = await prisma.project.create({
      data: {
        ...rest,
        userId,
        // The action owns the one conversion; the schema stays string-shaped.
        dueDate: dueDate ? new Date(`${dueDate}T00:00:00.000Z`) : null,
        // age: "Dadir",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return { success: true, data: project };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function getProjectById(projectId: string): Promise<
  | { success: true; data: ProjectDetail }
  | {
      success: false;
      code: "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL";
      error: string;
    }
> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, code: "UNAUTHORIZED", error: "Unauthorized" };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { tasks: true },
    });

    if (!project) {
      return {
        success: false,
        code: "NOT_FOUND",
        error: "Project not found",
      };
    }

    return {
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        dueDate:
          project.dueDate ? project.dueDate.toISOString().slice(0, 10) : null,
        tasks: project.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          // Stored as a `Date` at UTC midnight; the wire carries the day only.
          dueDate:
            task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
          priority: task.priority,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get project:", error);
    return {
      success: false,
      code: "INTERNAL",
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<ActionResult<Project>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateProjectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const project = await prisma.project.update({
      where: { id: projectId, userId },
      data: parsed.data,
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: project };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Project not found" };
    }
    console.error("Failed to update project:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteProject(
  projectId: string,
): Promise<ActionResult<void>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.project.delete({
      where: { id: projectId, userId },
    });
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    return { success: true, data: undefined };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Project not found" };
    }
    console.error("Failed to delete project:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// TODO: Add pagination
export async function getProjects(): Promise<ActionResult<ProjectSummary[]>> {
  // auth guard
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  // fetch projects and total tasks count - database query(operations)
  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { tasks: true } } },
    });

    // A separate query for completed counts, since Prisma's `_count`
    // only counts rows — it can't filter by status inside that count yet.
    const withCompleted = await Promise.all(
      projects.map(async (project) => {
        const completedCount = await prisma.task.count({
          where: { projectId: project.id, status: "COMPLETE" },
        });
        return { ...project, taskCount: project._count.tasks, completedCount };
      }),
    );

    // standard response(ActionResult object)
    return {
      success: true,
      data: withCompleted.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        dueDate:
          project.dueDate ? project.dueDate.toISOString().slice(0, 10) : null,
        taskCount: project.taskCount,
        completedCount: project.completedCount,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
