import { TrendingDown, Clock, Flame } from 'lucide-react';

interface AnalogDealMeterProps {
  score?: number;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function AnalogDealMeter({
  score = 65,
  status,
  size = 'md',
  showLabel = true
}: AnalogDealMeterProps) {
  const safeScore = Math.min(100, Math.max(0, score));

  // Determine color and status
  let color = 'text-amber-500 stroke-amber-500 bg-amber-500';
  let badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
  let label = status || 'Fair Price';
  let Icon = Clock;

  if (safeScore >= 85) {
    color = 'text-emerald-500 stroke-emerald-500 bg-emerald-500';
    badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    label = status || 'Steal Deal 🔥';
    Icon = Flame;
  } else if (safeScore >= 70) {
    color = 'text-blue-500 stroke-blue-500 bg-blue-500';
    badgeBg = 'bg-blue-50 text-blue-800 border-blue-200';
    label = status || 'Great Deal 🟢';
    Icon = TrendingDown;
  } else if (safeScore < 50) {
    color = 'text-rose-500 stroke-rose-500 bg-rose-500';
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
    label = status || 'Wait for Drop ⏳';
    Icon = Clock;
  }

  // SVG Gauge calculations
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 10 : 8;
  const radius = size === 'sm' ? 26 : size === 'lg' ? 44 : 34;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree arc
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (safeScore / 100) * arcLength;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="flex items-center gap-3">
      {/* Semi-circular Analog Arc */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="transform -rotate-[210deg]"
        >
          {/* Background Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${color} transition-all duration-700 ease-out`}
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-black tracking-tight ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'} text-gray-900`}>
            {safeScore}
          </span>
          <span className="text-[8px] font-bold text-gray-400 uppercase -mt-0.5">Score</span>
        </div>
      </div>

      {/* Label and Badge */}
      {showLabel && (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeBg}`}>
              <Icon size={10} />
              {label}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium block">
            Factual deal intelligence
          </span>
        </div>
      )}
    </div>
  );
}
