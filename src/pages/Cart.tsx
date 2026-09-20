import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/hooks/useRouter';
import LoadingSpinner from '@/components/LoadingSpinner';

const SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 120;

export default function Cart() {
  const { items, itemCount, total, loading, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();

  const shippingFee = total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = total + shippingFee;

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={64} className="text-cream-400" />
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-stone-900 mb-2">Your Cart is Private</h2>
          <p className="text-stone-500 mb-8">Sign in to view your cart and save your wishlist</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('#/auth')} className="btn-primary">Sign In</button>
          <button onClick={() => navigate('#/products')} className="btn-outline">Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 bg-cream-200 rounded-full flex items-center justify-center">
          <ShoppingBag size={40} className="text-cream-400" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-stone-900 mb-2">Your Cart is Empty</h2>
          <p className="text-stone-500 mb-8">Discover our latest collections and find something you love</p>
        </div>
        <button onClick={() => navigate('#/products')} className="btn-primary">
          Start Shopping <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-stone-900">Shopping Cart</h1>
            <p className="text-stone-500 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('#/products')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">
            <ArrowLeft size={14} /> Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const price = item.product?.sale_price ?? item.product?.price ?? 0;
              const itemTotal = price * item.quantity;
              return (
                <div key={item.id} className="bg-white p-4 flex gap-4 animate-fade-in">
                  <div
                    className="w-24 h-32 shrink-0 overflow-hidden bg-cream-200 cursor-pointer"
                    onClick={() => navigate(`#/product/${item.product_id}`)}
                  >
                    {item.product?.image_url ? (
                      <img
                        src={`${item.product.image_url}?auto=compress&cs=tinysrgb&w=200`}
                        alt={item.product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={24} className="text-cream-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <h3
                          className="font-medium text-stone-900 text-sm leading-snug cursor-pointer hover:text-gold-600 transition-colors"
                          onClick={() => navigate(`#/product/${item.product_id}`)}
                        >
                          {item.product?.name}
                        </h3>
                        <p className="text-xs text-stone-400 mt-0.5 capitalize">{item.product?.category}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-300 hover:text-red-500 transition-colors p-1 shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex gap-3 mt-2">
                      {item.size && (
                        <span className="text-xs border border-cream-400 text-stone-500 px-2 py-0.5">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="text-xs border border-cream-400 text-stone-500 px-2 py-0.5">{item.color}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-cream-300">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-stone-900">৳{itemTotal.toLocaleString()}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-stone-400">৳{price.toLocaleString()} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sticky top-24">
              <h2 className="font-semibold text-stone-900 text-lg mb-6 pb-4 border-b border-cream-300">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>৳{shippingFee}</span>
                  )}
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-stone-400">
                    Add ৳{(SHIPPING_THRESHOLD - total).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-cream-300 pt-4 mb-6">
                <div className="flex justify-between font-semibold text-stone-900">
                  <span>Total</span>
                  <span className="text-lg">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('#/checkout')}
                className="btn-primary w-full text-center justify-center py-4"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-stone-400">Cash on Delivery available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
