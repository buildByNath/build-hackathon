import { Flame, ArrowRight, TrendingDown, ExternalLink } from 'lucide-react';
import type { Product } from '../types';

import { Link } from 'react-router-dom';
import { usePriceWatch } from '../context/PriceWatchContext';

interface PriceDropCardProps {
  product: Product;
}

export default function PriceDropCard({ product }: PriceDropCardProps) {
  const { setActiveProductId } = usePriceWatch();
  const savings = product.previousPrice - product.currentPrice;
  const isTargetMet = product.currentPrice <= product.targetPrice;

  if (savings <= 0 && !isTargetMet) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-600 text-white p-6 sm:p-7 shadow-lg shadow-orange-500/15">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl flex-shrink-0">
            <Flame size={32} className="text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                {isTargetMet ? '🎯 Target Price Reached' : '🔥 Price Drop Detected'}
              </span>
              <span className="text-xs text-orange-100 font-medium">
                {product.store}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  ₹{product.currentPrice.toLocaleString()}
                </span>
                <span className="text-base text-orange-200 line-through">
                  ₹{product.previousPrice.toLocaleString()}
                </span>
              </div>
              
              {savings > 0 && (
                <span className="inline-flex items-center gap-1 bg-white text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  <TrendingDown size={14} />
                  You save ₹{savings.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white text-gray-900 hover:bg-orange-50 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2"
          >
            <span>View Deal</span>
            <ExternalLink size={16} />
          </a>
          <Link
            to="/history"
            onClick={() => setActiveProductId(product.id)}
            className="px-4 py-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white rounded-xl font-medium text-sm transition flex items-center gap-1.5"
          >
            <span>View History</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
