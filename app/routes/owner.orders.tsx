import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { OrderStatusBadge } from "~/marketplace/components/status-badge";
import { apiGet, apiPatch } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { money, timeAgo } from "~/marketplace/lib/format";
import { OrderStatusEnum } from "~/marketplace/lib/types";
import type { Order } from "~/marketplace/lib/types";
import { cn } from "~/lib/utils";

const TABS = [
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
];

const ACTIVE_STATES = [
  OrderStatusEnum.Pending,
  OrderStatusEnum.Accepted,
  OrderStatusEnum.Preparing,
  OrderStatusEnum.OutForDelivery,
];

export default function OwnerOrdersPage() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState("active");

  async function load() {
    const r = await apiGet<Order[]>("/api/orders/shop");
    setOrders(r.data ?? []);
  }

  useEffect(() => {
    if (loading) return;
    if (!account) {
      navigate("/auth/login?redirect=/owner/orders");
      return;
    }
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [account, loading, navigate]);

  async function setStatus(o: Order, status: string) {
    await apiPatch(`/api/orders/${o._id}/status`, { status });
    load();
  }

  const filtered = orders.filter((o) => {
    if (tab === "active") return ACTIVE_STATES.includes(o.status as any);
    if (tab === "completed") return o.status === OrderStatusEnum.Completed;
    return true;
  });

  return (
    <MobileShell hideNav>
      <AppBar back title="Incoming Orders" />
      <div className="px-4 py-4">
        <div className="mb-4 flex rounded-xl bg-muted p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-sm font-semibold transition",
                tab === t.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No orders here" subtitle="New orders will appear in real time." />
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <div key={o._id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">#{o.reference}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {o.customerName} · {timeAgo(o.createdAt)}
                </p>
                <div className="my-2 space-y-1 border-y border-border py-2 text-sm">
                  {o.items.map((it) => (
                    <div key={it.productId} className="flex justify-between text-muted-foreground">
                      <span>{it.quantity} × {it.name}</span>
                      <span>{money(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Total {money(o.total)}</span>
                  <span className="text-xs capitalize text-muted-foreground">{o.paymentMethod}</span>
                </div>

                {o.deliveryAddress && (
                  <p className="mt-1 text-xs text-muted-foreground">📍 {o.deliveryAddress}</p>
                )}

                {/* Action buttons by status */}
                <div className="mt-3 flex gap-2">
                  {o.status === OrderStatusEnum.Pending && (
                    <>
                      <button
                        onClick={() => setStatus(o, OrderStatusEnum.Accepted)}
                        className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setStatus(o, OrderStatusEnum.Rejected)}
                        className="flex-1 rounded-xl border border-destructive/40 py-2.5 text-sm font-bold text-destructive"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {o.status === OrderStatusEnum.Accepted && (
                    <button
                      onClick={() => setStatus(o, OrderStatusEnum.Preparing)}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
                    >
                      Mark preparing
                    </button>
                  )}
                  {o.status === OrderStatusEnum.Preparing && (
                    <button
                      onClick={() => setStatus(o, OrderStatusEnum.OutForDelivery)}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
                    >
                      Out for delivery
                    </button>
                  )}
                  {o.status === OrderStatusEnum.OutForDelivery && (
                    <button
                      onClick={() => setStatus(o, OrderStatusEnum.Completed)}
                      className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white"
                    >
                      Mark completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
