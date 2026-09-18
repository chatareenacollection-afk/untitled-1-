import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Order, StoreSettings, Coupon, CategoryItem } from './types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, INITIAL_CATEGORIES } from './data/mockData';
import { ReactHelmet } from './components/ReactHelmet';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminDashboard } from './components/AdminDashboard';
import { SecretPortalModal, SECRET_PASSKEY } from './components/SecretPortalModal';
import { Footer } from './components/Footer';
import { MessageCircle, Sparkles, ShieldCheck, Truck, Scissors, ArrowUp } from 'lucide-react';

export default function App() {
  // Core Store States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // Cart & Wishlist (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ar_styles_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ar_styles_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Modals & Navigation Views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [currentView, setCurrentView] = useState<'store' | 'tracking' | 'wishlist'>('store');
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSecretPortalOpen, setIsSecretPortalOpen] = useState(false);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleUnlockPortal = () => {
    sessionStorage.setItem('ar_executive_auth', 'true');
    setIsAdminOpen(true);
    setIsSecretPortalOpen(false);
  };

  const handleCloseAdmin = () => {
    sessionStorage.removeItem('ar_executive_auth');
    setIsAdminOpen(false);
    if (window.location.pathname === '/admin') {
      window.history.replaceState({}, '', '/');
    }
  };

  // Persist Cart & Wishlist
  useEffect(() => {
    try {
      localStorage.setItem('ar_styles_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('ar_styles_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Fetch Live Data from Backend API
  const fetchStoreData = async () => {
    try {
      const safeFetch = async (url: string) => {
        try {
          const r = await fetch(url);
          if (!r.ok) return null;
          return await r.json();
        } catch {
          return null;
        }
      };

      const [prodRes, settRes, catRes] = await Promise.all([
        safeFetch('/api/products'),
        safeFetch('/api/settings'),
        safeFetch('/api/categories'),
      ]);
      if (prodRes && Array.isArray(prodRes) && prodRes.length > 0) {
        setProducts(prodRes);
      }
      if (settRes && settRes.storeName) {
        setStoreSettings(settRes);
      }
      if (catRes && Array.isArray(catRes) && catRes.length > 0) {
        setCategories(catRes);
      }
    } catch {
      // Background synchronization fallback
    }
  };

  // Real-Time Multi-Device Background Synchronization
  useEffect(() => {
    fetchStoreData();

    // Periodic synchronization every 5 seconds across all devices
    const syncTimer = setInterval(() => {
      fetchStoreData();
    }, 5000);

    const handleFocus = () => {
      fetchStoreData();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStoreData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Check URL path for /admin or #admin
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      const isAuth = sessionStorage.getItem('ar_executive_auth') === 'true';
      if (isAuth) {
        setIsAdminOpen(true);
      } else {
        setIsSecretPortalOpen(true);
      }
    }

    return () => {
      clearInterval(syncTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Global typing listener: typing the secret key unlocks the portal from any page
  useEffect(() => {
    let keyBuffer = '';
    let clearTimer: any = null;

    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key && e.key.length === 1) {
        keyBuffer += e.key;
        if (keyBuffer.length > 90) {
          keyBuffer = keyBuffer.slice(-90);
        }
        if (keyBuffer.includes(SECRET_PASSKEY)) {
          keyBuffer = '';
          handleUnlockPortal();
          return;
        }
        clearTimeout(clearTimer);
        clearTimer = setTimeout(() => {
          keyBuffer = '';
        }, 8000);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      clearTimeout(clearTimer);
    };
  }, []);

  // Cart Operations
  const handleAddToCart = (
    product: Product,
    type: 'stitched' | 'unstitched',
    size?: string,
    quantity = 1
  ) => {
    const unitPrice = type === 'stitched' ? product.priceStitched : product.priceUnstitched;
    const effectiveSize = type === 'stitched' ? (size || product.sizes[0] || 'M') : undefined;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.productId === product.id && it.type === type && it.size === effectiveSize
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          type,
          size: effectiveSize,
          fabric: product.fabric,
          unitPrice,
          quantity,
          image: product.images[0],
        },
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (
    productId: string,
    type: 'stitched' | 'unstitched',
    size: string | undefined,
    qty: number
  ) => {
    if (qty <= 0) {
      handleRemoveCartItem(productId, type, size);
      return;
    }
    setCart((prev) =>
      prev.map((it) =>
        it.productId === productId && it.type === type && it.size === size
          ? { ...it, quantity: qty }
          : it
      )
    );
  };

  const handleRemoveCartItem = (
    productId: string,
    type: 'stitched' | 'unstitched',
    size: string | undefined
  ) => {
    setCart((prev) =>
      prev.filter(
        (it) => !(it.productId === productId && it.type === type && it.size === size)
      )
    );
  };

  const handleBuyNow = (
    product: Product,
    type: 'stitched' | 'unstitched',
    size?: string,
    quantity = 1
  ) => {
    handleAddToCart(product, type, size, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Wishlist Toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Coupon Application
  const handleApplyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid voucher coupon' };
      }
      setAppliedCoupon(data.coupon);
      return { success: true, message: `Voucher "${data.coupon.code}" applied successfully!` };
    } catch {
      return { success: false, message: 'Server communication error' };
    }
  };

  // Subtotal and discount math
  const cartSubtotal = cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? (cartSubtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  // Order Placement Callback
  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    setAppliedCoupon(null);
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
  };

  // Scroll to Collection
  const scrollToCollection = (category = 'all') => {
    setActiveCategory(category);
    setCurrentView('store');
    const el = document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic SEO Helmet metadata calculation based on selectedProduct, activeCategory, or currentView
  const seoMetadata = useMemo(() => {
    // 1. If a specific product modal / detail is open
    if (selectedProduct) {
      const priceVal = selectedProduct.priceStitched || selectedProduct.priceUnstitched;
      return {
        title: `${selectedProduct.title} | Luxury ${selectedProduct.categoryLabel} by A-R Styles`,
        description: `${selectedProduct.title} - ${selectedProduct.subtitle}. Crafted from premium ${selectedProduct.fabric} in ${selectedProduct.color}. Available with bespoke tailoring and nationwide cash on delivery.`,
        keywords: `${selectedProduct.title}, ${selectedProduct.fabric}, ${selectedProduct.categoryLabel}, A-R Styles, luxury eastern fashion, watches, pret Pakistan`,
        ogTitle: `${selectedProduct.title} | A-R Styles`,
        ogDescription: selectedProduct.description || selectedProduct.subtitle,
        ogImage: selectedProduct.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
        ogType: 'product' as const,
        priceAmount: priceVal,
        priceCurrency: currency,
        sku: selectedProduct.sku,
        availability: selectedProduct.inStock ? ('InStock' as const) : ('OutOfStock' as const),
      };
    }

    // 2. If viewing tracking page
    if (currentView === 'tracking') {
      return {
        title: 'Track Your Parcel & Real-Time Courier Status | A-R Styles',
        description: 'Track your A-R Styles luxury consignment in real-time with TCS, Leopards, Trax, or DHL tracking number.',
        keywords: 'track order, parcel tracking, courier status, A-R Styles delivery',
        ogType: 'website' as const,
      };
    }

    // 3. If viewing wishlist
    if (currentView === 'wishlist') {
      return {
        title: 'Your Curated Luxury Wishlist | A-R Styles',
        description: 'Review and complete your curated wishlist of luxury pret, formals, bridal ensembles, watches, and accessories.',
        keywords: 'wishlist, saved outfits, bridal couture, watches, A-R Styles',
        ogType: 'website' as const,
      };
    }

    // 4. Category-based dynamic SEO
    if (activeCategory && activeCategory !== 'all') {
      const catObj = categories.find((c) => c.id === activeCategory);
      if (activeCategory === 'watches') {
        return {
          title: 'Luxury Timepieces, Chronographs & Watches | A-R Styles',
          description: 'Explore the A-R Styles horology collection: precision automatic watches, 18k rose gold chronographs, and diamond-bezel jewelry timepieces for formal and bridal wear.',
          keywords: 'luxury watches Pakistan, men chronograph watch, women diamond watch, bridal watches, sapphire glass watch, A-R Styles timepieces',
          ogTitle: 'Luxury Timepieces & Watches Collection | A-R Styles',
          ogDescription: 'Precision Swiss and Japanese movements, 18k rose gold electroplating, and mother-of-pearl jewelry watches.',
          ogImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
          ogType: 'website' as const,
        };
      }

      if (activeCategory === 'accessories') {
        return {
          title: 'Statement Clutches, Polki Jewelry & Accessories | A-R Styles',
          description: 'Complete your eastern couture look with handcrafted bridal kundan chokers, jhumkas, gilded minaudières, and heirloom pearl clutches.',
          keywords: 'statement accessories, bridal jewelry, kundan choker, polki clutch, minaudiere, bridal clutches Pakistan',
          ogTitle: 'Statement Clutches & Jewelry Accessories | A-R Styles',
          ogDescription: '24k gold-finish handcrafted bridal chokers, jhumkas, and velvet-lined luxury minaudières.',
          ogImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
          ogType: 'website' as const,
        };
      }

      if (activeCategory === 'formals-bridal') {
        return {
          title: 'Formal & Bridal Couture Edit | A-R Styles',
          description: 'Bespoke bridal peshwas, velvet ghararas, and hand-embellished zardozi formal wear for weddings, shendis, and festive celebrations.',
          keywords: 'Pakistani bridal wear, bridal peshwas, wedding gharara, velvet bridal lehenga, zardozi embroidery, A-R Styles bridal',
          ogImage: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=80',
          ogType: 'website' as const,
        };
      }

      if (activeCategory === 'pret') {
        return {
          title: 'Ready-to-Wear Pret & Contemporary Silks | A-R Styles',
          description: 'Discover effortlessly chic ready-to-wear kurta sets, raw silk tunics, and contemporary 2-piece and 3-piece co-ord suits.',
          keywords: 'pret Pakistan, ready to wear suits, raw silk kurta, designer pret, modern eastern co-ords',
          ogImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
          ogType: 'website' as const,
        };
      }

      if (activeCategory === 'unstitched') {
        return {
          title: 'Unstitched 3-Piece Luxury Suites | A-R Styles',
          description: 'Artisanal embroideries, pure silk slips, and organza dupattas. Tailor your dream ensemble with custom stitching services.',
          keywords: 'unstitched suits, luxury unstitched 3 piece, embroidered chiffon suit, lawn suit with silk dupatta',
          ogImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
          ogType: 'website' as const,
        };
      }

      if (activeCategory === 'shawls') {
        return {
          title: 'Heirloom Pashmina Shawls & Embroidered Dupattas | A-R Styles',
          description: 'Wrap yourself in regal warmth with hand-embroidered Kashmiri tilla shawls, velvet wraps, and pure silk stoles.',
          keywords: 'pashmina shawls, kashmiri tilla shawl, velvet shawl Pakistan, bridal dupatta',
          ogImage: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1200&q=80',
          ogType: 'website' as const,
        };
      }

      if (catObj) {
        return {
          title: `${catObj.name} | A-R Styles Couture`,
          description: `Shop the curated ${catObj.name} collection at A-R Styles. ${catObj.subtitle || 'Exquisite eastern couture and statement craftsmanship.'}`,
          keywords: `${catObj.name}, eastern fashion, designer wear Pakistan, A-R Styles`,
          ogImage: catObj.image,
          ogType: 'website' as const,
        };
      }
    }

    // Default Store Homepage SEO
    return {
      title: 'A-R Styles | Contemporary Eastern Couture, Luxury Pret, Watches & Accessories',
      description: 'Step into A-R Styles: contemporary ready-to-wear, unstitched luxury 3-piece edits, heirloom bridal couture, luxury timepieces & watches, and statement jewelry. Free nationwide shipping and WhatsApp concierge.',
      keywords: 'A-R Styles, Pakistani designer wear, luxury watches Pakistan, pret collection, bridal couture, unstitched lawn silk, statement accessories, kundan jewelry',
      ogTitle: 'A-R Styles | Contemporary Eastern Elegance, Watches & Couture',
      ogDescription: 'Experience ancestral craft meeting modern silhouettes. Nationwide Cash on Delivery & Global Express Dispatch.',
      ogImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website' as const,
    };
  }, [selectedProduct, currentView, activeCategory, categories, currency]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col selection:bg-[#C5A059] selection:text-stone-900 font-sans">
      {/* Dynamic SEO Meta Tags & Search Engine Discovery */}
      <ReactHelmet {...seoMetadata} />

      {/* 1. Header & Navigation */}
      <Header
        products={products}
        categories={categories}
        settings={storeSettings}
        whatsappNumber={storeSettings?.whatsappNumber || '+92 300 1234567'}
        currency={currency}
        onToggleCurrency={() => setCurrency((c) => (c === 'PKR' ? 'USD' : 'PKR'))}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setCurrentView('wishlist')}
        onUnlockPortal={handleUnlockPortal}
        onOpenSecretPrompt={() => setIsSecretPortalOpen(true)}
        onOpenTracking={() => setCurrentView('tracking')}
        onSelectProduct={(p) => setSelectedProduct(p)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => scrollToCollection(cat)}
      />

      {/* 2. Main Body View Routing */}
      <main className="flex-1">
        {currentView === 'tracking' ? (
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
              <button
                onClick={() => setCurrentView('store')}
                className="text-xs font-semibold text-[#A37F37] hover:underline flex items-center gap-1"
              >
                ← Return to Boutique Store
              </button>
            </div>
            <OrderTrackingView
              initialOrderNumber={trackingOrderNumber}
              currency={currency}
              onClose={() => setCurrentView('store')}
            />
          </div>
        ) : currentView === 'wishlist' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EBDCCB] pb-4">
              <div>
                <h1 className="font-serif text-3xl font-bold text-stone-900">Your Private Wishlist</h1>
                <p className="text-xs text-stone-500 mt-1">
                  Saved pieces for your upcoming festive wardrobe ({wishlist.length} items)
                </p>
              </div>
              <button
                onClick={() => setCurrentView('store')}
                className="px-4 py-2 bg-[#1C1917] text-[#DFCA95] text-xs font-semibold rounded"
              >
                Continue Shopping
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#EBDCCB] p-12 text-center space-y-3">
                <p className="font-serif text-lg font-bold text-stone-900">Your wishlist is currently empty</p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Click the heart icon on any outfit to curate your personal collection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products
                  .filter((p) => wishlist.includes(p.id))
                  .map((p) => (
                    <ProductCatalog
                      key={p.id}
                      products={[p]}
                      currency={currency}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      onQuickView={setSelectedProduct}
                      onAddToCart={handleAddToCart}
                      activeCategory="all"
                      onSelectCategory={() => {}}
                      searchQuery=""
                      onClearSearch={() => {}}
                    />
                  ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Hero Carousel */}
            <HeroBanner
              currency={currency}
              onExplore={() => scrollToCollection('all')}
              onSelectCategory={(cat) => scrollToCollection(cat)}
            />

            {/* Curated Category Grid */}
            <CategoryGrid
              onSelectCategory={(cat) => scrollToCollection(cat)}
              categories={categories}
            />

            {/* Artisanal Heritage Strip */}
            <section className="bg-white border-y border-[#EBDCCB] py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2 p-4">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EBDCCB] flex items-center justify-center mx-auto text-[#C5A059]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-stone-900">Artisanal Zardozi & Marori</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                    Hand-worked metal wires, tilla embellishments, and antique dabka created by generational craftsmen.
                  </p>
                </div>

                <div className="space-y-2 p-4">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EBDCCB] flex items-center justify-center mx-auto text-[#C5A059]">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-stone-900">Bespoke Master Tailoring</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                    Finished with French seams, custom lace inlays, organza borders, and hand-knotted pearl tassels.
                  </p>
                </div>

                <div className="space-y-2 p-4">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EBDCCB] flex items-center justify-center mx-auto text-[#C5A059]">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-stone-900">Fast Nationwide Delivery</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                    Express dispatch across Karachi, Lahore, Islamabad, Faisalabad, Multan & 120+ Pakistani cities with COD.
                  </p>
                </div>
              </div>
            </section>

            {/* Product Catalog & Filter Engine */}
            <ProductCatalog
              products={products}
              categories={categories}
              currency={currency}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={setSelectedProduct}
              onAddToCart={handleAddToCart}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          </>
        )}
      </main>

      {/* 3. Modals & Drawers */}
      {/* Product Detail Modal (PDP) */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currency={currency}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          whatsappNumber={storeSettings.whatsappNumber}
          relatedProducts={products.filter((p) => p.id !== selectedProduct.id)}
          onSelectRelated={(p) => setSelectedProduct(p)}
        />
      )}

      {/* Shopping Bag Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        freeShippingThreshold={storeSettings.freeShippingThreshold}
        onApplyCoupon={handleApplyCoupon}
        appliedCoupon={appliedCoupon?.code}
        discountAmount={discountAmount}
      />

      {/* Multi-Step Express Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currency={currency}
        subtotal={cartSubtotal}
        discountAmount={discountAmount}
        couponCode={appliedCoupon?.code}
        storeSettings={storeSettings}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Screen */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={(num) => {
            setTrackingOrderNumber(num);
            setCurrentView('tracking');
          }}
          whatsappNumber={storeSettings.whatsappNumber}
        />
      )}

      {/* Management Portal */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={handleCloseAdmin}
          currency={currency}
          storeSettings={storeSettings}
          onUpdateSettings={setStoreSettings}
          onProductsUpdated={fetchStoreData}
          onCategoriesUpdated={fetchStoreData}
        />
      )}

      {/* Secret Access Portal Modal */}
      <SecretPortalModal
        isOpen={isSecretPortalOpen}
        onClose={() => setIsSecretPortalOpen(false)}
        onSuccess={handleUnlockPortal}
      />

      {/* Floating WhatsApp Concierge Button */}
      <a
        href={`https://wa.me/${(storeSettings?.whatsappNumber || '+92 300 1234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello A-R Styles! I would like to inquire about couture styling and bespoke orders.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#1ebd5a] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 group transition-all duration-300 hover:scale-105 border border-white/40"
        title="Chat with A-R Styles Stylist on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold tracking-wide">
          WhatsApp Stylist
        </span>
      </a>

      {/* 4. Luxury Footer */}
      <Footer
        settings={storeSettings}
        onSelectCategory={scrollToCollection}
        onOpenTracking={() => setCurrentView('tracking')}
      />
    </div>
  );
}
