import bcrypt from "bcryptjs";
import { createLogger } from "~/lib/logger";
import { UserModel } from "~/modules/authentication/authentication.model";
import { UserRole } from "~/modules/authentication/authentication.types";
import { ShopModel } from "../models/shop.model";
import { ProductModel } from "../models/product.model";
import { ReviewModel } from "../models/review.model";
import { AppRole, ShopStatus } from "../marketplace.types";

const logger = createLogger("MarketplaceSeed");

const IMG = {
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  pasta: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80",
  noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
  juice: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
};

const COVERS = {
  italiano: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&q=80",
  burger: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1000&q=80",
  sushi: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1000&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&q=80",
  grocery: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&q=80",
};

const LOGOS = {
  italiano: "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=200&q=80",
  burger: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80",
  sushi: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=200&q=80",
  cafe: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&q=80",
  grocery: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=80",
};

interface ShopSeed {
  email: string;
  username: string;
  name: string;
  description: string;
  category: string;
  address: string;
  logoUrl: string;
  coverUrl: string;
  featured: boolean;
  products: { name: string; description: string; price: number; category: string; imageUrl: string; stock: number }[];
}

const SHOPS: ShopSeed[] = [
  {
    email: "italiano@tester.app",
    username: "bella_italiano",
    name: "Bella Italiano",
    description: "Authentic wood-fired pizza and handmade pasta, delivered hot.",
    category: "Restaurant",
    address: "12 Roma Street, Downtown",
    logoUrl: LOGOS.italiano,
    coverUrl: COVERS.italiano,
    featured: true,
    products: [
      { name: "Margherita Pizza", description: "San Marzano tomato, fresh mozzarella, basil.", price: 12.5, category: "Pizza", imageUrl: IMG.pizza, stock: 50 },
      { name: "Truffle Pasta", description: "Creamy tagliatelle with black truffle.", price: 16.0, category: "Pasta", imageUrl: IMG.pasta, stock: 30 },
      { name: "Tiramisu", description: "Classic espresso-soaked mascarpone dessert.", price: 6.5, category: "Dessert", imageUrl: IMG.dessert, stock: 40 },
    ],
  },
  {
    email: "burgerlab@tester.app",
    username: "burger_lab",
    name: "Burger Lab",
    description: "Smash burgers, crispy fries, and thick shakes.",
    category: "Fast Food",
    address: "88 Grill Avenue, Midtown",
    logoUrl: LOGOS.burger,
    coverUrl: COVERS.burger,
    featured: true,
    products: [
      { name: "Classic Smash Burger", description: "Double patty, cheddar, house sauce.", price: 9.9, category: "Burgers", imageUrl: IMG.burger, stock: 60 },
      { name: "Garden Salad", description: "Crisp greens, cherry tomato, vinaigrette.", price: 7.0, category: "Salads", imageUrl: IMG.salad, stock: 25 },
    ],
  },
  {
    email: "sakura@tester.app",
    username: "sakura_sushi",
    name: "Sakura Sushi",
    description: "Fresh nigiri, maki rolls, and ramen bowls.",
    category: "Restaurant",
    address: "5 Cherry Lane, Eastside",
    logoUrl: LOGOS.sushi,
    coverUrl: COVERS.sushi,
    featured: true,
    products: [
      { name: "Salmon Nigiri Set", description: "Eight pieces of premium salmon nigiri.", price: 14.0, category: "Sushi", imageUrl: IMG.sushi, stock: 35 },
      { name: "Spicy Ramen", description: "Rich tonkotsu broth with chili oil.", price: 11.5, category: "Noodles", imageUrl: IMG.noodles, stock: 40 },
    ],
  },
  {
    email: "brewbar@tester.app",
    username: "brew_bar",
    name: "Brew & Bar Cafe",
    description: "Specialty coffee, cold brews, and fresh juices.",
    category: "Cafe",
    address: "21 Bean Street, Uptown",
    logoUrl: LOGOS.cafe,
    coverUrl: COVERS.cafe,
    featured: false,
    products: [
      { name: "Iced Caramel Latte", description: "Double shot, milk, caramel, over ice.", price: 4.8, category: "Coffee", imageUrl: IMG.coffee, stock: 100 },
      { name: "Fresh Orange Juice", description: "Cold-pressed, no added sugar.", price: 3.9, category: "Juice", imageUrl: IMG.juice, stock: 80 },
    ],
  },
  {
    email: "freshmart@tester.app",
    username: "fresh_mart",
    name: "FreshMart Grocery",
    description: "Daily groceries and pantry staples on demand.",
    category: "Grocery",
    address: "100 Market Square, Westend",
    logoUrl: LOGOS.grocery,
    coverUrl: COVERS.grocery,
    featured: false,
    products: [
      { name: "Fresh Produce Box", description: "Seasonal fruits and vegetables bundle.", price: 18.0, category: "Produce", imageUrl: IMG.grocery, stock: 45 },
    ],
  },
];

async function ensureUser(email: string, username: string, appRole: AppRole): Promise<string> {
  let user = await UserModel.findOne({ email });
  if (!user) {
    const password_hash = await bcrypt.hash("Password123!", 12);
    user = await UserModel.create({
      username,
      email,
      password_hash,
      role: UserRole.Authenticated,
      is_active: true,
      profile: { appRole, fullName: username },
    });
  }
  return user._id.toString();
}

export async function seedMarketplace(): Promise<void> {
  try {
    const existing = await ShopModel.countDocuments({});
    if (existing > 0) {
      logger.info("Marketplace already seeded, skipping.");
      return;
    }

    // Demo customer.
    const customerId = await ensureUser("customer@tester.app", "demo_customer", AppRole.Customer);

    for (const s of SHOPS) {
      const ownerId = await ensureUser(s.email, s.username, AppRole.ShopOwner);
      const shop = await ShopModel.create({
        ownerId,
        name: s.name,
        description: s.description,
        category: s.category,
        address: s.address,
        contactPhone: "+1 555-0100",
        contactEmail: s.email,
        logoUrl: s.logoUrl,
        coverUrl: s.coverUrl,
        status: ShopStatus.Approved,
        isFeatured: s.featured,
        businessHours: { open: "09:00", close: "22:00", isOpen: true },
      });

      const shopId = shop._id.toString();
      for (const p of s.products) {
        await ProductModel.create({ shopId, ...p, isActive: true });
      }

      // A couple of seed reviews so ratings render.
      await ReviewModel.create({
        shopId,
        customerId,
        customerName: "demo_customer",
        rating: 5,
        comment: "Fast delivery and great quality!",
      });
      await ReviewModel.create({
        shopId,
        customerId,
        customerName: "demo_customer",
        rating: 4,
        comment: "Tasty and well packaged.",
      });
      const avg = 4.5;
      await ShopModel.findByIdAndUpdate(shopId, { $set: { ratingAvg: avg, ratingCount: 2 } });
    }

    logger.info("✅ Marketplace demo data seeded.");
  } catch (error) {
    logger.error("❌ Failed to seed marketplace data:", error);
  }
}
