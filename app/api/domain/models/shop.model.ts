import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { ShopStatus, AccountStatus } from "../marketplace.types";

class BusinessHours {
  @prop({ type: String, default: "09:00" })
  open!: string;

  @prop({ type: String, default: "22:00" })
  close!: string;

  @prop({ type: Boolean, default: true })
  isOpen!: boolean;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_shops",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Shop extends CommonTypegooseEntity {
  /** Owner user id (references tbl_users). */
  @prop({ type: String, required: true, index: true })
  ownerId!: string;

  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, default: "" })
  description!: string;

  /** Display category, e.g. "Restaurant", "Grocery". */
  @prop({ type: String, default: "General" })
  category!: string;

  @prop({ type: String, default: "" })
  address!: string;

  @prop({ type: String, default: "" })
  contactPhone!: string;

  @prop({ type: String, default: "" })
  contactEmail!: string;

  /** Resolved logo image URL (from uploader). */
  @prop({ type: String, default: "" })
  logoUrl!: string;

  /** Resolved cover image URL (from uploader). */
  @prop({ type: String, default: "" })
  coverUrl!: string;

  @prop({ type: () => BusinessHours, default: {} })
  businessHours!: BusinessHours;

  @prop({ type: String, enum: ShopStatus, default: ShopStatus.Pending, index: true })
  status!: ShopStatus;

  @prop({ type: String, enum: AccountStatus, default: AccountStatus.Active })
  accountStatus!: AccountStatus;

  /** Admin note attached on approve/reject. */
  @prop({ type: String, default: "" })
  reviewNote!: string;

  @prop({ type: Boolean, default: false })
  isFeatured!: boolean;

  @prop({ type: Number, default: 0 })
  ratingAvg!: number;

  @prop({ type: Number, default: 0 })
  ratingCount!: number;
}

export const ShopModel = getModelForClass(Shop);
