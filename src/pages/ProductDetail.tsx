import { useEffect, useState } from 'react';
import { ShoppingBag, ArrowLeft, Minus, Plus, Check, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from '@/hooks/useRouter';

interface Props { productId: string }

export default function ProductDetail({ productId }: Props) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
      setActiveImage(0);
      setAddedToCart(false);

      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (err || !data) { setLoading(false); return; }

      const p = data as Product;
      setProduct(p);
      if (p.colors.length > 0) setSelectedColor(p.colors[0]);

      const { data: rel } = await supabase
        .from('products')
        .select('*')
        .eq('category', p.category)
        .neq('id', p.id)
        .limit(4);
      setRelated((rel as Product[]) ?? []);
      setLoading(false);
    };
    load();
  }, [productId]);

  const allImages = product ? [
    ...(product.image_url ? [product.image_url] : []),
    ...product.images.filter(img => img !== product.image_url),
  ] : [];

  const handleAddToCart = async () => {
    if (!user) { navigate('#/auth'); return; }
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      setError('Please select a size');
      return;
    }
    setError('');
    setAddingToCart(true);
    const result = await addItem(product.id, selectedSize, selectedColor);
    setAddingToCart(false);
    if (result.error) {
      setError('Failed to add to cart. Please try again.');
    } else {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
      <p className="font-display text-2xl text-stone-400">Product not found</p>
      <button onClick={() => navigate('#/products')} className="btn-primary">Browse Products</button>
    </div>
  );

  const effectivePrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0;

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate('#/products')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft size={14} /> Back to Products
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-[3/4] overflow-hidden bg-cream-200">
              {allImages.length > 0 ? (
                <img
                  src={`${allImages[activeImage]}?auto=compress&cs=tinysrgb&w=800`}
                  alt={product.name}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={60} className="text-cream-400" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-20 h-28 overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-stone-900' : 'border-transparent hover:border-cream-400'
                    }`}
                  >
                    <img src={`${img}?auto=compress&cs=tinysrgb&w=200`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-gold-500 text-xs uppercase tracking-[0.3em] font-medium capitalize mb-1">
                  {product.subcategory || product.category}
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-stone-900 leading-tight">
                  {product.name}
                </h1>
              </div>
              <button className="p-2 text-stone-400 hover:text-stone-700 transition-colors mt-1">
                <Share2 size={18} />
              </button>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.is_new && (
                <span className="bg-stone-900 text-white text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1">New</span>
              )}
              {hasDiscount && (
                <span className="bg-gold-400 text-stone-900 text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1">
                  {discountPercent}% Off
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-3xl font-semibold text-stone-900">৳{effectivePrice.toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-lg text-stone-400 line-through">৳{product.price.toLocaleString()}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-stone-500 leading-relaxed text-sm mb-8 border-b border-cream-300 pb-8">
                {product.description}
              </p>
            )}

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Color: <span className="font-normal text-stone-500 normal-case">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm border transition-all ${
                        selectedColor === color
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-cream-400 text-stone-600 hover:border-stone-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Size: <span className="font-normal text-stone-500 normal-case">{selectedSize || 'Select a size'}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setError(''); }}
                      className={`w-12 h-12 text-sm font-medium border transition-all ${
                        selectedSize === size
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-cream-400 text-stone-600 hover:border-stone-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* Quantity & Add to Cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-cream-400">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-12 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-12 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors">
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold uppercase tracking-widest transition-all active:scale-95 ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : product.stock === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-900 text-white hover:bg-stone-700'
                }`}
              >
                {addingToCart ? (
                  <LoadingSpinner size="sm" />
                ) : addedToCart ? (
                  <><Check size={16} /> Added to Cart</>
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : (
                  <><ShoppingBag size={16} /> Add to Cart</>
                )}
              </button>
            </div>

            {/* Stock */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-orange-500 text-sm font-medium mb-4">
                Only {product.stock} left in stock — order soon!
              </p>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-6 border-t border-cream-300">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs bg-cream-200 text-stone-500 px-3 py-1 capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-cream-300">
            <h2 className="section-title mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
