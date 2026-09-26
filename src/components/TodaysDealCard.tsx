// src/components/TodaysDealCard.tsx
import { Star, ExternalLink, TrendingDown, ShieldCheck, Eye, ShoppingCart } from 'lucide-react';
import type { DealProduct } from '../data/dealsData';
import { dealToProduct } from '../data/dealsData';
import { usePriceWatch } from '../context/PriceWatchContext';
import AnalogDealMeter from './AnalogDealMeter';

interface TodaysDealCardProps {
  deal: DealProduct;
}

// Deal type badge colors
function getDealTypeBadge(dealType: string) {
  switch (dealType) {
    case 'price_drop':
      return { label: 'Price Drop', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'deal_of_the_day':
      return { label: 'Deal of the Day', bg: 'bg-red-50 text-red-700 border-red-200' };
    case 'lightning_deal':
      return { label: 'Lightning Deal', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'festive_sale':
      return { label: 'Festive Sale', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'clearance':
      return { label: 'Clearance', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: 'Discount', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
}

export default function TodaysDealCard({ deal }: TodaysDealCardProps) {
  const { addProduct, products, addToCart, cartItems } = usePriceWatch();
  const dealTypeBadge = getDealTypeBadge(deal.dealType);

  const isAlreadyTracked = products.some(
    (p) => p.id === deal.id || p.asin === deal.asin
  );
  const isAlreadyInCart = cartItems.some(
    (c) => c.productId === deal.id || c.name.toLowerCase() === deal.title.toLowerCase()
  );

  const handleTrackPrice = () => {
    if (isAlreadyTracked) return;
    const product = dealToProduct(deal);
    addProduct(product);
  };

  const handleAddToCart = () => {
    if (isAlreadyInCart) return;
    const product = dealToProduct(deal);
    addToCart(product);
  };

  // Fallback image handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.brand)}&background=e2e8f0&color=475569&size=200&font-size=0.4&bold=true`;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Discount Ribbon */}
      {deal.discountPercentage >= 30 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-1 rounded-full shadow-sm">
            <TrendingDown size={11} />
            {deal.discountPercentage}% OFF
          </span>
        </div>
      )}

      <div>
        {/* Header: Store + Deal Type */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/60 flex items-center gap-1">
              <ShieldCheck size={12} className="text-blue-600" />
              {deal.storeName}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dealTypeBadge.bg}`}>
            {dealTypeBadge.label}
          </span>
        </div>

        {/* Product Image & Title */}
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5">
            <img
              src={deal.image}
              alt={deal.title}
              className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition duration-300"
              onError={handleImageError}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
              {deal.title}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">{deal.brand} · {deal.subcategory}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                {deal.rating}
                {deal.reviewCount ? ` (${deal.reviewCount.toLocaleString()})` : ''}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">{deal.availability}</span>
            </div>
          </div>
        </div>

        {/* Price Block */}
        <div className="bg-gray-50/80 rounded-2xl p-3.5 mb-4 border border-gray-100">
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-gray-900">
                ₹{deal.currentPrice.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ₹{deal.originalPrice.toLocaleString()}
              </span>
            </div>
            {deal.discountPercentage < 30 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {deal.discountPercentage}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
            <span className="font-medium">
              Save <strong className="text-emerald-700">₹{deal.savingsAmount.toLocaleString()}</strong>
            </span>
            <span className="text-gray-400">Seller: {deal.seller}</span>
          </div>

          {/* Deal Score Meter */}
          <div className="pt-2 mt-2 border-t border-gray-200/60">
            <AnalogDealMeter
              score={deal.dealScore * 10}
              status={deal.dealType.replace(/_/g, ' ')}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTrackPrice}
            className={`flex-1 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              isAlreadyTracked
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
            }`}
          >
            <Eye size={13} />
            <span>{isAlreadyTracked ? 'Tracking' : 'Track Price'}</span>
          </button>
          <button
            onClick={handleAddToCart}
            className={`flex-1 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              isAlreadyInCart
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-900 hover:bg-gray-800 text-white shadow-xs'
            }`}
          >
            <ShoppingCart size={13} />
            <span>{isAlreadyInCart ? 'In Cart' : '+ Cart'}</span>
          </button>
        </div>
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-xs font-bold text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-gray-200/80 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <span>View Deal on {deal.storeName}</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
