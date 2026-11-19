import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createTask } from "@/src/actions/task.actions";

// vi.hoisted — mockAuth must exist before the vi.mock factories run.
const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }));

// Mock the auth() function from @clerk/nextjs/server
vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Constants
const USER_ID = "user_integration_due_date";
const PROJECT_ID = "project_integration_due_date";
const EMAIL = "integration-due-date@example.test";

beforeAll(async () => {
  // Delete any existing projects with PROJECT_ID to ensure a clean slate
  await prisma.project.deleteMany({ where: { id: PROJECT_ID } });

  // Delete any existing users with USER_ID or EMAIL to ensure a clean slate
  await prisma.user.deleteMany({
    where: { OR: [{ id: USER_ID }, { email: EMAIL }] },
  });

  // Create a new user with USER_ID and EMAIL
  await prisma.user.create({
    data: {
      id: USER_ID,
      email: EMAIL,
      name: "Integration fixture",
    },
  });

  // Create a new project with PROJECT_ID and USER_ID
  await prisma.project.create({
    data: {
      id: PROJECT_ID,
      name: "Integration fixture",
      userId: USER_ID,
    },
  });
});

// Set up the mock authentication for each test
beforeEach(() => {
  mockAuth.mockResolvedValue({ userId: USER_ID });
});

describe("createTask — dueDate write path", () => {
  it("creates a task without a due date", async () => {
    const taskData = {
      title: "Task without due date",
      description: "This task has no due date.",
    };

    const result = await createTask(PROJECT_ID, taskData);

    if (!result.success) {
      throw new Error(`Task creation failed: ${result.error}`);
    }

    const rows = await prisma.$queryRaw<{ due_date: string | null }[]>`
      SELECT "dueDate"::text AS due_date FROM tasks WHERE id = ${result.data.id}
    `;

    expect(result.success).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0]?.due_date).toBeNull();
  });

  it("stores a date-only wire value as the same day", async () => {
    const taskData = {
      title: "Task with due date",
      description: "This task has a due date.",
      dueDate: "2026-11-20",
    };

    const result = await createTask(PROJECT_ID, taskData);

    if (!result.success) {
      throw new Error(`Task creation failed: ${result.error}`);
    }

    const rows = await prisma.$queryRaw<{ due_date: string }[]>`
      SELECT "dueDate"::text AS due_date FROM tasks WHERE id = ${result.data.id}
    `;

    expect(result.success).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0]?.due_date).toBe("2026-11-20");
  });

  it("stores NULL when the due date is an empty string", async () => {
    const taskData = {
      title: "Task with empty due date",
      description: "This task has an empty due date.",
      dueDate: "", // This will be transformed to null by the schema
    };

    const result = await createTask(PROJECT_ID, taskData);

    if (!result.success) {
      throw new Error(`Task creation failed: ${result.error}`);
    }

    const rows = await prisma.$queryRaw<{ due_date: string | null }[]>`
      SELECT "dueDate"::text AS due_date FROM tasks WHERE id = ${result.data.id}
    `;

    expect(result.success).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0]?.due_date).toBeNull();
  });
});

// Clean up after all tests have run
afterAll(async () => {
  await prisma.user.deleteMany({
    where: { OR: [{ id: USER_ID }, { email: EMAIL }] },
  });

  await prisma.$disconnect();
});
