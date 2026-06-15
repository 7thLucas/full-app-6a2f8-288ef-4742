import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { apiGet, apiPatch } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { AppRoleEnum } from "~/marketplace/lib/types";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  profile?: Record<string, any>;
  is_active: boolean;
}

function roleLabel(u: AdminUser): string {
  if (u.role === "admin") return "Admin";
  if (u.profile?.appRole === "shop_owner") return "Shop Owner";
  return "Customer";
}

export default function AdminUsersPage() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);

  async function load() {
    const r = await apiGet<AdminUser[]>("/api/admin/users");
    setUsers(r.data ?? []);
  }

  useEffect(() => {
    if (loading) return;
    if (!account || account.appRole !== AppRoleEnum.Admin) {
      navigate("/");
      return;
    }
    load();
  }, [account, loading, navigate]);

  async function toggle(u: AdminUser) {
    await apiPatch(`/api/admin/users/${u._id}/account`, { is_active: !u.is_active });
    load();
  }

  return (
    <MobileShell hideNav>
      <AppBar back title="Manage Users" />
      <div className="space-y-3 px-4 py-4">
        {users.length === 0 ? (
          <EmptyState title="No users" />
        ) : (
          users.map((u) => (
            <div key={u._id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{u.profile?.fullName || u.username}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                <span className="text-[11px] font-semibold text-primary">{roleLabel(u)}</span>
              </div>
              {u.role !== "admin" && (
                <button
                  onClick={() => toggle(u)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                    u.is_active
                      ? "border border-destructive/40 text-destructive"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {u.is_active ? "Suspend" : "Activate"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </MobileShell>
  );
}
