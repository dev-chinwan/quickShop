# QuickShop - Grocery Delivery App

A modern, responsive grocery delivery web app built with Next.js 14 (App Router), Tailwind CSS, and Zustand.

## Features

- Home Page - Hero search, category grid, offer banners, featured products
- Products Page - Sidebar filters (category, price, stock), sorting, responsive grid
- Product Detail - Large image, description, add-to-cart, related products
- Cart Page - Quantity controls, coupon codes, order summary, checkout flow
- Cart Drawer - Slide-in cart accessible from anywhere
- Dark Mode - Toggle with persistent preference
- Toast Notifications - On every cart action
- Skeleton Loaders - Smooth loading states
- Mobile-First - Fully responsive design

## Architecture Notes

- All product, category, banner, search, and checkout calls now go through lib/api.js.
- Mock mode is the default for local/demo use.
- Real backend mode can be enabled later with environment variables, without changing UI components.
- The home, category, product, cart, and search flows now rely on the same service boundary.

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 | App Router, SSR/CSR |
| Tailwind CSS | Styling |
| Zustand | Cart state management |
| react-hot-toast | Toast notifications |
| lucide-react | Icons |

## Folder Structure

```
quickshop/
├── app/
│   ├── page.jsx              # Home
│   ├── category/page.jsx     # Products listing
│   ├── products/[id]/page.jsx # Product detail
│   ├── cart/page.jsx         # Cart
│   ├── layout.jsx            # Root layout
│   └── globals.css
├── components/
│   ├── ui/                   # Button, Card, Modal, Badge
│   ├── layout/               # Navbar, Footer
│   ├── product/              # ProductCard, Skeleton
│   ├── cart/                 # CartDrawer
│   └── home/                 # Hero, CategoryGrid, OfferBanners, FeaturedProducts
├── context/
│   ├── CartContext.jsx       # Zustand cart store
│   └── ThemeContext.jsx      # Dark mode
├── hooks/
│   ├── useProducts.js
│   ├── useSearch.js
│   └── useLocalStorage.js
└── lib/
    ├── data.js               # Mock product data
    ├── api.js                # Service layer (API-ready)
    └── utils.js              # Helpers (cn, formatPrice)
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Keep the framework preset as Next.js.
4. Use the default build command: npm run build.
5. Use the default output handled by Vercel for Next.js.
6. Add environment variables only when you are ready to connect a real backend.

Recommended environment variables:

```bash
NEXT_PUBLIC_API_MODE=backend
NEXT_PUBLIC_API_BASE_URL=/api
DATA_PROVIDER=json
```

When moving to MongoDB Atlas (recommended for Vercel):

```bash
NEXT_PUBLIC_API_MODE=backend
NEXT_PUBLIC_API_BASE_URL=/api
DATA_PROVIDER=mongodb
MONGODB_URI=your-atlas-connection-string
MONGODB_DB=quickshop
```

## Backend Integration

The frontend is already prepared to swap from mock data to a real API through lib/api.js.

This repository now includes a built-in serverless backend using Next.js route handlers under `app/api`.

### Data Strategy (Phase 1 -> Phase 2)

Phase 1 (current):

- Source data from `data/seed.json`.
- Use `DATA_PROVIDER=json` for no-setup local testing.
- Reads are stable, writes are in-memory for the running process (good for development/demo).

Phase 2 (production):

- Switch to MongoDB Atlas with `DATA_PROVIDER=mongodb`.
- Works well with Vercel serverless functions and needs no SQL migrations at start.

Why MongoDB over Neon for this project:

- Your current app already uses nested product/order JSON shapes.
- MongoDB integration is simpler and faster for Vercel in early releases.
- Neon is excellent too, but requires more schema/migration work up front.

Mongo schema + index reference:

- `docs/mongodb-schema.md`

Validation schemas used by APIs:

- `lib/server/validators.js`

Environment template:

- `env.backend.example`

Expected backend endpoints:

```text
GET    /api/products
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
GET    /api/products/featured
GET    /api/products/:id
GET    /api/products/:id/related
GET    /api/products/search?q=term
GET    /api/catalog/categories
POST   /api/catalog/categories
GET    /api/catalog/banners
POST   /api/catalog/banners
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
```

Suggested response shape:

```json
{
  "data": []
}
```

For paginated product lists:

```json
{
  "data": [],
  "total": 0
}
```

For checkout:

```json
{
  "success": true,
  "orderId": "QS-123456",
  "estimatedDelivery": "10-15 minutes"
}
```

## API Integration Example

The service layer already supports real API calls. You only need to point it to your backend and keep the same response contract.

```js
export async function fetchProducts(filters) {
  const res = await fetch(`/api/products?${new URLSearchParams(filters)}`);
  return res.json();
}
```

## Postman Testing (Local)

Import this collection in Postman:

- `postman/quickshop-local.postman_collection.json`

Collection variable:

- `baseUrl = http://localhost:3000/api`

Quick test flow:

1. Start app: `npm run dev`
2. Run `Products -> List Products`
3. Run `Orders -> Create Order`
4. Copy returned `orderId` and run `Orders -> Get Order By ID`

## Admin Dashboard (Implementation Plan)

This is the first implementation target for admin features: manage all products with complete field mapping in frontend, validate UI locally, then move from mock storage to DB.

### Goal

Build an admin dashboard where an admin can:

- View all products with search/filter/sort.
- Create a product with all required fields.
- Edit existing products.
- Delete products.
- Toggle featured status and stock availability quickly.

### Frontend Scope (Admin)

Create these routes and components:

- `app/admin/page.jsx` - Dashboard overview cards (total products, low stock, featured count).
- `app/admin/products/page.jsx` - Product table/list with filters and actions.
- `app/admin/products/new/page.jsx` - Create product form.
- `app/admin/products/[id]/page.jsx` - Edit product form.
- `components/admin/ProductForm.jsx` - Shared create/edit form.
- `components/admin/ProductsTable.jsx` - Table/list view with pagination and row actions.
- `components/admin/ProductDeleteModal.jsx` - Confirm before delete.

Use the same service boundary in `lib/api.js` and keep UI components independent from data provider details.

### Required Product Field Mapping (Frontend -> API)

Use this mapping for form payloads and API responses:

| UI Field | Type | Required | API Field | Notes |
|------|------|------|------|------|
| Product Name | string | yes | `name` | 3-120 chars |
| Slug | string | yes | `slug` | unique, lowercase, hyphenated |
| Description | string | yes | `description` | 10+ chars |
| Brand | string | no | `brand` | optional |
| Category ID | string | yes | `categoryId` | must exist in categories |
| Category Name | string | no | `categoryName` | denormalized display field |
| Price | number | yes | `price` | decimal >= 0 |
| Compare At Price | number | no | `compareAtPrice` | decimal >= price |
| Currency | string | yes | `currency` | default `INR` |
| SKU | string | yes | `sku` | unique inventory key |
| Stock Quantity | number | yes | `stock` | integer >= 0 |
| In Stock | boolean | yes | `inStock` | derived from stock or manual toggle |
| Unit Label | string | no | `unitLabel` | ex: `500g`, `1L` |
| Image URL | string | yes | `image` | primary image |
| Gallery Images | string[] | no | `images` | optional list |
| Featured | boolean | no | `featured` | for home featured section |
| Tags | string[] | no | `tags` | searchable keywords |
| Rating | number | no | `rating` | read-only in admin unless needed |
| Review Count | number | no | `reviewCount` | read-only in admin unless needed |
| Status | string | yes | `status` | `draft` or `active` |
| Meta Title | string | no | `seo.title` | SEO |
| Meta Description | string | no | `seo.description` | SEO |

Suggested create/update payload:

```json
{
  "name": "Fresh Apples",
  "slug": "fresh-apples",
  "description": "Crisp and sweet farm-fresh apples.",
  "brand": "QuickFarm",
  "categoryId": "cat-fruits",
  "categoryName": "Fruits",
  "price": 120,
  "compareAtPrice": 140,
  "currency": "INR",
  "sku": "FRU-APL-500",
  "stock": 45,
  "inStock": true,
  "unitLabel": "500g",
  "image": "https://example.com/apple-main.jpg",
  "images": ["https://example.com/apple-main.jpg"],
  "featured": true,
  "tags": ["fruit", "fresh", "apple"],
  "status": "active",
  "seo": {
    "title": "Fresh Apples Online",
    "description": "Order fresh apples with fast delivery."
  }
}
```

### Admin API Contract (Mock First)

Start with route handlers and JSON provider (`DATA_PROVIDER=json`):

```text
GET    /api/admin/products?search=&categoryId=&status=&featured=&page=&limit=&sort=
POST   /api/admin/products
GET    /api/admin/products/:id
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id
PATCH  /api/admin/products/:id/stock
PATCH  /api/admin/products/:id/featured
```

Response contract:

- List:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

- Create/Read/Update:

```json
{
  "data": {}
}
```

- Delete:

```json
{
  "success": true
}
```

### Local UI Testing (Required Before DB)

Use this test flow before DB integration:

1. Set environment for local mock backend:

```bash
NEXT_PUBLIC_API_MODE=backend
NEXT_PUBLIC_API_BASE_URL=/api
DATA_PROVIDER=json
```

2. Run app:

```bash
npm run dev
```

3. Test admin UI manually:

- Open `/admin/products`.
- Create a product with all required fields.
- Validate inline form errors for missing/invalid values.
- Edit product and verify persisted changes after refresh.
- Delete product and verify list count changes.
- Test filters (category/status/featured/search) and pagination.
- Test stock and featured quick actions.

4. Verify with Postman (same base URL):

- Create product -> copy `id`.
- Get product by `id`.
- Patch price/stock/featured.
- Delete product and re-fetch list.

### Move From Mock to DB (Phase 2)

After local UI and API behavior are stable in mock mode:

1. Switch `DATA_PROVIDER=mongodb`.
2. Map admin handlers to MongoDB collections.
3. Add indexes for `slug`, `sku`, `categoryId`, `featured`, `status`, text search fields.
4. Keep response shape unchanged so frontend needs no rewrite.
5. Add server-side validation parity with `lib/server/validators.js`.
6. Re-run same admin UI checklist and Postman flow.

## Build Roadmap

1. Finalize the backend contract first: products, categories, search, cart, checkout, and auth.
2. Add authentication and user profiles next, because cart/order history usually depends on user identity.
3. Replace mock checkout with payment, address, and order-status endpoints.
4. Add admin APIs for inventory, pricing, banners, and coupon management.
5. Add analytics, SEO metadata per category/product, and image CDN optimization.
6. Add automated tests for service functions, cart flows, and checkout.

## Coupon Code

Use FRESH10 on the cart page for 10% off.
