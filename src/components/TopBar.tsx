import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/topics';
import { 
  Radio, 
  Sun, 
  Moon, 
  Globe, 
  Layers, 
  CheckCircle2,
  ChevronDown,
  Menu
} from 'lucide-react';

const OSI_LAYER_NAMES: { [key: number]: string } = {
  1: 'L1: Physical (RF/Bits)',
  2: 'L2: Data Link (MAC/FCS)',
  3: 'L3: Network (IP/Routing)',
  4: 'L4: Transport (TCP/UDP)',
  5: 'L5: Session',
  6: 'L6: Presentation',
  7: 'L7: Application',
};

export const TopBar: React.FC = () => {
  const {
    selectedTopic,
    totalTopics,
    completedCount,
    progressPercent,
    activeSubStepIndex,
    theme,
    toggleTheme,
    toggleMobileSidebar,
  } = useApp();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const categoryInfo = CATEGORIES[selectedTopic.categoryId];

  return (
    <div className="flex flex-col shrink-0 select-none z-30 transition-colors">
      <header className="h-14 sm:h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d1a] px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-colors">
        {/* 1. Left Zone: Hamburger (Mobile) + Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={toggleMobileSidebar}
            aria-label="Open topics drawer"
            title="Browse all 30 topics"
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 shadow-sm shadow-cyan-500/20 shrink-0">
            <Radio className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                <span className="hidden sm:inline">Wireless Access Explorer</span>
                <span className="sm:hidden">Wireless Access</span>
              </span>
              <span className="px-1.5 py-0.2 sm:py-0.5 text-[9px] sm:text-[10px] font-mono tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800/60 rounded font-bold">
                CH. 11
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 tracking-tight hidden md:block">
              William Stallings · Wireless Communications & Networks (2nd Ed)
            </p>
          </div>
        </div>

        {/* 2. Center Zone: Desktop "NOW LEARNING" Panel */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 px-4 py-2 rounded-xl shadow-inner max-w-xl xl:max-w-2xl truncate">
          <div className="flex flex-col min-w-0 pr-3 border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Now Learning:
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${categoryInfo.accentText}`}>
                {categoryInfo.label}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[240px] xl:max-w-[320px]">
              {selectedTopic.title}
            </span>
          </div>

          {/* OSI Layer Dots (1-7) */}
          <div className="flex items-center gap-1.5 px-1 shrink-0" title="OSI Layers active in this topic">
            <Layers className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 mr-1 shrink-0" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((layerNum) => {
                const isRelevant = selectedTopic.osiLayers.includes(layerNum);
                return (
                  <div
                    key={layerNum}
                    className="group relative flex flex-col items-center"
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-mono font-bold transition-all ${
                        isRelevant
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)] ring-1 ring-cyan-300'
                          : 'bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700/50'
                      }`}
                    >
                      {layerNum}
                    </div>
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50">
                      <span className="whitespace-nowrap rounded bg-slate-900 text-white dark:bg-slate-950 px-2 py-1 text-[11px] font-medium shadow-xl border border-slate-700">
                        {OSI_LAYER_NAMES[layerNum]} {isRelevant ? '• Active' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Tracker */}
          <div className="pl-3 border-l border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
            <span>Step </span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{activeSubStepIndex + 1}</span>
            <span>/{selectedTopic.subSteps.length}</span>
          </div>
        </div>

        {/* 3. Right Zone: Overall Progress, Theme Toggle & Language */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Learning Progress Bar (Adaptive width for Mobile) */}
          <div className="flex flex-col items-end gap-1 min-w-[70px] xs:min-w-[100px] sm:min-w-[150px]">
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 font-medium tabular-nums hidden xs:inline">
                <span className="text-slate-900 dark:text-white font-bold">{completedCount}</span>
                <span className="text-slate-400 dark:text-slate-500">/{totalTopics}</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold tabular-nums ml-0.5 sm:ml-1">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="h-5 sm:h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-cyan-600" />
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
              title="Language selector (English only)"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">EN</span>
              <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:inline" />
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs"
                onMouseLeave={() => setLangDropdownOpen(false)}
              >
                <button
                  onClick={() => setLangDropdownOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-cyan-700 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
                >
                  <span>English (US)</span>
                  <span className="text-[10px] bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 px-1 rounded border border-cyan-300 dark:border-cyan-800/60">
                    Active
                  </span>
                </button>
                <div className="px-3 py-1.5 text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800">
                  Phase 1: English Only
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 4. Compact Mobile / Tablet Sub-Banner for Active Topic & OSI Dots (< lg) */}
      <div className="lg:hidden bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs font-mono">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${categoryInfo.badgeClass} shrink-0`}>
            {categoryInfo.tabLabel || categoryInfo.label}
          </span>
          <span className="text-slate-900 dark:text-white font-medium truncate text-[11px]">
            {selectedTopic.title}
          </span>
        </div>

        {/* Compact OSI Dots (1-7) */}
        <div className="flex items-center gap-1 shrink-0">
          {[1, 2, 3, 4, 5, 6, 7].map((l) => {
            const isRelevant = selectedTopic.osiLayers.includes(l);
            return (
              <span
                key={l}
                className={`h-4 w-4 rounded text-[9px] flex items-center justify-center font-bold ${
                  isRelevant
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600'
                }`}
              >
                {l}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
