import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Star, MapPin, Phone, Clock, ShoppingCart } from "lucide-react";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { ProductRow, EmptyState } from "~/marketplace/components/cards";
import { Stars } from "~/marketplace/components/rating";
import { apiGet } from "~/marketplace/lib/client";
import { useCart } from "~/marketplace/lib/cart";
import { money, timeAgo } from "~/marketplace/lib/format";
import type { Shop, Product, Review } from "~/marketplace/lib/types";

const FALLBACK = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80";

export default function ShopDetailPage() {
  const { id } = useParams();
  const { add, count, subtotal } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiGet<{ shop: Shop; products: Product[]; reviews: Review[] }>(`/api/shops/${id}`)
      .then((r) => {
        if (r.data) {
          setShop(r.data.shop);
          setProducts(r.data.products);
          setReviews(r.data.reviews);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleAdd(p: Product) {
    if (!shop) return;
    const res = add(p, shop.name);
    if (res.conflict) alert("Your cart has items from another shop. Clear it first to order here.");
  }

  if (loading) {
    return (
      <MobileShell hideNav>
        <AppBar back title="Shop" />
        <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
      </MobileShell>
    );
  }

  if (!shop) {
    return (
      <MobileShell hideNav>
        <AppBar back title="Shop" />
        <EmptyState title="Shop not found" />
      </MobileShell>
    );
  }

  return (
    <MobileShell hideNav>
      <div className="relative">
        <div className="h-44 w-full bg-muted">
          <img
            src={shop.coverUrl || FALLBACK}
            alt={shop.name}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK)}
          />
        </div>
        <Link
          to="/"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </div>

      <div className="px-4 pb-28">
        <div className="-mt-8 flex items-end gap-3">
          <img
            src={shop.logoUrl || FALLBACK}
            alt=""
            className="h-16 w-16 rounded-2xl border-2 border-card object-cover shadow-md"
            onError={(e) => (e.currentTarget.src = FALLBACK)}
          />
          <div className="pb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-xs font-bold shadow-sm">
              <Star width={13} height={13} className="fill-accent text-accent" />
              {shop.ratingAvg ? shop.ratingAvg.toFixed(1) : "New"}
              <span className="text-muted-foreground">({shop.ratingCount})</span>
            </span>
          </div>
        </div>

        <h1 className="mt-3 text-xl font-extrabold">{shop.name}</h1>
        <p className="text-sm text-muted-foreground">{shop.description}</p>

        <div className="mt-3 space-y-1.5 rounded-2xl border border-border bg-card p-3 text-sm">
          {shop.address && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin width={15} height={15} /> {shop.address}
            </p>
          )}
          {shop.contactPhone && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone width={15} height={15} /> {shop.contactPhone}
            </p>
          )}
          {shop.businessHours && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Clock width={15} height={15} /> {shop.businessHours.open} - {shop.businessHours.close}
            </p>
          )}
        </div>

        <h2 className="mb-3 mt-5 font-bold">Menu</h2>
        <div className="space-y-3">
          {products.length === 0 ? (
            <EmptyState title="No items yet" subtitle="This shop hasn't added products." />
          ) : (
            products.map((p) => <ProductRow key={p._id} product={p} onAdd={handleAdd} />)
          )}
        </div>

        {reviews.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 font-bold">Reviews</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{r.customerName}</p>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(r.createdAt)}</span>
                  </div>
                  <Stars value={r.rating} className="mt-1" />
                  {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md p-4">
          <Link
            to="/cart"
            className="flex items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-lg"
          >
            <span className="flex items-center gap-2 font-bold">
              <ShoppingCart width={18} height={18} />
              {count} item{count > 1 ? "s" : ""}
            </span>
            <span className="font-bold">View cart · {money(subtotal)}</span>
          </Link>
        </div>
      )}
    </MobileShell>
  );
}
