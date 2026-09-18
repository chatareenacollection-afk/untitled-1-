import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, Filter, FolderTree } from 'lucide-react';
import { Product, ProductCategory, FabricType, FilterOptions, CategoryItem } from '../types';
import { ProductCard } from './ProductCard';
import { formatPrice } from '../utils/formatters';

interface ProductCatalogProps {
  products: Product[];
  categories?: CategoryItem[];
  currency: 'PKR' | 'USD';
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, type: 'stitched' | 'unstitched', size?: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
}

const FABRICS: FabricType[] = [
  'Raw Silk',
  'Pure Silk',
  'Chiffon',
  'Lawn',
  'Organza',
  'Velvet',
  'Khaddar',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  currency,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
}) => {
  const maxAvailablePrice = useMemo(() => {
    if (!products || products.length === 0) return 150000;
    const highest = Math.max(
      ...products.map((p) => Math.max(p.priceStitched || 0, p.priceUnstitched || 0, p.originalPrice || 0))
    );
    return Math.max(Math.ceil((highest + 15000) / 10000) * 10000, 150000);
  }, [products]);

  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // Category
        if (activeCategory !== 'all' && item.category !== activeCategory) return false;
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.fabric.toLowerCase().includes(q) ||
            item.sku.toLowerCase().includes(q) ||
            item.color.toLowerCase().includes(q);
          if (!matches) return false;
        }
        // Fabric
        if (selectedFabric !== 'all' && item.fabric !== selectedFabric) return false;
        // Size
        if (selectedSize !== 'all' && !item.sizes.includes(selectedSize)) return false;
        // Price (effective price unstitched or stitched)
        const effectivePrice = item.priceStitched || item.priceUnstitched || 0;
        if (effectivePrice > maxPrice) return false;
        // In Stock
        if (inStockOnly && !item.inStock) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return (a.priceStitched || a.priceUnstitched) - (b.priceStitched || b.priceUnstitched);
        if (sortBy === 'price-high') return (b.priceStitched || b.priceUnstitched) - (a.priceStitched || a.priceUnstitched);
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, activeCategory, searchQuery, selectedFabric, selectedSize, maxPrice, inStockOnly, sortBy]);

  const clearAllFilters = () => {
    setSelectedFabric('all');
    setSelectedSize('all');
    setMaxPrice(maxAvailablePrice);
    setInStockOnly(false);
    onSelectCategory('all');
    onClearSearch();
  };

  const hasActiveFilters =
    selectedFabric !== 'all' ||
    selectedSize !== 'all' ||
    maxPrice < maxAvailablePrice ||
    inStockOnly ||
    activeCategory !== 'all' ||
    Boolean(searchQuery);

  return (
    <section id="collection-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-[#EBDCCB] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-px w-6 bg-[#C5A059]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#A37F37] font-semibold">
              Curated Masterpieces
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 capitalize">
            {activeCategory === 'all'
              ? 'Complete Festive & Pret Archive'
              : (activeCategory || '').replace('-', ' ')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
            Showing {filteredProducts.length} handcrafted couture ensembles
          </p>
        </div>

        {/* Controls: Mobile filter button & Sort selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden px-3.5 py-2 rounded border border-[#EBDCCB] bg-white text-stone-800 text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#A37F37]" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
            )}
          </button>

          <div className="flex items-center gap-2 bg-white border border-[#EBDCCB] rounded px-3 py-1.5 shadow-xs text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-stone-900 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured & Best Selling</option>
              <option value="newest">New Arrivals First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
          <span className="text-stone-500 font-medium">Applied Filters:</span>
          {activeCategory !== 'all' && (
            <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 flex items-center gap-1.5 border border-stone-200">
              Category: {activeCategory}
              <button onClick={() => onSelectCategory('all')} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-1 rounded bg-[#F5EFE6] text-stone-800 flex items-center gap-1.5 border border-[#EBDCCB]">
              Search: "{searchQuery}"
              <button onClick={onClearSearch} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedFabric !== 'all' && (
            <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 flex items-center gap-1.5 border border-stone-200">
              Fabric: {selectedFabric}
              <button onClick={() => setSelectedFabric('all')} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSize !== 'all' && (
            <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 flex items-center gap-1.5 border border-stone-200">
              Size: {selectedSize}
              <button onClick={() => setSelectedSize('all')} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {maxPrice < 40000 && (
            <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 flex items-center gap-1.5 border border-stone-200">
              Max: {formatPrice(maxPrice, currency)}
              <button onClick={() => setMaxPrice(40000)} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 flex items-center gap-1.5 border border-stone-200">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-[#A37F37] font-semibold hover:underline ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DESKTOP SIDEBAR FILTERS (and toggled on mobile) */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            showMobileFilters ? 'block' : 'hidden lg:block'
          } bg-white lg:bg-transparent p-5 lg:p-0 rounded-lg lg:rounded-none border lg:border-none border-[#EBDCCB] shadow-xs lg:shadow-none`}
        >
          {/* Filter Group: Collections / Categories */}
          {categories && categories.length > 0 && (
            <div className="bg-white p-4 rounded-md border border-[#EBDCCB] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-2">
                <h3 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Collections</span>
                </h3>
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => onSelectCategory('all')}
                    className="text-[10px] text-[#A37F37] hover:underline font-semibold"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="space-y-1 text-xs text-stone-600 max-h-56 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className={`w-full text-left py-1.5 px-2 rounded transition-colors flex items-center justify-between cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-[#1C1917] text-[#DFCA95] font-semibold'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span>All Ensembles</span>
                  <span className="text-[10px] opacity-70 font-mono">({products.length})</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.id).length;
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(cat.id)}
                      className={`w-full text-left py-1.5 px-2 rounded transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#DFCA95] font-semibold'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="truncate pr-1">{cat.name}</span>
                      <span className="text-[10px] opacity-70 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Group: Fabrics */}
          <div className="bg-white p-4 rounded-md border border-[#EBDCCB] shadow-xs space-y-3">
            <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-[#F0EBE3] pb-2">
              Artisanal Fabric
            </h3>
            <div className="space-y-1.5 text-xs text-stone-600">
              <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                <input
                  type="radio"
                  name="fabric"
                  checked={selectedFabric === 'all'}
                  onChange={() => setSelectedFabric('all')}
                  className="text-[#A37F37] focus:ring-[#C5A059]"
                />
                <span>All Fabrics</span>
              </label>
              {FABRICS.map((fab) => (
                <label key={fab} className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="radio"
                    name="fabric"
                    checked={selectedFabric === fab}
                    onChange={() => setSelectedFabric(fab)}
                    className="text-[#A37F37] focus:ring-[#C5A059]"
                  />
                  <span>{fab}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Group: Standard Sizing */}
          <div className="bg-white p-4 rounded-md border border-[#EBDCCB] shadow-xs space-y-3">
            <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-[#F0EBE3] pb-2">
              Standard Pret Size
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                  selectedSize === 'all'
                    ? 'border-[#1C1917] bg-[#1C1917] text-[#DFCA95]'
                    : 'border-[#EBDCCB] bg-white text-stone-600 hover:border-stone-400'
                }`}
              >
                All
              </button>
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-10 h-8 rounded text-xs font-semibold border flex items-center justify-center transition-all ${
                    selectedSize === sz
                      ? 'border-[#1C1917] bg-[#1C1917] text-[#DFCA95]'
                      : 'border-[#EBDCCB] bg-white text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Group: Price Slider */}
          <div className="bg-white p-4 rounded-md border border-[#EBDCCB] shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-[#F0EBE3] pb-2">
              <h3 className="font-serif text-sm font-bold text-stone-900">Price Range</h3>
              <span className="text-xs font-bold text-[#A37F37]">
                Up to {formatPrice(maxPrice, currency)}
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={maxAvailablePrice}
              step={2000}
              value={Math.min(maxPrice, maxAvailablePrice)}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C5A059] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>Rs. 5,000</span>
              <span>{formatPrice(maxAvailablePrice, currency)}</span>
            </div>
          </div>

          {/* Filter Group: Availability */}
          <div className="bg-white p-4 rounded-md border border-[#EBDCCB] shadow-xs space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#A37F37] focus:ring-[#C5A059]"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* PRODUCTS LISTING */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#EBDCCB] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#EBDCCB] flex items-center justify-center mx-auto text-stone-400">
                <Sparkles className="w-8 h-8 text-[#C5A059]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">No Ensembles Found</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any designs matching your exact filters. Try adjusting your fabric, size, or price criteria.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-[#1C1917] text-[#DFCA95] text-xs font-semibold rounded uppercase tracking-wider shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
