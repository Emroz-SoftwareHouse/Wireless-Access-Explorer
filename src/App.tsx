import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { TopicSidebar } from './components/TopicSidebar';
import { NetworkCanvas } from './components/NetworkCanvas';
import { OverviewCard } from './components/OverviewCard';
import { SimulationPanel } from './components/SimulationPanel';
import { Radio, BookOpen } from 'lucide-react';

import { MultipleAccessProvider } from './context/MultipleAccessSimulator';

const AppContent: React.FC = () => {
  const { theme } = useApp();
  const [mobileTab, setMobileTab] = useState<'canvas' | 'overview'>('canvas');

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-colors ${
      theme === 'dark' ? 'bg-[#0b1020] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* 1. Fixed Top Bar */}
      <TopBar />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Topic Sidebar (Full 30-topic syllabus registry) */}
        <TopicSidebar />

        {/* Center & Right Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#070b16] p-2.5 sm:p-3 gap-2.5 sm:gap-3 overflow-y-auto transition-colors">
          {/* Mobile Screen Segmented Tab Toggle (< lg) */}
          <div className="lg:hidden flex items-center p-1 bg-slate-200/90 dark:bg-slate-900/90 rounded-xl border border-slate-300 dark:border-slate-800 shrink-0 text-xs font-mono shadow-xs">
            <button
              onClick={() => setMobileTab('canvas')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all ${
                mobileTab === 'canvas'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Simulation Canvas</span>
            </button>
            <button
              onClick={() => setMobileTab('overview')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all ${
                mobileTab === 'overview'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Overview & Specs</span>
            </button>
          </div>

          {/* Desktop Stage Split (>= lg): Interactive Network/Sequence Canvas + Overview Spec Card */}
          <div className="hidden lg:flex flex-1 flex-row gap-3 min-h-[420px]">
            {/* Center Canvas */}
            <NetworkCanvas />

            {/* Right Overview Card */}
            <OverviewCard />
          </div>

          {/* Mobile Stage Split (< lg): Toggle between Canvas and OverviewCard */}
          <div className="lg:hidden flex flex-col flex-1 gap-2.5 min-h-0">
            {mobileTab === 'canvas' ? (
              <NetworkCanvas />
            ) : (
              <OverviewCard />
            )}
          </div>

          {/* Bottom Simulation Engine & Timestamped Event Log (Desktop always visible, mobile visible when on canvas tab) */}
          <div className={`${mobileTab === 'canvas' ? 'block' : 'hidden lg:block'}`}>
            <SimulationPanel />
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MultipleAccessProvider>
        <AppContent />
      </MultipleAccessProvider>
    </AppProvider>
  );
}

