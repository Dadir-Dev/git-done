import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#121214] p-4">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <span className="mx-auto grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-zinc-950">
            G
          </span>
          <p className="mt-3 text-sm font-semibold text-zinc-100">GitDone</p>
          <p className="mt-1 text-sm text-zinc-500">
            Welcome back to your workspace.
          </p>
        </div>
        <SignIn
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              card: "w-full border border-white/10 bg-[#19191c] shadow-2xl shadow-black/20",
              headerTitle: "text-zinc-100",
              headerSubtitle: "text-zinc-400",
              socialButtonsBlockButton:
                "border-white/10 bg-transparent text-zinc-200 hover:bg-white/[0.06]",
              formFieldLabel: "text-zinc-300",
              formFieldInput: "border-white/10 bg-[#121214] text-zinc-100",
              formButtonPrimary:
                "bg-brand text-zinc-950 hover:bg-brand-hover",
              footerActionText: "text-zinc-500",
              footerActionLink: "text-brand-text",
            },
          }}
        />
      </div>
    </main>
  );
}
