import { useState, useEffect } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/hooks/useRouter';
import { Profile } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

const SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 120;

export default function Checkout() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const shippingFee = total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = total + shippingFee;

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    notes: '',
  });

  useEffect(() => {
    if (!user) { navigate('#/auth'); return; }
    if (items.length === 0) { navigate('#/cart'); return; }

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        const p = data as Profile;
        setProfile(p);
        setForm({
          full_name: p.full_name ?? '',
          phone: p.phone ?? '',
          address_line1: p.address_line1 ?? '',
          address_line2: p.address_line2 ?? '',
          city: p.city ?? '',
          postal_code: p.postal_code ?? '',
          notes: '',
        });
      }
    };
    loadProfile();
  }, [user, items.length]);

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;

    if (!form.full_name || !form.phone || !form.address_line1 || !form.city) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          subtotal: total,
          shipping_fee: shippingFee,
          total: grandTotal,
          full_name: form.full_name,
          phone: form.phone,
          address_line1: form.address_line1,
          address_line2: form.address_line2 || null,
          city: form.city,
          postal_code: form.postal_code || null,
          notes: form.notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError || !order) throw new Error(orderError?.message ?? 'Failed to create order');

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name ?? 'Unknown Product',
        product_image: item.product?.image_url ?? null,
        price: item.product?.sale_price ?? item.product?.price ?? 0,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw new Error(itemsError.message);

      // Update profile with address
      const existingProfile = profile;
      if (existingProfile) {
        await supabase.from('profiles').update({
          full_name: form.full_name,
          phone: form.phone,
          address_line1: form.address_line1,
          address_line2: form.address_line2 || null,
          city: form.city,
          postal_code: form.postal_code || null,
        }).eq('user_id', user.id);
      }

      await clearCart();
      navigate(`#/order-success?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-cream-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate('#/cart')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Cart
        </button>

        <h1 className="font-display text-3xl font-semibold text-stone-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Details */}
              <div className="bg-white p-6">
                <h2 className="font-semibold text-stone-900 mb-5 flex items-center gap-2">
                  <Package size={18} className="text-gold-400" />
                  Shipping Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input className="input-field" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input className="input-field" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+880 XXXX XXXXXX" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input className="input-field" value={form.address_line1} onChange={e => update('address_line1', e.target.value)} placeholder="House/flat, road number" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">
                      Address Line 2
                    </label>
                    <input className="input-field" value={form.address_line2} onChange={e => update('address_line2', e.target.value)} placeholder="Area, landmark (optional)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input className="input-field" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Dhaka" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">
                      Postal Code
                    </label>
                    <input className="input-field" value={form.postal_code} onChange={e => update('postal_code', e.target.value)} placeholder="1212" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">
                      Order Notes
                    </label>
                    <textarea
                      className="input-field resize-none"
                      rows={3}
                      value={form.notes}
                      onChange={e => update('notes', e.target.value)}
                      placeholder="Special instructions for your order (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white p-6">
                <h2 className="font-semibold text-stone-900 mb-4">Payment Method</h2>
                <div className="flex items-center gap-3 p-4 border-2 border-stone-900 bg-cream-50">
                  <div className="w-4 h-4 rounded-full border-4 border-stone-900" />
                  <div>
                    <p className="font-medium text-sm text-stone-900">Cash on Delivery</p>
                    <p className="text-xs text-stone-500">Pay when your order arrives</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 sticky top-24">
                <h2 className="font-semibold text-stone-900 text-lg mb-5 pb-4 border-b border-cream-300">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {items.map(item => {
                    const price = item.product?.sale_price ?? item.product?.price ?? 0;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-16 shrink-0 overflow-hidden bg-cream-200">
                          {item.product?.image_url && (
                            <img src={`${item.product.image_url}?auto=compress&cs=tinysrgb&w=100`} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-700 line-clamp-2">{item.product?.name}</p>
                          {item.size && <p className="text-[10px] text-stone-400">Size: {item.size}</p>}
                          <p className="text-xs text-stone-500 mt-0.5">৳{price.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <p className="text-xs font-semibold text-stone-900 shrink-0">৳{(price * item.quantity).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-cream-300 pt-4 space-y-2 mb-5">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal</span><span>৳{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Shipping</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>{shippingFee === 0 ? 'Free' : `৳${shippingFee}`}</span>
                  </div>
                </div>

                <div className="border-t border-cream-300 pt-4 mb-6">
                  <div className="flex justify-between font-semibold text-stone-900">
                    <span>Total</span>
                    <span className="text-lg">৳{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center py-4"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
