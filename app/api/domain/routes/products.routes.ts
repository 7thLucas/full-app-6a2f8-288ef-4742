import { Router, type Request, type Response } from "express";
import { requireAuth, optionalAuth } from "~/modules/authentication/authentication.middleware";
import { ProductModel } from "../models/product.model";
import { ShopModel } from "../models/shop.model";
import { ShopStatus, AccountStatus } from "../marketplace.types";

const router = Router();

async function ownsShop(userId: string, shopId: string): Promise<boolean> {
  const shop = await ShopModel.findById(shopId).lean();
  return !!shop && shop.ownerId === userId;
}

/** Public: recommended / searchable products across approved shops. */
router.get("/products", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { q, shopId, category } = req.query;
    const filter: any = { isActive: true, deletedAt: null };
    if (shopId) filter.shopId = String(shopId);
    if (category && category !== "All") filter.category = category;
    if (q) filter.name = { $regex: String(q), $options: "i" };

    let products = await ProductModel.find(filter).sort({ ratingAvg: -1, createdAt: -1 }).limit(100).lean();

    // For the public feed, restrict to products from approved + active shops.
    if (!shopId) {
      const shopIds = [...new Set(products.map((p) => p.shopId))];
      const visibleShops = await ShopModel.find({
        _id: { $in: shopIds },
        status: ShopStatus.Approved,
        accountStatus: AccountStatus.Active,
        deletedAt: null,
      }).select("_id name").lean();
      const visibleMap = new Map(visibleShops.map((s) => [s._id.toString(), s.name]));
      products = products
        .filter((p) => visibleMap.has(p.shopId))
        .map((p) => ({ ...p, shopName: visibleMap.get(p.shopId) }));
    }

    res.json({ success: true, data: products });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner: list my products. */
router.get("/products/mine", requireAuth, async (req: Request, res: Response) => {
  try {
    const shop = await ShopModel.findOne({ ownerId: req.user!.id, deletedAt: null }).lean();
    if (!shop) {
      res.json({ success: true, data: [] });
      return;
    }
    const products = await ProductModel.find({ shopId: shop._id.toString(), deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: products });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner: create product. */
router.post("/products", requireAuth, async (req: Request, res: Response) => {
  try {
    const shop = await ShopModel.findOne({ ownerId: req.user!.id, deletedAt: null }).lean();
    if (!shop) {
      res.status(400).json({ success: false, message: "Create your shop first" });
      return;
    }
    const b = req.body ?? {};
    const product = await ProductModel.create({
      shopId: shop._id.toString(),
      name: b.name,
      description: b.description ?? "",
      price: Number(b.price) || 0,
      category: b.category ?? "",
      imageUrl: b.imageUrl ?? "",
      stock: Number(b.stock) || 0,
      isActive: b.isActive !== false,
    });
    res.json({ success: true, data: product });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner: update product. */
router.put("/products/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product || product.deletedAt) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    if (!(await ownsShop(req.user!.id, product.shopId))) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    const b = req.body ?? {};
    const fields = ["name", "description", "category", "imageUrl"];
    fields.forEach((f) => b[f] !== undefined && ((product as any)[f] = b[f]));
    if (b.price !== undefined) product.price = Number(b.price) || 0;
    if (b.stock !== undefined) product.stock = Number(b.stock) || 0;
    if (b.isActive !== undefined) product.isActive = !!b.isActive;
    await product.save();
    res.json({ success: true, data: product });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Shop owner: delete product (soft). */
router.delete("/products/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product || product.deletedAt) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    if (!(await ownsShop(req.user!.id, product.shopId))) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    product.deletedAt = new Date();
    product.isActive = false;
    await product.save();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
