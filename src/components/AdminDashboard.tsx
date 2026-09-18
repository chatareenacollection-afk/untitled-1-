import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  Mail,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Truck,
  ExternalLink,
  Printer,
  Sparkles,
  AlertTriangle,
  RotateCw,
  Search,
  FolderTree,
  Layers,
} from 'lucide-react';
import {
  Product,
  Order,
  CustomerRecord,
  Coupon,
  StoreSettings,
  EmailGatewayConfig,
  EmailLog,
  OrderStatus,
  ProductCategory,
  FabricType,
  CategoryItem,
} from '../types';
import { formatPrice, formatDate } from '../utils/formatters';
import { ImageUploader } from './ImageUploader';
import { CategoryManager } from './CategoryManager';

interface AdminDashboardProps {
  onClose: () => void;
  currency: 'PKR' | 'USD';
  storeSettings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onProductsUpdated: () => void;
  onCategoriesUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  currency,
  storeSettings,
  onUpdateSettings,
  onProductsUpdated,
  onCategoriesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'categories' | 'orders' | 'coupons' | 'customers' | 'settings' | 'email'
  >('analytics');

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);

  // Products & Categories state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('pret');
  const [selectedCatLabel, setSelectedCatLabel] = useState<string>('Ready-to-Wear / Pret');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('TCS Express');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(15);
  const [newCouponMin, setNewCouponMin] = useState(5000);

  // Customers state
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  // Settings state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);

  // Email Config & Logs
  const [emailConfig, setEmailConfig] = useState<EmailGatewayConfig | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testEmailResult, setTestEmailResult] = useState<any>(null);
  const [testingEmail, setTestingEmail] = useState(false);

  // General Loading & Notification
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const prevOrdersCountRef = useRef<number | null>(null);
  const [lastSyncedText, setLastSyncedText] = useState('Just now');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio autoplay policy safety
    }
  };

  const safeFetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
    try {
      const r = await fetch(url);
      if (!r.ok) return fallback;
      const text = await r.text();
      if (!text) return fallback;
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  };

  // Fetch data with multi-device synchronization
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [resAna, resProd, resCat, resOrd, resCoup, resCust, resEmail, resLogs] = await Promise.all([
        safeFetchJson('/api/analytics', null),
        safeFetchJson<Product[]>('/api/products', []),
        safeFetchJson<CategoryItem[]>('/api/categories', []),
        safeFetchJson<Order[]>('/api/orders', []),
        safeFetchJson<Coupon[]>('/api/coupons', []),
        safeFetchJson<CustomerRecord[]>('/api/customers', []),
        safeFetchJson<EmailGatewayConfig | null>('/api/email/config', null),
        safeFetchJson<any[]>('/api/email/logs', []),
      ]);

      if (resAna) setAnalytics(resAna);
      if (Array.isArray(resProd) && resProd.length > 0) setProducts(resProd);
      if (Array.isArray(resCat) && resCat.length > 0) setCategories(resCat);

      if (Array.isArray(resOrd)) {
        if (prevOrdersCountRef.current !== null && resOrd.length > prevOrdersCountRef.current) {
          const diff = resOrd.length - prevOrdersCountRef.current;
          const latest = resOrd[0];
          playOrderChime();
          showToast(`🔔 ${diff} new order received! #${latest?.orderNumber || ''} (${latest?.customer?.fullName || ''})`);
        }
        prevOrdersCountRef.current = resOrd.length;
        setOrders(resOrd);
      }

      if (Array.isArray(resCoup) && resCoup.length > 0) setCoupons(resCoup);
      if (Array.isArray(resCust)) setCustomers(resCust);
      if (resEmail) setEmailConfig(resEmail);
      if (Array.isArray(resLogs)) setEmailLogs(resLogs);
      setLastSyncedText('Just now');
    } catch {
      // Safe fallback for multi-device background polling
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);

    // Continuous 3-second multi-device synchronization
    const syncInterval = setInterval(() => {
      loadData(true);
    }, 3000);

    const handleFocus = () => {
      loadData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // PRODUCT ACTIONS
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (productImages.length === 0) {
      alert('Please upload at least one picture for this ensemble.');
      return;
    }

    const catId = (formData.get('category') as string) || selectedCatId || 'pret';
    const foundCat = categories.find((c) => c.id === catId);
    const catLabel = (formData.get('categoryLabel') as string) || foundCat?.name || selectedCatLabel || 'Ready-to-Wear / Pret';
    const stockCountVal = Number(formData.get('stockCount')) || 10;
    const inStockVal = formData.get('inStock') === 'on' || stockCountVal > 0;

    const productPayload = {
      title: (formData.get('title') as string) || 'Bespoke Couture Ensemble',
      subtitle: (formData.get('subtitle') as string) || '',
      sku: (formData.get('sku') as string) || `ARS-${Date.now().toString().slice(-5)}`,
      category: catId,
      categoryLabel: catLabel,
      priceUnstitched: Number(formData.get('priceUnstitched')) || 0,
      priceStitched: Number(formData.get('priceStitched')) || 0,
      originalPrice: Number(formData.get('originalPrice')) || undefined,
      discountPercentage: Number(formData.get('discountPercentage')) || 0,
      fabric: (formData.get('fabric') as FabricType) || 'Raw Silk',
      color: (formData.get('color') as string) || 'Gold / Ivory',
      colorHex: (formData.get('colorHex') as string) || '#C5A059',
      images: productImages.length > 0 ? productImages : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'],
      description: (formData.get('description') as string) || 'Mastercrafted with artisanal finesse from premium luxury fabric.',
      embroideryDetails: (formData.get('embroideryDetails') as string || '')
        .split('\n')
        .filter((l) => l.trim()),
      includes: (formData.get('includes') as string || '').split('\n').filter((l) => l.trim()),
      careInstructions: ['Dry clean recommended', 'Steam iron at low temperature'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      inStock: inStockVal,
      stockCount: stockCountVal,
      rating: editingProduct?.rating || 5.0,
      reviewCount: editingProduct?.reviewCount || 1,
    };

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload),
        });
        if (!res.ok) throw new Error('Update failed');
        showToast('Product updated successfully');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload),
        });
        if (!res.ok) throw new Error('Create failed');
        showToast('New product added to catalog');
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      loadData();
      onProductsUpdated();
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from catalog?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Product deleted');
      loadData();
      onProductsUpdated();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ORDER STATUS UPDATE
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, courier?: string, tracking?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          courierName: courier,
          trackingNumber: tracking,
          trackingUrl: tracking ? `https://www.tcsexpress.com/tracking?track=${tracking}` : undefined,
          note: `Admin updated status to ${status.toUpperCase()}`,
        }),
      });
      if (!res.ok) throw new Error('Status update failed');
      showToast(`Order updated to ${status}`);
      loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = await res.json();
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // COUPON ACTIONS
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode,
          discountType: newCouponType,
          discountValue: newCouponValue,
          minOrderAmount: newCouponMin,
          expiryDate: '2026-12-31',
          isActive: true,
        }),
      });
      if (!res.ok) throw new Error('Coupon creation failed');
      setNewCouponCode('');
      showToast('Voucher coupon created');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      showToast('Coupon removed');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // SETTINGS ACTIONS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const updated = await res.json();
      onUpdateSettings(updated);
      showToast('Store settings saved successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // EMAIL CONFIG ACTIONS
  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailConfig) return;
    try {
      const res = await fetch('/api/email/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig),
      });
      if (!res.ok) throw new Error('Failed to save email configuration');
      showToast('Email delivery settings saved');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailRecipient.trim()) {
      alert('Please enter an email address to receive the test verification');
      return;
    }
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: testEmailRecipient }),
      });
      const data = await res.json();
      setTestEmailResult(data);
      loadData(); // reload email logs
    } catch (err: any) {
      setTestEmailResult({ success: false, message: err.message });
    } finally {
      setTestingEmail(false);
    }
  };

  const applyEmailPreset = (preset: 'resend' | 'brevo' | 'gmail') => {
    if (!emailConfig) return;
    if (preset === 'resend') {
      setEmailConfig({
        ...emailConfig,
        provider: 'resend',
        senderEmail: 'orders@arstyles.pk',
        senderName: 'A-R Styles Couture',
      });
    } else if (preset === 'brevo') {
      setEmailConfig({
        ...emailConfig,
        provider: 'brevo',
        senderEmail: 'orders@arstyles.pk',
        senderName: 'A-R Styles Couture',
      });
    } else if (preset === 'gmail') {
      setEmailConfig({
        ...emailConfig,
        provider: 'gmail-smtp',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 465,
        smtpSecure: true,
      });
    }
  };

  const filteredOrders =
    orderFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === orderFilter);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-[#1C1917] text-[#FAF8F5] px-6 py-3.5 border-b border-[#C5A059]/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded border border-[#C5A059] bg-stone-900 flex items-center justify-center text-[#C5A059] font-serif font-bold text-sm">
            A•R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold tracking-wide text-white">
                A-R Styles Executive Portal
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-medium border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Multi-Device Sync Active
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Real-Time Boutique Operations, Logistics & Multi-Device Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {toastMessage && (
            <div className="px-3 py-1 bg-emerald-800 text-emerald-100 rounded text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-900/90 px-2.5 py-1 rounded border border-stone-800">
            <span>Synced:</span>
            <span className="text-emerald-400 font-semibold">{lastSyncedText}</span>
          </div>

          <button
            onClick={() => loadData(false)}
            disabled={loading}
            className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs border border-stone-700 cursor-pointer"
            title="Force refresh database records from all devices"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span className="hidden sm:inline">Sync Now</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded text-xs font-semibold border border-stone-600 flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Lock & Exit</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden bg-[#FAF8F5]">
        {/* Sidebar Tabs */}
        <aside className="w-56 sm:w-64 bg-white border-r border-[#EBDCCB] flex flex-col p-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
              activeTab === 'analytics'
                ? 'bg-[#1C1917] text-[#DFCA95]'
                : 'text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#C5A059]" />
            <span>Overview Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold flex items-center justify-between transition-all text-left ${
              activeTab === 'products'
                ? 'bg-[#1C1917] text-[#DFCA95]'
                : 'text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-[#C5A059]" />
              <span>Products Catalog</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-mono">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold flex items-center justify-between transition-all text-left ${
              activeTab === 'categories'
                ? 'bg-[#1C1917] text-[#DFCA95]'
                : 'text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderTree className="w-4 h-4 text-[#C5A059]" />
              <span>Categories & Edits</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-mono">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold flex items-center justify-between transition-all text-left ${
              activeTab === 'orders'
                ? 'bg-[#1C1917] text-[#DFCA95]'
                : 'text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
              <span>Orders & Courier</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-mono">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
              activeTab === 'coupons'
                ? 'bg-[#1C1917] text-[#DFCA95]'
                : 'text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <Tag className="w-4 h-4 text-[#C5A059]" />
            <span>Vouchers & Promos</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
              activeTab === 'customers'
                ? 'bg-[#1C1917] text-[#DFCA95]'
                : 'text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <Users className="w-4 h-4 text-[#C5A059]" />
            <span>Customer Registry</span>
          </button>

          <div className="pt-4 mt-2 border-t border-[#EBDCCB]">
            <span className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Configuration
            </span>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full py-2.5 px-3 rounded text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'settings'
                  ? 'bg-[#1C1917] text-[#DFCA95]'
                  : 'text-stone-700 hover:bg-[#FAF8F5]'
              }`}
            >
              <Settings className="w-4 h-4 text-[#C5A059]" />
              <span>Store & Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`w-full py-2.5 px-3 rounded text-xs font-semibold flex items-center justify-between transition-all text-left ${
                activeTab === 'email'
                  ? 'bg-[#1C1917] text-[#DFCA95]'
                  : 'text-stone-700 hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A059]" />
                <span>Email Gateway</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Boutique Executive Overview</h2>
                <p className="text-xs text-stone-500">Real-time revenue, orders velocity, and inventory alerts</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <p className="font-serif text-2xl font-bold text-stone-900 mt-1">
                    {formatPrice(analytics?.totalRevenue || 0, currency)}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-block">
                    ↑ Verified across all channels
                  </span>
                </div>

                <div className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Total Orders
                  </span>
                  <p className="font-serif text-2xl font-bold text-stone-900 mt-1">
                    {analytics?.totalOrders || 0}
                  </p>
                  <span className="text-[11px] text-stone-500 mt-1 inline-block">
                    Avg Order Value: {formatPrice(analytics?.averageOrderValue || 0, currency)}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Pending Dispatches
                  </span>
                  <p className="font-serif text-2xl font-bold text-[#A37F37] mt-1">
                    {analytics?.pendingDispatches || 0}
                  </p>
                  <span className="text-[11px] text-stone-500 mt-1 inline-block">
                    Requires packaging or courier pickup
                  </span>
                </div>

                <div className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Registered Clients
                  </span>
                  <p className="font-serif text-2xl font-bold text-stone-900 mt-1">
                    {analytics?.totalCustomers || 0}
                  </p>
                  <span className="text-[11px] text-stone-500 mt-1 inline-block">
                    Pakistan & Overseas Couture Buyers
                  </span>
                </div>
              </div>

              {/* Low Stock Warnings */}
              {analytics?.lowStockProducts && analytics.lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Low Inventory Alerts ({analytics.lowStockProducts.length} items)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {analytics.lowStockProducts.map((p: Product) => (
                      <div key={p.id} className="p-2 bg-white rounded border border-amber-200 flex items-center justify-between">
                        <span className="font-medium text-stone-900 truncate">{p.title}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono font-bold text-[11px]">
                          {p.stockCount} left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders Quick Table */}
              <div className="bg-white rounded-md border border-[#EBDCCB] overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[#EBDCCB] flex justify-between items-center">
                  <h3 className="font-serif text-sm font-bold text-stone-900">Recent Customer Placed Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#A37F37] font-semibold hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>
                <div className="divide-y divide-[#F0EBE3] text-xs">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5]">
                      <div>
                        <span className="font-mono font-bold text-stone-900">#{o.orderNumber}</span>
                        <span className="text-stone-500 ml-2 font-medium">{o.customer.fullName} ({o.customer.city})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-700">
                          {o.status}
                        </span>
                        <span className="font-bold text-stone-900">
                          {formatPrice(o.totalAmount, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">Product Catalog Management</h2>
                  <p className="text-xs text-stone-500">Edit prices, fabrics, stock inventory, and images</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductImages([
                      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
                    ]);
                    setSelectedCatId(categories[0]?.id || 'pret');
                    setSelectedCatLabel(categories[0]?.name || 'Ready-to-Wear / Pret');
                    setProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-[#DFCA95] text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#C5A059]" />
                  <span>Add New Ensemble</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-md border border-[#EBDCCB] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EBDCCB] text-stone-600 uppercase font-semibold">
                      <th className="p-3">Outfit</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Fabric</th>
                      <th className="p-3">Unstitched</th>
                      <th className="p-3">Stitched</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]">
                        <td className="p-3 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.title} className="w-10 h-12 object-cover rounded border border-[#EBDCCB]" />
                          <div>
                            <p className="font-semibold text-stone-900">{p.title}</p>
                            <p className="text-[11px] text-stone-400 font-mono">SKU: {p.sku}</p>
                          </div>
                        </td>
                        <td className="p-3 text-stone-700 capitalize">{p.category}</td>
                        <td className="p-3 font-medium text-[#A37F37]">{p.fabric}</td>
                        <td className="p-3 font-semibold">{formatPrice(p.priceUnstitched, currency)}</td>
                        <td className="p-3 font-bold text-stone-900">{formatPrice(p.priceStitched, currency)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              p.stockCount <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stockCount} units
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setProductImages(p.images && p.images.length > 0 ? p.images : []);
                              setSelectedCatId(p.category || 'pret');
                              setSelectedCatLabel(p.categoryLabel || categories.find((c) => c.id === p.category)?.name || 'Ready-to-Wear / Pret');
                              setProductModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 rounded cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES & EDITS */}
          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              products={products}
              onRefresh={() => {
                loadData(false);
                if (onCategoriesUpdated) onCategoriesUpdated();
              }}
              showToast={showToast}
            />
          )}

          {/* TAB 3: ORDERS & COURIER */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">Orders & Courier Fulfillment</h2>
                  <p className="text-xs text-stone-500">Manage order statuses, courier tracking IDs, and packing slips</p>
                </div>

                {/* Status Filter */}
                <div className="flex gap-1 bg-white p-1 rounded border border-[#EBDCCB] text-xs">
                  {(['all', 'pending', 'confirmed', 'processing', 'dispatched', 'delivered'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1 rounded capitalize font-medium ${
                        orderFilter === st ? 'bg-[#1C1917] text-[#DFCA95]' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List Table */}
              <div className="bg-white rounded-md border border-[#EBDCCB] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EBDCCB] text-stone-600 uppercase font-semibold">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                        <td className="p-3 font-mono font-bold text-stone-900">#{ord.orderNumber}</td>
                        <td className="p-3">
                          <p className="font-semibold text-stone-900">{ord.customer.fullName}</p>
                          <p className="text-[11px] text-stone-400">{ord.customer.phone}</p>
                        </td>
                        <td className="p-3 font-medium text-stone-700">{ord.customer.city}</td>
                        <td className="p-3 text-stone-600">{ord.items.length} items</td>
                        <td className="p-3 font-bold text-stone-900">{formatPrice(ord.totalAmount, currency)}</td>
                        <td className="p-3 uppercase text-[11px] font-semibold text-stone-600">
                          {(ord.paymentMethod || '').replace('-', ' ')}
                        </td>
                        <td className="p-3">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="bg-[#FAF8F5] border border-[#EBDCCB] rounded px-2 py-1 text-xs font-semibold capitalize"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing / Stitching</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setDispatchModalOrder(ord);
                              setCourierName(ord.courierName || 'TCS Express');
                              setTrackingNumber(ord.trackingNumber || '');
                            }}
                            className="px-2 py-1 bg-white border border-[#EBDCCB] hover:border-[#C5A059] rounded text-[11px] font-semibold text-[#A37F37]"
                            title="Assign Courier"
                          >
                            Courier
                          </button>
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-2 py-1 bg-[#1C1917] text-[#DFCA95] rounded text-[11px] font-semibold"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Vouchers & Promotional Codes</h2>
                <p className="text-xs text-stone-500">Create percentage or flat PKR discounts for promotional marketing</p>
              </div>

              {/* Create coupon form */}
              <form onSubmit={handleAddCoupon} className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs space-y-4">
                <h3 className="font-serif text-sm font-bold text-stone-900">Create New Voucher</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EID2026"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs font-mono uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Discount Type</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                    >
                      <option value="percentage">Percentage (% OFF)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Value *</label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Min Order (Rs.)</label>
                    <input
                      type="number"
                      required
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(Number(e.target.value))}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1917] text-[#DFCA95] rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#C5A059]" />
                  <span>Activate Voucher</span>
                </button>
              </form>

              {/* Coupons List */}
              <div className="bg-white rounded-md border border-[#EBDCCB] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EBDCCB] text-stone-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Code</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Redeemed</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td className="p-3 font-mono font-bold text-stone-900">{c.code}</td>
                        <td className="p-3 font-semibold text-emerald-700">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `Rs. ${c.discountValue.toLocaleString()} OFF`}
                        </td>
                        <td className="p-3 text-stone-600">Rs. {c.minOrderAmount.toLocaleString()}</td>
                        <td className="p-3 text-stone-600">{c.usedCount} times</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER REGISTRY */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Client Registry</h2>
                <p className="text-xs text-stone-500">Customer spend histories, verified phone contacts, and delivery locations</p>
              </div>

              <div className="bg-white rounded-md border border-[#EBDCCB] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EBDCCB] text-stone-600 uppercase font-semibold">
                      <th className="p-3">Customer</th>
                      <th className="p-3">Phone (WhatsApp)</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Lifetime Spend</th>
                      <th className="p-3">Last Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="p-3">
                          <p className="font-semibold text-stone-900">{c.fullName}</p>
                          <p className="text-[11px] text-stone-400">{c.email}</p>
                        </td>
                        <td className="p-3 font-mono text-stone-700">{c.phone}</td>
                        <td className="p-3 text-stone-700">{c.city}</td>
                        <td className="p-3 font-semibold">{c.totalOrders}</td>
                        <td className="p-3 font-bold text-[#A37F37]">{formatPrice(c.totalSpent, currency)}</td>
                        <td className="p-3 text-stone-500">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: STORE & PAYMENT SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Store & Payment Settings</h2>
                <p className="text-xs text-stone-500">Configure shipping rates, WhatsApp number, and direct bank details</p>
              </div>

              <div className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs space-y-4 text-xs">
                <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-[#F0EBE3] pb-2">
                  General Boutique Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Top Announcement Text</label>
                    <input
                      type="text"
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-[#F0EBE3] pb-2 pt-2">
                  Nationwide Logistics & Shipping Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Free Delivery Threshold (Rs.)</label>
                    <input
                      type="number"
                      value={settingsForm.freeShippingThreshold}
                      onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Standard Courier Fee (Rs.)</label>
                    <input
                      type="number"
                      value={settingsForm.standardShippingFee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, standardShippingFee: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">International DHL Fee (Rs.)</label>
                    <input
                      type="number"
                      value={settingsForm.internationalShippingFee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, internationalShippingFee: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-[#F0EBE3] pb-2 pt-2">
                  Official Bank Account Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={settingsForm.bankDetails.bankName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: { ...settingsForm.bankDetails, bankName: e.target.value } })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Account Title</label>
                    <input
                      type="text"
                      value={settingsForm.bankDetails.accountTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: { ...settingsForm.bankDetails, accountTitle: e.target.value } })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={settingsForm.bankDetails.accountNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: { ...settingsForm.bankDetails, accountNumber: e.target.value } })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">IBAN</label>
                    <input
                      type="text"
                      value={settingsForm.bankDetails.iban}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: { ...settingsForm.bankDetails, iban: e.target.value } })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-[#F0EBE3] pb-2 pt-2">
                  JazzCash & Easypaisa Mobile Wallets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">JazzCash Number</label>
                    <input
                      type="text"
                      value={settingsForm.mobileWalletDetails.jazzCashNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, mobileWalletDetails: { ...settingsForm.mobileWalletDetails, jazzCashNumber: e.target.value } })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Easypaisa Number</label>
                    <input
                      type="text"
                      value={settingsForm.mobileWalletDetails.easypaisaNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, mobileWalletDetails: { ...settingsForm.mobileWalletDetails, easypaisaNumber: e.target.value } })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EBDCCB]">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1C1917] hover:bg-stone-800 text-[#DFCA95] rounded text-xs font-semibold shadow-sm"
                  >
                    Save Store Settings
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 7: EMAIL DELIVERY GATEWAY */}
          {activeTab === 'email' && emailConfig && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Dual Email Dispatch System</h2>
                <p className="text-xs text-stone-500">
                  Primary Resend / Brevo HTTPS API (Port 443) with secondary SMTP (Gmail App Password, Hostinger, Port 465 SSL)
                </p>
              </div>

              {/* 1-Click Quick Provider Presets */}
              <div className="bg-white p-4 rounded-md border border-[#EBDCCB] shadow-xs">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-2">
                  1-Click Gateway Presets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => applyEmailPreset('resend')}
                    className={`p-3 rounded border text-left transition-all ${
                      emailConfig.provider === 'resend' ? 'border-[#C5A059] bg-[#FAF8F5] shadow-xs' : 'border-[#EBDCCB] hover:border-stone-400'
                    }`}
                  >
                    <p className="font-bold text-stone-900">Resend (HTTPS API)</p>
                    <p className="text-[11px] text-stone-500">Port 443 HTTPS. 100% cloud deliverability.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyEmailPreset('brevo')}
                    className={`p-3 rounded border text-left transition-all ${
                      emailConfig.provider === 'brevo' ? 'border-[#C5A059] bg-[#FAF8F5] shadow-xs' : 'border-[#EBDCCB] hover:border-stone-400'
                    }`}
                  >
                    <p className="font-bold text-stone-900">Brevo (HTTPS API)</p>
                    <p className="text-[11px] text-stone-500">Fast REST API with 300 free emails/day.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyEmailPreset('gmail')}
                    className={`p-3 rounded border text-left transition-all ${
                      emailConfig.provider === 'gmail-smtp' ? 'border-[#C5A059] bg-[#FAF8F5] shadow-xs' : 'border-[#EBDCCB] hover:border-stone-400'
                    }`}
                  >
                    <p className="font-bold text-stone-900">Gmail App Password (SMTP)</p>
                    <p className="text-[11px] text-stone-500">Port 465 SSL via Google Workspace.</p>
                  </button>
                </div>
              </div>

              {/* Config Form */}
              <form onSubmit={handleSaveEmailConfig} className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Active Provider</label>
                    <select
                      value={emailConfig.provider}
                      onChange={(e) => setEmailConfig({ ...emailConfig, provider: e.target.value as any })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-medium"
                    >
                      <option value="resend">Resend HTTPS API (Port 443)</option>
                      <option value="brevo">Brevo HTTPS API (Port 443)</option>
                      <option value="gmail-smtp">Gmail SMTP (SSL 465)</option>
                      <option value="custom-smtp">Custom Hostinger/Titan SMTP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Store Owner Notification Email</label>
                    <input
                      type="email"
                      value={emailConfig.notificationEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, notificationEmail: e.target.value })}
                      placeholder="chatareenacollection@gmail.com"
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Sender Brand Name</label>
                    <input
                      type="text"
                      value={emailConfig.senderName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Sender Email Address</label>
                    <input
                      type="email"
                      value={emailConfig.senderEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                    />
                  </div>

                  {/* HTTPS API Key */}
                  {(emailConfig.provider === 'resend' || emailConfig.provider === 'brevo') && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        {emailConfig.provider === 'resend' ? 'Resend API Key (re_...)' : 'Brevo API Key (xkeysib-...)'}
                      </label>
                      <input
                        type="password"
                        value={emailConfig.apiKey || ''}
                        onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                        placeholder="Paste your API key here"
                        className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                      />
                    </div>
                  )}

                  {/* SMTP Settings */}
                  {(emailConfig.provider === 'gmail-smtp' || emailConfig.provider === 'custom-smtp') && (
                    <>
                      <div>
                        <label className="block font-semibold uppercase text-stone-700 mb-1">SMTP Host</label>
                        <input
                          type="text"
                          value={emailConfig.smtpHost || ''}
                          onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                          placeholder="smtp.gmail.com"
                          className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase text-stone-700 mb-1">SMTP Port</label>
                        <input
                          type="number"
                          value={emailConfig.smtpPort || 465}
                          onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: Number(e.target.value) })}
                          className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase text-stone-700 mb-1">SMTP Username / Email</label>
                        <input
                          type="text"
                          value={emailConfig.smtpUser || ''}
                          onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                          placeholder="your-email@gmail.com"
                          className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase text-stone-700 mb-1">SMTP App Password</label>
                        <input
                          type="password"
                          value={emailConfig.smtpPass || ''}
                          onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                          placeholder="16-character Google App Password"
                          className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1C1917] hover:bg-stone-800 text-[#DFCA95] rounded font-semibold text-xs"
                  >
                    Save Email Configuration
                  </button>
                </div>
              </form>

              {/* Live Test Verification Section */}
              <div className="bg-white p-5 rounded-md border border-[#EBDCCB] shadow-xs space-y-3 text-xs">
                <h3 className="font-serif text-sm font-bold text-stone-900">Live Gateway Verification Test</h3>
                <p className="text-stone-500">
                  Send a verification dispatch to any email address to test deliverability and SSL handshakes.
                </p>

                <div className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    placeholder="Enter test recipient email..."
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#EBDCCB] rounded py-2 px-3"
                  />
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#A37F37] text-stone-950 font-bold rounded cursor-pointer disabled:opacity-50"
                  >
                    {testingEmail ? 'Dispatching...' : 'Send Test Verification'}
                  </button>
                </div>

                {testEmailResult && (
                  <div
                    className={`p-3 rounded border text-xs ${
                      testEmailResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <p className="font-bold">
                      {testEmailResult.success ? '✓ Verification Successful' : '✕ Verification Failed'}
                    </p>
                    <p className="mt-0.5">{testEmailResult.message}</p>
                    <p className="text-[11px] opacity-80 mt-1">Provider: {testEmailResult.provider} • Mode: {testEmailResult.mode}</p>
                  </div>
                )}
              </div>

              {/* Email Dispatch Logs */}
              <div className="bg-white rounded-md border border-[#EBDCCB] overflow-hidden shadow-xs space-y-2">
                <div className="p-4 border-b border-[#EBDCCB] flex justify-between items-center">
                  <h3 className="font-serif text-sm font-bold text-stone-900">Email Gateway Dispatch History</h3>
                  <span className="text-xs text-stone-400 font-mono">{emailLogs.length} logged dispatches</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#EBDCCB] text-stone-600 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Time</th>
                        <th className="p-3">Recipient</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Provider</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE3]">
                      {emailLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="p-3 text-stone-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 font-medium text-stone-900">{log.recipient}</td>
                          <td className="p-3 text-stone-700 truncate max-w-xs">{log.subject}</td>
                          <td className="p-3 text-stone-500 font-mono text-[11px]">{log.provider}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                log.status === 'sent'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'simulated'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-lg p-6 border border-[#EBDCCB] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#EBDCCB]">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingProduct ? 'Edit Couture Ensemble' : 'Add New Ensemble'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="p-1 hover:bg-stone-200 rounded">
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Ensemble Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingProduct?.title || ''}
                    placeholder="e.g. Noor-e-Zarin Embroidered Raw Silk Kurta Set"
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    defaultValue={editingProduct?.subtitle || ''}
                    placeholder="Lustrous tilla embroidery with organza borders"
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    defaultValue={editingProduct?.sku || `ARS-${Math.floor(100 + Math.random() * 900)}`}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold uppercase text-stone-700">Category Collection *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setProductModalOpen(false);
                        setActiveTab('categories');
                      }}
                      className="text-[#A37F37] hover:underline font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Create / Edit Categories</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <select
                        name="category"
                        value={selectedCatId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedCatId(val);
                          const found = categories.find((c) => c.id === val);
                          if (found) setSelectedCatLabel(found.name);
                        }}
                        className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs font-semibold"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="categoryLabel"
                        value={selectedCatLabel}
                        onChange={(e) => setSelectedCatLabel(e.target.value)}
                        placeholder="Display Label (e.g. Ready-to-Wear / Pret)"
                        className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Fabric Type *</label>
                  <select
                    name="fabric"
                    defaultValue={editingProduct?.fabric || 'Raw Silk'}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5"
                  >
                    <option value="Raw Silk">Raw Silk</option>
                    <option value="Pure Silk">Pure Silk</option>
                    <option value="Chiffon">Chiffon</option>
                    <option value="Lawn">Lawn</option>
                    <option value="Organza">Organza</option>
                    <option value="Velvet">Velvet</option>
                    <option value="Khaddar">Khaddar</option>
                    <option value="Cambric">Cambric</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Color Name</label>
                  <input
                    type="text"
                    name="color"
                    defaultValue={editingProduct?.color || 'Emerald Green'}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Unstitched Price (Rs.) *</label>
                  <input
                    type="number"
                    name="priceUnstitched"
                    required
                    defaultValue={editingProduct?.priceUnstitched || 14000}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Stitched Price (Rs.) *</label>
                  <input
                    type="number"
                    name="priceStitched"
                    required
                    defaultValue={editingProduct?.priceStitched || 18000}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Original Price (Strike-Through)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    defaultValue={editingProduct?.originalPrice || 22000}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Inventory Count *</label>
                  <input
                    type="number"
                    name="stockCount"
                    required
                    defaultValue={editingProduct?.stockCount || 10}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploader
                    images={productImages}
                    onChange={setProductImages}
                    maxImages={8}
                    label="Product Pictures / Gallery (Upload Direct from Device) *"
                    helperText="Upload pictures directly from your phone gallery, computer, or camera. Reorder, set main cover, or delete as needed."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingProduct?.description || 'Crafted with master artisanal finesse from pure raw silk and embellished with hand zardozi work.'}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Package Includes (one per line)</label>
                  <textarea
                    name="includes"
                    rows={2}
                    defaultValue={editingProduct?.includes.join('\n') || 'Embroidered Shirt\nDyed Silk Pants\nOrganza Dupatta'}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Embroidery Details (one per line)</label>
                  <textarea
                    name="embroideryDetails"
                    rows={2}
                    defaultValue={editingProduct?.embroideryDetails.join('\n') || 'Hand-worked zardozi neckline\nCutwork organza border along hemline'}
                    className="w-full bg-white border border-[#EBDCCB] rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="inStock"
                      defaultChecked={editingProduct ? editingProduct.inStock : true}
                      className="w-4 h-4 rounded text-[#A37F37]"
                    />
                    <span className="font-semibold text-stone-900">Mark as Available in Stock</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBDCCB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-[#EBDCCB] rounded text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C1917] text-[#DFCA95] font-semibold rounded"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COURIER DISPATCH ASSIGNMENT */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 border border-[#EBDCCB] shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#EBDCCB]">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#A37F37]" />
                <span>Courier Dispatch: #{dispatchModalOrder.orderNumber}</span>
              </h3>
              <button onClick={() => setDispatchModalOrder(null)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Courier Service</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-2 px-3 text-xs"
                >
                  <option value="TCS Express">TCS Express (Nationwide)</option>
                  <option value="Leopards Courier">Leopards Courier</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="Call Courier">Call Courier</option>
                  <option value="DHL Express">DHL Express (Overseas)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Consignment / Tracking # *</label>
                <input
                  type="text"
                  placeholder="e.g. TCS-8849201"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EBDCCB] rounded py-2 px-3 text-xs font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-[#EBDCCB] rounded text-stone-600">
                <p className="font-semibold text-stone-900">Destination:</p>
                <p>{dispatchModalOrder.customer.fullName}</p>
                <p>{dispatchModalOrder.customer.address}, {dispatchModalOrder.customer.city}</p>
                <p>Contact: {dispatchModalOrder.customer.phone}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EBDCCB]">
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="px-4 py-2 border rounded text-xs text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateOrderStatus(dispatchModalOrder.id, 'dispatched', courierName, trackingNumber);
                  setDispatchModalOrder(null);
                }}
                className="px-4 py-2 bg-[#1C1917] text-[#DFCA95] rounded text-xs font-semibold"
              >
                Mark Dispatched & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS & PACKING SLIP */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-lg p-6 border border-[#EBDCCB] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#EBDCCB]">
              <div>
                <span className="text-xs text-stone-400 uppercase font-mono">Invoice Slip</span>
                <h3 className="font-serif text-xl font-bold text-stone-900">Order #{selectedOrder.orderNumber}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white border border-[#EBDCCB] rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-stone-200 rounded">
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-[#EBDCCB] text-xs space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#F0EBE3]">
                <div>
                  <p className="text-stone-400 uppercase text-[10px] font-semibold">Client Details</p>
                  <p className="font-bold text-stone-900 text-sm mt-0.5">{selectedOrder.customer.fullName}</p>
                  <p className="text-stone-600">{selectedOrder.customer.phone}</p>
                  <p className="text-stone-600">{selectedOrder.customer.email}</p>
                </div>
                <div>
                  <p className="text-stone-400 uppercase text-[10px] font-semibold">Shipping Address</p>
                  <p className="text-stone-700 mt-0.5">{selectedOrder.customer.address}</p>
                  <p className="text-stone-700">{selectedOrder.customer.city}, {selectedOrder.customer.province}</p>
                  {selectedOrder.customer.notes && (
                    <p className="text-amber-800 bg-amber-50 p-1.5 rounded mt-1">Note: {selectedOrder.customer.notes}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-stone-900 uppercase text-[11px]">Ensembles Ordered</p>
                {selectedOrder.items.map((it) => (
                  <div key={`${it.productId}-${it.type}-${it.size}`} className="flex justify-between items-center py-1.5 border-b border-[#FAF8F5]">
                    <div className="flex items-center gap-2">
                      <img src={it.image} alt={it.title} className="w-10 h-12 object-cover rounded" />
                      <div>
                        <p className="font-semibold text-stone-900">{it.title}</p>
                        <p className="text-[11px] text-stone-500 capitalize">{it.type} {it.size ? `• Size: ${it.size}` : ''} × {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900">{formatPrice(it.unitPrice * it.quantity, selectedOrder.currency)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#F0EBE3] space-y-1 text-right">
                <p>Subtotal: {formatPrice(selectedOrder.subtotal, selectedOrder.currency)}</p>
                {selectedOrder.discountAmount > 0 && (
                  <p className="text-emerald-700">Discount: -{formatPrice(selectedOrder.discountAmount, selectedOrder.currency)}</p>
                )}
                <p>Courier Fee: {selectedOrder.shippingFee === 0 ? 'FREE' : formatPrice(selectedOrder.shippingFee, selectedOrder.currency)}</p>
                <p className="text-base font-bold text-[#A37F37] pt-1 border-t border-stone-200">
                  Total Payable: {formatPrice(selectedOrder.totalAmount, selectedOrder.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
