'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Plus, Minus, ShoppingCart, Heart, ChevronLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchProduct, fetchRelatedProducts } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const cartQty = product ? getItemQuantity(product.id) : 0;

  useEffect(() => {
    setLoading(true);
    fetchProduct(id)
      .then(({ data }) => {
        setProduct(data);
        return fetchRelatedProducts(data.id);
      })
      .then(({ data }) => setRelated(data))
      .catch(() => router.push('/category'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
    setQty(1);
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return null;

  const savings = product.originalPrice - product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-500 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/category?category=${product.category}`} className="hover:text-green-500 transition-colors capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-200 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 sticky top-24">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.discount > 0 && (
              <div className="absolute top-5 left-5 bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                -{product.discount}% OFF
              </div>
            )}
            <button
              onClick={() => setWishlisted(w => !w)}
              className={`absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                wishlisted ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-400 hover:text-red-400'
              } shadow-lg`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Details */}
        <div>
          {/* Badge */}
          {product.badge && (
            <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
              {product.badge}
            </span>
          )}

          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through mb-0.5">{formatPrice(product.originalPrice)}</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 mb-0.5">
                  You save {formatPrice(savings)}
                </span>
              </>
            )}
          </div>

          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 text-sm">{product.description}</p>

          {/* Tags */}
          {product.tags && (
            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags.map(tag => (
                <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-3 py-1.5 rounded-full capitalize">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Quantity & Cart */}
          {product.inStock ? (
            <div className="space-y-4">
              {cartQty === 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-green-600 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-bold w-6 text-center text-gray-900 dark:text-white">{qty}</span>
                      <button
                        onClick={() => setQty(q => q + 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-500/25"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-2xl p-2">
                    <button
                      onClick={() => updateQuantity(product.id, cartQty - 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 shadow-sm text-green-600 hover:bg-green-500 hover:text-white transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-bold w-6 text-center text-green-700 dark:text-green-400">{cartQty}</span>
                    <button
                      onClick={() => updateQuantity(product.id, cartQty + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    ✓ In your cart
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold text-center rounded-2xl">
              Out of Stock
            </div>
          )}

          {/* Perks */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            {[
              { icon: Truck, title: '10-min delivery', sub: 'To your door' },
              { icon: Shield, title: 'Quality assured', sub: '100% fresh' },
              { icon: RotateCcw, title: 'Easy returns', sub: 'No questions asked' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="text-center">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{title}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square skeleton rounded-3xl" />
        <div className="space-y-4">
          <div className="h-6 w-24 skeleton rounded-full" />
          <div className="h-10 w-3/4 skeleton rounded-xl" />
          <div className="h-5 w-32 skeleton rounded-full" />
          <div className="h-12 w-40 skeleton rounded-xl" />
          <div className="h-20 w-full skeleton rounded-xl" />
          <div className="h-14 w-full skeleton rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
