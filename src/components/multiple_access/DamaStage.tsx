import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useMultipleAccess } from '../../context/MultipleAccessSimulator';
import { MathFormula } from '../common/MathFormula';
import { 
  Zap, 
  Send, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  Layers, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Server,
  RefreshCw
} from 'lucide-react';

interface DamaStationState {
  id: string;
  name: string;
  color: string;
  state: 'idle' | 'requesting' | 'granted' | 'transmitting' | 'completed';
  assignedChannel: number | null; // 1 to 4
  queueBits: number;
}

export const DamaStage: React.FC = () => {
  const { simTime, simPlaying } = useApp();
  const { sendPacket } = useMultipleAccess();

  // Active state machine for 4 client stations in DAMA protocol
  const [stations, setStations] = useState<DamaStationState[]>([
    { id: 'sta-1', name: 'Laptop 1 (STA-1)', color: '#06b6d4', state: 'idle', assignedChannel: null, queueBits: 0 },
    { id: 'sta-2', name: 'Smartphone (STA-2)', color: '#10b981', state: 'idle', assignedChannel: null, queueBits: 0 },
    { id: 'sta-3', name: 'Tablet (STA-3)', color: '#f59e0b', state: 'idle', assignedChannel: null, queueBits: 0 },
    { id: 'sta-4', name: 'Laptop 2 (STA-4)', color: '#ec4899', state: 'idle', assignedChannel: null, queueBits: 0 },
  ]);

  // Base Station Traffic Channel Pool (Channels 1 to 4)
  const [channelPool, setChannelPool] = useState<Array<{ channel: number; assignedTo: string | null; busy: boolean }>>([
    { channel: 1, assignedTo: null, busy: false },
    { channel: 2, assignedTo: null, busy: false },
    { channel: 3, assignedTo: null, busy: false },
    { channel: 4, assignedTo: null, busy: false },
  ]);

  // Request queue at Base Station
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  // Trigger Bandwidth Request (Phase 1)
  const handleRequestBandwidth = (staId: string) => {
    setStations((prev) =>
      prev.map((s) => (s.id === staId ? { ...s, state: 'requesting', queueBits: 1024 } : s))
    );
    setPendingRequests((prev) => (prev.includes(staId) ? prev : [...prev, staId]));
    sendPacket(staId); // Fires network packet in flight
  };

  // Trigger all stations
  const handleRequestAll = () => {
    stations.forEach((s) => {
      handleRequestBandwidth(s.id);
    });
  };

  // Base Station Scheduler Engine: checks pending requests every second and allocates idle channels
  useEffect(() => {
    if (pendingRequests.length === 0) return;

    const timer = setTimeout(() => {
      const nextStaId = pendingRequests[0];
      // Find first idle traffic channel
      const idleChanIdx = channelPool.findIndex((c) => !c.busy);

      if (idleChanIdx !== -1) {
        const chanNum = idleChanIdx + 1;

        // Allocate channel
        setChannelPool((prev) =>
          prev.map((c, i) => (i === idleChanIdx ? { ...c, busy: true, assignedTo: nextStaId } : c))
        );

        // Move station to 'granted' then 'transmitting'
        setStations((prev) =>
          prev.map((s) =>
            s.id === nextStaId ? { ...s, state: 'granted', assignedChannel: chanNum } : s
          )
        );

        // Remove from pending
        setPendingRequests((prev) => prev.slice(1));

        // After 1.5s transmitting, complete and free channel
        setTimeout(() => {
          setStations((prev) =>
            prev.map((s) => (s.id === nextStaId ? { ...s, state: 'transmitting' } : s))
          );

          setTimeout(() => {
            setStations((prev) =>
              prev.map((s) =>
                s.id === nextStaId ? { ...s, state: 'completed', assignedChannel: null, queueBits: 0 } : s
              )
            );
            setChannelPool((prev) =>
              prev.map((c, i) => (i === idleChanIdx ? { ...c, busy: false, assignedTo: null } : c))
            );
          }, 1800);
        }, 1000);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [pendingRequests, channelPool]);

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Header & DAMA Architecture Summary */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              DAMA Dedicated Simulation: Dynamic Request-Grant Reservation (§11.3.5)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRequestAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-bold hover:bg-amber-400 transition-all shadow-xs"
              title="All 4 stations request bandwidth simultaneously on the reservation control channel"
            >
              <Zap className="h-3 w-3" />
              <span>Queue All 4 Requests</span>
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Demand Assignment Multiple Access
            </span>
          </div>
        </div>

        {/* 4-Phase Protocol Cycle Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-amber-600 dark:text-amber-400 font-bold">1. Control Request:</span>
            <span className="text-slate-500 block text-[9px]">BW_REQ (16b) on mini-slot</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">2. BS Scheduler:</span>
            <span className="text-slate-500 block text-[9px]">Allocates idle traffic channel</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-purple-600 dark:text-purple-400 font-bold">3. Resource Grant:</span>
            <span className="text-slate-500 block text-[9px]">BW_GRANT sends channel token</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">4. Data Burst:</span>
            <span className="text-slate-500 block text-[9px]">Collision-free dedicated payload</span>
          </div>
        </div>
      </div>

      {/* 2. Split Channel Architecture: Control Channel vs Traffic Channel Pool */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* A. Control / Reservation Channel (Mini-Slots) */}
        <div className="p-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Radio className="h-4 w-4" />
              <span>Control Channel (Random Access Mini-Slots)</span>
            </span>
            <span className="text-[10px] text-slate-400">16 bits BW_REQ</span>
          </div>

          <p className="text-[11px] font-mono text-slate-500 leading-snug">
            Short, unslotted mini-channel used strictly for signaling. Client stations transmit lightweight reservation packets to request dedicated bandwidth from the central scheduler.
          </p>

          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[10px] font-mono flex items-center justify-between">
            <span>Pending Scheduler Queue:</span>
            <span className="font-bold text-amber-800 dark:text-amber-200">
              {pendingRequests.length > 0 ? `${pendingRequests.length} Requests Queued` : 'Queue Empty (Ready)'}
            </span>
          </div>
        </div>

        {/* B. Base Station Dynamic Traffic Channel Table */}
        <div className="p-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Server className="h-4 w-4" />
              <span>BS Traffic Channel Pool (Allocated on Demand)</span>
            </span>
            <span className="text-[10px] text-slate-400">Zero Contention</span>
          </div>

          {/* 4 Traffic Channel Status Badges */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            {channelPool.map((c) => {
              const assignedStation = stations.find((s) => s.id === c.assignedTo);
              return (
                <div
                  key={c.channel}
                  className={`p-2 rounded-lg border transition-all flex flex-col justify-between ${
                    c.busy
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Traffic Chan #{c.channel}</span>
                    <span className={`h-2 w-2 rounded-full ${c.busy ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  </div>
                  <span className="text-[9px] mt-1 font-bold">
                    {c.busy && assignedStation ? `Reserved for ${assignedStation.name.split(' ')[0]}` : 'Status: IDLE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 4 Client Stations with Interactive 4-Phase Handshake */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white">
            Client Transceivers & Reservation Status (Click "Request" to trigger handshake)
          </span>
          <span className="text-[10px] text-slate-400">Demand-Assignment Cycle</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stations.map((sta) => {
            const isBusy = sta.state !== 'idle' && sta.state !== 'completed';

            return (
              <div
                key={sta.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  sta.state === 'transmitting'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-400 shadow-sm'
                    : sta.state === 'granted'
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-400'
                    : sta.state === 'requesting'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 animate-pulse'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-9 w-9 rounded-xl flex items-center justify-center border shadow-xs"
                      style={{ borderColor: sta.color, backgroundColor: `${sta.color}15` }}
                    >
                      <Radio className="h-4 w-4" style={{ color: sta.color }} />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {sta.name}
                      </div>
                      <div className="text-[9.5px] font-mono text-slate-500">
                        Protocol State: <strong className="capitalize">{sta.state}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Request Button */}
                  <button
                    onClick={() => handleRequestBandwidth(sta.id)}
                    disabled={isBusy}
                    className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold text-slate-950 transition-all shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    style={{ backgroundColor: sta.color }}
                  >
                    <Send className="h-3 w-3" />
                    <span>Request BW</span>
                  </button>
                </div>

                {/* Handshake Progress Line */}
                <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500">
                    {sta.state === 'idle' && 'No bandwidth requested'}
                    {sta.state === 'requesting' && 'Transmitting 16b BW_REQ on Control Mini-Slot...'}
                    {sta.state === 'granted' && `Granted Traffic Chan #${sta.assignedChannel}! Preparing burst...`}
                    {sta.state === 'transmitting' && `Sending 1024b payload on Traffic Chan #${sta.assignedChannel} (Collision-Free!)`}
                    {sta.state === 'completed' && 'Delivered successfully! Traffic channel released.'}
                  </span>

                  {sta.state === 'transmitting' && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold animate-pulse">
                      BURSTING
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Theory Note */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
          <Info className="h-4 w-4 text-amber-500 shrink-0" />
          <span>DAMA Demand Assignment Protocol (Stallings §11.3.5 / IEEE 802.16):</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Unlike fixed-assignment systems (FDMA and TDMA FAMA), Demand Assignment Multiple Access (DAMA) reserves channels only when subscribers have active traffic to transmit. By separating signaling onto a <strong>contention-based reservation mini-slot</strong> and user data onto a <strong>collision-free scheduled traffic channel</strong>, DAMA achieves over 85% spectral efficiency under bursty internet traffic conditions.
        </p>
      </div>
    </div>
  );
};
