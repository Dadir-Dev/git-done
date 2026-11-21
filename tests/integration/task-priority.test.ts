import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createTask, updateTask } from "@/src/actions/task.actions";

// vi.hoisted — mockAuth must exist before the vi.mock factories run.
const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }));

vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const USER_ID = "user_integration_priority";
const PROJECT_ID = "project_integration_priority";
const EMAIL = "integration-priority@example.test";

beforeAll(async () => {
  await prisma.project.deleteMany({ where: { id: PROJECT_ID } });
  await prisma.user.deleteMany({
    where: { OR: [{ id: USER_ID }, { email: EMAIL }] },
  });

  await prisma.user.create({
    data: {
      id: USER_ID,
      email: EMAIL,
      name: "Integration fixture",
    },
  });

  await prisma.project.create({
    data: {
      id: PROJECT_ID,
      name: "Integration fixture",
      userId: USER_ID,
    },
  });
});

beforeEach(() => {
  mockAuth.mockResolvedValue({ userId: USER_ID });
});

describe("task priority — the DB default and the partial update", () => {
  it("stores the default when no priority is sent", async () => {
    const result = await createTask(PROJECT_ID, { title: "Priority default" });

    if (!result.success) {
      throw new Error(`Task creation failed: ${result.error}`);
    }

    const rows = await prisma.$queryRaw<{ priority: string }[]>`
      SELECT "priority"::text AS priority FROM tasks WHERE id = ${result.data.id}
    `;

    expect(rows[0]?.priority).toBe("MEDIUM");
  });

  it("keeps priority when an edit omits it", async () => {
    const created = await createTask(PROJECT_ID, {
      title: "Priority kept",
      priority: "HIGH",
    });

    if (!created.success) {
      throw new Error(`Task creation failed: ${created.error}`);
    }

    const updated = await updateTask(created.data.id, {
      title: "Priority renamed",
    });

    if (!updated.success) {
      throw new Error(`Task update failed: ${updated.error}`);
    }

    const rows = await prisma.$queryRaw<{ priority: string }[]>`
      SELECT "priority"::text AS priority FROM tasks WHERE id = ${created.data.id}
    `;

    // Not MEDIUM: an edit that does not mention priority must not reset it.
    expect(rows[0]?.priority).toBe("HIGH");
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { OR: [{ id: USER_ID }, { email: EMAIL }] },
  });

  await prisma.$disconnect();
});
