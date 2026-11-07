import React from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/topics';
import { 
  CheckCircle2, 
  Layers, 
  Activity, 
  PackageCheck, 
  Clock, 
  Check,
  FileText
} from 'lucide-react';

import { useMultipleAccess } from '../context/MultipleAccessSimulator';

export const OverviewCard: React.FC = () => {
  const {
    selectedTopic,
    completedTopicIds,
    toggleTopicCompleted,
    deliveredPacketsCount,
    simTime,
    simPlaying,
    isDemoActive,
  } = useApp();

  const {
    mode,
    collisionsCount,
    deliveredCount: maDeliveredCount,
    tdmaCurrentSlot,
    devices,
  } = useMultipleAccess();

  const isCompleted = completedTopicIds.has(selectedTopic.id);
  const categoryInfo = CATEGORIES[selectedTopic.categoryId];
  const isMultipleAccessTopic = selectedTopic.categoryId === 'multiple_access';

  // Compute active delivered count
  const effectiveDelivered = isMultipleAccessTopic ? maDeliveredCount : (isDemoActive ? deliveredPacketsCount : 0);

  return (
    <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white dark:bg-[#080c17] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-xl select-none shrink-0 transition-colors">
      {/* 1. Header with Badge & Status */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Category kicker */}
          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${categoryInfo.accentText}`}>
            {categoryInfo.label}
          </span>

          {/* Active Status Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ACTIVE</span>
          </div>
        </div>

        {/* Topic Title */}
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
          {selectedTopic.title}
        </h2>
        <span className="text-[11px] font-mono text-slate-500">
          Section: {selectedTopic.sectionRef} · Topic #{selectedTopic.order} of 30
        </span>
      </div>

      {/* 2. Scrollable Body: Description, Live Telemetry, Spec Table */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Description */}
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Overview Summary
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {selectedTopic.fullDescription}
          </p>
        </div>

        {/* Live Simulation Metrics (Live Updating for Demo & All 5 Modes!) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Live Simulation State</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
              {isMultipleAccessTopic ? `${mode.toUpperCase()} Active` : isDemoActive ? 'Demo Active' : 'Standby'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Live Packets Delivered */}
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 block font-mono">Packets Delivered</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {effectiveDelivered}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {isMultipleAccessTopic ? 'received' : '/ 2 max'}
                </span>
              </div>
            </div>

            {/* Simulated Time Clock OR Collisions in Contention Mode */}
            {mode === 'contention' ? (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 shadow-xs">
                <span className="text-[10px] text-rose-700 dark:text-rose-300 block font-mono">Collisions Detected</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400 tabular-nums">
                    {collisionsCount}
                  </span>
                  <span className="text-[10px] text-rose-600/70 dark:text-rose-300/70 font-mono">corrupted</span>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-mono">Simulated Clock</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                    {simTime.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">sec</span>
                </div>
              </div>
            )}
          </div>

          {/* Mode Context Status Row */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between pt-1">
            <span>Coordination:</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {mode === 'fdma' && '4 Dedicated Frequency Lanes'}
              {mode === 'tdma' && `Rotating Slot ${tdmaCurrentSlot + 1} (${devices[tdmaCurrentSlot]?.shortName})`}
              {mode === 'cdma' && '4 Orthogonal Walsh Codes'}
              {mode === 'dama' && 'Demand Reservation (BW_REQ / GRANT)'}
              {mode === 'contention' && `Pure ALOHA (${devices.length} stations)`}
              {mode === 'overview' && (simPlaying ? 'Transmitting' : 'Ready')}
            </span>
          </div>
        </div>

        {/* Key:Value Technical Spec Table (Structured for later phases) */}
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>Technical Specifications</span>
          </h4>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800/90 overflow-hidden divide-y divide-slate-200 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
            {selectedTopic.specs.map((row, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-900/50"
              >
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{row.label}</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono text-[11px] text-right font-medium max-w-[170px] truncate" title={row.value}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* OSI Layer mapping badges */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
            Target OSI Layers
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedTopic.osiLayers.map((l) => (
              <span
                key={l}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-100 dark:bg-slate-800/90 border border-cyan-200 dark:border-slate-700/80 text-cyan-800 dark:text-cyan-300 font-semibold"
              >
                Layer {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Footer: Mark Topic Complete Toggle Button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/80">
        <button
          onClick={() => toggleTopicCompleted(selectedTopic.id)}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 shadow-sm'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-950 font-bold'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="h-4 w-4" />
              <span>Topic Completed (Mark Incomplete)</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Topic Complete</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
