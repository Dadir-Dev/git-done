import Link from "next/link";

function Mark() {
  return (
    <span className="grid size-7 place-items-center rounded-lg bg-brand text-xs font-bold text-zinc-950">
      G
    </span>
  );
}

export default function SidebarBrand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-zinc-100"
    >
      <Mark />
      GitDone
    </Link>
  );
}
