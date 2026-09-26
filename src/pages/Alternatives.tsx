import { useEffect, useState } from 'react';
import { usePriceWatch } from '../context/PriceWatchContext';
import { alternativeService } from '../services/alternativeService';
import AlternativeCard from '../components/AlternativeCard';
import CrossStoreComparison from '../components/CrossStoreComparison';
import SmartAlternativesSection from '../components/SmartAlternativesSection';
import type { AlternativeProduct, StoreListing } from '../types';

import { Sparkles, ArrowRightLeft, X, Check, Watch, Smartphone, Headphones, Laptop, Layers } from 'lucide-react';

export default function Alternatives() {
  const { products, activeProductId, setActiveProductId } = usePriceWatch();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);
  const [storeListings, setStoreListings] = useState<StoreListing[]>([]);
  const [comparingAlt, setComparingAlt] = useState<AlternativeProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Available categories with icons
  const categories = [
    { id: 'all', label: 'All Products', icon: Layers },
    { id: 'Smartwatches', label: 'Smartwatches', icon: Watch },
    { id: 'Smartphones', label: 'Smartphones', icon: Smartphone },
    { id: 'Audio', label: 'Audio & ANC', icon: Headphones },
    { id: 'Laptops', label: 'Laptops', icon: Laptop },
  ];

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  // Find currently selected product or fallback to the first in the active category
  let selectedProduct = products.find((p) => p.id === activeProductId);
  if (!selectedProduct || (selectedCategory !== 'all' && selectedProduct.category?.toLowerCase() !== selectedCategory.toLowerCase())) {
    selectedProduct = filteredProducts[0] || products[0];
  }

  // When user clicks a category tab, select the first product in that category
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const categoryProducts = categoryId === 'all'
      ? products
      : products.filter((p) => p.category?.toLowerCase() === categoryId.toLowerCase());
    if (categoryProducts.length > 0) {
      setActiveProductId(categoryProducts[0].id);
    }
  };

  useEffect(() => {
    if (!selectedProduct) return;

    setIsLoading(true);
    Promise.all([
      alternativeService.getAlternatives(selectedProduct.id),
      alternativeService.getCrossStoreListings(selectedProduct.id),
    ]).then(([alts, listings]) => {
      setAlternatives(alts);
      setStoreListings(listings);
      setIsLoading(false);
    });
  }, [selectedProduct?.id]);

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        No tracked products to display alternatives for.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={24} className="text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Better Alternatives & Multi-Store Deals
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Compare similar products across value-for-money, battery, and specs, plus check prices across top retailers.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer flex-shrink-0 shadow-2xs ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon size={15} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Quick-Select Carousel/Grid */}
      <div className="mb-8">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
          Select Product to Compare:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredProducts.map((p) => {
            const isCurrent = p.id === selectedProduct.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveProductId(p.id)}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover bg-white p-1 border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 truncate">
                      {p.category || 'Product'}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">
                    {p.name}
                  </h4>
                  <div className="text-xs font-extrabold text-gray-900 mt-0.5">
                    ₹{p.currentPrice.toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tracked Baseline Product Summary Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={selectedProduct.imageUrl}
            alt={selectedProduct.name}
            className="w-16 h-16 object-cover rounded-2xl bg-white p-1 flex-shrink-0"
          />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Check size={13} className="text-blue-400" />
              Comparing Alternatives For (Baseline)
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">{selectedProduct.name}</h3>
            <span className="text-xs text-gray-400">Category: {selectedProduct.category} • Store: {selectedProduct.store}</span>
          </div>
        </div>

        <div className="text-right self-stretch sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
          <span className="text-xs text-gray-400 block">Current Best Price</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">
            ₹{selectedProduct.currentPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 1. Cross-Store Same Product Comparison */}
      {storeListings.length > 0 && (
        <div className="mb-10">
          <CrossStoreComparison listings={storeListings} productName={selectedProduct.name} />
        </div>
      )}

      {/* 2. Real Smart Same-Category Alternatives */}
      <SmartAlternativesSection product={selectedProduct} className="mb-10" />

      {/* 2. Similar Alternative Products Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600" />
            AI-Ranked Value Alternatives for {selectedProduct.name.slice(0, 30)}...
          </h2>
          <p className="text-xs text-gray-500">
            Products with comparable performance, higher battery, or better value-per-rupee
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs animate-pulse h-72" />
            ))}
          </div>
        ) : alternatives.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center text-gray-500 text-xs">
            No specific alternatives found for this item yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alternatives.map((alt) => (
              <AlternativeCard
                key={alt.id}
                alternative={alt}
                onCompare={(item) => setComparingAlt(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side-by-side spec comparison modal */}
      {comparingAlt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={20} className="text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Side-by-Side Product Comparison</h3>
              </div>
              <button
                onClick={() => setComparingAlt(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Side-by-side header */}
            <div className="grid grid-cols-2 gap-4 my-6 text-center">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Tracked Product
                </span>
                <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-2">
                  {selectedProduct.name}
                </h4>
                <div className="text-lg font-black text-gray-900 mt-1">
                  ₹{selectedProduct.currentPrice.toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Alternative Pick ({comparingAlt.similarityPercent}% Match)
                </span>
                <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-2">
                  {comparingAlt.name}
                </h4>
                <div className="text-lg font-black text-emerald-700 mt-1">
                  ₹{comparingAlt.price.toLocaleString()}
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                  Save ₹{comparingAlt.savings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Spec Matrix */}
            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Specification Breakdown
              </span>
              {Object.keys({ ...selectedProduct.specs, ...comparingAlt.specs }).map((specKey) => (
                <div
                  key={specKey}
                  className="grid grid-cols-3 gap-2 py-2 px-3 bg-gray-50/70 rounded-xl text-xs items-center"
                >
                  <span className="text-gray-500 font-semibold">{specKey}</span>
                  <span className="text-gray-900 font-medium">
                    {selectedProduct.specs[specKey] || '—'}
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    {comparingAlt.specs[specKey] || '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Recommendation Summary */}
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 mb-6">
              <div className="flex items-center gap-1 text-purple-700 font-bold text-xs mb-1">
                <Sparkles size={14} />
                <span>AI Recommendation Summary</span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed">
                {comparingAlt.aiInsight}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setComparingAlt(null)}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
