import { getProjects } from "@/src/actions/project.actions";
import ProjectsListWorkspace from "@/src/components/projects/projects-list-workspace";

export default async function ProjectsPage() {
  const result = await getProjects();
  const projects = result.success ? result.data : [];

  return <ProjectsListWorkspace projects={projects} />;
}
