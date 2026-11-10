import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  CheckCircle2, 
  ShieldCheck, 
  Key, 
  Lock, 
  MapPin, 
  PhoneCall, 
  Radio, 
  Info,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface LayerDef {
  id: string;
  name: string;
  shortName: string;
  category: 'lower' | 'service';
  desc: string;
  specs: string;
}

const DECT_LAYERS: LayerDef[] = [
  {
    id: 'phy',
    name: 'Physical Layer',
    shortName: 'Physical',
    category: 'lower',
    desc: 'Transmits TDMA-TDD frames over one of 10 RF carriers (1.88-1.90 GHz) with GFSK modulation at 1.152 Mbps.',
    specs: 'GFSK (288 kHz dev), 10 Carriers, 1.152 Mbps, 24 slots/10ms',
  },
  {
    id: 'mac',
    name: 'Medium Access Control (MAC)',
    shortName: 'MAC',
    category: 'lower',
    desc: 'Selects physical channels, arbitrates connections, and multiplexes A-field (broadcast/control) and B-field (user traffic).',
    specs: 'A-field (64 bits), B-field (320 bits), C/O, C/L & Broadcast',
  },
  {
    id: 'dlc',
    name: 'Data Link Control (DLC)',
    shortName: 'DLC',
    category: 'lower',
    desc: 'Provides reliable transmission of messages over radio links using LAPDm framing, error detection, and selective ARQ.',
    specs: 'LAPDm (GSM derived), Frame sequencing, ARQ Retransmit',
  },
  {
    id: 'cc',
    name: 'Call Control (CC)',
    shortName: 'Call Control',
    category: 'service',
    desc: 'Manages circuit-switched calls, establishing, maintaining, and releasing voice and data connections.',
    specs: 'Setup, Alerting, Connect, Disconnect, Release',
  },
  {
    id: 'ss',
    name: 'Supplementary Services (SS)',
    shortName: 'Supp Services',
    category: 'service',
    desc: 'Handles call-independent operations like call forwarding, conference calling, and caller identity presentation.',
    specs: 'Independent operations, Call Transfer, Hold',
  },
  {
    id: 'clms',
    name: 'Connectionless Message Service (CLMS)',
    shortName: 'CLMS',
    category: 'service',
    desc: 'Supports short individual or broadcast data messages; segments long messages into smaller blocks for transmission.',
    specs: 'Unacknowledged datagrams, Paging, SMS-like telemetry',
  },
  {
    id: 'coms',
    name: 'Connection-Oriented Message Service (COMS)',
    shortName: 'COMS',
    category: 'service',
    desc: 'Maintains point-to-point connections for packet data transfer and signaling outside conventional circuit-switched calls.',
    specs: 'Reliable packet transfer, Point-to-Point virtual circuit',
  },
  {
    id: 'mm',
    name: 'Mobility Management (MM)',
    shortName: 'Mobility Mgmt',
    category: 'service',
    desc: 'Handles authentication, handset identification, tracking in multi-cell networks, encryption key allocation, and ciphering.',
    specs: '7 Service Groups: Identity, Auth, Location, Access, Key, Params, Cipher',
  },
];

const MM_PROCEDURES = [
  {
    step: 0,
    name: 'Identity Procedure',
    direction: 'to_bs',
    label: 'ID_REQ / IPUI',
    summary: 'Mobile unit identifies itself to Base Station using International Portable User Identity (IPUI).',
    icon: PhoneCall,
  },
  {
    step: 1,
    name: 'Authentication Procedure',
    direction: 'to_ms',
    label: 'AUTH_CHALLENGE (RAND)',
    summary: 'Base station challenges Mobile Unit with random seed; mobile verifies identity via standard DSAA algorithm.',
    icon: ShieldCheck,
  },
  {
    step: 2,
    name: 'Location Procedure',
    direction: 'to_bs',
    label: 'LOC_UPDATE',
    summary: 'In multi-cell PBX/campus systems, registers mobile unit location in Visitor Location Register (VLR).',
    icon: MapPin,
  },
  {
    step: 3,
    name: 'Access Rights Procedure',
    direction: 'to_ms',
    label: 'RIGHTS_CONFIRM',
    summary: 'Establishes that the mobile unit has rights to access the requested local network or public PSTN gateway.',
    icon: CheckCircle2,
  },
  {
    step: 4,
    name: 'Key Allocation Procedure',
    direction: 'to_ms',
    label: 'KEY_ALLOC (DCK)',
    summary: 'Distributes Derived Cipher Key (DCK) generated from User Authentication Key (UAK) for session protection.',
    icon: Key,
  },
  {
    step: 5,
    name: 'Parameter Retrieval',
    direction: 'to_bs',
    label: 'PARAM_INFO (Codec/BW)',
    summary: 'Exchanges operational capabilities: ADPCM 32 kbps voice codec support, slot capabilities, and RF power.',
    icon: Sparkles,
  },
  {
    step: 6,
    name: 'Ciphering Procedure',
    direction: 'to_ms',
    label: 'CIPHER_START',
    summary: 'Enables real-time over-the-air link encryption using DECT Standard Cipher (DSC) on all subsequent frames.',
    icon: Lock,
  },
  {
    step: 7,
    name: 'Connection Established',
    direction: 'both',
    label: 'VOICE_ACTIVE (32k ADPCM)',
    summary: 'Call Control: Full duplex 32 kbps ADPCM toll-quality voice link active on assigned TDMA time slot!',
    icon: CheckCircle2,
  },
];

export const DectArchitectureView: React.FC = () => {
  const { simTime, simPlaying, simSpeed } = useApp();
  const [selectedLayerId, setSelectedLayerId] = useState<string>('mm');
  const [callSetupStep, setCallSetupStep] = useState<number>(0);
  const [isManualStep, setIsManualStep] = useState<boolean>(false);

  // PACING REFINEMENT (Phase 4.1):
  // Increase procedure duration from 1.4s to 3.2s so users have a clear travel phase (1.6s)
  // followed by a visible arrived/holding phase (1.6s) to read the procedure name, message type,
  // and summary before advancing.
  const STEP_DURATION = 3.2; // seconds per procedure
  const TRAVEL_DURATION = 1.6; // travel time across corridor

  // Sync call setup with simulation timer if playing
  useEffect(() => {
    if (!simPlaying || isManualStep) return;
    const totalDuration = MM_PROCEDURES.length * STEP_DURATION;
    const step = Math.min(MM_PROCEDURES.length - 1, Math.floor((simTime % totalDuration) / STEP_DURATION));
    setCallSetupStep(step);
  }, [simTime, simPlaying, isManualStep]);

  const activeProcedure = MM_PROCEDURES[callSetupStep];
  const selectedLayer = DECT_LAYERS.find(l => l.id === selectedLayerId) || DECT_LAYERS[7];

  const handleManualStep = () => {
    setIsManualStep(true);
    setCallSetupStep(prev => (prev + 1) % MM_PROCEDURES.length);
  };

  const handleResetSetup = () => {
    setIsManualStep(false);
    setCallSetupStep(0);
  };

  // In-flight message progress (0 to 1) and hold state
  const tInStep = (simTime % STEP_DURATION);
  const isHolding = !simPlaying || isManualStep ? false : tInStep >= TRAVEL_DURATION;
  const travelT = isManualStep || !simPlaying
    ? 1.0
    : Math.min(1.0, tInStep / TRAVEL_DURATION);

  const messageProgress = activeProcedure.direction === 'to_bs'
    ? travelT
    : activeProcedure.direction === 'to_ms'
    ? 1 - travelT
    : 0.5;

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Header & Overview Specifications */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              DECT Protocol Stack (§11.1) & Call Setup Sequence
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            European ETSI / US PWT Standard
          </span>
        </div>

        {/* Spec Callout Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[9px]">Modulation:</span>
            <span className="font-bold text-slate-900 dark:text-white">GFSK (288 kHz dev)</span>
            <span className="text-[8px] text-amber-600 dark:text-amber-400 block">≈ GSM GMSK (§10)</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[9px]">Gross Data Rate:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">1.152 Mbps</span>
            <span className="text-[8px] text-slate-500 block">Bandwidth: 1.728 MHz</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[9px]">RF Carriers:</span>
            <span className="font-bold text-slate-900 dark:text-white">10 Carriers</span>
            <span className="text-[8px] text-slate-500 block">1.88 to 1.90 GHz</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[9px]">TDMA Frame:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">24 Slots / 10 ms</span>
            <span className="text-[8px] text-slate-500 block">120 Duplex Channels</span>
          </div>
        </div>
      </div>

      {/* 2. Dual-Stack Protocol Architecture Canvas */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white">
            Dual-Entity Protocol Stacks: Mobile Unit (MS) ⟷ Base Station (BS)
          </span>
          <span className="text-[10px] text-slate-400">
            Click any layer to inspect
          </span>
        </div>

        {/* Stack Containers Grid with Central Message Channel */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
          
          {/* LEFT STACK: Mobile Unit (3 Cols on desktop) */}
          <div className="md:col-span-3 flex flex-col gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-1 mb-0.5">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-cyan-500" />
                <span>Mobile Unit Stack</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400">Handset</span>
            </div>

            {/* Upper Services Group */}
            <div className="p-1 rounded-lg border border-purple-400/40 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col gap-1">
              <span className="text-[8.5px] font-mono font-bold text-purple-700 dark:text-purple-300 px-1">
                Network & Service Entities Layer
              </span>
              <div className="grid grid-cols-2 gap-1">
                {DECT_LAYERS.filter(l => l.category === 'service').map(layer => {
                  const isSelected = selectedLayerId === layer.id;
                  const isMMActive = layer.id === 'mm' && callSetupStep < 7;
                  const isCCActive = layer.id === 'cc' && callSetupStep === 7;
                  return (
                    <button
                      key={`ms-${layer.id}`}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`p-1.5 rounded text-[9.5px] font-mono font-bold text-left transition-all border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                          : isMMActive || isCCActive
                          ? 'bg-purple-200 dark:bg-purple-900/60 text-purple-950 dark:text-purple-200 border-purple-400 ring-1 ring-purple-400/60'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="truncate">{layer.shortName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lower Layers */}
            {DECT_LAYERS.filter(l => l.category === 'lower').reverse().map(layer => {
              const isSelected = selectedLayerId === layer.id;
              return (
                <button
                  key={`ms-${layer.id}`}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`p-2 rounded-lg text-xs font-mono font-bold text-left transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{layer.name}</span>
                  <span className="text-[8px] font-normal opacity-75">{layer.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* CENTER: In-Flight Message Corridor (1 Col on desktop) */}
          <div className="md:col-span-1 flex md:flex-col items-center justify-center p-2 relative min-h-[60px] md:min-h-[260px]">
            {/* Guide line */}
            <div className="w-full md:w-1 h-1 md:h-full bg-slate-200 dark:bg-slate-800 rounded-full relative flex items-center justify-center">
              {/* Traveling Message Capsule */}
              <div 
                className={`absolute px-2 py-1 rounded-md text-[9px] font-mono font-black shadow-md border whitespace-nowrap z-20 transition-all ${
                  activeProcedure.direction === 'to_bs'
                    ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_12px_#06b6d4]'
                    : activeProcedure.direction === 'to_ms'
                    ? 'bg-amber-400 text-slate-950 border-amber-100 shadow-[0_0_12px_#f59e0b]'
                    : 'bg-emerald-400 text-slate-950 border-emerald-100 shadow-[0_0_14px_#10b981]'
                }`}
                style={{
                  ...(typeof window !== 'undefined' && window.innerWidth >= 768
                    ? { top: `${messageProgress * 80 + 10}%`, transform: 'translateY(-50%)' }
                    : { left: `${messageProgress * 80 + 10}%`, transform: 'translateX(-50%)' })
                }}
              >
                <div className="flex items-center gap-1">
                  {activeProcedure.direction === 'to_bs' && <ArrowRight className="h-3 w-3" />}
                  {activeProcedure.direction === 'to_ms' && <ArrowLeft className="h-3 w-3" />}
                  <span>{activeProcedure.label.split(' ')[0]}</span>
                  {isHolding && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-950 animate-pulse" />}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT STACK: Base Station (3 Cols on desktop) */}
          <div className="md:col-span-3 flex flex-col gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-1 mb-0.5">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-purple-500" />
                <span>Base Station Stack</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400">Fixed Hub</span>
            </div>

            {/* Upper Services Group */}
            <div className="p-1 rounded-lg border border-purple-400/40 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col gap-1">
              <span className="text-[8.5px] font-mono font-bold text-purple-700 dark:text-purple-300 px-1">
                Network & Service Entities Layer
              </span>
              <div className="grid grid-cols-2 gap-1">
                {DECT_LAYERS.filter(l => l.category === 'service').map(layer => {
                  const isSelected = selectedLayerId === layer.id;
                  const isMMActive = layer.id === 'mm' && callSetupStep < 7;
                  const isCCActive = layer.id === 'cc' && callSetupStep === 7;
                  return (
                    <button
                      key={`bs-${layer.id}`}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`p-1.5 rounded text-[9.5px] font-mono font-bold text-left transition-all border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                          : isMMActive || isCCActive
                          ? 'bg-purple-200 dark:bg-purple-900/60 text-purple-950 dark:text-purple-200 border-purple-400 ring-1 ring-purple-400/60'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="truncate">{layer.shortName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lower Layers */}
            {DECT_LAYERS.filter(l => l.category === 'lower').reverse().map(layer => {
              const isSelected = selectedLayerId === layer.id;
              return (
                <button
                  key={`bs-${layer.id}`}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`p-2 rounded-lg text-xs font-mono font-bold text-left transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{layer.name}</span>
                  <span className="text-[8px] font-normal opacity-75">{layer.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Layer Function Details */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              Selected Layer: {selectedLayer.name}
            </span>
            <span className="text-[10px] text-slate-500">{selectedLayer.specs}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {selectedLayer.desc}
          </p>
        </div>
      </div>

      {/* 3. Call Setup Simulation Pipeline (7 MM Steps -> Call Control) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <PhoneCall className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Simulate Call Setup (Mobility Management Sub-Procedures)
            </span>
          </div>
          {/* Step buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleManualStep}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-mono text-xs font-bold hover:bg-cyan-400 transition-all shadow-xs"
            >
              <StepForward className="h-3 w-3" />
              <span>Step</span>
            </button>
            <button
              onClick={handleResetSetup}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 text-xs"
              title="Reset Call Setup"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 7 MM Steps Progress Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1">
          {MM_PROCEDURES.map((proc, i) => {
            const isCurrent = callSetupStep === i;
            const isPassed = callSetupStep > i;
            return (
              <button
                key={i}
                onClick={() => { setIsManualStep(true); setCallSetupStep(i); }}
                className={`p-1.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 border-emerald-600 font-bold shadow-sm ring-1 ring-emerald-400'
                    : isPassed
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span>#{i + 1}</span>
                  {isPassed && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[8.5px] font-mono truncate mt-0.5">
                  {proc.name.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Details Card */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <activeProcedure.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Stage #{callSetupStep + 1}: {activeProcedure.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  {activeProcedure.label}
                </span>
                {isHolding && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-400 font-bold animate-pulse">
                    Delivered (Reading...)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                {activeProcedure.summary}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:inline">
            Step {callSetupStep + 1} of 8
          </span>
        </div>
      </div>
    </div>
  );
};
