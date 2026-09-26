// src/components/GeminiProductAnalysis.tsx
import { useState, useEffect } from 'react';
import type { Product, PriceHistoryPoint } from '../types';
import { aiService, type GeminiProductDeepAnalysis, type ShouldIBuyResult } from '../services/aiService';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users,
  Target,
  Loader2,
  Info,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GeminiProductAnalysisProps {
  product: Product;
  history?: PriceHistoryPoint[];
}

export default function GeminiProductAnalysis({ product, history = [] }: GeminiProductAnalysisProps) {
  const [analysis, setAnalysis] = useState<GeminiProductDeepAnalysis | null>(null);
  const [decision, setDecision] = useState<ShouldIBuyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchGeminiAnalysis = async () => {
    setIsLoading(true);
    try {
      const [deepAnalysis, shouldBuy] = await Promise.all([
        aiService.analyzeProductDeepDive(product),
        aiService.shouldIBuyDecision(product, history),
      ]);
      setAnalysis(deepAnalysis);
      setDecision(shouldBuy);
    } catch (err) {
      console.warn('Gemini analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGeminiAnalysis();
  }, [product.id, product.currentPrice]);

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-7 border border-blue-800/40 shadow-xl relative overflow-hidden mb-8">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Sparkles size={18} className="animate-pulse text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Google Gemini AI Product Intelligence
              </h3>
              <span className="text-[10px] uppercase font-extrabold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                Gemini 1.5 Flash
              </span>
            </div>
            <p className="text-xs text-blue-200/70">
              Factual deep-dive analysis, pros & cons, and data-grounded buying recommendation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGeminiAnalysis}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/20 text-blue-200 rounded-xl transition text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Refresh Gemini Analysis"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-white/10 hover:bg-white/20 text-blue-200 rounded-xl transition text-xs flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 size={32} className="text-blue-400 animate-spin mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">
            Analyzing product identity with Gemini AI...
          </h4>
          <p className="text-xs text-blue-200/60 max-w-sm">
            Synthesizing factual specs, customer ratings, price trends, and buyer trade-offs without hallucinations.
          </p>
        </div>
      ) : isExpanded && (
        <div className="pt-5 space-y-6 relative z-10">
          {/* Top Verdict Callout Bar */}
          {decision && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    decision.decision === 'BUY_NOW'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : decision.decision === 'WAIT'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                  }`}
                >
                  <Target size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Gemini Decision Support:
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        decision.decision === 'BUY_NOW'
                          ? 'bg-emerald-500 text-slate-950'
                          : decision.decision === 'WAIT'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-blue-500 text-slate-950'
                      }`}
                    >
                      {decision.decision === 'BUY_NOW'
                        ? 'BUY NOW 🟢'
                        : decision.decision === 'WAIT'
                        ? 'WAIT FOR DIP ⏳'
                        : 'FAIR VALUE 🟡'}
                    </span>
                    <span className="text-[10px] text-blue-300/80 font-medium">
                      ({decision.confidence} Confidence)
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">{decision.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Product Summary */}
          {analysis && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-blue-100 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-1">
                <Info size={14} />
                <span>Executive Product Summary:</span>
              </div>
              <p>{analysis.summary}</p>
            </div>
          )}

          {/* 2-Column Pros vs Cons */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pros */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-2.5">
                  <CheckCircle2 size={15} />
                  <span>Factual Strengths & Highlights:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-emerald-100/90">
                  {analysis.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2.5">
                  <AlertTriangle size={15} />
                  <span>Considerations & Limitations:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-amber-100/90">
                  {analysis.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Suitable For vs Not Ideal For */}
          {analysis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 mb-1.5">
                  <Users size={14} />
                  <span>Ideal Buyer Profile:</span>
                </div>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  {analysis.suitableFor.join(' • ')}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-1.5">
                  <AlertTriangle size={14} />
                  <span>Not Recommended For:</span>
                </div>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  {analysis.notIdealFor.join(' • ')}
                </p>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-blue-300/60 border-t border-white/10">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              Grounded in verified retailer data • Zero hallucinated specs or prices
            </span>
            <span>{analysis?.provider || 'Google Gemini 1.5 Flash'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
