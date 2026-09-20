import { useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from '@/hooks/useRouter';

const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'men', label: "Men's" },
  { value: 'women', label: "Women's" },
  { value: 'kids', label: "Kids'" },
];

const SIZE_OPTIONS: Record<Category, string[]> = {
  men: ['S', 'M', 'L', 'XL', 'XXL'],
  women: ['XS', 'S', 'M', 'L', 'XL'],
  kids: ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y'],
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'featured', label: 'Featured' },
];

export default function Products() {
  const { route } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sort, setSort] = useState('newest');
  const [priceOpen, setPriceOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);

  useEffect(() => {
    const cat = route.query.category as Category | undefined;
    setSelectedCategory(cat || 'all');
    setSelectedSizes([]);
  }, [route.query.category]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let q = supabase.from('products').select('*');

      const filterCat = route.query.category as Category | undefined;
      if (filterCat) q = q.eq('category', filterCat);

      if (route.query.filter === 'new') q = q.eq('is_new', true);
      if (route.query.filter === 'sale') q = q.not('sale_price', 'is', null);
      if (route.query.filter === 'featured') q = q.eq('featured', true);

      const { data } = await q;
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    };
    load();
  }, [route.query.category, route.query.filter]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (selectedSizes.length > 0) {
      result = result.filter(p => selectedSizes.some(s => p.sizes.includes(s)));
    }
    result = result.filter(p => {
      const price = p.sale_price ?? p.price;
      return price <= maxPrice;
    });

    switch (sort) {
      case 'price_asc': result.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price)); break;
      case 'price_desc': result.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price)); break;
      case 'featured': result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [products, selectedCategory, selectedSizes, maxPrice, sort]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2Y', '4Y', '6Y', '8Y', '10Y', '12Y'];

  const pageTitle = selectedCategory === 'all' ? 'All Collections' :
    selectedCategory === 'men' ? "Men's Collection" :
    selectedCategory === 'women' ? "Women's Collection" : "Kids' Collection";

  const hasActiveFilters = selectedCategory !== 'all' || selectedSizes.length > 0 || maxPrice < 10000;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-xs uppercase tracking-[0.3em] mb-2">Nogori</p>
          <h1 className="font-display text-4xl font-semibold">{pageTitle}</h1>
          <p className="text-stone-400 mt-2">{loading ? '...' : `${filtered.length} items`}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex gap-1 mb-6 border-b border-cream-300">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value);
                setSelectedSizes([]);
              }}
              className={`px-5 py-3 text-sm font-medium uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                selectedCategory === cat.value
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors ${
              filterOpen ? 'bg-stone-900 text-white border-stone-900' : 'border-cream-400 text-stone-700 hover:border-stone-900'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-stone-500 hidden sm:block">Sort:</label>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border border-cream-400 text-sm px-3 py-2 text-stone-700 bg-white focus:outline-none focus:border-stone-900 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          {filterOpen && (
            <aside className="w-56 shrink-0 animate-slide-up">
              <div className="sticky top-24 space-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setSelectedCategory('all'); setSelectedSizes([]); setMaxPrice(10000); }}
                      className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1"
                    >
                      <X size={12} /> Clear
                    </button>
                  )}
                </div>

                {/* Price */}
                <div className="border-b border-cream-300 pb-4">
                  <button onClick={() => setPriceOpen(v => !v)} className="flex items-center justify-between w-full py-2 text-sm font-medium text-stone-700">
                    Price Range
                    {priceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {priceOpen && (
                    <div className="mt-2">
                      <input
                        type="range"
                        min={500}
                        max={10000}
                        step={100}
                        value={maxPrice}
                        onChange={e => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                      <div className="flex justify-between text-xs text-stone-500 mt-1">
                        <span>৳500</span>
                        <span className="font-medium text-stone-700">৳{maxPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Size */}
                <div className="border-b border-cream-300 pb-4">
                  <button onClick={() => setSizeOpen(v => !v)} className="flex items-center justify-between w-full py-2 text-sm font-medium text-stone-700">
                    Size
                    {sizeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {sizeOpen && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(selectedCategory !== 'all' ? (SIZE_OPTIONS[selectedCategory as Category] || allSizes) : allSizes).map(size => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`text-xs px-2.5 py-1.5 border transition-colors ${
                            selectedSizes.includes(size)
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-cream-400 text-stone-600 hover:border-stone-900'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
            ) : filtered.length > 0 ? (
              <div className={`grid gap-4 md:gap-6 ${filterOpen ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="font-display text-2xl text-stone-400 mb-3">No products found</p>
                <p className="text-stone-500 text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
