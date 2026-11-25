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
import { createProject, updateProject } from "@/src/actions/project.actions";

// vi.hoisted - mockAuth & mockCurrentUser must exist before the vi.mock factories run
const { mockAuth, mockCurrentUser } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCurrentUser: vi.fn(),
}));

// Replace auth and currentUser with mock module
vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const USER_ID = "user_integration_project_due_date";
const EMAIL = "project-due-date-integration@example.test";

beforeAll(async () => {
  // Delete any existing users with USER_ID or EMAIL to ensure a clean slate
  // cascade removes projects and tasks too
  await prisma.user.deleteMany({
    where: { OR: [{ id: USER_ID }, { email: EMAIL }] },
  });
});

beforeEach(() => {
  mockAuth.mockResolvedValue({ userId: USER_ID });
  mockCurrentUser.mockResolvedValue({
    id: USER_ID,
    firstName: "Integration",
    lastName: "Fixture",
    primaryEmailAddress: { emailAddress: EMAIL },
    emailAddresses: [{ emailAddress: EMAIL }],
    imageUrl: null,
  });
});

async function readStoredDueDate(projectId: string): Promise<string | null> {
  // ::text reads the stored day; result.data.dueDate is written by the code under test.
  const rows = await prisma.$queryRaw<{ due_date: string | null }[]>`
    SELECT "dueDate"::text AS due_date FROM projects WHERE id = ${projectId}
  `;

  expect(rows.length).toBe(1);
  return rows[0]?.due_date ?? null;
}

describe("createProject — dueDate write path", () => {
  it("stores a date-only wire value as the same day", async () => {
    const projectData = {
      name: "Integration fixture",
      dueDate: "2026-11-30",
    };

    const result = await createProject(projectData);

    // Throw so fixture failures are visible
    if (!result.success) {
      throw new Error(`Project creation failed: ${result.error}`);
    }

    expect(await readStoredDueDate(result.data.id)).toBe("2026-11-30");
  });

  it("accepts an empty due date", async () => {
    const projectData = {
      name: "Integration Fixture",
      dueDate: "",
    };

    const result = await createProject(projectData);

    if (!result.success) {
      throw new Error(`Project creation failed: ${result.error}`);
    }

    const rows = await prisma.$queryRaw<{ due_date: string | null }[]>`
      SELECT "dueDate"::text AS due_date FROM projects WHERE id = ${result.data.id}
    `;

    expect(rows.length).toBe(1);
    expect(rows[0]?.due_date).toBeNull();
  });

  it("creates projects without due dates", async () => {
    const projectData = {
      name: "Integration fixture",
    };

    const result = await createProject(projectData);

    if (!result.success) {
      throw new Error(`Project creation failed: ${result.error}`);
    }

    expect(await readStoredDueDate(result.data.id)).toBeNull();
  });
});

describe("updateProject — dueDate write path", () => {
  it("updates project with due date", async () => {
    const projectData = {
      name: "Integration fixture",
      dueDate: "2026-11-30",
    };

    const result = await createProject(projectData);

    if (!result.success) {
      throw new Error(`Project creation failed: ${result.error}`);
    }

    const updated = await updateProject(result.data.id, {
      name: "Integration fixture updated",
      dueDate: "2026-12-31",
    });

    if (!updated.success) {
      throw new Error(`Project update failed: ${updated.error}`);
    }

    expect(await readStoredDueDate(result.data.id)).toBe("2026-12-31");
  });

  it("updates project that omits due date without clearing it", async () => {
    const projectData = {
      name: "Integration fixture",
      dueDate: "2026-11-30",
    };

    const result = await createProject(projectData);

    if (!result.success) {
      throw new Error(`Project creation failed: ${result.error}`);
    }

    // no dueDate key — the omission is the claim.
    const updated = await updateProject(result.data.id, {
      name: "Integration fixture updated",
    });

    if (!updated.success) {
      throw new Error(`Project update failed: ${updated.error}`);
    }

    expect(await readStoredDueDate(result.data.id)).toBe("2026-11-30");
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { OR: [{ id: USER_ID }, { email: EMAIL }] },
  });

  await prisma.$disconnect();
});
