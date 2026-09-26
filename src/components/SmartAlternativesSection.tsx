// src/components/SmartAlternativesSection.tsx
import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { alternativeService, type SmartAlternativesResponse, type SmartAlternativeItem } from '../services/alternativeService';
import { usePriceWatch } from '../context/PriceWatchContext';
import {
  Lightbulb,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  Star,
  Tag,
  Loader2,
  TrendingDown,
  TrendingUp,
  Maximize2,
  ShieldCheck,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface SmartAlternativesSectionProps {
  product: Product;
  onTrackAlternative?: (altProduct: Product) => void;
  className?: string;
}

export default function SmartAlternativesSection({
  product,
  onTrackAlternative,
  className = ''
}: SmartAlternativesSectionProps) {
  const { addProduct, products } = usePriceWatch();
  const [data, setData] = useState<SmartAlternativesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandRange, setExpandRange] = useState<boolean>(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const loadAlternatives = async (isExpanded: boolean) => {
    setIsLoading(true);
    try {
      const res = await alternativeService.fetchSmartAlternatives(product, isExpanded);
      setData(res);
    } catch (err) {
      console.error('[SmartAlternativesSection] Error fetching alternatives:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setExpandRange(false);
    loadAlternatives(false);
  }, [product.id, product.currentPrice, product.name]);

  const handleExpandToggle = () => {
    const nextExpand = !expandRange;
    setExpandRange(nextExpand);
    loadAlternatives(nextExpand);
  };

  const handleTrackAlt = (item: SmartAlternativeItem) => {
    const newProd: Product = {
      id: item.id || `prod-amz-${item.asin || Date.now()}`,
      name: item.name,
      url: item.url,
      imageUrl: item.imageUrl,
      store: item.store || 'Amazon India',
      category: item.category || product.category || 'Electronics',
      brand: item.brand || 'Amazon',
      currentPrice: item.currentPrice,
      previousPrice: item.previousPrice || Math.round(item.currentPrice * 1.05),
      originalPrice: item.originalPrice,
      targetPrice: Math.round(item.currentPrice * 0.9),
      currency: '₹',
      specs: {},
      lastChecked: 'Just now',
      discountPercent: item.originalPrice ? Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100) : undefined,
      asin: item.asin,
      rating: item.rating,
      reviewCount: item.reviewCount,
      source: 'Alternative Pick'
    };

    if (onTrackAlternative) {
      onTrackAlternative(newProd);
    } else {
      addProduct(newProd);
    }

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 3000);
  };

  const isAlreadyTracked = (item: SmartAlternativeItem) => {
    return products.some((p) => p.id === item.id || (p.asin && item.asin && p.asin.toUpperCase() === item.asin.toUpperCase()));
  };

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-lg relative ${className}`}>
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-300/40 flex items-center justify-center text-amber-600">
              <Lightbulb size={20} className="text-amber-500 fill-amber-400/30" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              💡 Better Alternatives
            </h3>
            {data?.subcategory && (
              <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                {data.subcategory}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Similar products around the same price range (₹{product.currentPrice.toLocaleString()})
          </p>
        </div>

        {/* Filter / Meta badge */}
        {data && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-gray-200">
              <Tag size={13} className="text-primary" />
              <span>
                Range: ₹{data.priceRange.min.toLocaleString()} – ₹{data.priceRange.max.toLocaleString()}
              </span>
              {data.priceRange.isExpanded && (
                <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-bold">
                  Expanded
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT BODY */}
      {isLoading ? (
        <div className="py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 animate-pulse h-64 flex flex-col justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : !data || data.alternatives.length === 0 ? (
        /* NO RESULTS / EMPTY STATE WITH EXPAND OPTION */
        <div className="py-10 px-4 text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto mb-3">
            <ArrowRightLeft size={24} />
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">
            No close alternatives found around this price.
          </h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
            We searched for {data?.subcategory || 'same category'} products within ±₹{data?.priceRange.priceMargin || 500} of ₹{product.currentPrice.toLocaleString()}.
          </p>
          <button
            type="button"
            onClick={handleExpandToggle}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Maximize2 size={14} />
            <span>Expand Price Range (±₹{data?.priceRange.priceMargin ? data.priceRange.priceMargin * 2 : 1000})</span>
          </button>
        </div>
      ) : (
        /* ALTERNATIVES CARDS GRID */
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.alternatives.map((alt) => {
              const isAdded = addedIds[alt.id];
              const tracked = isAlreadyTracked(alt);

              return (
                <div
                  key={alt.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Top Labels Row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {alt.labels.map((label, idx) => {
                        const isCheaper = label.includes('Cheaper');
                        const isBetter = label.includes('Better Rated');
                        const isMatch = label.includes('Closest Match');

                        return (
                          <span
                            key={idx}
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              isMatch
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isCheaper
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isBetter
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>

                    {/* Image & Product Title */}
                    <div className="flex gap-3 items-start mb-3">
                      <img
                        src={alt.imageUrl}
                        alt={alt.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          {alt.brand} • {alt.subcategory}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                          {alt.name}
                        </h4>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-600">
                          <Star size={12} className="text-amber-500 fill-amber-400" />
                          <span className="font-bold text-gray-900">{alt.rating}</span>
                          <span className="text-gray-400">({alt.reviewCount.toLocaleString()})</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Price Difference Banner */}
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Alternative Price</span>
                        <span className="text-base sm:text-lg font-black text-gray-900">
                          ₹{alt.currentPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Price Difference Pill */}
                      <div className="text-right">
                        {alt.priceDifference < 0 ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                            <TrendingDown size={13} />
                            {alt.priceDifferenceText}
                          </span>
                        ) : alt.priceDifference > 0 ? (
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                            <TrendingUp size={13} />
                            {alt.priceDifferenceText}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                            Exact same price
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <a
                      href={alt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Product</span>
                      <ExternalLink size={13} />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleTrackAlt(alt)}
                      disabled={tracked}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        tracked || isAdded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {tracked || isAdded ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Watching</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle size={13} />
                          <span>Track Price</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer controls & Expand Range toggle */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-gray-500 font-medium flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              Excludes original product • Filtered strictly by same category & approximate price
            </span>

            <button
              type="button"
              onClick={handleExpandToggle}
              className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 size={13} />
              <span>{expandRange ? 'Reset to primary ±₹500 range' : 'Expand price range'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
