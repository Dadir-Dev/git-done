"use client";

import { X } from "lucide-react";
import Button from "@/src/components/ui/button";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MobileMenuToggle from "./mobile-menu-toggle";

export default function MobileNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const isOpen = open && openPathname === pathname;

  function closeNavigation() {
    setOpen(false);
    setOpenPathname(null);
  }

  useEffect(() => {
    if (!open) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeNavigation();
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open]);

  function openNavigation() {
    setOpenPathname(pathname);
    setOpen(true);
  }

  return (
    <>
      <MobileMenuToggle open={isOpen} onOpen={openNavigation} />
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 lg:hidden"
          onMouseDown={closeNavigation}
        >
          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="h-full w-72 border-r border-white/10 bg-[#0D0D0F] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end px-3 pt-3">
              <Button
                variant="quiet"
                size="icon"
                aria-label="Close navigation"
                onClick={closeNavigation}
              >
                <X size={18} aria-hidden="true" />
              </Button>
            </div>
            {children}
          </aside>
        </div>
      )}
    </>
  );
}
