import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Building,
  Smartphone,
  CheckCircle2,
  Copy,
  Truck,
  Gift,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CartItem, ShippingAddress, PaymentMethod, Order, StoreSettings } from '../types';
import { formatPrice, PAKISTAN_MAJOR_CITIES } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: 'PKR' | 'USD';
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  storeSettings: StoreSettings;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  subtotal,
  discountAmount,
  couponCode,
  storeSettings,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    apartment: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: '',
    notes: '',
    isGiftWrapped: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bankRef, setBankRef] = useState('');
  const [walletRef, setWalletRef] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Calculate shipping based on city and subtotal
  const isInternational = formData.city === 'International (Overseas)';
  const isFreeShipping = !isInternational && subtotal >= storeSettings.freeShippingThreshold;
  const shippingFee = isInternational
    ? storeSettings.internationalShippingFee
    : isFreeShipping
    ? 0
    : storeSettings.standardShippingFee;

  const giftWrapFee = formData.isGiftWrapped ? 350 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee + giftWrapFee);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone / WhatsApp number is required';
    } else if ((formData.phone || '').replace(/[^0-9]/g, '').length < 10) {
      errors.phone = 'Please enter a valid 11-digit Pakistani phone number';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Valid email required for order confirmation receipt';
    }
    if (!formData.address.trim()) errors.address = 'Street address & House/Apartment # is required';
    if (!formData.city) errors.city = 'Delivery city is required';

    if (paymentMethod === 'card') {
      if (!cardNumber || (cardNumber || '').replace(/\s/g, '').length < 16) {
        errors.cardNumber = 'Enter valid 16-digit card number';
      }
      if (!cardExpiry) errors.cardExpiry = 'MM/YY required';
      if (!cardCvc || cardCvc.length < 3) errors.cardCvc = 'CVC required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer: formData,
        items,
        subtotal,
        discountAmount,
        couponCode,
        shippingFee,
        totalAmount: finalTotal,
        currency,
        paymentMethod,
        bankReferenceNumber:
          paymentMethod === 'bank-transfer'
            ? bankRef
            : paymentMethod === 'jazzcash-easypaisa'
            ? walletRef
            : undefined,
        statusHistory: [],
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to submit order');
      }

      const createdOrder: Order = await response.json();
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      alert(`Order submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FAF8F5] w-full max-w-4xl rounded-lg shadow-2xl border border-[#EBDCCB] overflow-hidden my-auto relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EBDCCB] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#C5A059] bg-[#1C1917] flex items-center justify-center text-[#C5A059] font-serif font-bold text-xs">
              A•R
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-none">
                Express Checkout
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Fast & Secure Delivery Across Pakistan & Worldwide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-[#FAF8F5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Contact info */}
            <div className="bg-white p-4 sm:p-5 rounded-md border border-[#EBDCCB] shadow-xs space-y-4">
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2 border-b border-[#F0EBE3] pb-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#DFCA95] text-xs flex items-center justify-center font-sans font-semibold">
                  1
                </span>
                <span>Customer Contact & Identification</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Malik"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full bg-[#FAF8F5] border rounded py-2 px-3 text-xs sm:text-sm ${
                      formErrors.fullName ? 'border-rose-500' : 'border-[#EBDCCB]'
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full bg-[#FAF8F5] border rounded py-2 px-3 text-xs sm:text-sm ${
                      formErrors.phone ? 'border-rose-500' : 'border-[#EBDCCB]'
                    }`}
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Used by courier rider for delivery coordination</p>
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-[#FAF8F5] border rounded py-2 px-3 text-xs sm:text-sm ${
                      formErrors.email ? 'border-rose-500' : 'border-[#EBDCCB]'
                    }`}
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Order receipt & tracking link sent here</p>
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-white p-4 sm:p-5 rounded-md border border-[#EBDCCB] shadow-xs space-y-4">
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2 border-b border-[#F0EBE3] pb-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#DFCA95] text-xs flex items-center justify-center font-sans font-semibold">
                  2
                </span>
                <span>Delivery Destination (Pakistan & International)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Street Address & House / Flat # *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House # 24, Street 9, Sector / Block..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full bg-[#FAF8F5] border rounded py-2 px-3 text-xs sm:text-sm ${
                      formErrors.address ? 'border-rose-500' : 'border-[#EBDCCB]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-2 px-3 text-xs sm:text-sm"
                  >
                    {PAKISTAN_MAJOR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Province / Region
                  </label>
                  <input
                    type="text"
                    placeholder="Punjab, Sindh, KPK, Balochistan..."
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-2 px-3 text-xs sm:text-sm"
                  >
                  </input>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Special Courier Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave parcel with gatekeeper if unavailable"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-2 px-3 text-xs sm:text-sm"
                  />
                </div>

                {/* Gift Wrap Checkbox */}
                <div className="sm:col-span-2 pt-2 border-t border-[#F0EBE3]">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isGiftWrapped}
                      onChange={(e) => setFormData({ ...formData, isGiftWrapped: e.target.checked })}
                      className="w-4 h-4 rounded text-[#A37F37] focus:ring-[#C5A059]"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-[#A37F37]" />
                        Luxury Velvet Dustbag & Satin Ribbon Gift Wrap (+Rs. 350)
                      </span>
                      <span className="text-stone-500 block">Personalized calligraphic gift card included</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Options */}
            <div className="bg-white p-4 sm:p-5 rounded-md border border-[#EBDCCB] shadow-xs space-y-4">
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2 border-b border-[#F0EBE3] pb-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#DFCA95] text-xs flex items-center justify-center font-sans font-semibold">
                  3
                </span>
                <span>Select Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#C5A059] bg-[#FAF8F5] shadow-sm'
                      : 'border-[#EBDCCB] hover:border-stone-400'
                  }`}
                >
                  <Banknote className={`w-5 h-5 mt-0.5 ${paymentMethod === 'cod' ? 'text-[#A37F37]' : 'text-stone-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-stone-500">Pay cash upon parcel handover</p>
                  </div>
                </div>

                {/* Option 2: Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('bank-transfer')}
                  className={`p-3.5 rounded border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === 'bank-transfer'
                      ? 'border-[#C5A059] bg-[#FAF8F5] shadow-sm'
                      : 'border-[#EBDCCB] hover:border-stone-400'
                  }`}
                >
                  <Building className={`w-5 h-5 mt-0.5 ${paymentMethod === 'bank-transfer' ? 'text-[#A37F37]' : 'text-stone-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Direct Bank Transfer</p>
                    <p className="text-[11px] text-stone-500">Meezan / HBL / Alfalah IBAN</p>
                  </div>
                </div>

                {/* Option 3: JazzCash / Easypaisa */}
                <div
                  onClick={() => setPaymentMethod('jazzcash-easypaisa')}
                  className={`p-3.5 rounded border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === 'jazzcash-easypaisa'
                      ? 'border-[#C5A059] bg-[#FAF8F5] shadow-sm'
                      : 'border-[#EBDCCB] hover:border-stone-400'
                  }`}
                >
                  <Smartphone className={`w-5 h-5 mt-0.5 ${paymentMethod === 'jazzcash-easypaisa' ? 'text-[#A37F37]' : 'text-stone-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-stone-900">JazzCash / Easypaisa</p>
                    <p className="text-[11px] text-stone-500">Mobile wallet instant transfer</p>
                  </div>
                </div>

                {/* Option 4: Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#C5A059] bg-[#FAF8F5] shadow-sm'
                      : 'border-[#EBDCCB] hover:border-stone-400'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mt-0.5 ${paymentMethod === 'card' ? 'text-[#A37F37]' : 'text-stone-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Credit / Debit Card</p>
                    <p className="text-[11px] text-stone-500">Visa, Mastercard & UnionPay</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Method Details */}
              {paymentMethod === 'bank-transfer' && (
                <div className="p-4 bg-[#FAF8F5] border border-[#EBDCCB] rounded text-xs space-y-3">
                  <p className="font-semibold text-stone-900">Please transfer payment to our official account:</p>
                  <div className="space-y-1.5 text-stone-700 bg-white p-3 rounded border border-[#EBDCCB]">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Bank:</span>
                      <span className="font-bold">{storeSettings.bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Title:</span>
                      <span className="font-bold">{storeSettings.bankDetails.accountTitle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Account #:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold">{storeSettings.bankDetails.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(storeSettings.bankDetails.accountNumber, 'acc')}
                          className="p-1 hover:text-[#A37F37]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">IBAN:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[11px]">{storeSettings.bankDetails.iban}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(storeSettings.bankDetails.iban, 'iban')}
                          className="p-1 hover:text-[#A37F37]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {copiedField && (
                    <p className="text-[11px] text-emerald-700 font-medium">✓ Copied {copiedField.toUpperCase()} to clipboard</p>
                  )}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Transaction / Transfer Reference ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TRX-984214"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'jazzcash-easypaisa' && (
                <div className="p-4 bg-[#FAF8F5] border border-[#EBDCCB] rounded text-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-[#EBDCCB]">
                      <p className="font-bold text-stone-900 text-[11px] uppercase">JazzCash</p>
                      <p className="text-sm font-mono font-bold mt-1 text-[#A37F37]">{storeSettings.mobileWalletDetails.jazzCashNumber}</p>
                      <p className="text-[10px] text-stone-500">{storeSettings.mobileWalletDetails.jazzCashTitle}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-[#EBDCCB]">
                      <p className="font-bold text-stone-900 text-[11px] uppercase">Easypaisa</p>
                      <p className="text-sm font-mono font-bold mt-1 text-[#A37F37]">{storeSettings.mobileWalletDetails.easypaisaNumber}</p>
                      <p className="text-[10px] text-stone-500">{storeSettings.mobileWalletDetails.easypaisaTitle}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Wallet Sender Phone / Transaction ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 03001234567 or TID 998811"
                      value={walletRef}
                      onChange={(e) => setWalletRef(e.target.value)}
                      className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 bg-[#FAF8F5] border border-[#EBDCCB] rounded text-xs space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">Card Number *</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Expiry Date *</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Security CVC *</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    256-Bit SSL Encrypted Instant Payment Gateway
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Review */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs space-y-4 sticky top-4">
              <h3 className="font-serif text-base font-bold text-stone-900 border-b border-[#F0EBE3] pb-2">
                Order Review ({items.length} items)
              </h3>

              {/* Items Mini List */}
              <div className="divide-y divide-[#F0EBE3] max-h-56 overflow-y-auto pr-1 text-xs">
                {items.map((it) => (
                  <div key={`${it.productId}-${it.type}-${it.size}`} className="py-2.5 flex items-center gap-3">
                    <img src={it.image} alt={it.title} className="w-12 h-14 object-cover rounded border border-[#EBDCCB]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 truncate">{it.title}</p>
                      <p className="text-[11px] text-stone-500 capitalize">{it.type} {it.size ? `• ${it.size}` : ''} × {it.quantity}</p>
                    </div>
                    <span className="font-semibold text-stone-900">
                      {formatPrice(it.unitPrice * it.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 text-xs border-t border-[#F0EBE3] pt-3 text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">{formatPrice(subtotal, currency)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount Voucher ({couponCode})</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Courier Delivery ({formData.city})</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(shippingFee, currency)}</span>
                </div>

                {formData.isGiftWrapped && (
                  <div className="flex justify-between">
                    <span>Gift Packaging</span>
                    <span>{formatPrice(giftWrapFee, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-[#EBDCCB] pt-2">
                  <span>Net Payable Amount</span>
                  <span className="text-base text-[#A37F37] font-serif font-bold">
                    {formatPrice(finalTotal, currency)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#1C1917] hover:bg-[#2b2724] text-[#DFCA95] font-semibold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Order & Generating Tracking...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-stone-500 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#A37F37]" />
                  Estimated Delivery: 2–4 Business Days
                </p>
                <p>Dual email receipt will be dispatched immediately</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
