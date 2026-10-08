"use client";

import { createProject } from "@/src/actions/project.actions";
import Button from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

export default function ProjectDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    const listener = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createProject({
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? "") || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#19191c] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="new-project-title"
              className="text-lg font-semibold text-zinc-100"
            >
              New project
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Give the work a clear, memorable name.
            </p>
          </div>
          <Button
            variant="quiet"
            size="icon-sm"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </Button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-zinc-300">
            Project name
            <input
              autoFocus
              name="name"
              required
              maxLength={100}
              placeholder="e.g. Personal Portfolio"
              className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#121214] px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand/80 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-300">
            Description{" "}
            <span className="font-normal text-zinc-500">optional</span>
            <textarea
              name="description"
              maxLength={500}
              rows={3}
              placeholder="What are you trying to accomplish?"
              className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-[#121214] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand/80 focus:outline-none"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="quiet"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {pending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
