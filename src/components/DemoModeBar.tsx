// src/components/DemoModeBar.tsx
import { useState } from 'react';
import { Sparkles, ArrowDownRight, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { usePriceWatch } from '../context/PriceWatchContext';

export default function DemoModeBar() {
  const { simulatePriceDrop, resetDemoData } = usePriceWatch();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm border-b border-amber-400/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
              Demo Mode / Simulation
            </span>
            <span className="hidden sm:inline text-xs text-amber-100">
              Simulate live price drops during presentation & testing:
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs text-amber-100 hover:text-white flex items-center gap-1 font-medium bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
            >
              {isOpen ? (
                <>
                  <span>Hide controls</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>Simulate events</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="mt-2 pt-2 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-amber-100 font-medium">Quick Simulators:</span>

            <button
              onClick={() => simulatePriceDrop('prod-s25', 64999, 'Midnight Flash Sale')}
              className="bg-white text-gray-900 hover:bg-amber-50 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
            >
              <ArrowDownRight size={14} className="text-emerald-600" />
              <span>Drop Galaxy S25 to ₹64,999 (Target Hit!)</span>
            </button>

            <button
              onClick={() => simulatePriceDrop('prod-xm5', 24999, 'Audio Sale')}
              className="bg-white text-gray-900 hover:bg-amber-50 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
            >
              <ArrowDownRight size={14} className="text-emerald-600" />
              <span>Drop Sony XM5 to ₹24,999 (₹3k drop)</span>
            </button>

            <button
              onClick={() => simulatePriceDrop('prod-macbook-m3', 114990, 'Diwali Tech Drop')}
              className="bg-white text-gray-900 hover:bg-amber-50 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Drop MacBook M3 to ₹1,14,990</span>
            </button>

            <button
              onClick={resetDemoData}
              className="ml-auto bg-black/20 hover:bg-black/30 text-white px-2.5 py-1 rounded-md flex items-center gap-1 transition cursor-pointer"
              title="Reset all prices and notifications"
            >
              <RotateCcw size={12} />
              <span>Reset State</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
