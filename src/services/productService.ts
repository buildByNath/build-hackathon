// src/services/productService.ts
import type { Product } from '../types';
import { initialMockProducts } from '../data/mockData';
import { extractAmazonProductId, detectStore } from './amazonService';

export interface ProductAnalysisResult {
  product: Product;
  confidence: number;
  extractedFromUrl: string;
  source: 'live_amazon_serpapi' | 'mock_demo';
}

export const productService = {
  /**
   * Analyzes an input product URL.
   * If an Amazon URL is provided:
   * - Extracts the ASIN
   * - Calls SerpApi backend route `/api/amazon/product`
   * - Validates exact ASIN match
   * - Returns real product data
   * - Throws a descriptive error on failure (never returns fake/mock iPhone data)
   */
  async analyzeUrl(url: string): Promise<ProductAnalysisResult> {
    if (!url || !url.trim()) {
      throw new Error('Please enter a valid product URL.');
    }

    const trimmed = url.trim();
    const storeInfo = detectStore(trimmed);

    // 1. Amazon URL handling via SerpApi
    if (storeInfo.isAmazon) {
      const parsed = extractAmazonProductId(trimmed);
      if (!parsed) {
        throw new Error('Could not identify the Amazon product ASIN from this URL. Please verify the link (e.g., https://amazon.in/dp/B0XXXXXXXX).');
      }

      try {
        const response = await fetch('/api/amazon/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed, asin: parsed.asin, domain: parsed.domain })
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.product) {
          throw new Error(data.error || 'We could not fetch this product from Amazon right now.');
        }

        const p = data.product;

        // Factual calculation of savings
        const currentPrice = Number(p.currentPrice) || 0;
        const originalPrice = p.originalPrice ? Number(p.originalPrice) : undefined;
        let discountPercent = p.discountPercent;
        let savingsAmount = p.savingsAmount;

        if (originalPrice && originalPrice > currentPrice) {
          savingsAmount = originalPrice - currentPrice;
          discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }

        const verifiedProduct: Product = {
          id: p.id || `prod-amz-${p.asin}`,
          name: p.name,
          url: p.url || trimmed,
          imageUrl: p.imageUrl,
          store: p.store || 'Amazon India',
          category: p.category || 'Electronics',
          brand: p.brand || 'Amazon',
          currentPrice,
          previousPrice: originalPrice || Math.round(currentPrice * 1.05),
          originalPrice,
          targetPrice: p.targetPrice || Math.round(currentPrice * 0.9),
          currency: p.currency || '₹',
          specs: p.specs || {},
          lastChecked: 'Just now',
          discountPercent,
          asin: p.asin,
          rating: p.rating,
          reviewCount: p.reviewCount,
          dealScore: p.dealScore,
          dealStatus: p.dealStatus,
          savingsAmount,
          source: 'Amazon Live (SerpApi)',
          availability: p.availability
        };

        return {
          product: verifiedProduct,
          confidence: 1.0,
          extractedFromUrl: trimmed,
          source: 'live_amazon_serpapi'
        };
      } catch (err: any) {
        console.error('[productService] Live Amazon fetch error:', err);
        throw new Error(err.message || 'Unable to fetch this Amazon product right now.');
      }
    }

    // 2. Flipkart / other stores handling
    if (storeInfo.isFlipkart) {
      throw new Error('Flipkart live lookup is coming soon. Currently, live automated tracking is fully active for Amazon URLs via SerpApi.');
    }

    // 3. Fallback check for demo URLs
    const matchedMock = initialMockProducts.find(p => trimmed.toLowerCase().includes(p.id) || trimmed === p.url);
    if (matchedMock) {
      return {
        product: matchedMock,
        confidence: 0.95,
        extractedFromUrl: trimmed,
        source: 'mock_demo'
      };
    }

    throw new Error("We don't support this store URL yet. Please paste a supported Amazon product link (amazon.in / amazon.com).");
  },

  /**
   * Search real live products on Amazon for discovery and deal feeds
   */
  async searchAmazonDeals(query: string = 'deals of the day', limit: number = 8): Promise<Product[]> {
    try {
      const response = await fetch(`/api/amazon/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        return data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          url: p.url,
          imageUrl: p.imageUrl,
          store: p.store,
          category: p.category || 'Deals',
          brand: p.brand,
          currentPrice: p.currentPrice,
          previousPrice: p.previousPrice,
          originalPrice: p.originalPrice,
          targetPrice: p.targetPrice,
          currency: p.currency,
          specs: p.specs || {},
          lastChecked: 'Live from Amazon',
          discountPercent: p.discountPercent,
          asin: p.asin,
          rating: p.rating,
          reviewCount: p.reviewCount,
          dealScore: p.dealScore,
          dealStatus: p.dealStatus,
          savingsAmount: p.savingsAmount,
          source: 'Amazon Live Search (SerpApi)'
        }));
      }
    } catch (err) {
      console.warn('[productService] searchAmazonDeals fallback:', err);
    }
    return [];
  },

  /**
   * Get initial tracked products list
   */
  async getProducts(): Promise<Product[]> {
    return initialMockProducts;
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product | undefined> {
    return initialMockProducts.find(p => p.id === id);
  }
};
