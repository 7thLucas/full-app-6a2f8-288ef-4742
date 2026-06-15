import { Link } from "react-router";
import { Star, Clock } from "lucide-react";
import type { Shop, Product } from "../lib/types";
import { Stars } from "./rating";
import { money } from "../lib/format";

const FALLBACK_SHOP = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";
const FALLBACK_PRODUCT = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";

export function ShopCardWide({ shop }: { shop: Shop }) {
  return (
    <Link
      to={`/shops/${shop._id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition active:scale-[0.99]"
    >
      <div className="relative h-32 w-full bg-muted">
        <img
          src={shop.coverUrl || FALLBACK_SHOP}
          alt={shop.name}
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.src = FALLBACK_SHOP)}
        />
        {shop.isFeatured && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            Featured
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 p-3">
        <img
          src={shop.logoUrl || FALLBACK_SHOP}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover"
          onError={(e) => (e.currentTarget.src = FALLBACK_SHOP)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-bold">{shop.name}</p>
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
              <Star width={13} height={13} className="fill-accent text-accent" />
              {shop.ratingAvg ? shop.ratingAvg.toFixed(1) : "New"}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{shop.category}</p>
          <p className="truncate text-xs text-muted-foreground">{shop.address}</p>
        </div>
      </div>
    </Link>
  );
}

export function ShopCardCompact({ shop }: { shop: Shop }) {
  return (
    <Link to={`/shops/${shop._id}`} className="block w-44 shrink-0">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative h-24 w-full bg-muted">
          <img
            src={shop.coverUrl || FALLBACK_SHOP}
            alt={shop.name}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_SHOP)}
          />
        </div>
        <div className="p-2.5">
          <p className="truncate text-sm font-bold">{shop.name}</p>
          <div className="mt-0.5 flex items-center justify-between">
            <span className="truncate text-[11px] text-muted-foreground">{shop.category}</span>
            <span className="flex items-center gap-0.5 text-[11px] font-semibold">
              <Star width={11} height={11} className="fill-accent text-accent" />
              {shop.ratingAvg ? shop.ratingAvg.toFixed(1) : "New"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductRow({
  product,
  onAdd,
}: {
  product: Product & { shopName?: string };
  onAdd?: (p: Product) => void;
}) {
  const out = product.stock <= 0;
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <img
        src={product.imageUrl || FALLBACK_PRODUCT}
        alt={product.name}
        className="h-20 w-20 shrink-0 rounded-xl object-cover"
        onError={(e) => (e.currentTarget.src = FALLBACK_PRODUCT)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate font-semibold">{product.name}</p>
        {product.shopName && (
          <p className="truncate text-[11px] text-muted-foreground">{product.shopName}</p>
        )}
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-bold text-foreground">{money(product.price)}</span>
          {onAdd && (
            <button
              disabled={out}
              onClick={() => onAdd(product)}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-40"
            >
              {out ? "Sold out" : "Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon?: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Clock />}
      </div>
      <p className="font-semibold">{title}</p>
      {subtitle && <p className="max-w-xs text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

export { Stars };
