import { z } from 'zod';

const isoDateSchema = z.string().datetime().optional();

export const productCreateSchema = z.object({
  id: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(160),
  sku: z.string().min(2).max(64),
  category: z.string().min(2).max(64),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  unit: z.string().min(1).max(40),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().int().nonnegative().default(0),
  inStock: z.boolean().default(true),
  stock: z.number().int().nonnegative().default(0),
  badge: z.string().max(40).nullable().optional(),
  description: z.string().min(8).max(1000),
  image: z.string().url(),
  tags: z.array(z.string().min(1).max(40)).default([]),
  brand: z.string().min(2).max(80).default('QuickShop'),
  currency: z.string().length(3).default('USD'),
  isFeatured: z.boolean().default(false),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
  id: z.string().min(2).max(64),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80),
  emoji: z.string().min(1).max(6),
  color: z.string().min(3).max(80),
  count: z.number().int().nonnegative().default(0),
  image: z.string().url().optional(),
  description: z.string().max(300).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const bannerCreateSchema = z.object({
  id: z.string().min(2).max(80),
  title: z.string().min(2).max(120),
  subtitle: z.string().min(2).max(180),
  cta: z.string().min(2).max(40),
  gradient: z.string().min(3).max(80),
  emoji: z.string().min(1).max(6),
  category: z.string().min(2).max(64),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  priority: z.number().int().nonnegative().default(0),
});

const orderItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  unit: z.string().optional(),
  image: z.string().url().optional(),
  sku: z.string().optional(),
});

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(3),
  country: z.string().min(2).default('IN'),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative().default(0),
  shippingFee: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  couponCode: z.string().max(40).nullable().optional(),
  customer: z
    .object({
      userId: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  shippingAddress: addressSchema.optional(),
  paymentMethod: z.enum(['cod', 'card', 'upi', 'wallet']).default('cod'),
  notes: z.string().max(300).optional(),
});

export function parseWithSchema(schema, payload) {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten(),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}
