import { describe, expect, it } from "vitest";
import { taskStatusEnum } from "@/src/lib/validations/task.schema";

// Infrastructure canary: proves the "@" alias resolves the way the app does.
// Safe to keep — it asserts the status contract, not the runner.
describe("test harness", () => {
  it("resolves the @ alias into src/", () => {
    expect(taskStatusEnum.options).toHaveLength(3);
  });
});
