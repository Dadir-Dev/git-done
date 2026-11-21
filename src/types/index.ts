import type {
  TaskPriority,
  TaskStatus,
} from "@/src/lib/validations/task.schema";

export type { TaskPriority, TaskStatus };

/**
 * Wire shapes: what a server action returns and a client component receives.
 * Storage types (Prisma's `Task`, `Project`) must not cross this boundary —
 * dates arrive here as `YYYY-MM-DD` strings, never as `Date` objects.
 */

export type ProjectTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  priority: TaskPriority;
};

export type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  tasks: ProjectTask[];
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  taskCount: number;
  completedCount: number;
};

export type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
