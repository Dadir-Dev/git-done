"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ActiveNavLink({
  href,
  label,
  match,
  children,
}: {
  href: string;
  label: string;
  match: "exact" | "segment";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    match === "exact" ?
      pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex h-9 items-center gap-3 rounded-md px-3 text-sm transition ${active ? "bg-white/8 text-zinc-50" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"}`}
    >
      {active && (
        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" />
      )}
      <span
        aria-hidden="true"
        className="text-zinc-500 group-hover:text-zinc-300"
      >
        {children}
      </span>
      {label}
    </Link>
  );
}
