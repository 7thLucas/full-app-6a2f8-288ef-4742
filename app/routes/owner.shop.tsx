import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Upload, ImagePlus } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { apiGet, apiPost, uploadImage } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import type { Shop } from "~/marketplace/lib/types";

export default function OwnerShopPage() {
  const { config } = useConfigurables();
  const { account, loading, refresh } = useAccount();
  const navigate = useNavigate();
  const categories = (config?.categories ?? []).map((c) => c.name);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: categories[0] ?? "Restaurant",
    address: "",
    contactPhone: "",
    contactEmail: "",
    logoUrl: "",
    coverUrl: "",
    open: "09:00",
    close: "22:00",
  });
  const [existing, setExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!account) {
      navigate("/auth/login?redirect=/owner/shop");
      return;
    }
    apiGet<Shop>("/api/shops/mine").then((r) => {
      if (r.data) {
        const s = r.data;
        setExisting(true);
        setForm({
          name: s.name,
          description: s.description,
          category: s.category,
          address: s.address,
          contactPhone: s.contactPhone,
          contactEmail: s.contactEmail,
          logoUrl: s.logoUrl,
          coverUrl: s.coverUrl,
          open: s.businessHours?.open ?? "09:00",
          close: s.businessHours?.close ?? "22:00",
        });
      } else {
        setForm((f) => ({ ...f, contactEmail: account.email }));
      }
    });
  }, [account, loading, navigate]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "coverUrl") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field === "logoUrl" ? "logo" : "cover");
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, [field]: url }));
    } catch (err: any) {
      setMsg(err.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    if (!form.name.trim()) {
      setMsg("Shop name is required.");
      return;
    }
    setSaving(true);
    setMsg("");
    const res = await apiPost("/api/shops", {
      ...form,
      businessHours: { open: form.open, close: form.close, isOpen: true },
    });
    setSaving(false);
    if (res.success) {
      await refresh();
      navigate("/owner");
    } else {
      setMsg(res.message || "Could not save.");
    }
  }

  return (
    <MobileShell hideNav>
      <AppBar back title={existing ? "Edit Shop" : "Create Shop"} />
      <div className="space-y-4 px-4 py-4 pb-28">
        {/* Cover */}
        <div className="relative h-32 overflow-hidden rounded-2xl border border-border bg-muted">
          {form.coverUrl ? (
            <img src={form.coverUrl} alt="cover" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImagePlus />
            </div>
          )}
          <label className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow">
            <Upload width={13} height={13} />
            {uploading === "cover" ? "Uploading..." : "Cover"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "coverUrl")} />
          </label>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-border bg-muted">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="logo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImagePlus width={20} height={20} />
              </div>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
            <Upload width={13} height={13} />
            {uploading === "logo" ? "Uploading..." : "Upload logo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "logoUrl")} />
          </label>
        </div>

        <Field label="Shop name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <div>
          <label className="mb-1 block text-sm font-semibold">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {(categories.length ? categories : ["Restaurant", "Cafe", "Grocery"]).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Field label="Contact phone" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} />
        <Field label="Contact email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Opens</label>
            <input
              type="time"
              value={form.open}
              onChange={(e) => setForm({ ...form, open: e.target.value })}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Closes</label>
            <input
              type="time"
              value={form.close}
              onChange={(e) => setForm({ ...form, close: e.target.value })}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {msg && <p className="text-sm font-medium text-destructive">{msg}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card p-4">
        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Saving..." : existing ? "Save changes" : "Create shop"}
        </button>
      </div>
    </MobileShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
