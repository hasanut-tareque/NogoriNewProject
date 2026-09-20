import { useEffect, useState } from 'react';
import { User, Package, MapPin, LogOut, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/hooks/useRouter';
import { Order, Profile } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export default function Account() {
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'profile'>('orders');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '', city: '', postal_code: '',
  });

  useEffect(() => {
    if (!user) { navigate('#/auth'); return; }

    const load = async () => {
      setLoading(true);
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (p) {
        const prof = p as Profile;
        setProfile(prof);
        setForm({
          full_name: prof.full_name ?? '',
          phone: prof.phone ?? '',
          address_line1: prof.address_line1 ?? '',
          address_line2: prof.address_line2 ?? '',
          city: prof.city ?? '',
          postal_code: prof.postal_code ?? '',
        });
      }
      setOrders((o as Order[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    if (profile) {
      await supabase.from('profiles').update(form).eq('user_id', user.id);
    } else {
      await supabase.from('profiles').insert({ user_id: user.id, ...form });
    }
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSignOut = async () => { await signOut(); navigate('#/'); };

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 bg-cream-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-1">My Account</p>
            <h1 className="font-display text-3xl font-semibold text-stone-900">
              {profile?.full_name ?? user?.email?.split('@')[0]}
            </h1>
            <p className="text-stone-500 text-sm mt-1">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-stone-500 hover:text-red-500 transition-colors">
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cream-300 mb-8">
          {([
            { key: 'orders', label: 'My Orders', icon: Package },
            { key: 'profile', label: 'Profile', icon: User },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <Package size={48} className="text-cream-400 mx-auto mb-4" />
                <p className="font-display text-2xl text-stone-400 mb-2">No Orders Yet</p>
                <p className="text-stone-500 text-sm mb-6">Start shopping to see your orders here</p>
                <button onClick={() => navigate('#/products')} className="btn-primary">Browse Collections</button>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-stone-400 mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-stone-400" />
                      <span className="text-xs text-stone-500">{new Date(order.created_at).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2.5 py-1 border capitalize ${STATUS_STYLES[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                    <p className="font-semibold text-stone-900 mt-2">৳{order.total.toLocaleString()}</p>
                  </div>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-2 border-t border-cream-200 pt-3">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-cream-200 overflow-hidden shrink-0">
                          {item.product_image && (
                            <img src={`${item.product_image}?auto=compress&cs=tinysrgb&w=100`} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-700 font-medium truncate">{item.product_name}</p>
                          <p className="text-xs text-stone-400">
                            {item.size && `Size: ${item.size} · `}Qty: {item.quantity} · ৳{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cream-200">
                  <MapPin size={13} className="text-stone-400 shrink-0" />
                  <p className="text-xs text-stone-500 truncate">
                    {[order.address_line1, order.city].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 max-w-xl">
            <h2 className="font-semibold text-stone-900 mb-5 flex items-center gap-2">
              <User size={18} className="text-gold-400" /> Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">Full Name</label>
                <input className="input-field" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">Phone</label>
                <input className="input-field" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+880 XXXX XXXXXX" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">Address</label>
                <input className="input-field mb-2" value={form.address_line1} onChange={e => update('address_line1', e.target.value)} placeholder="House, road number" />
                <input className="input-field" value={form.address_line2} onChange={e => update('address_line2', e.target.value)} placeholder="Area, landmark (optional)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">City</label>
                  <input className="input-field" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Dhaka" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">Postal Code</label>
                  <input className="input-field" value={form.postal_code} onChange={e => update('postal_code', e.target.value)} placeholder="1212" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                {saveSuccess && <span className="ml-1">✓</span>}
              </button>
              {saveSuccess && <span className="text-green-600 text-sm font-medium">Saved!</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
