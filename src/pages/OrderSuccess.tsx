import { useEffect, useState } from 'react';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/hooks/useRouter';
import { Order } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrderSuccess() {
  const { route, navigate } = useRouter();
  const orderId = route.query.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .maybeSingle();
      setOrder(data as Order);
      setLoading(false);
    };
    load();
  }, [orderId]);

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 bg-cream-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-white p-10 text-center mb-6 animate-slide-up">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-stone-900 mb-3">Order Placed!</h1>
          <p className="text-stone-500 leading-relaxed mb-2">
            Thank you for shopping with Nogori. Your order has been confirmed and will be processed shortly.
          </p>
          {order && (
            <p className="text-xs text-stone-400 font-medium uppercase tracking-widest mt-3">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white p-6 mb-6 animate-slide-up">
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Package size={16} className="text-gold-400" /> Order Details
            </h2>

            {order.order_items && order.order_items.length > 0 && (
              <div className="space-y-3 mb-4 pb-4 border-b border-cream-300">
                {order.order_items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-16 bg-cream-200 overflow-hidden shrink-0">
                      {item.product_image && (
                        <img src={`${item.product_image}?auto=compress&cs=tinysrgb&w=100`} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800">{item.product_name}</p>
                      {item.size && <p className="text-xs text-stone-400">Size: {item.size}</p>}
                      <p className="text-xs text-stone-500">Qty: {item.quantity} · ৳{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span><span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>{order.shipping_fee === 0 ? 'Free' : `৳${order.shipping_fee}`}</span>
              </div>
            </div>
            <div className="flex justify-between font-semibold text-stone-900 border-t border-cream-300 pt-3">
              <span>Total</span>
              <span className="text-lg">৳{order.total.toLocaleString()}</span>
            </div>

            {order.address_line1 && (
              <div className="mt-4 pt-4 border-t border-cream-300 text-sm text-stone-600">
                <p className="font-medium text-stone-700 mb-1">Delivering to:</p>
                <p>{order.full_name}</p>
                <p>{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}</p>
                <p>{order.city}{order.postal_code ? ` - ${order.postal_code}` : ''}</p>
                <p>{order.phone}</p>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gold-50 border border-gold-200 p-4 mb-6 text-sm text-stone-600">
          <p className="font-semibold text-stone-700 mb-1">What happens next?</p>
          <ul className="space-y-1 text-xs">
            <li>• Our team will confirm your order within 2-4 hours</li>
            <li>• Delivery within 2-5 business days in Dhaka</li>
            <li>• Outside Dhaka may take 5-7 business days</li>
            <li>• Cash on delivery — pay when you receive</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate('#/')} className="flex-1 btn-outline flex items-center justify-center gap-2">
            <Home size={15} /> Home
          </button>
          <button onClick={() => navigate('#/account')} className="flex-1 btn-primary flex items-center justify-center gap-2">
            My Orders <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
