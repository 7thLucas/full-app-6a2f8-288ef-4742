import { NotificationModel } from "../models/notification.model";

interface NotifyInput {
  userId?: string;
  audience?: string;
  title: string;
  body?: string;
  type?: string;
  link?: string;
}

/**
 * Create an in-app notification record. This is the platform's notification
 * infrastructure surface — order events, shop approvals, and admin broadcasts
 * all funnel through here. (Real push delivery would hook in at this layer.)
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    await NotificationModel.create({
      userId: input.userId ?? "",
      audience: input.audience ?? "",
      title: input.title,
      body: input.body ?? "",
      type: input.type ?? "system",
      link: input.link ?? "",
      read: false,
    });
  } catch {
    // Notifications are best-effort; never block the primary flow.
  }
}
