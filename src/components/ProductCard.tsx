import { useState } from 'react';
import { ExternalLink, Target, Trash2, LineChart, Sparkles, Star, ShieldCheck, ShoppingCart, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { usePriceWatch } from '../context/PriceWatchContext';
import { Link } from 'react-router-dom';
import AnalogDealMeter from './AnalogDealMeter';
import RecordPurchaseModal from './RecordPurchaseModal';

interface ProductCardProps {
  product: Product;
  showRemove?: boolean;
}

export default function ProductCard({ product, showRemove = true }: ProductCardProps) {
  const { setActiveProductId, removeProduct, addToCart, cartItems } = usePriceWatch();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const isAlreadyInCart = cartItems.some(
    (c) => c.productId === product.id || c.name.toLowerCase() === product.name.toLowerCase()
  );

  const priceDiff = (product.previousPrice || product.currentPrice) - product.currentPrice;
  const isDrop = priceDiff > 0;
  const isIncrease = priceDiff < 0;
  const isTargetMet = product.targetPrice ? product.currentPrice <= product.targetPrice : false;

  // Progress to target
  const distanceToTarget = Math.max(0, product.currentPrice - (product.targetPrice || product.currentPrice * 0.9));
  const progressPercent = isTargetMet
    ? 100
    : Math.min(95, Math.max(10, Math.round(((product.targetPrice || product.currentPrice * 0.9) / product.currentPrice) * 100)));

  // Status configuration
  let statusBadge = {
    label: 'Watching',
    bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
    dot: 'bg-blue-500'
  };

  if (isTargetMet) {
    statusBadge = {
      label: 'Target Reached',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      dot: 'bg-emerald-500'
    };
  } else if (isDrop) {
    statusBadge = {
      label: 'Price Dropped',
      bg: 'bg-orange-50 text-orange-700 border-orange-200/60',
      dot: 'bg-orange-500'
    };
  } else if (isIncrease) {
    statusBadge = {
      label: 'Price Increased',
      bg: 'bg-red-50 text-red-700 border-red-200/60',
      dot: 'bg-red-500'
    };
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between group">
        <div>
          {/* Header: Store and Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/60 flex items-center gap-1">
                <ShieldCheck size={12} className="text-blue-600" />
                {product.store || 'Amazon India'}
              </span>
              {product.source?.includes('SerpApi') && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Live
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
              {showRemove && (
                <button
                  onClick={() => removeProduct(product.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
                  title="Remove watch"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Product Media & Title */}
          <div className="flex gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1.5">
                {product.rating && (
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {product.rating}
                    {product.reviewCount ? ` (${product.reviewCount.toLocaleString()})` : ''}
                  </span>
                )}
                <span className="text-[11px] text-gray-400">
                  {product.lastChecked || 'Live'}
                </span>
              </div>
            </div>
          </div>

          {/* Price Metrics Box */}
          <div className="bg-gray-50/80 rounded-2xl p-3.5 mb-4 border border-gray-100">
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-gray-900">
                  ₹{product.currentPrice.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.currentPrice ? (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                ) : null}
              </div>

              {product.discountPercent ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {product.discountPercent}% OFF
                </span>
              ) : null}
            </div>

            {/* Analog Deal Meter Widget */}
            <div className="pt-2 mt-2 border-t border-gray-200/60">
              <AnalogDealMeter
                score={product.dealScore || (product.discountPercent ? Math.min(95, 60 + product.discountPercent) : 68)}
                status={product.dealStatus}
                size="sm"
              />
            </div>

            {/* Target Price & Distance */}
            {product.targetPrice ? (
              <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <Target size={13} className="text-blue-600" />
                  <span>Target: <strong>₹{product.targetPrice.toLocaleString()}</strong></span>
                </div>
                <span className="text-gray-500 font-semibold text-[11px]">
                  {isTargetMet ? (
                    <span className="text-emerald-600 font-bold">Goal reached!</span>
                  ) : (
                    `₹${distanceToTarget.toLocaleString()} to goal`
                  )}
                </span>
              </div>
            ) : null}

            {/* Progress bar to target */}
            {product.targetPrice ? (
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isTargetMet ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Footer */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => addToCart(product)}
              className={`flex-1 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                isAlreadyInCart
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              <ShoppingCart size={13} />
              <span>{isAlreadyInCart ? 'In Cart' : '+ Cart'}</span>
            </button>

            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex-1 text-xs font-bold py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              title="Record as bought to calculate realized savings into Savings Vault"
            >
              <ShoppingBag size={13} />
              <span>Mark Bought 💰</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/history"
              onClick={() => setActiveProductId(product.id)}
              className="flex-1 text-xs font-bold text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-gray-200/80 py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <LineChart size={13} />
              <span>History</span>
            </Link>
            <Link
              to="/alternatives"
              onClick={() => setActiveProductId(product.id)}
              className="flex-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Alts</span>
            </Link>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition flex items-center gap-1"
              title="Buy now on retailer"
            >
              <span>Store</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Record Purchase Modal */}
      <RecordPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        prefillProduct={product}
      />
    </>
  );
}

