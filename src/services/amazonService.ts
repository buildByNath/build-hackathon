// src/services/amazonService.ts

export interface AmazonUrlParseResult {
  asin: string;
  domain: string;
}

/**
 * Client-side ASIN & domain extractor for instant validation and UI feedback.
 */
export function extractAmazonProductId(rawUrl: string): AmazonUrlParseResult | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();

  // Direct 10-character ASIN
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return {
      asin: trimmed.toUpperCase(),
      domain: 'amazon.in'
    };
  }

  try {
    let domain = 'amazon.in';
    const domainMatch = trimmed.match(/https?:\/\/(?:www\.)?(amazon\.[a-z\.]+)/i);
    if (domainMatch && domainMatch[1]) {
      domain = domainMatch[1].toLowerCase();
    }

    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})(?:[/?#]|$)/i,
      /\/gp\/product\/([A-Z0-9]{10})(?:[/?#]|$)/i,
      /\/gp\/aw\/d\/([A-Z0-9]{10})(?:[/?#]|$)/i,
      /\/product\/([A-Z0-9]{10})(?:[/?#]|$)/i,
      /\/d\/([A-Z0-9]{10})(?:[/?#]|$)/i,
      /[?&]asin=([A-Z0-9]{10})(?:[&#]|$)/i,
      /[?&]pd_rd_i=([A-Z0-9]{10})(?:[&#]|$)/i
    ];

    for (const pattern of asinPatterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return {
          asin: match[1].toUpperCase(),
          domain
        };
      }
    }
  } catch (e) {
    console.error('Error extracting ASIN:', e);
  }

  return null;
}

/**
 * Detects supported retailer from input URL
 */
export function detectStore(url: string): { store: string; isAmazon: boolean; isFlipkart: boolean; supported: boolean } {
  if (!url) return { store: 'Unknown', isAmazon: false, isFlipkart: false, supported: false };
  const lower = url.toLowerCase();

  if (lower.includes('amazon.')) {
    return {
      store: lower.includes('amazon.in') ? 'Amazon India' : 'Amazon',
      isAmazon: true,
      isFlipkart: false,
      supported: true
    };
  }

  if (lower.includes('flipkart.com')) {
    return {
      store: 'Flipkart',
      isAmazon: false,
      isFlipkart: true,
      supported: false // SerpApi dedicated support is for Amazon; Flipkart provider modularized
    };
  }

  if (lower.includes('croma.com')) {
    return { store: 'Croma', isAmazon: false, isFlipkart: false, supported: false };
  }

  if (lower.includes('reliancedigital.in')) {
    return { store: 'Reliance Digital', isAmazon: false, isFlipkart: false, supported: false };
  }

  return { store: 'Other Retailer', isAmazon: false, isFlipkart: false, supported: false };
}
