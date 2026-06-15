import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../marketplace.types";

class OrderItem {
  @prop({ type: String, required: true })
  productId!: string;

  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: Number, required: true })
  price!: number;

  @prop({ type: Number, required: true, default: 1 })
  quantity!: number;

  @prop({ type: String, default: "" })
  imageUrl!: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_orders",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Order extends CommonTypegooseEntity {
  /** Human-friendly reference, e.g. "TST-1A2B3C". */
  @prop({ type: String, required: true, unique: true })
  reference!: string;

  @prop({ type: String, required: true, index: true })
  customerId!: string;

  @prop({ type: String, required: true })
  customerName!: string;

  @prop({ type: String, required: true, index: true })
  shopId!: string;

  @prop({ type: String, required: true })
  shopName!: string;

  @prop({ type: () => [OrderItem], default: [] })
  items!: OrderItem[];

  @prop({ type: Number, required: true, default: 0 })
  subtotal!: number;

  @prop({ type: Number, default: 0 })
  deliveryFee!: number;

  @prop({ type: Number, required: true, default: 0 })
  total!: number;

  @prop({ type: String, enum: OrderStatus, default: OrderStatus.Pending, index: true })
  status!: OrderStatus;

  @prop({ type: String, enum: PaymentMethod, default: PaymentMethod.Cash })
  paymentMethod!: PaymentMethod;

  @prop({ type: String, enum: PaymentStatus, default: PaymentStatus.Pending })
  paymentStatus!: PaymentStatus;

  @prop({ type: String, default: "" })
  deliveryAddress!: string;

  @prop({ type: String, default: "" })
  notes!: string;

  /** Status transition log for real-time tracking timeline. */
  @prop({ type: () => [Object], default: [] })
  timeline!: { status: OrderStatus; at: string; note?: string }[];

  @prop({ type: Boolean, default: false })
  reviewed!: boolean;
}

export const OrderModel = getModelForClass(Order);
