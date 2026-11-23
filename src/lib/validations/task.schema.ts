import { z } from "zod";
import { dateOnlyWireSchema } from "./date-only.schema";

export const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETE"]);
export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  dueDate: dateOnlyWireSchema.optional(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.default("TODO"),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;
export type TaskPriority = z.infer<typeof taskPriorityEnum>;
