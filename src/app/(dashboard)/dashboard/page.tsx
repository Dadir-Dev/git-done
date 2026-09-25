import { getProjects } from "@/src/actions/project.actions";
import DashboardOverview from "@/src/components/dashboard/dashboard-overview";

export default async function DashboardPage() {
  const result = await getProjects();
  const projects = result.success ? result.data : [];

  return <DashboardOverview projects={projects} />;
}
