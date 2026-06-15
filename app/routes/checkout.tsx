import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Wallet, Banknote } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { useCart } from "~/marketplace/lib/cart";
import { useAccount } from "~/marketplace/lib/use-account";
import { apiPost } from "~/marketplace/lib/client";
import { money } from "~/marketplace/lib/format";
import { PaymentMethodEnum } from "~/marketplace/lib/types";
import { cn } from "~/lib/utils";

const METHODS = [
  { id: PaymentMethodEnum.Cash, label: "Cash on delivery", icon: Banknote },
  { id: PaymentMethodEnum.Card, label: "Card", icon: CreditCard },
  { id: PaymentMethodEnum.Wallet, label: "Wallet", icon: Wallet },
];

export default function CheckoutPage() {
  const { config } = useConfigurables();
  const { lines, shopId, subtotal, clear } = useCart();
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const symbol = config?.currencySymbol ?? "$";
  const deliveryFee = config?.deliveryFee ?? 0;
  const total = subtotal + (lines.length ? deliveryFee : 0);

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<string>(PaymentMethodEnum.Cash);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account?.profile?.address) setAddress(account.profile.address);
  }, [account]);

  useEffect(() => {
    if (!loading && !account) navigate("/auth/login?redirect=/checkout");
  }, [loading, account, navigate]);

  useEffect(() => {
    if (lines.length === 0) navigate("/");
  }, [lines.length, navigate]);

  async function placeOrder() {
    if (!address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    setPlacing(true);
    setError("");
    const res = await apiPost("/api/orders", {
      shopId,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      deliveryFee,
      paymentMethod: method,
      deliveryAddress: address,
      notes,
    });
    setPlacing(false);
    if (res.success && res.data) {
      clear();
      navigate(`/orders/${res.data._id}`);
    } else {
      setError(res.message || "Could not place order.");
    }
  }

  return (
    <MobileShell hideNav>
      <AppBar back title="Checkout" />
      <div className="space-y-5 px-4 py-4 pb-40">
        <section>
          <h2 className="mb-2 font-bold">Delivery address</h2>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, building, apartment, city"
            rows={3}
            className="w-full rounded-2xl border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </section>

        <section>
          <h2 className="mb-2 font-bold">Payment method</h2>
          <div className="space-y-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm font-medium transition",
                    method === m.id ? "border-primary bg-primary/5" : "border-border bg-card",
                  )}
                >
                  <Icon width={20} height={20} className="text-primary" />
                  {m.label}
                  <span
                    className={cn(
                      "ml-auto h-4 w-4 rounded-full border-2",
                      method === m.id ? "border-primary bg-primary" : "border-muted-foreground/40",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-bold">Order notes (optional)</h2>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. ring the bell"
            className="w-full rounded-2xl border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </section>

        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
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

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card p-4">
        <button
          onClick={placeOrder}
          disabled={placing}
          className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-60"
        >
          {placing ? "Placing order..." : `Place order · ${money(total, symbol)}`}
        </button>
      </div>
    </MobileShell>
  );
}
