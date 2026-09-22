import { notFound } from "next/navigation";
import { getProjectById } from "@/src/actions/project.actions";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const result = await getProjectById(projectId);

  if (!result.success) {
    notFound();
  }

  const project = result.data;

  return (
    <div>
      <h1>{project.name}</h1>
      {project.description && <p>{project.description}</p>}

      <h2>Tasks</h2>
      {project.tasks.length === 0 ?
        <p>No tasks yet.</p>
      : <ul>
          {project.tasks.map((task) => (
            <li key={task.id}>
              {task.title} — {task.status}
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
