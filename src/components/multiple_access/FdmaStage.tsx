import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useMultipleAccess } from '../../context/MultipleAccessSimulator';
import { MathFormula } from '../common/MathFormula';
import { 
  Radio, 
  Zap, 
  Send, 
  Layers, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { LaptopIcon, SmartphoneIcon, TabletIcon, BaseStationIcon } from '../icons/DeviceIcons';

interface FdmaChannel {
  id: string;
  name: string;
  devType: string;
  freq: string;
  centerFreqMHz: number;
  bw: string;
  color: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
}

const CHANNELS: FdmaChannel[] = [
  {
    id: 'sta-1',
    name: 'Laptop 1 (STA-1)',
    devType: 'laptop',
    freq: 'f1 = 2.150 GHz',
    centerFreqMHz: 2150,
    bw: '5 MHz BW',
    color: '#06b6d4',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-500',
    bgClass: 'bg-cyan-500',
  },
  {
    id: 'sta-2',
    name: 'Smartphone (STA-2)',
    devType: 'smartphone',
    freq: 'f2 = 2.155 GHz',
    centerFreqMHz: 2155,
    bw: '5 MHz BW',
    color: '#10b981',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-500',
  },
  {
    id: 'sta-3',
    name: 'Tablet (STA-3)',
    devType: 'tablet',
    freq: 'f3 = 2.160 GHz',
    centerFreqMHz: 2160,
    bw: '5 MHz BW',
    color: '#f59e0b',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-500',
  },
  {
    id: 'sta-4',
    name: 'Laptop 2 (STA-4)',
    devType: 'laptop2',
    freq: 'f4 = 2.165 GHz',
    centerFreqMHz: 2165,
    bw: '5 MHz BW',
    color: '#ec4899',
    textClass: 'text-pink-600 dark:text-pink-400',
    borderClass: 'border-pink-500',
    bgClass: 'bg-pink-500',
  },
];

export const FdmaStage: React.FC = () => {
  const { simTime, simPlaying } = useApp();
  const { sendPacket, sendAllPackets, packets, deliveredCount } = useMultipleAccess();

  // Guard Band Mode: normal (500 kHz safe) vs tight (50 kHz crosstalk)
  const [tightGuardBand, setTightGuardBand] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Active transmission states per channel
  const activeChannels = React.useMemo(() => {
    const activeMap: Record<string, boolean> = {};
    packets.forEach((p) => {
      activeMap[p.deviceId] = true;
    });
    return activeMap;
  }, [packets]);

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Header & Dedicated FDMA Sub-band Specs */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              FDMA Dedicated Simulation: 4 Parallel RF Frequency Lanes
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={sendAllPackets}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-mono text-xs font-bold hover:bg-cyan-400 transition-all shadow-xs"
              title="Transmit on all 4 frequencies simultaneously with zero collision"
            >
              <Zap className="h-3 w-3" />
              <span>Transmit All Parallel</span>
            </button>
            <button
              onClick={() => setTightGuardBand(!tightGuardBand)}
              className={`px-2 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${
                tightGuardBand
                  ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
              title="Toggle tight guard bands to test adjacent channel interference (ACI)"
            >
              {tightGuardBand ? 'Guard Band: 50 kHz (ACI Interference!)' : 'Guard Band: 500 kHz (Safe Isolation)'}
            </button>
          </div>
        </div>

        {/* 4 Dedicated Sub-bands Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          {CHANNELS.map((ch) => {
            const isActive = !!activeChannels[ch.id];
            return (
              <div 
                key={ch.id} 
                className={`p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive 
                    ? 'bg-slate-100 dark:bg-slate-800/90 shadow-sm ring-1'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
                style={{ borderColor: isActive ? ch.color : undefined }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: ch.color }}>{ch.freq.split(' = ')[0]}</span>
                  <span className={`h-2 w-2 rounded-full ${isActive ? 'animate-pulse' : 'opacity-40'}`} style={{ backgroundColor: ch.color }} />
                </div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-white mt-0.5">{ch.centerFreqMHz} MHz</div>
                <div className="text-[8.5px] text-slate-500">{ch.bw} (Dedicated FAMA)</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Real-Time RF Spectrum Analyzer Display (FFT Power View) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-cyan-500" />
            <span>Real-Time RF Power Spectrum (20 MHz Total Bandwidth: 2.148 - 2.168 GHz)</span>
          </span>
          <span className="text-[10px] text-slate-400">
            {tightGuardBand ? 'Warning: Crosstalk Overlap Active!' : 'Zero Inter-carrier Crosstalk'}
          </span>
        </div>

        {/* SVG Spectrum Analyzer with 4 Frequency Gaussian Peaks */}
        <div className="relative h-28 sm:h-32 w-full bg-slate-950 rounded-xl p-2 border border-slate-800 overflow-hidden flex flex-col justify-between">
          <svg className="w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
            {/* Horizontal Gridlines (-20, -40, -60, -80 dBm) */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="45" x2="400" y2="45" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="70" x2="400" y2="70" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Noise Floor */}
            <path
              d="M 0 85 Q 50 82, 100 85 T 200 84 T 300 85 T 400 84"
              fill="none"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* 4 Frequency Gaussian Bell Curves */}
            {CHANNELS.map((ch, idx) => {
              const isActive = !!activeChannels[ch.id];
              const peakHeight = isActive ? 15 : 78; // Y coordinate (15 is high power, 78 is idle)
              const centerX = 50 + idx * 100;
              const spread = tightGuardBand ? 65 : 40; // Guard band spread

              return (
                <g key={ch.id}>
                  {/* Active Transmission Glow Fill */}
                  <path
                    d={`M ${centerX - spread} 85 Q ${centerX} ${peakHeight}, ${centerX + spread} 85 Z`}
                    fill={ch.color}
                    fillOpacity={isActive ? 0.35 : 0.08}
                    stroke={ch.color}
                    strokeWidth={isActive ? 2.5 : 1}
                    className="transition-all duration-300"
                  />
                  {/* Center Frequency Marker */}
                  <line 
                    x1={centerX} 
                    y1={peakHeight} 
                    x2={centerX} 
                    y2="85" 
                    stroke={ch.color} 
                    strokeWidth="0.8" 
                    strokeDasharray="2 2" 
                    opacity={isActive ? 0.9 : 0.4} 
                  />
                  <text 
                    x={centerX} 
                    y={peakHeight - 4} 
                    fill={ch.color} 
                    fontSize="7.5" 
                    fontFamily="monospace" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {ch.centerFreqMHz}M
                  </text>
                </g>
              );
            })}

            {/* Guard Band Shaded Columns between carriers */}
            {!tightGuardBand && [100, 200, 300].map((gx, i) => (
              <g key={i}>
                <rect x={gx - 10} y="10" width="20" height="75" fill="#f59e0b" fillOpacity="0.08" />
                <line x1={gx} y1="10" x2={gx} y2="85" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1 1" />
              </g>
            ))}
          </svg>

          {/* X-Axis Frequency Scale */}
          <div className="flex justify-between w-full text-[7.5px] sm:text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-800">
            <span>2.147 GHz</span>
            <span className="text-cyan-400">f1: 2.150G</span>
            <span className="text-emerald-400">f2: 2.155G</span>
            <span className="text-amber-400">f3: 2.160G</span>
            <span className="text-pink-400">f4: 2.165G</span>
            <span>2.168 GHz</span>
          </div>
        </div>
      </div>

      {/* 3. 4 Parallel Physical Pipeline Lanes (Direct Station to Base Station) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white">
            4 Isolated Over-the-Air Transmission Lanes (Parallel Multi-Carrier Architecture)
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Zero Contention · Zero Delay
          </span>
        </div>

        {/* 4 Lanes Container */}
        <div className="flex flex-col gap-2.5">
          {CHANNELS.map((ch, idx) => {
            const isActive = !!activeChannels[ch.id];
            // Find in-flight packet for this lane
            const pkt = packets.find((p) => p.deviceId === ch.id);
            const progress = pkt ? pkt.progress : 0;

            return (
              <div 
                key={ch.id} 
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 sm:gap-4 transition-all ${
                  isActive
                    ? 'bg-slate-50 dark:bg-slate-950/90 shadow-sm'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                }`}
                style={{ borderColor: isActive ? ch.color : undefined }}
              >
                {/* Station Card (Left) */}
                <div className="flex items-center gap-2 w-36 sm:w-44 shrink-0">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center border shadow-xs shrink-0"
                    style={{ borderColor: ch.color, backgroundColor: `${ch.color}15` }}
                  >
                    <Radio className="h-5 w-5" style={{ color: ch.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-mono font-bold text-slate-900 dark:text-white truncate">
                      {ch.name.split(' ')[0]} {ch.name.split(' ')[1]}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate">{ch.freq}</div>
                  </div>
                </div>

                {/* Central Isolated Frequency Pipe */}
                <div className="flex-1 flex flex-col items-center relative mx-1 sm:mx-3">
                  {/* The Physical Frequency Conduit */}
                  <div className="w-full h-3 rounded-full relative overflow-hidden border flex items-center bg-slate-100 dark:bg-slate-950" style={{ borderColor: `${ch.color}50` }}>
                    {/* Background tint */}
                    <div className="w-full h-full opacity-20" style={{ backgroundColor: ch.color }} />

                    {/* Animated Moving Packet Pill */}
                    {isActive && (
                      <div
                        className="absolute h-full px-2 rounded-full font-mono text-[8px] font-black flex items-center justify-center text-slate-950 shadow-md transition-transform"
                        style={{
                          left: `${progress * 90 + 5}%`,
                          transform: 'translateX(-50%)',
                          backgroundColor: ch.color,
                        }}
                      >
                        <span>DATA ({ch.freq.split(' = ')[0]})</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[8px] font-mono text-slate-400 mt-1">
                    {isActive ? `Transmitting at 240 bps on ${ch.freq.split(' = ')[1]}` : `Channel Idle (${ch.bw} Reserved)`}
                  </span>
                </div>

                {/* Send Packet Button */}
                <button
                  onClick={() => sendPacket(ch.id)}
                  className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold text-slate-950 transition-all shadow-xs shrink-0 hover:opacity-90 active:scale-95 flex items-center gap-1"
                  style={{ backgroundColor: ch.color }}
                >
                  <Send className="h-3 w-3" />
                  <span className="hidden xs:inline">Send</span>
                </button>

                {/* Base Station Demux Filter Bank Pin (Right) */}
                <div className="w-20 sm:w-28 flex flex-col items-center justify-center p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-400/40 text-[9px] font-mono shrink-0">
                  <span className="font-bold text-purple-700 dark:text-purple-300">BPF {idx + 1}</span>
                  <span className="text-[7.5px] text-slate-400">{ch.centerFreqMHz} MHz</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Stallings Chapter 9/10 Theory Insight */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
          <Info className="h-4 w-4 text-cyan-500 shrink-0" />
          <span>FDMA Architectural Mechanics (Stallings §9.2 / §10.1):</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          In Frequency Division Multiple Access, each mobile station is assigned a distinct RF carrier frequency (<MathFormula tex={`f_1, f_2, f_3, f_4`} displayMode={false} />). The base station uses analog bandpass filter banks (BPF) to separate the received signals. Because the sub-bands do not overlap in frequency, <strong>all stations can transmit at the exact same instant without packet collision or mutual interference</strong>.
        </p>
      </div>
    </div>
  );
};
