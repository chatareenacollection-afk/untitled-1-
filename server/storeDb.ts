import fs from 'fs';
import path from 'path';
import {
  Product,
  Order,
  CustomerRecord,
  Coupon,
  StoreSettings,
  EmailGatewayConfig,
  Review,
  CategoryItem,
} from '../src/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_EMAIL_CONFIG,
  INITIAL_REVIEWS,
  INITIAL_CATEGORIES,
} from '../src/data/mockData';

interface DatabaseSchema {
  products: Product[];
  categories: CategoryItem[];
  orders: Order[];
  customers: CustomerRecord[];
  coupons: Coupon[];
  reviews: Review[];
  settings: StoreSettings;
  emailConfig: EmailGatewayConfig;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store_data.json');

export class StoreDatabase {
  private data: DatabaseSchema;
  private version: number = 1;
  private lastUpdated: number = Date.now();

  constructor() {
    this.data = this.loadData();
    // Ensure categories has all default categories including watches
    if (!this.data.categories || this.data.categories.length === 0) {
      this.data.categories = INITIAL_CATEGORIES;
      this.saveData();
    } else {
      let updatedCat = false;
      for (const initCat of INITIAL_CATEGORIES) {
        if (!this.data.categories.some((c) => c.id === initCat.id)) {
          this.data.categories.push(initCat);
          updatedCat = true;
        }
      }
      if (updatedCat) {
        this.saveData();
      }
    }

    // Ensure newly added initial products (such as watches & jewelry) exist in database
    if (this.data.products && this.data.products.length > 0) {
      let updatedProd = false;
      for (const initProd of INITIAL_PRODUCTS) {
        if (!this.data.products.some((p) => p.id === initProd.id)) {
          this.data.products.push(initProd);
          updatedProd = true;
        }
      }
      if (updatedProd) {
        this.saveData();
      }
    }
  }

  public getVersion(): number {
    return this.version;
  }

  public getLastUpdated(): number {
    return this.lastUpdated;
  }

  public bumpVersion(): void {
    this.version++;
    this.lastUpdated = Date.now();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          categories: parsed.categories || INITIAL_CATEGORIES,
          orders: parsed.orders || [],
          customers: parsed.customers || [],
          coupons: parsed.coupons || INITIAL_COUPONS,
          reviews: parsed.reviews || INITIAL_REVIEWS,
          settings: parsed.settings || INITIAL_SETTINGS,
          emailConfig: parsed.emailConfig || INITIAL_EMAIL_CONFIG,
        };
      }
    } catch (e) {
      console.error('Error loading store data, using defaults:', e);
    }

    const defaultData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: [
        {
          id: 'ord-1001',
          orderNumber: 'AR-89241',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          customer: {
            fullName: 'Zainab Qureshi',
            phone: '03214567890',
            email: 'zainab.q@example.com',
            address: 'House 42, Street 8, Sector F-8/2',
            city: 'Islamabad',
            province: 'Federal Capital',
            notes: 'Please call before delivery',
          },
          items: [
            {
              productId: 'ar-101',
              title: 'Noor-e-Zarin Embroidered Raw Silk Kurta Set',
              sku: 'ARS-PR-01',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
              type: 'stitched',
              size: 'M',
              unitPrice: 18500,
              quantity: 1,
              fabric: 'Raw Silk',
              color: 'Champagne Gold',
            },
          ],
          subtotal: 18500,
          discountAmount: 1000,
          couponCode: 'WELCOME1000',
          shippingFee: 0,
          totalAmount: 17500,
          currency: 'PKR',
          status: 'dispatched',
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          courierName: 'TCS Express',
          trackingNumber: 'TCS-99214481',
          trackingUrl: 'https://www.tcsexpress.com/tracking?track=TCS-99214481',
          estimatedDeliveryDate: '2026-09-14',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
            { status: 'confirmed', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString() },
            { status: 'processing', timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString() },
            { status: 'dispatched', timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(), note: 'Handed over to TCS Rider' },
          ],
        },
        {
          id: 'ord-1002',
          orderNumber: 'AR-89242',
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          customer: {
            fullName: 'Sobia Tariq',
            phone: '03019876543',
            email: 'sobia.tariq@example.com',
            address: 'Bunglow 18-A, Phase 5, DHA',
            city: 'Lahore',
            province: 'Punjab',
          },
          items: [
            {
              productId: 'ar-103',
              title: 'Gul-e-Rana Unstitched Chiffon Edit',
              sku: 'ARS-UN-03',
              image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
              type: 'unstitched',
              unitPrice: 16800,
              quantity: 1,
              fabric: 'Chiffon',
              color: 'Royal Emerald',
            },
          ],
          subtotal: 16800,
          discountAmount: 0,
          shippingFee: 0,
          totalAmount: 16800,
          currency: 'PKR',
          status: 'processing',
          paymentMethod: 'bank-transfer',
          paymentStatus: 'verified',
          bankReferenceNumber: 'MEZN-TRX-884920',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
            { status: 'confirmed', timestamp: new Date(Date.now() - 86400000 * 0.8).toISOString() },
            { status: 'processing', timestamp: new Date(Date.now() - 86400000 * 0.3).toISOString(), note: 'Bespoke stitching in progress' },
          ],
        },
      ],
      customers: [
        {
          id: 'cust-1',
          fullName: 'Zainab Qureshi',
          phone: '03214567890',
          email: 'zainab.q@example.com',
          city: 'Islamabad',
          totalOrders: 1,
          totalSpent: 17500,
          lastOrderDate: new Date().toISOString(),
          firstOrderDate: new Date().toISOString(),
        },
        {
          id: 'cust-2',
          fullName: 'Sobia Tariq',
          phone: '03019876543',
          email: 'sobia.tariq@example.com',
          city: 'Lahore',
          totalOrders: 1,
          totalSpent: 16800,
          lastOrderDate: new Date().toISOString(),
          firstOrderDate: new Date().toISOString(),
        },
      ],
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      settings: INITIAL_SETTINGS,
      emailConfig: INITIAL_EMAIL_CONFIG,
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
      this.bumpVersion();
    } catch (e) {
      console.error('Failed to save store database:', e);
    }
  }

  // PRODUCTS
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public addProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.saveData();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.saveData();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // ORDERS
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public trackOrder(orderNumber: string, contactQuery: string): Order | undefined {
    const cleanNum = orderNumber.trim().toUpperCase().replace('#', '');
    const cleanContact = contactQuery.trim().toLowerCase();

    return this.data.orders.find((o) => {
      const numMatch = o.orderNumber.toUpperCase().includes(cleanNum);
      const phoneMatch = o.customer.phone.replace(/[^0-9]/g, '').includes(cleanContact.replace(/[^0-9]/g, ''));
      const emailMatch = o.customer.email.toLowerCase() === cleanContact;
      return numMatch && (phoneMatch || emailMatch || cleanContact.length === 0);
    });
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);

    // Update customer stats
    const existingCustIdx = this.data.customers.findIndex(
      (c) => c.phone === order.customer.phone || c.email.toLowerCase() === order.customer.email.toLowerCase()
    );

    if (existingCustIdx >= 0) {
      this.data.customers[existingCustIdx].totalOrders += 1;
      this.data.customers[existingCustIdx].totalSpent += order.totalAmount;
      this.data.customers[existingCustIdx].lastOrderDate = order.createdAt;
      this.data.customers[existingCustIdx].city = order.customer.city;
    } else {
      this.data.customers.push({
        id: 'cust-' + Date.now(),
        fullName: order.customer.fullName,
        phone: order.customer.phone,
        email: order.customer.email,
        city: order.customer.city,
        totalOrders: 1,
        totalSpent: order.totalAmount,
        lastOrderDate: order.createdAt,
        firstOrderDate: order.createdAt,
      });
    }

    // Deduct stock for items
    order.items.forEach((item) => {
      const p = this.data.products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stockCount = Math.max(0, p.stockCount - item.quantity);
        if (p.stockCount === 0) p.inStock = false;
      }
    });

    this.saveData();
    return order;
  }

  public updateOrderStatus(
    orderId: string,
    status: Order['status'],
    courierName?: string,
    trackingNumber?: string,
    trackingUrl?: string,
    note?: string
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = status;
    if (courierName) order.courierName = courierName;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order marked as ${status}`,
    });

    this.saveData();
    return order;
  }

  // COUPONS
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public addCoupon(coupon: Coupon): Coupon {
    this.data.coupons.push(coupon);
    this.saveData();
    return coupon;
  }

  public deleteCoupon(id: string): boolean {
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter((c) => c.id !== id);
    if (this.data.coupons.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; message?: string } {
    const c = this.data.coupons.find((cp) => cp.code.toUpperCase() === code.trim().toUpperCase() && cp.isActive);
    if (!c) {
      return { valid: false, message: 'Invalid or expired promo voucher code' };
    }
    if (new Date(c.expiryDate) < new Date()) {
      return { valid: false, message: 'This promo code has expired' };
    }
    if (subtotal < c.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of Rs. ${c.minOrderAmount.toLocaleString()} required for this voucher`,
      };
    }
    return { valid: true, coupon: c };
  }

  // SETTINGS & CONFIG
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  public getEmailConfig(): EmailGatewayConfig {
    return this.data.emailConfig;
  }

  public updateEmailConfig(updates: Partial<EmailGatewayConfig>): EmailGatewayConfig {
    this.data.emailConfig = { ...this.data.emailConfig, ...updates };
    this.saveData();
    return this.data.emailConfig;
  }

  public getCustomers(): CustomerRecord[] {
    return this.data.customers;
  }

  public getReviews(): Review[] {
    return this.data.reviews;
  }

  public getAnalytics() {
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const pendingDispatches = this.data.orders.filter(
      (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing'
    ).length;
    const lowStockProducts = this.data.products.filter((p) => p.stockCount <= 5);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      pendingDispatches,
      lowStockProducts,
      totalCustomers: this.data.customers.length,
    };
  }

  // CATEGORIES CRUD
  public getCategories(): CategoryItem[] {
    return this.data.categories || INITIAL_CATEGORIES;
  }

  public addCategory(category: CategoryItem): CategoryItem {
    if (!this.data.categories) {
      this.data.categories = [...INITIAL_CATEGORIES];
    }
    const slug = category.id.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const exists = this.data.categories.some((c) => c.id === slug);
    const finalId = exists ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
    const newCat: CategoryItem = {
      ...category,
      id: finalId,
      featured: category.featured ?? true,
    };
    this.data.categories.push(newCat);
    this.saveData();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<CategoryItem>): CategoryItem | null {
    if (!this.data.categories) {
      this.data.categories = [...INITIAL_CATEGORIES];
    }
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveData();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    if (!this.data.categories) return false;
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }
}
