import { useEffect, useState } from 'react';
import { ArrowRight, Truck, RotateCcw, Shield, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from '@/hooks/useRouter';

const HERO_IMAGE = 'https://images.pexels.com/photos/8311880/pexels-photo-8311880.jpeg?auto=compress&cs=tinysrgb&w=1920';

const categories = [
  {
    label: "Men's",
    description: 'Modern urban looks',
    href: '#/products?category=men',
    image: 'https://images.pexels.com/photos/31618286/pexels-photo-31618286.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    label: "Women's",
    description: 'Effortless elegance',
    href: '#/products?category=women',
    image: 'https://images.pexels.com/photos/5549380/pexels-photo-5549380.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    label: "Kids'",
    description: 'Playful & stylish',
    href: '#/products?category=kids',
    image: 'https://images.pexels.com/photos/38778561/pexels-photo-38778561.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const features = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ৳2,000' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
  { icon: Shield, title: 'Secure Payment', desc: 'Safe & trusted checkout' },
  { icon: Star, title: 'Premium Quality', desc: 'Curated premium fabrics' },
];

export default function Home() {
  const { navigate } = useRouter();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: featData }, { data: newData }] = await Promise.all([
        supabase.from('products').select('*').eq('featured', true).limit(8),
        supabase.from('products').select('*').eq('is_new', true).limit(4),
      ]);
      setFeatured((featData as Product[]) ?? []);
      setNewArrivals((newData as Product[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl animate-slide-up">
            <p className="text-gold-300 text-sm font-semibold uppercase tracking-[0.3em] mb-4">New Season 2026</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Define Your
              <em className="block text-gold-300 not-italic">Urban Style</em>
            </h1>
            <p className="text-stone-300 text-lg leading-relaxed mb-8 max-w-lg">
              Discover premium fashion for Men, Women & Kids. From boardroom to boulevard — Nogori dresses every moment beautifully.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('#/products')} className="btn-gold">
                Shop Now <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('#/products?filter=new')} className="btn-outline border-white text-white hover:bg-white hover:text-stone-900">
                New Arrivals
              </button>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-white/30 relative overflow-hidden">
            <div className="absolute top-0 w-full bg-gold-300 animate-bounce" style={{ height: '40%' }} />
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-stone-900 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 py-2">
                <Icon size={20} className="text-gold-400 shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold uppercase tracking-wide">{title}</p>
                  <p className="text-stone-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Shop By</p>
          <h2 className="section-title">Explore Collections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(cat => (
            <a key={cat.label} href={cat.href} className="group relative overflow-hidden aspect-[3/4] md:aspect-[2/3] block">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <p className="text-stone-300 text-xs uppercase tracking-widest mb-1">{cat.description}</p>
                <h3 className="font-display text-3xl font-semibold mb-4">{cat.label}</h3>
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest border-b border-gold-300 text-gold-300 pb-0.5 group-hover:gap-3 transition-all">
                  Shop Now <ArrowRight size={12} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <p className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Handpicked For You</p>
              <h2 className="section-title">Featured Styles</h2>
            </div>
            <button onClick={() => navigate('#/products')} className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors whitespace-nowrap">
              View All <ArrowRight size={16} />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-center text-stone-400 py-16">Products coming soon...</p>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-24 bg-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/8386651/pexels-photo-8386651.jpeg')] bg-cover bg-center" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <p className="text-gold-400 text-xs font-semibold uppercase tracking-[0.3em] mb-4">Limited Time Offer</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Get <span className="text-gold-300">20% Off</span> Your First Order
          </h2>
          <p className="text-stone-400 mb-10 text-lg">
            Join the Nogori family and enjoy exclusive discounts, early access to new collections, and more.
          </p>
          <button onClick={() => navigate('#/auth')} className="btn-gold text-base px-10 py-4">
            Create Account <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <p className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Fresh In</p>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <button onClick={() => navigate('#/products?filter=new')} className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors whitespace-nowrap">
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-20 bg-cream-200">
        <div className="max-w-2xl mx-auto text-center px-4">
          <p className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Stay In The Loop</p>
          <h2 className="section-title mb-4">Subscribe & Save</h2>
          <p className="text-stone-500 mb-8">Get the latest trends, exclusive offers, and style tips delivered to your inbox.</p>
          <form onSubmit={e => e.preventDefault()} className="flex gap-0 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary whitespace-nowrap px-5">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
