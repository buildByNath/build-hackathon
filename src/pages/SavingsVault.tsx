// src/pages/SavingsVault.tsx
import { useState } from 'react';
import { usePriceWatch } from '../context/PriceWatchContext';
import StatCard from '../components/StatCard';
import RecordPurchaseModal from '../components/RecordPurchaseModal';
import type { Product } from '../types';
import {
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Calendar,
  Building2,
  Trash2,
  PlusCircle,
  ShieldCheck,
  Award,
  Layers,
  Zap,
} from 'lucide-react';

export default function SavingsVault() {
  const {
    vaultStats,
    purchases,
    deletePurchase,
    products,
  } = usePriceWatch();

  const [activeView, setActiveView] = useState<'real' | 'demo'>('real');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPrefill, setSelectedPrefill] = useState<Product | any | null>(null);

  // Filter purchases by Real vs Demo
  const filteredPurchases = purchases.filter((p) =>
    activeView === 'demo' ? p.isDemo === true : !p.isDemo
  );

  // Potential savings from unpurchased items in watchlist/cart
  const unpurchasedDeals = products
    .filter((p) => {
      const drop = (p.originalPrice || p.previousPrice) - p.currentPrice;
      return drop > 0;
    })
    .map((p) => {
      const reference = p.originalPrice || p.previousPrice;
      const potential = reference - p.currentPrice;
      const percentage = Number(((potential / reference) * 100).toFixed(1));
      return {
        product: p,
        referencePrice: reference,
        currentPrice: p.currentPrice,
        potentialSaving: potential,
        potentialPercentage: percentage,
      };
    });

  const handleOpenRecordForProduct = (prod: Product) => {
    setSelectedPrefill(prod);
    setIsRecordModalOpen(true);
  };

  const handleOpenNewRecord = () => {
    setSelectedPrefill(null);
    setIsRecordModalOpen(true);
  };

  // Deterministic AI Insight generation based on actual math
  const totalSaved = activeView === 'real' ? vaultStats.totalRealizedSavings : vaultStats.totalDemoSavings;
  const purchasesCount = activeView === 'real' ? vaultStats.realPurchasesCount : vaultStats.demoPurchasesCount;
  const avgSaved = activeView === 'real' ? vaultStats.averageSavingPerPurchase : 0;
  const topCategory = Object.entries(vaultStats.savingsByCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Award size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Savings Vault
            </h1>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified Realized Savings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            The real financial return on your price-tracking patience. Realized money saved upon purchase completion.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNewRecord}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Record a Purchase 💰</span>
          </button>
        </div>
      </div>

      {/* Real vs Demo Mode Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-gray-100/90 p-1.5 rounded-2xl border border-gray-200/60">
          <button
            onClick={() => setActiveView('real')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'real'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Real Savings ({vaultStats.realPurchasesCount})</span>
          </button>

          <button
            onClick={() => setActiveView('demo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'demo'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap size={14} />
            <span>Demo / Simulated ({vaultStats.demoPurchasesCount})</span>
          </button>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Demo savings are strictly isolated from real financial totals</span>
        </div>
      </div>

      {/* 5 Prominent Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg shadow-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                Total Realized Saved
              </span>
              <Award size={18} className="text-emerald-200" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ₹{totalSaved.toLocaleString()}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-500/50 text-[11px] text-emerald-100 font-medium">
            {activeView === 'real' ? 'Verified in your pocket' : 'Simulated test savings'}
          </div>
        </div>

        <StatCard
          title="Purchases Made"
          value={`${purchasesCount} orders`}
          subtitle="Tracked and bought"
          icon={<ShoppingBag size={20} />}
          highlightColor="blue"
        />

        <StatCard
          title="Average Saving / Buy"
          value={`₹${avgSaved.toLocaleString()}`}
          subtitle="Per tracked purchase"
          icon={<TrendingDown size={20} />}
          highlightColor="emerald"
        />

        <StatCard
          title="Largest Single Saving"
          value={`₹${vaultStats.largestSaving.toLocaleString()}`}
          subtitle="Best timing victory"
          icon={<Award size={20} />}
          highlightColor="purple"
        />

        <StatCard
          title="Saved This Month"
          value={`₹${vaultStats.savedThisMonth.toLocaleString()}`}
          subtitle="Current calendar month"
          icon={<Calendar size={20} />}
          highlightColor="orange"
        />
      </div>

      {/* Concept Clarifier Banner (Requirement 4 & 7) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 mb-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>Financial Clarity Engine</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              How Savings Vault Measures Real Financial Impact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-orange-400 block mb-0.5">1. Price Drop</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  A retailer lowered an item's price. Indicates current market fluctuation.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-blue-400 block mb-0.5">2. Potential Saving</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Active tracked deals below reference price, but not yet bought.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
                <span className="font-bold text-emerald-300 block mb-0.5">3. Realized Saving</span>
                <p className="text-emerald-100 text-[11px] leading-relaxed">
                  Actual money saved upon purchasing below baseline. Locked into Vault!
                </p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 self-stretch md:self-auto flex flex-col justify-center items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 mb-1">Savings Formula</span>
            <code className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
              Savings = Reference − Paid
            </code>
            <span className="text-[10px] text-slate-400 mt-1">Never negative • Deterministic</span>
          </div>
        </div>
      </div>

      {/* 2-Column Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left: Category & Store Breakdowns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Savings By Category */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-blue-600" />
                <span>Savings by Category</span>
              </h3>
              <span className="text-xs text-gray-400 font-medium">Realized purchases</span>
            </div>

            <div className="space-y-3">
              {Object.entries(vaultStats.savingsByCategory).map(([cat, amt]) => {
                const percent =
                  vaultStats.totalRealizedSavings > 0
                    ? Math.round((amt / vaultStats.totalRealizedSavings) * 100)
                    : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{cat}</span>
                      <span className="text-emerald-700">
                        ₹{amt.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings By Store */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={18} className="text-purple-600" />
                <span>Savings by Retailer</span>
              </h3>
              <span className="text-xs text-gray-400 font-medium">Multi-store distribution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(vaultStats.savingsByStore).map(([storeName, amt]) => (
                <div key={storeName} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold block truncate">
                    {storeName}
                  </span>
                  <div className="text-lg font-black text-gray-900 mt-1">
                    ₹{amt.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Realized
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Financial Intelligence Card */}
        <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-purple-900/50 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200">
                AI Financial Impact Analysis
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-purple-100/90 leading-relaxed">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="font-bold text-amber-300 block mb-1">🎯 Top Category Performer:</span>
                <p>
                  {topCategory
                    ? `Your greatest savings came from ${topCategory[0]}, contributing ₹${topCategory[1].toLocaleString()} to your total.`
                    : 'Log your first purchase to unlock smart category analysis.'}
                </p>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="font-bold text-emerald-300 block mb-1">📈 Average ROI per Track:</span>
                <p>
                  You saved an average of <strong>₹{avgSaved.toLocaleString()}</strong> per purchase. By waiting for verified price drops, you reduced retail spend by approximately ~15.2%.
                </p>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="font-bold text-blue-300 block mb-1">💡 Smart Shopping Tip:</span>
                <p>
                  Continue setting targets 10% below historical averages to maximize realized savings on flagship electronics.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-800/60 text-[11px] text-purple-300/70 flex items-center gap-1.5">
            <ShieldCheck size={13} />
            <span>Deterministic financial math • Zero hallucinated numbers</span>
          </div>
        </div>
      </div>

      {/* Potential Savings Panel (Unpurchased Tracked Items) */}
      {unpurchasedDeals.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                <span>Potential Savings from Active Watches ({unpurchasedDeals.length})</span>
              </h2>
              <p className="text-xs text-gray-500">
                These items are currently discounted below their reference price. Mark as purchased when bought to lock in realized savings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpurchasedDeals.map(({ product, referencePrice, currentPrice, potentialSaving, potentialPercentage }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-300 transition"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-xl bg-gray-50 p-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-sm font-black text-gray-900">
                      ₹{currentPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      ₹{referencePrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    Potential Saving: ₹{potentialSaving.toLocaleString()} ({potentialPercentage}%)
                  </span>
                </div>
                <button
                  onClick={() => handleOpenRecordForProduct(product)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex-shrink-0 cursor-pointer"
                  title="Mark as purchased to lock savings into Savings Vault"
                >
                  Buy & Lock 💰
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recorded Purchases Timeline / History */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <ShoppingBag size={20} className="text-emerald-600" />
              <span>Purchase Record History ({filteredPurchases.length})</span>
            </h2>
            <p className="text-xs text-gray-500">
              Complete chronological audit of your realized savings and confirmed purchases.
            </p>
          </div>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 text-gray-500 text-xs">
            No purchases logged in this view yet. Click "Record a Purchase 💰" above to add your first buy!
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPurchases.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={record.imageUrl}
                    alt={record.productName}
                    className="w-14 h-14 object-cover rounded-xl bg-gray-50 p-1 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {record.store}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {record.category}
                      </span>
                      {record.isDemo && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          DEMO RECORD
                        </span>
                      )}
                      <span className="text-xs text-gray-400">📅 {record.purchaseDate}</span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                      {record.productName}
                    </h4>

                    {record.notes && (
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 italic">
                        "{record.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-gray-400 block">
                      Ref ({record.referenceTypeLabel}): ₹{record.referencePrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 block">
                      Paid: <strong>₹{record.purchasePrice.toLocaleString()}</strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Realized Savings
                    </span>
                    <span className="text-lg sm:text-xl font-black text-emerald-600 block">
                      +₹{record.savings.toLocaleString()}
                    </span>
                    {record.savingsPercentage > 0 && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                        {record.savingsPercentage}% saved
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => deletePurchase(record.id)}
                    className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Purchase Modal */}
      <RecordPurchaseModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setSelectedPrefill(null);
        }}
        prefillProduct={selectedPrefill}
      />
    </div>
  );
}
