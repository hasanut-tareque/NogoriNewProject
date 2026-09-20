import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useRouter } from '@/hooks/useRouter';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { navigate } = useRouter();
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  return (
    <div
      className="group relative bg-white cursor-pointer card-hover"
      onClick={() => navigate(`#/product/${product.id}`)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-cream-200">
        {product.image_url ? (
          <img
            src={`${product.image_url}?auto=compress&cs=tinysrgb&w=500`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream-200">
            <ShoppingBag size={40} className="text-cream-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && (
            <span className="bg-stone-900 text-white text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-gold-400 text-stone-900 text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1">
              -{discountPercent}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-stone-400 text-white text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
        >
          <Heart size={15} />
        </button>

        {/* Quick Shop */}
        <div className="absolute bottom-0 left-0 right-0 bg-stone-900 text-white text-center text-xs font-semibold tracking-widest uppercase py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          Quick Shop
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-1 capitalize">
          {product.subcategory || product.category}
        </p>
        <h3 className="text-stone-900 font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="font-semibold text-stone-900">৳{product.sale_price!.toLocaleString()}</span>
              <span className="text-stone-400 text-sm line-through">৳{product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-semibold text-stone-900">৳{product.price.toLocaleString()}</span>
          )}
        </div>
        {product.sizes.length > 0 && (
          <div className="flex gap-1 mt-2">
            {product.sizes.slice(0, 5).map(size => (
              <span key={size} className="text-[10px] border border-cream-400 text-stone-500 px-1.5 py-0.5">
                {size}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="text-[10px] text-stone-400">+{product.sizes.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
