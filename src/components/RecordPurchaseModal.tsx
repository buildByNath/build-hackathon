// src/components/RecordPurchaseModal.tsx
import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { usePriceWatch } from '../context/PriceWatchContext';
import type { Product, CartItem, ReferencePriceType } from '../types';
import {
  X,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface RecordPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillProduct?: Product | CartItem | null;
}

export default function RecordPurchaseModal({
  isOpen,
  onClose,
  prefillProduct,
}: RecordPurchaseModalProps) {
  const { products, cartItems, recordPurchase } = usePriceWatch();

  // Combine unique products from watchlist and cart
  const allAvailableItems = [
    ...products,
    ...cartItems.map((c) => ({
      id: c.productId,
      name: c.name,
      currentPrice: c.currentPrice,
      previousPrice: c.previousPrice,
      originalPrice: c.highestTrackedPrice,
      imageUrl: c.imageUrl,
      store: c.store,
      category: c.category || 'Electronics',
      url: c.url,
      targetPrice: c.targetPrice,
    })),
  ].filter((v, i, a) => a.findIndex((t) => t.name.toLowerCase() === v.name.toLowerCase()) === i);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [store, setStore] = useState('Amazon India');
  const [category, setCategory] = useState('Electronics');
  const [imageUrl, setImageUrl] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [referenceType, setReferenceType] = useState<ReferencePriceType>('initial_tracked');
  const [referencePrice, setReferencePrice] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [orderRef, setOrderRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [recordedRecord, setRecordedRecord] = useState<any>(null);

  // When modal opens or prefillProduct changes, populate form
  useEffect(() => {
    if (prefillProduct) {
      const prodId = 'productId' in prefillProduct ? prefillProduct.productId : prefillProduct.id;
      setSelectedProductId(prodId || '');
      setProductName(prefillProduct.name);
      setStore(prefillProduct.store || 'Amazon India');
      setCategory(prefillProduct.category || 'Electronics');
      setImageUrl(prefillProduct.imageUrl || '');
      setPurchasePrice(prefillProduct.currentPrice.toString());

      const ref =
        ('highestTrackedPrice' in prefillProduct ? (prefillProduct as CartItem).highestTrackedPrice : 0) ||
        ('originalPrice' in prefillProduct ? (prefillProduct as Product).originalPrice : 0) ||
        prefillProduct.previousPrice ||
        prefillProduct.currentPrice;
      setReferencePrice(ref.toString());
      setReferenceType('initial_tracked');
    } else if (products.length > 0) {
      const first = products[0];
      setSelectedProductId(first.id);
      setProductName(first.name);
      setStore(first.store);
      setCategory(first.category || 'Electronics');
      setImageUrl(first.imageUrl);
      setPurchasePrice(first.currentPrice.toString());
      setReferencePrice((first.originalPrice || first.previousPrice || first.currentPrice).toString());
      setReferenceType('initial_tracked');
    }
  }, [prefillProduct, isOpen, products]);

  // Handle dropdown product change
  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const item = allAvailableItems.find((p) => p.id === id);
    if (item) {
      setProductName(item.name);
      setStore(item.store || 'Amazon India');
      setCategory(item.category || 'Electronics');
      setImageUrl(item.imageUrl || '');
      setPurchasePrice(item.currentPrice.toString());
      setReferencePrice((item.originalPrice || item.previousPrice || item.currentPrice).toString());
    }
  };

  // Reference type labels
  const referenceTypeLabels: Record<ReferencePriceType, string> = {
    initial_tracked: 'Initial Tracked Price',
    historical_average: 'Historical Average Price',
    launch_peak: 'Launch / Peak Reference Price',
    user_custom: 'User Expected Retail Price',
  };

  // Calculations
  const numPurchase = Number(purchasePrice) || 0;
  const numReference = Number(referencePrice) || 0;
  const rawSavings = numReference - numPurchase;
  const calculatedSavings = Math.max(0, rawSavings);
  const calculatedPercentage =
    numReference > 0 ? Number(((calculatedSavings / numReference) * 100).toFixed(1)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || numPurchase <= 0 || numReference <= 0) return;

    const record = recordPurchase({
      productId: selectedProductId || `prod-custom-${Date.now()}`,
      productName,
      category,
      store,
      imageUrl,
      referencePrice: numReference,
      referenceType,
      referenceTypeLabel: referenceTypeLabels[referenceType],
      purchasePrice: numPurchase,
      purchaseDate,
      orderRef,
      notes,
      isDemo,
    });

    setRecordedRecord(record);
    setShowCelebration(true);
  };

  const handleFinish = () => {
    setShowCelebration(false);
    setRecordedRecord(null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-gray-100">
                {showCelebration && recordedRecord ? (
                  // 🎉 CELEBRATION MODAL STATE
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <Sparkles size={32} />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                      🎉 Purchase Recorded Successfully
                    </span>

                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-3 mb-1">
                      You Saved ₹{recordedRecord.savings.toLocaleString()}!
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                      {recordedRecord.savings > 0
                        ? `Great timing! You bought at ${recordedRecord.savingsPercentage}% below the reference price.`
                        : 'Purchase logged to your record history.'}
                    </p>

                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-left mb-6 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Item:</span>
                        <span className="font-bold text-gray-900 truncate max-w-[220px]">
                          {recordedRecord.productName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reference ({recordedRecord.referenceTypeLabel}):</span>
                        <span className="font-medium text-gray-700">
                          ₹{recordedRecord.referencePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Paid:</span>
                        <span className="font-bold text-gray-900">
                          ₹{recordedRecord.purchasePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-emerald-200 text-sm font-extrabold text-emerald-800">
                        <span>Realized Savings:</span>
                        <span>₹{recordedRecord.savings.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleFinish}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
                      >
                        View in Savings Vault
                      </button>
                    </div>
                  </div>
                ) : (
                  // FORM STATE
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-black text-gray-900 flex items-center gap-2"
                      >
                        <ShoppingBag size={20} className="text-emerald-600" />
                        <span>Record a Purchase</span>
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 mb-4">
                      Lock in your actual purchase price and calculate your realized savings.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Product Selector */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Select Tracked Item
                        </label>
                        <select
                          value={selectedProductId}
                          onChange={(e) => handleProductSelect(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                        >
                          {allAvailableItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name.slice(0, 45)}... (₹{item.currentPrice.toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Reference Price Definition Section */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <span>Comparison Reference Price</span>
                            <span title="What would you have paid without tracking?" className="text-slate-400 cursor-help">
                              <HelpCircle size={13} />
                            </span>
                          </label>
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border">
                            Baseline
                          </span>
                        </div>

                        {/* Reference Type Options */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {(
                            [
                              ['initial_tracked', 'Initial Tracked'],
                              ['historical_average', 'Historical Avg'],
                              ['launch_peak', 'Launch Price'],
                              ['user_custom', 'Custom Target/MSRP'],
                            ] as const
                          ).map(([type, label]) => (
                            <button
                              type="button"
                              key={type}
                              onClick={() => setReferenceType(type)}
                              className={`p-2 rounded-lg border text-left font-medium transition cursor-pointer ${
                                referenceType === type
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* Reference Amount Input */}
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={referencePrice}
                            onChange={(e) => setReferencePrice(e.target.value)}
                            placeholder="79999"
                            required
                            className="w-full pl-7 pr-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>

                      {/* Actual Purchase Price */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Actual Purchase Price (What you paid)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-emerald-600 font-bold">₹</span>
                          <input
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            placeholder="69999"
                            required
                            className="w-full pl-7 pr-3 py-2 text-sm font-black text-gray-900 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>

                      {/* Realized Savings Math Box */}
                      <div
                        className={`p-3.5 rounded-2xl border transition ${
                          calculatedSavings > 0
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <TrendingDown size={14} className={calculatedSavings > 0 ? 'text-emerald-600' : 'text-gray-400'} />
                            Realized Money Saved:
                          </span>
                          <span className="text-base font-black text-emerald-700">
                            ₹{calculatedSavings.toLocaleString()}{' '}
                            {calculatedPercentage > 0 && `(${calculatedPercentage}%)`}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {rawSavings <= 0
                            ? 'Purchase price equals or exceeds reference price. Realized savings recorded as ₹0.'
                            : `Deterministic calculation: ₹${numReference.toLocaleString()} − ₹${numPurchase.toLocaleString()} = ₹${calculatedSavings.toLocaleString()} kept in your wallet.`}
                        </p>
                      </div>

                      {/* Store & Date Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Retailer / Store
                          </label>
                          <div className="relative">
                            <Building2 size={13} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                              type="text"
                              value={store}
                              onChange={(e) => setStore(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Purchase Date
                          </label>
                          <div className="relative">
                            <Calendar size={13} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                              type="date"
                              value={purchaseDate}
                              onChange={(e) => setPurchaseDate(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Optional Order Ref & Notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Order / Invoice # (Optional)
                          </label>
                          <div className="relative">
                            <FileText size={13} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                              type="text"
                              value={orderRef}
                              onChange={(e) => setOrderRef(e.target.value)}
                              placeholder="e.g. AMZ-402-91823"
                              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Notes / Context (Optional)
                          </label>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Card cash back applied"
                            className="w-full px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Demo Mode Toggle */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isDemo}
                            onChange={(e) => setIsDemo(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 font-medium">
                            Mark as Demo / Test Purchase
                          </span>
                        </label>
                        {isDemo && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Separate from Real Savings Total
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                          <span>Record Purchase to Vault</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
