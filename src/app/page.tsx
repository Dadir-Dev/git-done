import Link from "next/link";
import Image from "next/image";
import { buttonStyles } from "@/src/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#121214] text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/git-done_remove-bg_.png"
            alt="GitDone"
            width={200}
            height={200}
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className={buttonStyles({ variant: "secondary-prominent" })}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={buttonStyles({ variant: "primary" })}
          >
            Get started
          </Link>
        </div>
      </header>
      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pb-24 pt-20 text-center sm:px-8 sm:pt-28">
        <div
          aria-hidden="true"
          className="absolute -top-24 h-96 w-96 rounded-full bg-brand/10 blur-[100px]"
        />
        <p className="relative rounded-full border border-brand-text/15 bg-brand-text/6 px-3 py-1 text-xs font-medium text-brand-text">
          Project tracking, without the noise
        </p>
        <h1 className="relative mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-zinc-50 sm:text-6xl">
          A calmer place to get meaningful work done.
        </h1>
        <p className="relative mt-6 max-w-xl text-base leading-7 text-zinc-400">
          GitDone keeps projects and their next actions in one focused
          workspace, so you can see progress without managing a system.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/sign-up"
            className={buttonStyles({ variant: "primary", size: "lg" })}
          >
            Start tracking for free
          </Link>
          <Link
            href="/sign-in"
            className={buttonStyles({ variant: "secondary", size: "lg" })}
          >
            Open your workspace
          </Link>
        </div>
        <div className="relative mt-16 w-full rounded-xl border border-white/[0.09] bg-[#171719] p-3 text-left shadow-2xl shadow-black/20">
          <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-2 pb-3">
            <span className="size-2 rounded-full bg-zinc-700" />
            <span className="size-2 rounded-full bg-zinc-700" />
            <span className="size-2 rounded-full bg-zinc-700" />
            <span className="ml-3 text-xs text-zinc-600">
              GitDone / Projects
            </span>
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-[1.25fr_.75fr]">
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-500">Project</p>
              <p className="mt-2 text-sm font-medium text-zinc-100">
                Launch a better portfolio
              </p>
              <div className="mt-5 h-1 rounded-full bg-white/[0.08]">
                <div className="h-full w-2/3 rounded-full bg-brand" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                4 of 6 tasks complete
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-500">Next action</p>
              <p className="mt-2 text-sm font-medium text-zinc-200">
                Write case-study intro
              </p>
              <p className="mt-5 text-xs text-blue-300">In progress</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
