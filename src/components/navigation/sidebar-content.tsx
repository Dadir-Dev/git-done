import SidebarAccount from "./sidebar-account";
import SidebarBrand from "./sidebar-brand";
import NavigationLinks from "./navigation-links";

export default function SidebarContent({
  displayName,
}: {
  displayName: string;
}) {
  return (
    <div className="flex h-full flex-col p-3">
      <SidebarBrand />
      <div className="mx-2 mt-5 rounded-md border border-white/[0.07] bg-white/3 px-3 py-2 text-xs text-zinc-400">
        Personal workspace
      </div>
      <NavigationLinks />
      <SidebarAccount displayName={displayName} />
    </div>
  );
}
