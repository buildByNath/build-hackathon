// src/services/aiService.ts
import type { AIDealInsight, BuyVerdict, PriceHistoryPoint, Product } from '../types';

export interface GeminiProductDeepAnalysis {
  summary: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  importantConsiderations: string[];
  suitableFor: string[];
  notIdealFor: string[];
  provider?: string;
}

export interface ShouldIBuyResult {
  decision: 'BUY_NOW' | 'WAIT' | 'NEUTRAL' | 'INSUFFICIENT_DATA';
  reason: string;
  key_factors: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  provider?: string;
}

export interface PriceHistoryExplanationResult {
  trendExplanation: string;
  volatility: 'Low' | 'Moderate' | 'High';
  priceRangeNote: string;
  buyingWindowAdvice: string;
  provider?: string;
}

export const aiService = {
  /**
   * Check status of server-side AI providers (Google Gemini & Groq)
   */
  async getProviderStatus() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      return {
        geminiConfigured: data.gemini?.configured || false,
        geminiModel: data.gemini?.model || 'gemini-1.5-flash',
        groqConfigured: data.groq?.configured || false,
        groqModel: data.groq?.model || 'openai/gpt-oss-120b',
        serpapiConfigured: data.serpapi?.configured || false,
      };
    } catch {
      return {
        geminiConfigured: false,
        geminiModel: 'gemini-1.5-flash',
        groqConfigured: false,
        groqModel: 'openai/gpt-oss-120b',
        serpapiConfigured: false,
      };
    }
  },

  /**
   * 🌟 1. GEMINI: Deep Product Analysis (Key features, Pros, Cons, Suitable For)
   */
  async analyzeProductDeepDive(product: Product): Promise<GeminiProductDeepAnalysis> {
    try {
      const response = await fetch('/api/gemini/product-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        return data.analysis;
      }
    } catch (err) {
      console.warn('[aiService] Gemini product-analysis fallback:', err);
    }

    // Deterministic fallback
    return {
      summary: `${product.name} currently listed at ₹${product.currentPrice.toLocaleString()} on ${product.store || 'Amazon India'}.`,
      keyFeatures: Object.entries(product.specs || {})
        .slice(0, 4)
        .map(([k, v]) => `${k}: ${v}`),
      pros: [
        product.discountPercent ? `Currently discounted by ${product.discountPercent}% off baseline` : 'Verified retailer listing',
        product.rating ? `High customer satisfaction rating of ${product.rating}/5` : 'Active price monitoring enabled',
        `Live tracking on ${product.store || 'Amazon India'}`
      ],
      cons: [
        'Prices may fluctuate based on retailer inventory and promotional cycles',
        'Check retailer return window before checkout'
      ],
      importantConsiderations: [
        `Target price alert set at ₹${(product.targetPrice || Math.round(product.currentPrice * 0.9)).toLocaleString()}`
      ],
      suitableFor: ['Shoppers seeking verified live retailer price tracking with automated drop alerts'],
      notIdealFor: ['Shoppers needing unverified third-party marketplace listings'],
      provider: 'Factual Algorithmic Baseline'
    };
  },

  /**
   * 🌟 2. GEMINI: Should I Buy Decision Analysis
   */
  async shouldIBuyDecision(
    product: Product,
    history: PriceHistoryPoint[] = []
  ): Promise<ShouldIBuyResult> {
    try {
      const response = await fetch('/api/gemini/should-i-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, history }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        return data.result;
      }
    } catch (err) {
      console.warn('[aiService] Gemini should-i-buy fallback:', err);
    }

    const isTargetMet = product.currentPrice <= product.targetPrice;
    return {
      decision: isTargetMet ? 'BUY_NOW' : (product.discountPercent && product.discountPercent >= 12) ? 'BUY_NOW' : 'NEUTRAL',
      reason: isTargetMet
        ? `Current price (₹${product.currentPrice.toLocaleString()}) has reached your target of ₹${product.targetPrice.toLocaleString()}.`
        : `Currently listed at ₹${product.currentPrice.toLocaleString()} on ${product.store || 'Amazon'}.`,
      key_factors: [
        `Live price: ₹${product.currentPrice.toLocaleString()}`,
        `Target threshold: ₹${product.targetPrice.toLocaleString()}`,
        product.discountPercent ? `${product.discountPercent}% discount active` : 'Standard retailer listing'
      ],
      confidence: history.length >= 3 ? 'HIGH' : 'MEDIUM',
      provider: 'Deterministic Fallback'
    };
  },

  /**
   * 🌟 3. GEMINI: Price History & Volatility Explanation
   */
  async explainPriceHistory(
    product: Product,
    history: PriceHistoryPoint[] = []
  ): Promise<PriceHistoryExplanationResult> {
    try {
      const response = await fetch('/api/gemini/price-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, history }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        return data.analysis;
      }
    } catch (err) {
      console.warn('[aiService] Gemini price-history fallback:', err);
    }

    const prices = history.map((h) => h.price).filter(Boolean);
    const low = prices.length > 0 ? Math.min(...prices, product.currentPrice) : product.currentPrice;
    const high = prices.length > 0 ? Math.max(...prices, product.originalPrice || product.currentPrice) : product.currentPrice;

    return {
      trendExplanation: `Price currently tracking between ₹${low.toLocaleString()} and ₹${high.toLocaleString()}.`,
      volatility: (high - low) > (product.currentPrice * 0.1) ? 'Moderate' : 'Low',
      priceRangeNote: `Recorded all-time low of ₹${low.toLocaleString()} with peak at ₹${high.toLocaleString()}.`,
      buyingWindowAdvice: product.currentPrice <= low * 1.02
        ? 'Currently at all-time low price window.'
        : `Recommended target alert at ₹${Math.round(product.currentPrice * 0.92).toLocaleString()}.`,
      provider: 'Deterministic Fallback'
    };
  },

  /**
   * Generates AI Deal Insight via Groq backend endpoint with local factual fallback
   */
  async generateDealInsight(
    product: Product,
    history: PriceHistoryPoint[] = []
  ): Promise<AIDealInsight> {
    const currentPrice = product.currentPrice;
    const targetPrice = product.targetPrice || Math.round(currentPrice * 0.9);
    const prices = history.length > 0 ? history.map((h) => h.price) : [currentPrice];
    const lowest = Math.min(...prices, currentPrice);
    const highest = Math.max(...prices, currentPrice);
    const recentAverage = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    try {
      const response = await fetch('/api/ai/deal-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, history }),
      });

      const data = await response.json();
      if (data.success && data.insight) {
        const ins = data.insight;
        return {
          verdict: (ins.verdict as BuyVerdict) || (currentPrice <= targetPrice ? 'good_time' : 'maybe_wait'),
          genZBadge: ins.genZBadge || '👀 Live AI Analysis',
          headline: ins.headline || 'Verified price against live retailer reference.',
          explanation: ins.explanation || `Currently listed at ₹${currentPrice.toLocaleString()}.`,
          recentAverage,
          lowestRecorded: lowest,
          highestRecorded: highest,
          currentPrice,
          targetPrice,
          predictionRange: [Math.round(lowest * 0.98), Math.round(recentAverage * 0.97)],
          predictionConfidence: history.length >= 3 ? 'high' : 'medium',
          confidenceNote: 'Prediction is an estimate modeled from historical retailer price signals and is not guaranteed.',
          pros: ins.pros,
          cons: ins.cons,
          whatToWatch: ins.whatToWatch,
        };
      }
    } catch (err) {
      console.warn('[aiService] Live Groq insight fetch fallback:', err);
    }

    // Deterministic factual fallback if backend unreachable
    let verdict: BuyVerdict = 'maybe_wait';
    let genZBadge = '🟡 Watching this one';
    let headline = 'Fair price based on live retailer listing.';
    let explanation = `Current price of ₹${currentPrice.toLocaleString()} is active on ${product.store || 'Amazon'}.`;

    if (currentPrice <= targetPrice) {
      verdict = 'good_time';
      genZBadge = '🎯 Target price reached!';
      headline = 'Target threshold met. Optimal buy window!';
      explanation = `Current price of ₹${currentPrice.toLocaleString()} has breached your target threshold of ₹${targetPrice.toLocaleString()}.`;
    } else if (product.discountPercent && product.discountPercent >= 15) {
      verdict = 'good_time';
      genZBadge = '🔥 This price is cooking.';
      headline = `Significant ${product.discountPercent}% discount detected.`;
      explanation = `Currently ₹${((product.originalPrice || highest) - currentPrice).toLocaleString()} below reference price.`;
    }

    return {
      verdict,
      genZBadge,
      headline,
      explanation,
      recentAverage,
      lowestRecorded: lowest,
      highestRecorded: highest,
      currentPrice,
      targetPrice,
      predictionRange: [Math.round(lowest * 0.98), Math.round(recentAverage * 0.97)],
      predictionConfidence: history.length >= 4 ? 'high' : 'medium',
      confidenceNote: 'Prediction is an estimate modeled from retailer trend data and is not guaranteed.',
      pros: [`Direct verified listing on ${product.store || 'Amazon'}`, 'Automated price drop alerts enabled'],
      cons: ['Prices may fluctuate during seasonal flash events'],
      whatToWatch: 'Keep alert notifications on to catch spontaneous drops.',
    };
  },

  /**
   * Compare 2 products on specs and price trade-offs
   */
  async compareProducts(productA: any, productB: any) {
    // Try Gemini comparison endpoint first
    try {
      const response = await fetch('/api/gemini/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productA, productB }),
      });
      const data = await response.json();
      if (data.success && data.comparison) {
        return {
          comparisonSummary: data.comparison.conciseSummary,
          tradeOffs: data.comparison.tradeOffs,
          majorDifferences: data.comparison.majorDifferences,
          suitableUserForA: data.comparison.suitableUserForA,
          suitableUserForB: data.comparison.suitableUserForB,
          provider: data.comparison.provider || 'Google Gemini'
        };
      }
    } catch {
      // Fallback to Groq compare
      try {
        const response = await fetch('/api/ai/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productA, productB }),
        });
        const data = await response.json();
        if (data.success && data.comparison) {
          return data.comparison;
        }
      } catch (err) {
        console.warn('[aiService] compareProducts error:', err);
      }
    }

    const priceDiff = Math.abs(productA.currentPrice - productB.currentPrice);
    const cheaper = productA.currentPrice < productB.currentPrice ? productA.name : productB.name;
    return {
      comparisonSummary: `${cheaper} costs ₹${priceDiff.toLocaleString()} less. Compare specifications directly to choose the best option.`,
      tradeOffs: [`Price difference: ₹${priceDiff.toLocaleString()}`],
      majorDifferences: [
        `Price: ₹${productA.currentPrice?.toLocaleString()} vs ₹${productB.currentPrice?.toLocaleString()}`
      ],
      verdict: 'Evaluate based on preferred features and budget.',
    };
  },

  /**
   * Natural language shopping assistant query (Gemini-primary with Groq fallback)
   */
  async queryShoppingAssistant(
    query: string,
    availableProducts: Product[],
    userPreferences?: string
  ) {
    // 1. Try Gemini Assistant
    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, availableProducts, userPreferences }),
      });
      const data = await response.json();
      if (data.success && data.result) {
        return data.result;
      }
    } catch {
      // 2. Fallback to Groq Assistant
      try {
        const response = await fetch('/api/ai/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, availableProducts }),
        });
        const data = await response.json();
        if (data.success && data.result) {
          return data.result;
        }
      } catch (err) {
        console.warn('[aiService] Assistant error:', err);
      }
    }

    // 3. Deterministic search fallback
    const q = query.toLowerCase();
    const matches = availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );

    return {
      explanation:
        matches.length > 0
          ? `Found ${matches.length} verified products matching "${query}".`
          : `Showing top deals matching your price range and preferences.`,
      matchedProductIds: matches.slice(0, 4).map((p) => p.id),
      provider: 'Keyword Matcher'
    };
  },
};
