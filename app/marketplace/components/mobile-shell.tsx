import { Link, useLocation, useNavigate } from "react-router";
import { Home, Search, ReceiptText, LayoutGrid, User } from "lucide-react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import { useCart } from "../lib/cart";
import { useAccount } from "../lib/use-account";
import { AppRoleEnum } from "../lib/types";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  match: (path: string) => boolean;
}

function dashboardTarget(appRole?: string): string {
  if (appRole === AppRoleEnum.Admin) return "/admin";
  if (appRole === AppRoleEnum.ShopOwner) return "/owner";
  return "/owner"; // customers can open the dashboard to become a seller
}

export function MobileShell({
  children,
  active,
  hideNav = false,
}: {
  children: ReactNode;
  active?: "home" | "search" | "orders" | "dashboard" | "profile";
  hideNav?: boolean;
}) {
  const location = useLocation();
  const { account } = useAccount();
  const { count } = useCart();

  const dash = dashboardTarget(account?.appRole);

  const items: NavItem[] = [
    { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
    { to: "/search", label: "Search", icon: Search, match: (p) => p.startsWith("/search") },
    { to: "/orders", label: "Orders", icon: ReceiptText, match: (p) => p.startsWith("/orders") },
    { to: dash, label: "Dashboard", icon: LayoutGrid, match: (p) => p.startsWith("/owner") || p.startsWith("/admin") },
    { to: "/profile", label: "Profile", icon: User, match: (p) => p.startsWith("/profile") },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-20 shadow-xl">
      {children}

      {!hideNav && (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
          <ul className="grid grid-cols-5">
            {items.map((item) => {
              const isActive = active
                ? active === item.label.toLowerCase()
                : item.match(location.pathname);
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon width={22} height={22} />
                    {item.label === "Orders" && count > 0 && (
                      <span className="absolute right-5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                        {count}
                      </span>
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

/** Lightweight top app bar used across pages. */
export function AppBar({
  title,
  back,
  right,
}: {
  title?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  const { config } = useConfigurables();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="text-foreground/70 hover:text-foreground"
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <h1 className="flex-1 truncate text-base font-bold">{title ?? config?.appName ?? "Tester"}</h1>
      {right}
    </header>
  );
}
