// src/services/alternativeService.ts
import type { AlternativeProduct, StoreListing } from '../types';

import { mockAlternativesData, mockCrossStoreListings } from '../data/mockData';

export const alternativeService = {
  /**
   * Get alternative recommendations (both exact same product across stores & similar alternatives)
   */
  async getAlternatives(productId: string): Promise<AlternativeProduct[]> {
    return mockAlternativesData[productId] || [];
  },

  /**
   * Get cross-store price comparison table for the exact item
   */
  async getCrossStoreListings(productId: string): Promise<StoreListing[]> {
    return mockCrossStoreListings[productId] || [];
  }
};
