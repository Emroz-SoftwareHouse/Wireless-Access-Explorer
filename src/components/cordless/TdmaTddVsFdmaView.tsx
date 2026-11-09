import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MathFormula } from '../common/MathFormula';
import { 
  Radio, 
  Antenna, 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

export const TdmaTddVsFdmaView: React.FC = () => {
  const { simTime, simPlaying, simSpeed } = useApp();

  // Forward Traffic Load Slider for Scene (b): 50% (Symmetric) to 85% (Asymmetric Downlink)
  const [forwardLoadPct, setForwardLoadPct] = useState<number>(70);
  const [activeTab, setActiveTab] = useState<'both' | 'fade' | 'capacity'>('both');
  const [showInfo, setShowInfo] = useState<string | null>(null);

  // Scene (a): Fast-Fade simulation clock (cycle of 6.0 seconds)
  const fadeCycle = (simTime % 6.0);
  // Phase 0-2.0s: Antenna A normal, Handset transmits uplink
  // Phase 2.0-4.0s: Fast-fade strikes Antenna A! BS measures RSSI_B >> RSSI_A, switches to Antenna B
  // Phase 4.0-6.0s: BS uses Antenna B to transmit Downlink burst back to handset via channel reciprocity
  const isFadingAntennaA = fadeCycle >= 1.8 && fadeCycle < 4.2;
  const isAntennaBSelected = fadeCycle >= 2.5;
  const isTransmittingDownlink = fadeCycle >= 3.6;

  // Scene (b): Compute slots out of 24 DECT-style slots
  const totalSlots = 24;
  const forwardSlots = Math.round((forwardLoadPct / 100) * totalSlots);
  const reverseSlots = totalSlots - forwardSlots;

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Header & Switcher */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              TDMA/TDD vs. TDMA/FDMA Architectural Comparison
            </span>
          </div>
          {/* View filter buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                activeTab === 'both' ? 'bg-white dark:bg-slate-950 font-bold shadow-xs text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveTab('fade')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                activeTab === 'fade' ? 'bg-white dark:bg-slate-950 font-bold shadow-xs text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              (a) Fast-Fade Diversity
            </button>
            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                activeTab === 'capacity' ? 'bg-white dark:bg-slate-950 font-bold shadow-xs text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              (b) Dynamic Capacity
            </button>
          </div>
        </div>

        {/* 3 Cordless Design Constraints Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-amber-600 dark:text-amber-400 font-bold">1. Modest Range:</span>
            <span className="text-slate-600 dark:text-slate-400 block text-[10px] mt-0.5">&lt; 100-200m range, low transmit power (~10-250 mW).</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-amber-600 dark:text-amber-400 font-bold">2. Inexpensive Handset:</span>
            <span className="text-slate-600 dark:text-slate-400 block text-[10px] mt-0.5">Single antenna on handset; no bulky duplexer filters.</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-amber-600 dark:text-amber-400 font-bold">3. Limited Spectrum:</span>
            <span className="text-slate-600 dark:text-slate-400 block text-[10px] mt-0.5">Narrow allocation; single-carrier TDD eliminates dual-band need.</span>
          </div>
        </div>
      </div>

      {/* 2. Side-By-Side Canvas Area */}
      <div className={`grid gap-3 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* ============================================================== */}
        {/* SCENE (a): TDD FAST-FADING HANDLING & ANTENNA RECIPROCITY     */}
        {/* ============================================================== */}
        {(activeTab === 'both' || activeTab === 'fade') && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>(a) TDD Fast-Fade & Spatial Diversity</span>
              </span>
              <button 
                onClick={() => setShowInfo(showInfo === 'fade' ? null : 'fade')}
                className="text-slate-400 hover:text-cyan-500 text-xs"
                title="Explain Fast Fading Reciprocity"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Diversity Scene Canvas */}
            <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-3 min-h-[220px] justify-between">
              
              {/* Handset vs Base Station Diagram */}
              <div className="flex items-center justify-between px-2 pt-1">
                {/* Handset (Single Antenna, Inexpensive) */}
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 flex flex-col items-center justify-center shadow-sm">
                    <Radio className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[8px] font-mono font-bold mt-0.5">MS</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold mt-1">Inexpensive Handset</span>
                  <span className="text-[8px] font-mono text-slate-500">Single Antenna (Cost Saver)</span>
                </div>

                {/* Over-the-Air Rays toward Base Station */}
                <div className="flex-1 mx-2 sm:mx-4 flex flex-col items-center relative">
                  {/* Ray to Antenna A */}
                  <div className={`w-full h-1.5 rounded-full my-2 transition-all duration-300 relative ${
                    isFadingAntennaA
                      ? 'bg-rose-500/30 border border-dashed border-rose-500 animate-pulse'
                      : 'bg-cyan-500/40'
                  }`}>
                    {isFadingAntennaA && (
                      <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-1.5 py-0.2 rounded bg-rose-600 text-white font-mono text-[8px] font-bold shadow-xs whitespace-nowrap">
                        Ray A: FADE (-24 dB)
                      </span>
                    )}
                  </div>

                  {/* Ray to Antenna B */}
                  <div className={`w-full h-1.5 rounded-full my-2 transition-all duration-300 relative ${
                    isAntennaBSelected
                      ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}>
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono text-[8px] font-bold shadow-xs whitespace-nowrap">
                      Ray B: CLEAR (-6 dB)
                    </span>
                  </div>

                  <span className="text-[8px] font-mono text-slate-400 mt-1">
                    {isTransmittingDownlink 
                      ? 'Downlink Transmitted via Antenna B (Reciprocity)' 
                      : 'Uplink Probe Measured at Dual Antennas'}
                  </span>
                </div>

                {/* Base Station (2 Antennas Spaced >= lambda apart) */}
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-500 flex flex-col items-center gap-1.5 shadow-sm">
                    {/* Dual Antenna Visual */}
                    <div className="flex items-center gap-3">
                      {/* Antenna A */}
                      <div className={`flex flex-col items-center p-1 rounded-lg border transition-all ${
                        isFadingAntennaA
                          ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-600'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        <Antenna className="h-4 w-4" />
                        <span className="text-[7.5px] font-mono font-bold">Ant A</span>
                      </div>

                      {/* Antenna B (Selected) */}
                      <div className={`flex flex-col items-center p-1 rounded-lg border transition-all ${
                        isAntennaBSelected
                          ? 'bg-emerald-200 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        <Antenna className="h-4 w-4" />
                        <span className="text-[7.5px] font-mono font-bold">Ant B ✓</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-purple-700 dark:text-purple-300 font-bold">
                      Base Station Hub
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold mt-1">Dual Antennas (d &ge; &lambda;)</span>
                </div>
              </div>

              {/* Status Explanation Banner */}
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[10px] font-mono flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  {isFadingAntennaA ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span className={isFadingAntennaA ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                    {isFadingAntennaA
                      ? 'Fast Fade Detected on Antenna A! BS selects Antenna B for next forward burst.'
                      : 'Channel Normal: Base Station monitoring RSSI across spatial diversity pair.'}
                  </span>
                </div>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold shrink-0">
                  {isAntennaBSelected ? 'Ant B Active' : 'Measuring...'}
                </span>
              </div>
            </div>

            {/* Reciprocity Math note */}
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-cyan-600 dark:text-cyan-400">Channel Reciprocity: </span>
              Because TDD uses identical frequency <MathFormula tex={`f_{\\text{DL}} = f_{\\text{UL}}`} displayMode={false} /> within the coherence time <MathFormula tex={`T_c`} displayMode={false} />, selecting the best antenna on reception guarantees the best transmission back to the handset without requiring expensive multi-antenna hardware on the handset!
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCENE (b): DYNAMIC CAPACITY ALLOCATION (ASYMMETRIC TRAFFIC)   */}
        {/* ============================================================== */}
        {(activeTab === 'both' || activeTab === 'capacity') && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-emerald-500" />
                <span>(b) Dynamic Capacity Allocation (Asymmetric Slots)</span>
              </span>
              <button 
                onClick={() => setShowInfo(showInfo === 'capacity' ? null : 'capacity')}
                className="text-slate-400 hover:text-emerald-500 text-xs"
                title="Explain Asymmetric Capacity Allocation"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Slider Control for Forward Traffic Load */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Forward Traffic Load (Downlink Web Demand):
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {forwardLoadPct}% Downlink / {100 - forwardLoadPct}% Uplink
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                step="5"
                value={forwardLoadPct}
                onChange={(e) => setForwardLoadPct(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>50% (Symmetric Voice: 12/12 slots)</span>
                <span>85% (Asymmetric Web: 20/4 slots)</span>
              </div>
            </div>

            {/* TDMA/TDD Dynamic Frame View */}
            <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  TDMA/TDD Frame (24 Time Slots / 10 ms): Dynamic Split
                </span>
                <span className="text-[10px] text-slate-400">
                  DL: {forwardSlots} slots · UL: {reverseSlots} slots
                </span>
              </div>

              {/* Slotted Bar showing live dynamic split boundary */}
              <div className="h-9 w-full bg-slate-200 dark:bg-slate-950 rounded-lg p-1 border border-slate-300 dark:border-slate-800 flex gap-0.5 overflow-hidden">
                {Array.from({ length: totalSlots }).map((_, i) => {
                  const isForward = i < forwardSlots;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-full rounded transition-all duration-300 flex items-center justify-center font-mono text-[8px] font-bold ${
                        isForward
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'bg-emerald-500 text-slate-950 shadow-xs'
                      }`}
                      title={isForward ? `Downlink Slot ${i + 1}` : `Uplink Slot ${i + 1}`}
                    >
                      <span className="hidden sm:inline">{isForward ? 'D' : 'U'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Inelastic TDMA/FDMA comparison */}
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Traditional TDMA/FDMA (Dual Carrier): Inelastic 50/50</span>
                  <span className="text-rose-500 font-bold">
                    {forwardLoadPct > 50 ? `Wasting ${forwardLoadPct - 50}% Reverse Spectrum!` : 'Matched'}
                  </span>
                </div>
                <div className="h-6 w-full bg-slate-200 dark:bg-slate-950 rounded-lg p-1 border border-slate-300 dark:border-slate-800 flex gap-0.5 opacity-60">
                  <div className="h-full bg-cyan-600 text-white rounded text-[8px] font-mono flex items-center justify-center" style={{ width: '50%' }}>
                    Fixed Forward Band (50%)
                  </div>
                  <div className="h-full bg-slate-400 text-slate-950 rounded text-[8px] font-mono flex items-center justify-center" style={{ width: '50%' }}>
                    Fixed Reverse Band (Idle / Wasted)
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity allocation insight */}
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Web Traffic Advantage: </span>
              In internet browsing, downstream page delivery requires 5x-10x more bandwidth than upstream HTTP requests. TDMA/TDD dynamically moves the slot partition boundary without changing radio hardware, whereas FDMA leaves the reverse carrier half-empty.
            </div>
          </div>
        )}
      </div>

      {/* Info Modal / Explanation drawer */}
      {showInfo && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            {showInfo === 'fade' && (
              <span><strong>Fast-Fade Diversity & Channel Reciprocity:</strong> In cordless systems, handsets are handheld and inexpensive, making dual antennas or RAKE equalizers impractical. Because TDD alternates over the EXACT SAME RF carrier, electromagnetic path characteristics are identical in both directions. The base station selects the strongest antenna during handset reception and immediately reuses that antenna for the subsequent forward transmission!</span>
            )}
            {showInfo === 'capacity' && (
              <span><strong>Dynamic Capacity Allocation (§11.1):</strong> A conventional dual-carrier FDMA system requires equal, fixed spectrum allocations in both directions. For bursty, asymmetric data (such as web browsing or multimedia downloads), capacity on the reverse channel is wasted. A TDD controller dynamically adjusts the split boundary within each TDMA frame to allocate up to 80-85% of time slots to the downlink.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
