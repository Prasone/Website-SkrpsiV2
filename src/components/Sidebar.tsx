import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  CalendarClock, 
  Sliders, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  systemStatus: 'normal' | 'warning' | 'danger';
  statusText: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  systemStatus, 
  statusText,
  darkMode,
  onToggleDarkMode,
  mobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'monitoring' as Tab, label: 'Monitoring', icon: Activity },
    { id: 'jadwal' as Tab, label: 'Jadwal Penyiraman', icon: CalendarClock },
    { id: 'kontrol' as Tab, label: 'Kontrol Manual', icon: Sliders },
    { id: 'pengaturan' as Tab, label: 'Pengaturan', icon: Settings },
  ];

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <>
      {/* Brand Logo Header */}
      <div>
        <div className="flex items-center justify-between px-2 py-3 mb-4" id="brand-logo">
          <div className="flex items-center gap-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-8 h-8 text-[#2ecc71] filter drop-shadow-[0_0_8px_rgba(46,204,113,0.3)]"
            >
              <path d="M2.25 18.75a8.25 8.25 0 0 1 8.25-8.25H12v1.5h-1.5a6.75 6.75 0 0 0-6.75 6.75h-1.5z" />
              <path d="M11.25 10.5a8.25 8.25 0 0 1 8.25-8.25h1.5v1.5H19.5a6.75 6.75 0 0 0-6.75 6.75h-1.5z" />
              <path d="M12 22.5V10.5M12 15l4.5-4.5M12 18.75l-3.75-3.75" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <h1 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight tracking-wide">Kebun</h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">Termonitor</p>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1" id="sidebar-navigation">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#27ae60] dark:text-[#2ecc71] border-l-4 border-[#2ecc71] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-[#27ae60]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Seedling Illustration and Status Container */}
      <div className="space-y-4 animate-fadeIn mt-6" id="sidebar-footer">
        
        {/* Theme Toggle Widget */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800" id="theme-toggle-widget">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1.5">Tema</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { if (darkMode) onToggleDarkMode(); }}
              className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${!darkMode ? 'bg-[#e8f8f0] text-[#27ae60] shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="Mode Terang"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => { if (!darkMode) onToggleDarkMode(); }}
              className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${darkMode ? 'bg-emerald-950/50 text-[#2ecc71] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
              title="Mode Gelap"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Seedling Illustration Vector */}
        <div className="flex justify-center py-1 hidden xs:flex" id="seedling-illustration">
          <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M35 75C35 45 60 40 60 40C60 40 50 65 35 75Z" 
              fill="#22c55e" 
              className="opacity-80 filter drop-shadow-[0_4px_6px_rgba(34,197,94,0.2)]" 
            />
            <path d="M35 75C42 62 50 52 60 40" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
            <path 
              d="M85 70C85 40 60 35 60 35C60 35 70 60 85 70Z" 
              fill="#4ade80" 
              className="opacity-90 filter drop-shadow-[0_4px_6px_rgba(74,222,128,0.2)]" 
            />
            <path d="M85 70C78 58 70 48 60 35" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
            <path 
              d="M60 100C60 70 60 35 60 35" 
              stroke="#15803d" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            <path 
              d="M60 45C55 35 60 25 60 25C60 25 65 35 60 45Z" 
              fill="#86efac" 
            />
            <ellipse cx="60" cy="100" rx="20" ry="5" fill="#64748b" opacity="0.2" />
          </svg>
        </div>

        {/* Live Status Indicator Box */}
        <div className="glass-panel dark:bg-slate-900/50 dark:border-slate-850 rounded-2xl p-3 sm:p-4 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm" id="status-badge-box">
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Status Sistem</p>
          <div className="flex items-center justify-center gap-2">
            {systemStatus === 'normal' ? (
              <>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#27ae60] filter drop-shadow-[0_0_4px_rgba(46,204,113,0.3)]" />
                <span className="text-xs sm:text-sm font-bold text-[#27ae60] tracking-wide">{statusText}</span>
              </>
            ) : systemStatus === 'warning' ? (
              <>
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]" />
                <span className="text-xs sm:text-sm font-bold text-amber-600 tracking-wide">{statusText}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.3)]" />
                <span className="text-xs sm:text-sm font-bold text-rose-600 tracking-wide">{statusText}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 flex-col justify-between p-4 shrink-0 z-20 h-screen sticky top-0" id="sidebar-container">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" id="mobile-sidebar-drawer">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 shadow-2xl h-full overflow-y-auto z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

