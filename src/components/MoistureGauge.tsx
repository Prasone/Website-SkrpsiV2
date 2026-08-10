import React, { useState } from 'react';
import { Leaf, Info } from 'lucide-react';

interface MoistureGaugeProps {
  percentage: number;
  adc: number;
}

export default function MoistureGauge({ percentage, adc }: MoistureGaugeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const safePercentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));
  const safeAdc = isNaN(adc) ? 0 : adc;

  // Determine status classification and color
  let statusText = 'Normal';
  let statusColor = 'text-[#2ecc71]';
  let gaugeColor = '#2ecc71';
  let shadowClass = 'drop-shadow-[0_0_8px_rgba(46,204,113,0.6)]';

  if (safePercentage < 45) {
    statusText = 'Kering';
    statusColor = 'text-amber-500';
    gaugeColor = '#f59e0b';
    shadowClass = 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]';
  } else if (safePercentage > 85) {
    statusText = 'Basah';
    statusColor = 'text-sky-400';
    gaugeColor = '#38bdf8';
    shadowClass = 'drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]';
  }

  // SVG parameters
  const radius = 65;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Calculate dash offset: 100% means 0 offset, 0% means full circumference offset
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div 
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between relative dash-card-glow h-full"
      id="moisture-gauge-card"
    >
      {/* Card Header */}
      <div className="w-full flex justify-between items-center mb-4" id="moisture-header">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-[#27ae60]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kelembaban Tanah</span>
        </div>
        <div className="relative">
          <button 
            id="moisture-info-btn"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>
          
          {showTooltip && (
            <div className="absolute right-0 bottom-6 w-56 p-3 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl shadow-2xl z-20">
              <p className="font-semibold text-white mb-1">Sensor Kelembaban Tanah</p>
              <p className="leading-relaxed text-slate-300">Nilai kelembaban ideal untuk tanaman berkisar antara 50% - 80%. Di bawah 45% pompa otomatis akan memicu penyiraman.</p>
            </div>
          )}
        </div>
      </div>

      {/* Radial Gauge Container */}
      <div className="relative flex items-center justify-center my-4" id="moisture-radial-gauge">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />
          {/* Progress Indicator Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${shadowClass}`}
          />
        </svg>

        {/* Center Text Panel */}
        <div className="absolute flex flex-col items-center text-center justify-center" id="moisture-center-values">
          <span className="text-4.5xl font-display font-bold text-slate-800 dark:text-white tracking-tight">{safePercentage}%</span>
          <span className={`text-sm font-bold tracking-wider uppercase mt-0.5 ${statusColor}`}>
            {statusText}
          </span>
        </div>
      </div>

    </div>
  );
}
