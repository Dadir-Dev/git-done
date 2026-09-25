import SidebarContent from "./sidebar-content";

export default function DesktopSidebar({
  displayName,
}: {
  displayName: string;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-62.5 border-r border-white/[0.07] bg-[#0D0D0F] lg:block">
      <SidebarContent displayName={displayName} />
    </aside>
  );
}
