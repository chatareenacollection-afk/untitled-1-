import nodemailer from 'nodemailer';
import { Order, EmailGatewayConfig, EmailLog, StoreSettings } from '../src/types';

export class EmailService {
  private config: EmailGatewayConfig;
  private logs: EmailLog[] = [];

  constructor(config: EmailGatewayConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: EmailGatewayConfig) {
    this.config = newConfig;
  }

  public getConfig(): EmailGatewayConfig {
    return { ...this.config };
  }

  public getLogs(): EmailLog[] {
    return [...this.logs].reverse();
  }

  public logDispatch(
    recipient: string,
    subject: string,
    provider: string,
    status: 'sent' | 'simulated' | 'failed',
    errorDetails?: string,
    orderNumber?: string
  ) {
    const log: EmailLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      recipient,
      subject,
      provider,
      status,
      errorDetails,
      orderNumber,
    };
    this.logs.push(log);
    // Keep last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  private generateOrderEmailHtml(order: Order, settings: StoreSettings): string {
    const itemsRows = order.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #f0ebe4;">
          <td style="padding: 14px 10px; vertical-align: top;">
            <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 75px; object-fit: cover; border-radius: 4px; border: 1px solid #e7dfd5;" />
          </td>
          <td style="padding: 14px 10px; vertical-align: top;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #1c1917; font-size: 14px;">${item.title}</p>
            <p style="margin: 0; color: #78716c; font-size: 12px;">SKU: ${item.sku} | ${item.type.toUpperCase()}${item.size ? ` | Size: ${item.size}` : ''}</p>
            <p style="margin: 2px 0 0 0; color: #a37f37; font-size: 12px;">Fabric: ${item.fabric} • Color: ${item.color}</p>
          </td>
          <td style="padding: 14px 10px; text-align: center; vertical-align: top; color: #44403c; font-size: 14px;">
            ${item.quantity}
          </td>
          <td style="padding: 14px 10px; text-align: right; vertical-align: top; font-weight: 600; color: #1c1917; font-size: 14px;">
            Rs. ${(item.unitPrice * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf8f5; margin: 0; padding: 20px; color: #1c1917; }
          .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #ebdccb; border-radius: 8px; overflow: hidden; }
          .header { background-color: #1c1917; padding: 36px 24px; text-align: center; border-bottom: 3px solid #c5a059; }
          .gold-text { color: #c5a059; letter-spacing: 3px; font-size: 26px; margin: 0; font-family: Georgia, serif; text-transform: uppercase; }
          .sub-header { color: #d6cfc7; font-size: 11px; margin-top: 6px; letter-spacing: 2px; text-transform: uppercase; }
          .content { padding: 30px 24px; }
          .badge { display: inline-block; background-color: #f7f3ec; color: #a37f37; border: 1px solid #ebdccb; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .summary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .footer { background-color: #f7f4ef; padding: 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #ebdccb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="gold-text">A-R STYLES</h1>
            <p class="sub-header">Contemporary Elegance & Artisanal Eastern Fashion</p>
          </div>

          <div class="content">
            <div style="text-align: center; margin-bottom: 24px;">
              <span class="badge">Order Confirmation #${order.orderNumber}</span>
              <h2 style="font-size: 22px; margin: 16px 0 6px 0; color: #1c1917; font-family: Georgia, serif;">Thank You for Choosing A-R Styles</h2>
              <p style="color: #78716c; font-size: 14px; margin: 0;">We are meticulously preparing your artisanal Pakistani couture order.</p>
            </div>

            <div style="background-color: #fdfbf7; border: 1px solid #ebdccb; border-radius: 6px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #78716c;">Order Placed:</td>
                  <td style="padding: 4px 0; font-weight: 600; text-align: right;">${new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78716c;">Payment Method:</td>
                  <td style="padding: 4px 0; font-weight: 600; text-align: right; text-transform: uppercase;">${order.paymentMethod.replace('-', ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78716c;">Estimated Delivery:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #a37f37; text-align: right;">2 - 4 Business Days</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 15px; font-family: Georgia, serif; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #f0ebe4; padding-bottom: 8px;">Order Summary</h3>
            <table class="summary-table">
              <thead>
                <tr style="background: #faf8f5; color: #78716c; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding: 8px 10px; text-align: left;">Item</th>
                  <th style="padding: 8px 10px; text-align: left;">Details</th>
                  <th style="padding: 8px 10px; text-align: center;">Qty</th>
                  <th style="padding: 8px 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div style="margin-top: 20px; border-top: 1px solid #f0ebe4; padding-top: 14px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #78716c;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 500;">Rs. ${order.subtotal.toLocaleString()}</td>
                </tr>
                ${
                  order.discountAmount > 0
                    ? `<tr>
                  <td style="padding: 4px 0; color: #15803d;">Promo Discount (${order.couponCode || 'VOUCHER'})</td>
                  <td style="padding: 4px 0; text-align: right; color: #15803d; font-weight: 500;">- Rs. ${order.discountAmount.toLocaleString()}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 4px 0; color: #78716c;">Nationwide Delivery Fee</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 500;">${order.shippingFee === 0 ? 'FREE' : 'Rs. ' + order.shippingFee.toLocaleString()}</td>
                </tr>
                <tr style="border-top: 1px solid #ebdccb;">
                  <td style="padding: 10px 0; font-size: 16px; font-weight: 700; color: #1c1917;">Total Amount Payable</td>
                  <td style="padding: 10px 0; text-align: right; font-size: 18px; font-weight: 700; color: #a37f37;">Rs. ${order.totalAmount.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 24px; padding: 18px; background: #faf8f5; border-radius: 6px; font-size: 13px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #1c1917; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Shipping Destination</p>
              <p style="margin: 0; font-weight: 600;">${order.customer.fullName}</p>
              <p style="margin: 0; color: #44403c;">${order.customer.address} ${order.customer.apartment || ''}</p>
              <p style="margin: 0; color: #44403c;">${order.customer.city}, ${order.customer.province}</p>
              <p style="margin: 4px 0 0 0; color: #78716c;">WhatsApp Contact: <strong>${order.customer.phone}</strong></p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1c1917;">A-R Styles Luxury Eastern Couture</p>
            <p style="margin: 0 0 4px 0;">Need immediate concierge assistance with sizing or bespoke tailoring?</p>
            <p style="margin: 0;">WhatsApp Concierge: <a href="https://wa.me/923001234567" style="color: #a37f37; font-weight: 600; text-decoration: none;">+92 300 1234567</a> • Email: concierge@arstyles.pk</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Primary: Resend HTTPS API (Port 443)
  private async sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('Resend API Key is not configured');
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.config.senderName} <${this.config.senderEmail}>`,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Resend API HTTP ${response.status}: ${errBody}`);
    }
    return true;
  }

  // Primary Fallback: Brevo HTTPS API (Port 443)
  private async sendViaBrevo(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('Brevo API Key is not configured');
    }
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: this.config.senderName, email: this.config.senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Brevo API HTTP ${response.status}: ${errBody}`);
    }
    return true;
  }

  // Secondary Engine: SMTP nodemailer (ports 465 SSL, 587 TLS) with auto failover
  private async sendViaSMTP(to: string, subject: string, html: string): Promise<boolean> {
    const host = this.config.smtpHost || 'smtp.gmail.com';
    const user = this.config.smtpUser;
    const pass = this.config.smtpPass;
    const port = this.config.smtpPort || 465;
    const secure = port === 465;

    if (!user || !pass) {
      throw new Error('SMTP user credentials or App Password not provided');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
    });

    await transporter.sendMail({
      from: `"${this.config.senderName}" <${this.config.senderEmail || user}>`,
      to,
      subject,
      html,
    });

    return true;
  }

  // Universal dispatch with automatic fallback
  public async dispatchEmail(to: string, subject: string, html: string, orderNumber?: string): Promise<{ success: boolean; provider: string; mode: string; message: string }> {
    const provider = this.config.provider;

    // Check if configuration credentials are provided
    const hasHttpCredentials = Boolean(this.config.apiKey && this.config.apiKey.trim().length > 5);
    const hasSmtpCredentials = Boolean(this.config.smtpUser && this.config.smtpPass && this.config.smtpPass.trim().length > 4);

    if (!hasHttpCredentials && !hasSmtpCredentials) {
      // Simulation mode for initial out-of-the-box experience
      this.logDispatch(to, subject, `${provider} (Simulated)`, 'simulated', 'Gateway credentials not set in Admin Settings. Ready to activate.', orderNumber);
      return {
        success: true,
        provider: `${provider}-simulated`,
        mode: 'simulated',
        message: 'Email simulated & logged. Configure API Key or Gmail App Password in Admin Settings to deliver live emails.',
      };
    }

    // Try selected provider first
    try {
      if (provider === 'resend' && hasHttpCredentials) {
        await this.sendViaResend(to, subject, html);
        this.logDispatch(to, subject, 'Resend (HTTPS:443)', 'sent', undefined, orderNumber);
        return { success: true, provider: 'resend', mode: 'live', message: 'Email sent via Resend HTTPS API' };
      }

      if (provider === 'brevo' && hasHttpCredentials) {
        await this.sendViaBrevo(to, subject, html);
        this.logDispatch(to, subject, 'Brevo (HTTPS:443)', 'sent', undefined, orderNumber);
        return { success: true, provider: 'brevo', mode: 'live', message: 'Email sent via Brevo HTTPS API' };
      }

      if ((provider === 'gmail-smtp' || provider === 'custom-smtp') && hasSmtpCredentials) {
        await this.sendViaSMTP(to, subject, html);
        this.logDispatch(to, subject, `SMTP (${this.config.smtpHost}:${this.config.smtpPort})`, 'sent', undefined, orderNumber);
        return { success: true, provider: 'smtp', mode: 'live', message: 'Email sent via SMTP' };
      }
    } catch (primaryErr: any) {
      console.warn(`Primary email dispatch failed with ${provider}:`, primaryErr.message);

      // Attempt automatic fallback to secondary if configured
      if (hasSmtpCredentials && provider !== 'gmail-smtp' && provider !== 'custom-smtp') {
        try {
          await this.sendViaSMTP(to, subject, html);
          this.logDispatch(to, subject, 'SMTP Fallback', 'sent', `Primary ${provider} failed (${primaryErr.message}). Fallback succeeded.`, orderNumber);
          return { success: true, provider: 'smtp-fallback', mode: 'live', message: 'Sent via secondary SMTP fallback.' };
        } catch (smtpErr: any) {
          this.logDispatch(to, subject, `${provider} + SMTP`, 'failed', `Primary: ${primaryErr.message} | Secondary: ${smtpErr.message}`, orderNumber);
          return { success: false, provider: 'failed', mode: 'error', message: `Delivery failed: ${primaryErr.message}` };
        }
      }

      this.logDispatch(to, subject, provider, 'failed', primaryErr.message, orderNumber);
      return { success: false, provider, mode: 'error', message: primaryErr.message };
    }

    // Default fallback to simulated if unconfigured
    this.logDispatch(to, subject, `${provider} (Simulated)`, 'simulated', 'Credentials missing for selected provider.', orderNumber);
    return { success: true, provider: `${provider}-simulated`, mode: 'simulated', message: 'Simulated and logged.' };
  }

  public async sendOrderConfirmation(order: Order, settings: StoreSettings) {
    const subject = `Order Confirmed #${order.orderNumber} - A-R Styles Luxury Couture`;
    const html = this.generateOrderEmailHtml(order, settings);

    // Send to customer
    const customerResult = await this.dispatchEmail(order.customer.email, subject, html, order.orderNumber);

    // Also notify store owner if notification email is set
    if (this.config.notificationEmail && this.config.notificationEmail !== order.customer.email) {
      const adminSubject = `[NEW ORDER] #${order.orderNumber} - Rs. ${order.totalAmount.toLocaleString()} (${order.customer.fullName}, ${order.customer.city})`;
      await this.dispatchEmail(this.config.notificationEmail, adminSubject, html, order.orderNumber);
    }

    return customerResult;
  }

  public async sendTestEmail(recipient: string): Promise<{ success: boolean; provider: string; mode: string; message: string }> {
    const subject = 'A-R Styles Email Gateway Test Verification';
    const testHtml = `
      <div style="font-family: sans-serif; padding: 24px; background: #faf8f5; border: 1px solid #ebdccb; border-radius: 8px;">
        <h2 style="color: #a37f37; font-family: Georgia, serif; margin: 0 0 10px 0;">A-R STYLES</h2>
        <p style="font-size: 14px; color: #1c1917;">This is a live test notification from your <strong>A-R Styles</strong> couture store email gateway.</p>
        <p style="font-size: 13px; color: #78716c;">Active Provider: <strong>${this.config.provider}</strong> | Timestamp: ${new Date().toISOString()}</p>
        <p style="font-size: 12px; color: #15803d; margin-top: 16px; font-weight: 600;">✓ Email dispatch system is active and operational.</p>
      </div>
    `;

    return await this.dispatchEmail(recipient, subject, testHtml);
  }
}
