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
  FileText,
  Sparkles,
  Radio,
  Binary,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { OSI_LAYERS } from './fundamentals/OsiModelView';
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
    selectedOsiLayer,
    multipathFreq,
    simulateBitError,
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
  const activeOsiLayerInfo = selectedOsiLayer ? OSI_LAYERS.find(l => l.layerNumber === selectedOsiLayer) : null;

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

        {/* Topic-Aware Live Telemetry & Concept Cards */}
        {selectedTopic.id === 'osi-model-basics' ? (
          /* 1. OSI Model Basics Overview */
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                <Layers className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>OSI Reference Layer</span>
              </span>
              {activeOsiLayerInfo ? (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40">
                  Layer {activeOsiLayerInfo.layerNumber} Selected
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  Click Stack to Inspect
                </span>
              )}
            </div>

            {activeOsiLayerInfo ? (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {activeOsiLayerInfo.name} Layer (Layer {activeOsiLayerInfo.layerNumber})
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      PDU: {activeOsiLayerInfo.pdu}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeOsiLayerInfo.summary}
                  </p>
                </div>

                {activeOsiLayerInfo.ch11Callout && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-mono leading-snug space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Ch.11 protocols here:</span>
                    </div>
                    <p className="pl-5 text-[10.5px]">
                      {activeOsiLayerInfo.ch11Callout}
                    </p>
                  </div>
                )}

                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block mb-1">
                    Protocols & Standards:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeOsiLayerInfo.examples.map((ex, i) => (
                      <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center rounded-lg bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                <Layers className="h-6 w-6 text-slate-400 mx-auto opacity-60" />
                <p className="text-[11px] leading-snug">
                  Click any layer in the 7-layer stack on the canvas to inspect its PDU, functions, and where DECT (§11.1) and 802.16 (§11.3) protocols operate.
                </p>
              </div>
            )}
          </div>
        ) : selectedTopic.id === 'pcm-voice-digitization' ? (
          /* 2. PCM Voice Digitization Overview */
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                <Radio className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>PCM Voice Digitization (DS0)</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                Standard 64 kbps
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-mono">Sampling Rate</span>
                <span className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400 block mt-0.5">
                  8,000 / sec
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Nyquist: 2 × 4 kHz</span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-mono">Quantization</span>
                <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 block mt-0.5">
                  8 bits / sample
                </span>
                <span className="text-[9px] text-slate-400 font-mono">256 discrete levels</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block font-semibold">
                Resulting Standard Bit Rate:
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  64 kbps
                </span>
                <span className="text-xs font-mono text-slate-500">
                  (8,000 samples/s × 8 bits/sample)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-200 dark:border-slate-800">
                Standard uncompressed voice channel (DS0 standard).
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-mono leading-snug">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 mb-0.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Chapter 11 Connection:</span>
              </div>
              <span>
                In Section 11.1 (Phase 4), ADPCM compresses this exact same 64 kbps stream by 50% down to <strong>32 kbps</strong> with toll voice quality.
              </span>
            </div>
          </div>
        ) : selectedTopic.id === 'multipath-free-space-loss' ? (
          /* 3. Multipath & Free-Space Loss Overview */
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Multipath & Free-Space Loss</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 font-mono font-bold">
                {multipathFreq ? `${multipathFreq.toFixed(1)} GHz` : '10.0 GHz'}
              </span>
            </div>

            {/* Propagation Mechanisms */}
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>1. Reflection</span>
                </div>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                  Electromagnetic waves bounce off smooth obstacles much larger than wavelength (buildings, earth, walls).
                </p>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span>2. Diffraction</span>
                </div>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                  Waves bend around sharp edges into shadow zones (Huygens-Fresnel wavelets; dictates 0.6 R₁ Fresnel clearance).
                </p>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>3. Scattering</span>
                </div>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                  Waves disperse into multiple directions when impinging on objects comparable to or smaller than wavelength (foliage, rain).
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-mono leading-snug">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 mb-0.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Chapter 11 Connection:</span>
              </div>
              <span>
                This is the propagation physics behind Section 11.2's Fresnel zone clearance, rain attenuation, and millimeter-wave absorption (Phase 5).
              </span>
            </div>
          </div>
        ) : selectedTopic.id === 'crc-arq-error-control' ? (
          /* 4. CRC & ARQ Error Control Overview */
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>CRC & ARQ Error Control</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                simulateBitError
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                {simulateBitError ? 'Bit Error ON' : 'Channel Clean'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-cyan-600 dark:text-cyan-400 text-[11px] block">
                  1. CRC (Cyclic Redundancy Check)
                </span>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                  Error detection mechanism using modulo-2 binary polynomial division. Transmitters append a Frame Check Sequence (FCS); receivers recalculate remainder. Non-zero flags corrupted bits.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] block">
                  2. ARQ (Automatic Repeat Request)
                </span>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                  Retransmission protocol where receivers return positive ACKs for valid frames and negative NACKs (or timeout) for corrupted frames, prompting immediate retransmission.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-mono leading-snug">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 mb-0.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Chapter 11 Connection:</span>
              </div>
              <span>
                IEEE 802.16's MAC frame header explicitly includes an 8-bit Header Check Sequence (HCS) and an ARQ indicator bit with sequence numbering (Phase 6).
              </span>
            </div>
          </div>
        ) : (
          /* Default Multiple Access / General Simulation Metrics */
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
        )}

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
