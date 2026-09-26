import type { PriceHistoryPoint } from '../types';

import { mockPriceHistories } from '../data/mockData';

export interface PriceStatistics {
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  currentPrice: number;
  targetPrice: number;
  overallDrop: number;
  percentageDrop: number;
}

export const priceService = {
  /**
   * Fetch price history series for a given product
   */
  async getPriceHistory(productId: string): Promise<PriceHistoryPoint[]> {
    return mockPriceHistories[productId] || [
      { id: '1', productId, price: 49999, recordedAt: '2026-08-01', source: 'Initial' },
      { id: '2', productId, price: 47999, recordedAt: '2026-09-01', source: 'Price drop' },
      { id: '3', productId, price: 44999, recordedAt: '2026-09-26', source: 'Current' }
    ];
  },

  /**
   * Calculate stats: lowest, highest, average, and drop
   */
  calculateStatistics(history: PriceHistoryPoint[], currentPrice: number, targetPrice: number): PriceStatistics {
    if (!history || history.length === 0) {
      return {
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        averagePrice: currentPrice,
        currentPrice,
        targetPrice,
        overallDrop: 0,
        percentageDrop: 0
      };
    }

    const prices = history.map(h => h.price);
    const lowest = Math.min(...prices, currentPrice);
    const highest = Math.max(...prices, currentPrice);
    const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const startPrice = prices[0];
    const drop = startPrice - currentPrice;
    const percentageDrop = Number(((drop / startPrice) * 100).toFixed(1));

    return {
      lowestPrice: lowest,
      highestPrice: highest,
      averagePrice: average,
      currentPrice,
      targetPrice,
      overallDrop: Math.max(0, drop),
      percentageDrop
    };
  }
};
