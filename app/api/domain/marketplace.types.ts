/**
 * Shared marketplace domain enums and DTO types.
 * Imported by both server (models/services) and client (UI) code.
 * Keep this file free of server-only imports so it is safe in the browser bundle.
 */

/** App-level role stored on the user's `profile.appRole`. */
export enum AppRole {
  Customer = "customer",
  ShopOwner = "shop_owner",
  Admin = "admin",
}

/** Lifecycle state for a shop registration. */
export enum ShopStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Suspended = "suspended",
}

/** Lifecycle state for an order. */
export enum OrderStatus {
  Pending = "pending",
  Accepted = "accepted",
  Preparing = "preparing",
  OutForDelivery = "out_for_delivery",
  Completed = "completed",
  Rejected = "rejected",
  Cancelled = "cancelled",
}

/** Payment state. */
export enum PaymentStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
  Refunded = "refunded",
}

export enum PaymentMethod {
  Cash = "cash",
  Card = "card",
  Wallet = "wallet",
}

/** Account state used for admin suspend/activate across users and shops. */
export enum AccountStatus {
  Active = "active",
  Suspended = "suspended",
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Accepted,
  OrderStatus.Preparing,
  OrderStatus.OutForDelivery,
  OrderStatus.Completed,
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Pending",
  [OrderStatus.Accepted]: "Accepted",
  [OrderStatus.Preparing]: "Preparing",
  [OrderStatus.OutForDelivery]: "Out for delivery",
  [OrderStatus.Completed]: "Completed",
  [OrderStatus.Rejected]: "Rejected",
  [OrderStatus.Cancelled]: "Cancelled",
};
