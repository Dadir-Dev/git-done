"use client";

import { buttonStyles } from "@/src/components/ui/button";
import { CircleAlert } from "lucide-react";
import { useEffect } from "react";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section
        role="alert"
        className="w-full rounded-lg border border-red-400/20 bg-red-400/[0.06] p-6 sm:p-8"
      >
        <CircleAlert size={20} aria-hidden="true" className="text-red-300" />
        <h1 className="mt-4 text-lg font-semibold text-zinc-100">
          This page couldn&apos;t load
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Something went wrong while loading this page. Try again, or return to
          your dashboard later.
        </p>
        <button
          type="button"
          onClick={retry}
          className={`${buttonStyles({ variant: "secondary" })} mt-5`}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
