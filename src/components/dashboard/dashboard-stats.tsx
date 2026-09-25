function DashboardStatCard({
  label,
  value,
  valueClassName = "text-zinc-100",
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/3 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

export default function DashboardStats({
  projectCount,
  completedTaskCount,
  taskCount,
  completion,
}: {
  projectCount: number;
  completedTaskCount: number;
  taskCount: number;
  completion: number;
}) {
  return (
    <section className="mt-8 grid gap-3 sm:grid-cols-3">
      <DashboardStatCard label="Projects" value={projectCount} />
      <DashboardStatCard
        label="Tasks completed"
        value={`${completedTaskCount}/${taskCount}`}
      />
      <DashboardStatCard
        label="Overall progress"
        value={`${completion}%`}
        valueClassName="text-brand-text"
      />
    </section>
  );
}