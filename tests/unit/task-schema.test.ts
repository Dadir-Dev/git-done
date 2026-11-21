import { describe, expect, it } from "vitest";
import { createTaskSchema } from "@/src/lib/validations/task.schema";

// Every case starts from a valid task, so a failure can only mean dueDate.
const parseWith = (dueDate?: string | null) =>
  createTaskSchema.safeParse({ title: "Probe task", dueDate });

describe("createTaskSchema — dueDate (YYYY-MM-DD)", () => {
  it("C3b rejects an impossible month (2026-13-01)", () => {
    const result = parseWith("2026-13-01");

    expect(result.success).toBe(false);
  });

  it("C3a rejects a date that never existed (2026-02-30)", () => {
    const result = parseWith("2026-02-30");

    expect(result.success).toBe(false);
    // Not "Use YYYY-MM-DD": the shape is fine, the day is not. This is what
    // separates the round-trip from the regex.
    expect(result.error?.issues[0]?.message).toBe("That date does not exist");
  });

  it("C1 accepts an empty date input as no deadline", () => {
    const result = parseWith("");

    expect(result.success).toBe(true);
    expect(result.data?.dueDate).toBeNull();
  });

  it("C4 accepts a past date (2020-01-15)", () => {
    const result = parseWith("2020-01-15");

    expect(result.success).toBe(true);
    expect(result.data?.dueDate).toBe("2020-01-15");
  });

  it("rejects a full ISO timestamp (wire format is date-only)", () => {
    const result = parseWith("2026-11-20T00:00:00Z");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Use YYYY-MM-DD");
  });
});

// === priority ===
const parseWithPriority = (priority?: string) =>
  createTaskSchema.safeParse({ title: "Probe task", priority });

describe("createTaskSchema — priority", () => {
  it("accepts each priority value", () => {
    const priorities = ["LOW", "MEDIUM", "HIGH"] as const;

    for (const priority of priorities) {
      const result = parseWithPriority(priority);

      expect(result.success).toBe(true);
      expect(result.data?.priority).toBe(priority);
    }
  });

  it("rejects an unknown priority", () => {
    const result = parseWithPriority("URGENT");

    expect(result.success).toBe(false);
  });

  it("leaves an absent priority absent", () => {
    const result = createTaskSchema.safeParse({ title: "x" });

    expect(result.success).toBe(true);

    // This test is the fast pin for the landmine of a default value. If the schema were to change to defaulting to "MEDIUM", this test would fail, and the change would be caught before it reached production.
    if (result.success) {
      expect(result.data.priority).toBeUndefined();
    }
  });
});
