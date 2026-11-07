import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useMultipleAccess } from '../context/MultipleAccessSimulator';
import { CanvasViewMode, SimSpeed } from '../types';
import { MultipleAccessDemoCanvas } from './demo/MultipleAccessDemoCanvas';
import { MultipleAccessStage } from './multiple_access/MultipleAccessStage';
import { CATEGORIES } from '../data/topics';
import { 
  Network, 
  GitCommit, 
  Clock, 
  Layers, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Play, 
  Pause, 
  StepForward, 
  Gauge, 
  Activity,
  ZoomIn,
  ZoomOut,
  Focus,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Radio
} from 'lucide-react';

export const NetworkCanvas: React.FC = () => {
  const {
    selectedTopic,
    canvasView,
    setCanvasView,
    isDemoActive,
    simPlaying,
    simSpeed,
    simTime,
    playSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
    setSimSpeed,
    deliveredPacketsCount,
    setSelectedTopicId,
  } = useApp();

  const {
    mode,
    collisionsCount,
    deliveredCount: maDeliveredCount,
    devices,
  } = useMultipleAccess();

  // Maximize / Fullscreen state
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // Pan and Zoom state for comfortable view
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const categoryInfo = CATEGORIES[selectedTopic.categoryId];
  const isMultipleAccessTopic = selectedTopic.categoryId === 'multiple_access';
  const effectiveDelivered = isMultipleAccessTopic ? maDeliveredCount : (isDemoActive ? deliveredPacketsCount : 0);

  // Listen for ESC key to exit maximized mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  // Reset zoom & pan when topic changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [selectedTopic.id]);

  // Fit to View action
  const handleFitToView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))));
  };

  // Drag-to-pan handlers on canvas viewport background
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking on canvas background directly, not on interactive buttons
    if ((e.target as HTMLElement).closest('button, input, select, .no-pan')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const speeds: SimSpeed[] = [0.5, 1, 2];

  // Bottom comparison summary definitions
  const SUMMARY_MODES = [
    { id: 'fdma-mode', key: 'fdma', label: 'FDMA', formula: 'split by frequency (never collide)' },
    { id: 'tdma-mode', key: 'tdma', label: 'TDMA', formula: 'split by time (take turns)' },
    { id: 'cdma-mode', key: 'cdma', label: 'CDMA', formula: 'split by code (overlap OK)' },
    { id: 'dama-mode', key: 'dama', label: 'DAMA', formula: 'time slots granted on demand' },
    { id: 'unscheduled-contention-mode', key: 'contention', label: 'Contention', formula: 'no coordination (collisions happen)' },
  ];

  return (
    <>
      {/* Backdrop for Maximized Mode */}
      {isMaximized && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40 transition-opacity"
          onClick={() => setIsMaximized(false)}
        />
      )}

      {/* Main Canvas Container (Seamless transition between normal and maximized) */}
      {/* Main Canvas Container (Seamless transition between normal and maximized) */}
      <div
        className={`flex flex-col bg-white dark:bg-[#070b14] text-slate-800 dark:text-slate-100 rounded-2xl border transition-all duration-200 shadow-xl select-none ${
          isMaximized
            ? 'fixed inset-0 sm:inset-3 md:inset-6 z-50 rounded-none sm:rounded-2xl border-cyan-500/50 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden'
            : 'flex-1 min-w-0 min-h-[440px] sm:min-h-[480px] lg:min-h-[500px] border-slate-200 dark:border-slate-800/90 relative overflow-hidden'
        }`}
      >
        {/* 1. Header Toolbar */}
        <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d1c]/90 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
          {/* Left: Tabbed NETWORK / SEQUENCE view toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCanvasView('network')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                canvasView === 'network'
                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Network</span>
              <span className="xs:hidden">Net</span>
            </button>
            <button
              onClick={() => setCanvasView('sequence')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                canvasView === 'sequence'
                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              <GitCommit className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Sequence</span>
              <span className="xs:hidden">Seq</span>
            </button>
          </div>

          {/* Center: Context & Mode Info */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Section:</span>
            <span className={`text-[11px] font-semibold ${categoryInfo.accentText}`}>
              {selectedTopic.sectionRef}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-800 dark:text-slate-300 font-medium truncate max-w-[200px]">
              {selectedTopic.title}
            </span>
          </div>

          {/* Right: View Controls (Zoom, Fit to View, Maximize) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls & Fit to View */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 px-1.5 tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />
              <button
                onClick={handleFitToView}
                title="Fit to View / Re-center elements"
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
              >
                <Focus className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">Fit</span>
              </button>
            </div>

            {/* Maximize / Minimize Button */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Exit Fullscreen (Esc)' : 'Maximize Canvas (Fullscreen)'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
                isMaximized
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-sm hover:bg-amber-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {isMaximized ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Minimize</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Maximize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Interactive Main Canvas Stage (Supports Pan & Zoom without clipping) */}
        <div
          className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom/Pan Scaled Layer */}
          <div
            className="w-full h-full flex flex-col items-center justify-center transition-transform duration-75 origin-center"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            {isMultipleAccessTopic ? (
              // Phase 2 Simulator Stage (All 5 modes)
              <MultipleAccessStage />
            ) : isDemoActive ? (
              // Phase 1 Demo (Multiple Access Overview)
              <MultipleAccessDemoCanvas />
            ) : (
              // Dashed-Border Empty State Placeholder for other topics
              <div className="w-full h-full p-8 flex items-center justify-center no-pan">
                <div className="w-full max-w-xl border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center bg-slate-900/20 backdrop-blur-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-400 mb-3 shadow-lg">
                    <Layers className="h-7 w-7 text-cyan-400/70" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-[11px] font-mono text-cyan-400 mb-3">
                    <Clock className="h-3 w-3" />
                    <span>Coming in Later Phase</span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                    Animation for {selectedTopic.title}
                  </h3>

                  <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                    Interactive canvas and protocol simulation for this topic will be unlocked in upcoming development phases according to Stallings Chapter 11.
                  </p>

                  <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-left">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1.5 border-b border-slate-800/80 mb-2">
                      <span>Planned Stages:</span>
                      <span className="text-cyan-400">{selectedTopic.subSteps.length} Sections</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {selectedTopic.subSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                          <span className="font-mono text-slate-600 mt-0.5">#{idx + 1}</span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. DOCKED BOTTOM CONTROL BAR (Play, Step, Reset, Speed, Clock, Status) */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d1c] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 select-none">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Play / Pause Button */}
            <button
              onClick={simPlaying ? pauseSimulation : playSimulation}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm min-h-[42px] sm:min-h-[36px] ${
                simPlaying
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 hover:bg-amber-200 dark:hover:bg-amber-500/30'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold shadow-cyan-500/20'
              }`}
            >
              {simPlaying ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            {/* Step Button */}
            <button
              onClick={stepSimulation}
              title="Step forward to next simulated event"
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:text-white dark:hover:bg-slate-800 transition-colors min-h-[42px] sm:min-h-[36px] shadow-sm"
            >
              <StepForward className="h-4 w-4" />
              <span className="hidden xs:inline">Step</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={resetSimulation}
              title="Reset simulation to t = 0.00s"
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:text-white dark:hover:bg-slate-800 transition-colors min-h-[42px] sm:min-h-[36px] shadow-sm"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden xs:inline">Reset</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden xs:block" />

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Gauge className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 ml-1 hidden sm:block" />
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all min-h-[34px] sm:min-h-[28px] ${
                    simSpeed === s
                      ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Right: Clock & Real-Time Stats (Delivered & Collisions) */}
          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Live Clock */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500">CLOCK:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold tabular-nums">
                {simTime.toFixed(2)}s
              </span>
            </div>

            {/* Mode-Specific Status / Counter */}
            {mode === 'contention' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                <span>Collisions:</span>
                <strong className="text-rose-800 dark:text-white font-bold tabular-nums">{collisionsCount}</strong>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Delivered:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">{effectiveDelivered}</strong>
              </div>
            )}

            {/* Sim State Badge */}
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <span className={`h-1.5 w-1.5 rounded-full ${simPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
              <span>{simPlaying ? 'Transmitting' : 'Paused'}</span>
            </span>
          </div>
        </div>

        {/* 4. PINNED BOTTOM SUMMARY COMPARISON STRIP */}
        {(isMultipleAccessTopic || isDemoActive) && (
          <div className="w-full border-t border-slate-200 dark:border-slate-800/90 bg-slate-100/90 dark:bg-[#060a14] px-3 py-1.5 z-30">
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono scrollbar-none">
              <span className="text-slate-500 font-bold uppercase text-[10px] mr-1.5 shrink-0">
                Compare:
              </span>
              {SUMMARY_MODES.map((item, idx) => {
                const isActive = (isMultipleAccessTopic && mode === item.key) || (isDemoActive && item.key === 'overview');
                return (
                  <React.Fragment key={item.key}>
                    <button
                      onClick={() => setSelectedTopicId(item.id)}
                      className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] whitespace-nowrap transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-bold shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <strong className={isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}>{item.label}</strong>
                      <span className="text-slate-500 font-normal hidden lg:inline">= {item.formula}</span>
                    </button>
                    {idx < SUMMARY_MODES.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
