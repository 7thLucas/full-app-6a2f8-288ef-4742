import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { PaymentMethod, PaymentStatus } from "../marketplace.types";

@modelOptions({
  schemaOptions: {
    collection: "tbl_payments",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Payment extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  orderId!: string;

  @prop({ type: String, required: true, index: true })
  customerId!: string;

  @prop({ type: String, required: true })
  shopId!: string;

  @prop({ type: Number, required: true, default: 0 })
  amount!: number;

  @prop({ type: String, enum: PaymentMethod, default: PaymentMethod.Cash })
  method!: PaymentMethod;

  @prop({ type: String, enum: PaymentStatus, default: PaymentStatus.Pending, index: true })
  status!: PaymentStatus;

  /** Gateway transaction reference (simulated for MVP). */
  @prop({ type: String, default: "" })
  gatewayRef!: string;
}

export const PaymentModel = getModelForClass(Payment);
