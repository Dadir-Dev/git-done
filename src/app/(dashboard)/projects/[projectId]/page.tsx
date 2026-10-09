import { getProjectById } from "@/src/actions/project.actions";
import ProjectWorkspace from "@/src/components/project-workspace/project-workspace";
import ReadErrorState from "@/src/components/ui/read-error-state";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const result = await getProjectById(projectId);

  if (!result.success) {
    if (result.code === "NOT_FOUND") notFound();

    return (
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <ReadErrorState
          title="Project unavailable"
          message="We couldn't load this project. Try again in a moment."
        />
      </main>
    );
  }

  return <ProjectWorkspace project={result.data} />;
}
