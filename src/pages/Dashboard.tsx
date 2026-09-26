// src/pages/Dashboard.tsx
import { useState } from 'react';
import { Eye, TrendingDown, IndianRupee, Target, PlusCircle, Search, Sparkles } from 'lucide-react';
import { usePriceWatch } from '../context/PriceWatchContext';
import StatCard from '../components/StatCard';
import PriceDropCard from '../components/PriceDropCard';
import ProductCard from '../components/ProductCard';
import AddProductModal from '../components/AddProductModal';

export default function Dashboard() {
  const { products, stats } = usePriceWatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'drops' | 'targets' | 'watching'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter products based on search and tab
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.store.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'drops') {
      return p.previousPrice > p.currentPrice;
    }
    if (selectedFilter === 'targets') {
      return p.currentPrice <= p.targetPrice;
    }
    if (selectedFilter === 'watching') {
      return p.currentPrice > p.targetPrice && p.previousPrice <= p.currentPrice;
    }
    return true;
  });

  // Top price drop product to feature in the alert banner
  const featuredDrop = products.find(
    (p) => p.currentPrice <= p.targetPrice || p.previousPrice > p.currentPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Good morning 👋
            </h1>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Live Monitor Online
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Here’s what’s happening with your tracked products today.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Add Product Watch</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Watching"
          value={`${stats.totalWatching} products`}
          subtitle="Actively monitored"
          icon={<Eye size={20} />}
          highlightColor="blue"
        />
        <StatCard
          title="Price Drops"
          value={`${stats.priceDropsDetected} detected`}
          subtitle="Across monitored stores"
          icon={<TrendingDown size={20} />}
          trend={{ value: `${stats.priceDropsDetected} active`, isPositive: true }}
          highlightColor="orange"
        />
        <StatCard
          title="Potential Savings"
          value={`₹${stats.potentialSavings.toLocaleString()}`}
          subtitle="Below retailer MSRP"
          icon={<IndianRupee size={20} />}
          trend={{ value: 'Saved', isPositive: true }}
          highlightColor="emerald"
        />
        <StatCard
          title="Target Reached"
          value={`${stats.targetsReached} products`}
          subtitle="Ready for purchase"
          icon={<Target size={20} />}
          highlightColor="purple"
        />
      </div>

      {/* Featured Price Drop Alert Card */}
      {featuredDrop && (
        <div className="mb-8">
          <PriceDropCard product={featuredDrop} />
        </div>
      )}

      {/* Watchlist Section Header & Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Price Watches</h2>
            <p className="text-xs text-gray-500">Tracked products with live price metrics and distance to target</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search watches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setSelectedFilter('drops')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              selectedFilter === 'drops'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
            }`}
          >
            🔥 Price Dropped ({stats.priceDropsDetected})
          </button>
          <button
            onClick={() => setSelectedFilter('targets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              selectedFilter === 'targets'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
            }`}
          >
            🎯 Target Reached ({stats.targetsReached})
          </button>
          <button
            onClick={() => setSelectedFilter('watching')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              selectedFilter === 'watching'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
            }`}
          >
            👀 Watching ({products.length - stats.targetsReached - stats.priceDropsDetected})
          </button>
        </div>
      </div>

      {/* Watchlist Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-xs text-gray-500 mb-6">
            {searchTerm
              ? `No tracked items matching "${searchTerm}". Try another search.`
              : "You don't have any products in this view yet."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:bg-primary/90 transition cursor-pointer"
          >
            Track your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
