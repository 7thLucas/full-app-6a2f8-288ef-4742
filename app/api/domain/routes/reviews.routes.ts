import { Router, type Request, type Response } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import { ReviewModel } from "../models/review.model";
import { ShopModel } from "../models/shop.model";
import { ProductModel } from "../models/product.model";
import { OrderModel } from "../models/order.model";

const router = Router();

async function recomputeShopRating(shopId: string): Promise<void> {
  const reviews = await ReviewModel.find({ shopId, deletedAt: null }).select("rating").lean();
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await ShopModel.findByIdAndUpdate(shopId, {
    $set: { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count },
  });
}

/** Customer: submit a review for a shop (optionally tied to an order). */
router.post("/reviews", requireAuth, async (req: Request, res: Response) => {
  try {
    const b = req.body ?? {};
    if (!b.shopId || !b.rating) {
      res.status(400).json({ success: false, message: "shopId and rating are required" });
      return;
    }
    const review = await ReviewModel.create({
      shopId: b.shopId,
      productId: b.productId ?? "",
      orderId: b.orderId ?? "",
      customerId: req.user!.id,
      customerName: req.user!.username,
      rating: Math.min(5, Math.max(1, Number(b.rating))),
      comment: b.comment ?? "",
    });

    if (b.orderId) {
      await OrderModel.findByIdAndUpdate(b.orderId, { $set: { reviewed: true } });
    }
    if (b.productId) {
      const pReviews = await ReviewModel.find({ productId: b.productId, deletedAt: null }).select("rating").lean();
      const c = pReviews.length;
      const a = c ? pReviews.reduce((s, r) => s + r.rating, 0) / c : 0;
      await ProductModel.findByIdAndUpdate(b.productId, {
        $set: { ratingAvg: Math.round(a * 10) / 10, ratingCount: c },
      });
    }
    await recomputeShopRating(b.shopId);

    res.json({ success: true, data: review });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Public: list reviews for a shop. */
router.get("/reviews/shop/:shopId", async (req: Request, res: Response) => {
  try {
    const reviews = await ReviewModel.find({ shopId: req.params.shopId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
