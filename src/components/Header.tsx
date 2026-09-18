import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Heart, ShieldCheck, Menu, X, ArrowRight, Sparkles, Phone, Truck } from 'lucide-react';
import { Product, ProductCategory, StoreSettings, CategoryItem } from '../types';
import { formatPrice } from '../utils/formatters';

interface HeaderProps {
  products?: Product[];
  categories?: CategoryItem[];
  settings?: StoreSettings;
  whatsappNumber?: string;
  activeCategory: ProductCategory | 'all' | 'new-arrivals' | string;
  onSelectCategory: (cat: ProductCategory | 'all' | 'new-arrivals' | string) => void;
  currency: 'PKR' | 'USD';
  onToggleCurrency: () => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onUnlockPortal?: () => void;
  onOpenSecretPrompt?: () => void;
  onSelectProduct?: (product: Product) => void;
  onOpenTrackOrder?: () => void;
  onOpenTracking?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const SECRET_PASSKEY = 'Gujjarfamily19109$$Gujjarfamily19109$$';

export const Header: React.FC<HeaderProps> = ({
  products = [],
  categories = [],
  settings,
  whatsappNumber,
  activeCategory,
  onSelectCategory,
  currency,
  onToggleCurrency,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onUnlockPortal,
  onOpenSecretPrompt,
  onSelectProduct,
  onOpenTrackOrder,
  onOpenTracking,
  searchQuery: controlledSearchQuery,
  onSearchChange,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<any>(null);

  const currentSearch = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearch;
  const updateSearch = (val: string) => {
    if (val.includes(SECRET_PASSKEY)) {
      if (onSearchChange) onSearchChange('');
      else setInternalSearch('');
      setIsSearchOpen(false);
      if (onUnlockPortal) onUnlockPortal();
      return;
    }
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const handleLogoClick = () => {
    logoTapCountRef.current++;
    if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);
    logoTapTimerRef.current = setTimeout(() => {
      logoTapCountRef.current = 0;
    }, 2500);

    if (logoTapCountRef.current >= 5) {
      logoTapCountRef.current = 0;
      if (onOpenSecretPrompt) onOpenSecretPrompt();
      return;
    }

    onSelectCategory('all');
  };

  const effectiveWhatsApp = whatsappNumber || settings?.whatsappNumber || '+92 300 1234567';
  const cleanPhone = (effectiveWhatsApp || '').replace(/[^0-9]/g, '');

  const handleTrackClick = () => {
    if (onOpenTrackOrder) onOpenTrackOrder();
    else if (onOpenTracking) onOpenTracking();
  };

  const searchResults = currentSearch.trim().length > 1 && Array.isArray(products)
    ? products
        .filter((p) =>
          p.title?.toLowerCase().includes(currentSearch.toLowerCase()) ||
          p.fabric?.toLowerCase().includes(currentSearch.toLowerCase()) ||
          p.categoryLabel?.toLowerCase().includes(currentSearch.toLowerCase()) ||
          p.color?.toLowerCase().includes(currentSearch.toLowerCase()) ||
          p.sku?.toLowerCase().includes(currentSearch.toLowerCase())
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: { label: string; value: string }[] = [
    { label: 'All Collections', value: 'all' },
    { label: 'New Arrivals', value: 'new-arrivals' },
    ...(categories && categories.length > 0
      ? categories.map((c) => ({ label: c.name, value: c.id }))
      : [
          { label: 'Pret / Ready-to-Wear', value: 'pret' },
          { label: 'Unstitched 3-Piece', value: 'unstitched' },
          { label: 'Luxury Formals & Bridal', value: 'formals-bridal' },
          { label: 'Lawn & Silk', value: 'luxury-lawn' },
          { label: 'Shawls & Dupattas', value: 'shawls' },
          { label: 'Luxury Watches', value: 'watches' },
          { label: 'Statement Accessories', value: 'accessories' },
        ]),
    { label: 'Track Order', value: 'track' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EBDCCB]">
      {/* Top Announcement Bar */}
      <div className="bg-[#1C1917] text-[#FAF8F5] py-2 px-4 text-xs tracking-wider uppercase border-b border-[#C5A059]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-[#C5A059] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complimentary Nationwide Delivery</span>
            </span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span className="hidden md:inline text-stone-300">Orders Over Rs. 5,000</span>
            <span className="hidden lg:inline text-stone-500">|</span>
            <span className="hidden lg:inline text-stone-300">100% Verified Cash on Delivery (COD)</span>
          </div>
          <div className="flex items-center gap-4 text-stone-300">
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#C5A059] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#C5A059]" />
              <span className="hidden sm:inline">WhatsApp Concierge:</span>
              <span className="font-semibold text-[#C5A059]">{effectiveWhatsApp}</span>
            </a>
            <button
              onClick={onToggleCurrency}
              className="px-2 py-0.5 rounded border border-[#C5A059]/60 text-[11px] font-medium text-[#FAF8F5] hover:bg-[#C5A059]/20 transition-all cursor-pointer"
              title="Toggle between PKR and USD"
            >
              {currency === 'PKR' ? 'PKR (Rs.)' : 'USD ($)'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md text-stone-700 hover:text-stone-900 hover:bg-[#F0EBE3]"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo & Wordmark */}
        <div
          onClick={handleLogoClick}
          className="cursor-pointer flex items-center gap-3 group select-none"
        >
          <div className="w-10 h-10 rounded-sm border border-[#C5A059] bg-[#1C1917] flex items-center justify-center text-[#C5A059] font-serif text-lg font-bold tracking-widest shadow-sm group-hover:border-[#DFCA95] transition-colors">
            A•R
          </div>
          <div>
            <div className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-stone-900 group-hover:text-[#A37F37] transition-colors leading-none">
              A-R STYLES
            </div>
            <div className="text-[10px] sm:text-[11px] tracking-[0.2em] text-stone-500 uppercase font-sans mt-0.5">
              Couture & Pret
            </div>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md mx-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search embroidered raw silk, chiffon, lawn..."
              value={currentSearch}
              onChange={(e) => {
                updateSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-[#F3EFEA] border border-[#E4D9CC] rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {currentSearch && (
              <button
                onClick={() => updateSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-[#EBDCCB] overflow-hidden z-50">
              <div className="p-2 border-b border-stone-100 bg-[#FAF8F5] text-[11px] text-stone-500 font-medium uppercase tracking-wider">
                Matching Outfits ({searchResults.length})
              </div>
              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(item);
                      setIsSearchOpen(false);
                      updateSearch('');
                    }}
                    className="p-3 flex items-center gap-3 hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-12 h-14 object-cover rounded border border-[#EBDCCB]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-stone-500">{item.fabric} • {item.color}</p>
                      <p className="text-xs font-bold text-[#A37F37] mt-0.5">
                        {formatPrice(item.priceStitched, currency)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleTrackClick}
            className="hidden sm:flex items-center gap-1.5 text-xs text-stone-700 hover:text-[#A37F37] font-medium py-1.5 px-2.5 rounded hover:bg-[#F3EFEA] transition-colors"
            title="Track Your Parcel"
          >
            <Truck className="w-4 h-4 text-[#A37F37]" />
            <span className="hidden md:inline">Track Order</span>
          </button>

          <button
            onClick={onOpenWishlist}
            className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-[#F3EFEA] rounded-full transition-colors"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#A37F37] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-[#F3EFEA] rounded-full transition-colors flex items-center gap-2 group"
            title="Shopping Bag"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5 text-stone-800 group-hover:text-[#A37F37] transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1C1917] text-[#FAF8F5] border border-[#C5A059] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Category Navigation */}
      <nav className="hidden lg:block border-t border-[#EBDCCB]/70 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-center space-x-6 xl:space-x-8 py-2.5 text-[11px] xl:text-xs uppercase tracking-widest font-medium text-stone-700 overflow-x-auto no-scrollbar whitespace-nowrap">
          {navLinks.map((link) => {
            const isActive =
              link.value === 'track'
                ? false
                : link.value === activeCategory;
            return (
              <button
                key={link.label}
                onClick={() => {
                  if (link.value === 'track') {
                    handleTrackClick();
                  } else {
                    onSelectCategory(link.value);
                  }
                }}
                className={`pb-1 transition-all relative cursor-pointer ${
                  isActive
                    ? 'text-stone-900 font-bold border-b-2 border-[#C5A059]'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-4/5 max-w-sm bg-[#FAF8F5] h-full shadow-2xl flex flex-col p-5 border-r border-[#EBDCCB] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBDCCB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border border-[#C5A059] bg-[#1C1917] flex items-center justify-center text-[#C5A059] font-serif font-bold text-sm">
                  A•R
                </div>
                <span className="font-serif font-bold text-lg text-stone-900">A-R STYLES</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full text-stone-600 hover:bg-stone-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4">
              <input
                type="text"
                placeholder="Search collection..."
                value={currentSearch}
                onChange={(e) => updateSearch(e.target.value)}
                className="w-full bg-white border border-[#EBDCCB] rounded-lg py-2 px-3 text-sm"
              />
            </div>

            <div className="flex-1 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    if (link.value === 'track') {
                      handleTrackClick();
                    } else {
                      onSelectCategory(link.value);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded text-sm font-medium text-stone-800 hover:bg-[#F0EBE3] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-[#EBDCCB] space-y-3">
              <button
                onClick={() => {
                  onToggleCurrency();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-white border border-[#EBDCCB] rounded text-xs font-semibold text-stone-800 flex justify-between items-center cursor-pointer"
              >
                <span>Currency</span>
                <span className="text-[#A37F37]">{currency === 'PKR' ? 'PKR Rs.' : 'USD $'}</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}
    </header>
  );
};
