import { MongoClient } from 'mongodb';
import seedData from '@/data/seed.json';

const DATA_PROVIDER = (process.env.DATA_PROVIDER || 'json').toLowerCase();
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'quickshop';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value) {
  return value === true || value === 'true';
}

function getNowIso() {
  return new Date().toISOString();
}

function withDiscount(product) {
  const originalPrice = product.originalPrice ?? product.price;
  const discountRaw = originalPrice > product.price ? ((originalPrice - product.price) / originalPrice) * 100 : 0;
  return {
    ...product,
    originalPrice,
    discount: Math.round(discountRaw),
  };
}

function applyProductFilters(products, filters = {}) {
  let result = [...products];
  const minPrice = parseNumber(filters.minPrice);
  const maxPrice = parseNumber(filters.maxPrice);
  const page = Math.max(parseNumber(filters.page) || 1, 1);
  const limit = Math.min(Math.max(parseNumber(filters.limit) || 20, 1), 1000);
  const search = filters.search?.trim().toLowerCase();
  const categoryFilter = filters.category || filters.categoryId;
  const statusFilter = filters.status;
  const featuredFilter = filters.featured;

  if (categoryFilter) {
    result = result.filter((product) => product.category === categoryFilter);
  }

  if (minPrice !== undefined) {
    result = result.filter((product) => product.price >= minPrice);
  }

  if (maxPrice !== undefined) {
    result = result.filter((product) => product.price <= maxPrice);
  }

  if (toBoolean(filters.inStock)) {
    result = result.filter((product) => product.inStock);
  }

  if (featuredFilter !== undefined && featuredFilter !== null && featuredFilter !== '') {
    const featured = toBoolean(featuredFilter);
    result = result.filter((product) => Boolean(product.isFeatured) === featured);
  }

  if (statusFilter) {
    result = result.filter((product) => (product.status || 'active') === statusFilter);
  }

  if (search) {
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(search))
    );
  }

  if (filters.sort === 'price-asc') {
    result.sort((left, right) => left.price - right.price);
  }
  if (filters.sort === 'price-desc') {
    result.sort((left, right) => right.price - left.price);
  }
  if (filters.sort === 'rating') {
    result.sort((left, right) => right.rating - left.rating);
  }

  const total = result.length;
  const start = (page - 1) * limit;
  const data = result.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

function createJsonStore() {
  if (!globalThis.__quickshopMemoryStore) {
    globalThis.__quickshopMemoryStore = {
      products: clone(seedData.products || []),
      categories: clone(seedData.categories || []),
      banners: clone(seedData.banners || []),
      orders: clone(seedData.orders || []),
    };
  }

  const state = globalThis.__quickshopMemoryStore;

  function nextProductId() {
    const maxId = state.products.reduce((max, product) => {
      const current = Number(product.id);
      return Number.isFinite(current) ? Math.max(max, current) : max;
    }, 0);
    return maxId + 1;
  }

  return {
    async getProducts(filters) {
      return applyProductFilters(state.products.map(withDiscount), filters);
    },

    async getFeaturedProducts() {
      const data = state.products.filter((product) => product.isFeatured || product.rating >= 4.6).slice(0, 8);
      return { data: data.map(withDiscount) };
    },

    async getProductById(id) {
      const data = state.products.find((product) => String(product.id) === String(id));
      return data ? withDiscount(data) : null;
    },

    async createProduct(payload) {
      const now = getNowIso();
      const next = withDiscount({
        ...payload,
        id: payload.id ?? nextProductId(),
        createdAt: payload.createdAt || now,
        updatedAt: payload.updatedAt || now,
      });
      state.products.push(next);
      return next;
    },

    async updateProduct(id, payload) {
      const index = state.products.findIndex((product) => String(product.id) === String(id));
      if (index < 0) return null;

      const current = state.products[index];
      const updated = withDiscount({
        ...current,
        ...payload,
        id: current.id,
        updatedAt: getNowIso(),
      });

      state.products[index] = updated;
      return updated;
    },

    async deleteProduct(id) {
      const index = state.products.findIndex((product) => String(product.id) === String(id));
      if (index < 0) return false;
      state.products.splice(index, 1);
      return true;
    },

    async searchProducts(query) {
      const search = String(query || '').trim().toLowerCase();
      if (!search) return { data: [] };

      const data = state.products.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(search))
      );

      return { data: data.map(withDiscount) };
    },

    async getRelatedProducts(id) {
      const current = state.products.find((product) => String(product.id) === String(id));
      if (!current) return { data: [] };

      const data = state.products
        .filter((product) => product.category === current.category && String(product.id) !== String(current.id))
        .slice(0, 4)
        .map(withDiscount);

      return { data };
    },

    async getCategories() {
      return { data: clone(state.categories) };
    },

    async createCategory(payload) {
      const next = { ...payload };
      state.categories.push(next);
      return next;
    },

    async getBanners() {
      const data = state.banners
        .filter((banner) => banner.isActive)
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));
      return { data: clone(data) };
    },

    async createBanner(payload) {
      const next = { ...payload };
      state.banners.push(next);
      return next;
    },

    async createOrder(payload) {
      const now = getNowIso();
      const orderId = `QS-${Date.now()}`;
      const next = {
        ...payload,
        orderId,
        status: 'placed',
        paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
        estimatedDelivery: '10-15 minutes',
        createdAt: now,
        updatedAt: now,
      };
      state.orders.push(next);
      return next;
    },

    async getOrders() {
      return { data: clone(state.orders) };
    },

    async getOrderById(orderId) {
      return state.orders.find((order) => order.orderId === orderId) || null;
    },
  };
}

let mongoClientPromise;

async function getMongoDb() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required when DATA_PROVIDER=mongodb');
  }

  if (!mongoClientPromise) {
    mongoClientPromise = MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
    });
  }

  const client = await mongoClientPromise;
  return client.db(MONGODB_DB);
}

function sanitizeMongoDoc(document) {
  if (!document) return null;
  const { _id, ...rest } = document;
  return {
    ...rest,
    id: rest.id ?? String(_id),
  };
}

function createMongoStore() {
  return {
    async getProducts(filters) {
      const db = await getMongoDb();
      const products = sanitizeMongoArray(await db.collection('products').find({}).toArray());
      return applyProductFilters(products.map(withDiscount), filters);
    },

    async getFeaturedProducts() {
      const db = await getMongoDb();
      const data = await db
        .collection('products')
        .find({ $or: [{ isFeatured: true }, { rating: { $gte: 4.6 } }] })
        .limit(8)
        .toArray();
      return { data: sanitizeMongoArray(data).map(withDiscount) };
    },

    async getProductById(id) {
      const db = await getMongoDb();
      const data = await db.collection('products').findOne({ id: toMongoComparableId(id) });
      return data ? withDiscount(sanitizeMongoDoc(data)) : null;
    },

    async createProduct(payload) {
      const db = await getMongoDb();
      const now = getNowIso();
      const document = withDiscount({
        ...payload,
        id: payload.id ?? crypto.randomUUID(),
        createdAt: payload.createdAt || now,
        updatedAt: payload.updatedAt || now,
      });
      await db.collection('products').insertOne(document);
      return document;
    },

    async updateProduct(id, payload) {
      const db = await getMongoDb();
      const existing = await db.collection('products').findOne({ id: toMongoComparableId(id) });
      if (!existing) return null;

      const updated = withDiscount({
        ...sanitizeMongoDoc(existing),
        ...payload,
        id: sanitizeMongoDoc(existing).id,
        updatedAt: getNowIso(),
      });

      await db.collection('products').updateOne({ id: toMongoComparableId(id) }, { $set: updated });
      return updated;
    },

    async deleteProduct(id) {
      const db = await getMongoDb();
      const result = await db.collection('products').deleteOne({ id: toMongoComparableId(id) });
      return result.deletedCount > 0;
    },

    async searchProducts(query) {
      const search = String(query || '').trim().toLowerCase();
      if (!search) return { data: [] };

      const db = await getMongoDb();
      const all = sanitizeMongoArray(await db.collection('products').find({}).toArray());
      const data = all.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(search))
      );

      return { data: data.map(withDiscount) };
    },

    async getRelatedProducts(id) {
      const db = await getMongoDb();
      const current = sanitizeMongoDoc(await db.collection('products').findOne({ id: toMongoComparableId(id) }));
      if (!current) return { data: [] };

      const data = sanitizeMongoArray(
        await db
          .collection('products')
          .find({ category: current.category, id: { $ne: current.id } })
          .limit(4)
          .toArray()
      );

      return { data: data.map(withDiscount) };
    },

    async getCategories() {
      const db = await getMongoDb();
      const data = sanitizeMongoArray(await db.collection('categories').find({}).sort({ sortOrder: 1 }).toArray());
      return { data };
    },

    async createCategory(payload) {
      const db = await getMongoDb();
      await db.collection('categories').insertOne(payload);
      return payload;
    },

    async getBanners() {
      const db = await getMongoDb();
      const data = sanitizeMongoArray(
        await db.collection('banners').find({ isActive: true }).sort({ priority: 1 }).toArray()
      );
      return { data };
    },

    async createBanner(payload) {
      const db = await getMongoDb();
      await db.collection('banners').insertOne(payload);
      return payload;
    },

    async createOrder(payload) {
      const db = await getMongoDb();
      const now = getNowIso();
      const order = {
        ...payload,
        orderId: `QS-${Date.now()}`,
        status: 'placed',
        paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
        estimatedDelivery: '10-15 minutes',
        createdAt: now,
        updatedAt: now,
      };
      await db.collection('orders').insertOne(order);
      return order;
    },

    async getOrders() {
      const db = await getMongoDb();
      const data = sanitizeMongoArray(await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray());
      return { data };
    },

    async getOrderById(orderId) {
      const db = await getMongoDb();
      const order = await db.collection('orders').findOne({ orderId });
      return sanitizeMongoDoc(order);
    },
  };
}

function sanitizeMongoArray(documents) {
  return documents.map(sanitizeMongoDoc);
}

function toMongoComparableId(value) {
  const asNumber = Number(value);
  return Number.isFinite(asNumber) && String(asNumber) === String(value) ? asNumber : String(value);
}

export function getStore() {
  if (DATA_PROVIDER === 'mongodb') {
    return createMongoStore();
  }

  return createJsonStore();
}
