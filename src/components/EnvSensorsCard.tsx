import React, { useState } from 'react';
import { Thermometer, Wind, Sun, CloudRain, Info } from 'lucide-react';

interface EnvSensorsCardProps {
  suhu: number;             // °C
  kelembapanUdara: number;  // %
}

export default function EnvSensorsCard({ suhu, kelembapanUdara }: EnvSensorsCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Safeguards
  const safeSuhu = isNaN(suhu) ? 0 : suhu;
  const safeAirHum = isNaN(kelembapanUdara) ? 0 : Math.min(100, Math.max(0, kelembapanUdara));

  // Temperature Status & Colors
  let tempStatusText = 'Optimal';
  let tempStatusColor = 'text-amber-500 dark:text-amber-400';
  let tempBgGlow = 'from-amber-500/10 to-orange-500/5';
  let tempBarColor = 'bg-gradient-to-r from-amber-400 to-orange-500';

  if (safeSuhu < 20) {
    tempStatusText = 'Sejuk';
    tempStatusColor = 'text-sky-400';
    tempBarColor = 'bg-gradient-to-r from-blue-400 to-sky-400';
  } else if (safeSuhu > 34) {
    tempStatusText = 'Panas';
    tempStatusColor = 'text-rose-500';
    tempBarColor = 'bg-gradient-to-r from-amber-500 to-rose-500';
  }

  // Air Humidity Status & Colors
  let humStatusText = 'Ideal';
  let humStatusColor = 'text-emerald-500 dark:text-emerald-400';
  let humBarColor = 'bg-gradient-to-r from-teal-400 to-emerald-500';

  if (safeAirHum < 45) {
    humStatusText = 'Kering';
    humStatusColor = 'text-amber-500';
    humBarColor = 'bg-gradient-to-r from-yellow-400 to-amber-500';
  } else if (safeAirHum > 80) {
    humStatusText = 'Sangat Lembab';
    humStatusColor = 'text-indigo-400';
    humBarColor = 'bg-gradient-to-r from-sky-400 to-indigo-500';
  }

  // Calculate percentage fill for temperature (scale 0°C to 50°C)
  const tempFillPercent = Math.min(100, Math.max(0, (safeSuhu / 50) * 100));

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
      id="env-sensors-container"
    >
      {/* Air Temperature Card */}
      <div 
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative dash-card-glow overflow-hidden"
        id="card-suhu-udara"
      >
        {/* Header */}
        <div className="flex justify-between items-start" id="suhu-card-header">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Lingkungan Kebun
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Suhu Udara
              </h3>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 ${tempStatusColor}`}>
            {tempStatusText}
          </span>
        </div>

        {/* Main Temperature Display */}
        <div className="my-5 flex items-baseline gap-2" id="suhu-main-display">
          <span className="text-5xl font-display font-bold text-slate-800 dark:text-white tracking-tight">
            {safeSuhu.toFixed(1)}
          </span>
          <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
            °C
          </span>
        </div>

        {/* Visual Temperature Scale Bar */}
        <div className="space-y-2" id="suhu-scale-bar-group">
          <div className="flex justify-between text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">
            <span>0°C</span>
            <span>25°C</span>
            <span>50°C</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${tempBarColor}`}
              style={{ width: `${tempFillPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Rentang ideal tanaman: <span className="font-semibold text-slate-700 dark:text-slate-300">22°C - 32°C</span>
          </p>
        </div>
      </div>

      {/* Air Humidity Card */}
      <div 
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative dash-card-glow overflow-hidden"
        id="card-kelembapan-udara"
      >
        {/* Header */}
        <div className="flex justify-between items-start" id="humidity-card-header">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Lingkungan Kebun
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Kelembapan Udara
              </h3>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 ${humStatusColor}`}>
            {humStatusText}
          </span>
        </div>

        {/* Main Air Humidity Display */}
        <div className="my-5 flex items-baseline gap-2" id="humidity-main-display">
          <span className="text-5xl font-display font-bold text-slate-800 dark:text-white tracking-tight">
            {Math.round(safeAirHum)}
          </span>
          <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
            % RH
          </span>
        </div>

        {/* Visual Humidity Bar */}
        <div className="space-y-2" id="humidity-scale-bar-group">
          <div className="flex justify-between text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${humBarColor}`}
              style={{ width: `${safeAirHum}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Rentang kelembapan udara ideal: <span className="font-semibold text-slate-700 dark:text-slate-300">50% - 75% RH</span>
          </p>
        </div>
      </div>
    </div>
  );
}
