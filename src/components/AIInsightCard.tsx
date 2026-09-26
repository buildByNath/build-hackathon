import { Sparkles, HelpCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { AIDealInsight } from '../types';

interface AIInsightCardProps {
  insight: AIDealInsight;
  isLoading?: boolean;
}

export default function AIInsightCard({ insight, isLoading = false }: AIInsightCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs text-center py-12">
        <Sparkles size={28} className="text-purple-600 animate-spin mx-auto mb-3" />
        <h4 className="text-sm font-bold text-gray-900 mb-1">🧠 Groq AI Analyzing Deal Data...</h4>
        <p className="text-xs text-gray-400">Evaluating factual retailer pricing and price trend signals</p>
      </div>
    );
  }

  const getVerdictStyle = () => {
    switch (insight.verdict) {
      case 'good_time':
        return {
          badgeBg: 'bg-emerald-500 text-white',
          bannerBg: 'bg-emerald-50/80 border-emerald-200',
          titleColor: 'text-emerald-950',
          icon: <CheckCircle2 size={18} className="text-emerald-600" />,
          label: 'BUY NOW — ATTRACTIVE DEAL',
        };
      case 'wait':
        return {
          badgeBg: 'bg-rose-500 text-white',
          bannerBg: 'bg-rose-50/80 border-rose-200',
          titleColor: 'text-rose-950',
          icon: <AlertTriangle size={18} className="text-rose-600" />,
          label: 'WAIT — PRICE IS HIGH',
        };
      case 'maybe_wait':
      default:
        return {
          badgeBg: 'bg-amber-500 text-white',
          bannerBg: 'bg-amber-50/80 border-amber-200',
          titleColor: 'text-amber-950',
          icon: <Clock size={18} className="text-amber-600" />,
          label: 'MAYBE WAIT — AVERAGE DEAL',
        };
    }
  };

  const verdictStyle = getVerdictStyle();

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2">
              Groq AI Deal Intelligence
              <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Live
              </span>
            </h3>
            <p className="text-[11px] text-gray-500">Autonomous price analysis grounded in real data</p>
          </div>
        </div>

        {/* Gen-Z badge */}
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200/60 shadow-2xs">
          {insight.genZBadge}
        </span>
      </div>

      {/* Should I Buy Now Verdict Box */}
      <div className={`p-4 rounded-2xl border mb-4 ${verdictStyle.bannerBg}`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            {verdictStyle.icon}
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Verdict:
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${verdictStyle.badgeBg}`}>
              {verdictStyle.label}
            </span>
          </div>
        </div>
        <p className={`text-sm font-bold mb-1 ${verdictStyle.titleColor}`}>
          {insight.headline}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          {insight.explanation}
        </p>
      </div>

      {/* Pros & Cons if available */}
      {insight.pros && insight.pros.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              ✓ Deal Advantages
            </span>
            <ul className="text-[11px] text-emerald-950 space-y-1">
              {insight.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-emerald-600">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
              ⚠️ Watch Out
            </span>
            <ul className="text-[11px] text-amber-950 space-y-1">
              {(insight.cons || ['Flash price fluctuations may occur']).map((con, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-amber-600">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Factual Underlying Data Breakdown */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 text-center">
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Recent Avg</span>
          <span className="text-xs sm:text-sm font-bold text-gray-800">
            ₹{insight.recentAverage.toLocaleString()}
          </span>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Lowest</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-600">
            ₹{insight.lowestRecorded.toLocaleString()}
          </span>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Target</span>
          <span className="text-xs sm:text-sm font-bold text-primary">
            ₹{insight.targetPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Price Prediction Box */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles size={13} className="text-purple-600" />
            Estimated 30-Day Outlook
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            Confidence: <strong className="text-slate-800 uppercase">{insight.predictionConfidence}</strong>
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-base font-extrabold text-slate-900">
            ₹{insight.predictionRange[0].toLocaleString()} – ₹{insight.predictionRange[1].toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">
            (Current: ₹{insight.currentPrice.toLocaleString()})
          </span>
        </div>
        <p className="text-[10px] text-slate-400 flex items-center gap-1">
          <HelpCircle size={10} />
          {insight.confidenceNote}
        </p>
      </div>
    </div>
  );
}
