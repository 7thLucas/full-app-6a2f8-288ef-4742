import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  User,
  Store,
  ShieldCheck,
  Bell,
  ReceiptText,
  LogOut,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { apiGet, apiPatch, apiPost } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { AppRoleEnum } from "~/marketplace/lib/types";

export default function ProfilePage() {
  const { config } = useConfigurables();
  const { account, loading, refresh } = useAccount();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setFullName(account.profile?.fullName ?? account.username);
      setPhone(account.profile?.phone ?? "");
      setAddress(account.profile?.address ?? "");
    }
  }, [account]);

  useEffect(() => {
    if (!loading && !account) navigate("/auth/login?redirect=/profile");
  }, [loading, account, navigate]);

  async function save() {
    setSaving(true);
    await apiPatch("/api/account/profile", { fullName, phone, address });
    await refresh();
    setSaving(false);
    setEditing(false);
  }

  async function logout() {
    await apiPost("/api/auth/logout");
    window.location.href = "/auth/login";
  }

  if (!account) {
    return (
      <MobileShell active="profile">
        <AppBar title="Profile" />
        <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
      </MobileShell>
    );
  }

  const roleLabel =
    account.appRole === AppRoleEnum.Admin
      ? "Administrator"
      : account.appRole === AppRoleEnum.ShopOwner
        ? "Shop Owner"
        : "Customer";

  return (
    <MobileShell active="profile">
      <AppBar title="Profile" />
      <div className="space-y-5 px-4 py-4">
        <div className="flex items-center gap-4 rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-black">
            {(account.profile?.fullName ?? account.username).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold">{account.profile?.fullName ?? account.username}</p>
            <p className="truncate text-xs opacity-90">{account.email}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
              {roleLabel}
            </span>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery address"
              rows={2}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin width={15} height={15} /> {account.profile?.address || "No address set"}
            </p>
            <button onClick={() => setEditing(true)} className="mt-3 w-full rounded-xl border border-primary py-2 text-sm font-bold text-primary">
              Edit profile
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Row to="/orders" icon={ReceiptText} label="My Orders" />
          <Row to="/notifications" icon={Bell} label="Notifications" />
          {account.appRole === AppRoleEnum.Admin && <Row to="/admin" icon={ShieldCheck} label="Admin Dashboard" />}
          {account.appRole === AppRoleEnum.ShopOwner && <Row to="/owner" icon={Store} label="My Shop Dashboard" />}
          {account.appRole === AppRoleEnum.Customer && (
            <Row to="/owner" icon={Store} label="Become a Seller" />
          )}
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-bold text-destructive"
        >
          <LogOut width={17} height={17} /> Log out
        </button>

        <p className="text-center text-[11px] text-muted-foreground">
          {config?.appName ?? "Tester"} · {config?.supportEmail ?? ""}
        </p>
      </div>
    </MobileShell>
  );
}

function Row({ to, icon: Icon, label }: { to: string; icon: typeof User; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
      <Icon width={18} height={18} className="text-primary" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight width={16} height={16} className="text-muted-foreground" />
    </Link>
  );
}
