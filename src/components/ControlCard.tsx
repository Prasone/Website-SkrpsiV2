import React from 'react';
import { Power } from 'lucide-react';
import { ControlMode } from '../types';

interface ControlCardProps {
  title: string;
  icon: React.ReactNode;
  mode: ControlMode;
  status: boolean;
  statusLabelOn: string;
  statusLabelOff: string;
  onChangeMode: (mode: ControlMode) => void;
  onToggleStatus: () => void;
  onAttemptManualClick?: () => void;
}

export default function ControlCard({
  title,
  icon,
  mode,
  status,
  statusLabelOn,
  statusLabelOff,
  onChangeMode,
  onToggleStatus,
  onAttemptManualClick,
}: ControlCardProps) {
  
  const handlePowerClick = () => {
    if (mode === 'auto') {
      if (onAttemptManualClick) {
        onAttemptManualClick();
      }
    } else {
      onToggleStatus();
    }
  };

  return (
    <div 
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between dash-card-glow"
      id={`control-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Title Header */}
      <div className="flex items-center gap-2.5 mb-5" id="control-card-header">
        <span className="text-[#e67e22]">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
      </div>

      {/* Control Panel Body (Grid split left / right) */}
      <div className="flex items-center justify-between gap-4" id="control-card-body">
        
        {/* Left Side: Mode & Status Toggles */}
        <div className="space-y-4 flex-1" id="control-card-left">
          
          {/* Mode Switcher */}
          <div className="flex items-center justify-between" id="control-mode-row">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mode</span>
            <div className="bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-800 flex" id="control-mode-toggle-group">
              <button
                onClick={() => onChangeMode('auto')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  mode === 'auto'
                    ? 'bg-[#2ecc71] text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                }`}
                id="mode-btn-auto"
              >
                Auto
              </button>
              <button
                onClick={() => onChangeMode('manual')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  mode === 'manual'
                    ? 'bg-[#2ecc71] text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                }`}
                id="mode-btn-manual"
              >
                Manual
              </button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col gap-1" id="control-status-row">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status</span>
            <div className="flex items-center gap-3 mt-1" id="control-status-indicator">
              {/* Glowing LED */}
              <div 
                className={`w-4 h-4 rounded-full transition-all duration-500 ${
                  status 
                    ? 'bg-[#2ecc71] glow-green pulse-green' 
                    : 'bg-slate-200 dark:bg-slate-800'
                }`} 
                id="status-led"
              />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide" id="status-on-off">
                  {status ? 'ON' : 'OFF'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium" id="status-description">
                  {status ? statusLabelOn : statusLabelOff}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Big Power Toggle Button */}
        <div id="control-card-right">
          <button
            onClick={handlePowerClick}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
              status
                ? 'bg-[#e8f8f0] dark:bg-emerald-950/40 border-2 border-[#2ecc71] text-[#27ae60] dark:text-[#2ecc71] filter drop-shadow-[0_2px_8px_rgba(46,204,113,0.2)] active:scale-95 cursor-pointer'
                : mode === 'manual'
                  ? 'bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-[#27ae60] hover:border-[#2ecc71]/50 active:scale-95 cursor-pointer'
                  : 'bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 text-slate-300 dark:text-slate-700 cursor-not-allowed'
            }`}
            title={mode === 'auto' ? 'Ubah ke mode Manual untuk mengendalikan' : 'Klik untuk menyalakan/mematikan'}
            id="power-toggle-button"
          >
            <Power className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
