import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radio, 
  Building2, 
  Antenna, 
  Zap, 
  Activity, 
  Sliders, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';

export const MultipathLossView: React.FC = () => {
  const { 
    simTime, 
    simPlaying, 
    simSpeed,
    multipathFreq,
    setMultipathFreq 
  } = useApp();

  // Internal frequency state with default fallback if context doesn't have it
  const freq = multipathFreq || 10;
  const setFreq = (val: number) => {
    if (setMultipathFreq) setMultipathFreq(val);
  };

  // Free-Space Path Loss Calculation (Stallings Ch 5.3):
  // L_dB = 32.44 + 20 log10(d_km) + 20 log10(f_MHz)
  // For standard 1.0 km link: L_dB = 92.44 + 20 * log10(f_GHz)
  const refDistanceKm = 1.0;
  const freeSpaceLossDb = useMemo(() => {
    return Number((92.44 + 20 * Math.log10(freq) + 20 * Math.log10(refDistanceKm)).toFixed(1));
  }, [freq, refDistanceKm]);

  // Relative received power scaling (1.0 at 1 GHz down to 0.22 at 40 GHz)
  const signalStrengthPct = useMemo(() => {
    // 1 GHz -> ~100%, 40 GHz -> ~25%
    const ratio = Math.pow(1 / freq, 0.45);
    return Math.max(0.20, Math.min(1.0, ratio));
  }, [freq]);

  // Wave cycle timing (repeats every 2.4 seconds at 1x speed)
  const cycleDuration = 2.4;
  const cycleTime = simTime % cycleDuration;
  const cycleProgress = cycleTime / cycleDuration;

  // Path lengths & arrival times:
  // 1. Direct LOS: arrives at progress = 0.42 (t ~ 1.00s)
  // 2. Reflected: arrives at progress = 0.58 (t ~ 1.40s)
  // 3. Diffracted: arrives at progress = 0.72 (t ~ 1.72s)
  const losProgress = Math.min(1, cycleProgress / 0.42);
  const refProgress = Math.min(1, cycleProgress / 0.58);
  const diffProgress = Math.min(1, cycleProgress / 0.72);

  const isLosArrived = cycleProgress >= 0.42;
  const isRefArrived = cycleProgress >= 0.58;
  const isDiffArrived = cycleProgress >= 0.72;

  // Track dispatched events to SimulationPanel
  const lastCycleRef = useRef<number>(-1);
  useEffect(() => {
    if (simTime === 0) {
      lastCycleRef.current = -1;
      return;
    }
    const currentCycleNum = Math.floor(simTime / cycleDuration);
    if (currentCycleNum !== lastCycleRef.current && isLosArrived) {
      lastCycleRef.current = currentCycleNum;
      const newEvt = {
        no: currentCycleNum + 1,
        timeFormatted: `${simTime.toFixed(2)}s`,
        timestamp: simTime,
        source: 'Transmitter Tower (TX)',
        destination: 'Subscriber Station (RX)',
        type: 'DATA_PACKET' as const,
        info: `Multipath Wavefront: Direct LOS (t0) + Reflected (+0.40s) + Diffracted (+0.72s). Freq: ${freq.toFixed(1)} GHz · Path Loss: ${freeSpaceLossDb} dB`,
        sizeValue: `${freeSpaceLossDb} dB`,
      };
      window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', { detail: newEvt }));
    }
  }, [cycleDuration, isLosArrived, simTime, freq, freeSpaceLossDb]);

  // Frequency preset markers
  const FREQ_PRESETS = [
    { label: '2.4 GHz (ISM)', val: 2.4 },
    { label: '5.8 GHz (WLL)', val: 5.8 },
    { label: '10.5 GHz (X-Band)', val: 10.5 },
    { label: '28.0 GHz (LMDS)', val: 28.0 },
    { label: '38.0 GHz (mmWave)', val: 38.0 },
  ];

  // SVG dimensions for geometry (800 x 340)
  const txX = 80;
  const txY = 220;
  const rxX = 720;
  const rxY = 220;

  // Obstacle building coordinates
  const buildingX = 360;
  const buildingY = 70;
  const buildingWidth = 90;
  const buildingHeight = 170; // sits from y=70 down to y=240
  const cornerX = buildingX;
  const cornerY = buildingY; // sharp top-left diffraction edge
  const wallBounceX = 405;
  const wallBounceY = 60; // top reflective surface/billboard

  // Compute interpolated points along each path
  // Direct LOS: straight line (txX, txY) -> (rxX, rxY)
  const losCurrentX = txX + (rxX - txX) * losProgress;
  const losCurrentY = txY + (rxY - txY) * losProgress;

  // Reflected: (txX, txY) -> (wallBounceX, wallBounceY) -> (rxX, rxY)
  const refMidProgress = 0.48; // reaches wall at 48% of its journey
  let refCurrentX = txX;
  let refCurrentY = txY;
  if (refProgress <= refMidProgress) {
    const subP = refProgress / refMidProgress;
    refCurrentX = txX + (wallBounceX - txX) * subP;
    refCurrentY = txY + (wallBounceY - txY) * subP;
  } else {
    const subP = (refProgress - refMidProgress) / (1 - refMidProgress);
    refCurrentX = wallBounceX + (rxX - wallBounceX) * subP;
    refCurrentY = wallBounceY + (rxY - wallBounceY) * subP;
  }

  // Diffracted: (txX, txY) -> (cornerX, cornerY) -> (rxX, rxY)
  const diffMidProgress = 0.46;
  let diffCurrentX = txX;
  let diffCurrentY = txY;
  if (diffProgress <= diffMidProgress) {
    const subP = diffProgress / diffMidProgress;
    diffCurrentX = txX + (cornerX - txX) * subP;
    diffCurrentY = txY + (cornerY - txY) * subP;
  } else {
    const subP = (diffProgress - diffMidProgress) / (1 - diffMidProgress);
    diffCurrentX = cornerX + (rxX - cornerX) * subP;
    diffCurrentY = cornerY + (rxY - cornerY) * subP;
  }

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-5 select-none overflow-y-auto no-pan">
      {/* 1. Frequency Slider & Free Space Loss Telemetry Header */}
      <div className="w-full bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: Frequency Slider */}
          <div className="flex-1 w-full max-w-md">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Carrier Frequency (f):</span>
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold text-sm tabular-nums">
                {freq.toFixed(1)} GHz
              </span>
            </div>

            <input
              type="range"
              min={1.0}
              max={40.0}
              step={0.5}
              value={freq}
              onChange={(e) => setFreq(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />

            {/* Quick frequency preset buttons */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none">
              {FREQ_PRESETS.map((p) => (
                <button
                  key={p.val}
                  onClick={() => setFreq(p.val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors ${
                    Math.abs(freq - p.val) < 0.2
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Path Loss Readout & Signal Strength Meter */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Free-Space Loss */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-right shadow-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                Free-Space Loss (d=1km)
              </span>
              <div className="flex items-baseline justify-end gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                  {freeSpaceLossDb}
                </span>
                <span className="text-xs font-mono text-slate-500">dB</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                Loss ∝ f² (inverse-square)
              </span>
            </div>

            {/* Received Signal Strength Visual Gauge */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-right shadow-xs min-w-[110px]">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                RX Signal Level
              </span>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <div className="h-2 w-14 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-200"
                    style={{ width: `${signalStrengthPct * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {Math.round(signalStrengthPct * 100)}%
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                {freq > 20 ? 'Severely Attenuated' : 'High Quality'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Multipath Scene (SVG Canvas) */}
      <div className="w-full flex-1 min-h-[260px] sm:min-h-[300px] bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-center shadow-inner">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <svg
          viewBox="0 0 800 340"
          className="w-full h-full max-h-[360px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Ground Plane line */}
          <line x1={40} y1={270} x2={760} y2={270} stroke="#1e293b" strokeWidth={2} />

          {/* Obstacle: Urban Building & Rooftop structure */}
          <rect
            x={buildingX}
            y={buildingY}
            width={buildingWidth}
            height={buildingHeight}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth={2}
            rx={4}
          />
          {/* Building Windows */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 2 }).map((_, col) => (
              <rect
                key={`win-${row}-${col}`}
                x={buildingX + 16 + col * 36}
                y={buildingY + 25 + row * 34}
                width={20}
                height={18}
                fill="#1e293b"
                rx={2}
                opacity={0.8}
              />
            ))
          )}
          {/* Building Top Label */}
          <text
            x={buildingX + buildingWidth / 2}
            y={buildingY - 14}
            fill="#94a3b8"
            fontSize={10}
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            Reflective Structure / Obstacle
          </text>

          {/* Reflector surface line at top of building */}
          <line
            x1={buildingX - 10}
            y1={wallBounceY}
            x2={buildingX + buildingWidth + 10}
            y2={wallBounceY}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="4 2"
          />

          {/* Diffraction Edge Marker at corner (cornerX, cornerY) */}
          <circle cx={cornerX} cy={cornerY} r={6} fill="#a855f7" opacity={0.6} className="animate-ping" />
          <circle cx={cornerX} cy={cornerY} r={4} fill="#a855f7" stroke="#ffffff" strokeWidth={1} />
          <text
            x={cornerX - 10}
            y={cornerY - 10}
            fill="#c084fc"
            fontSize={9}
            fontFamily="monospace"
            textAnchor="end"
          >
            Diffraction Edge (0.6 R₁)
          </text>

          {/* Guide Path 1: Direct Line-of-Sight (Cyan) */}
          <line
            x1={txX}
            y1={txY}
            x2={rxX}
            y2={rxY}
            stroke="#06b6d4"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.35}
          />

          {/* Guide Path 2: Reflected Path (Amber) */}
          <polyline
            points={`${txX},${txY} ${wallBounceX},${wallBounceY} ${rxX},${rxY}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.35}
          />

          {/* Guide Path 3: Diffracted Path (Purple) */}
          <polyline
            points={`${txX},${txY} ${cornerX},${cornerY} ${rxX},${rxY}`}
            fill="none"
            stroke="#a855f7"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.35}
          />

          {/* Active Propagating Wavefront 1: Direct LOS (Cyan) */}
          {/* Signal size and opacity scaled with frequency f² loss! */}
          <g opacity={signalStrengthPct}>
            <circle
              cx={losCurrentX}
              cy={losCurrentY}
              r={10 * signalStrengthPct + 3}
              fill="#22d3ee"
              className="filter drop-shadow-[0_0_12px_#06b6d4]"
            />
            <line
              x1={txX}
              y1={txY}
              x2={losCurrentX}
              y2={losCurrentY}
              stroke="#06b6d4"
              strokeWidth={3 * signalStrengthPct + 1}
              strokeLinecap="round"
            />
          </g>

          {/* Active Propagating Wavefront 2: Reflected (Amber) */}
          <g opacity={signalStrengthPct * 0.85}>
            <circle
              cx={refCurrentX}
              cy={refCurrentY}
              r={8 * signalStrengthPct + 3}
              fill="#fbbf24"
              className="filter drop-shadow-[0_0_10px_#f59e0b]"
            />
            {refProgress <= refMidProgress ? (
              <line
                x1={txX}
                y1={txY}
                x2={refCurrentX}
                y2={refCurrentY}
                stroke="#f59e0b"
                strokeWidth={2.5 * signalStrengthPct + 1}
                strokeLinecap="round"
              />
            ) : (
              <>
                <line
                  x1={txX}
                  y1={txY}
                  x2={wallBounceX}
                  y2={wallBounceY}
                  stroke="#f59e0b"
                  strokeWidth={2 * signalStrengthPct + 0.5}
                  opacity={0.6}
                />
                <line
                  x1={wallBounceX}
                  y1={wallBounceY}
                  x2={refCurrentX}
                  y2={refCurrentY}
                  stroke="#f59e0b"
                  strokeWidth={2.5 * signalStrengthPct + 1}
                  strokeLinecap="round"
                />
              </>
            )}
          </g>

          {/* Active Propagating Wavefront 3: Diffracted (Purple) */}
          <g opacity={signalStrengthPct * 0.75}>
            <circle
              cx={diffCurrentX}
              cy={diffCurrentY}
              r={7 * signalStrengthPct + 2.5}
              fill="#c084fc"
              className="filter drop-shadow-[0_0_10px_#a855f7]"
            />
            {diffProgress <= diffMidProgress ? (
              <line
                x1={txX}
                y1={txY}
                x2={diffCurrentX}
                y2={diffCurrentY}
                stroke="#a855f7"
                strokeWidth={2.5 * signalStrengthPct + 1}
                strokeLinecap="round"
              />
            ) : (
              <>
                <line
                  x1={txX}
                  y1={txY}
                  x2={cornerX}
                  y2={cornerY}
                  stroke="#a855f7"
                  strokeWidth={2 * signalStrengthPct + 0.5}
                  opacity={0.6}
                />
                <line
                  x1={cornerX}
                  y1={cornerY}
                  x2={diffCurrentX}
                  y2={diffCurrentY}
                  stroke="#a855f7"
                  strokeWidth={2.5 * signalStrengthPct + 1}
                  strokeLinecap="round"
                />
              </>
            )}
          </g>

          {/* Node Left: Transmitter Mast (TX) */}
          <g transform={`translate(${txX - 24}, ${txY - 32})`}>
            {/* Mast Base */}
            <rect x={20} y={32} width={8} height={48} fill="#334155" />
            <polygon points="12,80 36,80 24,32" fill="none" stroke="#475569" strokeWidth={1.5} />
            {/* Antenna Horn / Dish */}
            <circle cx={24} cy={20} r={18} fill="#0f172a" stroke="#06b6d4" strokeWidth={2} />
            <circle cx={24} cy={20} r={6} fill="#06b6d4" className="animate-pulse" />
            <text x={24} y={-8} fill="#38bdf8" fontSize={11} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              TX Tower
            </text>
            <text x={24} y={96} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">
              Transmitter
            </text>
          </g>

          {/* Node Right: Receiver Station (RX) */}
          <g transform={`translate(${rxX - 24}, ${rxY - 32})`}>
            {/* Dish Base */}
            <rect x={20} y={32} width={8} height={48} fill="#334155" />
            <polygon points="12,80 36,80 24,32" fill="none" stroke="#475569" strokeWidth={1.5} />
            {/* Receiver Dish */}
            <circle cx={24} cy={20} r={18} fill="#0f172a" stroke="#10b981" strokeWidth={2} />
            {/* Reception Glow when wavefronts arrive */}
            {(isLosArrived || isRefArrived || isDiffArrived) && (
              <circle cx={24} cy={20} r={28} fill="none" stroke="#34d399" strokeWidth={2} className="animate-ping" opacity={0.6} />
            )}
            <circle cx={24} cy={20} r={6} fill="#10b981" />
            <text x={24} y={-8} fill="#34d399" fontSize={11} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              RX Station
            </text>
            <text x={24} y={96} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">
              Receiver
            </text>
          </g>

          {/* Arrival Flash Badges at RX */}
          {isLosArrived && (
            <text x={rxX} y={rxY - 38} fill="#22d3ee" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              LOS Arrived (t₀)
            </text>
          )}
          {isRefArrived && (
            <text x={rxX} y={rxY - 52} fill="#fbbf24" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              Reflected (+0.40s)
            </text>
          )}
          {isDiffArrived && (
            <text x={rxX} y={rxY - 66} fill="#c084fc" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              Diffracted (+0.72s)
            </text>
          )}
        </svg>

        {/* Legend overlays */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>(a) Direct LOS Path (Shortest, t₀)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>(b) Reflected Path (Bounced, t₁)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span>(c) Diffracted Path (Bent, t₂)</span>
          </div>
        </div>
      </div>

      {/* 3. Impulse Response & Delay Spread Timeline Strip */}
      <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span className="text-white font-bold uppercase tracking-wider text-[11px]">
              Receiver Channel Impulse Response h(t) & Delay Spread (Δτ)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Multipath Smearing: Δτ = 0.72s Delay Spread
          </span>
        </div>

        {/* 3 Arrival Spikes across Timeline */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          {/* Spike 1 */}
          <div className={`p-2 rounded-lg border transition-all ${
            isLosArrived
              ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-sm'
              : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60'
          }`}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-cyan-400">Ray 1: Direct LOS</span>
              <span className="tabular-nums">t = 1.00s</span>
            </div>
            <div className="h-2 bg-cyan-500 rounded mt-1.5" style={{ width: `${signalStrengthPct * 100}%` }} />
            <span className="text-[9px] text-slate-400 block mt-1">Strongest signal power</span>
          </div>

          {/* Spike 2 */}
          <div className={`p-2 rounded-lg border transition-all ${
            isRefArrived
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-sm'
              : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60'
          }`}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-amber-400">Ray 2: Reflected</span>
              <span className="tabular-nums">+0.40s delay</span>
            </div>
            <div className="h-2 bg-amber-500 rounded mt-1.5" style={{ width: `${signalStrengthPct * 65}%` }} />
            <span className="text-[9px] text-slate-400 block mt-1">Wall absorption & phase shift</span>
          </div>

          {/* Spike 3 */}
          <div className={`p-2 rounded-lg border transition-all ${
            isDiffArrived
              ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 shadow-sm'
              : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60'
          }`}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-purple-400">Ray 3: Diffracted</span>
              <span className="tabular-nums">+0.72s delay</span>
            </div>
            <div className="h-2 bg-purple-500 rounded mt-1.5" style={{ width: `${signalStrengthPct * 45}%` }} />
            <span className="text-[9px] text-slate-400 block mt-1">Edge shadow loss</span>
          </div>
        </div>
      </div>
    </div>
  );
};
