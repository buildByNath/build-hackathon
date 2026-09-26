// src/components/CartItemCard.tsx
import { useState } from 'react';
import type { CartItem } from '../types';
import { usePriceWatch } from '../context/PriceWatchContext';
import {
  ExternalLink,
  Target,
  Trash2,
  Pause,
  Play,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Clock,
  Zap,
} from 'lucide-react';
import RecordPurchaseModal from './RecordPurchaseModal';

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { removeFromCart, toggleCartTracking, updateCartItemTarget, simulateCartPriceChange } =
    usePriceWatch();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(item.targetPrice.toString());
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const priceDiff = item.currentPrice - item.previousPrice;
  const isDrop = priceDiff < 0;
  const isIncrease = priceDiff > 0;
  const isTargetMet = item.currentPrice <= item.targetPrice;
  const distanceToTarget = Math.max(0, item.currentPrice - item.targetPrice);

  const handleSaveTarget = () => {
    const val = Number(targetInput);
    if (val > 0) {
      updateCartItemTarget(item.id, val);
    }
    setIsEditingTarget(false);
  };

  const handleQuickSimulateDrop = (dropAmount: number) => {
    const newPrice = Math.max(1000, item.currentPrice - dropAmount);
    simulateCartPriceChange(item.id, newPrice);
  };

  return (
    <>
      <div
        className={`bg-white rounded-3xl border transition-all duration-300 p-5 flex flex-col justify-between group shadow-xs hover:shadow-md ${
          item.trackingStatus === 'paused'
            ? 'opacity-70 border-gray-200 bg-gray-50/50'
            : isTargetMet
            ? 'border-emerald-300 ring-2 ring-emerald-500/10'
            : isDrop
            ? 'border-orange-200 bg-orange-50/10'
            : 'border-gray-200/80'
        }`}
      >
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200/60">
                {item.store}
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {item.category || 'Cart Item'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Status Badge */}
              {item.trackingStatus === 'paused' ? (
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                  ⏸️ Paused
                </span>
              ) : isTargetMet ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                  🎯 Target Reached
                </span>
              ) : isDrop ? (
                <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                  <TrendingDown size={12} />
                  Price Dropped
                </span>
              ) : (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  🟢 Monitoring
                </span>
              )}

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
                title="Remove from Cart Tracking"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Product Media & Title */}
          <div className="flex gap-3.5 mb-3.5">
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                {item.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {item.lastChecked}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-gray-50/80 rounded-2xl p-3.5 mb-3.5 border border-gray-100 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Current Cart Price</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900">
                  ₹{item.currentPrice.toLocaleString()}
                </span>
              </div>

              {/* Price Change Pill */}
              {isDrop ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <TrendingDown size={13} />
                    -₹{Math.abs(priceDiff).toLocaleString()} ({Math.abs(item.percentageChange)}%)
                  </span>
                  <span className="text-[11px] text-gray-400 block line-through mt-0.5">
                    Was ₹{item.previousPrice.toLocaleString()}
                  </span>
                </div>
              ) : isIncrease ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    <TrendingUp size={13} />
                    +₹{priceDiff.toLocaleString()} (+{item.percentageChange}%)
                  </span>
                  <span className="text-[11px] text-gray-400 block line-through mt-0.5">
                    Was ₹{item.previousPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  No recent change
                </span>
              )}
            </div>

            {/* Target Price Section */}
            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Target size={13} className="text-blue-600" />
                <span>
                  Target: <strong>₹{item.targetPrice.toLocaleString()}</strong>
                </span>
                <button
                  onClick={() => setIsEditingTarget(!isEditingTarget)}
                  className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  {isEditingTarget ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <span className="text-[11px] font-bold">
                {isTargetMet ? (
                  <span className="text-emerald-600">Goal Reached!</span>
                ) : (
                  <span className="text-gray-500">₹{distanceToTarget.toLocaleString()} above goal</span>
                )}
              </span>
            </div>

            {/* Inline Target Edit Form */}
            {isEditingTarget && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-white"
                  placeholder="Set target price"
                />
                <button
                  onClick={handleSaveTarget}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {/* Mark Purchased Button -> Opens RecordPurchaseModal */}
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="Record this cart item as bought and lock realized savings into Savings Vault"
            >
              <ShoppingBag size={14} />
              <span>Mark Purchased 💰</span>
            </button>

            {/* Pause / Resume Button */}
            <button
              onClick={() => toggleCartTracking(item.id)}
              className="p-2.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              title={item.trackingStatus === 'active' ? 'Pause Tracking' : 'Resume Tracking'}
            >
              {item.trackingStatus === 'active' ? <Pause size={14} /> : <Play size={14} />}
            </button>

            {/* Retailer Store Link */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center justify-center"
              title="Open Retailer Page"
            >
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Quick Simulation / Hackathon Test Bar */}
          <div className="pt-1.5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-amber-500" />
              Demo Simulator:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleQuickSimulateDrop(2000)}
                className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded font-bold transition cursor-pointer"
                title="Simulate ₹2,000 price drop"
              >
                -₹2,000
              </button>
              <button
                onClick={() => handleQuickSimulateDrop(5000)}
                className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded font-bold transition cursor-pointer"
                title="Simulate ₹5,000 price drop"
              >
                -₹5,000
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Record Purchase Modal */}
      <RecordPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        prefillProduct={item}
      />
    </>
  );
}
