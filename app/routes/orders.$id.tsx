import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { CheckCircle2, Circle, XCircle, MapPin } from "lucide-react";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { EmptyState } from "~/marketplace/components/cards";
import { OrderStatusBadge } from "~/marketplace/components/status-badge";
import { StarInput } from "~/marketplace/components/rating";
import { apiGet, apiPost } from "~/marketplace/lib/client";
import { money, dateLabel } from "~/marketplace/lib/format";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  OrderStatusEnum,
} from "~/marketplace/lib/types";
import type { Order } from "~/marketplace/lib/types";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function load() {
    if (!id) return;
    const r = await apiGet<Order>(`/api/orders/${id}`);
    if (r.data) setOrder(r.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Poll for real-time status updates while the order is in progress.
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [id]);

  async function submitReview() {
    if (!order) return;
    const res = await apiPost("/api/reviews", {
      shopId: order.shopId,
      orderId: order._id,
      rating,
      comment,
    });
    if (res.success) {
      setSubmitted(true);
      load();
    }
  }

  if (loading) {
    return (
      <MobileShell hideNav>
        <AppBar back title="Order" />
        <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
      </MobileShell>
    );
  }
  if (!order) {
    return (
      <MobileShell hideNav>
        <AppBar back title="Order" />
        <EmptyState title="Order not found" />
      </MobileShell>
    );
  }

  const terminalRejected =
    order.status === OrderStatusEnum.Rejected || order.status === OrderStatusEnum.Cancelled;
  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status as any);
  const isComplete = order.status === OrderStatusEnum.Completed;

  return (
    <MobileShell hideNav>
      <AppBar back title={`Order #${order.reference}`} />
      <div className="space-y-5 px-4 py-4 pb-10">
        <div className="flex items-center justify-between rounded-2xl bg-primary p-4 text-primary-foreground">
          <div>
            <p className="text-xs opacity-80">{order.shopName}</p>
            <p className="text-lg font-extrabold">{money(order.total)}</p>
          </div>
          <OrderStatusBadge status={order.status} className="bg-white/20 text-white" />
        </div>

        {/* Tracking timeline */}
        <section>
          <h2 className="mb-3 font-bold">Order status</h2>
          {terminalRejected ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <XCircle className="text-red-500" />
              <p className="text-sm font-semibold text-red-700">
                This order was {order.status}.
              </p>
            </div>
          ) : (
            <ol className="space-y-0">
              {ORDER_STATUS_FLOW.map((s, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <li key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {done ? (
                        <CheckCircle2 className="text-green-500" width={22} height={22} />
                      ) : (
                        <Circle className="text-muted-foreground/40" width={22} height={22} />
                      )}
                      {i < ORDER_STATUS_FLOW.length - 1 && (
                        <span className={`my-0.5 h-7 w-0.5 ${done ? "bg-green-400" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className={`text-sm font-semibold ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                        {ORDER_STATUS_LABELS[s]}
                      </p>
                      {order.timeline?.find((t) => t.status === s) && (
                        <p className="text-[11px] text-muted-foreground">
                          {dateLabel(order.timeline.find((t) => t.status === s)?.at)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Items */}
        <section>
          <h2 className="mb-2 font-bold">Items</h2>
          <div className="space-y-2 rounded-2xl border border-border bg-card p-3">
            {order.items.map((it) => (
              <div key={it.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {it.quantity} × {it.name}
                </span>
                <span className="font-semibold">{money(it.price * it.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </div>
        </section>

        {order.deliveryAddress && (
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin width={16} height={16} className="mt-0.5 shrink-0" />
            {order.deliveryAddress}
          </p>
        )}

        {/* Review */}
        {isComplete && !order.reviewed && !submitted && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-bold">Rate your order</h2>
            <div className="mt-2">
              <StarInput value={rating} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={2}
              className="mt-2 w-full rounded-xl border border-border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={submitReview}
              className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
            >
              Submit review
            </button>
          </section>
        )}
        {(order.reviewed || submitted) && isComplete && (
          <p className="text-center text-sm font-medium text-green-600">Thanks for your review!</p>
        )}
      </div>
    </MobileShell>
  );
}
