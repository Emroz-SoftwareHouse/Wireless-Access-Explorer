import React from 'react';
import { useApp } from '../context/AppContext';
import { EventType } from '../types';
import { 
  ListOrdered,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const EVENT_TYPE_STYLES: Record<EventType, { badge: string; dot: string; label: string }> = {
  DATA_PACKET: {
    badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
    label: 'Data Packet',
  },
  ACK_BURST: {
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    label: 'ACK Burst',
  },
  CONTROL_POLL: {
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
    dot: 'bg-purple-500 dark:bg-purple-400',
    label: 'Control Poll',
  },
  BEACON: {
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500 dark:bg-amber-400',
    label: 'Beacon Sync',
  },
  SYNCHRONIZE: {
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    dot: 'bg-blue-500 dark:bg-blue-400',
    label: 'Synchronize',
  },
  CONTENTION: {
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500 dark:bg-rose-400',
    label: 'Contention',
  },
  COLLISION: {
    badge: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/50',
    dot: 'bg-red-500',
    label: 'Collision 💥',
  },
  REQUEST: {
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500 dark:bg-amber-400',
    label: 'BW Request',
  },
  GRANT: {
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    label: 'BW Grant',
  },
  RETRANSMIT: {
    badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40',
    dot: 'bg-orange-500 dark:bg-orange-400',
    label: 'Backoff Retx',
  },
  DESPREAD: {
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40',
    dot: 'bg-purple-500 dark:bg-purple-400',
    label: 'Despread Code',
  },
  SYSTEM_IDLE: {
    badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30',
    dot: 'bg-slate-500 dark:bg-slate-400',
    label: 'System Idle',
  },
  NACK: {
    badge: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/40',
    dot: 'bg-red-500 dark:bg-red-400',
    label: 'NACK Burst',
  },
  SAMPLE: {
    badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/40',
    dot: 'bg-indigo-500 dark:bg-indigo-400',
    label: 'PCM Sample',
  },
};

export const SimulationPanel: React.FC = () => {
  const {
    events,
    isDemoActive,
    simTime,
    simPlaying,
    eventLogCollapsed,
    toggleEventLogCollapse,
  } = useApp();

  return (
    <div className={`border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080c17] text-slate-800 dark:text-slate-100 flex flex-col shrink-0 select-none rounded-t-xl overflow-hidden shadow-xs transition-all duration-200 ${
      eventLogCollapsed ? 'h-10' : 'h-52 sm:h-60'
    }`}>
      {/* 1. Event Log Header Toolbar */}
      <div 
        onClick={toggleEventLogCollapse}
        className="h-10 border-b border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-900/60 px-3 sm:px-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/80 transition-colors select-none"
      >
        {/* Left: Title & Captured count */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <ListOrdered className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
            Event Log & Protocol Telemetry
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 tabular-nums shrink-0">
            {events.length} captured
          </span>
        </div>

        {/* Right: Live Telemetry Indicator & Clock Sync & Collapse Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Activity className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-[11px]">
              {simPlaying ? 'Capturing Live Events' : 'Standby / Paused'}
            </span>
          </div>

          <div className="hidden sm:block h-3.5 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            Clock: <strong className="text-cyan-600 dark:text-cyan-400 tabular-nums">{simTime.toFixed(2)}s</strong>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleEventLogCollapse();
            }}
            title={eventLogCollapsed ? "Expand Event Log" : "Collapse Event Log"}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors ml-1"
          >
            {eventLogCollapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {!eventLogCollapsed && (
        <>
          {/* 2. Color-Coded Protocol Legend Row */}
          <div className="h-7 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950/40 px-4 flex items-center justify-between overflow-x-auto text-[10px] font-mono text-slate-600 dark:text-slate-400 scrollbar-none shrink-0">
            <span className="text-slate-500 uppercase font-semibold mr-2 shrink-0">
              Legend:
            </span>
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {Object.entries(EVENT_TYPE_STYLES).slice(0, 7).map(([typeKey, meta]) => (
                <div key={typeKey} className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                </div>
              ))}
            </div>
          </div>

      {/* 3. Timestamped Event Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="min-w-[620px] w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-100 dark:bg-[#090e1c] border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 z-10 select-none">
            <tr>
              <th className="py-1.5 px-3 w-12 text-center">No.</th>
              <th className="py-1.5 px-3 w-20">Time</th>
              <th className="py-1.5 px-3 w-36">Source</th>
              <th className="py-1.5 px-3 w-36">Destination</th>
              <th className="py-1.5 px-3 w-28">Type</th>
              <th className="py-1.5 px-3">Info</th>
              <th className="py-1.5 px-3 w-24 text-right">Size/Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-[11px]">
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                  {isDemoActive
                    ? 'Simulation ready. Click "Play" or "Step" in the canvas control bar above to run the multiple access transmission sequence.'
                    : 'Simulation ready. Use the docked controls on the canvas to transmit packets and observe protocol events.'}
                </td>
              </tr>
            ) : (
              events.map((evt, idx) => {
                const style = EVENT_TYPE_STYLES[evt.type] || EVENT_TYPE_STYLES.DATA_PACKET;
                return (
                  <tr
                    key={`sim-evt-row-${evt.no}-${evt.timestamp}-${idx}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="py-1.5 px-3 text-center text-slate-500 font-semibold tabular-nums">
                      {evt.no}
                    </td>
                    <td className="py-1.5 px-3 text-cyan-600 dark:text-cyan-400 font-bold tabular-nums">
                      {evt.timeFormatted}
                    </td>
                    <td className="py-1.5 px-3 text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={evt.source}>
                      {evt.source}
                    </td>
                    <td className="py-1.5 px-3 text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={evt.destination}>
                      {evt.destination}
                    </td>
                    <td className="py-1.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${style.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        <span>{style.label}</span>
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300 font-sans text-xs">
                      {evt.info}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {evt.sizeValue}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>
  );
};

