# Tester — Multi-Vendor Marketplace

## What It Is
A mobile-first, multi-vendor marketplace (Swiggy/Zomato model) connecting customers with local shops and restaurants. Three distinct roles operate on a single platform with role-based access: Customer, Shop Owner, Admin.

## Users & Roles

### 1. Customer
The end-user who discovers shops, orders, and tracks deliveries.
- Secure registration and login
- Home: fixed top search bar, promotional banner slider, popular categories (horizontal chips), featured shops (horizontal cards), recommended products (vertical feed)
- Shop listing with browse + filtering
- Shop detail page
- Product/menu listing with images, prices, descriptions
- Add to cart → checkout → order placed
- Real-time order status tracking
- Order history
- Profile management
- Notifications
- Bottom tab navigation: Home · Search · Orders · Dashboard · Profile

### 2. Shop Owner
Merchant running a digital storefront and fulfilling orders.
- Shop owner registration
- Shop profile create/manage: name, address, contact, business hours, logo upload, cover image upload
- Product management: add, edit, delete items (images, prices, descriptions)
- Inventory management
- Order management: receive, accept, reject, mark complete
- Sales analytics dashboard with KPI cards: Total Orders, Total Revenue, Active Products, Customer Reviews

### 3. Admin
Platform operator with full governance and oversight.
- Secure admin login
- Platform dashboard overview
- Approve / reject shop registrations
- User management (view, suspend, activate)
- Shop management (view, suspend, activate)
- Order management (monitor, intervene)
- Platform-wide analytics
- Send push notifications to users and/or shop owners
- Account suspension and reactivation

## Data Models
- Users — customer + shop owner + admin accounts, roles, auth tokens
- Shops — profiles, approval status, metadata
- Products — menu/product items per shop: pricing, images, inventory
- Orders — full lifecycle, status, items, totals
- Payments — transaction records, status, gateway references
- Notifications — push logs, targeting, delivery status
- Reviews — customer ratings/reviews per shop and product

## MVP Scope
1. Full customer ordering flow: browse → cart → checkout → real-time tracking
2. Shop owner dashboard: profile setup, product management, order acceptance, basic analytics
3. Admin dashboard: shop approvals, user/shop/order management, platform overview
4. All 7 data models scaffolded
5. Secure role-based auth (3 roles)
6. Notification infrastructure
7. Payment integration surface
8. Location support for shop discovery

## Brand Tone
Fast, modern, trustworthy. Clean UI that signals professionalism to merchants and consumers. Orange energy balanced with structural clarity. Portable to any geography or vertical — not just food, any local commerce category.
