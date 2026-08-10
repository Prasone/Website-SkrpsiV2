import React, { useState } from 'react';
import { CalendarClock, Clock, Check, Save } from 'lucide-react';
import { WateringSchedule } from '../types';

interface ScheduleCardProps {
  schedule: WateringSchedule;
  onSaveSchedule: (schedule: WateringSchedule) => void;
}

export default function ScheduleCard({ schedule, onSaveSchedule }: ScheduleCardProps) {
  const [pagiTime, setPagiTime] = useState(schedule.pagi);
  const [soreTime, setSoreTime] = useState(schedule.sore);
  const [isAktif, setIsAktif] = useState(schedule.aktif);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveSchedule({
      pagi: pagiTime,
      sore: soreTime,
      aktif: isAktif,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div 
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between dash-card-glow h-full"
      id="schedule-card"
    >
      {/* Title Header */}
      <div className="flex items-center gap-2.5 mb-5" id="schedule-header">
        <CalendarClock className="w-5 h-5 text-[#27ae60]" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jadwal Penyiraman</span>
      </div>

      {/* Scheduler Form (Pagi & Sore Inputs) */}
      <div className="grid grid-cols-2 gap-4 mb-5" id="schedule-inputs-row">
        {/* Sesi Pagi */}
        <div className="flex flex-col gap-1.5" id="pagi-group">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Sesi Pagi</span>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 focus-within:border-[#2ecc71]/50 transition-all duration-300">
            <input 
              type="time" 
              value={pagiTime}
              onChange={(e) => setPagiTime(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none w-full font-mono select-none"
              id="schedule-time-pagi"
            />
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        {/* Sesi Sore */}
        <div className="flex flex-col gap-1.5" id="sore-group">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Sesi Sore</span>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 focus-within:border-[#2ecc71]/50 transition-all duration-300">
            <input 
              type="time" 
              value={soreTime}
              onChange={(e) => setSoreTime(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none w-full font-mono select-none"
              id="schedule-time-sore"
            />
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </div>

      {/* Action Footer (Save Button & Active Badge) */}
      <div className="flex items-center justify-between pt-1 gap-4" id="schedule-footer-row">
        {/* Switch toggle to activate/deactivate schedule */}
        <button 
          onClick={() => {
            const nextVal = !isAktif;
            setIsAktif(nextVal);
            onSaveSchedule({ pagi: pagiTime, sore: soreTime, aktif: nextVal });
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:opacity-80 active:scale-95 transition-all cursor-pointer"
          id="schedule-status-toggle"
        >
          <div 
            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
              isAktif 
                ? 'bg-[#e8f8f0] dark:bg-emerald-950/40 border-[#2ecc71] text-[#27ae60] dark:text-[#2ecc71]' 
                : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Jadwal Aktif</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer ${
            isSaved
              ? 'bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#27ae60] dark:text-[#2ecc71] border border-[#2ecc71]/40'
              : 'bg-[#2ecc71] hover:bg-[#27ae60] text-white hover:shadow-lg hover:shadow-[#2ecc71]/10'
          }`}
          id="save-schedule-btn"
        >
          {isSaved ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Tersimpan!' : 'Simpan'}</span>
        </button>
      </div>
    </div>
  );
}
