import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { StoreDatabase } from './server/storeDb';
import { EmailService } from './server/emailService';
import { Order, Product } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const db = new StoreDatabase();
  const emailService = new EmailService(db.getEmailConfig());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', store: 'A-R Styles', timestamp: new Date().toISOString() });
  });

  // EXECUTIVE PASSKEY AUTHENTICATION
  const EXECUTIVE_PASSKEY = 'Gujjarfamily19109$$Gujjarfamily19109$$';

  app.post('/api/auth/verify-passkey', (req, res) => {
    const { passkey } = req.body;
    if (passkey === EXECUTIVE_PASSKEY) {
      return res.json({
        success: true,
        authenticated: true,
        sessionToken: 'ar_sec_' + Buffer.from(Date.now().toString()).toString('base64'),
      });
    }
    return res.status(401).json({ success: false, error: 'Unauthorized credentials' });
  });

  // REAL-TIME MULTI-DEVICE SYNCHRONIZATION STATUS
  app.get('/api/sync/status', (req, res) => {
    res.json({
      version: db.getVersion(),
      lastUpdated: db.getLastUpdated(),
      ordersCount: db.getOrders().length,
      productsCount: db.getProducts().length,
      timestamp: new Date().toISOString(),
    });
  });

  // PRODUCTS
  app.get('/api/products', (req, res) => {
    try {
      let products = db.getProducts();
      const { category, fabric, search, sort, minPrice, maxPrice } = req.query;

      if (category && category !== 'all') {
        products = products.filter((p) => p.category === category);
      }

      if (fabric && fabric !== 'all') {
        products = products.filter((p) => p.fabric.toLowerCase() === (fabric as string).toLowerCase());
      }

      if (minPrice) {
        products = products.filter((p) => Math.min(p.priceUnstitched, p.priceStitched) >= Number(minPrice));
      }

      if (maxPrice) {
        products = products.filter((p) => Math.min(p.priceUnstitched, p.priceStitched) <= Number(maxPrice));
      }

      if (search) {
        const q = (search as string).toLowerCase();
        products = products.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q) ||
            p.fabric.toLowerCase().includes(q) ||
            p.color.toLowerCase().includes(q) ||
            p.categoryLabel.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
      }

      if (sort) {
        if (sort === 'price-low') {
          products.sort((a, b) => a.priceUnstitched - b.priceUnstitched);
        } else if (sort === 'price-high') {
          products.sort((a, b) => b.priceUnstitched - a.priceUnstitched);
        } else if (sort === 'newest') {
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sort === 'popular') {
          products.sort((a, b) => b.rating - a.rating);
        }
      }

      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    try {
      const p: Product = {
        ...req.body,
        id: 'ar-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      const created = db.addProduct(p);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const updated = db.updateProduct(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, id: req.params.id });
  });

  // CATEGORIES
  app.get('/api/categories', (req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req, res) => {
    try {
      const { name, subtitle, image, span, featured } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      const rawId = req.body.id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const cat = db.addCategory({
        id: rawId,
        name,
        subtitle: subtitle || '',
        image: image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        span: span || 'col-span-1',
        itemCount: '0 Items',
        featured: featured ?? true,
      });
      res.status(201).json(cat);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/categories/:id', (req, res) => {
    try {
      const updated = db.updateCategory(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/categories/:id', (req, res) => {
    const deleted = db.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true, id: req.params.id });
  });

  // ORDERS
  app.get('/api/orders', (req, res) => {
    res.json(db.getOrders());
  });

  app.get('/api/orders/track', (req, res) => {
    const { orderNumber, contact } = req.query;
    if (!orderNumber) {
      return res.status(400).json({ error: 'Order Number is required' });
    }
    const order = db.trackOrder(orderNumber as string, (contact as string) || '');
    if (!order) {
      return res.status(404).json({ error: 'No order found with matching details' });
    }
    res.json(order);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const body = req.body;
      const orderNumber = 'AR-' + Math.floor(10000 + Math.random() * 90000);
      const newOrder: Order = {
        ...body,
        id: 'ord-' + Date.now(),
        orderNumber,
        createdAt: new Date().toISOString(),
        status: 'pending',
        paymentStatus: body.paymentMethod === 'card' ? 'paid' : 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Order submitted online by customer',
          },
        ],
      };

      const savedOrder = db.createOrder(newOrder);

      // Trigger asynchronous email dispatch
      emailService
        .sendOrderConfirmation(savedOrder, db.getSettings())
        .catch((err) => console.warn('Email dispatch warning:', err));

      res.status(201).json(savedOrder);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    try {
      const { status, courierName, trackingNumber, trackingUrl, note } = req.body;
      const updated = db.updateOrderStatus(
        req.params.id,
        status,
        courierName,
        trackingNumber,
        trackingUrl,
        note
      );
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // COUPONS
  app.get('/api/coupons', (req, res) => {
    res.json(db.getCoupons());
  });

  app.post('/api/coupons', (req, res) => {
    try {
      const newCoupon = {
        ...req.body,
        id: 'c-' + Date.now(),
        code: req.body.code.toUpperCase().trim(),
        usedCount: 0,
      };
      const created = db.addCoupon(newCoupon);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Coupon code required' });
    }
    const result = db.validateCoupon(code, Number(subtotal) || 0);
    res.json(result);
  });

  app.delete('/api/coupons/:id', (req, res) => {
    const deleted = db.deleteCoupon(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ success: true });
  });

  // CUSTOMERS & REVIEWS
  app.get('/api/customers', (req, res) => {
    res.json(db.getCustomers());
  });

  app.get('/api/reviews', (req, res) => {
    res.json(db.getReviews());
  });

  // SETTINGS & CONFIG
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // EMAIL GATEWAY
  app.get('/api/email/config', (req, res) => {
    const config = db.getEmailConfig();
    // Partially mask sensitive secret for security
    const masked = {
      ...config,
      apiKey: config.apiKey ? config.apiKey.slice(0, 4) + '••••••••' : '',
      smtpPass: config.smtpPass ? '••••••••' : '',
    };
    res.json(masked);
  });

  app.put('/api/email/config', (req, res) => {
    try {
      const body = req.body;
      const current = db.getEmailConfig();

      // If user submitted masked placeholder, preserve existing key
      if (body.apiKey && body.apiKey.includes('••••')) {
        body.apiKey = current.apiKey;
      }
      if (body.smtpPass && body.smtpPass.includes('••••')) {
        body.smtpPass = current.smtpPass;
      }

      const updated = db.updateEmailConfig(body);
      emailService.updateConfig(updated);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/email/test', async (req, res) => {
    try {
      const { recipient } = req.body;
      if (!recipient) {
        return res.status(400).json({ error: 'Test recipient email is required' });
      }
      const result = await emailService.sendTestEmail(recipient);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/email/logs', (req, res) => {
    res.json(emailService.getLogs());
  });

  // ANALYTICS
  app.get('/api/analytics', (req, res) => {
    res.json(db.getAnalytics());
  });

  // Vite middleware for development or static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`A-R Styles server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
