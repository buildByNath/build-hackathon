// src/services/notificationService.ts
import type { Product } from '../types';

export interface NotificationChannelsConfig {
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  phoneNumber?: string;
  emailAddress?: string;
}

export interface NotificationTriggersConfig {
  targetReached: boolean;
  significantDrop: boolean;
  anyPriceChange: boolean;
  alternativeFound: boolean;
}

export interface NotificationPreferences {
  channels: NotificationChannelsConfig;
  triggers: NotificationTriggersConfig;
}

export interface WhatsAppNotificationPayload {
  product: Product;
  previousPrice: number;
  currentPrice: number;
  targetPrice: number;
  recipientPhone?: string;
  customNote?: string;
}

export interface DeliveryLog {
  id: string;
  channel: 'in_app' | 'whatsapp' | 'email' | 'sms';
  status: 'delivered' | 'simulated' | 'failed';
  title: string;
  message: string;
  timestamp: string;
  formattedPreview?: string;
}

// In-memory simulated logs
const deliveryLogs: DeliveryLog[] = [];

/**
 * Modular Notification Service Architecture
 * Supports In-App, Email, SMS, and WhatsApp Business API.
 */
export const notificationService = {
  defaultPreferences: {
    channels: {
      inApp: true,
      email: true,
      whatsapp: true,
      sms: false,
      phoneNumber: '+91 98765 43210',
      emailAddress: 'user@example.com'
    },
    triggers: {
      targetReached: true,
      significantDrop: true,
      anyPriceChange: false,
      alternativeFound: true
    }
  } as NotificationPreferences,

  /**
   * Formats the WhatsApp message template
   */
  formatWhatsAppMessage(payload: WhatsAppNotificationPayload): string {
    const { product, previousPrice, currentPrice, targetPrice } = payload;
    const savings = previousPrice - currentPrice;
    const isTargetMet = currentPrice <= targetPrice;

    return `🔥 *PRICE DROP ALERT — PricePulse*\n\n` +
      `*${product.name}*\n` +
      `₹${previousPrice.toLocaleString()} ➔ *₹${currentPrice.toLocaleString()}*\n` +
      (savings > 0 ? `📉 You saved: *₹${savings.toLocaleString()}*\n` : '') +
      `🎯 Your target: *₹${targetPrice.toLocaleString()}*\n\n` +
      (isTargetMet ? `✅ *Target price reached!*\n\n` : `⏳ *Watching for deeper discounts*\n\n`) +
      `🔗 View Product Deal:\n${product.url}`;
  },

  /**
   * WhatsApp Delivery Channel
   * Architecture ready for official WhatsApp Cloud API / Twilio / Gupshup backend proxy.
   */
  async sendWhatsAppNotification(payload: WhatsAppNotificationPayload): Promise<{ success: boolean; simulated: boolean; preview: string }> {
    const formatted = this.formatWhatsAppMessage(payload);
    
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const log: DeliveryLog = {
      id: `log-wa-${Date.now()}`,
      channel: 'whatsapp',
      status: 'simulated',
      title: 'WhatsApp Price Alert',
      message: `Dispatched to ${payload.recipientPhone || '+91 98765 43210'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      formattedPreview: formatted
    };
    deliveryLogs.unshift(log);

    // Also console log for developer visibility
    console.log('[WhatsApp Notification Simulated]:', formatted);

    return {
      success: true,
      simulated: true,
      preview: formatted
    };
  },

  /**
   * Send email notification via the backend API (real Gmail SMTP)
   */
  async sendEmailViaBackend(payload: WhatsAppNotificationPayload, eventType: string): Promise<{ success: boolean; simulated: boolean }> {
    try {
      const prefs = this.defaultPreferences;
      const recipientEmail = prefs.channels.emailAddress || 'user@example.com';

      const response = await fetch('http://localhost:3001/api/email/price-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          productName: payload.product.name,
          productBrand: (payload.product as any).brand || '',
          previousPrice: payload.previousPrice,
          currentPrice: payload.currentPrice,
          targetPrice: payload.targetPrice,
          savings: Math.max(0, payload.previousPrice - payload.currentPrice),
          store: payload.product.store || 'Amazon India',
          productUrl: payload.product.url,
          imageUrl: payload.product.imageUrl,
          eventType: eventType === 'target_reached' ? 'TARGET_REACHED'
            : eventType === 'cart_target_reached' ? 'CART_TARGET_REACHED'
            : eventType === 'cart_price_drop' ? 'CART_PRICE_DROP'
            : 'PRICE_DROP',
        }),
      });

      const data = await response.json();
      return { success: data.success, simulated: false };
    } catch (err) {
      console.warn('[NotificationService] Backend email send failed, falling back to simulated:', err);
      return { success: false, simulated: true };
    }
  },

  /**
   * Unified Dispatch Engine
   */
  async dispatchEvent(
    _event: 'price_drop' | 'target_reached' | 'alternative_found',
    payload: WhatsAppNotificationPayload,
    prefs?: NotificationPreferences
  ): Promise<DeliveryLog[]> {
    const activePrefs = prefs || this.defaultPreferences;
    const newLogs: DeliveryLog[] = [];

    // 1. WhatsApp Channel
    if (activePrefs.channels.whatsapp) {
      const waResult = await this.sendWhatsAppNotification(payload);
      newLogs.push({
        id: `log-wa-${Date.now()}`,
        channel: 'whatsapp',
        status: 'simulated',
        title: '💬 WhatsApp Alert',
        message: `${payload.product.name} dropped to ₹${payload.currentPrice.toLocaleString()}`,
        timestamp: 'Just now',
        formattedPreview: waResult.preview
      });
    }

    // 2. Email Channel (Real Gmail SMTP via backend)
    if (activePrefs.channels.email) {
      const emailResult = await this.sendEmailViaBackend(payload, _event);
      newLogs.push({
        id: `log-em-${Date.now()}`,
        channel: 'email',
        status: emailResult.success ? 'delivered' : (emailResult.simulated ? 'simulated' : 'failed'),
        title: emailResult.success ? '📧 Email Sent' : '📧 Email Notification',
        message: emailResult.success
          ? `Price alert email sent to ${activePrefs.channels.emailAddress || 'user@example.com'}`
          : `Email dispatch to ${activePrefs.channels.emailAddress || 'user@example.com'} (fallback)`,
        timestamp: 'Just now'
      });
    }

    // 3. SMS Channel (Simulated)
    if (activePrefs.channels.sms) {
      newLogs.push({
        id: `log-sms-${Date.now()}`,
        channel: 'sms',
        status: 'simulated',
        title: '📱 SMS Alert',
        message: `SMS flash alert sent to ${activePrefs.channels.phoneNumber || '+91 98765 43210'}`,
        timestamp: 'Just now'
      });
    }

    return newLogs;
  },

  getDeliveryLogs(): DeliveryLog[] {
    return deliveryLogs;
  }
};
