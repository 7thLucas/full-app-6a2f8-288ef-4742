/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TCategory = { name: string; icon?: string };
export type TPromoBanner = { title: string; subtitle?: string; imageUrl?: string };

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  tagline?: string;
  supportEmail?: string;
  currencySymbol?: string;
  deliveryFee?: number;
  heroHeadline?: string;
  heroSubtext?: string;
  searchPlaceholder?: string;
  categories?: TCategory[];
  promoBanners?: TPromoBanner[];
  showFeaturedShops?: boolean;
  showRecommendedProducts?: boolean;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Tester",
  logoUrl: "https://api-micro-uploader.quantumbyte.ai/public/keyspace/placeholder-logo",
  brandColor: {
    primary: "#FF6B00",
    secondary: "#1F2937",
    accent: "#FFB100",
  },
  tagline: "Order from your favorite local shops",
  supportEmail: "support@tester.app",
  currencySymbol: "$",
  deliveryFee: 2.5,
  heroHeadline: "What are you craving today?",
  heroSubtext: "Discover local shops and restaurants near you",
  searchPlaceholder: "Search shops, restaurants, dishes...",
  categories: [
    { name: "Restaurant", icon: "🍽️" },
    { name: "Fast Food", icon: "🍔" },
    { name: "Cafe", icon: "☕" },
    { name: "Grocery", icon: "🛒" },
    { name: "Dessert", icon: "🍰" },
    { name: "Pharmacy", icon: "💊" },
  ],
  promoBanners: [
    {
      title: "50% OFF your first order",
      subtitle: "Use code WELCOME50 at checkout",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=80",
    },
    {
      title: "Free delivery this week",
      subtitle: "On orders over $20 from featured shops",
      imageUrl: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1000&q=80",
    },
  ],
  showFeaturedShops: true,
  showRecommendedProducts: true,
  // ─────────────────────────────────────────────────────────────────────
  // Add new field defaults here. See RULES.md §5 for per-type shape.
  // Required branding fields → use the FILL_X_HERE placeholder pattern.
  // Optional/typed defaults → real value with a "// fill it here" comment:
  //
  //   maxItemsPerPage: 12,                     // fill it here
  //   enableNotifications: true,               // fill it here
  //   featuredCategories: [],                  // fill it here
  //   defaultLanguage: "en",                   // must match enum options
  //   launchDate: "2025-01-01T00:00:00.000Z",  // ISO-8601
  //   heroImage: "",                           // resolved URL after upload
  //   galleryImages: [],                       // array of resolved URLs
  // ─────────────────────────────────────────────────────────────────────
};
