import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_products",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Product extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  shopId!: string;

  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, default: "" })
  description!: string;

  @prop({ type: Number, required: true, default: 0 })
  price!: number;

  @prop({ type: String, default: "" })
  category!: string;

  /** Resolved product image URL (from uploader). */
  @prop({ type: String, default: "" })
  imageUrl!: string;

  /** Inventory count; 0 => out of stock. */
  @prop({ type: Number, default: 0 })
  stock!: number;

  @prop({ type: Boolean, default: true })
  isActive!: boolean;

  @prop({ type: Number, default: 0 })
  ratingAvg!: number;

  @prop({ type: Number, default: 0 })
  ratingCount!: number;
}

export const ProductModel = getModelForClass(Product);
