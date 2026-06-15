import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  ClipboardCheck,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { Stat } from "~/marketplace/components/cards";
import { apiGet } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { money } from "~/marketplace/lib/format";
import { AppRoleEnum } from "~/marketplace/lib/types";

interface Overview {
  totalUsers: number;
  totalCustomers: number;
  totalShopOwners: number;
  totalShops: number;
  pendingShops: number;
  totalOrders: number;
  gmv: number;
  chart: { label: string; revenue: number; orders: number }[];
}

export default function AdminDashboard() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!account) {
      navigate("/auth/login?redirect=/admin");
      return;
    }
    if (account.appRole !== AppRoleEnum.Admin) {
      navigate("/");
      return;
    }
    apiGet<Overview>("/api/admin/overview").then((r) => setData(r.data ?? null));
  }, [account, loading, navigate]);

  const maxRev = Math.max(1, ...(data?.chart ?? []).map((d) => d.revenue));

  return (
    <MobileShell active="dashboard">
      <AppBar title="Admin Dashboard" />
      <div className="space-y-5 px-4 py-4">
        {data && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total GMV" value={money(data.gmv)} accent="text-green-600" />
              <Stat label="Total Orders" value={String(data.totalOrders)} accent="text-primary" />
              <Stat label="Users" value={String(data.totalUsers)} accent="text-indigo-600" />
              <Stat label="Shops" value={String(data.totalShops)} accent="text-accent-foreground" />
            </div>

            {data.pendingShops > 0 && (
              <Link
                to="/admin/shops?status=pending"
                className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
              >
                <ClipboardCheck className="text-amber-600" />
                <div className="flex-1">
                  <p className="font-bold text-amber-800">{data.pendingShops} shop(s) awaiting approval</p>
                  <p className="text-xs text-amber-700">Review new registrations</p>
                </div>
                <ChevronRight className="text-amber-600" />
              </Link>
            )}

            {/* Analytics chart */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 font-bold">Revenue · last 7 days</h2>
              <div className="flex h-32 items-end justify-between gap-2">
                {data.chart.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-primary"
                        style={{ height: `${Math.max(4, (d.revenue / maxRev) * 100)}%` }}
                        title={money(d.revenue)}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <NavRow to="/admin/shops" icon={Store} label="Manage Shops" badge={data.pendingShops} />
              <NavRow to="/admin/users" icon={Users} label="Manage Users" />
              <NavRow to="/admin/orders" icon={ShoppingBag} label="All Orders" />
              <NavRow to="/admin/notifications" icon={Megaphone} label="Send Notification" />
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
}

function NavRow({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: typeof Users;
  label: string;
  badge?: number;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
      <Icon width={18} height={18} className="text-primary" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge ? (
        <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">{badge}</span>
      ) : null}
      <ChevronRight width={16} height={16} className="text-muted-foreground" />
    </Link>
  );
}
