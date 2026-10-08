import Button from "@/src/components/ui/button";

export default function ProjectsListHeader({
  onCreateProject,
}: {
  onCreateProject: () => void;
}) {
  return (
    <header className="flex min-h-15 items-center justify-between border-b border-white/[0.07] px-5 pl-15 lg:px-7">
      <span className="text-sm font-medium text-zinc-400">Workspace</span>
      <Button
        onClick={onCreateProject}
      >
        + New project
      </Button>
    </header>
  );
}