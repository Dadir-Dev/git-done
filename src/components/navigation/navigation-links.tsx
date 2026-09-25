import { navigationItems } from "./navigation-config";
import ActiveNavLink from "./active-nav-link";

export default function NavigationLinks() {
  return (
    <nav className="mt-8 space-y-1" aria-label="Workspace navigation">
      <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        Workspace
      </p>
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <ActiveNavLink
            key={item.label}
            href={item.href}
            label={item.label}
            match={item.match}
          >
            <Icon size={16} strokeWidth={1.8} />
          </ActiveNavLink>
        );
      })}
    </nav>
  );
}
