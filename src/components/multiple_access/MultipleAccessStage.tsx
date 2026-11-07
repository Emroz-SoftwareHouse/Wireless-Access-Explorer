import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useMultipleAccess } from '../../context/MultipleAccessSimulator';
import { useApp } from '../../context/AppContext';
import { 
  LaptopIcon, 
  SmartphoneIcon, 
  TabletIcon, 
  BaseStationIcon, 
  RouterIcon, 
  ServerIcon 
} from '../icons/DeviceIcons';
import { 
  Send, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Sparkles, 
  Zap, 
  Radio, 
  Clock, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { PacketInFlight, DeviceConfig, MultipleAccessMode } from '../../types';

// Render device icon helper
const DeviceGlyph: React.FC<{ type: string; color: string; size?: number; glow?: boolean }> = ({
  type,
  color,
  size = 28,
  glow = false,
}) => {
  switch (type) {
    case 'smartphone':
      return <SmartphoneIcon size={size} color={color} glow={glow} />;
    case 'tablet':
      return <TabletIcon size={size} color={color} glow={glow} />;
    case 'iot':
      return <RouterIcon size={size} color={color} glow={glow} />;
    case 'workstation':
      return <ServerIcon size={size} color={color} glow={glow} />;
    case 'laptop':
    case 'laptop2':
    default:
      return <LaptopIcon size={size} color={color} glow={glow} />;
  }
};

// Default fallback positions (normalized 0.0 to 1.0)
const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  bs: { x: 0.50, y: 0.50 },
  'sta-1': { x: 0.16, y: 0.28 },
  'sta-2': { x: 0.16, y: 0.72 },
  'sta-3': { x: 0.84, y: 0.28 },
  'sta-4': { x: 0.84, y: 0.72 },
  'sta-5': { x: 0.50, y: 0.14 },
  'sta-6': { x: 0.50, y: 0.86 },
};

export const MultipleAccessStage: React.FC = () => {
  const {
    mode,
    devices,
    packets,
    autoTraffic,
    setAutoTraffic,
    deliveredCount,
    extraDeviceCount,
    addExtraDevice,
    removeExtraDevice,
    sendPacket,
    sendAllPackets,
    tdmaCurrentSlot,
    tdmaSlotProgress,
    despreadingActive,
  } = useMultipleAccess();

  const {
    simTime,
    canvasView,
  } = useApp();

  // Container & node DOM references for real-time star topology measurement
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bsRef = useRef<HTMLDivElement | null>(null);
  const deviceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Dynamic measured node positions in percentage (0.0 to 1.0)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(DEFAULT_POSITIONS);

  // Measure exact center positions of all nodes relative to stageRef
  const updateNodePositions = useCallback(() => {
    if (!stageRef.current || !bsRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    if (stageRect.width === 0 || stageRect.height === 0) return;

    const bsRect = bsRef.current.getBoundingClientRect();
    const bsPos = {
      x: Math.min(1, Math.max(0, (bsRect.left + bsRect.width / 2 - stageRect.left) / stageRect.width)),
      y: Math.min(1, Math.max(0, (bsRect.top + bsRect.height / 2 - stageRect.top) / stageRect.height)),
    };

    const nextPos: Record<string, { x: number; y: number }> = { bs: bsPos };
    devices.forEach((dev) => {
      const el = deviceRefs.current[dev.id];
      if (el) {
        const dRect = el.getBoundingClientRect();
        nextPos[dev.id] = {
          x: Math.min(1, Math.max(0, (dRect.left + dRect.width / 2 - stageRect.left) / stageRect.width)),
          y: Math.min(1, Math.max(0, (dRect.top + dRect.height / 2 - stageRect.top) / stageRect.height)),
        };
      } else {
        nextPos[dev.id] = DEFAULT_POSITIONS[dev.id] || { x: 0.5, y: 0.5 };
      }
    });

    setNodePositions(nextPos);
  }, [devices]);

  // Recalibrate on resize and layout changes
  useEffect(() => {
    updateNodePositions();
    if (!stageRef.current) return;
    const observer = new ResizeObserver(() => {
      updateNodePositions();
    });
    observer.observe(stageRef.current);
    window.addEventListener('resize', updateNodePositions);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateNodePositions);
    };
  }, [updateNodePositions]);

  // Central Hub position
  const bsPos = nodePositions['bs'] || DEFAULT_POSITIONS['bs'];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-2 sm:p-3 select-none overflow-hidden text-slate-800 dark:text-slate-100">
      {/* 1. Sub-Toolbar: Mode Indicator, Auto-Traffic, Mash All, Add STA (Contention) */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Mode: {mode.toUpperCase()}</span>
          </span>

          <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">|</span>

          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 hidden sm:inline">
            {mode === 'fdma' && '4 Dedicated Frequency Sub-bands (f1-f4) · Star Topology'}
            {mode === 'tdma' && 'Rotating 2.0s Frame (4 Cyclic Slots) · Hub & Spoke'}
            {mode === 'cdma' && '4 Orthogonal Walsh Codes · Shared Star Carrier'}
            {mode === 'dama' && 'Dynamic Request-Grant Allocation (§11.3.5)'}
            {mode === 'contention' && 'Pure ALOHA Unscheduled Contention · Shared Hub'}
            {mode === 'overview' && 'Multi-User Access Taxonomy'}
          </span>
        </div>

        {/* Sub-toolbar Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Contention Mode: Add/Remove STA button */}
          {mode === 'contention' && (
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-900/50">
              <span className="text-[10px] font-mono text-rose-600 dark:text-rose-300 mr-0.5 hidden xs:inline">
                Stations: {devices.length}
              </span>
              <button
                onClick={addExtraDevice}
                disabled={extraDeviceCount >= 2}
                title="Add 5th/6th device to stress-test collisions"
                className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 rounded hover:bg-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
                <span>Add STA</span>
              </button>
              {extraDeviceCount > 0 && (
                <button
                  onClick={removeExtraDevice}
                  title="Remove extra station"
                  className="p-1 text-[10px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Minus className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Mash All Send (Concurrent Transmit) */}
          <button
            onClick={sendAllPackets}
            title="Trigger all client devices to transmit simultaneously"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
          >
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Mash All</span>
          </button>

          {/* Auto-Traffic Toggle Button */}
          <button
            onClick={() => setAutoTraffic(!autoTraffic)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
              autoTraffic
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-white dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${autoTraffic ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
            <span className="hidden xs:inline">Auto-Traffic:</span>
            <span>{autoTraffic ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* 2. TDMA Rotating Slot Timeline (Top banner when in TDMA mode) */}
      {mode === 'tdma' && (
        <div className="w-full max-w-xl mx-auto my-1 bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-md z-20 shrink-0">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-1 px-1">
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
              <Clock className="h-3 w-3" />
              <span>TDMA Frame (2.0s Period · 4 Slots)</span>
            </span>
            <span>
              Active Spoke: <strong className="text-slate-900 dark:text-white">Slot {tdmaCurrentSlot + 1} ({devices[tdmaCurrentSlot]?.shortName})</strong>
            </span>
          </div>

          <div className="relative h-6 w-full bg-slate-200 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-800 grid grid-cols-4 divide-x divide-slate-300 dark:divide-slate-800">
            {devices.slice(0, 4).map((dev, idx) => {
              const isCurrent = tdmaCurrentSlot === idx;
              return (
                <div
                  key={dev.id}
                  className={`flex items-center justify-center gap-1 text-[9px] font-mono transition-all duration-100 relative ${
                    isCurrent
                      ? 'bg-cyan-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold ring-1 ring-inset ring-cyan-500 shadow-sm'
                      : 'text-slate-500 bg-slate-100/60 dark:bg-slate-950/40'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dev.color }} />
                  <span>Slot {idx + 1}</span>

                  {isCurrent && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-cyan-500 transition-all duration-75"
                      style={{ width: `${tdmaSlotProgress * 100}%` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Main Interactive Canvas Stage */}
      <div className="flex-1 relative flex items-center justify-center min-h-[320px] overflow-hidden my-1">
        {canvasView === 'sequence' ? (
          /* SEQUENCE LADDER VIEW */
          <div className="w-full max-w-2xl h-full max-h-[320px] bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 overflow-y-auto font-mono text-xs shadow-md">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold uppercase">Time-Sequence Ladder</span>
              <span>Clock: <strong className="text-slate-900 dark:text-white">{simTime.toFixed(2)}s</strong></span>
            </div>

            <div className="grid grid-cols-5 gap-1 text-center py-2 border-b border-slate-200 dark:border-slate-800 text-[10px]">
              {devices.slice(0, 4).map((dev) => (
                <div key={dev.id} className="flex flex-col items-center">
                  <span className="truncate max-w-[80px] font-bold" style={{ color: dev.color }}>{dev.shortName}</span>
                </div>
              ))}
              <div className="flex flex-col items-center">
                <span className="font-bold text-purple-600 dark:text-purple-300">BS-01</span>
              </div>
            </div>

            <div className="py-2 space-y-1.5 text-[10px]">
              {packets.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  Click "Send Packet" on any device or turn on Auto-Traffic to view event arrows.
                </div>
              ) : (
                packets.map((pkt) => (
                  <div
                    key={pkt.id}
                    className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      pkt.collided
                        ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-300'
                        : pkt.type === 'ack'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">t={pkt.startTime.toFixed(2)}s</span>
                      <span className="font-bold truncate" style={{ color: pkt.color }}>{pkt.sourceName}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="font-semibold shrink-0" style={{ color: pkt.type === 'ack' ? pkt.color : '#a855f7' }}>
                        {pkt.direction === 'to_bs' ? 'BS-01' : pkt.deviceId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pkt.collided ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          <span>COLLISION</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {pkt.label} ({Math.round(pkt.progress * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* TRUE STAR / HUB-AND-SPOKE TOPOLOGY VIEW */
          <div 
            ref={stageRef} 
            className="relative w-full h-full max-w-4xl flex items-center justify-between p-2 sm:p-4 my-auto select-none overflow-hidden"
          >
            {/* SVG STAR TOPOLOGY SPOKES LAYER (Underneath cards, connects each device directly to BS-01 center) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#a855f7" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Shared Carrier Hub Rings for non-FDMA modes */}
              {mode !== 'fdma' && (
                <g>
                  {/* Central glowing hub ring around BS */}
                  <circle
                    cx={bsPos.x * 100}
                    cy={bsPos.y * 100}
                    r="8.5"
                    fill="url(#hubGlow)"
                    stroke="#06b6d4"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                    strokeOpacity="0.7"
                  />
                  <circle
                    cx={bsPos.x * 100}
                    cy={bsPos.y * 100}
                    r="11.5"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="0.4"
                    strokeOpacity="0.4"
                  />
                </g>
              )}

              {/* Individual Spoke Lines: Each connects one device directly to the Base Station Hub */}
              {devices.map((dev) => {
                const dPos = nodePositions[dev.id] || DEFAULT_POSITIONS[dev.id] || { x: 0.5, y: 0.5 };
                const isTdmaActiveSlot = mode === 'tdma' && tdmaCurrentSlot === dev.tdmaSlotIndex;
                const hasInFlightPacket = packets.some((p) => p.deviceId === dev.id);

                if (mode === 'fdma') {
                  /* FDMA: 4 Separate Dedicated Frequency Spokes */
                  return (
                    <g key={`spoke-fdma-${dev.id}`}>
                      {/* Wide Background Track Spoke */}
                      <line
                        x1={dPos.x * 100}
                        y1={dPos.y * 100}
                        x2={bsPos.x * 100}
                        y2={bsPos.y * 100}
                        stroke={dev.color}
                        strokeWidth="3.5"
                        strokeOpacity="0.25"
                        strokeLinecap="round"
                      />
                      {/* Crisp Core Spoke Line */}
                      <line
                        x1={dPos.x * 100}
                        y1={dPos.y * 100}
                        x2={bsPos.x * 100}
                        y2={bsPos.y * 100}
                        stroke={dev.color}
                        strokeWidth="1.5"
                        strokeOpacity="0.85"
                        strokeLinecap="round"
                      />
                      {/* Active Packet Propagation Wave */}
                      {hasInFlightPacket && (
                        <line
                          x1={dPos.x * 100}
                          y1={dPos.y * 100}
                          x2={bsPos.x * 100}
                          y2={bsPos.y * 100}
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                          strokeOpacity="0.9"
                          className="animate-pulse"
                        />
                      )}
                    </g>
                  );
                }

                /* TDMA / CDMA / DAMA / Contention: Direct Spoke into Central Hub */
                return (
                  <g key={`spoke-shared-${dev.id}`}>
                    {/* Background Conduit Spoke */}
                    <line
                      x1={dPos.x * 100}
                      y1={dPos.y * 100}
                      x2={bsPos.x * 100}
                      y2={bsPos.y * 100}
                      stroke={isTdmaActiveSlot ? '#a855f7' : hasInFlightPacket ? dev.color : '#64748b'}
                      strokeWidth={isTdmaActiveSlot ? '3.5' : hasInFlightPacket ? '3' : '2'}
                      strokeOpacity={isTdmaActiveSlot ? '0.4' : hasInFlightPacket ? '0.35' : '0.25'}
                      strokeLinecap="round"
                    />
                    {/* Core Line */}
                    <line
                      x1={dPos.x * 100}
                      y1={dPos.y * 100}
                      x2={bsPos.x * 100}
                      y2={bsPos.y * 100}
                      stroke={isTdmaActiveSlot ? '#a855f7' : hasInFlightPacket ? dev.color : '#94a3b8'}
                      strokeWidth={isTdmaActiveSlot ? '2' : '1.2'}
                      strokeOpacity={isTdmaActiveSlot ? '0.95' : hasInFlightPacket ? '0.9' : '0.6'}
                      strokeDasharray={isTdmaActiveSlot ? '2 2' : mode === 'cdma' ? '4 2' : undefined}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}
            </svg>

            {/* FDMA Spoke Frequency Badges: Explicitly placed along each device's spoke line */}
            {mode === 'fdma' && devices.slice(0, 4).map((dev) => {
              const dPos = nodePositions[dev.id] || DEFAULT_POSITIONS[dev.id];
              // Position label badge at 42% distance from device toward base station
              const labelX = (dPos.x + (bsPos.x - dPos.x) * 0.42) * 100;
              const labelY = (dPos.y + (bsPos.y - dPos.y) * 0.42) * 100;

              return (
                <div
                  key={`fdma-lane-label-${dev.id}`}
                  className="absolute pointer-events-none z-15 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-md transition-all whitespace-nowrap bg-white/95 dark:bg-slate-950/90"
                  style={{
                    left: `${labelX}%`,
                    top: `${labelY}%`,
                    transform: 'translate(-50%, -50%)',
                    color: dev.color,
                    borderColor: `${dev.color}80`,
                    boxShadow: `0 0 8px ${dev.color}30`,
                  }}
                >
                  <span>{dev.frequencyStr.split(' = ')[0]} · {dev.frequencyStr.split(' = ')[1]}</span>
                </div>
              );
            })}

            {/* Central Hub Label for Shared Modes */}
            {mode !== 'fdma' && (
              <div
                className="absolute pointer-events-none z-15 text-[8px] font-mono px-2 py-0.5 rounded-full border border-cyan-500/40 bg-white/90 dark:bg-slate-950/90 text-cyan-600 dark:text-cyan-400 font-semibold shadow-xs"
                style={{
                  left: `${bsPos.x * 100}%`,
                  top: `${(bsPos.y - 0.13) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span>2.15 GHz Shared Hub</span>
              </div>
            )}

            {/* IN-FLIGHT MOVING PACKETS (Mathematically anchored directly along the source-destination spoke) */}
            {packets.map((pkt) => {
              const dPos = nodePositions[pkt.deviceId] || DEFAULT_POSITIONS[pkt.deviceId] || { x: 0.5, y: 0.5 };
              const isFromBS = pkt.direction === 'from_bs';
              const isAck = pkt.type === 'ack';
              const isCollided = pkt.collided;

              // Compute precise current coordinates along the direct spoke segment
              let posX = dPos.x + (bsPos.x - dPos.x) * pkt.progress;
              let posY = dPos.y + (bsPos.y - dPos.y) * pkt.progress;

              if (isFromBS) {
                posX = bsPos.x + (dPos.x - bsPos.x) * pkt.progress;
                posY = bsPos.y + (dPos.y - bsPos.y) * pkt.progress;
              }

              // Collision Detonation rendering (Contention mode)
              if (isCollided) {
                const colP = pkt.collisionProgress || 0.60;
                const colX = (dPos.x + (bsPos.x - dPos.x) * colP) * 100;
                const colY = (dPos.y + (bsPos.y - dPos.y) * colP) * 100;

                return (
                  <motion.div
                    key={`col-${pkt.id}`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.25, 0], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.85 }}
                    className="absolute z-35 px-2 py-1 rounded-lg bg-rose-600 text-white border-2 border-rose-300 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_18px_#f43f5e] whitespace-nowrap pointer-events-none"
                    style={{
                      left: `${colX}%`,
                      top: `${colY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <span>💥 COLLISION CORRUPT</span>
                  </motion.div>
                );
              }

              // Normal packet badge riding precisely along the spoke
              return (
                <div
                  key={pkt.id}
                  className={`absolute z-30 h-7 px-2.5 rounded-lg flex items-center justify-center font-mono font-bold shadow-lg transition-transform border whitespace-nowrap text-[9px] sm:text-[10px] pointer-events-none ${
                    isAck
                      ? 'bg-emerald-500 text-slate-950 border-emerald-200 shadow-[0_0_14px_#10b981]'
                      : mode === 'cdma'
                      ? 'text-white border-white/70 shadow-md'
                      : 'text-slate-950 border-slate-900/30'
                  }`}
                  style={{
                    left: `${posX * 100}%`,
                    top: `${posY * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: isAck ? undefined : pkt.color,
                    borderColor: isAck ? undefined : mode === 'cdma' ? '#ffffff' : pkt.color,
                    boxShadow: `0 0 12px ${isAck ? '#10b981' : pkt.color}`,
                  }}
                >
                  <span>{pkt.label}</span>
                </div>
              );
            })}

            {/* LEFT COLUMN: STA-1 (Top-Left) & STA-2 (Bottom-Left) */}
            <div className="flex flex-col justify-around h-full py-1 sm:py-3 w-36 lg:w-44 gap-2 z-20 shrink-0">
              <div ref={(el) => { deviceRefs.current[devices[0].id] = el; }}>
                <CompactDeviceCard
                  device={devices[0]}
                  mode={mode}
                  onSend={() => sendPacket(devices[0].id)}
                />
              </div>

              <div ref={(el) => { deviceRefs.current[devices[1].id] = el; }}>
                <CompactDeviceCard
                  device={devices[1]}
                  mode={mode}
                  onSend={() => sendPacket(devices[1].id)}
                />
              </div>
            </div>

            {/* CENTER COLUMN: Central Base Station Node (The Hub of the Star) & Optional Contention Stations */}
            <div className="flex-1 h-full mx-1 sm:mx-3 flex flex-col items-center justify-between py-1 sm:py-2 relative min-w-0 z-20 pointer-events-none">
              {/* Optional Top-Center STA-5 (Contention mode only) */}
              {mode === 'contention' && devices.length > 4 ? (
                <div 
                  ref={(el) => { deviceRefs.current[devices[4].id] = el; }} 
                  className="z-20 w-full max-w-[190px] shrink-0 pointer-events-auto"
                >
                  <CompactDeviceCard
                    device={devices[4]}
                    mode={mode}
                    onSend={() => sendPacket(devices[4].id)}
                  />
                </div>
              ) : (
                <div className="h-6" />
              )}

              {/* Central Base Station Hub Node */}
              <div className="flex flex-col items-center my-auto z-20 pointer-events-auto shrink-0">
                <div
                  ref={bsRef}
                  className={`relative flex h-16 w-16 sm:h-20 sm:w-20 flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
                    despreadingActive || deliveredCount > 0
                      ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.5)] ring-2 ring-purple-400/50'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-lg'
                  }`}
                >
                  <BaseStationIcon size={32} color="#9333ea" glow={deliveredCount > 0 || despreadingActive} />
                  <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white mt-0.5">BS-01</span>
                  <span className="text-[8px] font-mono text-purple-700 dark:text-purple-300 font-semibold">Central Hub</span>

                  {deliveredCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center shadow-md">
                      {deliveredCount}
                    </span>
                  )}
                </div>

                {/* CDMA Despreading Notification Banner */}
                {mode === 'cdma' && (
                  <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/40 rounded-lg text-[9px] font-mono text-purple-900 dark:text-purple-200 truncate max-w-full shadow-xs">
                    <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="truncate">
                      {despreadingActive
                        ? 'Orthogonal Walsh Decode (Inner Product)'
                        : 'CDMA Orthogonal Separation (Zero Cross-Corr)'}
                    </span>
                  </div>
                )}

                {/* DAMA Status Banner */}
                {mode === 'dama' && (
                  <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 rounded-lg text-[9px] font-mono text-amber-900 dark:text-amber-200 truncate max-w-full shadow-xs">
                    <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">DAMA (§11.3.5): BW_REQ → GRANT → Data</span>
                  </div>
                )}
              </div>

              {/* Optional Bottom-Center STA-6 (Contention mode only) */}
              {mode === 'contention' && devices.length > 5 ? (
                <div 
                  ref={(el) => { deviceRefs.current[devices[5].id] = el; }} 
                  className="z-20 w-full max-w-[190px] shrink-0 pointer-events-auto"
                >
                  <CompactDeviceCard
                    device={devices[5]}
                    mode={mode}
                    onSend={() => sendPacket(devices[5].id)}
                  />
                </div>
              ) : (
                <div className="h-6" />
              )}
            </div>

            {/* RIGHT COLUMN: STA-3 (Top-Right) & STA-4 (Bottom-Right) */}
            <div className="flex flex-col justify-around h-full py-1 sm:py-3 w-36 lg:w-44 gap-2 z-20 shrink-0">
              <div ref={(el) => { deviceRefs.current[devices[2].id] = el; }}>
                <CompactDeviceCard
                  device={devices[2]}
                  mode={mode}
                  onSend={() => sendPacket(devices[2].id)}
                />
              </div>

              <div ref={(el) => { deviceRefs.current[devices[3].id] = el; }}>
                <CompactDeviceCard
                  device={devices[3]}
                  mode={mode}
                  onSend={() => sendPacket(devices[3].id)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact, non-overflowing Device Card with unclipped station title & ACK flash
const CompactDeviceCard: React.FC<{
  device: DeviceConfig;
  mode: MultipleAccessMode;
  onSend: () => void;
}> = ({ device, mode, onSend }) => {
  const isBackingOff = device.backoffTimer > 0;
  const isQueued = device.queueCount > 0;
  const hasRecentAck = device.recentAck;

  return (
    <div
      className={`relative p-2.5 rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900/95 shadow-sm flex-1 md:flex-none ${
        hasRecentAck
          ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-emerald-500/20'
          : isBackingOff
          ? 'border-rose-400 dark:border-rose-500/60 ring-1 ring-rose-500/30'
          : isQueued
          ? 'border-amber-400 dark:border-amber-500/60 ring-1 ring-amber-500/30'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: device.color,
      }}
    >
      {/* Device Header */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <DeviceGlyph type={device.deviceType} color={device.color} size={18} />
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
            {device.shortName}
          </span>
        </div>

        {/* Status Indicator */}
        {hasRecentAck ? (
          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold flex items-center gap-0.5 animate-bounce shadow-sm shrink-0">
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span>ACK ✓</span>
          </span>
        ) : isBackingOff ? (
          <span className="text-[8px] font-mono px-1 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shrink-0">
            {device.backoffTimer}s
          </span>
        ) : isQueued ? (
          <span className="text-[8px] font-mono px-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
            Q:{device.queueCount}
          </span>
        ) : (
          <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
            {mode === 'fdma' && device.frequencyStr.split(' ')[0]}
            {mode === 'tdma' && `S${device.tdmaSlotIndex + 1}`}
            {mode === 'cdma' && device.walshCodeStr.split(' ')[0]}
            {mode === 'dama' && (device.damaState === 'idle' ? 'Ready' : device.damaState)}
            {mode === 'contention' && 'STA'}
          </span>
        )}
      </div>

      {/* Mode Sub-Descriptor */}
      <div className="text-[9px] font-mono text-slate-600 dark:text-slate-400 mb-1.5 truncate">
        {mode === 'fdma' && device.frequencyStr}
        {mode === 'tdma' && device.tdmaSlotName}
        {mode === 'cdma' && device.walshCodeStr}
        {mode === 'dama' && (device.damaState === 'requesting' ? 'Requesting...' : 'Demand Ready')}
        {mode === 'contention' && (isBackingOff ? 'Backoff Retx' : 'Unscheduled')}
      </div>

      {/* Individual Send Packet Button */}
      <button
        onClick={onSend}
        disabled={isBackingOff}
        className={`w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all min-h-[36px] ${
          isBackingOff
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700/40'
            : 'hover:brightness-110 active:scale-95 shadow-sm text-slate-950'
        }`}
        style={{
          backgroundColor: isBackingOff ? undefined : device.color,
          boxShadow: isBackingOff ? undefined : `0 0 8px ${device.color}50`,
        }}
      >
        <Send className="h-3 w-3" />
        <span>Send</span>
      </button>
    </div>
  );
};
