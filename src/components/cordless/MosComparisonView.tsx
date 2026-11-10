import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  HelpCircle, 
  Headphones, 
  Zap, 
  Layers,
  Award,
  StepForward,
  RotateCcw
} from 'lucide-react';

interface CoderData {
  id: string;
  name: string;
  shortName: string;
  bitRate: number; // kbps
  bitRateStr: string;
  mos: number;
  tollQuality: boolean;
  standard: string;
  application: string;
  complexity: string;
  description: string;
}

const CODERS: CoderData[] = [
  {
    id: 'uncoded',
    name: 'Uncoded Speech',
    shortName: 'Uncoded',
    bitRate: 0,
    bitRateStr: 'Not coded',
    mos: 4.4,
    tollQuality: true,
    standard: 'Studio Reference (Analog Source)',
    application: 'Benchmark reference',
    complexity: 'None (Analog direct)',
    description: 'Raw acoustic speech. Notice that even uncoded speech does not achieve a perfect 5.0 because human listeners award 4s to natural voice variations.',
  },
  {
    id: 'pcm',
    name: 'PCM (Pulse Code Modulation)',
    shortName: 'PCM (G.711)',
    bitRate: 64,
    bitRateStr: '64 kbps',
    mos: 4.3,
    tollQuality: true,
    standard: 'ITU-T G.711 (µ-law / A-law)',
    application: 'PSTN wireline telephony, ISDN B-channel',
    complexity: 'Very Low (Scalar log compand)',
    description: 'The global standard for wired digital telephony since the 1960s. Samples at 8,000 Hz with 8 bits per sample to produce a 64 kbps DS0 channel.',
  },
  {
    id: 'adpcm',
    name: 'ADPCM (Adaptive Differential PCM)',
    shortName: 'ADPCM (G.726)',
    bitRate: 32,
    bitRateStr: '32 kbps',
    mos: 4.1,
    tollQuality: true,
    standard: 'ITU-T G.726',
    application: 'DECT cordless phones (§11.1), WLL fixed access',
    complexity: 'Low-Medium (Adaptive predictor)',
    description: 'DECT standard speech coder. Delivers toll-quality voice equivalent to wired telephone lines while cutting bandwidth consumption by 50%.',
  },
  {
    id: 'ld-celp',
    name: 'LD-CELP (Low-Delay CELP)',
    shortName: 'LD-CELP',
    bitRate: 16,
    bitRateStr: '16 kbps',
    mos: 4.0,
    tollQuality: true,
    standard: 'ITU-T G.728',
    application: 'High-quality digital mobile radio, video conferencing',
    complexity: 'High (50th-order backward LP)',
    description: 'Achieves wireline toll quality with ultra-low algorithmic delay (< 2 ms) using backward adaptive linear prediction.',
  },
  {
    id: 'celp-8',
    name: 'CELP (Code-Excited Linear Prediction)',
    shortName: 'CELP (8k)',
    bitRate: 8,
    bitRateStr: '8 kbps',
    mos: 3.6,
    tollQuality: false,
    standard: 'ITU-T G.729 / IS-96 CDMA',
    application: '2G/3G Cellular systems, VoIP',
    complexity: 'Very High (Stochastic codebooks)',
    description: 'Used in digital cellular telephony. Speech is natural and intelligible, though trained listeners notice slight synthetic coloration.',
  },
  {
    id: 'celp-4',
    name: 'CELP (Low Bit-Rate)',
    shortName: 'CELP (4.2k)',
    bitRate: 4.2,
    bitRateStr: '4.2 kbps',
    mos: 3.0,
    tollQuality: false,
    standard: 'Federal Standard 1016',
    application: 'Secure tactical communications, satellite telephony',
    complexity: 'Very High (Heavy codebook search)',
    description: 'Operates at fair communication quality (MOS 3.0), acceptable for voice transmission where radio spectrum is severely constrained.',
  },
  {
    id: 'lpc',
    name: 'LPC (Linear Predictive Coding)',
    shortName: 'LPC (2.4k)',
    bitRate: 2.4,
    bitRateStr: '2.4 kbps',
    mos: 2.4,
    tollQuality: false,
    standard: 'Federal Standard 1015 (LPC-10)',
    application: 'Military HF radio, encrypted government comms',
    complexity: 'Moderate (Pitch/voicing detector)',
    description: 'Synthesizes speech using a vocal tract filter model. Highly intelligible but distinctly robotic; classified as synthetic speech quality.',
  },
];

const MOS_SCALE_LEVELS = [
  { score: 5, quality: 'Excellent', impairment: 'Imperceptible', color: 'text-emerald-500' },
  { score: 4, quality: 'Good', impairment: '(Just) perceptible but not annoying', color: 'text-cyan-500' },
  { score: 3, quality: 'Fair', impairment: '(Perceptible and) slightly annoying', color: 'text-amber-500' },
  { score: 2, quality: 'Poor', impairment: 'Annoying (but not objectionable)', color: 'text-orange-500' },
  { score: 1, quality: 'Unsatisfactory', impairment: 'Very annoying (objectionable)', color: 'text-rose-500' },
];

export const MosComparisonView: React.FC = () => {
  const { simTime, simPlaying, simSpeed } = useApp();
  const [selectedCoderId, setSelectedCoderId] = useState<string>('adpcm');
  const [manualOverride, setManualOverride] = useState<boolean>(false);
  const [showTableInterpretation, setShowTableInterpretation] = useState<boolean>(false);

  // PACING REFINEMENT (Phase 4.1):
  // When simPlaying is active, advance through each coder with 3.2s hold (total cycle = 7 * 3.2 = 22.4s)
  // so users have ample time to read its MOS score, bit rate, standard, and profile description.
  const CODER_STEP_TIME = 3.2; // seconds per coder
  React.useEffect(() => {
    if (!simPlaying || manualOverride) return;
    const totalCycle = CODERS.length * CODER_STEP_TIME;
    const index = Math.floor((simTime % totalCycle) / CODER_STEP_TIME);
    if (CODERS[index]) {
      setSelectedCoderId(CODERS[index].id);
    }
  }, [simTime, simPlaying, manualOverride]);

  const handleStepCoder = () => {
    setManualOverride(true);
    const currentIndex = CODERS.findIndex(c => c.id === selectedCoderId);
    const nextIndex = (currentIndex + 1) % CODERS.length;
    setSelectedCoderId(CODERS[nextIndex].id);
  };

  const handleResetCoders = () => {
    setManualOverride(false);
    setSelectedCoderId('adpcm');
  };

  const selectedCoder = CODERS.find(c => c.id === selectedCoderId) || CODERS[2];

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Header & Summary */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Mean Opinion Score (MOS) Speech Quality Comparison (Stallings Fig 11.7)
            </span>
          </div>
          {/* Step & Reset Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleStepCoder}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-mono text-xs font-bold hover:bg-cyan-400 transition-all shadow-xs"
            >
              <StepForward className="h-3 w-3" />
              <span>Step Coder</span>
            </button>
            <button
              onClick={handleResetCoders}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 text-xs"
              title="Reset to ADPCM"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 ml-1">
              ITU-T P.800
            </span>
          </div>
        </div>

        {/* Toll-Quality Callout Bar */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Toll Quality Benchmark:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">MOS 4.0 – 4.5</span>
          </div>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            ADPCM 32k achieves MOS 4.1 (Toll Quality in DECT)
          </span>
        </div>
      </div>

      {/* 2. Interactive Bar Chart Canvas */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white">
            Subjective Speech Quality vs. Bit Rate (Figure 11.7)
          </span>
          <span className="text-[10px] text-slate-400">Click a bar to inspect</span>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative p-2 sm:p-4 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 min-h-[260px] flex flex-col justify-end">
          
          {/* Toll Quality Shaded Band (4.0 to 4.5 MOS) */}
          <div 
            className="absolute left-8 right-2 bg-emerald-500/10 border-y border-emerald-500/30 pointer-events-none z-0"
            style={{
              bottom: `${(4.0 / 5.0) * 180 + 35}px`,
              height: `${(0.5 / 5.0) * 180}px`,
            }}
          >
            <span className="absolute right-2 top-0.5 text-[8.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
              Toll Quality Band (4.0 - 4.5)
            </span>
          </div>

          {/* Horizontal Gridlines & Y-Axis Scale (1 to 5) */}
          <div className="absolute left-2 top-4 bottom-10 w-6 flex flex-col justify-between text-[9px] font-mono text-slate-400 select-none">
            <span>5.0</span>
            <span>4.0</span>
            <span>3.0</span>
            <span>2.0</span>
            <span>1.0</span>
          </div>

          {/* Bar Chart Columns */}
          <div className="flex items-end justify-around gap-1.5 sm:gap-3 pl-8 pr-2 h-48 z-10">
            {CODERS.map((coder) => {
              const isSelected = selectedCoderId === coder.id;
              // Normalize bar height based on 5-point scale (max height 170px)
              const barHeightPx = (coder.mos / 5.0) * 160;

              return (
                <div
                  key={coder.id}
                  onClick={() => {
                    setManualOverride(true);
                    setSelectedCoderId(coder.id);
                  }}
                  className="flex-1 flex flex-col items-center cursor-pointer group"
                >
                  {/* MOS Number Tag */}
                  <span className={`text-[9.5px] font-mono font-bold mb-1 transition-all ${
                    isSelected ? 'text-cyan-600 dark:text-cyan-400 scale-110' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {coder.mos}
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[48px] flex flex-col justify-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 relative shadow-sm ${
                        isSelected
                          ? 'bg-cyan-500 ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.6)]'
                          : coder.tollQuality
                          ? 'bg-emerald-500/80 hover:bg-emerald-500'
                          : 'bg-slate-400 dark:bg-slate-700 hover:bg-slate-500'
                      }`}
                      style={{ height: `${barHeightPx}px` }}
                    >
                      {coder.id === 'adpcm' && (
                        <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[7px] font-mono font-bold whitespace-nowrap shadow-xs">
                          DECT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* X-Axis Coder Label */}
                  <span className={`text-[8.5px] sm:text-[9.5px] font-mono text-center mt-2 transition-all truncate w-full ${
                    isSelected ? 'font-black text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {coder.shortName.split(' ')[0]}
                  </span>
                  <span className="text-[7.5px] font-mono text-slate-400 truncate">
                    {coder.bitRateStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Coder Detailed Profile Card */}
        <div key={selectedCoder.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2 transition-all duration-300 ease-in-out animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {selectedCoder.name}
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                selectedCoder.tollQuality
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}>
                {selectedCoder.tollQuality ? 'Toll Quality (Wireline Grade)' : 'Communications Grade'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-500">Bit Rate: <strong className="text-slate-900 dark:text-white">{selectedCoder.bitRateStr}</strong></span>
              <span className="text-slate-500">MOS: <strong className="text-cyan-600 dark:text-cyan-400 text-sm">{selectedCoder.mos} / 5.0</strong></span>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {selectedCoder.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px] font-mono text-slate-500 pt-1">
            <span>Standard: <strong className="text-slate-700 dark:text-slate-300">{selectedCoder.standard}</strong></span>
            <span>Application: <strong className="text-slate-700 dark:text-slate-300">{selectedCoder.application}</strong></span>
            <span>Complexity: <strong className="text-slate-700 dark:text-slate-300">{selectedCoder.complexity}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Table 11.3: MOS 1-5 Quality & Impairment Scales */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Headphones className="h-4 w-4 text-purple-500" />
            <span>Table 11.3: Mean Opinion Score (MOS) Values & Interpretations</span>
          </span>
          <button
            onClick={() => setShowTableInterpretation(!showTableInterpretation)}
            className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            {showTableInterpretation ? 'Hide Notes' : 'Why MOS Matters'}
          </button>
        </div>

        {/* Table 11.3 Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px]">
                <th className="py-1 px-2">Score</th>
                <th className="py-1 px-2">Quality Scale Interpretation</th>
                <th className="py-1 px-2">Impairment Scale Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {MOS_SCALE_LEVELS.map((level) => (
                <tr key={level.score} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-1.5 px-2 font-bold">
                    <span className={`inline-block w-5 h-5 rounded-md text-center leading-5 font-bold text-xs ${level.color} bg-slate-100 dark:bg-slate-800`}>
                      {level.score}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 font-semibold text-slate-800 dark:text-slate-200">
                    {level.quality}
                  </td>
                  <td className="py-1.5 px-2 text-slate-600 dark:text-slate-400">
                    {level.impairment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Why MOS Matters Drawer */}
        {showTableInterpretation && (
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>Subjective Listening Tests vs. Objective SNR:</strong> In assessing speech coders, perceptual subjective measurements are far more relevant than objective Signal-to-Noise Ratio (SNR) or Mean Square Error. Objective metrics penalize harmless phase shifts that human ears cannot detect, while failing to detect annoying pitch clicks. MOS formalizes human perception and is used as an official Quality of Service (QoS) metric in wireless standards including IEEE 802.16 WiMAX (§11.3).
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
