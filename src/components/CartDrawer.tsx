import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Sparkles, Check } from 'lucide-react';
import { CartItem } from '../types';
import { formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: 'PKR' | 'USD';
  onUpdateQuantity: (productId: string, type: 'stitched' | 'unstitched', size: string | undefined, qty: number) => void;
  onRemoveItem: (productId: string, type: 'stitched' | 'unstitched', size: string | undefined) => void;
  onProceedToCheckout: () => void;
  freeShippingThreshold: number;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  appliedCoupon?: string;
  discountAmount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  freeShippingThreshold,
  onApplyCoupon,
  appliedCoupon,
  discountAmount,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const estimatedShipping = isFreeShipping || items.length === 0 ? 0 : 250;
  const total = Math.max(0, subtotal - discountAmount + estimatedShipping);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const res = await onApplyCoupon(couponInput);
      setCouponMessage({ text: res.message, isError: !res.success });
      if (res.success) setCouponInput('');
    } catch {
      setCouponMessage({ text: 'Error applying promo voucher', isError: true });
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#EBDCCB] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#EBDCCB] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#A37F37]" />
              <h2 className="font-serif text-lg font-bold text-stone-900">Your Shopping Bag</h2>
              <span className="text-xs text-stone-500 font-medium">({items.length} items)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-500 hover:text-stone-900 hover:bg-[#FAF8F5]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-[#F5EFE6] border-b border-[#EBDCCB] text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-stone-800">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                {isFreeShipping ? (
                  <span className="font-bold text-emerald-800">🎉 Congratulations! You unlocked Free Delivery</span>
                ) : (
                  <span>
                    Add <strong className="text-[#A37F37]">{formatPrice(amountToFreeShipping, currency)}</strong> more for Free Shipping
                  </span>
                )}
              </span>
              <span className="text-stone-500 font-semibold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-[#E4D9CC] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C5A059] to-[#A37F37] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#EBDCCB]/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white border border-[#EBDCCB] flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <p className="font-serif text-lg font-bold text-stone-900">Your Bag is Empty</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Explore our latest Festive Pret, Luxury Lawns, or Unstitched masterworks.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#1C1917] text-[#DFCA95] text-xs font-semibold uppercase tracking-wider rounded"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.type}-${item.size}`} className="py-4 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-24 object-cover rounded border border-[#EBDCCB]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{item.title}</h4>
                        <button
                          onClick={() => onRemoveItem(item.productId, item.type, item.size)}
                          className="text-stone-400 hover:text-rose-600 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        <span className="capitalize font-medium text-[#A37F37]">{item.type}</span>
                        {item.size ? ` • Size: ${item.size}` : ''}
                      </p>
                      <p className="text-[11px] text-stone-400">{item.fabric}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#EBDCCB] rounded bg-white">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.productId, item.type, item.size, item.quantity - 1)
                          }
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.productId, item.type, item.size, item.quantity + 1)
                          }
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900">
                        {formatPrice(item.unitPrice * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#EBDCCB] space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. FESTIVE15)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 pl-8 pr-3 text-xs uppercase"
                    />
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3 py-1.5 bg-[#1C1917] text-[#DFCA95] text-xs font-semibold rounded disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Voucher <strong>{appliedCoupon}</strong> activated
                  </p>
                )}
                {couponMessage && (
                  <p className={`text-[11px] font-medium ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-[#F0EBE3] pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Voucher Discount</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Nationwide Courier Delivery</span>
                  <span>{estimatedShipping === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(estimatedShipping, currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-[#EBDCCB] pt-2">
                  <span>Total Payable</span>
                  <span className="text-base text-[#A37F37]">{formatPrice(total, currency)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-[#1C1917] hover:bg-[#2c2825] text-[#DFCA95] font-semibold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
