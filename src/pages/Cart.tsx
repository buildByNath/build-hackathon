// src/pages/Cart.tsx
import { useState } from 'react';
import { usePriceWatch } from '../context/PriceWatchContext';
import CartItemCard from '../components/CartItemCard';
import StatCard from '../components/StatCard';
import AddProductModal from '../components/AddProductModal';
import RecordPurchaseModal from '../components/RecordPurchaseModal';
import {
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Target,
  RefreshCw,
  PlusCircle,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

export default function Cart() {
  const {
    cartItems,
    cartSummary,
    checkCartPricesNow,
    simulateCartPriceChange,
    products,
    addToCart,
  } = usePriceWatch();

  const [activeTab, setActiveTab] = useState<'all' | 'drops' | 'targets' | 'increases' | 'paused'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Filter items based on active tab
  const filteredCartItems = cartItems.filter((item) => {
    if (activeTab === 'drops') return item.currentPrice < item.previousPrice;
    if (activeTab === 'targets') return item.currentPrice <= item.targetPrice;
    if (activeTab === 'increases') return item.currentPrice > item.previousPrice;
    if (activeTab === 'paused') return item.trackingStatus === 'paused';
    return true;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkCartPricesNow();
    setIsRefreshing(false);
  };

  const handleSimulateGlobalDrop = () => {
    if (cartItems.length > 0) {
      // Pick first active item and simulate a price drop
      const target = cartItems[0];
      const newPrice = Math.max(1000, target.currentPrice - 3500);
      simulateCartPriceChange(target.id, newPrice);
    }
  };

  const isCartCheaper = cartSummary.cartPriceChange < 0;
  const isCartMoreExpensive = cartSummary.cartPriceChange > 0;
  const netDiff = Math.abs(cartSummary.cartPriceChange);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <ShoppingCart size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              My Tracked Cart
            </h1>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Live Monitor Online
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time price change detection for items in your shopping cart. We notify you the second cart items drop.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
            <span>{isRefreshing ? 'Checking Retailers...' : 'Check Prices Now'}</span>
          </button>

          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>Record a Purchase 💰</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Track New Item</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Cart Items"
          value={`${cartSummary.totalItems} products`}
          subtitle="Actively monitored in cart"
          icon={<ShoppingCart size={20} />}
          highlightColor="blue"
        />
        <StatCard
          title="Current Cart Value"
          value={`₹${cartSummary.currentCartValue.toLocaleString()}`}
          subtitle="Total live retailer cost"
          icon={<Sparkles size={20} />}
          highlightColor="purple"
        />
        <StatCard
          title="Previous Tracked Value"
          value={`₹${cartSummary.previousCartValue.toLocaleString()}`}
          subtitle="Baseline when added"
          icon={<Target size={20} />}
          highlightColor="orange"
        />
        <StatCard
          title="Cart Price Fluctuation"
          value={
            isCartCheaper
              ? `↓ ₹${netDiff.toLocaleString()}`
              : isCartMoreExpensive
              ? `↑ ₹${netDiff.toLocaleString()}`
              : 'Stable'
          }
          subtitle={
            isCartCheaper
              ? '🔥 Cart became cheaper'
              : isCartMoreExpensive
              ? '⚠️ Cart price increased'
              : 'No net change'
          }
          icon={isCartCheaper ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
          trend={{
            value: isCartCheaper
              ? `${cartSummary.itemsWithPriceDrops} items dropped`
              : `${cartSummary.itemsWithPriceIncreases} increased`,
            isPositive: isCartCheaper,
          }}
          highlightColor={isCartCheaper ? 'emerald' : isCartMoreExpensive ? 'orange' : 'blue'}
        />
      </div>

      {/* Cart Summary Callout Banner */}
      <div
        className={`rounded-3xl p-5 sm:p-6 mb-8 border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isCartCheaper
            ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white border-emerald-800/40 shadow-lg'
            : 'bg-white text-gray-900 border-gray-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl flex-shrink-0 ${
              isCartCheaper ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {isCartCheaper ? <TrendingDown size={28} /> : <Info size={28} />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isCartCheaper
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {isCartCheaper ? '🔥 Cart Price Drop Detected' : '🛒 Cart Monitoring Active'}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {cartSummary.totalItems} items in tracked cart
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              {isCartCheaper
                ? `Your tracked cart is ₹${netDiff.toLocaleString()} cheaper than when first monitored!`
                : 'Your tracked cart prices are up to date across retailers.'}
            </h3>
            <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isCartCheaper ? 'text-emerald-200/70' : 'text-gray-500'}`}>
              <strong>Financial clarity:</strong> Cart price changes show current retailer fluctuations. When you buy any item, click <strong>"Mark Purchased"</strong> on its card to record your actual purchase price and lock your realized money into your <strong>Savings Vault</strong>.
            </p>
          </div>
        </div>

        {/* Quick Simulator Button for Hackathon Testing */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-700/40">
          <button
            onClick={handleSimulateGlobalDrop}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            title="Simulate a live price drop on cart items to test notifications and savings"
          >
            <Zap size={14} />
            <span>Simulate Cart Drop</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            🛒 All Cart Items ({cartItems.length})
          </button>

          <button
            onClick={() => setActiveTab('drops')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'drops'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            🔥 Price Drops ({cartSummary.itemsWithPriceDrops})
          </button>

          <button
            onClick={() => setActiveTab('targets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'targets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            🎯 Target Reached ({cartSummary.targetsReached})
          </button>

          <button
            onClick={() => setActiveTab('increases')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'increases'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            ⚠️ Price Increases ({cartSummary.itemsWithPriceIncreases})
          </button>

          <button
            onClick={() => setActiveTab('paused')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'paused'
                ? 'bg-gray-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            ⏸️ Paused ({cartItems.filter((i) => i.trackingStatus === 'paused').length})
          </button>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Verified Retailer Tracked Cart</span>
        </div>
      </div>

      {/* Cart Items Grid */}
      {filteredCartItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={32} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No items match this filter</h3>
          <p className="text-xs text-gray-500 mb-6">
            Add products from your watchlist or paste any Amazon product link to track its cart price.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                // Quick populate from watchlist
                if (products.length > 0) {
                  products.slice(0, 3).forEach((p) => addToCart(p));
                }
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Add Popular Watchlist Items to Cart
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Show All Cart Items
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCartItems.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Record Purchase Modal */}
      <RecordPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
}
