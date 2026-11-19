import { z } from "zod";

export const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETE"]);

/**
 * A calendar day that actually exists, written as YYYY-MM-DD.
 * `Date.UTC` is forgiving — 2026-02-30 silently becomes 2026-03-02 — so the
 * only reliable check is to build the date and format it back.
 */
const isRealDate = (value: string): boolean => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

/**
 * Wire format for `@db.Date` columns: a date-only string, checked in two
 * stages. Shape first, then existence — once a value is a `Date`, 2026-02-30
 * and 2026-03-02 are indistinguishable.
 */
export const dateOnlySchema = z.string().superRefine((value, ctx) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    ctx.addIssue({ code: "custom", message: "Use YYYY-MM-DD" });
    return; // don't test whether something that isn't a date exists
  }

  if (!isRealDate(value)) {
    ctx.addIssue({ code: "custom", message: "That date does not exist" });
  }
});

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
  dueDate: z
    .union([dateOnlySchema, z.literal("")])
    // An empty date input means "no deadline", which is null; undefined is
    // reserved for a field the caller did not send at all (partial updates).
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
  status: taskStatusEnum.default("TODO"),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;
