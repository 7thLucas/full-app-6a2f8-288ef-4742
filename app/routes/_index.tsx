import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bell, Search } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { MobileShell } from "~/marketplace/components/mobile-shell";
import { ShopCardWide, ShopCardCompact, ProductRow } from "~/marketplace/components/cards";
import { apiGet } from "~/marketplace/lib/client";
import { useCart } from "~/marketplace/lib/cart";
import { useAccount } from "~/marketplace/lib/use-account";
import type { Shop, Product } from "~/marketplace/lib/types";

export default function HomePage() {
  const { config } = useConfigurables();
  const navigate = useNavigate();
  const { add } = useCart();
  const { account } = useAccount();
  const [featured, setFeatured] = useState<Shop[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unread, setUnread] = useState(0);
  const [banner, setBanner] = useState(0);

  const banners = config?.promoBanners ?? [];
  const categories = config?.categories ?? [];

  useEffect(() => {
    apiGet<Shop[]>("/api/shops", { featured: "true" }).then((r) => setFeatured(r.data ?? []));
    apiGet<Shop[]>("/api/shops").then((r) => setShops(r.data ?? []));
    apiGet<Product[]>("/api/products").then((r) => setProducts((r.data ?? []).slice(0, 12)));
  }, []);

  useEffect(() => {
    if (account) {
      apiGet<{ unread: number }>("/api/notifications").then((r) => setUnread(r.data?.unread ?? 0));
    }
  }, [account]);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setBanner((b) => (b + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  function handleAdd(p: Product) {
    const shopName = shops.find((s) => s._id === p.shopId)?.name ?? "Shop";
    const res = add(p, shopName);
    if (res.conflict) {
      alert("Your cart has items from another shop. Clear it first to order from a new shop.");
    }
  }

  return (
    <MobileShell active="home">
      {/* Header */}
      <header className="bg-primary px-4 pb-5 pt-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Deliver to</p>
            <p className="text-sm font-bold">{account?.profile?.address || "Set your address"}</p>
          </div>
          <Link to="/notifications" className="relative">
            <Bell width={22} height={22} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                {unread}
              </span>
            )}
          </Link>
        </div>

        <button
          onClick={() => navigate("/search")}
          className="mt-4 flex w-full items-center gap-2 rounded-2xl bg-card px-4 py-3 text-left text-sm text-muted-foreground shadow-sm"
        >
          <Search width={18} height={18} className="text-primary" />
          {config?.searchPlaceholder ?? "Search shops, dishes..."}
        </button>
      </header>

      <div className="space-y-6 px-4 py-5">
        {/* Promo banner slider */}
        {banners.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${banner * 100}%)` }}
            >
              {banners.map((b, i) => (
                <div key={i} className="relative h-36 w-full shrink-0">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/65 to-transparent p-4 text-white">
                    <p className="text-lg font-extrabold leading-tight">{b.title}</p>
                    {b.subtitle && <p className="text-xs opacity-90">{b.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {banners.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === banner ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="mb-3 font-bold">Popular Categories</h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {categories.map((c) => (
                <Link
                  key={c.name}
                  to={`/search?category=${encodeURIComponent(c.name)}`}
                  className="flex w-16 shrink-0 flex-col items-center gap-1.5"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-2xl">
                    {c.icon ?? "🛍️"}
                  </span>
                  <span className="text-center text-[11px] font-medium leading-tight">{c.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured shops */}
        {config?.showFeaturedShops !== false && featured.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Featured Shops</h2>
              <Link to="/search" className="text-xs font-semibold text-primary">
                See all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {featured.map((s) => (
                <ShopCardCompact key={s._id} shop={s} />
              ))}
            </div>
          </section>
        )}

        {/* All shops */}
        <section className="space-y-3">
          <h2 className="font-bold">{config?.heroHeadline ?? "Shops near you"}</h2>
          {shops.length === 0 && <p className="text-sm text-muted-foreground">Loading shops...</p>}
          {shops.slice(0, 4).map((s) => (
            <ShopCardWide key={s._id} shop={s} />
          ))}
        </section>

        {/* Recommended products */}
        {config?.showRecommendedProducts !== false && products.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold">Recommended for you</h2>
            {products.map((p) => (
              <ProductRow key={p._id} product={p} onAdd={handleAdd} />
            ))}
          </section>
        )}
      </div>
    </MobileShell>
  );
}
