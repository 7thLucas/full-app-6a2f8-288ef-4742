import { Router, type Request, type Response } from "express";
import {
  requireAuth,
  requireRole,
  optionalAuth,
} from "~/modules/authentication/authentication.middleware";
import { UserRole } from "~/modules/authentication/authentication.types";
import { UserModel } from "~/modules/authentication/authentication.model";
import { ShopModel } from "../models/shop.model";
import { ProductModel } from "../models/product.model";
import { ReviewModel } from "../models/review.model";
import { OrderModel } from "../models/order.model";
import { ShopStatus, AccountStatus, AppRole, OrderStatus } from "../marketplace.types";
import { notify } from "../services/notification.service";

const router = Router();

function appRoleOf(user?: { profile?: Record<string, any>; role?: string }): AppRole {
  if (user?.role === UserRole.Admin) return AppRole.Admin;
  const r = user?.profile?.appRole;
  return r === AppRole.ShopOwner ? AppRole.ShopOwner : AppRole.Customer;
}

/** Public: list approved + active shops (customer browse). */
router.get("/shops", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { q, category, featured } = req.query;
    const filter: any = {
      status: ShopStatus.Approved,
      accountStatus: AccountStatus.Active,
      deletedAt: null,
    };
    if (category && category !== "All") filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (q) filter.name = { $regex: String(q), $options: "i" };

    const shops = await ShopModel.find(filter).sort({ isFeatured: -1, ratingAvg: -1, createdAt: -1 }).lean();
    res.json({ success: true, data: shops });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner: get my shop (the storefront I own). */
router.get("/shops/mine", requireRole(UserRole.Authenticated, UserRole.Admin), async (req: Request, res: Response) => {
  try {
    const shop = await ShopModel.findOne({ ownerId: req.user!.id, deletedAt: null }).lean();
    res.json({ success: true, data: shop ?? null });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Public: shop detail with products + reviews. */
router.get("/shops/:id", optionalAuth, async (req: Request, res: Response) => {
  try {
    const shop = await ShopModel.findById(req.params.id).lean();
    if (!shop || shop.deletedAt) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }
    const [products, reviews] = await Promise.all([
      ProductModel.find({ shopId: shop._id.toString(), deletedAt: null }).sort({ createdAt: -1 }).lean(),
      ReviewModel.find({ shopId: shop._id.toString(), deletedAt: null }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);
    res.json({ success: true, data: { shop, products, reviews } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner: create or update my shop profile. */
router.post("/shops", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    let shop = await ShopModel.findOne({ ownerId: req.user!.id, deletedAt: null });

    const patch = {
      name: body.name,
      description: body.description,
      category: body.category,
      address: body.address,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      logoUrl: body.logoUrl,
      coverUrl: body.coverUrl,
      businessHours: body.businessHours,
    };
    Object.keys(patch).forEach((k) => (patch as any)[k] === undefined && delete (patch as any)[k]);

    if (shop) {
      Object.assign(shop, patch);
      await shop.save();
    } else {
      shop = await ShopModel.create({
        ownerId: req.user!.id,
        status: ShopStatus.Pending,
        ...patch,
        name: patch.name ?? "My Shop",
      });
      // Promote the user to shop owner app-role.
      await UserModel.findByIdAndUpdate(req.user!.id, { $set: { "profile.appRole": AppRole.ShopOwner } });
      await notify({
        audience: "admins",
        title: "New shop registration",
        body: `${shop.name} is awaiting approval.`,
        type: "shop",
        link: "/admin/shops",
      });
    }
    res.json({ success: true, data: shop });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner dashboard stats. */
router.get("/shops/mine/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const shop = await ShopModel.findOne({ ownerId: req.user!.id, deletedAt: null }).lean();
    if (!shop) {
      res.json({ success: true, data: null });
      return;
    }
    const shopId = shop._id.toString();
    const [orders, activeProducts, reviewCount] = await Promise.all([
      OrderModel.find({ shopId, deletedAt: null }).lean(),
      ProductModel.countDocuments({ shopId, isActive: true, deletedAt: null }),
      ReviewModel.countDocuments({ shopId, deletedAt: null }),
    ]);
    const completed = orders.filter((o) => o.status === OrderStatus.Completed);
    const revenue = completed.reduce((s, o) => s + (o.total || 0), 0);

    res.json({
      success: true,
      data: {
        shop,
        totalOrders: orders.length,
        totalRevenue: revenue,
        activeProducts,
        customerReviews: reviewCount,
        pendingOrders: orders.filter((o) => o.status === OrderStatus.Pending).length,
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
export { appRoleOf };
