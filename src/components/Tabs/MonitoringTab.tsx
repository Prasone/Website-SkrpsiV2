import React, { useState } from 'react';
import { Activity, Radio, Cpu, Battery, SlidersHorizontal, AlertCircle, Thermometer, Wind, Table, CheckCircle2, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { SensorData, SystemLog } from '../../types';

interface MonitoringTabProps {
  sensorData: SensorData;
  setSensorData: React.Dispatch<React.SetStateAction<SensorData>>;
  logs: SystemLog[];
  isPumpOn: boolean;
  isValveOn: boolean;
}

export default function MonitoringTab({ 
  sensorData, 
  setSensorData, 
  logs,
  isPumpOn,
  isValveOn
}: MonitoringTabProps) {
  const [activeDatasetTab, setActiveDatasetTab] = useState<'ultrasonic' | 'soil' | 'dht21' | 'app_testing' | 'summary' | 'abstract'>('ultrasonic');
  const [showDatasets, setShowDatasets] = useState<boolean>(true);
  
  // Handlers for manual sliders to simulate ESP32 data change
  const handleMoistureSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    const rawAdc = Math.round(4095 - (val / 100) * 3095);
    setSensorData(prev => ({
      ...prev,
      kelembaban: val,
      adc: rawAdc
    }));
  };

  const handleWaterLevelSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    const rawDistance = 50.0 - (val / 100) * 45.0;
    setSensorData(prev => ({
      ...prev,
      waterLevel: val,
      distance: rawDistance
    }));
  };

  const handleSuhuSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSensorData(prev => ({
      ...prev,
      suhu: val
    }));
  };

  const handleAirHumSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSensorData(prev => ({
      ...prev,
      kelembapanUdara: val
    }));
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
        <div className="flex items-center gap-2 mb-4" id="logs-header">
          <Activity className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Log Aktivitas Sistem</h3>
        </div>

        <div className="bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden" id="logs-list-container">
          <div className="max-h-60 overflow-y-auto font-mono text-xs p-3 space-y-2.5" id="logs-scrollable">
            {logs.map((log) => {
              let typeColor = 'text-slate-500';
              if (log.type === 'success') typeColor = 'text-[#27ae60]';
              else if (log.type === 'warning') typeColor = 'text-amber-600';
              else if (log.type === 'danger') typeColor = 'text-rose-600';
              else if (log.type === 'info') typeColor = 'text-sky-600';

              return (
                <div key={log.id} className="flex items-start gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0" id={`log-item-${log.id}`}>
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className={`font-bold shrink-0 uppercase select-none ${typeColor}`}>
                    {log.type === 'danger' ? 'ERROR' : log.type.toUpperCase()}:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Experimental Datasets & Analysis Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 dash-card-glow" id="experimental-datasets-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6" id="datasets-header">
          <div className="flex items-center gap-2.5">
            <Table className="w-5 h-5 text-[#27ae60]" />
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Hasil Data Pengujian & Analisis Sensor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Data eksperimen sensor Ultrasonik (Toren 17,5 cm), Soil Moisture, dan DHT21</p>
            </div>
          </div>
          <button 
            onClick={() => setShowDatasets(!showDatasets)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer self-start sm:self-auto transition-all"
          >
            {showDatasets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showDatasets ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}</span>
          </button>
        </div>

        {showDatasets && (
          <div className="space-y-6" id="datasets-content">
            {/* Sub-tabs selector */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3" id="dataset-tabs">
              <button
                onClick={() => setActiveDatasetTab('ultrasonic')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeDatasetTab === 'ultrasonic'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>1. Sensor Ultrasonik (Toren 17,5 cm)</span>
              </button>
              <button
                onClick={() => setActiveDatasetTab('soil')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeDatasetTab === 'soil'
                    ? 'bg-[#27ae60] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>2. Sensor Soil Moisture (Tabel 4.1)</span>
              </button>
              <button
                onClick={() => setActiveDatasetTab('dht21')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeDatasetTab === 'dht21'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                <span>3. Sensor DHT21 Outdoor (Tabel 4.2)</span>
              </button>
              <button
                onClick={() => setActiveDatasetTab('app_testing')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeDatasetTab === 'app_testing'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>4. Pengujian Black Box (Tabel 4.5)</span>
              </button>
              <button
                onClick={() => setActiveDatasetTab('summary')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeDatasetTab === 'summary'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>5. Kesimpulan Sistem (Bab 5.1)</span>
              </button>
              <button
                onClick={() => setActiveDatasetTab('abstract')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeDatasetTab === 'abstract'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>6. Abstrak Skripsi (Bilingual)</span>
              </button>
            </div>

            {/* TAB 1: Ultrasonik Toren 17.5 cm */}
            {activeDatasetTab === 'ultrasonic' && (
              <div className="space-y-4 animate-fadeIn" id="ultrasonic-table-view">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-sky-50 dark:bg-sky-950/40 p-3.5 rounded-2xl border border-sky-200 dark:border-sky-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-sky-900 dark:text-sky-200">Hasil Pengujian Sensor Ultrasonik Toren Air</h4>
                      <p className="text-[11px] text-sky-700 dark:text-sky-300">Parameter tinggi wadah: <code className="font-mono font-bold">17.5 cm</code></p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm self-start sm:self-auto">
                    Tingkat Keberhasilan: 100%
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold">
                      <tr>
                        <th className="p-3">Percobaan</th>
                        <th className="p-3">Nilai Keterisian Toren (%)</th>
                        <th className="p-3">Jarak Sensor (cm)</th>
                        <th className="p-3">Tinggi Air Dalam Toren (cm)</th>
                        <th className="p-3">Kondisi Solenoid Valve</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">1</td>
                        <td className="p-3">90%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">1.75 cm</td>
                        <td className="p-3 font-bold">15.75 cm</td>
                        <td className="p-3">Kondisi Tertutup</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">2</td>
                        <td className="p-3">30%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">12.25 cm</td>
                        <td className="p-3 font-bold">5.25 cm</td>
                        <td className="p-3">Kondisi Tertutup</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">3</td>
                        <td className="p-3">10%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">15.75 cm</td>
                        <td className="p-3 font-bold">1.75 cm</td>
                        <td className="p-3 text-emerald-600 font-bold">Kondisi Terbuka</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">4</td>
                        <td className="p-3">85%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">2.63 cm</td>
                        <td className="p-3 font-bold">14.88 cm</td>
                        <td className="p-3">Kondisi Tertutup</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">5</td>
                        <td className="p-3">40%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">10.50 cm</td>
                        <td className="p-3 font-bold">7.00 cm</td>
                        <td className="p-3 text-emerald-600 font-bold">Kondisi Terbuka</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">6</td>
                        <td className="p-3">60%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">7.00 cm</td>
                        <td className="p-3 font-bold">10.50 cm</td>
                        <td className="p-3">Kondisi Tertutup</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">7</td>
                        <td className="p-3">5%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">16.63 cm</td>
                        <td className="p-3 font-bold">0.88 cm</td>
                        <td className="p-3 text-emerald-600 font-bold">Kondisi Terbuka</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">8</td>
                        <td className="p-3">80%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">3.50 cm</td>
                        <td className="p-3 font-bold">14.00 cm</td>
                        <td className="p-3">Kondisi Tertutup</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">9</td>
                        <td className="p-3">40%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">10.50 cm</td>
                        <td className="p-3 font-bold">7.00 cm</td>
                        <td className="p-3">Kondisi Tertutup</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">10</td>
                        <td className="p-3">55%</td>
                        <td className="p-3 text-sky-600 dark:text-sky-400 font-bold">7.88 cm</td>
                        <td className="p-3 font-bold">9.63 cm</td>
                        <td className="p-3">Kondisi Tertutup</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sukses</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white block mb-1">📋 Kesimpulan Pengujian Sensor Ultrasonik:</span>
                  Dapat disimpulkan bahwa tingkat keberhasilan dari uji coba sensor ultrasonik (HC-SR04) untuk mendeteksi kapasitas air pada toren dengan tinggi wadah 17,5 cm mencapai <strong className="text-emerald-600 dark:text-emerald-400">100%</strong>. Seluruh 10 percobaan sukses mendeteksi tingkat keterisian air dan jarak sensor secara presisi serta mengontrol respon solenoid valve secara akurat tanpa hambatan transmisi atau kegagalan perangkat.
                </div>
              </div>
            )}

            {/* TAB 2: Soil Moisture Table 4.1 */}
            {activeDatasetTab === 'soil' && (
              <div className="space-y-4 animate-fadeIn" id="soil-table-view">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Tabel 4.1 Hasil Data Pengujian Sensor Soil Moisture</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Pengujian presisi nilai kelembaban tanah terukur dibandingkan perhitungan manual & alat.</p>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold">
                      <tr>
                        <th className="p-3">Percobaan</th>
                        <th className="p-3">Nilai Soil (%)</th>
                        <th className="p-3">Perhitungan Alat</th>
                        <th className="p-3">Perhitungan Manual</th>
                        <th className="p-3">Nilai Error (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">1</td>
                        <td className="p-3">36%</td>
                        <td className="p-3">9213.56</td>
                        <td className="p-3">9193.60</td>
                        <td className="p-3 font-bold text-emerald-600">0.0022%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">2</td>
                        <td className="p-3">74%</td>
                        <td className="p-3">2727.29</td>
                        <td className="p-3">3000.00</td>
                        <td className="p-3 font-bold text-amber-600">9.0900%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">3</td>
                        <td className="p-3">69%</td>
                        <td className="p-3">5796.93</td>
                        <td className="p-3">5850.00</td>
                        <td className="p-3 font-bold text-emerald-600">0.9100%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">4</td>
                        <td className="p-3">37%</td>
                        <td className="p-3">8543.51</td>
                        <td className="p-3">9000.00</td>
                        <td className="p-3 font-bold text-amber-600">5.0700%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">5</td>
                        <td className="p-3">41%</td>
                        <td className="p-3">5796.93</td>
                        <td className="p-3">5850.00</td>
                        <td className="p-3 font-bold text-emerald-600">0.9100%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">6</td>
                        <td className="p-3">64%</td>
                        <td className="p-3">5829.48</td>
                        <td className="p-3">5875.00</td>
                        <td className="p-3 font-bold text-emerald-600">0.7700%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">7</td>
                        <td className="p-3">0%</td>
                        <td className="p-3">10333.33</td>
                        <td className="p-3">10000.00</td>
                        <td className="p-3 font-bold text-amber-600">3.3300%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">8</td>
                        <td className="p-3">80%</td>
                        <td className="p-3">2200.00</td>
                        <td className="p-3">2250.00</td>
                        <td className="p-3 font-bold text-emerald-600">2.2200%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">9</td>
                        <td className="p-3">66%</td>
                        <td className="p-3">5817.39</td>
                        <td className="p-3">5875.00</td>
                        <td className="p-3 font-bold text-emerald-600">0.9800%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">10</td>
                        <td className="p-3">26%</td>
                        <td className="p-3">10333.33</td>
                        <td className="p-3">10000.00</td>
                        <td className="p-3 font-bold text-amber-600">3.3300%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white block mb-1">📋 Kesimpulan Analisis Sensor Soil Moisture:</span>
                  Dari hasil pengujian Tabel 4.1 dapat disimpulkan bahwa terdapat lonjakan nilai error di beberapa titik pengujian dikarenakan range data yang kurang ideal. Pada percobaan 7 dan 10 menghasilkan nilai raw yang relatif sama dikarenakan terjadinya overlaps data yang mempengaruhi akurasi pada logika fuzzy.
                </div>
              </div>
            )}

            {/* TAB 3: DHT21 Outdoor Table 4.2 */}
            {activeDatasetTab === 'dht21' && (
              <div className="space-y-4 animate-fadeIn" id="dht21-table-view">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">Tabel 4.2 Hasil Data Pengamatan Sensor DHT21 (Lahan Terbuka Musim Kemarau)</h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">Dinamika perubahan suhu (°C) dan kelembapan udara (%RH) dari pagi hingga malam hari.</p>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold">
                      <tr>
                        <th className="p-3">No</th>
                        <th className="p-3">Waktu Pengujian</th>
                        <th className="p-3">Suhu Udara Terukur DHT21 (°C)</th>
                        <th className="p-3">Kelembapan Udara Terukur DHT21 (%RH)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">1</td>
                        <td className="p-3 font-bold">06.00 WIB</td>
                        <td className="p-3 text-sky-600 font-bold">24,2 °C (Terendah)</td>
                        <td className="p-3 text-sky-600 font-bold">78 %RH (Tertinggi)</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">2</td>
                        <td className="p-3">08.00 WIB</td>
                        <td className="p-3">27,8 °C</td>
                        <td className="p-3">66 %RH</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">3</td>
                        <td className="p-3">10.00 WIB</td>
                        <td className="p-3">31,4 °C</td>
                        <td className="p-3">53 %RH</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">4</td>
                        <td className="p-3">12.00 WIB</td>
                        <td className="p-3">34,6 °C</td>
                        <td className="p-3">41 %RH</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-amber-50/50 dark:bg-amber-950/20">
                        <td className="p-3 font-bold text-amber-600">5</td>
                        <td className="p-3 font-bold text-amber-600">13.30 WIB</td>
                        <td className="p-3 font-bold text-amber-600">35,8 °C (Puncak Panas)</td>
                        <td className="p-3 font-bold text-amber-600">37 %RH (Terendah)</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">6</td>
                        <td className="p-3">15.00 WIB</td>
                        <td className="p-3">33,9 °C</td>
                        <td className="p-3">44 %RH</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">7</td>
                        <td className="p-3">16.30 WIB</td>
                        <td className="p-3">30,5 °C</td>
                        <td className="p-3">54 %RH</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">8</td>
                        <td className="p-3">18.00 WIB</td>
                        <td className="p-3">27,9 °C</td>
                        <td className="p-3">65 %RH</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">9</td>
                        <td className="p-3">20.00 WIB</td>
                        <td className="p-3">26,1 °C</td>
                        <td className="p-3">72 %RH</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">10</td>
                        <td className="p-3">22.00 WIB</td>
                        <td className="p-3">25,0 °C</td>
                        <td className="p-3">76 %RH</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white block mb-1">📋 Kesimpulan Pengujian Sensor DHT21:</span>
                  Sensor DHT21 beroperasi secara responsif dan real-time di lahan pertanian terbuka pada musim kemarau. Suhu udara terendah terjadi pada pukul 06.00 WIB sebesar <strong>24,2 °C</strong> (kelembapan 78 %RH), sedangkan suhu puncak terjadi pada siang hari pukul 13.30 WIB mencapai <strong>35,8 °C</strong> (kelembapan 37 %RH).
                </div>
              </div>
            )}

            {/* TAB 4: Black Box Testing Table 4.5 */}
            {activeDatasetTab === 'app_testing' && (
              <div className="space-y-4 animate-fadeIn" id="app-testing-table-view">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-purple-50 dark:bg-purple-950/40 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">Tabel 4.5 Hasil Pengujian Aplikasi (Black Box Testing)</h4>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">Pengujian fungsionalitas antarmuka, kontrol relay ESP32, dan responsivitas data.</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm self-start sm:self-auto">
                    Status: 100% Valid (10/10 Sesuai)
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold">
                      <tr>
                        <th className="p-3 w-10 text-center">No</th>
                        <th className="p-3 w-48">Fitur / Fungsi</th>
                        <th className="p-3">Skenario Pengujian</th>
                        <th className="p-3">Hasil yang Diharapkan</th>
                        <th className="p-3 text-center w-28">Hasil Pengujian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">1</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Monitoring Kelembaban Tanah</td>
                        <td className="p-3">Membaca data kelembaban tanah dari sensor Soil Moisture / ADC.</td>
                        <td className="p-3">Aplikasi menampilkan nilai persen kelembaban tanah dan status indikator secara real-time.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">2</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Monitoring Level Air Tangki</td>
                        <td className="p-3">Membaca data kapasitas air dari sensor ultrasonik.</td>
                        <td className="p-3">Aplikasi menampilkan volume air dalam persen (%) dan jarak ultrasonik (cm) secara akurat.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">3</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Monitoring Suhu & Kelembapan Udara</td>
                        <td className="p-3">Membaca data lingkungan dari sensor DHT (DHT21/22).</td>
                        <td className="p-3">Aplikasi menampilkan suhu (°C) dan kelembapan udara (% RH) beserta indikator kriteria lingkungan.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">4</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Kontrol Pompa (Mode Manual)</td>
                        <td className="p-3">Mematikan atau menghidupkan sakelar pompa siram pada aplikasi.</td>
                        <td className="p-3">Modul relay pompa air merespons status ON/OFF sesuai tombol yang ditekan pada aplikasi.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">5</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Kontrol Valve (Mode Manual)</td>
                        <td className="p-3">Mematikan atau menghidupkan sakelar solenoid valve pengisi tangki.</td>
                        <td className="p-3">Modul relay solenoid valve membuka atau menutup alir air sesuai perintah aplikasi.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">6</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Beralih Mode (Auto / Manual)</td>
                        <td className="p-3">Mengubah toggle mode kontrol antara Otomatis (Fuzzy Logic) dan Manual.</td>
                        <td className="p-3">Sistem memperbarui mode operasi dan menolak/menerima perintah manual sesuai mode aktif.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">7</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Pengaturan Jadwal Penyiraman</td>
                        <td className="p-3">Mengatur jam penyiraman pagi/sore dan menekan tombol simpan jadwal.</td>
                        <td className="p-3">Jadwal tersimpan ke memori ESP32 (Preferences Flash) dan penyiraman otomatis terpicu tepat waktu.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">8</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Grafik Riwayat Data (History)</td>
                        <td className="p-3">Membuka tab grafik riwayat pemantauan sensor.</td>
                        <td className="p-3">Grafik menampilkan riwayat data kelembaban tanah dan level air secara temporal (tiap 15 menit).</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">9</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Status Koneksi & Indikator IoT</td>
                        <td className="p-3">Memutus atau menghubungkan kembali koneksi jaringan Wi-Fi/MQTT ESP32.</td>
                        <td className="p-3">Aplikasi menampilkan status Online / Offline serta indikator responsivitas jaringan secara tepat.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-center">10</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">Simulasi Slider & Diagnosis</td>
                        <td className="p-3">Mengubah nilai slider simulasi sensor pada tab pengujian/monitoring.</td>
                        <td className="p-3">Nilai variabel sensor pada antarmuka berubah secara dinamis untuk pengujian ambang batas relay.</td>
                        <td className="p-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">Sesuai</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white block mb-1">📋 Kesimpulan Pengujian Aplikasi (Black Box Testing):</span>
                  Berdasarkan hasil pengujian pada Tabel 4.5, seluruh 10 skenario pengujian fungsionalitas aplikasi memperoleh status <strong className="text-emerald-600 dark:text-emerald-400">Sesuai (100% Valid)</strong>. Dengan demikian, dapat disimpulkan bahwa aplikasi <em>Smart Garden IoT Monitoring</em> telah memenuhi spesifikasi fungsional yang diharapkan dan siap digunakan untuk pemantauan serta pengendalian penyiraman tanaman secara otomatis maupun manual.
                </div>
              </div>
            )}

            {/* TAB 5: Kesimpulan Sistem Bab 5.1 */}
            {activeDatasetTab === 'summary' && (
              <div className="space-y-4 animate-fadeIn" id="system-summary-view">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-1">Bab 5.1 Kesimpulan Sistem Smart Garden IoT & Fuzzy Logic Mamdani</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    Ringkasan poin utama dari hasil implementasi dan pengujian sistem penyiraman tanaman otomatis berbasis IoT.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>1. Pembuatan Alat & Akurasi Soil Moisture</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Alat penyiraman otomatis berhasil dibuat dengan memanfaatkan parameter <em>soil moisture</em> sebagai input utama. Pengujian sensor terhadap 10 data percobaan menunjukkan nilai error yang relatif kecil (berkisar <strong>0,0022% – 9,09%</strong>), meskipun ditemukan dua data (data ke-7 dan ke-10) dengan nilai identik akibat <em>overlap</em> pada rentang keanggotaan fuzzy.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>2. Akurasi Defuzzifikasi Centroid</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Lama waktu penyiraman berhasil ditentukan secara otomatis melalui proses defuzzifikasi metode <em>centroid</em> pada logika fuzzy Mamdani. Sebagai contoh, pada nilai soil 36% dihasilkan durasi penyiraman sebesar <strong>9.193,6 ms</strong> (manual) dan <strong>9.213,56 ms</strong> (alat), menunjukkan tingkat kesesuaian yang sangat baik.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>3. Ketepatan Penjadwalan Otomatis</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Sistem mampu menjalankan penyiraman sesuai jadwal yang telah ditentukan, yaitu <strong>pagi pukul 08.45 WIB</strong> dan <strong>sore pukul 16.30 WIB</strong>. Hal ini dibuktikan pada pengujian alat, di mana pompa aktif secara otomatis tepat pada kedua waktu tersebut (data percobaan ke-4 dan ke-9).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>4. Validitas Black Box Testing 100%</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Sistem IoT yang dibangun mampu mengendalikan pompa secara manual (ON/OFF) maupun mengatur jadwal penyiraman melalui aplikasi. Hasil pengujian <em>black box</em> terhadap aplikasi menunjukkan seluruh 10 skenario pengujian berjalan sesuai rancangan dengan tingkat keberhasilan <strong>100% (Valid)</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Abstrak Skripsi Bilingual */}
            {activeDatasetTab === 'abstract' && (
              <div className="space-y-4 animate-fadeIn" id="thesis-abstract-view">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1">Abstrak Skripsi / Research Paper Abstract</h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      Format akademis tersinkronisasi dengan parameter sistem ESP32, Fuzzy Mamdani, RTC, DHT21 & Black Box Testing.
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm self-start sm:self-auto shrink-0">
                    Bahasa Indonesia & English
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* ABSTRAK INDONESIA */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">ABSTRAK (Bahasa Indonesia)</h5>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Resmi</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 text-justify">
                      Penelitian ini bertujuan merancang dan mengimplementasikan sistem penyiraman otomatis berbasis mikrokontroler ESP32 menggunakan metode <strong>Logika Fuzzy Mamdani</strong>. Sistem dirancang untuk melakukan penyiraman tanaman secara otomatis berdasarkan dua parameter utama, yaitu waktu real-time (<em>Real-Time Clock</em> / RTC) dan tingkat kelembapan tanah melalui sensor <em>soil moisture</em>. Module RTC dimanfaatkan untuk mengeksekusi penjadwalan penyiraman presisi sesuai Waktu Indonesia Barat (WIB), sedangkan data kelembapan tanah diproses menggunakan logika fuzzy Mamdani dengan metode defuzzifikasi <em>centroid</em> untuk menentukan durasi aktif pompa air. Selain itu, sensor ultrasonik (HC-SR04) diintegrasikan untuk memantau kapasitas ketinggian air pada toren penampungan (tinggi wadah 17,5 cm) guna memicu otomatisasi pengisian air via <em>solenoid valve</em>. Sensor <strong>DHT21</strong> juga diterapkan untuk memantau perubahan suhu udara (24,2°C – 35,8°C) dan kelembapan udara relatif (37% – 78% RH) di lingkungan terbuka pada musim kemarau. Seluruh data sensor dan status aktuator disinkronisasikan ke antarmuka aplikasi berbasis web secara <em>real-time</em>. Perangkat lunak mikrokontroler dikembangkan menggunakan Arduino IDE. Pengujian dilakukan sebanyak 10 kali untuk setiap parameter sensor maupun fungsionalitas antarmuka. Hasil pengujian alat dan sensor ultrasonik menunjukkan tingkat keberhasilan sebesar <strong>100%</strong>. Pengujian fungsionalitas aplikasi menggunakan metode <em>Black Box Testing</em> juga menghasilkan tingkat keberhasilan <strong>100% Valid (10/10 skenario sesuai)</strong>. Kebaruan (<em>novelty</em>) dan pengembangan dari penelitian terdahulu terletak pada penambahan integrasi sensor RTC, DHT21, dan <em>soil moisture</em>, perubahan pendekatan metode fuzzy dari Sugeno menjadi Mamdani, serta pengembangan fitur kontrol dan penyiraman otomatis terjadwal berbasis IoT. Penelitian ini diharapkan dapat memberikan kontribusi nyata dalam pengembangan teknologi pertanian presisi (<em>precision agriculture</em>) dan perawatan tanaman hias secara efisien dan hemat air.
                    </p>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>Kata Kunci:</strong> <em>ESP32, Logika Fuzzy Mamdani, IoT, Penyiraman Otomatis, Sensor Soil Moisture, DHT21, Black Box Testing.</em>
                    </div>
                  </div>

                  {/* ABSTRACT ENGLISH */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">ABSTRACT (English)</h5>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Academic</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 text-justify">
                      This research aims to design and implement an ESP32-based automatic plant watering system utilizing the <strong>Mamdani Fuzzy Logic</strong> method. The system is engineered to automatically irrigate plants based on two core parameters: real-time scheduling (<em>Real-Time Clock</em> / RTC) and soil moisture levels measured by a capacitive soil sensor. The RTC module executes scheduled watering sessions adjusted to local Western Indonesia Time (WIB), while soil moisture data is computed through Mamdani fuzzy logic using the centroid defuzzification method to accurately determine pump duration. Additionally, an ultrasonic sensor (HC-SR04) is integrated to monitor water tank levels (container height 17.5 cm) to trigger automated tank refilling via a solenoid valve. A <strong>DHT21</strong> sensor is deployed to monitor ambient temperature dynamics (24.2°C – 35.8°C) and relative air humidity (37% – 78% RH) in open-field environments during the dry season. All sensor metrics and actuator statuses are synchronized to a web-based dashboard in real-time. Firmware was developed using the Arduino IDE, and empirical testing was conducted across 10 iterations per sensor parameter and interface feature. Hardware evaluation and ultrasonic detection yielded a <strong>100% success rate</strong>. Application testing via <em>Black Box Testing</em> also achieved a <strong>100% Valid success rate (10/10 scenarios passed)</strong>. The novelty and improvement over prior research reside in the added multi-sensor integration (RTC, DHT21, Soil Moisture), the transition from Sugeno to Mamdani fuzzy inference, and the implementation of scheduled IoT-based irrigation control. This research is expected to contribute to precision agriculture and efficient water-saving plant care systems.
                    </p>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>Keywords:</strong> <em>ESP32, Mamdani Fuzzy Logic, IoT, Automatic Irrigation, Soil Moisture Sensor, DHT21, Black Box Testing.</em>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
