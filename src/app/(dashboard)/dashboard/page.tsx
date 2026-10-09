import { getProjects } from "@/src/actions/project.actions";
import DashboardOverview from "@/src/components/dashboard/dashboard-overview";
import ReadErrorState from "@/src/components/ui/read-error-state";

export default async function DashboardPage() {
  const result = await getProjects();

  if (!result.success) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <ReadErrorState
          title="Dashboard unavailable"
          message="We couldn't load your dashboard. Try again in a moment."
        />
      </main>
    );
  }

  return <DashboardOverview projects={result.data} />;
}
