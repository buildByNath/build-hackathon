// src/components/AlternativeCard.tsx
import type { AlternativeProduct } from '../types';

import { Sparkles, Star, Plus, ExternalLink, CheckCircle } from 'lucide-react';
import { usePriceWatch } from '../context/PriceWatchContext';

interface AlternativeCardProps {
  alternative: AlternativeProduct;
  onCompare?: (alt: AlternativeProduct) => void;
}

export default function AlternativeCard({ alternative, onCompare }: AlternativeCardProps) {
  const { addProduct, products } = usePriceWatch();

  const isAlreadyTracked = products.some(
    (p) => p.name.toLowerCase().includes(alternative.name.toLowerCase().slice(0, 15))
  );

  const handleTrackAlternative = () => {
    addProduct({
      id: `prod-alt-${Date.now()}`,
      name: alternative.name,
      url: alternative.productUrl,
      imageUrl: alternative.imageUrl,
      store: alternative.store,
      category: 'Electronics',
      brand: alternative.name.split(' ')[0],
      currentPrice: alternative.price,
      previousPrice: alternative.originalPrice || alternative.price,
      originalPrice: alternative.originalPrice,
      targetPrice: Math.round(alternative.price * 0.9),
      currency: '₹',
      specs: alternative.specs,
      lastChecked: 'Just now',
      discountPercent: alternative.originalPrice
        ? Number((((alternative.originalPrice - alternative.price) / alternative.originalPrice) * 100).toFixed(1))
        : 10
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition duration-200 p-5 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-md">
            {alternative.store}
          </span>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
            <Sparkles size={12} />
            <span>{alternative.similarityPercent}% Match</span>
          </div>
        </div>

        {/* Media and Product Info */}
        <div className="flex gap-3.5 mb-3">
          <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
            <img
              src={alternative.imageUrl}
              alt={alternative.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
              {alternative.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-500 text-xs font-bold">
                <Star size={13} className="fill-amber-400 text-amber-400 mr-0.5" />
                <span>{alternative.rating}</span>
              </div>
              <span className="text-gray-400 text-xs">
                ({alternative.reviewsCount.toLocaleString()} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Price & Savings Display */}
        <div className="bg-emerald-50/60 rounded-xl p-3 mb-3 border border-emerald-100/70">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-gray-900">
              ₹{alternative.price.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Save ₹{alternative.savings.toLocaleString()}
            </span>
          </div>
          {alternative.originalPrice && (
            <span className="text-[11px] text-gray-500 line-through block mt-0.5">
              Original: ₹{alternative.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Key Specs Pills */}
        <div className="space-y-1.5 mb-3">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Key Highlights:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(alternative.specs).slice(0, 3).map(([key, value]) => (
              <span
                key={key}
                className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200/50"
              >
                <strong>{key}:</strong> {value}
              </span>
            ))}
          </div>
        </div>

        {/* AI Explanation Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs mb-4">
          <div className="flex items-center gap-1 text-purple-700 font-bold mb-1">
            <Sparkles size={13} />
            <span>AI Comparison Insight</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            {alternative.aiInsight}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {onCompare && (
          <button
            onClick={() => onCompare(alternative)}
            className="flex-1 text-xs font-bold text-gray-800 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl transition cursor-pointer"
          >
            Compare Specs
          </button>
        )}

        <button
          onClick={handleTrackAlternative}
          disabled={isAlreadyTracked}
          className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
            isAlreadyTracked
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
        >
          {isAlreadyTracked ? (
            <>
              <CheckCircle size={14} />
              <span>Tracked</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>Track Product</span>
            </>
          )}
        </button>

        <a
          href={alternative.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center justify-center"
          title="Open retailer product page"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
