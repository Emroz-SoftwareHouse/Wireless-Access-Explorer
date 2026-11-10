import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MathFormula } from '../common/MathFormula';
import { Radio, ArrowRight, ArrowLeft, Info, Gauge, Sparkles, Clock } from 'lucide-react';

export const SimpleTddView: React.FC = () => {
  const { simTime, simPlaying, simSpeed } = useApp();

  // Draggable slider state: Tb, Tp, Tg in milliseconds
  const [tb, setTb] = useState<number>(2.0); // burst transmission time (ms)
  const [tp, setTp] = useState<number>(0.2); // propagation delay (ms)
  const [tg, setTg] = useState<number>(0.4); // guard time (ms)
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  const subscriberRateR = 64; // kbps (standard DS0 voice channel)

  // Actual transmission data rate A = 2R * (1 + (Tp + Tg) / Tb)
  const actualRateA = useMemo(() => {
    return 2 * subscriberRateR * (1 + (tp + tg) / tb);
  }, [tb, tp, tg]);

  // Total half-cycle and full-cycle duration in milliseconds
  // Downlink: Tb + Tp + Tg, Uplink: Tb + Tp + Tg
  // Total half-cycle and full-cycle duration in milliseconds
  // Downlink: Tb + Tp + Tg, Uplink: Tb + Tp + Tg
  const halfCycle = tb + tp + tg;
  const fullCycle = 2 * halfCycle;

  // VISUAL PACING REFINEMENT (Phase 4.1):
  // At 1x speed, map one full ping-pong cycle to 8.0 visual seconds so users can comfortably
  // read Tb, Tp, Tg, formulas, and state changes before alternating.
  const visualCycleSeconds = 8.0;
  const cycleProgress = (simTime % visualCycleSeconds) / visualCycleSeconds; // 0.0 to 1.0
  const currentT = cycleProgress * fullCycle; // simulated millisecond position

  // Allocate visual proportions within the 8.0s cycle:
  // Downlink:
  // 0.00 - 0.35: Base Station Transmitting (hold 2.8s)
  // 0.35 - 0.45: Downlink RF In-Flight Propagation (smooth motion 0.8s)
  // 0.45 - 0.50: Guard Interval Tg 1 (turnaround hold 0.4s)
  // Uplink:
  // 0.50 - 0.85: Handset Transmitting (hold 2.8s)
  // 0.85 - 0.95: Uplink RF In-Flight Propagation (smooth motion 0.8s)
  // 0.95 - 1.00: Guard Interval Tg 2 (turnaround hold 0.4s)

  let phaseName = 'Downlink Burst: Base Station Transmitting';
  let phaseColor = 'text-cyan-500 dark:text-cyan-400';
  let phaseDesc = `Base Station compresses digitized subscriber data into a burst of duration Tb = ${tb.toFixed(1)} ms.`;
  let activeTransmitter = 'bs'; // 'bs' | 'air_down' | 'guard1' | 'handset' | 'air_up' | 'guard2'

  let packetProgress = 0; // 0 (at BS) to 1 (at Handset)
  let isDownlinkActive = false;
  let isUplinkActive = false;

  if (cycleProgress < 0.35) {
    phaseName = 'Downlink Burst: Base Station Transmitting';
    phaseColor = 'text-cyan-500 dark:text-cyan-400';
    phaseDesc = `Base Station transmitting ${tb.toFixed(1)} ms burst at high rate A = ${actualRateA.toFixed(1)} kbps.`;
    activeTransmitter = 'bs';
    isDownlinkActive = true;
    packetProgress = 0.08; // at BS antenna
  } else if (cycleProgress < 0.45) {
    phaseName = 'Downlink In-Flight: Over-The-Air Propagation';
    phaseColor = 'text-purple-500 dark:text-purple-400';
    phaseDesc = `RF wavefront travels distance d over propagation time Tp = ${tp.toFixed(2)} ms.`;
    activeTransmitter = 'air_down';
    isDownlinkActive = true;
    // Smooth continuous travel from BS to Handset over 0.8s
    const travelT = (cycleProgress - 0.35) / 0.10;
    packetProgress = 0.08 + travelT * 0.84;
  } else if (cycleProgress < 0.50) {
    phaseName = 'Channel Guard Interval (Tg): Turnaround';
    phaseColor = 'text-amber-500 dark:text-amber-400';
    phaseDesc = `Transceivers switch between TX and RX modes; reflections clear over Tg = ${tg.toFixed(2)} ms.`;
    activeTransmitter = 'guard1';
  } else if (cycleProgress < 0.85) {
    phaseName = 'Uplink Burst: Handset Transmitting';
    phaseColor = 'text-emerald-500 dark:text-emerald-400';
    phaseDesc = `Handset responds on the SAME frequency carrier during its allocated burst time Tb = ${tb.toFixed(1)} ms.`;
    activeTransmitter = 'handset';
    isUplinkActive = true;
    packetProgress = 0.92; // at Handset antenna
  } else if (cycleProgress < 0.95) {
    phaseName = 'Uplink In-Flight: Over-The-Air Propagation';
    phaseColor = 'text-purple-500 dark:text-purple-400';
    phaseDesc = `Uplink signal propagates back to Base Station over time Tp = ${tp.toFixed(2)} ms.`;
    activeTransmitter = 'air_up';
    isUplinkActive = true;
    // Smooth continuous travel from Handset to BS over 0.8s
    const travelT = (cycleProgress - 0.85) / 0.10;
    packetProgress = 0.92 - travelT * 0.84;
  } else {
    phaseName = 'Channel Guard Interval (Tg): Turnaround';
    phaseColor = 'text-amber-500 dark:text-amber-400';
    phaseDesc = `Quiescent interval prior to next Base Station burst (Tg = ${tg.toFixed(2)} ms).`;
    activeTransmitter = 'guard2';
  }

  // Visual width percentages for timelines (normalized across fullCycle)
  const tbPct = (tb / fullCycle) * 100;
  const tpPct = (tp / fullCycle) * 100;
  const tgPct = (tg / fullCycle) * 100;

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Top Formula & Status Banner */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Simple TDD Ping-Pong Timing & Data Rate
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-500">Subscriber Rate R:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">64 kbps (DS0)</span>
          </div>
        </div>

        {/* Dynamic KaTeX Formula Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center bg-slate-50 dark:bg-[#070b14] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <div className="text-center overflow-x-auto">
            <MathFormula tex={`A = 2R \\left(1 + \\frac{T_p + T_g}{T_b}\\right)`} />
          </div>
          <div className="text-center overflow-x-auto border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0">
            <MathFormula 
              tex={`A = 2(64) \\left(1 + \\frac{${tp.toFixed(2)} + ${tg.toFixed(2)}}{${tb.toFixed(1)}}\\right) = \\mathbf{${actualRateA.toFixed(1)}\\text{ kbps}}`} 
            />
          </div>
        </div>

        {/* Live Phase Banner */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse shrink-0" />
            <span className={`font-mono font-bold truncate ${phaseColor}`}>
              {phaseName}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 hidden xs:inline">
            Cycle: {(currentT).toFixed(2)} / {fullCycle.toFixed(2)} ms
          </span>
        </div>
      </div>

      {/* 2. Visual Air-Interface & Timeline Canvas */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-4">
        {/* Node Pair Illustration (Base Station <-> Handset) */}
        <div className="relative flex items-center justify-between px-2 sm:px-8 py-2">
          {/* Base Station Node */}
          <div className={`flex flex-col items-center transition-all ${activeTransmitter === 'bs' ? 'scale-105' : 'opacity-85'}`}>
            <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
              activeTransmitter === 'bs'
                ? 'bg-cyan-100 dark:bg-cyan-950/80 border-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/50'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
              <Radio className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[9px] font-mono font-bold mt-0.5">BS</span>
            </div>
            <span className="text-[10px] font-mono mt-1 font-semibold text-slate-700 dark:text-slate-300">Base Station</span>
            <span className="text-[8px] font-mono text-slate-500">Transceiver</span>
          </div>

          {/* Central Air Channel with Moving Packet */}
          <div className="flex-1 mx-3 sm:mx-8 flex flex-col items-center relative">
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-visible flex items-center">
              <div className="w-full h-full bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-emerald-500/40 rounded-full" />
              
              {/* Animated In-Flight Signal Wave/Packet */}
              {(isDownlinkActive || isUplinkActive) && (
                <div
                  className={`absolute -top-3 h-7 px-2.5 rounded-lg text-[10px] font-mono font-black flex items-center justify-center shadow-lg border-2 z-20 whitespace-nowrap transition-transform duration-75 ${
                    isDownlinkActive
                      ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_14px_#06b6d4]'
                      : 'bg-emerald-400 text-slate-950 border-emerald-100 shadow-[0_0_14px_#10b981]'
                  }`}
                  style={{
                    left: `${packetProgress * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {isDownlinkActive ? (
                    <span className="flex items-center gap-1">
                      <span>DL BURST</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <ArrowLeft className="h-3 w-3" />
                      <span>UL BURST</span>
                    </span>
                  )}
                </div>
              )}

              {/* Guard Turnaround Indicator */}
              {(activeTransmitter === 'guard1' || activeTransmitter === 'guard2') && (
                <div className="absolute left-1/2 -top-2.5 transform -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-bold border border-amber-200 shadow-md">
                  Guard Tg (Turnaround)
                </div>
              )}
            </div>

            <div className="flex justify-between w-full text-[9px] font-mono text-slate-400 mt-2">
              <span>← Distance d →</span>
              <span>Propagation Delay: {tp.toFixed(2)} ms</span>
            </div>
          </div>

          {/* Handset Node */}
          <div className={`flex flex-col items-center transition-all ${activeTransmitter === 'handset' ? 'scale-105' : 'opacity-85'}`}>
            <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
              activeTransmitter === 'handset'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
              <Radio className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[9px] font-mono font-bold mt-0.5">MS</span>
            </div>
            <span className="text-[10px] font-mono mt-1 font-semibold text-slate-700 dark:text-slate-300">Handset</span>
            <span className="text-[8px] font-mono text-slate-500">Transceiver</span>
          </div>
        </div>

        {/* 2 Parallel Timelines: Base Station & Handset (Figure 11.1 in Stallings) */}
        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Alternating TDD Ping-Pong Timelines (Stallings Figure 11.1)
            </span>
            <span className="text-[10px] text-slate-500">
              Total Frame = 2(Tb + Tp + Tg) = {fullCycle.toFixed(2)} ms
            </span>
          </div>

          {/* Timeline A: Base Station Activity */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
              Base Station:
            </span>
            <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-950 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 flex overflow-hidden relative">
              {/* Downlink Transmit Burst (Tb) */}
              <div 
                className="h-full bg-cyan-500 text-slate-950 rounded font-mono text-[9px] font-bold flex items-center justify-center transition-all"
                style={{ width: `${tbPct}%` }}
                title={`Downlink Burst Tb = ${tb.toFixed(1)} ms`}
              >
                <span className="truncate px-1">TX ({tb.toFixed(1)}ms)</span>
              </div>
              {/* Propagation Delay (Tp) */}
              <div 
                className="h-full bg-purple-500/30 border-r border-purple-500/50 flex items-center justify-center transition-all"
                style={{ width: `${tpPct}%` }}
                title={`Propagation Delay Tp = ${tp.toFixed(2)} ms`}
              />
              {/* Guard Time 1 (Tg) */}
              <div 
                className="h-full bg-amber-500/30 border-r border-amber-500/50 flex items-center justify-center transition-all"
                style={{ width: `${tgPct}%` }}
                title={`Guard Time Tg = ${tg.toFixed(2)} ms`}
              />
              {/* Uplink Receive Window (Tb) */}
              <div 
                className="h-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 rounded font-mono text-[9px] font-semibold flex items-center justify-center transition-all"
                style={{ width: `${tbPct}%` }}
                title={`Uplink Reception Window = ${tb.toFixed(1)} ms`}
              >
                <span className="truncate px-1">RX</span>
              </div>
              {/* Guard Time 2 (Tg + Tp) */}
              <div 
                className="h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center transition-all flex-1"
                title="Quiescent gap"
              />

              {/* Moving Playhead Marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 shadow-[0_0_8px_#f43f5e]"
                style={{ left: `${(currentT / fullCycle) * 100}%` }}
              />
            </div>
          </div>

          {/* Timeline B: Handset Activity */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
              Handset:
            </span>
            <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-950 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 flex overflow-hidden relative">
              {/* Propagation Offset Delay Tp */}
              <div 
                className="h-full bg-purple-500/30 border-r border-purple-500/50 flex items-center justify-center transition-all"
                style={{ width: `${tpPct}%` }}
                title={`Propagation Offset Tp = ${tp.toFixed(2)} ms`}
              />
              {/* Downlink Reception Window (Tb) */}
              <div 
                className="h-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 rounded font-mono text-[9px] font-semibold flex items-center justify-center transition-all"
                style={{ width: `${tbPct}%` }}
                title={`Downlink Reception Window = ${tb.toFixed(1)} ms`}
              >
                <span className="truncate px-1">RX</span>
              </div>
              {/* Guard Time 1 (Tg) */}
              <div 
                className="h-full bg-amber-500/30 border-r border-amber-500/50 flex items-center justify-center transition-all"
                style={{ width: `${tgPct}%` }}
                title={`Guard Time Tg = ${tg.toFixed(2)} ms`}
              />
              {/* Uplink Transmit Burst (Tb) */}
              <div 
                className="h-full bg-emerald-500 text-slate-950 rounded font-mono text-[9px] font-bold flex items-center justify-center transition-all"
                style={{ width: `${tbPct}%` }}
                title={`Uplink Burst Tb = ${tb.toFixed(1)} ms`}
              >
                <span className="truncate px-1">TX ({tb.toFixed(1)}ms)</span>
              </div>
              {/* Quiescent gap */}
              <div 
                className="h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center transition-all flex-1"
                title="Quiescent gap"
              />

              {/* Moving Playhead Marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 shadow-[0_0_8px_#f43f5e]"
                style={{ left: `${(currentT / fullCycle) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Draggable Sliders with Live Recomputation */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>TDD Parameter Tuning (Stretches Timelines Live)</span>
          </span>
          <button
            onClick={() => { setTb(2.0); setTp(0.2); setTg(0.4); }}
            className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Slider 1: Burst Time Tb */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <span>Burst Time (Tb)</span>
                <button onClick={() => setActiveInfo(activeInfo === 'tb' ? null : 'tb')} className="text-slate-400 hover:text-cyan-500">
                  <Info className="h-3 w-3" />
                </button>
              </span>
              <span className="font-bold">{tb.toFixed(1)} ms</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={tb}
              onChange={(e) => setTb(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0.5 ms (Fast)</span>
              <span>4.0 ms (Low OH)</span>
            </div>
          </div>

          {/* Slider 2: Propagation Delay Tp */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <span>Prop Delay (Tp)</span>
                <button onClick={() => setActiveInfo(activeInfo === 'tp' ? null : 'tp')} className="text-slate-400 hover:text-purple-500">
                  <Info className="h-3 w-3" />
                </button>
              </span>
              <span className="font-bold">{tp.toFixed(2)} ms</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={tp}
              onChange={(e) => setTp(parseFloat(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0.05 ms (Short)</span>
              <span>0.80 ms (Long)</span>
            </div>
          </div>

          {/* Slider 3: Guard Time Tg */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>Guard Time (Tg)</span>
                <button onClick={() => setActiveInfo(activeInfo === 'tg' ? null : 'tg')} className="text-slate-400 hover:text-amber-500">
                  <Info className="h-3 w-3" />
                </button>
              </span>
              <span className="font-bold">{tg.toFixed(2)} ms</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.50"
              step="0.05"
              value={tg}
              onChange={(e) => setTg(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0.10 ms (Tight)</span>
              <span>1.50 ms (Safe)</span>
            </div>
          </div>
        </div>

        {/* Informational Callout Drawer */}
        {activeInfo && (
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400 mt-0.5" />
            <div className="leading-relaxed">
              {activeInfo === 'tb' && (
                <span><strong>Burst Transmission Time (Tb):</strong> Duration of one compressed data burst. Larger Tb reduces the overhead percentage ((Tp + Tg) / Tb), lowering required actual transmission rate A, but increases buffering delay at the transmitter.</span>
              )}
              {activeInfo === 'tp' && (
                <span><strong>Propagation Delay (Tp):</strong> Time for radio waves to travel between Base Station and Handset at light speed (Tp = d / c). In cordless systems (d &lt; 200m), Tp is fractions of a microsecond; in WLL (d up to 10 km), Tp reaches tens of microseconds.</span>
              )}
              {activeInfo === 'tg' && (
                <span><strong>Guard Time (Tg):</strong> Turnaround interval required for transceiver circuitry to switch from transmit to receive mode and allow multipath reflections from the previous burst to decay before the next burst begins.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
