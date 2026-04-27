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
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_BASE_URL=
```

When your backend is ready:

```bash
NEXT_PUBLIC_API_MODE=backend
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

## Backend Integration

The frontend is already prepared to swap from mock data to a real API through lib/api.js.

Expected backend endpoints:

```text
GET    /products
GET    /products/featured
GET    /products/:id
GET    /products/:id/related
GET    /products/search?q=term
GET    /catalog/categories
GET    /catalog/banners
POST   /orders
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
  const res = await fetch(`/products?${new URLSearchParams(filters)}`);
  return res.json();
}
```

## Build Roadmap

1. Finalize the backend contract first: products, categories, search, cart, checkout, and auth.
2. Add authentication and user profiles next, because cart/order history usually depends on user identity.
3. Replace mock checkout with payment, address, and order-status endpoints.
4. Add admin APIs for inventory, pricing, banners, and coupon management.
5. Add analytics, SEO metadata per category/product, and image CDN optimization.
6. Add automated tests for service functions, cart flows, and checkout.

## Coupon Code

Use FRESH10 on the cart page for 10% off.
