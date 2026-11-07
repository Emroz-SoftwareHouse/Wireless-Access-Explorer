import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, 
  Radio, 
  ShieldCheck, 
  Globe, 
  ArrowRightLeft, 
  Cpu, 
  Terminal, 
  Sparkles,
  Info,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Wifi,
  ArrowRight,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { SimEvent } from '../../types';

export interface OsiLayerInfo {
  layerNumber: number;
  name: string;
  pdu: string;
  headerTag: string;
  summary: string;
  examples: string[];
  ch11Callout?: string;
  color: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  headerColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const OSI_LAYERS: OsiLayerInfo[] = [
  {
    layerNumber: 7,
    name: 'Application',
    pdu: 'Data',
    headerTag: 'AH',
    summary: 'Interfaces with end-user applications; initiates data generation (HTTP, VoIP, RTP stream).',
    examples: ['HTTP/HTTPS', 'VoIP (SIP/RTP)', 'DNS', 'SSH'],
    color: 'text-rose-500 dark:text-rose-400',
    borderColor: 'border-rose-400 dark:border-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    headerColor: 'bg-rose-500 text-white',
    icon: Terminal,
  },
  {
    layerNumber: 6,
    name: 'Presentation',
    pdu: 'Data',
    headerTag: 'PH',
    summary: 'Formats, encrypts/decrypts, and compresses data (TLS encryption, G.711/G.726 voice codecs).',
    examples: ['TLS/SSL', 'G.711 / G.726', 'JSON / ASN.1'],
    color: 'text-amber-500 dark:text-amber-400',
    borderColor: 'border-amber-400 dark:border-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    headerColor: 'bg-amber-500 text-slate-950',
    icon: Cpu,
  },
  {
    layerNumber: 5,
    name: 'Session',
    pdu: 'Data',
    headerTag: 'SH',
    summary: 'Establishes, maintains, and synchronizes conversational dialogs and connection checkpoints.',
    examples: ['SIP Sessions', 'RPC Dialogs', 'Sockets API'],
    color: 'text-yellow-500 dark:text-yellow-400',
    borderColor: 'border-yellow-400 dark:border-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    badgeBg: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
    headerColor: 'bg-yellow-500 text-slate-950',
    icon: ArrowRightLeft,
  },
  {
    layerNumber: 4,
    name: 'Transport',
    pdu: 'Segment',
    headerTag: 'TH',
    summary: 'End-to-end transport with port addressing, flow control, and optional reliability (TCP / UDP).',
    examples: ['TCP (Reliable Stream)', 'UDP (VoIP)', 'Port 80/443'],
    color: 'text-emerald-500 dark:text-emerald-400',
    borderColor: 'border-emerald-400 dark:border-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    headerColor: 'bg-emerald-500 text-slate-950',
    icon: ShieldCheck,
  },
  {
    layerNumber: 3,
    name: 'Network',
    pdu: 'Packet',
    headerTag: 'NH',
    summary: 'Logical IP addressing, subnet routing, and packet forwarding across wireless access hops.',
    examples: ['IPv4 / IPv6', 'ICMP', 'IP Routing', 'IPsec'],
    color: 'text-blue-500 dark:text-blue-400',
    borderColor: 'border-blue-400 dark:border-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    headerColor: 'bg-blue-500 text-white',
    icon: Globe,
  },
  {
    layerNumber: 2,
    name: 'Data Link',
    pdu: 'Frame',
    headerTag: 'DH',
    summary: 'Framing, MAC scheduling, error detection (CRC-32 FCS), and retransmission (ARQ).',
    examples: ['DECT DLC LAPDm (§11.1)', 'IEEE 802.16 MAC CPS (§11.3)', 'CRC-32 FCS'],
    ch11Callout: 'Ch.11 protocols: DECT MAC/DLC framing (§11.1) and IEEE 802.16 Common Part MAC sublayer with CRC-32 & ARQ (§11.3).',
    color: 'text-purple-500 dark:text-purple-400',
    borderColor: 'border-purple-400 dark:border-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    badgeBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    headerColor: 'bg-purple-500 text-white',
    icon: Layers,
  },
  {
    layerNumber: 1,
    name: 'Physical',
    pdu: 'Bits',
    headerTag: 'PHY',
    summary: 'Radio frequency (RF) transmission, modulation (QPSK/QAM/OFDM), antenna diversity, and bit streaming.',
    examples: ['DECT 1.88-1.90 GHz GFSK (§11.1)', '802.16 2-11 GHz OFDM (§11.3)', 'Bit Synchronization'],
    ch11Callout: 'Ch.11 protocols: DECT 10 RF carriers (§11.1) and IEEE 802.16 WirelessMAN-OFDM transmission (§11.3).',
    color: 'text-cyan-500 dark:text-cyan-400',
    borderColor: 'border-cyan-400 dark:border-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    badgeBg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    headerColor: 'bg-cyan-500 text-slate-950',
    icon: Radio,
  },
];

export const OsiModelView: React.FC = () => {
  const { 
    selectedOsiLayer, 
    setSelectedOsiLayer, 
    simTime, 
    simPlaying, 
    playSimulation, 
    pauseSimulation, 
    stepSimulation, 
    resetSimulation 
  } = useApp();

  // Total cycle = 12.0s (15 stages * 0.8s = 12.0s)
  const cycleTime = simTime % 12.8;

  // Determine active stage (0 to 14):
  // 0: Host A L7, 1: Host A L6, 2: Host A L5, 3: Host A L4, 4: Host A L3, 5: Host A L2, 6: Host A L1
  // 7: RF Wireless Medium
  // 8: Host B L1, 9: Host B L2, 10: Host B L3, 11: Host B L4, 12: Host B L5, 13: Host B L6, 14: Host B L7
  const currentStage = Math.min(14, Math.floor(cycleTime / 0.80));

  // Determine which layer is active on Sender and Receiver
  let senderActiveLayer: number | null = null;
  let receiverActiveLayer: number | null = null;
  let isRfActive = false;

  if (currentStage >= 0 && currentStage <= 6) {
    senderActiveLayer = 7 - currentStage;
  } else if (currentStage === 7) {
    isRfActive = true;
  } else if (currentStage >= 8 && currentStage <= 14) {
    receiverActiveLayer = currentStage - 7;
  }

  // Active layer for detailed card inspection
  const effectiveInspectionLayer = selectedOsiLayer !== null 
    ? selectedOsiLayer 
    : (senderActiveLayer || receiverActiveLayer || 1);

  const activeLayerInfo = OSI_LAYERS.find(l => l.layerNumber === effectiveInspectionLayer);

  // Emit events to telemetry log on stage changes
  const lastLoggedStageRef = useRef<number>(-1);
  useEffect(() => {
    if (currentStage !== lastLoggedStageRef.current && currentStage >= 0) {
      lastLoggedStageRef.current = currentStage;
      let evt: SimEvent | null = null;

      if (currentStage === 0) {
        evt = {
          no: Date.now() % 100000,
          timeFormatted: `${cycleTime.toFixed(2)}s`,
          timestamp: cycleTime,
          source: 'Host A (L7 App)',
          destination: 'Host A (L6 Pres)',
          type: 'DATA_PACKET',
          info: 'Application creates user payload: [DATA] (64 bytes)',
          sizeValue: '64 bytes',
        };
      } else if (currentStage === 3) {
        evt = {
          no: Date.now() % 100000,
          timeFormatted: `${cycleTime.toFixed(2)}s`,
          timestamp: cycleTime,
          source: 'Host A (L4 Transport)',
          destination: 'Host A (L3 Network)',
          type: 'DATA_PACKET',
          info: 'TCP Segment encapsulated with Transport Header [TH | SH | PH | DATA]',
          sizeValue: '84 bytes',
        };
      } else if (currentStage === 5) {
        evt = {
          no: Date.now() % 100000,
          timeFormatted: `${cycleTime.toFixed(2)}s`,
          timestamp: cycleTime,
          source: 'Host A (L2 Data Link)',
          destination: 'Host A (L1 Physical)',
          type: 'DATA_PACKET',
          info: 'Frame encapsulated with 802.16 MAC header & 32-bit CRC-FCS trailer [DH|...|FCS]',
          sizeValue: '112 bytes',
        };
      } else if (currentStage === 7) {
        evt = {
          no: Date.now() % 100000,
          timeFormatted: `${cycleTime.toFixed(2)}s`,
          timestamp: cycleTime,
          source: 'Host A (Antenna)',
          destination: 'Host B (Antenna)',
          type: 'SYNCHRONIZE',
          info: 'RF Wireless Transmission: 896 modulated bits transmitted over RF Carrier (OFDM / GFSK)',
          sizeValue: '896 bits',
        };
      } else if (currentStage === 9) {
        evt = {
          no: Date.now() % 100000,
          timeFormatted: `${cycleTime.toFixed(2)}s`,
          timestamp: cycleTime,
          source: 'Host B (L1 Physical)',
          destination: 'Host B (L2 Data Link)',
          type: 'ACK_BURST',
          info: 'CRC-32 FCS verified at Host B · MAC header stripped [NH | TH | SH | PH | DATA]',
          sizeValue: 'CRC PASS',
        };
      } else if (currentStage === 14) {
        evt = {
          no: Date.now() % 100000,
          timeFormatted: `${cycleTime.toFixed(2)}s`,
          timestamp: cycleTime,
          source: 'Host B (L6 Pres)',
          destination: 'Host B (L7 App)',
          type: 'DATA_PACKET',
          info: 'Full decapsulation complete: user payload [DATA] delivered to Host B application',
          sizeValue: '64 bytes (Done)',
        };
      }

      if (evt) {
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', { detail: evt }));
      }
    }
  }, [currentStage, cycleTime]);

  const handleSelectLayer = (layerNum: number) => {
    setSelectedOsiLayer(selectedOsiLayer === layerNum ? null : layerNum);
  };

  return (
    <div className="w-full h-full flex flex-col p-2.5 sm:p-4 select-none overflow-y-auto no-pan gap-3">
      {/* 1. Header Toolbar with Play/Step/Reset controls and cycle status */}
      <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 px-3 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Dual-Host Encapsulation & Decapsulation Simulator
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              Stage {currentStage + 1}/15 ({cycleTime.toFixed(1)}s)
            </span>
          </div>
        </div>

        {/* Dedicated Playback Controls */}
        <div className="flex items-center gap-1.5">
          {simPlaying ? (
            <button
              onClick={pauseSimulation}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-mono font-bold transition-colors shadow-xs"
              title="Pause Simulation"
            >
              <Pause className="h-3.5 w-3.5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={playSimulation}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-mono font-bold transition-colors shadow-xs"
              title="Play Simulation"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Play</span>
            </button>
          )}

          <button
            onClick={stepSimulation}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-semibold transition-colors border border-slate-300 dark:border-slate-700"
            title="Step Advance (One Layer / 0.8s)"
          >
            <SkipForward className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Step</span>
          </button>

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-semibold transition-colors border border-slate-300 dark:border-slate-700"
            title="Reset Simulation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Main Visual Simulation Arena: Host A (Sender) -> Wireless Link -> Host B (Receiver) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-11 gap-2.5 sm:gap-3 min-h-[360px] items-stretch">
        {/* Host A: Sender Stack (Cols 1-4) */}
        <div className="md:col-span-5 flex flex-col bg-white dark:bg-[#090d18] border border-slate-200 dark:border-slate-800/90 rounded-xl p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Host A · Transmitter (Encapsulation ↓)
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
              Downstack
            </span>
          </div>

          {/* 7 Layer Stack for Host A */}
          <div className="flex-1 flex flex-col justify-between gap-1.5">
            {OSI_LAYERS.map((layer) => {
              const isActive = senderActiveLayer === layer.layerNumber;
              const isInspected = selectedOsiLayer === layer.layerNumber;
              const LayerIcon = layer.icon;

              return (
                <div
                  key={`hostA-${layer.layerNumber}`}
                  onClick={() => handleSelectLayer(layer.layerNumber)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isActive
                      ? `${layer.bgColor} ${layer.borderColor} ring-2 ring-cyan-500 shadow-md font-bold scale-[1.01]`
                      : isInspected
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/70 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
                      isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      L{layer.layerNumber}
                    </span>
                    <LayerIcon className={`h-3.5 w-3.5 ${layer.color}`} />
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {layer.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 animate-pulse font-bold">
                        <span>Encapsulating</span>
                        <ArrowDown className="h-3 w-3" />
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">
                      {layer.pdu}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Wireless RF Medium (Col 5) */}
        <div className="md:col-span-1 flex md:flex-col items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 gap-2 text-center">
          <div className="flex md:flex-col items-center gap-1 text-cyan-600 dark:text-cyan-400">
            <Wifi className={`h-5 w-5 ${isRfActive ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="text-[9px] font-mono uppercase font-bold tracking-tight text-slate-700 dark:text-slate-300">
              RF Link
            </span>
          </div>

          <div className="flex-1 flex md:flex-col items-center justify-center relative w-full overflow-hidden">
            {isRfActive ? (
              <div className="flex md:flex-col items-center gap-1 animate-pulse">
                <span className="text-[10px] font-mono font-bold text-cyan-500">
                  10110...
                </span>
                <span className="text-[8px] font-mono text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1 rounded">
                  802.16 / DECT
                </span>
              </div>
            ) : (
              <div className="h-full w-0.5 bg-slate-300 dark:bg-slate-800 hidden md:block" />
            )}
          </div>

          <div className="text-[8px] font-mono text-slate-400">
            PHY Medium
          </div>
        </div>

        {/* Host B: Receiver Stack (Cols 6-11) */}
        <div className="md:col-span-5 flex flex-col bg-white dark:bg-[#090d18] border border-slate-200 dark:border-slate-800/90 rounded-xl p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Host B · Receiver (Decapsulation ↑)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              Upstack
            </span>
          </div>

          {/* 7 Layer Stack for Host B (rendered L7 down to L1 to match physical orientation) */}
          <div className="flex-1 flex flex-col justify-between gap-1.5">
            {OSI_LAYERS.map((layer) => {
              const isActive = receiverActiveLayer === layer.layerNumber;
              const isInspected = selectedOsiLayer === layer.layerNumber;
              const LayerIcon = layer.icon;

              return (
                <div
                  key={`hostB-${layer.layerNumber}`}
                  onClick={() => handleSelectLayer(layer.layerNumber)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isActive
                      ? `${layer.bgColor} ${layer.borderColor} ring-2 ring-emerald-500 shadow-md font-bold scale-[1.01]`
                      : isInspected
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/70 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
                      isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      L{layer.layerNumber}
                    </span>
                    <LayerIcon className={`h-3.5 w-3.5 ${layer.color}`} />
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {layer.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 animate-pulse font-bold">
                        <ArrowUp className="h-3 w-3" />
                        <span>Decapsulating</span>
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">
                      {layer.pdu}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Nested Protocol Data Unit (PDU) Encapsulation Shell */}
      <div className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Active In-Flight PDU Shell (Layer Headers & Encapsulation):
          </span>
          <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
            {currentStage <= 6 ? 'Adding Headers (Encapsulation)' : currentStage === 7 ? 'Transmitting Over RF Channel' : 'Stripping Headers (Decapsulation)'}
          </span>
        </div>

        {/* Nested PDU visualization */}
        <div className="flex items-center justify-center gap-1 p-2 bg-white dark:bg-[#070b14] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-x-auto text-[11px] font-mono">
          {/* L2 Header */}
          {(currentStage >= 5 && currentStage <= 9) && (
            <span className="px-2 py-1 rounded bg-purple-500 text-white font-bold animate-fadeIn">
              DH (MAC)
            </span>
          )}
          {/* L3 Header */}
          {((currentStage >= 4 && currentStage <= 10) || (currentStage >= 5 && currentStage <= 9)) && (
            <span className="px-2 py-1 rounded bg-blue-500 text-white font-bold animate-fadeIn">
              NH (IP)
            </span>
          )}
          {/* L4 Header */}
          {(currentStage >= 3 && currentStage <= 11) && (
            <span className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-bold animate-fadeIn">
              TH (TCP)
            </span>
          )}
          {/* L5 Header */}
          {(currentStage >= 2 && currentStage <= 12) && (
            <span className="px-2 py-1 rounded bg-yellow-500 text-slate-950 font-bold animate-fadeIn">
              SH (Session)
            </span>
          )}
          {/* L6 Header */}
          {(currentStage >= 1 && currentStage <= 13) && (
            <span className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold animate-fadeIn">
              PH (TLS)
            </span>
          )}

          {/* User Payload Data */}
          <span className="px-3 py-1 rounded bg-rose-500 text-white font-bold tracking-wider animate-pulse">
            USER PAYLOAD DATA
          </span>

          {/* L2 FCS Trailer */}
          {(currentStage >= 5 && currentStage <= 9) && (
            <span className="px-2 py-1 rounded bg-purple-700 text-purple-100 font-bold border border-purple-400 animate-fadeIn">
              CRC-32 FCS
            </span>
          )}
        </div>
      </div>

      {/* 4. Active Layer Details & Textbook Callout */}
      {activeLayerInfo && (
        <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${activeLayerInfo.headerColor}`}>
                Layer {activeLayerInfo.layerNumber}
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {activeLayerInfo.name} Layer Protocol Specifications
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${activeLayerInfo.badgeBg}`}>
              PDU: {activeLayerInfo.pdu}
            </span>
          </div>

          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs mb-2">
            {activeLayerInfo.summary}
          </p>

          {activeLayerInfo.ch11Callout && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-mono font-medium flex items-start gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span>{activeLayerInfo.ch11Callout}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700 dark:text-slate-400">Key Standards:</span>
            {activeLayerInfo.examples.map((ex, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                {ex}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
