# QuickShop MongoDB Schema

Use database: `quickshop`.

## Collections

### `products`

Fields:

- `id` (string or number, unique)
- `name` (string)
- `slug` (string, unique recommended)
- `sku` (string, unique)
- `category` (string)
- `price` (number)
- `originalPrice` (number)
- `discount` (number)
- `unit` (string)
- `rating` (number)
- `reviews` (number)
- `inStock` (boolean)
- `stock` (number)
- `badge` (string or null)
- `description` (string)
- `image` (string)
- `tags` (string[])
- `brand` (string)
- `currency` (string)
- `isFeatured` (boolean)
- `createdAt` (ISO string)
- `updatedAt` (ISO string)

Recommended indexes:

```js
db.products.createIndex({ id: 1 }, { unique: true });
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ rating: -1 });
db.products.createIndex({ name: 'text', tags: 'text', category: 'text' });
```

### `categories`

Fields:

- `id` (string, unique)
- `name` (string)
- `slug` (string)
- `emoji` (string)
- `color` (string)
- `count` (number)
- `image` (string)
- `description` (string)
- `isActive` (boolean)
- `sortOrder` (number)

Recommended indexes:

```js
db.categories.createIndex({ id: 1 }, { unique: true });
db.categories.createIndex({ sortOrder: 1 });
```

### `banners`

Fields:

- `id` (string, unique)
- `title` (string)
- `subtitle` (string)
- `cta` (string)
- `gradient` (string)
- `emoji` (string)
- `category` (string)
- `imageUrl` (string)
- `isActive` (boolean)
- `startAt` (ISO string)
- `endAt` (ISO string)
- `priority` (number)

Recommended indexes:

```js
db.banners.createIndex({ id: 1 }, { unique: true });
db.banners.createIndex({ isActive: 1, priority: 1 });
```

### `orders`

Fields:

- `orderId` (string, unique)
- `items` (array of `{ id, name, price, quantity, unit, image, sku }`)
- `subtotal` (number)
- `tax` (number)
- `shippingFee` (number)
- `discount` (number)
- `total` (number)
- `currency` (string)
- `couponCode` (string | null)
- `customer` (object)
- `shippingAddress` (object)
- `paymentMethod` (string)
- `paymentStatus` (string)
- `status` (string)
- `estimatedDelivery` (string)
- `notes` (string)
- `createdAt` (ISO string)
- `updatedAt` (ISO string)

Recommended indexes:

```js
db.orders.createIndex({ orderId: 1 }, { unique: true });
db.orders.createIndex({ createdAt: -1 });
db.orders.createIndex({ 'customer.userId': 1 });
```
