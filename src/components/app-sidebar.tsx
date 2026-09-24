"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function Mark() {
  return (
    <span className="grid size-7 place-items-center rounded-lg bg-brand text-xs font-bold text-zinc-950">
      G
    </span>
  );
}

function Navigation({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const items = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: "⌂",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard",
      label: "Projects",
      icon: "□",
      active: pathname.startsWith("/projects"),
    },
  ];
  return (
    <nav className="mt-8 space-y-1" aria-label="Workspace navigation">
      <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        Workspace
      </p>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={close}
          className={`group relative flex h-9 items-center gap-3 rounded-md px-3 text-sm transition ${item.active ? "bg-white/8 text-zinc-50" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"}`}
        >
          {item.active && (
            <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" />
          )}
          <span
            aria-hidden="true"
            className="text-base leading-none text-zinc-500 group-hover:text-zinc-300"
          >
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function SidebarContent({ close }: { close?: () => void }) {
  return (
    <div className="flex h-full flex-col p-3">
      <Link
        href="/dashboard"
        onClick={close}
        className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-zinc-100"
      >
        <Mark />
        GitDone
      </Link>
      <div className="mx-2 mt-5 rounded-md border border-white/[0.07] bg-white/3 px-3 py-2 text-xs text-zinc-400">
        Personal workspace
      </div>
      <Navigation close={close} />
      <div className="mt-auto flex items-center gap-3 border-t border-white/[0.07] px-2 pt-4">
        <UserButton appearance={{ elements: { avatarBox: "size-7" } }} />
        <span className="text-sm text-zinc-400">Account</span>
      </div>
    </div>
  );
}

export default function AppSidebar() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const listener = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-62.5 border-r border-white/[0.07] bg-[#0D0D0F] lg:block">
        <SidebarContent />
      </aside>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-20 grid size-9 place-items-center rounded-md border border-white/10 bg-[#19191c] text-zinc-300 lg:hidden"
      >
        ☰
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/65 lg:hidden"
          onMouseDown={() => setOpen(false)}
        >
          <aside
            className="h-full w-72 border-r border-white/10 bg-[#0D0D0F] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-md text-zinc-400 hover:bg-white/[0.07]"
              >
                ×
              </button>
            </div>
            <SidebarContent close={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
