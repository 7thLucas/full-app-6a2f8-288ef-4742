import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_reviews",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Review extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  shopId!: string;

  /** Optional product-level review. */
  @prop({ type: String, default: "" })
  productId!: string;

  @prop({ type: String, default: "" })
  orderId!: string;

  @prop({ type: String, required: true, index: true })
  customerId!: string;

  @prop({ type: String, required: true })
  customerName!: string;

  @prop({ type: Number, required: true, min: 1, max: 5 })
  rating!: number;

  @prop({ type: String, default: "" })
  comment!: string;
}

export const ReviewModel = getModelForClass(Review);
