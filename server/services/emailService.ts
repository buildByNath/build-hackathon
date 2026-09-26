// server/services/emailService.ts
// Gmail SMTP email service using Nodemailer
// IMPORTANT: All credentials are read from environment variables (GMAIL_USER, GMAIL_APP_PASSWORD).
// Never log, expose, or hardcode the password.

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PriceAlertEmailPayload {
  to: string;
  productName: string;
  productBrand?: string;
  previousPrice: number;
  currentPrice: number;
  targetPrice?: number;
  savings: number;
  store?: string;
  productUrl?: string;
  imageUrl?: string;
  eventType: 'PRICE_DROP' | 'TARGET_REACHED' | 'NEW_LOW' | 'CART_PRICE_DROP' | 'CART_TARGET_REACHED';
}

export interface EmailServiceStatus {
  configured: boolean;
  gmailUser: string | null;
  lastError: string | null;
}

// ─── In-memory deduplication (prevents spam on frontend refreshes) ───────────

const recentlySent = new Map<string, number>(); // key → timestamp
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function isDuplicate(key: string): boolean {
  const lastSent = recentlySent.get(key);
  if (lastSent && Date.now() - lastSent < DEDUP_WINDOW_MS) {
    return true;
  }
  return false;
}

function markSent(key: string): void {
  recentlySent.set(key, Date.now());
  // Cleanup old entries periodically
  if (recentlySent.size > 500) {
    const cutoff = Date.now() - DEDUP_WINDOW_MS;
    for (const [k, ts] of recentlySent.entries()) {
      if (ts < cutoff) recentlySent.delete(k);
    }
  }
}

// ─── Transporter (lazy singleton) ────────────────────────────────────────────

let transporter: Transporter | null = null;
let lastError: string | null = null;

function getTransporter(): Transporter | null {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!gmailUser || !gmailPass) {
    lastError = 'Gmail credentials not configured in environment variables';
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
    console.log('[EmailService] Gmail SMTP transporter created');
  }

  return transporter;
}

// ─── HTML Email Template ─────────────────────────────────────────────────────

function buildPriceAlertHTML(payload: PriceAlertEmailPayload): string {
  const {
    productName,
    productBrand,
    previousPrice,
    currentPrice,
    targetPrice,
    savings,
    store,
    productUrl,
    eventType,
  } = payload;

  const isTargetHit = eventType === 'TARGET_REACHED' || eventType === 'CART_TARGET_REACHED';
  const isNewLow = eventType === 'NEW_LOW';

  const headerEmoji = isTargetHit ? '🎯' : isNewLow ? '📉' : '🔥';
  const headerText = isTargetHit
    ? 'Target Price Reached!'
    : isNewLow
    ? 'New All-Time Low!'
    : 'Price Drop Alert';

  const accentColor = isTargetHit ? '#10b981' : '#3b82f6';
  const badgeColor = isTargetHit ? '#059669' : '#2563eb';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerEmoji} PricePulse ${headerText}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,${accentColor},#7c3aed);padding:28px 32px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">${headerEmoji}</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                PricePulse ${headerText}
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Your tracked product ${isTargetHit ? 'hit your target price' : 'dropped in price'}!
              </p>
            </td>
          </tr>
          
          <!-- Product Details -->
          <tr>
            <td style="padding:28px 32px;">
              
              <!-- Product Name -->
              <h2 style="margin:0 0 4px;font-size:17px;font-weight:700;color:#111827;line-height:1.4;">
                ${productName}
              </h2>
              ${productBrand ? `<p style="margin:0 0 16px;font-size:12px;color:#6b7280;">${productBrand}${store ? ` · ${store}` : ''}</p>` : (store ? `<p style="margin:0 0 16px;font-size:12px;color:#6b7280;">${store}</p>` : '')}
              
              <!-- Price Comparison Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:20px;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:8px;">
                          <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Previous Price</span>
                          <div style="font-size:18px;color:#9ca3af;text-decoration:line-through;font-weight:600;margin-top:2px;">
                            ₹${previousPrice.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td align="right" style="padding-bottom:8px;">
                          <span style="font-size:11px;color:${accentColor};text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Current Price</span>
                          <div style="font-size:26px;color:#111827;font-weight:800;margin-top:2px;">
                            ₹${currentPrice.toLocaleString('en-IN')}
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Savings Badge -->
                    ${savings > 0 ? `
                    <div style="margin-top:12px;padding:10px 16px;background-color:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;text-align:center;">
                      <span style="font-size:14px;font-weight:700;color:#059669;">
                        📉 You Save: ₹${savings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              ${targetPrice ? `
              <!-- Target Price Status -->
              <div style="margin-bottom:20px;padding:12px 16px;background-color:${isTargetHit ? '#ecfdf5' : '#eff6ff'};border-radius:8px;border:1px solid ${isTargetHit ? '#a7f3d0' : '#bfdbfe'};">
                <span style="font-size:13px;color:${isTargetHit ? '#059669' : '#2563eb'};font-weight:600;">
                  🎯 Your target price: ₹${targetPrice.toLocaleString('en-IN')}
                  ${isTargetHit ? ' — ✅ Target reached!' : ''}
                </span>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              ${productUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <a href="${productUrl}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:14px 32px;background-color:${badgeColor};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
                      View Deal →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.5;">
                Sent by <strong style="color:#6b7280;">PricePulse</strong> — Personal Price Watcher<br/>
                You received this because you're tracking this product.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Plain Text Fallback ─────────────────────────────────────────────────────

function buildPriceAlertText(payload: PriceAlertEmailPayload): string {
  const { productName, previousPrice, currentPrice, targetPrice, savings, store, productUrl, eventType } = payload;
  const isTargetHit = eventType === 'TARGET_REACHED' || eventType === 'CART_TARGET_REACHED';

  let text = `🔥 PricePulse ${isTargetHit ? 'Target Reached' : 'Price Drop'} Alert\n\n`;
  text += `Product: ${productName}\n`;
  if (store) text += `Store: ${store}\n`;
  text += `Previous Price: ₹${previousPrice.toLocaleString('en-IN')}\n`;
  text += `Current Price: ₹${currentPrice.toLocaleString('en-IN')}\n`;
  if (savings > 0) text += `You Save: ₹${savings.toLocaleString('en-IN')}\n`;
  if (targetPrice) text += `🎯 Your target price: ₹${targetPrice.toLocaleString('en-IN')}${isTargetHit ? ' — Target reached!' : ''}\n`;
  if (productUrl) text += `\nView Deal: ${productUrl}\n`;
  text += `\n— PricePulse`;
  return text;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const emailService = {
  /**
   * Returns configuration status (never exposes credentials)
   */
  getStatus(): EmailServiceStatus {
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
    return {
      configured: Boolean(gmailUser && gmailPass),
      gmailUser: gmailUser ? gmailUser.replace(/(.{3}).*(@.*)/, '$1***$2') : null,
      lastError,
    };
  },

  /**
   * Verify SMTP connection (safe — never exposes password)
   */
  async verifyConnection(): Promise<{ success: boolean; message: string }> {
    const t = getTransporter();
    if (!t) {
      return { success: false, message: lastError || 'Gmail not configured' };
    }

    try {
      await t.verify();
      lastError = null;
      return { success: true, message: 'Gmail SMTP connection verified successfully' };
    } catch (err: any) {
      const safeMsg = 'Email notification failed — SMTP authentication error';
      lastError = safeMsg;
      console.error('[EmailService] SMTP verification failed:', safeMsg);
      // Reset transporter so it can be recreated with possibly updated env
      transporter = null;
      return { success: false, message: safeMsg };
    }
  },

  /**
   * Send a price drop / target reached email notification
   */
  async sendPriceAlertEmail(payload: PriceAlertEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Dedup check
    const dedupKey = `${payload.to}:${payload.productName}:${payload.currentPrice}:${payload.eventType}`;
    if (isDuplicate(dedupKey)) {
      console.log('[EmailService] Skipping duplicate email for:', payload.productName);
      return { success: true, messageId: 'dedup-skipped' };
    }

    const t = getTransporter();
    if (!t) {
      return { success: false, error: lastError || 'Gmail not configured' };
    }

    const gmailUser = process.env.GMAIL_USER?.trim();
    if (!gmailUser) {
      return { success: false, error: 'Gmail sender address not configured' };
    }

    const isTargetHit = payload.eventType === 'TARGET_REACHED' || payload.eventType === 'CART_TARGET_REACHED';
    const isNewLow = payload.eventType === 'NEW_LOW';
    const subjectEmoji = isTargetHit ? '🎯' : isNewLow ? '📉' : '🔥';
    const subjectAction = isTargetHit ? 'Target Price Reached' : isNewLow ? 'New All-Time Low' : 'Price Drop Alert';

    try {
      const info = await t.sendMail({
        from: `"PricePulse Alerts" <${gmailUser}>`,
        to: payload.to,
        subject: `${subjectEmoji} ${subjectAction}: ${payload.productName} — ₹${payload.currentPrice.toLocaleString('en-IN')}`,
        text: buildPriceAlertText(payload),
        html: buildPriceAlertHTML(payload),
      });

      markSent(dedupKey);
      lastError = null;
      console.log(`[EmailService] Price alert email sent to ${payload.to} — MessageID: ${info.messageId}`);

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      const safeMsg = 'Email notification failed';
      lastError = safeMsg;
      console.error(`[EmailService] ${safeMsg}:`, err.code || err.message);
      // Reset transporter on auth failures
      if (err.code === 'EAUTH' || err.responseCode === 535) {
        transporter = null;
      }
      return { success: false, error: safeMsg };
    }
  },

  /**
   * Send a test email to verify the complete pipeline works
   */
  async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendPriceAlertEmail({
      to,
      productName: 'PricePulse Test Product',
      productBrand: 'PricePulse',
      previousPrice: 79999,
      currentPrice: 64999,
      targetPrice: 65000,
      savings: 15000,
      store: 'Amazon India',
      productUrl: 'https://amazon.in',
      eventType: 'PRICE_DROP',
    });
  },
};
