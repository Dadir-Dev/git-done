"use client";

import { Menu } from "lucide-react";
import Button from "@/src/components/ui/button";

export default function MobileMenuToggle({
  open,
  onOpen,
}: {
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <Button
      variant="secondary-surface"
      size="icon"
      aria-label="Open navigation"
      aria-expanded={open}
      aria-controls="mobile-navigation"
      onClick={onOpen}
      className="fixed left-3 top-3 z-20 lg:hidden"
    >
      <Menu size={18} aria-hidden="true" />
    </Button>
  );
}
