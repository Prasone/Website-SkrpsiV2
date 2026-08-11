import React from 'react';
import { Activity, Radio, Cpu, Battery, SlidersHorizontal, AlertCircle, Thermometer, Wind, Trash2, PlusCircle } from 'lucide-react';
import { SensorData, SystemLog } from '../../types';

interface MonitoringTabProps {
  sensorData: SensorData;
  setSensorData: React.Dispatch<React.SetStateAction<SensorData>>;
  logs: SystemLog[];
  setLogs?: React.Dispatch<React.SetStateAction<SystemLog[]>>;
  addSystemLog?: (message: string, type: 'info' | 'success' | 'warning' | 'danger') => void;
  isPumpOn: boolean;
  isValveOn: boolean;
}

export default function MonitoringTab({ 
  sensorData, 
  setSensorData, 
  logs,
  setLogs,
  addSystemLog,
  isPumpOn,
  isValveOn
}: MonitoringTabProps) {
  // Handlers for manual sliders to simulate ESP32 data change
  const handleMoistureSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    const rawAdc = Math.round(4095 - (val / 100) * 3095);
    setSensorData(prev => ({
      ...prev,
      kelembaban: val,
      adc: rawAdc
    }));
    if (addSystemLog) {
      addSystemLog(`Simulasi Sensor: Kelembaban tanah diubah ke ${val}% (ADC: ${rawAdc})`, 'info');
    }
  };

  const handleWaterLevelSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    const rawDistance = 50.0 - (val / 100) * 45.0;
    setSensorData(prev => ({
      ...prev,
      waterLevel: val,
      distance: rawDistance
    }));
    if (addSystemLog) {
      addSystemLog(`Simulasi Sensor: Level air toren diubah ke ${val}% (Jarak: ${rawDistance.toFixed(1)} cm)`, 'info');
    }
  };

  const handleSuhuSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSensorData(prev => ({
      ...prev,
      suhu: val
    }));
    if (addSystemLog) {
      addSystemLog(`Simulasi Sensor: Suhu udara diubah ke ${val.toFixed(1)} °C`, 'info');
    }
  };

  const handleAirHumSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSensorData(prev => ({
      ...prev,
      kelembapanUdara: val
    }));
    if (addSystemLog) {
      addSystemLog(`Simulasi Sensor: Kelembapan udara diubah ke ${val}% RH`, 'info');
    }
  };

  const handleClearLogs = () => {
    if (setLogs) {
      setLogs([]);
    }
  };

  const handleAddTestLog = () => {
    if (addSystemLog) {
      const msgs = [
        'Uji Coba Telemetri: Pembacaan sensor ESP32 stabil & akurat.',
        'Pemeriksaan Sistem: Modul Relay & Solenoid siap digunakan.',
        'Ping Broker MQTT: Waktu respon 42 ms (Koneksi Sangat Baik).',
        'Simulasi Siklus: Deteksi nilai batas kelembaban tanah berhasil.'
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      addSystemLog(randomMsg, 'success');
    }
  };

  const safeSuhu = isNaN(sensorData.suhu) ? 29.5 : sensorData.suhu;
  const safeAirHum = isNaN(sensorData.kelembapanUdara) ? 62 : sensorData.kelembapanUdara;

  return (
    <div className="space-y-6" id="monitoring-tab-container">
      {/* Title */}
      <div id="monitoring-tab-header">
        <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Live Monitoring & Diagnostics</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Pantau status telemetri ESP32 dan simulasikan kondisi sensor kebun.</p>
      </div>

      {/* Grid: Live Simulation Sliders and Hardware Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="monitoring-grid">
        
        {/* Left Columns (Span 2): Live Testing Sliders */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 dash-card-glow space-y-6" id="simulation-sliders-card">
          <div className="flex items-center gap-2" id="simulation-header">
            <SlidersHorizontal className="w-5 h-5 text-[#27ae60]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Simulator Sensor ESP32 (Untuk Uji Coba)</h3>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Gunakan penggeser di bawah ini untuk mensimulasikan nilai kelembaban tanah atau air wadah secara langsung. 
            Sistem otomatis akan bereaksi secara instan sesuai dengan parameter ambang batas yang Anda atur!
          </p>

          <div className="space-y-5" id="simulation-sliders-group">
            {/* Soil Moisture Slider */}
            <div className="space-y-2 p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800" id="sim-moisture-group">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">Kelembaban Tanah</span>
                <span className="font-mono text-[#27ae60] font-bold">{sensorData.kelembaban}% (ADC: {sensorData.adc})</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sensorData.kelembaban} 
                onChange={handleMoistureSlider}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2ecc71]"
                id="slider-moisture"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                <span>0% (Sangat Kering)</span>
                <span>Kondisi Ideal (50% - 80%)</span>
                <span>100% (Basah Jenuh)</span>
              </div>
            </div>

            {/* Water Level Slider */}
            <div className="space-y-2 p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800" id="sim-water-group">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">Level Air Wadah</span>
                <span className="font-mono text-sky-500 font-bold">{sensorData.waterLevel}% (Jarak: {(isNaN(sensorData.distance) ? 0 : sensorData.distance).toFixed(1)} cm)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sensorData.waterLevel} 
                onChange={handleWaterLevelSlider}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                id="slider-water-level"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                <span>0% (Wadah Kosong)</span>
                <span>Setengah Penuh (50%)</span>
                <span>100% (Penuh Maksimum)</span>
              </div>
            </div>

            {/* Suhu Udara Slider */}
            <div className="space-y-2 p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800" id="sim-suhu-group">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">Suhu Udara (DHT11/22)</span>
                <span className="font-mono text-amber-500 font-bold">{safeSuhu.toFixed(1)} °C</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="50" 
                step="0.5"
                value={safeSuhu} 
                onChange={handleSuhuSlider}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                id="slider-suhu-udara"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                <span>10°C (Dingin)</span>
                <span>Ideal (22°C - 32°C)</span>
                <span>50°C (Sangat Panas)</span>
              </div>
            </div>

            {/* Kelembapan Udara Slider */}
            <div className="space-y-2 p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800" id="sim-kelembapan-udara-group">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">Kelembapan Udara (DHT11/22)</span>
                <span className="font-mono text-teal-500 font-bold">{Math.round(safeAirHum)}% RH</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={safeAirHum} 
                onChange={handleAirHumSlider}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                id="slider-kelembapan-udara"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                <span>0% (Kering)</span>
                <span>Ideal (50% - 75%)</span>
                <span>100% (Jenuh)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & HW Status */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 dash-card-glow flex flex-col justify-between" id="hardware-diagnostics-card">
          <div className="space-y-5" id="hw-diagnostics-body">
            <div className="flex items-center gap-2" id="hw-header">
              <Cpu className="w-5 h-5 text-[#27ae60]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Telemetri Perangkat</h3>
            </div>

            {/* Diagnostics Stats */}
            <div className="space-y-3" id="hw-stats-list">
              {/* Suhu Udara Lingkungan */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800" id="hw-stat-ambient-temp">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>Suhu Udara</span>
                </div>
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">{safeSuhu.toFixed(1)} °C</span>
              </div>

              {/* Kelembapan Udara Lingkungan */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800" id="hw-stat-ambient-hum">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <Wind className="w-4 h-4 text-teal-500" />
                  <span>Kelembapan Udara</span>
                </div>
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">{Math.round(safeAirHum)}% RH</span>
              </div>

              {/* Battery */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800" id="hw-stat-battery">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <Battery className="w-4 h-4 text-emerald-500" />
                  <span>Daya Baterai</span>
                </div>
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">100% (USB Powered)</span>
              </div>

              {/* RSSI / Signal */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800" id="hw-stat-rssi">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <Radio className="w-4 h-4 text-sky-500" />
                  <span>Sinyal Wi-Fi</span>
                </div>
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">-62 dBm (Sangat Baik)</span>
              </div>

              {/* Core Temp */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800" id="hw-stat-temp">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <span>Suhu Chip ESP32</span>
                </div>
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">38.4 °C</span>
              </div>

              {/* System Uptime */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800" id="hw-stat-uptime">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <AlertCircle className="w-4 h-4 text-purple-500" />
                  <span>Waktu Aktif</span>
                </div>
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">4 Hari, 12 Jam</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono font-semibold" id="hw-firmware-version">
            Firmware Version: v2.0.8-stable
          </div>
        </div>
      </div>

      {/* System Error & Operation Logs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 dash-card-glow" id="system-logs-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4" id="logs-header">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Log Aktivitas Sistem
            </h3>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {logs.length} Log
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddTestLog}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
              title="Tambah Log Simulasi"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tes Log Live</span>
            </button>
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl border border-rose-200/50 dark:border-rose-900/50 transition-all cursor-pointer shadow-sm"
              title="Bersihkan Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden" id="logs-list-container">
          <div className="max-h-64 overflow-y-auto font-mono text-xs p-3 space-y-2.5" id="logs-scrollable">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs italic font-sans font-medium">
                Belum ada catatan aktivitas. Geser slider sensor di atas atau kontrol perangkat untuk memicu log live.
              </div>
            ) : (
              logs.map((log) => {
                let typeColor = 'text-slate-500';
                if (log.type === 'success') typeColor = 'text-[#27ae60]';
                else if (log.type === 'warning') typeColor = 'text-amber-600';
                else if (log.type === 'danger') typeColor = 'text-rose-600';
                else if (log.type === 'info') typeColor = 'text-sky-600';

                return (
                  <div key={log.id} className="flex items-start gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0 transition-all hover:bg-slate-200/30 dark:hover:bg-slate-900/30 p-1 rounded-lg" id={`log-item-${log.id}`}>
                    <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={`font-bold shrink-0 uppercase select-none ${typeColor}`}>
                      {log.type === 'danger' ? 'ERROR' : log.type.toUpperCase()}:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
