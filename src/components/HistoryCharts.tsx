import React, { useState } from 'react';
import { Leaf, Droplets } from 'lucide-react';
import { HistoryPoint } from '../types';

interface HistoryChartsProps {
  historyData: HistoryPoint[];
}

export default function HistoryCharts({ historyData }: HistoryChartsProps) {
  const [activeMoistureIndex, setActiveMoistureIndex] = useState<number | null>(null);
  const [activeWaterIndex, setActiveWaterIndex] = useState<number | null>(null);

  // SVG Chart Dimensions
  const viewWidth = 600;
  const viewHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = viewWidth - paddingLeft - paddingRight;
  const chartHeight = viewHeight - paddingTop - paddingBottom;

  // Map values to coordinates
  const getCoordinates = (value: number, index: number, total: number) => {
    const x = total <= 1 
      ? paddingLeft + chartWidth / 2 
      : paddingLeft + (index / (total - 1)) * chartWidth;
    
    // Safeguard value to be a valid number
    const safeValue = isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
    const y = paddingTop + chartHeight - (safeValue / 100) * chartHeight;
    return { 
      x: isNaN(x) ? paddingLeft : x, 
      y: isNaN(y) ? paddingTop : y 
    };
  };

  // Generate gridline Y-positions
  const yTicks = [100, 75, 50, 25, 0];
  const xTicksIndices = [0, 2, 4, 6, 8, 10, 11]; // Ticks for 00:00, 04:00, 08:00, 12:00, 16:00, 20:00, 23:59

  // Create paths
  const buildPaths = (data: number[], color: string) => {
    if (data.length === 0) return { linePath: '', areaPath: '', points: [] };

    const points = data.map((val, idx) => getCoordinates(val, idx, data.length));
    
    // Line Path: M x0 y0 L x1 y1 ...
    const linePath = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area Path: Line path + close to bottom of chart
    const bottomY = paddingTop + chartHeight;
    const firstP = points[0];
    const lastP = points[points.length - 1];
    const areaPath = `${linePath} L ${lastP.x} ${bottomY} L ${firstP.x} ${bottomY} Z`;

    return { linePath, areaPath, points };
  };

  const moistureValues = historyData.map(d => d.kelembaban);
  const waterValues = historyData.map(d => d.waterLevel);

  const moistureChart = buildPaths(moistureValues, '#2ecc71');
  const waterChart = buildPaths(waterValues, '#3498db');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full" id="history-charts-row">
      {/* Soil Moisture Chart Card */}
      <div 
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex flex-col relative dash-card-glow"
        id="moisture-history-card"
      >
        {/* Title */}
        <div className="flex items-center gap-2 mb-4" id="moisture-history-title">
          <Leaf className="w-4 h-4 text-[#27ae60]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Riwayat Kelembaban Tanah (Hari Ini)
          </span>
        </div>

        {/* Chart Area */}
        <div className="relative w-full" id="moisture-svg-container">
          <svg className="w-full h-auto" viewBox={`0 0 ${viewWidth} ${viewHeight}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Gradients */}
            <defs>
              <linearGradient id="moistureAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2ecc71" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-axis labels */}
            {yTicks.map((tickVal) => {
              const y = paddingTop + chartHeight - (tickVal / 100) * chartHeight;
              return (
                <g key={tickVal} className="opacity-75">
                  <text 
                    x={paddingLeft - 10} 
                    y={y + 3} 
                    fill="#94a3b8" 
                    fontSize="10" 
                    fontFamily="monospace" 
                    textAnchor="end"
                    className="fill-slate-400 dark:fill-slate-500"
                  >
                    {tickVal}
                  </text>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={viewWidth - paddingRight} 
                    y2={y} 
                    className="stroke-slate-200 dark:stroke-slate-800" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={moistureChart.areaPath} fill="url(#moistureAreaGrad)" />

            {/* Line Graph */}
            <path 
              d={moistureChart.linePath} 
              stroke="#2ecc71" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="drop-shadow-[0_2px_4px_rgba(46,204,113,0.3)]"
            />

            {/* Interactive Points / Hover Targets */}
            {moistureChart.points.map((p, idx) => {
              const isActive = activeMoistureIndex === idx;
              return (
                <g key={idx}>
                  {/* Invisible enlarged hover target */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveMoistureIndex(idx)}
                    onMouseLeave={() => setActiveMoistureIndex(null)}
                  />
                  {/* Visual Dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isActive ? "5.5" : "3.5"}
                    stroke="#2ecc71"
                    strokeWidth="1.5"
                    className={`transition-all duration-150 pointer-events-none ${
                      isActive ? 'fill-[#2ecc71]' : 'fill-white dark:fill-slate-900'
                    }`}
                  />
                </g>
              );
            })}

            {/* X-axis labels */}
            {xTicksIndices.map((idx) => {
              if (idx >= historyData.length) return null;
              const point = historyData[idx];
              const p = getCoordinates(0, idx, historyData.length);
              return (
                <text
                  key={idx}
                  x={p.x}
                  y={viewHeight - 10}
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="opacity-90 fill-slate-400 dark:fill-slate-500"
                >
                  {point.time}
                </text>
              );
            })}
          </svg>

          {/* Interactive HTML Tooltip Panel overlays */}
          {activeMoistureIndex !== null && historyData[activeMoistureIndex] && (
            <div 
              style={{
                left: `${(moistureChart.points[activeMoistureIndex].x / viewWidth) * 100}%`,
                top: `${(moistureChart.points[activeMoistureIndex].y / viewHeight) * 100 - 15}%`,
              }}
              className="absolute transform -translate-x-1/2 -translate-y-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xl pointer-events-none z-10 text-[10px] text-slate-200 text-center animate-fade-in"
              id="moisture-chart-tooltip"
            >
              <p className="font-bold text-white text-xs">{historyData[activeMoistureIndex].kelembaban}%</p>
              <p className="text-slate-400 font-mono mt-0.5">{historyData[activeMoistureIndex].time}</p>
            </div>
          )}
        </div>
      </div>

      {/* Water Level History Card */}
      <div 
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex flex-col relative dash-card-glow"
        id="water-history-card"
      >
        {/* Title */}
        <div className="flex items-center gap-2 mb-4" id="water-history-title">
          <Droplets className="w-4 h-4 text-sky-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Riwayat Level Air (Hari Ini)
          </span>
        </div>

        {/* Chart Area */}
        <div className="relative w-full" id="water-svg-container">
          <svg className="w-full h-auto" viewBox={`0 0 ${viewWidth} ${viewHeight}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Gradients */}
            <defs>
              <linearGradient id="waterAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3498db" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3498db" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-axis labels */}
            {yTicks.map((tickVal) => {
              const y = paddingTop + chartHeight - (tickVal / 100) * chartHeight;
              return (
                <g key={tickVal} className="opacity-75">
                  <text 
                    x={paddingLeft - 10} 
                    y={y + 3} 
                    fill="#94a3b8" 
                    fontSize="10" 
                    fontFamily="monospace" 
                    textAnchor="end"
                    className="fill-slate-400 dark:fill-slate-500"
                  >
                    {tickVal}
                  </text>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={viewWidth - paddingRight} 
                    y2={y} 
                    className="stroke-slate-200 dark:stroke-slate-800" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={waterChart.areaPath} fill="url(#waterAreaGrad)" />

            {/* Line Graph */}
            <path 
              d={waterChart.linePath} 
              stroke="#3498db" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="drop-shadow-[0_2px_4px_rgba(52,152,219,0.3)]"
            />

            {/* Interactive Points / Hover Targets */}
            {waterChart.points.map((p, idx) => {
              const isActive = activeWaterIndex === idx;
              return (
                <g key={idx}>
                  {/* Invisible enlarged hover target */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveWaterIndex(idx)}
                    onMouseLeave={() => setActiveWaterIndex(null)}
                  />
                  {/* Visual Dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isActive ? "5.5" : "3.5"}
                    stroke="#3498db"
                    strokeWidth="1.5"
                    className={`transition-all duration-150 pointer-events-none ${
                      isActive ? 'fill-[#3498db]' : 'fill-white dark:fill-slate-900'
                    }`}
                  />
                </g>
              );
            })}

            {/* X-axis labels */}
            {xTicksIndices.map((idx) => {
              if (idx >= historyData.length) return null;
              const point = historyData[idx];
              const p = getCoordinates(0, idx, historyData.length);
              return (
                <text
                  key={idx}
                  x={p.x}
                  y={viewHeight - 10}
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="opacity-90 fill-slate-400 dark:fill-slate-500"
                >
                  {point.time}
                </text>
              );
            })}
          </svg>

          {/* Interactive HTML Tooltip Panel overlays */}
          {activeWaterIndex !== null && historyData[activeWaterIndex] && (
            <div 
              style={{
                left: `${(waterChart.points[activeWaterIndex].x / viewWidth) * 100}%`,
                top: `${(waterChart.points[activeWaterIndex].y / viewHeight) * 100 - 15}%`,
              }}
              className="absolute transform -translate-x-1/2 -translate-y-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xl pointer-events-none z-10 text-[10px] text-slate-200 text-center animate-fade-in"
              id="water-chart-tooltip"
            >
              <p className="font-bold text-white text-xs">{historyData[activeWaterIndex].waterLevel}%</p>
              <p className="text-slate-400 font-mono mt-0.5">{historyData[activeWaterIndex].time}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
