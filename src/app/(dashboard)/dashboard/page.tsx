import { getProjects, createProject } from "@/src/actions/project.actions";
import Link from "next/link";

export default async function DashboardPage() {
  const result = await getProjects();
  const projects = result.success ? result.data : [];

  async function handleCreate(formData: FormData) {
    "use server";
    await createProject({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
    });
  }

  return (
    <div>
      <h1>Your Projects</h1>

      <form action={handleCreate}>
        <input name="name" placeholder="Project name" />
        <input name="description" placeholder="Description (optional)" />
        <button type="submit">Create</button>
      </form>

      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/projects/${project.id}`}>{project.name}</Link>
            {" — "}
            {project.completedCount}/{project.taskCount} tasks complete
          </li>
        ))}
      </ul>
    </div>
  );
}
