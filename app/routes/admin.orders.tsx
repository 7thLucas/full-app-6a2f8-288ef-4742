import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { OrderStatusBadge } from "~/marketplace/components/status-badge";
import { apiGet } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { money, timeAgo } from "~/marketplace/lib/format";
import { AppRoleEnum } from "~/marketplace/lib/types";
import type { Order } from "~/marketplace/lib/types";

export default function AdminOrdersPage() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!account || account.appRole !== AppRoleEnum.Admin) {
      navigate("/");
      return;
    }
    apiGet<Order[]>("/api/admin/orders").then((r) => setOrders(r.data ?? []));
  }, [account, loading, navigate]);

  return (
    <MobileShell hideNav>
      <AppBar back title="All Orders" />
      <div className="space-y-3 px-4 py-4">
        {orders.length === 0 ? (
          <EmptyState title="No orders" />
        ) : (
          orders.map((o) => (
            <div key={o._id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">#{o.reference}</p>
                <OrderStatusBadge status={o.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {o.customerName} → {o.shopName} · {timeAgo(o.createdAt)}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{o.items.length} items · {o.paymentMethod}</span>
                <span className="font-bold">{money(o.total)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </MobileShell>
  );
}
