import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  currency: 'PKR' | 'USD';
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, type: 'stitched' | 'unstitched', size?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedType, setSelectedType] = useState<'stitched' | 'unstitched'>('stitched');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const price = selectedType === 'stitched' ? product.priceStitched : product.priceUnstitched;
  const secondaryImage = product.images[1] || product.images[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes.includes('M') ? 'M' : product.sizes[0];
    onAddToCart(product, selectedType, selectedType === 'stitched' ? defaultSize : undefined);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-md border border-[#EBDCCB] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-[#C5A059]/60 relative"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] bg-[#F7F4EF] overflow-hidden">
        <img
          src={isHovered ? secondaryImage : product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#5A0C18] text-white shadow-sm">
              -{product.discountPercentage}% OFF
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#1C1917] text-[#DFCA95] border border-[#C5A059]/40 shadow-sm">
              Bestseller
            </span>
          )}
          {product.isFlashSale && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#C5A059] text-stone-950 shadow-sm">
              Flash Deal
            </span>
          )}
          {product.stockCount <= 5 && product.stockCount > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-900 border border-amber-300">
              Only {product.stockCount} Left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-md z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 hover:bg-white text-stone-600 hover:text-rose-600'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2 bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold uppercase tracking-wider rounded shadow-md border border-[#EBDCCB] flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-[#A37F37]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span className="uppercase tracking-wider text-[#A37F37] font-semibold truncate">
              {product.fabric} • {product.categoryLabel}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating}</span>
              <span className="text-stone-400">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 mt-1 line-clamp-1 group-hover:text-[#A37F37] transition-colors">
            {product.title}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 font-light">
            {product.subtitle}
          </p>
        </div>

        {/* Stitched / Unstitched Option Pills */}
        <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedType('stitched')}
            className={`flex-1 py-1 text-[11px] font-medium rounded border transition-all ${
              selectedType === 'stitched'
                ? 'bg-[#1C1917] text-[#DFCA95] border-[#1C1917]'
                : 'bg-[#FAF8F5] text-stone-600 border-[#E4D9CC] hover:border-stone-400'
            }`}
          >
            Stitched
          </button>
          <button
            onClick={() => setSelectedType('unstitched')}
            className={`flex-1 py-1 text-[11px] font-medium rounded border transition-all ${
              selectedType === 'unstitched'
                ? 'bg-[#1C1917] text-[#DFCA95] border-[#1C1917]'
                : 'bg-[#FAF8F5] text-stone-600 border-[#E4D9CC] hover:border-stone-400'
            }`}
          >
            Unstitched
          </button>
        </div>

        {/* Pricing and Add to Bag */}
        <div className="pt-2 border-t border-[#F0EBE3] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-base sm:text-lg font-bold text-stone-900">
                {formatPrice(price, currency)}
              </span>
              {product.originalPrice && product.originalPrice > price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-400 block -mt-0.5">
              {selectedType === 'stitched' ? 'Tailored Set' : '3-Piece Fabric'}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-600 text-white scale-110'
                : product.inStock
                ? 'bg-[#1C1917] text-[#DFCA95] hover:bg-[#C5A059] hover:text-stone-950'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            title={product.inStock ? 'Add to Shopping Bag' : 'Out of Stock'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
