import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { ShopStatusBadge } from "~/marketplace/components/status-badge";
import { apiGet, apiPatch } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { ShopStatusEnum, AppRoleEnum } from "~/marketplace/lib/types";
import type { Shop } from "~/marketplace/lib/types";
import { cn } from "~/lib/utils";

const FILTERS = ["all", "pending", "approved", "rejected", "suspended"];

export default function AdminShopsPage() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [filter, setFilter] = useState(params.get("status") ?? "all");

  async function load() {
    const r = await apiGet<Shop[]>("/api/admin/shops");
    setShops(r.data ?? []);
  }

  useEffect(() => {
    if (loading) return;
    if (!account || account.appRole !== AppRoleEnum.Admin) {
      navigate("/");
      return;
    }
    load();
  }, [account, loading, navigate]);

  async function setStatus(s: Shop, status: string) {
    await apiPatch(`/api/admin/shops/${s._id}/status`, { status });
    load();
  }

  async function toggleSuspend(s: Shop) {
    const next = s.accountStatus === "active" ? "suspended" : "active";
    await apiPatch(`/api/admin/shops/${s._id}/account`, { accountStatus: next });
    load();
  }

  const filtered = filter === "all" ? shops : shops.filter((s) => s.status === filter);

  return (
    <MobileShell hideNav>
      <AppBar back title="Manage Shops" />
      <div className="px-4 py-4">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition",
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No shops" />
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s._id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={s.logoUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200"}
                    alt=""
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.category} · {s.address}</p>
                  </div>
                  <ShopStatusBadge status={s.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {s.status === ShopStatusEnum.Pending && (
                    <>
                      <button
                        onClick={() => setStatus(s, ShopStatusEnum.Approved)}
                        className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setStatus(s, ShopStatusEnum.Rejected)}
                        className="rounded-xl border border-destructive/40 px-4 py-2 text-xs font-bold text-destructive"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {s.status === ShopStatusEnum.Approved && (
                    <button
                      onClick={() => toggleSuspend(s)}
                      className="rounded-xl border border-border px-4 py-2 text-xs font-bold"
                    >
                      {s.accountStatus === "active" ? "Suspend" : "Reactivate"}
                    </button>
                  )}
                  {(s.status === ShopStatusEnum.Rejected || s.status === ShopStatusEnum.Suspended) && (
                    <button
                      onClick={() => setStatus(s, ShopStatusEnum.Approved)}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                    >
                      Approve
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
