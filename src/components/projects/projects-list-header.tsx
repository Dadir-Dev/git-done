export default function ProjectsListHeader({
  onCreateProject,
}: {
  onCreateProject: () => void;
}) {
  return (
    <header className="flex min-h-15 items-center justify-between border-b border-white/[0.07] px-5 pl-15 lg:px-7">
      <span className="text-sm font-medium text-zinc-400">Workspace</span>
      <button
        type="button"
        onClick={onCreateProject}
        className="h-9 rounded-md bg-brand px-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-hover"
      >
        + New project
      </button>
    </header>
  );
}