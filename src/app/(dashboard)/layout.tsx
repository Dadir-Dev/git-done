// src/app/(dashboard)/layout.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import DesktopSidebar from "@/src/components/navigation/desktop-sidebar";
import MobileNavigation from "@/src/components/navigation/mobile-navigation";
import SidebarContent from "@/src/components/navigation/sidebar-content";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();
  const clerkUser = await currentUser();
  const displayName =
    clerkUser?.fullName ??
    clerkUser?.username ??
    clerkUser?.primaryEmailAddress?.emailAddress ??
    "Account";

  return (
    <div className="min-h-screen bg-[#121214] text-zinc-100">
      <DesktopSidebar displayName={displayName} />
      <MobileNavigation>
        <SidebarContent displayName={displayName} />
      </MobileNavigation>
      <div className="lg:pl-62.5">{children}</div>
    </div>
  );
}
