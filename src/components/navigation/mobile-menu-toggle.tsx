"use client";

import { Menu } from "lucide-react";

export default function MobileMenuToggle({
  open,
  onOpen,
}: {
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Open navigation"
      aria-expanded={open}
      aria-controls="mobile-navigation"
      onClick={onOpen}
      className="fixed left-3 top-3 z-20 grid size-9 place-items-center rounded-md border border-white/10 bg-[#19191c] text-zinc-300 lg:hidden"
    >
      <Menu size={18} aria-hidden="true" />
    </button>
  );
}
