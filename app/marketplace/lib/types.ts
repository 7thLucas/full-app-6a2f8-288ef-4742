export type {
  AppRole,
  ShopStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  AccountStatus,
} from "~/api/domain/marketplace.types";

export {
  AppRole as AppRoleEnum,
  ShopStatus as ShopStatusEnum,
  OrderStatus as OrderStatusEnum,
  PaymentStatus as PaymentStatusEnum,
  PaymentMethod as PaymentMethodEnum,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
} from "~/api/domain/marketplace.types";

export interface Shop {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  logoUrl: string;
  coverUrl: string;
  businessHours?: { open: string; close: string; isOpen: boolean };
  status: string;
  accountStatus: string;
  reviewNote?: string;
  isFeatured: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt?: string;
}

export interface Product {
  _id: string;
  shopId: string;
  shopName?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  _id: string;
  reference: string;
  customerId: string;
  customerName: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  notes: string;
  timeline: { status: string; at: string; note?: string }[];
  reviewed: boolean;
  createdAt?: string;
}

export interface Review {
  _id: string;
  shopId: string;
  productId?: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  audience: string;
  title: string;
  body: string;
  type: string;
  link: string;
  read: boolean;
  createdAt?: string;
}

export interface AccountUser {
  id: string;
  username: string;
  email: string;
  role: string;
  appRole: string;
  profile: Record<string, any>;
  is_active: boolean;
  createdAt?: string;
}
