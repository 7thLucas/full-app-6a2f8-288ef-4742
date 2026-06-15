import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { apiGet, apiPost, apiPut, apiDelete, uploadImage } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { money } from "~/marketplace/lib/format";
import type { Product } from "~/marketplace/lib/types";

const EMPTY = { name: "", description: "", price: "", category: "", imageUrl: "", stock: "0" };

export default function OwnerProductsPage() {
  const { config } = useConfigurables();
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await apiGet<Product[]>("/api/products/mine");
    setProducts(r.data ?? []);
  }

  useEffect(() => {
    if (loading) return;
    if (!account) {
      navigate("/auth/login?redirect=/owner/products");
      return;
    }
    load();
  }, [account, loading, navigate]);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY, category: (config?.categories ?? [])[0]?.name ?? "" });
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      imageUrl: p.imageUrl,
      stock: String(p.stock),
    });
    setOpen(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      category: form.category,
      imageUrl: form.imageUrl,
      stock: Number(form.stock) || 0,
    };
    const res = editing
      ? await apiPut(`/api/products/${editing._id}`, payload)
      : await apiPost("/api/products", payload);
    setSaving(false);
    if (res.success) {
      setOpen(false);
      load();
    }
  }

  async function del(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await apiDelete(`/api/products/${p._id}`);
    load();
  }

  async function toggleActive(p: Product) {
    await apiPut(`/api/products/${p._id}`, { isActive: !p.isActive });
    load();
  }

  return (
    <MobileShell hideNav>
      <AppBar
        back
        title="Products"
        right={
          <button onClick={openNew} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
            <Plus width={14} height={14} /> Add
          </button>
        }
      />
      <div className="space-y-3 px-4 py-4">
        {products.length === 0 ? (
          <EmptyState title="No products yet" subtitle="Add your first item to start selling." />
        ) : (
          products.map((p) => (
            <div key={p._id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
              <img
                src={p.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"}
                alt={p.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <p className="truncate font-semibold">{p.name}</p>
                  <span className="font-bold">{money(p.price)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Stock: {p.stock} · {p.isActive ? "Active" : "Hidden"}
                </p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => openEdit(p)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold">
                    <Pencil width={12} height={12} /> Edit
                  </button>
                  <button onClick={() => toggleActive(p)} className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold">
                    {p.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => del(p)} className="flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive">
                    <Trash2 width={12} height={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-end bg-black/40">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">{editing ? "Edit product" : "New product"}</h2>
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative h-32 overflow-hidden rounded-2xl border border-border bg-muted">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
                )}
                <label className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow">
                  <Upload width={13} height={13} />
                  {uploading ? "Uploading..." : "Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>

              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product name"
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={2}
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Price"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="Stock"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Category (e.g. Pizza)"
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={save}
                disabled={saving}
                className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Save changes" : "Add product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
