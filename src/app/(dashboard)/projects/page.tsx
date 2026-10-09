import { getProjects } from "@/src/actions/project.actions";
import ProjectsListWorkspace from "@/src/components/projects/projects-list-workspace";
import ReadErrorState from "@/src/components/ui/read-error-state";

export default async function ProjectsPage() {
  const result = await getProjects();

  if (!result.success) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <ReadErrorState
          title="Projects unavailable"
          message="We couldn't load your projects. Try again in a moment."
        />
      </main>
    );
  }

  return <ProjectsListWorkspace projects={result.data} />;
}
