import { Link, useNavigate } from "react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { useCart } from "~/marketplace/lib/cart";
import { money } from "~/marketplace/lib/format";

const FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80";

export default function CartPage() {
  const { config } = useConfigurables();
  const { lines, shopName, subtotal, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
  const symbol = config?.currencySymbol ?? "$";
  const deliveryFee = config?.deliveryFee ?? 0;
  const total = subtotal + (lines.length ? deliveryFee : 0);

  if (lines.length === 0) {
    return (
      <MobileShell active="orders">
        <AppBar back title="Cart" />
        <EmptyState
          icon={<ShoppingBag />}
          title="Your cart is empty"
          subtitle="Browse shops and add some items to get started."
        />
        <div className="px-4">
          <Link
            to="/"
            className="block rounded-2xl bg-primary py-3 text-center font-bold text-primary-foreground"
          >
            Explore shops
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell active="orders" hideNav>
      <AppBar
        back
        title="Your Cart"
        right={
          <button onClick={clear} className="text-xs font-semibold text-destructive">
            Clear
          </button>
        }
      />
      <div className="px-4 py-4 pb-40">
        {shopName && (
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            From <span className="text-foreground">{shopName}</span>
          </p>
        )}
        <div className="space-y-3">
          {lines.map((l) => (
            <div key={l.productId} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
              <img
                src={l.imageUrl || FALLBACK}
                alt={l.name}
                className="h-16 w-16 rounded-xl object-cover"
                onError={(e) => (e.currentTarget.src = FALLBACK)}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate font-semibold">{l.name}</p>
                <p className="text-sm font-bold text-primary">{money(l.price, symbol)}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                    <button onClick={() => setQty(l.productId, l.quantity - 1)} aria-label="decrease">
                      <Minus width={15} height={15} />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{l.quantity}</span>
                    <button onClick={() => setQty(l.productId, l.quantity + 1)} aria-label="increase">
                      <Plus width={15} height={15} />
                    </button>
                  </div>
                  <button onClick={() => remove(l.productId)} className="text-muted-foreground">
                    <Trash2 width={17} height={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{money(subtotal, symbol)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery fee</span>
            <span>{money(deliveryFee, symbol)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold">
            <span>Total</span>
            <span>{money(total, symbol)}</span>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card p-4">
        <button
          onClick={() => navigate("/checkout")}
          className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-3.5 font-bold text-primary-foreground"
        >
          <span>Checkout</span>
          <span>{money(total, symbol)}</span>
        </button>
      </div>
    </MobileShell>
  );
}
