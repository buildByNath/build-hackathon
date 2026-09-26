import type { StoreListing } from '../types';

import { ExternalLink, Check, ShoppingBag, ArrowDownRight } from 'lucide-react';

interface CrossStoreComparisonProps {
  listings: StoreListing[];
  productName: string;
}

export default function CrossStoreComparison({ listings }: CrossStoreComparisonProps) {
  if (!listings || listings.length === 0) return null;

  const lowestPrice = Math.min(...listings.map((l) => l.price));
  const highestPrice = Math.max(...listings.map((l) => l.price));

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            Cross-Store Retailer Comparison
          </h3>
          <p className="text-xs text-gray-500">Live prices for the exact same model across top Indian retailers</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-1.5 flex items-center gap-1.5 self-start sm:self-auto">
          <ArrowDownRight size={16} className="text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800">
            Lowest available: <strong>₹{lowestPrice.toLocaleString()}</strong> (Save up to ₹{(highestPrice - lowestPrice).toLocaleString()})
          </span>
        </div>
      </div>

      {/* Table for Desktop / Cards for Mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-gray-400 font-semibold border-b border-gray-100 uppercase tracking-wider text-[11px]">
              <th className="pb-3 pr-4">Store</th>
              <th className="pb-3 pr-4">Price</th>
              <th className="pb-3 pr-4">Difference</th>
              <th className="pb-3 pr-4">Stock & Delivery</th>
              <th className="pb-3 pr-4">Last Checked</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map((item, idx) => {
              const isLowest = item.price === lowestPrice;
              const diffFromLowest = item.price - lowestPrice;

              return (
                <tr
                  key={idx}
                  className={`hover:bg-gray-50/80 transition ${
                    isLowest ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 pr-4 font-semibold text-gray-900 flex items-center gap-2">
                    <span>{item.store}</span>
                    {isLowest && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check size={10} />
                        BEST PRICE
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-[11px] text-gray-400 line-through ml-1.5">
                        ₹{item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    {isLowest ? (
                      <span className="text-emerald-600 font-semibold">Lowest</span>
                    ) : (
                      <span className="text-gray-500 font-medium">
                        +₹{diffFromLowest.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-gray-700 block font-medium">
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {item.deliveryTime && (
                      <span className="text-[11px] text-gray-400">{item.deliveryTime}</span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 text-gray-400">{item.lastUpdated}</td>
                  <td className="py-3.5 text-right">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isLowest
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      <span>Buy Store</span>
                      <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
