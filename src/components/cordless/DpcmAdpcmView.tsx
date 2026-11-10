import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MathFormula } from '../common/MathFormula';
import { 
  Activity, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  StepForward, 
  Info, 
  CheckCircle2, 
  Zap,
  Sliders
} from 'lucide-react';

export const DpcmAdpcmView: React.FC = () => {
  const { simTime, simPlaying, simSpeed } = useApp();
  const [pipelineStage, setPipelineStage] = useState<number>(0); // 0 = Waveform Redundancy, 1 = DPCM Loop, 2 = ADPCM G.726
  const [isManualStage, setIsManualStage] = useState<boolean>(false);
  const [infoPopup, setInfoPopup] = useState<string | null>(null);

  // PACING REFINEMENT (Phase 4.1):
  // 1. Stage duration: 8.0s per stage (24.0s total cycle) so user can comfortably read each pipeline stage.
  // 2. Numerical sample hold: hold sample k for 2.8s so user can read and verify calculations before it advances.
  // 3. ADPCM adaptation pulse: slow down to 1.25 rad/s (2.5s alternation) instead of rapid flashing.
  const STAGE_DURATION = 8.0; // seconds per stage
  const SAMPLE_PERIOD = 2.8;  // seconds to hold each numerical sample calculation

  // Sync pipeline stage with simulation timer if auto-playing
  useEffect(() => {
    if (!simPlaying || isManualStage) return;
    const stage = Math.min(2, Math.floor((simTime % (STAGE_DURATION * 3)) / STAGE_DURATION));
    setPipelineStage(stage);
  }, [simTime, simPlaying, isManualStage]);

  // Sample index k held for 2.8s so math is clearly readable
  const k = Math.floor(simTime / SAMPLE_PERIOD);
  const sampleAngle = k * 0.95;
  
  // Simulated voice sample m(k): continuous wave
  const mk = Number((1.5 * Math.sin(sampleAngle) + 0.5 * Math.sin(sampleAngle * 2.3)).toFixed(2));
  // Predicted sample m_hat_q(k) from linear predictor
  const mHatK = Number((mk - 0.08 * Math.cos(sampleAngle)).toFixed(2));
  // Difference d(k) = m(k) - m_hat_q(k)
  const dk = Number((mk - mHatK).toFixed(2));
  // Quantized difference dq(k) = d(k) + e(k) (4-bit discrete level)
  const eq = 0.01;
  const dqk = Number((dk + (dk >= 0 ? eq : -eq)).toFixed(2));
  // Reconstructed sample mq(k) = m_hat_q(k) + dq(k)
  const mqk = Number((mHatK + dqk).toFixed(2));

  // Pulse animation for ADPCM coefficient updates (calm 2.5s alternation)
  const pulseFactor = Math.sin(simTime * 1.25);

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Pipeline Stage Nav Header */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Speech Compression Evolution (§11.1 / App 11A)
            </span>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsManualStage(true);
                setPipelineStage(prev => (prev + 1) % 3);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-mono text-xs font-bold hover:bg-cyan-400 transition-all shadow-xs"
            >
              <StepForward className="h-3 w-3" />
              <span>Step Stage</span>
            </button>
            <button
              onClick={() => {
                setIsManualStage(false);
                setPipelineStage(0);
              }}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 text-xs"
              title="Reset to Stage 1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Pipeline Stages Tab Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => { setIsManualStage(true); setPipelineStage(0); }}
            className={`p-2 rounded-xl text-left border transition-all ${
              pipelineStage === 0
                ? 'bg-cyan-500 text-slate-950 border-cyan-600 font-bold shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] font-mono opacity-80">Stage 1</div>
            <div className="text-xs font-mono font-bold truncate">Waveform Redundancy</div>
            <div className="text-[8.5px] opacity-75 truncate">Adjacent sample correlation</div>
          </button>

          <button
            onClick={() => { setIsManualStage(true); setPipelineStage(1); }}
            className={`p-2 rounded-xl text-left border transition-all ${
              pipelineStage === 1
                ? 'bg-cyan-500 text-slate-950 border-cyan-600 font-bold shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] font-mono opacity-80">Stage 2</div>
            <div className="text-xs font-mono font-bold truncate">DPCM Feedback Loop</div>
            <div className="text-[8.5px] opacity-75 truncate">Live numerical predictor loop</div>
          </button>

          <button
            onClick={() => { setIsManualStage(true); setPipelineStage(2); }}
            className={`p-2 rounded-xl text-left border transition-all ${
              pipelineStage === 2
                ? 'bg-cyan-500 text-slate-950 border-cyan-600 font-bold shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] font-mono opacity-80">Stage 3</div>
            <div className="text-xs font-mono font-bold truncate">ADPCM 32 kbps (G.726)</div>
            <div className="text-[8.5px] opacity-75 truncate">Adaptive quantizer + predictor</div>
          </button>
        </div>
      </div>

      {/* 2. Interactive Stage Canvas */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3 min-h-[340px]">
        
        {/* ============================================================== */}
        {/* STAGE 1: SPEECH WAVEFORM REDUNDANCY                           */}
        {/* ============================================================== */}
        {pipelineStage === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-500" />
                <span>Stage 1: Speech Redundancy & Differential Quantization</span>
              </span>
              <button 
                onClick={() => setInfoPopup(infoPopup === 's1' ? null : 's1')}
                className="text-slate-400 hover:text-cyan-500 text-xs"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* SVG Waveform with Sample Points & Connecting Redundancy Brackets */}
            <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 relative flex flex-col items-center">
              <svg className="w-full h-44 sm:h-52 overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                {/* Horizontal Zero-Volt Centerline */}
                <line x1="0" y1="100" x2="700" y2="100" stroke="currentColor" className="text-slate-300 dark:text-slate-800" strokeDasharray="4 4" />

                {/* Continuous Analog Voice Waveform */}
                <path
                  d="M 20 100 Q 80 20, 160 45 T 300 130 T 440 60 T 580 140 T 680 100"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                />

                {/* Discrete 8 kHz PCM Samples (Stallings Figure 11.3) */}
                {[
                  { x: 60, y: 55, val: '1.42 V' },
                  { x: 100, y: 38, val: '1.48 V' },
                  { x: 140, y: 44, val: '1.45 V' },
                  { x: 180, y: 70, val: '1.20 V' },
                  { x: 220, y: 105, val: '0.88 V' },
                  { x: 260, y: 125, val: '0.62 V' },
                  { x: 300, y: 130, val: '0.60 V' },
                  { x: 340, y: 110, val: '0.80 V' },
                  { x: 380, y: 80, val: '1.15 V' },
                  { x: 420, y: 62, val: '1.38 V' },
                  { x: 460, y: 75, val: '1.25 V' },
                  { x: 500, y: 105, val: '0.90 V' },
                  { x: 540, y: 132, val: '0.64 V' },
                  { x: 580, y: 140, val: '0.58 V' },
                  { x: 620, y: 125, val: '0.72 V' },
                ].map((pt, idx) => (
                  <g key={idx}>
                    {/* Sample Stem */}
                    <line x1={pt.x} y1="100" x2={pt.x} y2={pt.y} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                    {/* Sample Point */}
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                    
                    {/* Redundancy Connecting Bracket between Sample 1 & 2 */}
                    {idx === 1 && (
                      <g>
                        <path d="M 60 25 L 60 20 L 100 20 L 100 25" fill="none" stroke="#f59e0b" strokeWidth="2" />
                        <text x="80" y="15" textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          Δm = +0.06 V (Small difference!)
                        </text>
                      </g>
                    )}

                    {/* Redundancy Connecting Bracket between Sample 6 & 7 */}
                    {idx === 6 && (
                      <g>
                        <path d="M 260 148 L 260 153 L 300 153 L 300 148" fill="none" stroke="#10b981" strokeWidth="2" />
                        <text x="280" y="165" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          Δm = -0.02 V (Redundant!)
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </svg>

              <div className="flex flex-wrap items-center justify-between w-full px-2 text-[10px] font-mono text-slate-500 mt-1">
                <span>Nyquist Sampling: Ts = 125 µs (8,000 samples/sec)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Adjacent sample correlation &gt; 85%</span>
              </div>
            </div>

            {/* Explanation & Math */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Why Standard PCM Wastes Bits:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  Standard 64 kbps PCM (§6.4) quantizes full absolute amplitudes with 8 bits (256 levels). But speech changes slowly—adjacent samples are almost identical. Transmitting only the sample difference <MathFormula tex={`d(k) = m(k) - m(k-1)`} displayMode={false} /> requires significantly fewer bits!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-500 mb-1">Differential Quantization Formula:</div>
                <MathFormula tex={`d(k) = m(k) - m(k-1)`} />
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                  Reduces Dynamic Range by ~50%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STAGE 2: DPCM ENCODER / DECODER BLOCK DIAGRAM                 */}
        {/* ============================================================== */}
        {pipelineStage === 1 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-500" />
                <span>Stage 2: DPCM Feedback Loop & Linear Predictor (Stallings Fig 11.4)</span>
              </span>
              <button 
                onClick={() => setInfoPopup(infoPopup === 's2' ? null : 's2')}
                className="text-slate-400 hover:text-cyan-500 text-xs"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Interactive DPCM Block Diagram */}
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
              <div className="text-[10px] font-mono font-bold text-slate-500 flex items-center justify-between">
                <span>DPCM Transmitter Loop (Live Numerical Feed):</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Sample #{k}</span>
              </div>

              {/* Block Diagram Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-center font-mono">
                {/* 1. Input Sample m(k) */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center">
                  <span className="text-[9px] text-slate-400">Input Sample</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">m(k)</span>
                  <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 mt-1">{mk} V</span>
                </div>

                {/* 2. Subtractor: d(k) = m(k) - m_hat_q(k) */}
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-400 shadow-xs flex flex-col items-center">
                  <span className="text-[9px] text-cyan-700 dark:text-cyan-300">Difference d(k)</span>
                  <span className="text-xs font-bold text-cyan-900 dark:text-cyan-200">m(k) - m̂q(k)</span>
                  <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 mt-1">{dk > 0 ? `+${dk}` : dk} V</span>
                </div>

                {/* 3. Quantizer: dq(k) */}
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-400 shadow-xs flex flex-col items-center">
                  <span className="text-[9px] text-purple-700 dark:text-purple-300">Quantizer dq(k)</span>
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200">d(k) + e(k)</span>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 mt-1">{dqk > 0 ? `+${dqk}` : dqk} V</span>
                </div>

                {/* 4. Predictor Loop Feedback */}
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 shadow-xs flex flex-col items-center">
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-300">Predictor m̂q(k)</span>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Linear Estimate</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">{mHatK} V</span>
                </div>
              </div>

              {/* Feedback Loop Path Visualization */}
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[10px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                  <span>Feedback Equation:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  mq(k) = m̂q(k) + dq(k) = {mHatK} + {dqk} = {mqk} V
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline">
                  Matches Receiver!
                </span>
              </div>
            </div>

            {/* KaTeX Proof Formulas (from Stallings text page 325) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] font-mono text-slate-400 mb-0.5">1. Transmitted Difference:</div>
                <MathFormula tex={`d(k) = m(k) - \\hat{m}_q(k)`} />
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] font-mono text-slate-400 mb-0.5">2. Quantized Difference:</div>
                <MathFormula tex={`d_q(k) = d(k) + e(k)`} />
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] font-mono text-slate-400 mb-0.5">3. Predictor Input:</div>
                <MathFormula tex={`m_q(k) = m(k) + q(k)`} />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STAGE 3: ADPCM ITU-T G.726 32 KBPS (EQUATION 11.2)           */}
        {/* ============================================================== */}
        {pipelineStage === 2 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Stage 3: Adaptive DPCM (ITU-T G.726 / DECT 32 kbps Standard)</span>
              </span>
              <button 
                onClick={() => setInfoPopup(infoPopup === 's3' ? null : 's3')}
                className="text-slate-400 hover:text-cyan-500 text-xs"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* ADPCM Compression Pipeline Visual */}
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* 64 kbps PCM Stream Input */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-mono text-xs font-bold border border-cyan-400">
                    64 kbps PCM Input
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">8 bits / 125 µs</span>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-400 hidden sm:block" />

                {/* 32 kbps Compressed ADPCM Output */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-black shadow-md border border-emerald-300">
                    32 kbps ADPCM Output
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">4 bits / 125 µs (50% Saved!)</span>
                </div>
              </div>

              {/* Adaptive Blocks with Pulsing Adaptation Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {/* Adaptive Quantizer Box */}
                <div className={`p-3 rounded-xl border transition-all ${
                  pulseFactor > 0
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                    <span className="text-amber-600 dark:text-amber-400">Adaptive Quantizer</span>
                    <span className="text-[10px] text-slate-400">Scale factor y(k)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Dynamically scales step size based on short-term and long-term energy: 4 bits output (1 sign bit + 3 magnitude bits).
                  </p>
                </div>

                {/* Adaptive Predictor Box */}
                <div className={`p-3 rounded-xl border transition-all ${
                  pulseFactor <= 0
                    ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-500 ring-2 ring-purple-400/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                    <span className="text-purple-600 dark:text-purple-400">Adaptive Predictor</span>
                    <span className="text-[10px] text-slate-400">2nd + 6th Order Filter</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Updates coefficients A and B to adapt to both difference samples and signal estimates.
                  </p>
                </div>
              </div>
            </div>

            {/* ADPCM Stallings Equation 11.2 in KaTeX */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center flex flex-col gap-1.5 shadow-inner">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                ITU-T G.726 Adaptive Predictor Filter (Stallings Equation 11.2):
              </span>
              <div className="overflow-x-auto">
                <MathFormula 
                  tex={`\\hat{s}_e(k) = \\sum_{i=1}^2 A_i(k-i) s_e(k-i) + \\sum_{i=1}^6 B_i(k-i) d_q(k-i)`} 
                />
              </div>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                Combination of 2nd-order recursive (all-pole) + 6th-order non-recursive (all-zero) filter
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info Popup / Explanation Drawer */}
      {infoPopup && (
        <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400 mt-0.5" />
          <div className="leading-relaxed">
            {infoPopup === 's1' && (
              <span><strong>Sample Redundancy:</strong> Because human vocal cords generate band-limited resonant formants, consecutive 125 µs samples differ by less than 10-15% of peak amplitude. Standard PCM repeats high-order bits unnecessarily; differential quantization focuses exclusively on the rapid changes.</span>
            )}
            {infoPopup === 's2' && (
              <span><strong>DPCM Feedback Loop:</strong> If the transmitter simply took differences of true analog samples, cumulative quantization errors at the receiver would cause the reconstructed waveform to drift endlessly. Replicating the receiver's feedback loop at the encoder ensures both sides share the exact same reference sequence.</span>
            )}
            {infoPopup === 's3' && (
              <span><strong>ADPCM (ITU-T G.726):</strong> Used in DECT (§11.1), ADPCM halves the bitrate from 64 kbps to 32 kbps. It adapts the quantization step size with scale factor y(k) to avoid slope overload during speech bursts, while the 8-tap linear filter predicts pitch and formant resonance.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
