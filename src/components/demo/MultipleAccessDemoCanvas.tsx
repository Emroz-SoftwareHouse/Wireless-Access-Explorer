import React from 'react';
import { useApp } from '../../context/AppContext';
import { LaptopIcon, SmartphoneIcon, BaseStationIcon } from '../icons/DeviceIcons';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const MultipleAccessDemoCanvas: React.FC = () => {
  const {
    canvasView,
    simTime,
    deliveredPacketsCount,
    demoPacket1Progress,
    demoAck1Progress,
    demoPacket2Progress,
    demoAck2Progress,
  } = useApp();

  // Active status checks based on 1.8s data and 1.2s ACK round-trip
  const isP1Transmitting = simTime >= 0 && simTime < 1.80;
  const isP1Delivered = simTime >= 1.80;
  const isAck1Transmitting = simTime >= 1.80 && simTime < 3.00;
  const isAck1Delivered = simTime >= 3.00;

  const isP2Transmitting = simTime >= 3.20 && simTime < 5.00;
  const isP2Delivered = simTime >= 5.00;
  const isAck2Transmitting = simTime >= 5.00 && simTime < 6.20;
  const isAck2Delivered = simTime >= 6.20;

  if (canvasView === 'sequence') {
    // Ladder Sequence Diagram View
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 dark:text-slate-200 select-none">
        <div className="w-full max-w-3xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wider">
              Time-Sequence Ladder Diagram
            </span>
            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
              Sim Time: <span className="text-slate-900 dark:text-white font-bold">{simTime.toFixed(2)}s</span>
            </span>
          </div>

          {/* Swimlane Column Headers */}
          <div className="grid grid-cols-3 gap-4 text-center py-3 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex flex-col items-center gap-1">
              <LaptopIcon size={26} color="#06b6d4" />
              <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200">Laptop (STA-1)</span>
              <span className="text-[10px] text-slate-500 font-mono">Uplink Slot 1</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BaseStationIcon size={26} color="#a855f7" />
              <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200">Base Station (BS-01)</span>
              <span className="text-[10px] text-slate-500 font-mono">Coordinator / Hub</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <SmartphoneIcon size={26} color="#10b981" />
              <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200">Smartphone (STA-2)</span>
              <span className="text-[10px] text-slate-500 font-mono">Uplink Slot 2</span>
            </div>
          </div>

          {/* Vertical Lifelines & Message Arrows */}
          <div className="relative py-4 px-2 sm:px-4 space-y-4">
            {/* Lifeline vertical guides */}
            <div className="absolute top-0 bottom-0 left-[16.66%] w-px bg-slate-200 dark:bg-slate-800 dashed pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-[50%] w-px bg-slate-200 dark:bg-slate-800 dashed pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-[83.33%] w-px bg-slate-200 dark:bg-slate-800 dashed pointer-events-none" />

            {/* Event 1: Laptop -> BS -> Return ACK (t = 0.0s to 3.0s) */}
            <div className={`transition-all duration-300 p-2.5 rounded-xl border ${
              simTime >= 0.0 ? 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800/60' : 'bg-transparent border-slate-200 dark:border-slate-800/40 opacity-40'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">t = 0.00s → 1.80s (Data) → 3.00s (ACK)</span>
                <span className="text-slate-600 dark:text-slate-400">DATA_BURST (Slot 1, 240 bits) + ACK (16b)</span>
              </div>
              <div className="relative h-6 flex items-center">
                <div className="w-1/2 flex items-center">
                  <div className="h-0.5 w-full bg-gradient-to-r from-cyan-400 to-purple-400 relative">
                    <ArrowRight className="h-3 w-3 text-purple-500 absolute right-0 -top-1" />
                    {isP1Transmitting && (
                      <div 
                        className="absolute -top-1.5 h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]"
                        style={{ left: `${demoPacket1Progress * 100}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className="w-1/2" />
              </div>
              {isP1Delivered && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {isAck1Delivered
                      ? 'Round-trip completed: BS-01 verified CRC and ACK returned to STA-1 (3.0s RTT)'
                      : 'Packet #1 arrived at BS-01 · Dispatched ACK burst back to STA-1'}
                  </span>
                </div>
              )}
            </div>

            {/* Event 2: Smartphone -> BS -> Return ACK (t = 3.2s to 6.2s) */}
            <div className={`transition-all duration-300 p-2.5 rounded-xl border ${
              simTime >= 3.20 ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60' : 'bg-transparent border-slate-200 dark:border-slate-800/40 opacity-40'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">t = 3.20s → 5.00s (Data) → 6.20s (ACK)</span>
                <span className="text-slate-600 dark:text-slate-400">DATA_BURST (Slot 2, 240 bits) + ACK (16b)</span>
              </div>
              <div className="relative h-6 flex items-center justify-end">
                <div className="w-1/2 flex items-center">
                  <div className="h-0.5 w-full bg-gradient-to-l from-emerald-400 to-purple-400 relative">
                    <ArrowRight className="h-3 w-3 text-purple-500 absolute left-0 -top-1 rotate-180" />
                    {isP2Transmitting && (
                      <div 
                        className="absolute -top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
                        style={{ right: `${demoPacket2Progress * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
              {isP2Delivered && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 justify-end">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {isAck2Delivered
                      ? 'Round-trip completed: BS-01 verified CRC and ACK returned to STA-2 (3.0s RTT)'
                      : 'Packet #2 arrived at BS-01 · Dispatched ACK burst back to STA-2'}
                  </span>
                </div>
              )}
            </div>

            {/* Timeline Progress Line */}
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Frame Start: 0.00s</span>
              <span>STA-2 Turn: 3.20s</span>
              <span>6.40s [2/2 Two-Way Rounds Complete]</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Network Topology View
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden">
      {/* Background Subtle Radar Effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-96 h-96 rounded-full border border-cyan-500/40" />
        <div className="w-[500px] h-[500px] rounded-full border border-cyan-500/20 absolute" />
        <div className="w-[650px] h-[650px] rounded-full border border-cyan-500/10 absolute" />
      </div>

      {/* Interactive Topology Container */}
      <div className="relative z-10 w-full max-w-2xl flex items-center justify-between px-2 sm:px-6 py-4 my-auto">
        {/* Node 1: Laptop (Client 1) */}
        <div className="flex flex-col items-center">
          <div
            className={`relative flex h-20 w-20 sm:h-24 sm:w-24 flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
              isAck1Delivered
                ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/50'
                : isP1Transmitting
                ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/50'
                : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
            }`}
          >
            <LaptopIcon size={36} color={isP1Transmitting || isAck1Delivered ? '#06b6d4' : '#94a3b8'} glow={isP1Transmitting} />
            <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white mt-1">STA-1 (Laptop)</span>
            <span className="text-[8px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Slot 1 · Uplink</span>

            {/* Transmission wave ring when active */}
            {isP1Transmitting && (
              <span className="absolute -inset-1.5 rounded-2xl border border-cyan-400/40 animate-ping pointer-events-none" />
            )}

            {/* ACK received badge */}
            {isAck1Delivered && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[8px] flex items-center gap-0.5 shadow-md">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>ACK ✓</span>
              </span>
            )}
          </div>
          <div className="mt-1 text-center">
            <span className="text-[9px] font-mono text-slate-500">
              {isAck1Delivered ? 'ACK Received ✓' : isP1Delivered ? 'Awaiting ACK...' : isP1Transmitting ? 'Sending Data...' : 'Queued (t=0s)'}
            </span>
          </div>
        </div>

        {/* Transmission Channel 1 (Laptop <-> BS) */}
        <div className="flex-1 mx-2 sm:mx-4 flex flex-col items-center relative">
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-visible flex items-center">
            {/* Guide line */}
            <div className="w-full h-full bg-gradient-to-r from-cyan-500/40 to-purple-500/40 rounded-full" />
            
            {/* 1. Animated Forward Data Packet: Laptop -> BS (t=0.00s to 1.80s) */}
            {isP1Transmitting && (
              <motion.div
                className="absolute -top-3.5 h-7 px-2 rounded-lg bg-cyan-400 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_12px_#22d3ee] border border-cyan-200 z-20 whitespace-nowrap"
                style={{
                  left: `${demoPacket1Progress * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                DATA [240b]
              </motion.div>
            )}

            {/* 2. Animated Return Trip ACK Packet: BS -> Laptop (t=1.80s to 3.00s) */}
            {isAck1Transmitting && (
              <motion.div
                className="absolute -top-3.5 h-7 px-2 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_14px_#10b981] border border-emerald-200 z-30 whitespace-nowrap"
                style={{
                  left: `${(1 - demoAck1Progress) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                ACK [16b]
              </motion.div>
            )}

            {isAck1Delivered && (
              <div className="absolute left-0 -top-2.5 h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            )}
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-2">
            Link 1: {isP1Transmitting ? 'Data (1.8s)' : isAck1Transmitting ? 'ACK Return (1.2s)' : isAck1Delivered ? 'Round-trip OK' : 'Idle'}
          </span>
        </div>

        {/* Center Node: Base Station (Coordinator) */}
        <div className="flex flex-col items-center">
          <div
            className={`relative flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
              deliveredPacketsCount > 0 || isP1Transmitting || isP2Transmitting
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)] ring-2 ring-purple-400/40'
                : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80'
            }`}
          >
            <BaseStationIcon size={44} color="#a855f7" glow={deliveredPacketsCount > 0} />
            <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white mt-0.5">BS-01 (Tower)</span>
            <span className="text-[8px] font-mono text-purple-700 dark:text-purple-300 font-semibold">Central Hub</span>

            {/* Signal Reception Halo */}
            {(isP1Transmitting || isP2Transmitting || isAck1Transmitting || isAck2Transmitting) && (
              <span className="absolute -inset-2 rounded-2xl border border-purple-400/30 animate-pulse pointer-events-none" />
            )}
          </div>
          <div className="mt-1 text-center">
            <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
              Delivered: {deliveredPacketsCount} / 2
            </span>
          </div>
        </div>

        {/* Transmission Channel 2 (BS <-> Phone) */}
        <div className="flex-1 mx-2 sm:mx-4 flex flex-col items-center relative">
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-visible flex items-center">
            {/* Guide line */}
            <div className="w-full h-full bg-gradient-to-r from-purple-500/40 to-emerald-500/40 rounded-full" />
            
            {/* 1. Animated Forward Data Packet: Phone -> BS (t=3.20s to 5.00s) */}
            {isP2Transmitting && (
              <motion.div
                className="absolute -top-3.5 h-7 px-2 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_12px_#34d399] border border-emerald-200 z-20 whitespace-nowrap"
                style={{
                  right: `${demoPacket2Progress * 100}%`,
                  transform: 'translateX(50%)',
                }}
              >
                DATA [240b]
              </motion.div>
            )}

            {/* 2. Animated Return Trip ACK Packet: BS -> Phone (t=5.00s to 6.20s) */}
            {isAck2Transmitting && (
              <motion.div
                className="absolute -top-3.5 h-7 px-2 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_14px_#10b981] border border-emerald-200 z-30 whitespace-nowrap"
                style={{
                  right: `${(1 - demoAck2Progress) * 100}%`,
                  transform: 'translateX(50%)',
                }}
              >
                ACK [16b]
              </motion.div>
            )}

            {isAck2Delivered && (
              <div className="absolute right-0 -top-2.5 h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            )}
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-2">
            Link 2: {isP2Transmitting ? 'Data (1.8s)' : isAck2Transmitting ? 'ACK Return (1.2s)' : isAck2Delivered ? 'Round-trip OK' : 'Idle'}
          </span>
        </div>

        {/* Node 2: Smartphone (Client 2) */}
        <div className="flex flex-col items-center">
          <div
            className={`relative flex h-20 w-20 sm:h-24 sm:w-24 flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
              isAck2Delivered
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                : isP2Transmitting
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/50'
                : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
            }`}
          >
            <SmartphoneIcon size={36} color={isP2Transmitting || isAck2Delivered ? '#10b981' : '#94a3b8'} glow={isP2Transmitting} />
            <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white mt-1">STA-2 (Phone)</span>
            <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Slot 2 · Uplink</span>

            {/* Transmission wave ring when active */}
            {isP2Transmitting && (
              <span className="absolute -inset-1.5 rounded-2xl border border-emerald-400/40 animate-ping pointer-events-none" />
            )}

            {/* ACK received badge */}
            {isAck2Delivered && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[8px] flex items-center gap-0.5 shadow-md">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>ACK ✓</span>
              </span>
            )}
          </div>
          <div className="mt-1 text-center">
            <span className="text-[9px] font-mono text-slate-500">
              {isAck2Delivered ? 'ACK Received ✓' : isP2Delivered ? 'Awaiting ACK...' : isP2Transmitting ? 'Sending Data...' : 'Queued (t=3.2s)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
