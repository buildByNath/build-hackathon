import { useState } from 'react';
import type { PriceHistoryPoint } from '../types';


interface PriceChartProps {
  history: PriceHistoryPoint[];
  currentPrice: number;
  targetPrice: number;
  currency?: string;
}

export default function PriceChart({
  history,
  currentPrice,
  targetPrice,
  currency = '₹'
}: PriceChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<PriceHistoryPoint | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
        No price history recorded yet.
      </div>
    );
  }

  // Calculate scales
  const allPrices = [...history.map((h) => h.price), currentPrice, targetPrice];
  const minPrice = Math.min(...allPrices) * 0.95;
  const maxPrice = Math.max(...allPrices) * 1.05;
  const priceRange = maxPrice - minPrice || 1;

  // Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingX = 60;
  const paddingY = 40;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingY * 2;

  // Coordinate mapper
  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingX + innerWidth / 2;
    return paddingX + (index / (total - 1)) * innerWidth;
  };

  const getY = (price: number) => {
    return svgHeight - paddingY - ((price - minPrice) / priceRange) * innerHeight;
  };

  // Build SVG path
  const points = history.map((point, i) => ({
    x: getX(i, history.length),
    y: getY(point.price),
    point
  }));

  const linePath = points.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
  }, '');

  // Fill area under curve
  const areaPath = `${linePath} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`;

  const targetY = getY(targetPrice);

  return (
    <div className="relative bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs">
      {/* Chart Header Meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-base font-bold text-gray-900">Historical Price Trend</h4>
          <p className="text-xs text-gray-500">Tracked over time across retailers</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary inline-block" />
            <span className="text-gray-600 font-medium">Recorded Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
            <span className="text-gray-600 font-medium">Target Price ({currency}{targetPrice.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[500px]"
          style={{ overflow: 'visible' }}
        >
          {/* Subtle Grid Lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const price = Math.round(minPrice + priceRange * ratio);
            const y = getY(price);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-gray-400 font-sans"
                >
                  {currency}{price.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Target Price Line */}
          {targetY >= paddingY && targetY <= svgHeight - paddingY && (
            <g>
              <line
                x1={paddingX}
                y1={targetY}
                x2={svgWidth - paddingX}
                y2={targetY}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text
                x={svgWidth - paddingX + 8}
                y={targetY + 4}
                className="text-[10px] fill-emerald-600 font-bold"
              >
                Target
              </text>
            </g>
          )}

          {/* Area Gradient */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Main Price Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={pt.point.id || idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.id === pt.point.id ? 7 : 5}
                className="fill-white stroke-primary stroke-[3px] transition-all duration-150 cursor-pointer hover:stroke-orange-500"
                onMouseEnter={() => setHoveredPoint(pt.point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Date Labels below points */}
              <text
                x={pt.x}
                y={svgHeight - 12}
                textAnchor="middle"
                className="text-[10px] fill-gray-400 font-sans"
              >
                {pt.point.recordedAt.slice(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredPoint && (
        <div className="mt-3 p-2.5 bg-gray-900 text-white rounded-xl text-xs flex items-center justify-between animate-fadeIn">
          <div>
            <span className="text-gray-400">Date:</span> <strong className="text-white">{hoveredPoint.recordedAt}</strong>
            {hoveredPoint.source && (
              <span className="ml-2 text-primary-200 text-[11px]">({hoveredPoint.source})</span>
            )}
          </div>
          <div className="text-sm font-bold text-amber-300">
            {currency}{hoveredPoint.price.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
