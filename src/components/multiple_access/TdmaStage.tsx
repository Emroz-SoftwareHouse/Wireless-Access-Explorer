import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useMultipleAccess } from '../../context/MultipleAccessSimulator';
import { MathFormula } from '../common/MathFormula';
import { 
  Clock, 
  Send, 
  Zap, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers, 
  Radio, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface TdmaSlotInfo {
  index: number;
  devId: string;
  name: string;
  color: string;
  timeWindow: string;
}

const SLOTS: TdmaSlotInfo[] = [
  { index: 0, devId: 'sta-1', name: 'Laptop 1 (STA-1)', color: '#06b6d4', timeWindow: '0.0s – 0.5s' },
  { index: 1, devId: 'sta-2', name: 'Smartphone (STA-2)', color: '#10b981', timeWindow: '0.5s – 1.0s' },
  { index: 2, devId: 'sta-3', name: 'Tablet (STA-3)', color: '#f59e0b', timeWindow: '1.0s – 1.5s' },
  { index: 3, devId: 'sta-4', name: 'Laptop 2 (STA-4)', color: '#ec4899', timeWindow: '1.5s – 2.0s' },
];

export const TdmaStage: React.FC = () => {
  const { simTime, simPlaying } = useApp();
  const { 
    sendPacket, 
    sendAllPackets, 
    packets, 
    devices, 
    tdmaCurrentSlot, 
    tdmaSlotProgress, 
    tdmaFramePeriod 
  } = useMultipleAccess();

  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  // Time in current 2.0s frame
  const timeInFrame = simTime % tdmaFramePeriod;
  const currentSlotInfo = SLOTS[tdmaCurrentSlot] || SLOTS[0];

  // In TDMA, find any in-flight packet currently crossing the single shared channel
  const activeBurstPacket = packets.find((p) => p.direction === 'to_bs');

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Header & TDMA Frame Status */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              TDMA Dedicated Simulation: 1 Shared Carrier · Cyclical Time Slots
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={sendAllPackets}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500 text-white font-mono text-xs font-bold hover:bg-purple-400 transition-all shadow-xs"
              title="Triggers all 4 stations: Only the station with the active slot transmits immediately; others queue!"
            >
              <Zap className="h-3 w-3" />
              <span>Trigger All (Watch Queuing)</span>
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              Single Carrier: 2.150 GHz
            </span>
          </div>
        </div>

        {/* Live Slot Status Pill */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentSlotInfo.color }} />
            <span className="font-bold text-slate-900 dark:text-white">
              Current Slot {tdmaCurrentSlot + 1}: {currentSlotInfo.name} ({currentSlotInfo.timeWindow})
            </span>
          </div>
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
            Frame Progress: {timeInFrame.toFixed(2)}s / 2.00s
          </span>
        </div>
      </div>

      {/* 2. Interactive Time-Frame Slotted Ribbon & Circular Wheel */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white">
            Cyclic TDMA Slotted Frame Timeline (Stallings Figure 10.3)
          </span>
          <span className="text-[10px] text-slate-400">4 Time Slots (500 ms each) + 30 µs Guard Intervals</span>
        </div>

        {/* Slotted Linear Ribbon */}
        <div className="relative h-12 w-full bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 grid grid-cols-4 divide-x divide-slate-300 dark:divide-slate-800 shadow-inner">
          {SLOTS.map((slot) => {
            const isCurrent = tdmaCurrentSlot === slot.index;
            return (
              <div
                key={slot.index}
                className={`flex flex-col items-center justify-center p-1 text-center font-mono relative transition-all duration-100 ${
                  isCurrent 
                    ? 'bg-slate-200 dark:bg-slate-800/90 shadow-sm ring-2 ring-inset' 
                    : 'opacity-70 bg-transparent'
                }`}
                style={{ borderColor: isCurrent ? slot.color : undefined }}
              >
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slot.color }} />
                  <span className="text-[10px] sm:text-xs font-bold" style={{ color: slot.color }}>
                    Slot {slot.index + 1}
                  </span>
                </div>
                <span className="text-[8.5px] sm:text-[9.5px] text-slate-700 dark:text-slate-300 truncate max-w-full">
                  {slot.name.split(' ')[0]}
                </span>
                <span className="text-[7.5px] text-slate-400">{slot.timeWindow}</span>

                {/* Live Scanning Playhead Bar inside active slot */}
                {isCurrent && (
                  <div
                    className="absolute bottom-0 left-0 h-1 transition-all duration-75 shadow-md"
                    style={{
                      width: `${tdmaSlotProgress * 100}%`,
                      backgroundColor: slot.color,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Moving Red Playhead Line Across Full 2.0s Frame */}
        <div className="relative w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 shadow-[0_0_8px_#a855f7] transition-all duration-75"
            style={{ width: `${(timeInFrame / 2.0) * 100}%` }}
          />
        </div>
      </div>

      {/* 3. The Single Shared Carrier Conduit & Local Queue Buffers */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white">
            Single Shared 2.150 GHz Channel (Time-Multiplexed Access)
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
            Only 1 Transmitter Active at any Instant
          </span>
        </div>

        {/* Central Single Carrier Pipe Illustration */}
        <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between px-2 text-[10px] font-mono text-slate-400">
            <span>4 Client Stations (Left)</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">Single Shared RF Carrier Pipe (2.15 GHz)</span>
            <span>Base Station Hub (Right)</span>
          </div>

          {/* Central Conduit Pipe */}
          <div className="w-full h-8 bg-slate-200 dark:bg-slate-950 rounded-xl relative overflow-hidden border border-slate-300 dark:border-slate-800 flex items-center">
            {/* Active Carrier Wave Glow */}
            <div 
              className="w-full h-full opacity-30 transition-all duration-200" 
              style={{ backgroundColor: currentSlotInfo.color }} 
            />

            {/* In-Flight Active Burst Packet */}
            {activeBurstPacket && (
              <div
                className="absolute h-6 px-3 rounded-lg font-mono text-[9px] font-black flex items-center justify-center text-slate-950 shadow-lg border border-white dark:border-slate-800 transition-transform"
                style={{
                  left: `${activeBurstPacket.progress * 80 + 10}%`,
                  transform: 'translateX(-50%)',
                  backgroundColor: activeBurstPacket.color,
                }}
              >
                <span>BURST: {activeBurstPacket.label}</span>
              </div>
            )}

            {!activeBurstPacket && (
              <div className="w-full text-center text-[9px] font-mono text-slate-400">
                Carrier Reserved for Slot {tdmaCurrentSlot + 1} ({currentSlotInfo.name.split(' ')[0]})
              </div>
            )}
          </div>
        </div>

        {/* 4 Stations Queue & Transmission Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {devices.slice(0, 4).map((dev, idx) => {
            const isMySlot = tdmaCurrentSlot === dev.tdmaSlotIndex;
            const hasQueue = dev.queueCount > 0;

            return (
              <div
                key={dev.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isMySlot
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-400/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center border shadow-xs shrink-0"
                    style={{ borderColor: dev.color, backgroundColor: `${dev.color}15` }}
                  >
                    <Radio className="h-5 w-5" style={{ color: dev.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{dev.shortName}</span>
                      {isMySlot && (
                        <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold uppercase">
                          Active Slot
                        </span>
                      )}
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-500">
                      Slot {dev.tdmaSlotIndex + 1} ({SLOTS[dev.tdmaSlotIndex]?.timeWindow})
                    </div>
                  </div>
                </div>

                {/* Queue status & Send Button */}
                <div className="flex items-center gap-2">
                  {hasQueue && (
                    <div className="text-center px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-[9px] font-mono font-bold animate-pulse">
                      Queued: {dev.queueCount}
                    </div>
                  )}

                  <button
                    onClick={() => sendPacket(dev.id)}
                    className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold text-slate-950 transition-all shadow-xs hover:opacity-90 active:scale-95 flex items-center gap-1 shrink-0"
                    style={{ backgroundColor: dev.color }}
                    title={isMySlot ? "Transmit burst immediately" : "Queue packet awaiting designated slot"}
                  >
                    <Send className="h-3 w-3" />
                    <span>{isMySlot ? "Burst Now" : "Queue Packet"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Theory Note */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
          <Info className="h-4 w-4 text-purple-500 shrink-0" />
          <span>TDMA Architectural Mechanics (Stallings §9.3 / §10.3):</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          In Time Division Multiple Access, all subscribers share the <strong>exact same RF carrier frequency</strong>, but transmission time is partitioned into cyclical frames. If a station has data to transmit outside its assigned time slot, <strong>the packet must buffer in the local queue</strong> until its designated slot begins. Short guard intervals (<MathFormula tex={`T_g \\approx 30\\,\\mu\\text{s}`} displayMode={false} />) prevent timing jitter and propagation delays from causing adjacent slot collisions.
        </p>
      </div>
    </div>
  );
};
