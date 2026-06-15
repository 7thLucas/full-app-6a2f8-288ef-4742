import { Router, type Request, type Response } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import { UserRole } from "~/modules/authentication/authentication.types";
import { NotificationModel } from "../models/notification.model";
import { AppRole } from "../marketplace.types";

const router = Router();

function audienceTagsFor(user: { role?: string; profile?: Record<string, any> }): string[] {
  const tags = ["all"];
  if (user.role === UserRole.Admin) {
    tags.push("admins");
  } else if (user.profile?.appRole === AppRole.ShopOwner) {
    tags.push("shop_owners");
  } else {
    tags.push("customers");
  }
  return tags;
}

/** Current user's notifications (direct + matching broadcasts). */
router.get("/notifications", requireAuth, async (req: Request, res: Response) => {
  try {
    const tags = audienceTagsFor(req.user!);
    const notifications = await NotificationModel.find({
      $or: [{ userId: req.user!.id }, { audience: { $in: tags } }],
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unread = notifications.filter((n) => !n.read).length;
    res.json({ success: true, data: { notifications, unread } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Mark one notification as read. */
router.patch("/notifications/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    await NotificationModel.findByIdAndUpdate(req.params.id, { $set: { read: true } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Mark all of the user's notifications as read. */
router.patch("/notifications/read-all", requireAuth, async (req: Request, res: Response) => {
  try {
    const tags = audienceTagsFor(req.user!);
    await NotificationModel.updateMany(
      { $or: [{ userId: req.user!.id }, { audience: { $in: tags } }], read: false },
      { $set: { read: true } },
    );
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
