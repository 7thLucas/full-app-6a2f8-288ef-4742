import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Star,
  Plus,
  ClipboardList,
  Store,
  TrendingUp,
} from "lucide-react";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { Stat } from "~/marketplace/components/cards";
import { ShopStatusBadge } from "~/marketplace/components/status-badge";
import { apiGet } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { money } from "~/marketplace/lib/format";
import type { Shop, Order } from "~/marketplace/lib/types";

interface Stats {
  shop: Shop;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  customerReviews: number;
  pendingOrders: number;
}

export default function OwnerDashboard() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!account) {
      navigate("/auth/login?redirect=/owner");
      return;
    }
    Promise.all([
      apiGet<Stats>("/api/shops/mine/stats"),
      apiGet<Order[]>("/api/orders/shop"),
    ]).then(([s, o]) => {
      setStats(s.data ?? null);
      setOrders(o.data ?? []);
      setFetched(true);
    });
  }, [account, loading, navigate]);

  // No shop yet → onboarding to create one.
  if (fetched && !stats) {
    return (
      <MobileShell active="dashboard">
        <AppBar title="Seller Dashboard" />
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Store width={28} height={28} />
          </div>
          <div>
            <p className="text-lg font-bold">Open your shop</p>
            <p className="text-sm text-muted-foreground">
              Set up your storefront to start selling. Your shop goes live after admin approval.
            </p>
          </div>
          <Link
            to="/owner/shop"
            className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground"
          >
            Create my shop
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell active="dashboard">
      <AppBar title="Seller Dashboard" />
      <div className="space-y-5 px-4 py-4">
        {stats && (
          <>
            <Link to="/owner/shop" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <img
                src={stats.shop.logoUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200"}
                alt=""
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{stats.shop.name}</p>
                <ShopStatusBadge status={stats.shop.status} />
              </div>
              <TrendingUp width={18} height={18} className="text-primary" />
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total Orders" value={String(stats.totalOrders)} accent="text-primary" />
              <Stat label="Total Revenue" value={money(stats.totalRevenue)} accent="text-green-600" />
              <Stat label="Active Products" value={String(stats.activeProducts)} accent="text-indigo-600" />
              <Stat label="Customer Reviews" value={String(stats.customerReviews)} accent="text-accent-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/owner/products" className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-bold text-primary-foreground">
                <Plus width={18} height={18} /> Products
              </Link>
              <Link to="/owner/orders" className="relative flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 font-bold">
                <ClipboardList width={18} height={18} /> Orders
                {stats.pendingOrders > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {stats.pendingOrders}
                  </span>
                )}
              </Link>
            </div>

            <section>
              <h2 className="mb-2 font-bold">Recent orders</h2>
              {orders.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                  No orders yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map((o) => (
                    <Link
                      key={o._id}
                      to="/owner/orders"
                      className="flex items-center justify-between rounded-2xl border border-border bg-card p-3"
                    >
                      <div>
                        <p className="text-sm font-bold">#{o.reference}</p>
                        <p className="text-xs text-muted-foreground">{o.customerName} · {o.items.length} items</p>
                      </div>
                      <span className="font-bold">{money(o.total)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MobileShell>
  );
}
