import { getProjectById } from "@/src/actions/project.actions";
import ProjectWorkspace from "@/src/components/project-workspace/project-workspace";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const result = await getProjectById(projectId);

  // TODO: error handling - conform if return statement is needed here(ask copilot)
  if (!result.success) notFound();

  return <ProjectWorkspace project={result.data} />;
}
