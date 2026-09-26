// src/pages/History.tsx
import { useEffect, useState } from 'react';
import { usePriceWatch } from '../context/PriceWatchContext';
import { priceService, type PriceStatistics } from '../services/priceService';
import { aiService } from '../services/aiService';
import PriceChart from '../components/PriceChart';
import AIInsightCard from '../components/AIInsightCard';
import GeminiProductAnalysis from '../components/GeminiProductAnalysis';
import SmartAlternativesSection from '../components/SmartAlternativesSection';
import StatCard from '../components/StatCard';
import type { PriceHistoryPoint, AIDealInsight } from '../types';
import {
  LineChart,
  ArrowDownRight,
  ArrowUpRight,
  Target,
  IndianRupee,
  ExternalLink,
  PlusCircle,
  Calendar,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function History() {
  const { products, activeProductId, setActiveProductId } = usePriceWatch();
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [stats, setStats] = useState<PriceStatistics | null>(null);
  const [dealInsight, setDealInsight] = useState<AIDealInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const selectedProduct = products.find((p) => p.id === activeProductId) || products[0];

  useEffect(() => {
    if (!selectedProduct) return;

    setLoading(true);
    priceService.getPriceHistory(selectedProduct.id).then((historyData) => {
      setHistory(historyData);

      const computedStats = priceService.calculateStatistics(
        historyData,
        selectedProduct.currentPrice,
        selectedProduct.targetPrice
      );
      setStats(computedStats);

      aiService.generateDealInsight(selectedProduct, historyData).then((insight) => {
        setDealInsight(insight);
        setLoading(false);
      });
    });
  }, [selectedProduct, selectedProduct?.currentPrice, selectedProduct?.targetPrice]);

  // Filter history based on selected timeframe
  const filteredHistory = history.filter((pt) => {
    if (timeframe === 'all') return true;
    const ptDate = new Date(pt.recordedAt).getTime();
    const now = new Date().getTime();
    const diffDays = (now - ptDate) / (1000 * 3600 * 24);

    if (timeframe === '7d') return diffDays <= 7;
    if (timeframe === '30d') return diffDays <= 30;
    if (timeframe === '90d') return diffDays <= 90;
    return true;
  });

  const handleAddSnapshot = () => {
    if (!selectedProduct) return;
    const newPoint: PriceHistoryPoint = {
      id: `snap-${Date.now()}`,
      productId: selectedProduct.id,
      price: selectedProduct.currentPrice,
      recordedAt: new Date().toISOString().split('T')[0],
      source: `${selectedProduct.store} (Live Snapshot)`,
      note: 'Manual check'
    };

    const updated = [...history, newPoint];
    setHistory(updated);
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 3000);
  };

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        No tracked products to display.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Selector and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LineChart size={22} className="text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Price History & Intelligence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Historical price logs, trend analysis, and predictive buy timing
          </p>
        </div>

        {/* Product Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Selected Product:
          </label>
          <select
            value={selectedProduct.id}
            onChange={(e) => setActiveProductId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.slice(0, 32)}... (₹{p.currentPrice.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Product Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center bg-white">
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck size={12} className="text-primary" />
                {selectedProduct.store}
              </span>
              <span className="text-xs text-gray-400">
                Checked {selectedProduct.lastChecked}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2">
              {selectedProduct.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          <div>
            <span className="text-xs text-gray-400 block">Current Price</span>
            <span className="text-2xl font-black text-gray-900">
              ₹{selectedProduct.currentPrice.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Target Alert</span>
            <span className="text-xl font-bold text-emerald-600">
              ₹{selectedProduct.targetPrice.toLocaleString()}
            </span>
          </div>
          <a
            href={selectedProduct.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
            title="Open Store URL"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* 4 Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Lowest Price"
            value={`₹${stats.lowestPrice.toLocaleString()}`}
            subtitle="All-time recorded"
            icon={<ArrowDownRight size={18} />}
            highlightColor="emerald"
          />
          <StatCard
            title="Highest Price"
            value={`₹${stats.highestPrice.toLocaleString()}`}
            subtitle="Launch/Peak price"
            icon={<ArrowUpRight size={18} />}
            highlightColor="orange"
          />
          <StatCard
            title="Recent Average"
            value={`₹${stats.averagePrice.toLocaleString()}`}
            subtitle="Historical baseline"
            icon={<IndianRupee size={18} />}
            highlightColor="blue"
          />
          <StatCard
            title="Overall Change"
            value={stats.percentageDrop > 0 ? `↓ ${stats.percentageDrop}%` : 'Stable'}
            subtitle={stats.overallDrop > 0 ? `Saved ₹${stats.overallDrop.toLocaleString()}` : 'No drop'}
            icon={<Target size={18} />}
            trend={{ value: `${stats.percentageDrop}%`, isPositive: stats.percentageDrop > 0 }}
            highlightColor="purple"
          />
        </div>
      )}

      {/* Main Chart + AI Deal Insight Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {/* Timeframe selector header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {(['7d', '30d', '90d', 'all'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    timeframe === tf ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tf === 'all' ? 'All Time' : tf.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddSnapshot}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              {snapshotSuccess ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Snapshot Logged!</span>
                </>
              ) : (
                <>
                  <PlusCircle size={13} />
                  <span>Log Live Snapshot</span>
                </>
              )}
            </button>
          </div>

          {loading ? (
            <div className="h-80 bg-white rounded-3xl border border-gray-100 flex items-center justify-center text-gray-400">
              Loading price history graph...
            </div>
          ) : (
            <PriceChart
              history={filteredHistory.length > 0 ? filteredHistory : history}
              currentPrice={selectedProduct.currentPrice}
              targetPrice={selectedProduct.targetPrice}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          {dealInsight && <AIInsightCard insight={dealInsight} />}
        </div>
      </div>

      {/* Google Gemini AI Deep-Dive Analysis */}
      <GeminiProductAnalysis product={selectedProduct} history={history} />

      {/* 💡 Smart Same-Category Alternatives */}
      <SmartAlternativesSection product={selectedProduct} className="mb-8" />

      {/* Price Snapshot Log Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <Calendar size={18} className="text-primary" />
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            Recorded Price Snapshot Logs ({history.length} entries)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 uppercase font-semibold text-[11px] border-b border-gray-100">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Recorded Price</th>
                <th className="pb-3 pr-4">Retailer / Source</th>
                <th className="pb-3 pr-4">Event Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((pt, idx) => (
                <tr key={pt.id || idx} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 pr-4 font-semibold text-gray-700">{pt.recordedAt}</td>
                  <td className="py-3 pr-4 font-black text-gray-900">
                    ₹{pt.price.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{pt.source}</td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {pt.note || 'Recorded Snapshot'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
