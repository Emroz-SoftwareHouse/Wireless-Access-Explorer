import React, { useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Binary, 
  Activity, 
  Clock, 
  Zap, 
  AudioWaveform, 
  CheckCircle2, 
  Cpu
} from 'lucide-react';

interface SamplePoint {
  index: number;
  tVal: number;
  xPct: number; // 0 to 100%
  analogVal: number; // -1 to +1
  quantizedLevel: number; // 0 to 255 (8-bit)
  binaryString: string; // 8 bits e.g. "11010010"
}

// 10 representative speech sample points across a 125µs-per-sample window
const SAMPLE_COUNT = 10;

function computeSample(index: number): SamplePoint {
  const tVal = index;
  // Composite audio voice wave function
  const rawWave = 0.58 * Math.sin(0.85 * tVal + 0.4) + 0.28 * Math.sin(1.8 * tVal + 1.2) + 0.14 * Math.cos(3.1 * tVal);
  const analogVal = Math.max(-0.95, Math.min(0.95, rawWave));
  // 8-bit uniform quantization: map [-1, 1] -> [0, 255]
  const quantizedLevel = Math.round(((analogVal + 1) / 2) * 255);
  const binaryString = quantizedLevel.toString(2).padStart(8, '0');
  const xPct = 8 + (index / (SAMPLE_COUNT - 1)) * 84;
  return {
    index,
    tVal,
    xPct,
    analogVal,
    quantizedLevel,
    binaryString,
  };
}

const ALL_SAMPLES: SamplePoint[] = Array.from({ length: SAMPLE_COUNT }, (_, i) => computeSample(i));

export const PcmVoiceView: React.FC = () => {
  const { simTime, simPlaying, simSpeed } = useApp();

  // Timing: 1.2 seconds per sample at 1x speed
  const secondsPerSample = 1.2;
  const totalDuration = SAMPLE_COUNT * secondsPerSample;
  
  // Current sample cycle index (0 to SAMPLE_COUNT - 1)
  const currentSampleIdx = Math.min(
    SAMPLE_COUNT - 1,
    Math.max(0, Math.floor(simTime / secondsPerSample))
  );

  const subSampleProgress = (simTime % secondsPerSample) / secondsPerSample;
  
  // Phase inside the sample:
  // Phase a (0 to 0.35): Dropping tick from waveform
  // Phase b (0.35 to 0.70): Snapping to quantization level
  // Phase c (0.70 to 1.0): Appending bits to growing stream
  const hasTakenSample = subSampleProgress >= 0.15 || currentSampleIdx > 0;
  const isSnapping = subSampleProgress >= 0.35;
  const hasAppendedBits = subSampleProgress >= 0.65 || currentSampleIdx > 0;

  // Active sample details
  const activeSample = ALL_SAMPLES[currentSampleIdx] || ALL_SAMPLES[0];

  // Growing binary string of all samples processed so far
  const completedSamples = useMemo(() => {
    const list: SamplePoint[] = [];
    for (let i = 0; i < currentSampleIdx; i++) {
      list.push(ALL_SAMPLES[i]);
    }
    if (hasAppendedBits) {
      list.push(activeSample);
    }
    return list;
  }, [currentSampleIdx, hasAppendedBits, activeSample]);

  // Track dispatched events
  const lastDispatchedRef = useRef<number>(-1);
  useEffect(() => {
    if (simTime === 0) {
      lastDispatchedRef.current = -1;
      return;
    }
    if (hasAppendedBits && lastDispatchedRef.current !== currentSampleIdx) {
      lastDispatchedRef.current = currentSampleIdx;
      const s = ALL_SAMPLES[currentSampleIdx];
      const newEvt = {
        no: currentSampleIdx + 1,
        timeFormatted: `${simTime.toFixed(2)}s`,
        timestamp: simTime,
        source: 'Analog Speech Transducer',
        destination: 'PCM Quantizer (DS0)',
        type: 'SAMPLE' as const,
        info: `Sample #${s.index + 1}: V = ${s.analogVal >= 0 ? '+' : ''}${s.analogVal.toFixed(2)}V → Q-Level ${s.quantizedLevel} (8b: ${s.binaryString})`,
        sizeValue: '8 bits',
      };
      window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', { detail: newEvt }));
    }
  }, [currentSampleIdx, hasAppendedBits, simTime]);

  // Continuous waveform SVG path coordinates (width 800, height 260)
  const svgWidth = 800;
  const svgHeight = 260;
  const zeroY = svgHeight / 2;
  const ampScale = 100;

  const wavePathD = useMemo(() => {
    const points: string[] = [];
    const steps = 180;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * (SAMPLE_COUNT - 1);
      const val = 0.58 * Math.sin(0.85 * t + 0.4) + 0.28 * Math.sin(1.8 * t + 1.2) + 0.14 * Math.cos(3.1 * t);
      const x = 64 + (i / steps) * (svgWidth - 128);
      const y = zeroY - val * ampScale;
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, []);

  // Faint quantization grid horizontal levels
  const quantGridLevels = [
    { label: 'Q255 (+1.0V)', val: 1.0, bin: '11111111' },
    { label: 'Q219 (+0.7V)', val: 0.72, bin: '11011011' },
    { label: 'Q182 (+0.4V)', val: 0.43, bin: '10110110' },
    { label: 'Q128 ( 0.0V)', val: 0.0, bin: '10000000' },
    { label: 'Q73  (-0.4V)', val: -0.43, bin: '01001001' },
    { label: 'Q36  (-0.7V)', val: -0.72, bin: '00100100' },
    { label: 'Q0   (-1.0V)', val: -1.0, bin: '00000000' },
  ];

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-5 select-none overflow-y-auto no-pan">
      {/* 1. Top Telemetry Strip */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {/* Metric 1: Sampling Rate */}
        <div className="bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Nyquist Sampling Rate</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">8,000</span>
            <span className="text-xs font-mono text-slate-500">samples/sec</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Ts = 125 µs period</span>
        </div>

        {/* Metric 2: Quantization Resolution */}
        <div className="bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Quantization Levels</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold font-mono text-purple-600 dark:text-purple-400">256</span>
            <span className="text-xs font-mono text-slate-500">levels (8 bits)</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">SNR ≈ 6.02n + 1.76 dB</span>
        </div>

        {/* Metric 3: Output DS0 Bitrate */}
        <div className="bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Resulting Standard Bitrate</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">64</span>
            <span className="text-xs font-mono text-slate-500">kbps (DS0)</span>
          </div>
          <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 block mt-0.5 font-semibold">
            ADPCM compresses to 32k
          </span>
        </div>

        {/* Metric 4: Active Sample State */}
        <div className="bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Current Sample Playhead</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
              #{activeSample.index + 1}
            </span>
            <span className="text-xs font-mono text-slate-500">of {SAMPLE_COUNT}</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 truncate block mt-0.5 font-bold">
            Q = {activeSample.quantizedLevel} ({activeSample.binaryString})
          </span>
        </div>
      </div>

      {/* 2. Main Waveform & Quantization Grid SVG Canvas */}
      <div className="w-full flex-1 min-h-[220px] sm:min-h-[260px] bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-center shadow-inner">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-[300px]"
          preserveAspectRatio="none"
        >
          {/* Faint Horizontal Quantization Grid Lines */}
          {quantGridLevels.map((lvl, idx) => {
            const y = zeroY - lvl.val * ampScale;
            return (
              <g key={`q-lvl-${idx}`}>
                <line
                  x1={50}
                  y1={y}
                  x2={svgWidth - 20}
                  y2={y}
                  stroke={lvl.val === 0 ? '#475569' : '#1e293b'}
                  strokeDasharray={lvl.val === 0 ? '4 2' : '2 4'}
                  strokeWidth={lvl.val === 0 ? 1.5 : 1}
                />
                <text
                  x={12}
                  y={y + 3.5}
                  fill="#64748b"
                  fontSize={8.5}
                  fontFamily="monospace"
                >
                  {lvl.label}
                </text>
              </g>
            );
          })}

          {/* Time Axis (Center Zero-Voltage Line) */}
          <line
            x1={50}
            y1={zeroY}
            x2={svgWidth - 20}
            y2={zeroY}
            stroke="#334155"
            strokeWidth={1}
          />

          {/* Smooth Continuous Analog Voice Waveform */}
          <path
            d={wavePathD}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={3}
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"
          />

          {/* Vertical Discrete Sample Lines & Snapped Quantized Dots */}
          {ALL_SAMPLES.map((sample, idx) => {
            const x = 64 + (idx / (SAMPLE_COUNT - 1)) * (svgWidth - 128);
            const analogY = zeroY - sample.analogVal * ampScale;
            // Snapped quantized Y position
            const quantizedNormalized = (sample.quantizedLevel / 255) * 2 - 1;
            const snappedY = zeroY - quantizedNormalized * ampScale;

            const isPast = idx < currentSampleIdx;
            const isCurrent = idx === currentSampleIdx;

            return (
              <g key={`sample-group-${idx}`}>
                {/* Vertical sampling timeline tick dropped to center line */}
                {(isPast || (isCurrent && hasTakenSample)) && (
                  <>
                    {/* Vertical dropped tick */}
                    <line
                      x1={x}
                      y1={analogY}
                      x2={x}
                      y2={zeroY}
                      stroke={isCurrent ? '#38bdf8' : '#334155'}
                      strokeDasharray="3 3"
                      strokeWidth={isCurrent ? 2 : 1}
                    />

                    {/* Timeline base notch */}
                    <circle
                      cx={x}
                      cy={zeroY}
                      r={3}
                      fill={isCurrent ? '#38bdf8' : '#475569'}
                    />

                    {/* Snapping connector tick to nearest quantization line */}
                    {(isPast || (isCurrent && isSnapping)) && (
                      <line
                        x1={x}
                        y1={analogY}
                        x2={x}
                        y2={snappedY}
                        stroke="#a855f7"
                        strokeWidth={2}
                      />
                    )}

                    {/* Analog Sample Point on Waveform */}
                    <circle
                      cx={x}
                      cy={analogY}
                      r={isCurrent ? 5 : 3.5}
                      fill={isCurrent ? '#0ea5e9' : '#0284c7'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className={isCurrent ? 'animate-pulse' : ''}
                    />

                    {/* Snapped Quantized Level Dot */}
                    {(isPast || (isCurrent && isSnapping)) && (
                      <circle
                        cx={x}
                        cy={snappedY}
                        r={isCurrent ? 5.5 : 4}
                        fill="#c084fc"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        className="filter drop-shadow-[0_0_6px_#c084fc]"
                      />
                    )}

                    {/* Sample label underneath */}
                    <text
                      x={x}
                      y={zeroY + 16}
                      fill={isCurrent ? '#38bdf8' : '#64748b'}
                      fontSize={9}
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight={isCurrent ? 'bold' : 'normal'}
                    >
                      t{idx}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Active Animated Sampling Marker Cursor */}
          {(() => {
            const currentX = 64 + (currentSampleIdx / (SAMPLE_COUNT - 1)) * (svgWidth - 128);
            const analogY = zeroY - activeSample.analogVal * ampScale;
            return (
              <g>
                <line
                  x1={currentX}
                  y1={15}
                  x2={currentX}
                  y2={svgHeight - 15}
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  className="opacity-70 animate-pulse"
                />
                <circle
                  cx={currentX}
                  cy={analogY}
                  r={8}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  className="animate-ping"
                />
              </g>
            );
          })()}
        </svg>

        {/* Legend overlays inside canvas */}
        <div className="absolute top-2 right-3 flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span>Analog Signal V(t)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span>Quantized Level (8b)</span>
          </div>
        </div>
      </div>

      {/* 3. Resulting Growing Binary Bitstream Display */}
      <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-emerald-400" />
            <span className="text-white font-bold uppercase tracking-wider text-[11px]">
              Emitted PCM Digital Bitstream (64 kbps)
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {completedSamples.length * 8} bits encoded · {completedSamples.length} of {SAMPLE_COUNT} samples
          </span>
        </div>

        {/* Binary string byte blocks */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono text-xs scrollbar-none">
          {completedSamples.length === 0 ? (
            <span className="text-slate-500 text-xs italic">
              Press Play or Step to sample speech waveform and generate 8-bit PCM codewords...
            </span>
          ) : (
            completedSamples.map((samp, idx) => {
              const isLatest = idx === completedSamples.length - 1;
              return (
                <div
                  key={`bit-block-${idx}`}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs transition-all ${
                    isLatest
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400 font-bold scale-105'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-[9px] text-slate-500 font-mono">#{samp.index}:</span>
                  <span className="tracking-wider">{samp.binaryString}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
