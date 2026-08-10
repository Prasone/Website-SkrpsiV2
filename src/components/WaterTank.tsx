import React, { useState } from 'react';
import { Droplets, Info } from 'lucide-react';

interface WaterTankProps {
  percentage: number;
  distance: number;
}

export default function WaterTank({ percentage, distance }: WaterTankProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const safePercentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));
  const safeDistance = isNaN(distance) ? 0 : distance;

  // Define water thresholds and colors
  let statusText = 'Normal';
  let statusColor = 'text-sky-400';
  if (safePercentage < 25) {
    statusText = 'Sangat Rendah';
    statusColor = 'text-rose-500';
  } else if (safePercentage < 50) {
    statusText = 'Rendah';
    statusColor = 'text-amber-500';
  }

  // Define tank ticks
  const ticks = [
    { label: '100%', value: 100 },
    { label: '75%', value: 75 },
    { label: '50%', value: 50 },
    { label: '25%', value: 25 },
    { label: '0%', value: 0 },
  ];

  return (
    <div 
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col justify-between relative dash-card-glow h-full"
      id="water-tank-card"
    >
      {/* Card Header */}
      <div className="w-full flex justify-between items-center mb-3 sm:mb-4" id="tank-header">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-sky-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Level Air Wadah</span>
        </div>
        <div className="relative">
          <button 
            id="tank-info-btn"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>
          
          {showTooltip && (
            <div className="absolute right-0 bottom-6 w-56 p-3 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl shadow-2xl z-20">
              <p className="font-semibold text-white mb-1">Sensor Ultrasonik Wadah</p>
              <p className="leading-relaxed text-slate-300">Menggunakan sensor ultrasonik HC-SR04 untuk mengukur jarak ke permukaan air. Semakin kecil jarak sensor, semakin penuh wadah air.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout (Split Left and Right) */}
      <div className="flex flex-col sm:flex-row flex-1 items-center justify-between w-full py-2 sm:py-4 gap-4 sm:gap-6" id="tank-body-container">
        {/* Left Side: 3D Water Tank */}
        <div className="flex items-center gap-3 sm:gap-4 relative pl-0 sm:pl-4" id="tank-illustration-panel">
          {/* 3D Cylinder Container */}
          <div 
            className="w-20 sm:w-24 h-40 sm:h-48 rounded-t-lg rounded-b-xl border border-slate-350 dark:border-slate-700 relative bg-gradient-to-r from-slate-100/90 via-slate-50/40 to-slate-100/90 dark:from-slate-800/90 dark:via-slate-900/40 dark:to-slate-800/90 overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.05)] shrink-0"
            id="tank-3d-cylinder"
          >
            {/* Top metallic cap bevel */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 dark:from-slate-700 dark:via-slate-500 dark:to-slate-800 rounded-t-lg opacity-80 border-b border-slate-300 dark:border-slate-700 z-10" />
            
            {/* Glossy vertical reflection line */}
            <div className="absolute top-0 bottom-0 left-1/4 w-3 bg-white/40 dark:bg-white/10 filter blur-[1px] z-10" />

            {/* Simulated empty ring marks at 25%, 50%, 75% inside */}
            <div className="absolute top-1/4 left-0 right-0 h-0.5 border-t border-dashed border-slate-300/60 dark:border-slate-700/60" />
            <div className="absolute top-2/4 left-0 right-0 h-0.5 border-t border-dashed border-slate-300/60 dark:border-slate-700/60" />
            <div className="absolute top-3/4 left-0 right-0 h-0.5 border-t border-dashed border-slate-300/60 dark:border-slate-700/60" />

            {/* Dynamic Water Volume Block */}
            <div 
              style={{ height: `${safePercentage}%` }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 via-blue-400 to-sky-300 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(14,165,233,0.3)]"
              id="tank-fluid-column"
            >
              {/* Animated wave effect overlay */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-sky-300/30 animate-pulse" />

              {/* Liquid top surface ellipse (3D bevel) */}
              <div className="absolute -top-1.5 left-0 right-0 h-3 bg-sky-200 rounded-[50%] border-t border-sky-100 shadow-inner" />
            </div>
          </div>

          {/* Side Tick Lines & Labels */}
          <div className="flex flex-col justify-between h-40 sm:h-48 text-[10px] font-mono text-slate-400 dark:text-slate-500 py-1" id="tank-ticks">
            {ticks.map((tick) => (
              <div key={tick.value} className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-slate-350 dark:bg-slate-700" />
                <span>{tick.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Numeric Readings */}
        <div className="flex-1 flex flex-col items-center sm:items-start pl-0 sm:pl-4 text-center sm:text-left w-full" id="tank-readings">
          <span className="text-4xl sm:text-5xl font-display font-bold text-slate-800 dark:text-white tracking-tight">{safePercentage}%</span>
          <span className={`text-xs sm:text-sm font-bold mt-1 tracking-wider ${statusColor}`}>
            {statusText === 'Normal' ? 'Level Air' : `Level Air: ${statusText}`}
          </span>
          
        </div>
      </div>
    </div>
  );
}
