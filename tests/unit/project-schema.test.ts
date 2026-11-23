import { describe, it, expect } from "vitest";
import { createProjectSchema } from "@/src/lib/validations/project.schema";

const parseWith = (dueDate?: string | null) =>
  createProjectSchema.safeParse({ name: "Probe project", dueDate });

describe("createProjectSchema — dueDate (YYYY-MM-DD)", () => {
  it("accepts a date-only wire value", () => {
    const result = parseWith("2026-11-30");

    expect(result.success).toBe(true);
  });

  it("maps the empty control value to null", () => {
    const result = parseWith("");

    if (!result.success) {
      throw new Error("Test failed: " + result.error.message);
    }

    expect(result.data?.dueDate).toBeNull();
  });

  it("leaves an absent dueDate absent", () => {
    const result = parseWith();

    if (!result.success) {
      throw new Error("Test failed: " + result.error.message);
    }

    expect(result.data?.dueDate).toBeUndefined();
  });
});
