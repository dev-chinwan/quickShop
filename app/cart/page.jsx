'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, Tag, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { placeOrder } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems, savings } = useCart();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const deliveryFee = 0;
  const discount = couponApplied ? totalPrice * 0.1 : 0;
  const finalTotal = totalPrice - discount;

  const handleRemove = (item) => {
    removeItem(item.id);
    toast(`${item.name} removed`, { icon: '🗑️' });
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'FRESH10') {
      setCouponApplied(true);
      toast.success('Coupon applied! 10% off', { icon: '🎉' });
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);

    try {
      const order = await placeOrder({
        items,
        subtotal: totalPrice,
        total: finalTotal,
        couponCode: couponApplied ? 'FRESH10' : null,
      });

      setOrderDetails(order);
      clearCart();
    } catch (error) {
      toast.error(error.message || 'Unable to place the order right now');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (orderDetails) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-3">Order Placed! 🎉</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">Your groceries are on their way.</p>
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Zap className="w-4 h-4 fill-current" />
          Estimated delivery: {orderDetails.estimatedDelivery}
        </div>
        <p className="text-sm text-gray-400 mb-8">Order ID: {orderDetails.orderId}</p>
        <Link
          href="/"
          className="block w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-7xl mb-5">🛒</div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-3">Your cart is empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added anything yet. Let's fix that!</p>
        <Link
          href="/category"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Your Cart</h1>
          <p className="text-sm text-gray-400">{totalItems} items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Delivery banner */}
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-2xl px-5 py-4">
            <Zap className="w-5 h-5 text-green-500 fill-green-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-700 dark:text-green-400">Express delivery in 10 minutes!</p>
              <p className="text-xs text-green-600/70 dark:text-green-500/70">Free delivery on all orders</p>
            </div>
          </div>

          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <Link href={`/products/${item.id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400 mb-3">{item.unit}</p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-green-600 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-2 rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                )}
                {item.discount > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">-{item.discount}% off</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-500" />
              Apply Coupon
            </h3>
            {couponApplied ? (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">FRESH10 applied!</span>
                <button onClick={() => { setCouponApplied(false); setCoupon(''); }} className="ml-auto text-xs text-gray-400 hover:text-red-500">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter code (try FRESH10)"
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/30"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 font-ui">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Product Savings</span>
                  <span>-{formatPrice(savings)}</span>
                </div>
              )}
              {couponApplied && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Coupon (FRESH10)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Delivery Fee</span>
                <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="mt-5 w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 disabled:opacity-70 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-500/25"
            >
              {checkoutLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  Place Order · {formatPrice(finalTotal)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
