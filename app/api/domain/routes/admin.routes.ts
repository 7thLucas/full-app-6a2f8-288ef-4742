import { Router, type Request, type Response } from "express";
import { requireAdmin } from "~/modules/authentication/authentication.middleware";
import { UserModel } from "~/modules/authentication/authentication.model";
import { UserRole } from "~/modules/authentication/authentication.types";
import { ShopModel } from "../models/shop.model";
import { ProductModel } from "../models/product.model";
import { OrderModel } from "../models/order.model";
import { ShopStatus, AccountStatus, AppRole, OrderStatus } from "../marketplace.types";
import { notify } from "../services/notification.service";

const router = Router();

/** Platform dashboard overview + analytics. */
router.get("/admin/overview", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [users, shops, orders] = await Promise.all([
      UserModel.find({ deletedAt: null }).select("role profile is_active createdAt").lean(),
      ShopModel.find({ deletedAt: null }).lean(),
      OrderModel.find({ deletedAt: null }).lean(),
    ]);

    const completed = orders.filter((o) => o.status === OrderStatus.Completed);
    const gmv = completed.reduce((s, o) => s + (o.total || 0), 0);

    // Revenue by last 7 days for a simple analytics chart.
    const days: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o) => (o.createdAt as any)?.toISOString?.().slice(0, 10) === key);
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: dayOrders.filter((o) => o.status === OrderStatus.Completed).reduce((s, o) => s + (o.total || 0), 0),
        orders: dayOrders.length,
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        totalCustomers: users.filter((u) => u.profile?.appRole !== AppRole.ShopOwner && u.role !== UserRole.Admin).length,
        totalShopOwners: users.filter((u) => u.profile?.appRole === AppRole.ShopOwner).length,
        totalShops: shops.length,
        pendingShops: shops.filter((s) => s.status === ShopStatus.Pending).length,
        totalOrders: orders.length,
        gmv,
        chart: days,
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** All shops (admin management). */
router.get("/admin/shops", requireAdmin, async (req: Request, res: Response) => {
  try {
    const filter: any = { deletedAt: null };
    if (req.query.status) filter.status = req.query.status;
    const shops = await ShopModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: shops });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Approve or reject a shop registration. */
router.patch("/admin/shops/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.body?.status as ShopStatus;
    if (![ShopStatus.Approved, ShopStatus.Rejected, ShopStatus.Suspended, ShopStatus.Pending].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }
    const shop = await ShopModel.findById(req.params.id);
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }
    shop.status = status;
    shop.reviewNote = req.body?.note ?? "";
    await shop.save();

    await notify({
      userId: shop.ownerId,
      title: `Shop ${status}`,
      body: `Your shop "${shop.name}" was ${status} by the platform team.`,
      type: "shop",
      link: "/owner",
    });

    res.json({ success: true, data: shop });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Suspend / activate a shop account. */
router.patch("/admin/shops/:id/account", requireAdmin, async (req: Request, res: Response) => {
  try {
    const accountStatus = req.body?.accountStatus as AccountStatus;
    const shop = await ShopModel.findByIdAndUpdate(
      req.params.id,
      { $set: { accountStatus } },
      { new: true },
    );
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }
    res.json({ success: true, data: shop });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** All users (admin management). */
router.get("/admin/users", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find({ deletedAt: null })
      .select("username email role profile is_active createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: users });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Suspend / activate a user account. */
router.patch("/admin/users/:id/account", requireAdmin, async (req: Request, res: Response) => {
  try {
    const isActive = !!req.body?.is_active;
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: { is_active: isActive } },
      { new: true },
    ).select("username email role profile is_active");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, data: user });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** All orders (admin monitor). */
router.get("/admin/orders", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, data: orders });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Broadcast a notification to an audience. */
router.post("/admin/notifications", requireAdmin, async (req: Request, res: Response) => {
  try {
    const b = req.body ?? {};
    if (!b.title) {
      res.status(400).json({ success: false, message: "Title is required" });
      return;
    }
    await notify({
      audience: b.audience || "all",
      title: b.title,
      body: b.body ?? "",
      type: "promo",
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
