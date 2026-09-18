import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ExternalLink,
  AlertCircle,
  Scissors,
  ArrowRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatPrice } from '../utils/formatters';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onClose?: () => void;
  currency: 'PKR' | 'USD';
}

const STEPS: { status: OrderStatus; label: string; description: string; icon: React.FC<{ className?: string }> }[] = [
  { status: 'pending', label: 'Order Placed', description: 'Received in system', icon: Clock },
  { status: 'confirmed', label: 'Order Confirmed', description: 'Inventory reserved', icon: CheckCircle2 },
  { status: 'processing', label: 'Artisanal Stitching / Packing', description: 'Tailoring & quality check', icon: Scissors },
  { status: 'dispatched', label: 'Handed to Courier', description: 'In transit via courier', icon: Truck },
  { status: 'out-for-delivery', label: 'Out for Delivery', description: 'With local courier rider', icon: Package },
  { status: 'delivered', label: 'Delivered', description: 'Successfully received', icon: MapPin },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onClose,
  currency,
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber);
  const [contactQuery, setContactQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (queryNum: string, queryContact: string) => {
    if (!queryNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(queryNum)}&contact=${encodeURIComponent(queryContact)}`
      );
      if (!res.ok) {
        throw new Error('No active order found with the provided details. Please check your Order ID.');
      }
      const data: Order = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber, '');
    }
  }, [initialOrderNumber]);

  // Live real-time multi-device sync for tracked order
  useEffect(() => {
    if (!order?.orderNumber) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/orders/track?orderNumber=${encodeURIComponent(order.orderNumber)}&contact=${encodeURIComponent(contactQuery)}`
        );
        if (res.ok) {
          const fresh = await res.json();
          setOrder(fresh);
        }
      } catch {
        // Silent sync error handling
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [order?.orderNumber, contactQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery, contactQuery);
  };

  const getStepIndex = (status: OrderStatus): number => {
    const map: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      dispatched: 3,
      'out-for-delivery': 4,
      delivered: 5,
      cancelled: -1,
    };
    return map[status] ?? 0;
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[#A37F37] font-semibold">
          Nationwide Courier Dispatch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Track Your A-R Styles Parcel
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto font-light">
          Enter your 7-character Order Number (e.g. <strong>AR-89241</strong>) and phone/email to check real-time tailoring, dispatch, and courier tracking status.
        </p>
      </div>

      {/* Search Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-4 sm:p-6 rounded-lg border border-[#EBDCCB] shadow-sm max-w-2xl mx-auto space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AR-89241"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-2 px-3 text-xs sm:text-sm font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
              Phone or Email (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 0300 1234567 or email"
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-2 px-3 text-xs sm:text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !orderQuery.trim()}
          className="w-full py-2.5 bg-[#1C1917] hover:bg-[#2b2724] text-[#DFCA95] font-semibold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Locating Parcel in Logistics Database...</span>
          ) : (
            <>
              <Search className="w-4 h-4 text-[#C5A059]" />
              <span>Track Parcel Live</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Tracking Result Card */}
      {order && (
        <div className="bg-white rounded-lg border border-[#EBDCCB] shadow-lg overflow-hidden space-y-6 p-6 sm:p-8 animate-in fade-in">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#EBDCCB]">
            <div>
              <span className="text-xs uppercase tracking-wider text-stone-400">Order Reference</span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">#{order.orderNumber}</h2>
              <p className="text-xs text-stone-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF8F5] border border-[#C5A059] text-[#A37F37]">
                Status: {(order.status || '').replace('-', ' ')}
              </span>
              {order.courierName && (
                <p className="text-xs text-stone-600 mt-1.5 font-medium">
                  Courier: <strong>{order.courierName}</strong>
                  {order.trackingNumber && ` • Tracking: ${order.trackingNumber}`}
                </p>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-4">
            <div className="relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-stone-200 -z-0">
                <div
                  className="h-full bg-[#C5A059] transition-all duration-700"
                  style={{ width: `${(Math.max(0, currentStepIdx) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps Icons */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.status} className="flex md:flex-col items-center gap-3 md:text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          isCompleted
                            ? 'bg-[#1C1917] text-[#DFCA95] border-2 border-[#C5A059]'
                            : 'bg-stone-100 text-stone-400 border border-stone-300'
                        } ${isCurrent ? 'ring-4 ring-[#C5A059]/30 scale-110' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isCompleted ? 'text-stone-900' : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-stone-500 font-light mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Courier Action Link */}
          {order.trackingNumber && (
            <div className="p-4 bg-[#FAF8F5] border border-[#EBDCCB] rounded-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-[#A37F37]" />
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    Live Courier Consignment: {order.courierName} ({order.trackingNumber})
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Estimated Delivery: 2–4 Business Days
                  </p>
                </div>
              </div>

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1C1917] hover:bg-[#2b2724] text-[#DFCA95] text-xs font-semibold rounded flex items-center gap-1.5 transition-all"
                >
                  <span>Open Courier Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Status Timeline History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="border-t border-[#EBDCCB] pt-4">
              <h3 className="font-serif text-sm font-bold text-stone-900 mb-3">Logistics Activity Log</h3>
              <div className="space-y-3">
                {order.statusHistory.map((hist, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#C5A059] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800 uppercase tracking-wider text-[11px]">
                        {(hist.status || '').replace('-', ' ')}
                      </p>
                      <p className="text-stone-500">{hist.note || 'Milestone updated'}</p>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {new Date(hist.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parcel Destination & Items */}
          <div className="border-t border-[#EBDCCB] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <p className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
                Recipient Details
              </p>
              <p className="font-medium text-stone-900">{order.customer.fullName}</p>
              <p className="text-stone-600">{order.customer.address}, {order.customer.city}</p>
              <p className="text-stone-600">Contact: {order.customer.phone}</p>
            </div>

            <div>
              <p className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
                Order Summary
              </p>
              <p className="text-stone-600">Total Items: {order.items.length}</p>
              <p className="text-stone-600">Payment: {order.paymentMethod.toUpperCase()}</p>
              <p className="font-bold text-stone-900 text-sm mt-1">
                Amount: {formatPrice(order.totalAmount, currency)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
