import { Router, type Request, type Response } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import { OrderModel } from "../models/order.model";
import { ShopModel } from "../models/shop.model";
import { ProductModel } from "../models/product.model";
import { PaymentModel } from "../models/payment.model";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ORDER_STATUS_LABELS,
} from "../marketplace.types";
import { notify } from "../services/notification.service";

const router = Router();

function makeRef(): string {
  return "TST-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Customer: place an order (checkout). */
router.post("/orders", requireAuth, async (req: Request, res: Response) => {
  try {
    const b = req.body ?? {};
    const items: any[] = Array.isArray(b.items) ? b.items : [];
    if (items.length === 0) {
      res.status(400).json({ success: false, message: "Cart is empty" });
      return;
    }
    const shop = await ShopModel.findById(b.shopId).lean();
    if (!shop) {
      res.status(400).json({ success: false, message: "Shop not found" });
      return;
    }

    // Re-price from DB to avoid client tampering.
    const ids = items.map((i) => i.productId);
    const dbProducts = await ProductModel.find({ _id: { $in: ids } }).lean();
    const priceMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    const normItems = items.map((i) => {
      const p = priceMap.get(i.productId);
      return {
        productId: i.productId,
        name: p?.name ?? i.name ?? "Item",
        price: p?.price ?? (Number(i.price) || 0),
        quantity: Math.max(1, Number(i.quantity) || 1),
        imageUrl: p?.imageUrl ?? i.imageUrl ?? "",
      };
    });

    const subtotal = normItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryFee = Number(b.deliveryFee) || 0;
    const total = subtotal + deliveryFee;
    const paymentMethod = (b.paymentMethod as PaymentMethod) || PaymentMethod.Cash;

    const now = new Date().toISOString();
    const order = await OrderModel.create({
      reference: makeRef(),
      customerId: req.user!.id,
      customerName: req.user!.username,
      shopId: shop._id.toString(),
      shopName: shop.name,
      items: normItems,
      subtotal,
      deliveryFee,
      total,
      status: OrderStatus.Pending,
      paymentMethod,
      paymentStatus: paymentMethod === PaymentMethod.Cash ? PaymentStatus.Pending : PaymentStatus.Paid,
      deliveryAddress: b.deliveryAddress ?? "",
      notes: b.notes ?? "",
      timeline: [{ status: OrderStatus.Pending, at: now, note: "Order placed" }],
    });

    await PaymentModel.create({
      orderId: order._id.toString(),
      customerId: req.user!.id,
      shopId: shop._id.toString(),
      amount: total,
      method: paymentMethod,
      status: order.paymentStatus,
      gatewayRef: paymentMethod === PaymentMethod.Cash ? "" : "SIM-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    });

    await notify({
      userId: shop.ownerId,
      title: "New order received",
      body: `Order ${order.reference} • ${normItems.length} item(s)`,
      type: "order",
      link: "/owner/orders",
    });

    res.json({ success: true, data: order });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Customer: my order history. */
router.get("/orders/mine", requireAuth, async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find({ customerId: req.user!.id, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner: orders for my shop. */
router.get("/orders/shop", requireAuth, async (req: Request, res: Response) => {
  try {
    const shop = await ShopModel.findOne({ ownerId: req.user!.id, deletedAt: null }).lean();
    if (!shop) {
      res.json({ success: true, data: [] });
      return;
    }
    const orders = await OrderModel.find({ shopId: shop._id.toString(), deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Single order (customer or owner). */
router.get("/orders/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const order = await OrderModel.findById(req.params.id).lean();
    if (!order || order.deletedAt) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    const isCustomer = order.customerId === req.user!.id;
    const shop = await ShopModel.findById(order.shopId).lean();
    const isOwner = shop?.ownerId === req.user!.id;
    if (!isCustomer && !isOwner && req.user!.role !== "admin") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    res.json({ success: true, data: order });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner: transition order status (accept/reject/preparing/out/complete). */
router.patch("/orders/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const next = req.body?.status as OrderStatus;
    const valid = Object.values(OrderStatus).includes(next);
    if (!valid) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }
    const order = await OrderModel.findById(req.params.id);
    if (!order || order.deletedAt) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    const shop = await ShopModel.findById(order.shopId).lean();
    if (shop?.ownerId !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    order.status = next;
    order.timeline.push({ status: next, at: new Date().toISOString(), note: req.body?.note ?? "" });
    if (next === OrderStatus.Completed && order.paymentMethod === PaymentMethod.Cash) {
      order.paymentStatus = PaymentStatus.Paid;
      await PaymentModel.updateOne({ orderId: order._id.toString() }, { $set: { status: PaymentStatus.Paid } });
    }
    await order.save();

    await notify({
      userId: order.customerId,
      title: `Order ${order.reference} ${ORDER_STATUS_LABELS[next].toLowerCase()}`,
      body: `${order.shopName} updated your order.`,
      type: "order",
      link: `/orders/${order._id.toString()}`,
    });

    res.json({ success: true, data: order });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
