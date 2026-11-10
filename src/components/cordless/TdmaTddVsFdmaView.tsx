import React, { useState, useMemo } from 'react';
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
  Activity,
  Gauge,
  RotateCcw,
  Footprints,
  ShieldAlert,
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';

export const TdmaTddVsFdmaView: React.FC = () => {
  const { simTime, simPlaying, simSpeed } = useApp();

  // Forward Traffic Load Slider for Scene (b): 50% (Symmetric) to 85% (Asymmetric Downlink)
  const [forwardLoadPct, setForwardLoadPct] = useState<number>(70);
  const [manualOverrideLoad, setManualOverrideLoad] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'both' | 'fade' | 'capacity'>('fade');
  const [showInfo, setShowInfo] = useState<string | null>(null);

  // --- FAST-FADE SIMULATION STATES ---
  // Mode: 'auto' (cycles continuously) or 'manual' (user forces Ant A fade, Ant B fade, or Clear)
  const [fadeMode, setFadeMode] = useState<'auto' | 'fade_a' | 'fade_b' | 'clear'>('auto');
  // FDD Comparison Mode: toggles FDD (dual carrier) comparison to show why reciprocity fails!
  const [compareFdd, setCompareFdd] = useState<boolean>(false);
  // Walking Speed / Doppler shift: 'stationary' | 'walking' | 'running'
  const [mobilitySpeed, setMobilitySpeed] = useState<'walking' | 'jogging' | 'stationary'>('walking');

  // Compute speed multiplier for the Rayleigh fading clock
  const speedMult = mobilitySpeed === 'stationary' ? 0.2 : mobilitySpeed === 'jogging' ? 2.0 : 1.0;
  const effectiveSimTime = simTime * speedMult;

  // 14.0s master cycle for the auto-cycling fast fade
  const fadeCycle = (effectiveSimTime % 14.0);

  // Resolve whether Antenna A and B are fading
  let isFadingAntA = false;
  let isFadingAntB = false;

  if (fadeMode === 'fade_a') {
    isFadingAntA = true;
    isFadingAntB = false;
  } else if (fadeMode === 'fade_b') {
    isFadingAntA = false;
    isFadingAntB = true;
  } else if (fadeMode === 'clear') {
    isFadingAntA = false;
    isFadingAntB = false;
  } else {
    // Auto cycle
    // 0.0s - 3.5s: Baseline (both clear)
    // 3.5s - 10.5s: Fast-fade strikes Antenna A (Rayleigh destructive null)
    // 10.5s - 14.0s: Downlink forward burst via Antenna B
    isFadingAntA = fadeCycle >= 3.5 && fadeCycle < 10.5;
    isFadingAntB = false;
  }

  // Which antenna does the base station select?
  // Selection diversity picks whichever antenna has higher RSSI
  const selectedAntenna = isFadingAntB ? 'A' : (isFadingAntA ? 'B' : 'B');
  const isAntennaBSelected = selectedAntenna === 'B';
  const isTransmittingDownlink = fadeMode === 'auto' ? fadeCycle >= 10.5 : simTime % 4.0 >= 2.0;

  // RSSI values (in dBm)
  const rssiA = isFadingAntA ? -88 : -66;
  const rssiB = isFadingAntB ? -90 : -64;
  const deltaRssi = Math.abs(rssiB - rssiA);

  // Handset received quality under TDD vs FDD:
  // In TDD: Reciprocity holds because f_DL = f_UL = 1.9 GHz -> Handset receives strong signal via Ant B!
  // In FDD: Reciprocity FAILS because f_DL = 2.1 GHz != f_UL = 1.92 GHz -> Handset may hit fade anyway!
  const handsetDownlinkSnr = compareFdd ? 8 : 28; // dB
  const handsetDownlinkStatus = compareFdd 
    ? 'FDD Warning: Reciprocity failed! Forward channel uncorrelated (SNR 8 dB, packet dropped)'
    : 'TDD Success: Channel reciprocity guaranteed high SNR (+28 dB) at handset!';

  // Normalized distance for spatial waveform (0 to 3 wavelengths)
  const spatialPos = (effectiveSimTime * 0.4) % 3.0;

  // Scene (b): Smooth dynamic capacity cycling during Play (4.0s hold on 50% Voice, 4.0s hold on 75% Web)
  const effectiveLoadPct = manualOverrideLoad || !simPlaying
    ? forwardLoadPct
    : (simTime % 8.0 < 4.0 ? 50 : 75);

  const totalSlots = 24;
  const forwardSlots = Math.round((effectiveLoadPct / 100) * totalSlots);
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
              Fast fading: why two antennas help
            </button>
            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                activeTab === 'capacity' ? 'bg-white dark:bg-slate-950 font-bold shadow-xs text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Time slots: voice vs web traffic
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

      {/* Plain-language story shown before the engineering diagram. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className={`rounded-xl border p-3 transition-all ${!isFadingAntA && !isFadingAntB ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400/50' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
          <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-300">1 · Person moves</div>
          <p className="text-[11px] leading-snug text-slate-700 dark:text-slate-300">Direct and reflected radio waves arrive together while the handset user walks.</p>
        </div>
        <div className={`rounded-xl border p-3 transition-all ${isFadingAntA || isFadingAntB ? 'border-rose-400 bg-rose-500/10 ring-1 ring-rose-400/50' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
          <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-300">2 · One path cancels</div>
          <p className="text-[11px] leading-snug text-slate-700 dark:text-slate-300">At one antenna the wave copies oppose each other, so its received signal briefly becomes weak. That is a fast fade.</p>
        </div>
        <div className={`rounded-xl border p-3 transition-all ${isFadingAntA || isFadingAntB ? 'border-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-400/50' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
          <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-300">3 · Stronger antenna wins</div>
          <p className="text-[11px] leading-snug text-slate-700 dark:text-slate-300">The base station compares A and B, selects the stronger one, and sends the reply through that safer path.</p>
        </div>
      </div>

      {/* 2. Side-By-Side Canvas Area */}
      <div className={`grid gap-3 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* ============================================================== */}
        {/* SCENE (a): TDD FAST-FADING HANDLING & ANTENNA RECIPROCITY     */}
        {/* ============================================================== */}
        {(activeTab === 'both' || activeTab === 'fade') && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
            {/* Header & Interactive Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  (a) TDD Fast-Fade & Spatial Diversity
                </span>
              </div>

              {/* TDD vs FDD Toggle */}
              <button
                onClick={() => setCompareFdd(!compareFdd)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  compareFdd
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/50 shadow-xs'
                    : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
                }`}
                title="Toggle FDD mode to see why channel reciprocity fails when uplink and downlink use different frequencies!"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{compareFdd ? 'Mode: FDD (Reciprocity Fails!)' : 'Mode: TDD (Reciprocity Active ✓)'}</span>
              </button>
            </div>

            {/* Interactive Fading Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[10px] font-mono">
              <div className="flex items-center gap-1">
                  <span className="text-slate-500 mr-1 hidden xs:inline">Try it:</span>
                <button
                  onClick={() => setFadeMode('fade_a')}
                  className={`px-2 py-0.5 rounded border transition-all font-bold ${
                    fadeMode === 'fade_a'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  Make Antenna A weak
                </button>
                <button
                  onClick={() => setFadeMode('fade_b')}
                  className={`px-2 py-0.5 rounded border transition-all font-bold ${
                    fadeMode === 'fade_b'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  Make Antenna B weak
                </button>
                <button
                  onClick={() => setFadeMode('clear')}
                  className={`px-2 py-0.5 rounded border transition-all ${
                    fadeMode === 'clear'
                      ? 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  Clear signal
                </button>
                <button
                  onClick={() => setFadeMode('auto')}
                  className={`px-2 py-0.5 rounded border transition-all ${
                    fadeMode === 'auto'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-600 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  Automatic story
                </button>
              </div>

              {/* Mobility speed */}
              <div className="flex items-center gap-1">
                <Footprints className="h-3 w-3 text-slate-400" />
                <button
                  onClick={() => setMobilitySpeed(mobilitySpeed === 'walking' ? 'jogging' : mobilitySpeed === 'jogging' ? 'stationary' : 'walking')}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline capitalize font-bold"
                  title="Change pedestrian Doppler fading speed"
                >
                  {mobilitySpeed} ({mobilitySpeed === 'walking' ? '3 km/h' : mobilitySpeed === 'jogging' ? '8 km/h' : '0 km/h'})
                </button>
              </div>
            </div>

            {/* 1. Physical Multipath Geometry & Wavefront Canvas */}
            <div className="relative p-3 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-2 min-h-[220px]">
              
              {/* Top: Building / Concrete Reflector (Multipath source) */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner text-[9px] font-mono text-slate-700 dark:text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold">Concrete Reflector / Wall</span>
                  <span className="text-[8px] text-slate-500">(Reflected Ray Path Length L2)</span>
                </div>
              </div>

              {/* Handset vs Base Station Diagram with Real Multipath Rays */}
              <div className="flex items-center justify-between px-1 sm:px-3 pt-1">
                {/* Handset (Single Antenna, Inexpensive, Pedestrian User) */}
                <div className="flex flex-col items-center z-10">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 flex flex-col items-center justify-center shadow-md ring-2 ring-emerald-500/30">
                    <Radio className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[8px] font-mono font-bold mt-0.5">MS</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold mt-1 text-slate-800 dark:text-slate-200">Cordless Handset</span>
                  <span className="text-[8px] font-mono text-slate-500">Single Antenna (Low Cost)</span>
                </div>

                {/* Center: Over-The-Air Multipath Propagation Chamber */}
                <div className="flex-1 mx-2 sm:mx-4 flex flex-col items-center relative">
                  
                  {/* Multipath Ray to Antenna A (Direct Ray + Reflected Ray) */}
                  <div className="w-full flex flex-col gap-1 my-1">
                    <div className="flex items-center justify-between text-[8px] font-mono">
                      <span className="text-slate-500">Ant A Path:</span>
                      <span className={isFadingAntA ? 'text-rose-500 font-bold' : 'text-cyan-600 dark:text-cyan-400'}>
                        {isFadingAntA ? 'Δθ = 180° (Destructive Null!)' : 'Δθ = 0° (In-Phase)'}
                      </span>
                    </div>
                    {/* Visual Ray Line A */}
                    <div className={`w-full h-2 rounded-full transition-all duration-300 relative overflow-hidden flex items-center ${
                      isFadingAntA
                        ? 'bg-rose-500/20 border border-rose-500 ring-1 ring-rose-400/50'
                        : 'bg-cyan-500/30'
                    }`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFadingAntA ? 'w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'w-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
                        }`} 
                      />
                      {isFadingAntA && (
                        <span className="absolute left-1/2 transform -translate-x-1/2 text-[7.5px] font-mono font-black text-rose-600 dark:text-rose-300 whitespace-nowrap">
                          RAYLEIGH FADE NULL (-24 dB)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multipath Ray to Antenna B (Spaced >= lambda away) */}
                  <div className="w-full flex flex-col gap-1 my-1">
                    <div className="flex items-center justify-between text-[8px] font-mono">
                      <span className="text-slate-500">Ant B Path (Spaced d &ge; λ):</span>
                      <span className={isFadingAntB ? 'text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                        {isFadingAntB ? 'Δθ = 180° (Fade Null)' : 'Δθ ≈ 0° (Constructive Peak!)'}
                      </span>
                    </div>
                    {/* Visual Ray Line B */}
                    <div className={`w-full h-2 rounded-full transition-all duration-300 relative overflow-hidden flex items-center ${
                      isAntennaBSelected
                        ? 'bg-emerald-500/30 border border-emerald-500 ring-2 ring-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFadingAntB ? 'w-2 bg-rose-500' : 'w-full bg-emerald-500 shadow-[0_0_10px_#10b981]'
                        }`} 
                      />
                      {isAntennaBSelected && (
                        <span className="absolute left-1/2 transform -translate-x-1/2 text-[7.5px] font-mono font-black text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                          CONSTRUCTIVE PEAK (-6 dB) ✓
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[8.5px] font-mono text-slate-400 mt-1">
                    {isTransmittingDownlink 
                      ? 'Forward Burst Transmitting back via Selected Antenna (Reciprocity)' 
                      : 'Reverse Uplink Probe Measured at Dual Base Station Antennas'}
                  </span>
                </div>

                {/* Base Station (2 Spatial Diversity Antennas Spaced >= lambda apart) */}
                <div className="flex flex-col items-center z-10">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-500 flex flex-col items-center gap-1.5 shadow-md">
                    {/* Dual Diversity Antenna Visual */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Antenna A */}
                      <div className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                        isFadingAntA
                          ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-600 ring-2 ring-rose-400'
                          : selectedAntenna === 'A'
                          ? 'bg-emerald-200 dark:bg-emerald-950 border-emerald-500 text-emerald-700 ring-2 ring-emerald-400'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        <Antenna className="h-4 w-4" />
                        <span className="text-[7.5px] font-mono font-bold">Ant A</span>
                        <span className="text-[7px] font-mono font-bold mt-0.5">{rssiA} dBm</span>
                      </div>

                      {/* Antenna B (Selected) */}
                      <div className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                        isFadingAntB
                          ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-600'
                          : selectedAntenna === 'B'
                          ? 'bg-emerald-200 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_12px_#10b981]'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        <Antenna className="h-4 w-4" />
                        <span className="text-[7.5px] font-mono font-bold">Ant B {selectedAntenna === 'B' && '✓'}</span>
                        <span className="text-[7px] font-mono font-bold mt-0.5">{rssiB} dBm</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-purple-700 dark:text-purple-300 font-bold">
                      BS Diversity Hub
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono font-bold mt-1 text-slate-700 dark:text-slate-300">
                    Dual Antennas (d &ge; &lambda;)
                  </span>
                </div>
              </div>

              {/* 2. Real-Time Rayleigh Fading Curve & Cursor */}
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1">
                  <span>Rayleigh Fast-Fading Spatial Envelope (Signal vs Distance):</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">Position: {spatialPos.toFixed(2)} λ</span>
                </div>
                
                {/* SVG Oscilloscope Envelope */}
                <div className="h-14 w-full bg-slate-900 rounded-lg p-1 relative overflow-hidden border border-slate-800">
                  <svg className="w-full h-full" viewBox="0 0 300 50" preserveAspectRatio="none">
                    {/* Sensitivity threshold line (-75 dBm) */}
                    <line x1="0" y1="35" x2="300" y2="35" stroke="#e11d48" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="5" y="32" fill="#f43f5e" fontSize="7" fontFamily="monospace">Receiver Threshold (-75 dBm)</text>

                    {/* Antenna A Envelope (Deep Fade Nulls) */}
                    <path
                      d="M 0 15 Q 40 45, 80 15 T 160 48 T 240 18 T 300 42"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                    />

                    {/* Antenna B Envelope (Spatial Diversity Shifted by 90-180 deg) */}
                    <path
                      d="M 0 38 Q 40 12, 80 38 T 160 12 T 240 42 T 300 15"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.8"
                    />

                    {/* Moving Pedestrian Location Marker */}
                    <line
                      x1={(spatialPos / 3.0) * 300}
                      y1="0"
                      x2={(spatialPos / 3.0) * 300}
                      y2="50"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="shadow-sm"
                    />
                    <circle
                      cx={(spatialPos / 3.0) * 300}
                      cy={isFadingAntA ? 45 : 15}
                      r="3"
                      fill={isAntennaBSelected ? '#10b981' : '#06b6d4'}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  </svg>
                  <div className="absolute right-2 bottom-1 flex items-center gap-2 text-[7.5px] font-mono">
                    <span className="text-rose-400">● Ant A</span>
                    <span className="text-emerald-400">● Ant B</span>
                  </div>
                </div>
              </div>

              {/* 3. Base Station Comparator & Decision Box */}
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[10px] font-mono flex flex-wrap items-center justify-between border border-slate-200 dark:border-slate-700 gap-1.5">
                <div className="flex items-center gap-1.5">
                  {isFadingAntA ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span className={isFadingAntA ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                    {isFadingAntA
                      ? `Fast Fade on Ant A (${rssiA} dBm)! BS RF Switch locks to Ant B (${rssiB} dBm).`
                      : 'Dual antennas healthy: Base Station monitoring spatial correlation coefficient r < 0.2.'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">ΔRSSI: <strong>{deltaRssi} dB</strong></span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold text-[9px]">
                    Antenna {selectedAntenna} Active
                  </span>
                </div>
              </div>

              {/* Handset Downlink Reception Banner (TDD Reciprocity vs FDD Failure) */}
              <div className={`p-2 rounded-lg border text-[10px] font-mono flex items-center gap-2 ${
                compareFdd
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              }`}>
                {compareFdd ? (
                  <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
                <div className="leading-snug">
                  <strong>{compareFdd ? 'FDD Reciprocity Failure: ' : 'TDD Channel Reciprocity: '}</strong>
                  <span>{handsetDownlinkStatus}</span>
                </div>
              </div>
            </div>

            {/* Reciprocity Math note */}
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
              <span className="font-bold text-cyan-600 dark:text-cyan-400">Why Reciprocity Works in TDD: </span>
              Because TDD uses identical frequency <MathFormula tex={`f_{\\text{DL}} = f_{\\text{UL}} = 1.9\\text{ GHz}`} displayMode={false} /> within the channel coherence time <MathFormula tex={`T_c \\approx 15\\text{ ms}`} displayMode={false} />, electromagnetic path impulse responses are identical: <MathFormula tex={`h_{\\text{DL}}(t) = h_{\\text{UL}}(t)`} displayMode={false} />. In FDD, frequency separation <MathFormula tex={`\\Delta f = 190\\text{ MHz}`} displayMode={false} /> destroys reciprocity, requiring complex multi-antenna circuitry on the handset.
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
                  {effectiveLoadPct}% Downlink / {100 - effectiveLoadPct}% Uplink
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                step="5"
                value={effectiveLoadPct}
                onChange={(e) => {
                  setManualOverrideLoad(true);
                  setForwardLoadPct(parseInt(e.target.value));
                }}
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
                      className={`flex-1 h-full rounded transition-all duration-500 flex items-center justify-center font-mono text-[8px] font-bold ${
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
                    {effectiveLoadPct > 50 ? `Wasting ${effectiveLoadPct - 50}% Reverse Spectrum!` : 'Matched'}
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
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
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
