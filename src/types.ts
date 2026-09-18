export type ProductCategory = 
  | 'pret'
  | 'luxury-lawn'
  | 'unstitched'
  | 'formals-bridal'
  | 'shawls'
  | 'accessories'
  | (string & {});

export interface CategoryItem {
  id: string;
  name: string;
  subtitle?: string;
  image?: string;
  span?: string;
  itemCount?: string;
  featured?: boolean;
}

export type FabricType = 
  | 'Pure Silk'
  | 'Lawn'
  | 'Chiffon'
  | 'Organza'
  | 'Raw Silk'
  | 'Velvet'
  | 'Khaddar'
  | 'Cambric';

export interface Product {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  categoryLabel: string;
  priceUnstitched: number;
  priceStitched: number;
  originalPrice?: number; // for discount strike-through
  discountPercentage?: number;
  fabric: FabricType;
  color: string;
  colorHex: string;
  images: string[];
  description: string;
  embroideryDetails: string[];
  includes: string[];
  careInstructions: string[];
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'Custom')[];
  inStock: boolean;
  stockCount: number;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFlashSale?: boolean;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  title: string;
  sku?: string;
  image: string;
  type: 'stitched' | 'unstitched';
  size?: string;
  unitPrice: number;
  quantity: number;
  fabric: string;
  color?: string;
}

export interface FilterOptions {
  category?: string;
  fabric?: string;
  size?: string;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 
  | 'cod'
  | 'bank-transfer'
  | 'jazzcash-easypaisa'
  | 'card';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode?: string;
  notes?: string;
  isGiftWrapped?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. AR-98214
  createdAt: string;
  customer: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  currency: 'PKR' | 'USD';
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'verified' | 'paid';
  bankReferenceNumber?: string;
  courierName?: string; // e.g. TCS, Leopard, Trax, Call Courier
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
  usedCount: number;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  firstOrderDate: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  whatsappNumber: string;
  supportEmail: string;
  announcementText: string;
  freeShippingThreshold: number; // e.g. 5000 PKR
  standardShippingFee: number; // e.g. 250 PKR
  expressShippingFee: number; // e.g. 450 PKR
  internationalShippingFee: number; // in USD or PKR
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
  mobileWalletDetails: {
    jazzCashNumber: string;
    jazzCashTitle: string;
    easypaisaNumber: string;
    easypaisaTitle: string;
  };
}

export type EmailProvider = 'resend' | 'brevo' | 'gmail-smtp' | 'custom-smtp';

export interface EmailGatewayConfig {
  provider: EmailProvider;
  senderName: string;
  senderEmail: string;
  notificationEmail: string; // store owner email
  // HTTPS API Credentials
  apiKey?: string; // for Resend or Brevo
  // SMTP Credentials
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean; // true for 465, false for 587
  isEnabled: boolean;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  provider: string;
  status: 'sent' | 'simulated' | 'failed';
  errorDetails?: string;
  orderNumber?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
  photos?: string[];
}
