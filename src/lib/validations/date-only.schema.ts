import { z } from "zod";

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

export const dateOnlyWireSchema = z
  .union([dateOnlySchema, z.literal("")])
  .transform((value) => (value === "" ? null : value))
  .nullable();
