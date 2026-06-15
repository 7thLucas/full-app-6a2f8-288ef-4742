import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Search as SearchIcon, Store } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { ShopCardWide, ProductRow, EmptyState } from "~/marketplace/components/cards";
import { apiGet } from "~/marketplace/lib/client";
import { useCart } from "~/marketplace/lib/cart";
import type { Shop, Product } from "~/marketplace/lib/types";
import { cn } from "~/lib/utils";

export default function SearchPage() {
  const { config } = useConfigurables();
  const { add } = useCart();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "All");
  const [tab, setTab] = useState<"shops" | "products">("shops");
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = ["All", ...(config?.categories ?? []).map((c) => c.name)];

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      const shopQuery: Record<string, string> = {};
      if (q) shopQuery.q = q;
      if (category !== "All") shopQuery.category = category;
      Promise.all([
        apiGet<Shop[]>("/api/shops", shopQuery),
        apiGet<Product[]>("/api/products", q ? { q } : {}),
      ]).then(([s, p]) => {
        setShops(s.data ?? []);
        setProducts(p.data ?? []);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [q, category]);

  function syncParams(nextQ: string, nextCat: string) {
    const np = new URLSearchParams();
    if (nextQ) np.set("q", nextQ);
    if (nextCat !== "All") np.set("category", nextCat);
    setParams(np, { replace: true });
  }

  function handleAdd(p: Product) {
    const name = p.shopName ?? shops.find((s) => s._id === p.shopId)?.name ?? "Shop";
    const res = add(p, name);
    if (res.conflict) alert("Your cart has items from another shop. Clear it first.");
  }

  return (
    <MobileShell active="search">
      <AppBar title="Search" />
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <SearchIcon width={18} height={18} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              syncParams(e.target.value, category);
            }}
            placeholder={config?.searchPlaceholder ?? "Search..."}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                syncParams(q, c);
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex rounded-xl bg-muted p-1">
          {(["shops", "products"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-sm font-semibold capitalize transition",
                tab === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
              )}
            >
              {t} ({t === "shops" ? shops.length : products.length})
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-sm text-muted-foreground">Searching...</p>}

        {!loading && tab === "shops" && (
          <div className="space-y-3">
            {shops.length === 0 ? (
              <EmptyState icon={<Store />} title="No shops found" subtitle="Try a different keyword or category." />
            ) : (
              shops.map((s) => <ShopCardWide key={s._id} shop={s} />)
            )}
          </div>
        )}

        {!loading && tab === "products" && (
          <div className="space-y-3">
            {products.length === 0 ? (
              <EmptyState title="No products found" subtitle="Try a different keyword." />
            ) : (
              products.map((p) => <ProductRow key={p._id} product={p} onAdd={handleAdd} />)
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
