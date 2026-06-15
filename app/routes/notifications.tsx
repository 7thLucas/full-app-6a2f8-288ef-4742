import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, Package, Store, Megaphone, CheckCheck } from "lucide-react";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { apiGet, apiPatch } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { timeAgo } from "~/marketplace/lib/format";
import type { AppNotification } from "~/marketplace/lib/types";

const ICONS: Record<string, typeof Bell> = {
  order: Package,
  shop: Store,
  promo: Megaphone,
  system: Bell,
};

export default function NotificationsPage() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);

  async function load() {
    const r = await apiGet<{ notifications: AppNotification[] }>("/api/notifications");
    setItems(r.data?.notifications ?? []);
  }

  useEffect(() => {
    if (loading) return;
    if (!account) {
      navigate("/auth/login?redirect=/notifications");
      return;
    }
    load();
  }, [account, loading, navigate]);

  async function markAll() {
    await apiPatch("/api/notifications/read-all");
    load();
  }

  async function open(n: AppNotification) {
    await apiPatch(`/api/notifications/${n._id}/read`);
    if (n.link) navigate(n.link);
    else load();
  }

  return (
    <MobileShell active="home" hideNav>
      <AppBar
        back
        title="Notifications"
        right={
          items.some((i) => !i.read) ? (
            <button onClick={markAll} className="flex items-center gap-1 text-xs font-semibold text-primary">
              <CheckCheck width={15} height={15} /> Read all
            </button>
          ) : undefined
        }
      />
      <div className="px-4 py-4">
        {items.length === 0 ? (
          <EmptyState icon={<Bell />} title="No notifications" subtitle="You're all caught up." />
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <button
                  key={n._id}
                  onClick={() => open(n)}
                  className={`flex w-full gap-3 rounded-2xl border p-3 text-left transition ${
                    n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon width={18} height={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
