import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
	PrismaClient,
	TaskStatus,
} from "../src/app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const seedUserId = process.env.SEED_USER_ID;
const seedUserEmail = process.env.SEED_USER_EMAIL;
const name = process.env.SEED_USER_NAME ?? null;

if (!connectionString) {
	throw new Error("DATABASE_URL is required to run the seed.");
}

if (!seedUserId || !seedUserEmail) {
	throw new Error(
		"SEED_USER_ID and SEED_USER_EMAIL are required. They must match an existing Clerk user in the target environment.",
	);
}

// Explicit string constants keep TypeScript narrowing inside main().
const userId: string = seedUserId;
const email: string = seedUserEmail;

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

type SeedTask = {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
};

type SeedProject = {
	id: string;
	name: string;
	description: string;
	tasks: SeedTask[];
};

const projects: SeedProject[] = [
	{
		id: "seed-project-gitdone",
		name: "GitDone MVP",
		description: "Ship the core project tracker experience.",
		tasks: [
			{
				id: "seed-task-gitdone-1",
				title: "Finalize dashboard metrics",
				description: "Make sure the summary cards use live task data.",
				status: TaskStatus.COMPLETE,
			},
			{
				id: "seed-task-gitdone-2",
				title: "Add project search",
				description: "Filter projects by name from the projects list.",
				status: TaskStatus.TODO,
			},
			{
				id: "seed-task-gitdone-3",
				title: "Polish mobile navigation",
				description: "Check the drawer at 360px and 390px widths.",
				status: TaskStatus.IN_PROGRESS,
			},
			{
				id: "seed-task-gitdone-4",
				title: "Write migration docs",
				description: "Document the baseline and deploy workflow.",
				status: TaskStatus.TODO,
			},
			{
				id: "seed-task-gitdone-5",
				title: "Add keyboard shortcuts",
				description: "Open the new-project dialog with a shortcut.",
				status: TaskStatus.TODO,
			},
			{
				id: "seed-task-gitdone-6",
				title: "Audit accessibility labels",
				description: "Verify dialogs, menus, and icon buttons.",
				status: TaskStatus.IN_PROGRESS,
			},
		],
	},
	{
		id: "seed-project-portfolio",
		name: "Personal Portfolio",
		description: "Rebuild the portfolio with Next.js 16 and Tailwind v4.",
		tasks: [
			{
				id: "seed-task-portfolio-1",
				title: "Choose typography scale",
				status: TaskStatus.COMPLETE,
			},
			{
				id: "seed-task-portfolio-2",
				title: "Build project case study pages",
				description: "One page per featured project with outcomes.",
				status: TaskStatus.IN_PROGRESS,
			},
			{
				id: "seed-task-portfolio-3",
				title: "Add contact form",
				description: "Server Action with Zod validation and email delivery.",
				status: TaskStatus.TODO,
			},
			{
				id: "seed-task-portfolio-4",
				title: "Optimize images",
				description: "Use next/image and generate responsive sizes.",
				status: TaskStatus.TODO,
			},
		],
	},
	{
		id: "seed-project-prisma",
		name: "Learn Prisma 7",
		description: "Practice migrations, seeding, and the driver adapter.",
		tasks: [
			{
				id: "seed-task-prisma-1",
				title: "Create baseline migration",
				description: "Mark the existing schema as the first migration.",
				status: TaskStatus.COMPLETE,
			},
			{
				id: "seed-task-prisma-2",
				title: "Seed development branch",
				description: "Create realistic projects and tasks for local work.",
				status: TaskStatus.COMPLETE,
			},
			{
				id: "seed-task-prisma-3",
				title: "Practice migrate diff",
				description: "Compare the schema file with each Neon branch.",
				status: TaskStatus.IN_PROGRESS,
			},
			{
				id: "seed-task-prisma-4",
				title: "Document rollback steps",
				description: "Write down how to recover from a failed migration.",
				status: TaskStatus.TODO,
			},
		],
	},
];

async function main() {
	const user = await prisma.user.upsert({
		where: { id: userId },
		create: { id: userId, email, name, imageUrl: null },
		update: { email, name },
	});

	if (process.env.SEED_RESET === "true") {
		await prisma.project.deleteMany({
			where: { id: { in: projects.map((project) => project.id) } },
		});
	}

	for (const project of projects) {
		await prisma.project.upsert({
			where: { id: project.id },
			create: {
				id: project.id,
				name: project.name,
				description: project.description,
				userId: user.id,
			},
			update: {
				name: project.name,
				description: project.description,
			},
		});

		for (const task of project.tasks) {
			await prisma.task.upsert({
				where: { id: task.id },
				create: {
					id: task.id,
					title: task.title,
					description: task.description ?? null,
					status: task.status,
					projectId: project.id,
				},
				update: {
					title: task.title,
					description: task.description ?? null,
					status: task.status,
				},
			});
		}
	}

	const [projectCount, taskCount] = await Promise.all([
		prisma.project.count({ where: { userId: user.id } }),
		prisma.task.count({ where: { project: { userId: user.id } } }),
	]);

	console.log(
		`Seeded ${projects.length} projects and ${projects.reduce(
			(total, project) => total + project.tasks.length,
			0,
		)} tasks for ${email}.`,
	);
	console.log(
		`User ${user.id} now owns ${projectCount} projects and ${taskCount} tasks.`,
	);
}

main()
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
