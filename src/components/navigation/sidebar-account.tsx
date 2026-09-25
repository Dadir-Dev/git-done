import { UserButton } from "@clerk/nextjs";

export default function SidebarAccount({
  displayName,
}: {
  displayName: string;
}) {
  return (
    <div className="mt-auto flex items-center gap-3 border-t border-white/[0.07] px-2 pt-4">
      <UserButton appearance={{ elements: { avatarBox: "size-7" } }} />
      <span className="min-w-0 truncate text-sm font-semibold text-zinc-200">
        {displayName}
      </span>
    </div>
  );
}
