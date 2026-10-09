"use client";

import { buttonStyles } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";

export default function ReadErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  const router = useRouter();

  return (
    <section
      role="alert"
      className="rounded-lg border border-red-400/20 bg-red-400/[0.06] p-5 sm:p-6"
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-400">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          Try again
        </button>
      </div>
    </section>
  );
}
