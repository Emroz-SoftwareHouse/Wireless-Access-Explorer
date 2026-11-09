import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { TopicSidebar } from './components/TopicSidebar';
import { NetworkCanvas } from './components/NetworkCanvas';
import { OverviewCard } from './components/OverviewCard';
import { SimulationPanel } from './components/SimulationPanel';
import { MultipleAccessProvider } from './context/MultipleAccessSimulator';

const AppContent: React.FC = () => {
  const { theme } = useApp();

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-colors ${
      theme === 'dark' ? 'bg-[#0b1020] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* 1. Fixed Top Bar (full width, fixed height) */}
      <TopBar />

      {/* 2. Responsive 3-Column Workspace (fills all remaining height, zero overflow) */}
      <div className="flex-1 flex min-h-0 w-full overflow-hidden relative">
        {/* Left Column: Syllabus Topic Sidebar (collapsible icon rail or expanded, slide-out drawer on mobile) */}
        <TopicSidebar />

        {/* Center Column: Main Content Column (flex-1 min-w-0 min-h-0 flex flex-col) */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col h-full bg-slate-50 dark:bg-[#070b16] p-2 sm:p-2.5 lg:p-3 gap-2 overflow-hidden transition-colors">
          {/* Main Canvas Card: Header (Net/Seq/Th tabs + Zoom/Fit/Max), Canvas Viewport, Docked Controls */}
          <NetworkCanvas />

          {/* Collapsible Event Log: Pinned at the bottom of the center column */}
          <SimulationPanel />
        </main>

        {/* Right Column: Overview & Specifications Card (collapsible icon rail or expanded, slide-out drawer on mobile) */}
        <OverviewCard />
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

