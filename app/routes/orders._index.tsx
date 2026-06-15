import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ReceiptText } from "lucide-react";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { OrderStatusBadge } from "~/marketplace/components/status-badge";
import { apiGet } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { money, timeAgo } from "~/marketplace/lib/format";
import type { Order } from "~/marketplace/lib/types";

export default function OrdersPage() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!account) {
      navigate("/auth/login?redirect=/orders");
      return;
    }
    apiGet<Order[]>("/api/orders/mine")
      .then((r) => setOrders(r.data ?? []))
      .finally(() => setFetched(true));
  }, [account, loading, navigate]);

  return (
    <MobileShell active="orders">
      <AppBar title="My Orders" />
      <div className="space-y-3 px-4 py-4">
        {fetched && orders.length === 0 ? (
          <EmptyState
            icon={<ReceiptText />}
            title="No orders yet"
            subtitle="When you place an order, it will show up here for tracking."
          />
        ) : (
          orders.map((o) => (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="block rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold">{o.shopName}</p>
                <OrderStatusBadge status={o.status} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                #{o.reference} · {timeAgo(o.createdAt)}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {o.items.length} item{o.items.length > 1 ? "s" : ""}
                </span>
                <span className="font-bold">{money(o.total)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </MobileShell>
  );
}
