import React from 'react';
import { CheckCircle2, Truck, Printer, MessageCircle, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { Order } from '../types';
import { formatPrice } from '../utils/formatters';

interface OrderConfirmationModalProps {
  order: Order;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
  whatsappNumber: string;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  whatsappNumber,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-lg shadow-2xl border border-[#EBDCCB] overflow-hidden my-auto relative p-6 sm:p-8 animate-in fade-in zoom-in-95">
        {/* Success Top Icon */}
        <div className="text-center space-y-3 pb-6 border-b border-[#EBDCCB]">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-[#1C1917] text-[#DFCA95] text-xs font-mono font-bold tracking-wider uppercase">
              Order #{order.orderNumber}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
              Thank You for Your Order!
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-md mx-auto font-light">
              Your artisanal Eastern couture order has been placed successfully. A detailed confirmation receipt has been sent to <strong>{order.customer.email}</strong>.
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="my-6 bg-white p-5 rounded-md border border-[#EBDCCB] space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-[#F0EBE3]">
            <div>
              <span className="text-stone-400 block">Date</span>
              <span className="font-semibold text-stone-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block">Payment Method</span>
              <span className="font-semibold text-stone-900 uppercase">
                {(order.paymentMethod || '').replace('-', ' ')}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block">Estimated Delivery</span>
              <span className="font-semibold text-[#A37F37]">2–4 Business Days</span>
            </div>
            <div>
              <span className="text-stone-400 block">Total Amount</span>
              <span className="font-bold text-stone-900 text-sm">
                {formatPrice(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>

          {/* Items Preview */}
          <div className="space-y-2">
            <p className="font-semibold text-stone-800 uppercase tracking-wider text-[11px]">Ensemble Ordered</p>
            {order.items.map((it) => (
              <div key={`${it.productId}-${it.type}-${it.size}`} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <img src={it.image} alt={it.title} className="w-9 h-11 object-cover rounded border border-[#EBDCCB]" />
                  <div>
                    <span className="font-medium text-stone-900">{it.title}</span>
                    <span className="text-stone-400 block text-[11px] capitalize">{it.type} {it.size ? `• ${it.size}` : ''} × {it.quantity}</span>
                  </div>
                </div>
                <span className="font-semibold text-stone-900">
                  {formatPrice(it.unitPrice * it.quantity, order.currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="pt-3 border-t border-[#F0EBE3] text-stone-600">
            <span className="font-semibold text-stone-800 block text-[11px] uppercase tracking-wider mb-1">
              Dispatch Destination
            </span>
            <p className="font-medium text-stone-900">{order.customer.fullName} ({order.customer.phone})</p>
            <p>{order.customer.address}, {order.customer.city}, {order.customer.province}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.orderNumber);
              }}
              className="w-full py-3 px-4 rounded bg-[#1C1917] hover:bg-[#2c2825] text-[#DFCA95] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4 text-[#C5A059]" />
              <span>Track Parcel Live</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full py-3 px-4 rounded bg-white hover:bg-[#FAF8F5] border border-[#EBDCCB] text-stone-800 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>Print Invoice Receipt</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <a
              href={`https://wa.me/${(whatsappNumber || '+92 300 1234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi A-R Styles! I just placed order #${order.orderNumber}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#075E54] hover:underline font-semibold flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp regarding order</span>
            </a>

            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-900 underline font-medium"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
