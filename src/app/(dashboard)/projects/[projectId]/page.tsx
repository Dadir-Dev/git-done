import { getProjectById } from "@/src/actions/project.actions";
import ProjectWorkspace from "@/src/components/project-workspace";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const result = await getProjectById(projectId);
  if (!result.success) notFound();

  return <ProjectWorkspace project={result.data} />;
}
