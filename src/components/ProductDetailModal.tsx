import React, { useState } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Share2,
  Check,
  Star,
  Ruler,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from 'lucide-react';
import { Product } from '../types';
import { formatPrice, PAKISTAN_MAJOR_CITIES } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product;
  currency: 'PKR' | 'USD';
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onClose: () => void;
  onAddToCart: (product: Product, type: 'stitched' | 'unstitched', size?: string, quantity?: number) => void;
  onBuyNow: (product: Product, type: 'stitched' | 'unstitched', size?: string, quantity?: number) => void;
  whatsappNumber: string;
  relatedProducts: Product[];
  onSelectRelated: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onClose,
  onAddToCart,
  onBuyNow,
  whatsappNumber,
  relatedProducts,
  onSelectRelated,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedType, setSelectedType] = useState<'stitched' | 'unstitched'>('stitched');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes.includes('M') ? 'M' : product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [copiedLink, setCopiedLink] = useState(false);

  // Accordion states
  const [openSection, setOpenSection] = useState<'fabric' | 'delivery' | 'washing' | null>('fabric');

  const price = selectedType === 'stitched' ? product.priceStitched : product.priceUnstitched;
  const originalPrice = product.originalPrice;
  const savings = originalPrice && originalPrice > price ? originalPrice - price : 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Pre-fill WhatsApp message
  const cleanWhatsapp = (whatsappNumber || '+92 300 1234567').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hello A-R Styles! I would like to inquire about/order:\n\n*${product.title}*\nSKU: ${product.sku}\nOption: ${selectedType.toUpperCase()}${selectedType === 'stitched' ? ` (Size: ${selectedSize})` : ''}\nQuantity: ${quantity}\nPrice: Rs. ${(price * quantity).toLocaleString()}\n\nDelivery City: ${selectedCity}`
  )}`;

  const getCityDeliveryEstimate = (city: string) => {
    if (['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'].includes(city)) {
      return '1 - 2 Business Days (Express Air/Overnight)';
    }
    if (['Faisalabad', 'Multan', 'Peshawar', 'Sialkot', 'Gujranwala'].includes(city)) {
      return '2 - 3 Business Days';
    }
    if (city === 'International (Overseas)') {
      return '5 - 7 Business Days via DHL Express';
    }
    return '3 - 4 Business Days (Nationwide Courier)';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FAF8F5] w-full max-w-5xl rounded-lg shadow-2xl border border-[#EBDCCB] overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Close */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md border border-[#EBDCCB] transition-all"
            title="Copy Product Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onToggleWishlist(product.id)}
            className={`p-2 rounded-full backdrop-blur-md shadow-md border border-[#EBDCCB] transition-all ${
              isWishlisted ? 'bg-rose-50 text-rose-600' : 'bg-white/90 hover:bg-white text-stone-700'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md border border-[#EBDCCB] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#F7F4EF] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#EBDCCB]">
            <div className="space-y-4">
              {/* Main Feature Image */}
              <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden border border-[#EBDCCB] shadow-inner bg-white">
                <img
                  src={product.images[activeImageIdx]}
                  alt={product.title}
                  className="w-full h-full object-cover object-top"
                />
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded bg-[#5A0C18] text-white text-xs font-bold uppercase tracking-wider shadow">
                    -{product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnail Selector */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-20 rounded border-2 overflow-hidden flex-shrink-0 cursor-pointer transition-all ${
                        activeImageIdx === idx ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30' : 'border-[#EBDCCB] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Guarantees Box */}
            <div className="mt-6 pt-4 border-t border-[#EBDCCB] grid grid-cols-3 gap-2 text-center text-[11px] text-stone-600">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-[#A37F37] mb-1" />
                <span className="font-semibold text-stone-900">100% Pure Fabric</span>
                <span>Certified silk & lawn</span>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="w-4 h-4 text-[#A37F37] mb-1" />
                <span className="font-semibold text-stone-900">COD Available</span>
                <span>Pay upon delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-[#A37F37] mb-1" />
                <span className="font-semibold text-stone-900">7-Day Exchange</span>
                <span>Hassle-free guarantee</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Actions */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Category and SKU */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A37F37] uppercase tracking-widest font-semibold">
                  {product.categoryLabel}
                </span>
                <span className="text-stone-400 font-mono">SKU: {product.sku}</span>
              </div>

              {/* Title & Reviews */}
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                  {product.title}
                </h1>
                <p className="font-serif italic text-sm text-[#A37F37] mt-1">
                  {product.subtitle}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-stone-800">{product.rating}</span>
                  <span className="text-xs text-stone-400">({product.reviewCount} verified client reviews)</span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-4 bg-white rounded-md border border-[#EBDCCB] flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                      {formatPrice(price, currency)}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-sm text-stone-400 line-through">
                        {formatPrice(originalPrice, currency)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-500">
                    Taxes included. {selectedType === 'stitched' ? 'Includes master tailor stitching' : 'Unstitched 3-piece fabric ensemble'}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      Save {formatPrice(savings, currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Type Selection: Stitched vs Unstitched */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-700">
                  <span>Configuration</span>
                  <span className="text-[#A37F37] font-normal lowercase">
                    {selectedType === 'stitched' ? 'Ready to wear' : 'Custom tailoring required'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedType('stitched')}
                    className={`py-2.5 px-4 rounded border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      selectedType === 'stitched'
                        ? 'border-[#C5A059] bg-[#1C1917] text-[#DFCA95] shadow-md'
                        : 'border-[#EBDCCB] bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <span>Stitched Complete</span>
                    <span className="text-[11px] opacity-80">{formatPrice(product.priceStitched, currency)}</span>
                  </button>
                  <button
                    onClick={() => setSelectedType('unstitched')}
                    className={`py-2.5 px-4 rounded border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      selectedType === 'unstitched'
                        ? 'border-[#C5A059] bg-[#1C1917] text-[#DFCA95] shadow-md'
                        : 'border-[#EBDCCB] bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <span>Unstitched Fabric</span>
                    <span className="text-[11px] opacity-80">{formatPrice(product.priceUnstitched, currency)}</span>
                  </button>
                </div>
              </div>

              {/* Size Selector (If stitched) */}
              {selectedType === 'stitched' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-700">
                    <span>Size: <span className="text-stone-900 font-bold">{selectedSize}</span></span>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-[#A37F37] hover:underline flex items-center gap-1 font-medium capitalize"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Pakistani Size Chart</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-12 h-10 rounded border text-xs font-semibold flex items-center justify-center transition-all ${
                          selectedSize === sz
                            ? 'border-[#C5A059] bg-[#1C1917] text-[#DFCA95]'
                            : 'border-[#EBDCCB] bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & City Delivery Calculator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Quantity
                  </label>
                  <div className="flex items-center border border-[#EBDCCB] rounded bg-white w-32">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-stone-600 hover:bg-stone-100 font-bold"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-semibold text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                      className="px-3 py-2 text-stone-600 hover:bg-stone-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Calculate City ETA
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-2 px-2.5 text-xs text-stone-800"
                  >
                    {PAKISTAN_MAJOR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#A37F37] mt-1 font-medium">
                    ⚡ {getCityDeliveryEstimate(selectedCity)}
                  </p>
                </div>
              </div>

              {/* Primary Actions: Add to Bag & Buy Now */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onAddToCart(product, selectedType, selectedType === 'stitched' ? selectedSize : undefined, quantity);
                      onClose();
                    }}
                    disabled={!product.inStock}
                    className="w-full py-3 px-4 rounded bg-[#1C1917] hover:bg-[#2b2724] text-[#DFCA95] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                    <span>Add to Shopping Bag</span>
                  </button>

                  <button
                    onClick={() => {
                      onBuyNow(product, selectedType, selectedType === 'stitched' ? selectedSize : undefined, quantity);
                      onClose();
                    }}
                    disabled={!product.inStock}
                    className="w-full py-3 px-4 rounded bg-[#C5A059] hover:bg-[#A37F37] text-stone-950 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Buy It Now (Instant)</span>
                  </button>
                </div>

                {/* Direct WhatsApp Concierge Order Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded bg-[#075E54] hover:bg-[#128C7E] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Directly via WhatsApp</span>
                </a>
              </div>

              {/* Accordions: Fabric, Care, Specifications */}
              <div className="border-t border-[#EBDCCB] pt-4 space-y-2 text-xs">
                {/* Accordion 1: Fabric & Craft */}
                <div className="border border-[#EBDCCB] rounded bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === 'fabric' ? null : 'fabric')}
                    className="w-full p-3 flex items-center justify-between font-semibold text-stone-900 hover:bg-[#FAF8F5]"
                  >
                    <span>Fabric & Artisanal Details</span>
                    {openSection === 'fabric' ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>
                  {openSection === 'fabric' && (
                    <div className="p-3.5 border-t border-[#EBDCCB] text-stone-600 space-y-2 font-light">
                      <p>{product.description}</p>
                      <p className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider mt-2">Includes:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {product.includes.map((inc, i) => (
                          <li key={i}>{inc}</li>
                        ))}
                      </ul>
                      <p className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider mt-2">Embroidery Craft:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {product.embroideryDetails.map((det, i) => (
                          <li key={i}>{det}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Delivery & Return Policy */}
                <div className="border border-[#EBDCCB] rounded bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === 'delivery' ? null : 'delivery')}
                    className="w-full p-3 flex items-center justify-between font-semibold text-stone-900 hover:bg-[#FAF8F5]"
                  >
                    <span>Nationwide Delivery & Returns</span>
                    {openSection === 'delivery' ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>
                  {openSection === 'delivery' && (
                    <div className="p-3.5 border-t border-[#EBDCCB] text-stone-600 space-y-2 font-light">
                      <p>
                        We dispatch all orders via premium couriers (TCS Express, Leopards, Trax). Free nationwide delivery on all orders exceeding Rs. 5,000.
                      </p>
                      <p>
                        <strong>Unstitched Suits:</strong> Dispatched within 24 hours.<br />
                        <strong>Stitched Pret Outfits:</strong> Dispatched in 2–4 business days.<br />
                        <strong>Returns/Exchanges:</strong> 7-day hassle-free replacement in unworn condition with brand tags intact.
                      </p>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Washing & Care */}
                <div className="border border-[#EBDCCB] rounded bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === 'washing' ? null : 'washing')}
                    className="w-full p-3 flex items-center justify-between font-semibold text-stone-900 hover:bg-[#FAF8F5]"
                  >
                    <span>Fabric Care & Washing Instructions</span>
                    {openSection === 'washing' ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>
                  {openSection === 'washing' && (
                    <div className="p-3.5 border-t border-[#EBDCCB] text-stone-600 space-y-1.5 font-light">
                      {product.careInstructions.map((c, i) => (
                        <p key={i}>• {c}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Outfits Slider */}
            {relatedProducts.length > 0 && (
              <div className="border-t border-[#EBDCCB] pt-4">
                <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Complete Your Festive Wardrobe
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {relatedProducts.slice(0, 2).map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="p-2 bg-white rounded border border-[#EBDCCB] hover:border-[#C5A059] flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <img src={rel.images[0]} alt={rel.title} className="w-10 h-12 object-cover rounded" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">{rel.title}</p>
                        <p className="text-[11px] text-[#A37F37] font-bold">{formatPrice(rel.priceStitched, currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-lg p-6 border border-[#EBDCCB] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCCB]">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">A-R Styles Standard Sizing Chart</h3>
                <p className="text-xs text-stone-500">Tailored Pakistani standard dimensions for women's pret</p>
              </div>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unit Switcher */}
            <div className="flex justify-end gap-2 my-3">
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  unit === 'inches' ? 'bg-[#1C1917] text-[#DFCA95]' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  unit === 'cm' ? 'bg-[#1C1917] text-[#DFCA95]' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#EBDCCB] text-stone-700 uppercase font-semibold">
                    <th className="py-2 px-3">Size</th>
                    <th className="py-2 px-3">Chest</th>
                    <th className="py-2 px-3">Waist</th>
                    <th className="py-2 px-3">Hips</th>
                    <th className="py-2 px-3">Shirt Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3] text-stone-600">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-stone-900">XS (Extra Small)</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '36"' : '91 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '32"' : '81 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '38"' : '96 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '40"' : '101 cm'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-stone-900">S (Small)</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '38"' : '96 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '34"' : '86 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '41"' : '104 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '42"' : '106 cm'}</td>
                  </tr>
                  <tr className="bg-[#FAF8F5]">
                    <td className="py-2.5 px-3 font-bold text-stone-900">M (Medium)</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '41"' : '104 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '37"' : '94 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '44"' : '112 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '43"' : '109 cm'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-stone-900">L (Large)</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '44"' : '112 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '40"' : '101 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '47"' : '119 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '44"' : '112 cm'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-stone-900">XL (Extra Large)</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '47"' : '119 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '43"' : '109 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '50"' : '127 cm'}</td>
                    <td className="py-2.5 px-3">{unit === 'inches' ? '44"' : '112 cm'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-stone-500 mt-4 leading-relaxed">
              *All sizes include 1.5 inches of internal margin for ease of alteration. Need bespoke customized stitching? Select "Custom" or reach out to our WhatsApp master tailor.
            </p>

            <div className="mt-4 text-right">
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="px-4 py-2 bg-[#1C1917] text-[#DFCA95] text-xs font-semibold rounded"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
