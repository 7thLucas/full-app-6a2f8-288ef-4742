import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_notifications",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Notification extends CommonTypegooseEntity {
  /** Target user id; null/empty means broadcast (resolved by audience). */
  @prop({ type: String, default: "", index: true })
  userId!: string;

  /** Audience tag for broadcast notifications: "all" | "customers" | "shop_owners". */
  @prop({ type: String, default: "" })
  audience!: string;

  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, default: "" })
  body!: string;

  /** "order" | "shop" | "system" | "promo" — drives the icon. */
  @prop({ type: String, default: "system" })
  type!: string;

  /** Optional deep link, e.g. "/orders/123". */
  @prop({ type: String, default: "" })
  link!: string;

  @prop({ type: Boolean, default: false, index: true })
  read!: boolean;
}

export const NotificationModel = getModelForClass(Notification);
