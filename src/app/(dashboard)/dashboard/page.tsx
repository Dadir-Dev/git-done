import { getProjects } from "@/src/actions/project.actions";
import DashboardWorkspace from "@/src/components/dashboard-workspace";

export default async function DashboardPage() {
  const result = await getProjects();
  const projects = result.success ? result.data : [];

  return <DashboardWorkspace projects={projects} />;
}
