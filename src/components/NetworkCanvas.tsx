import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useMultipleAccess } from '../context/MultipleAccessSimulator';
import { CanvasViewMode, SimSpeed } from '../types';
import { MultipleAccessDemoCanvas } from './demo/MultipleAccessDemoCanvas';
import { MultipleAccessStage } from './multiple_access/MultipleAccessStage';
import { OsiModelView } from './fundamentals/OsiModelView';
import { PcmVoiceView } from './fundamentals/PcmVoiceView';
import { MultipathLossView } from './fundamentals/MultipathLossView';
import { CrcArqView } from './fundamentals/CrcArqView';
import { SimpleTddView } from './cordless/SimpleTddView';
import { TdmaTddVsFdmaView } from './cordless/TdmaTddVsFdmaView';
import { DectArchitectureView } from './cordless/DectArchitectureView';
import { DpcmAdpcmView } from './cordless/DpcmAdpcmView';
import { MosComparisonView } from './cordless/MosComparisonView';
import { FdmaStage } from './multiple_access/FdmaStage';
import { TdmaStage } from './multiple_access/TdmaStage';
import { CdmaStage } from './multiple_access/CdmaStage';
import { DamaStage } from './multiple_access/DamaStage';
import { TheoryView } from './theory/TheoryView';
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
  Radio,
  BookOpen
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

  // Viewport container ref for measuring boundary limits
  const viewportRef = useRef<HTMLDivElement | null>(null);

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

  // Pan boundary clamp: keeps content within visible reach without drifting into the void
  const clampPan = useCallback((x: number, y: number, currentZoom: number): { x: number; y: number } => {
    if (!viewportRef.current) return { x, y };
    const rect = viewportRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;

    // Generous movement range proportional to viewport and zoom
    const maxPanX = Math.max(280, (width * 0.55) * currentZoom);
    const maxPanY = Math.max(180, (height * 0.55) * currentZoom);

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y)),
    };
  }, []);

  // Reset zoom & pan when topic or view mode changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [selectedTopic.id, canvasView]);

  // Fit to View action: restores default centered position
  const handleFitToView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((z) => {
      const next = Math.min(1.8, Number((z + 0.15).toFixed(2)));
      setPan((p) => clampPan(p.x, p.y, next));
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(0.65, Number((z - 0.15).toFixed(2)));
      setPan((p) => clampPan(p.x, p.y, next));
      return next;
    });
  };

  // Unified Pointer Drag-to-pan handlers (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on canvas background, not interactive buttons, inputs, sliders, or no-pan zones
    if ((e.target as HTMLElement).closest('button, input, select, a, .no-pan')) return;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const rawX = e.clientX - dragStartRef.current.x;
    const rawY = e.clientY - dragStartRef.current.y;
    const clamped = clampPan(rawX, rawY, zoom);
    setPan(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
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
            : 'flex-1 min-w-0 min-h-0 h-full border-slate-200 dark:border-slate-800/90 relative overflow-hidden'
        }`}
      >
        {/* 1. Header Toolbar (Net/Seq/Th tabs + Zoom/Fit/Max) */}
        <div className="h-11 sm:h-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d1c] px-3 sm:px-4 flex items-center justify-between shrink-0">
          {/* Left: Tabbed NETWORK / SEQUENCE / THEORY view toggle */}
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
            <button
              onClick={() => setCanvasView('theory')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                canvasView === 'theory'
                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Theory</span>
              <span className="xs:hidden">Th</span>
            </button>
          </div>

          {/* Center: Context & Mode Info */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Section:</span>
            <span className={`text-[11px] font-semibold ${categoryInfo.accentText}`}>
              {selectedTopic.sectionRef}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-800 dark:text-slate-300 font-medium truncate max-w-[180px]">
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

        {/* 2. Interactive Main Canvas Viewport (Fixed outer boundary with overflow: hidden) */}
        <div
          ref={viewportRef}
          className={`flex-1 min-h-0 relative overflow-hidden flex flex-col items-center justify-center touch-none select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {canvasView === 'theory' ? (
            // Stallings Textbook Theory (Scrollable document, bypasses pan/zoom transform)
            <TheoryView />
          ) : (
            // INNER PANNABLE / ZOOMABLE CONTENT LAYER (Transforms as a single unified layer)
            <div
              className={`w-full h-full flex flex-col items-center justify-center origin-center ${
                isDragging ? 'transition-none' : 'transition-transform duration-200 ease-out'
              }`}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                willChange: isDragging ? 'transform' : 'auto',
              }}
            >
              {selectedTopic.id === 'osi-model-basics' ? (
                // Phase 3.5 OSI 7-Layer Dual-Host Encapsulation & Decapsulation Simulation
                <OsiModelView />
              ) : selectedTopic.id === 'pcm-voice-digitization' ? (
                // Phase 3 PCM Voice Digitization Waveform & Quantizer
                <PcmVoiceView />
              ) : selectedTopic.id === 'multipath-free-space-loss' ? (
                // Phase 3 Multipath & Free-Space Loss Wavefront Simulator
                <MultipathLossView />
              ) : selectedTopic.id === 'crc-arq-error-control' ? (
                // Phase 3 CRC & ARQ Error Control Network Simulator
                <CrcArqView />
              ) : selectedTopic.id === 'time-division-duplex-simple-tdd' ? (
                // Phase 4 Cordless Systems: Simple TDD
                <SimpleTddView />
              ) : selectedTopic.id === 'tdma-tdd-vs-tdma-fdma' ? (
                // Phase 4 Cordless Systems: TDMA/TDD vs TDMA/FDMA
                <TdmaTddVsFdmaView />
              ) : selectedTopic.id === 'dect-protocol-architecture' ? (
                // Phase 4 Cordless Systems: DECT Architecture & MM Call Setup
                <DectArchitectureView />
              ) : selectedTopic.id === 'differential-quantization-dpcm-adpcm' ? (
                // Phase 4 Cordless Systems: DPCM & ADPCM
                <DpcmAdpcmView />
              ) : selectedTopic.id === 'mean-opinion-score-comparison' ? (
                // Phase 4 Cordless Systems: Mean Opinion Score Comparison
                <MosComparisonView />
              ) : selectedTopic.id === 'fdma-mode' ? (
                // Dedicated FDMA Multi-Lane RF Spectrum & Filter Bank Simulation
                <FdmaStage />
              ) : selectedTopic.id === 'tdma-mode' ? (
                // Dedicated TDMA Cyclic Frame & Queue Buffer Simulation
                <TdmaStage />
              ) : selectedTopic.id === 'cdma-mode' ? (
                // Dedicated CDMA Orthogonal Walsh Code & Mathematical Despreader Simulation
                <CdmaStage />
              ) : selectedTopic.id === 'dama-mode' ? (
                // Dedicated DAMA Demand-Assignment Request-Grant Protocol Simulation
                <DamaStage />
              ) : isMultipleAccessTopic ? (
                // Unscheduled Contention Mode (Pure ALOHA / CSMA Collision Arena)
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
          )}
        </div>

        {/* 3. DOCKED BOTTOM CONTROL BAR (Play, Step, Reset, Speed, Clock, Status) */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d1c] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <>
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
              </>
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
            {selectedTopic.id === 'osi-model-basics' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <Layers className="h-3.5 w-3.5 text-cyan-500" />
                <span>OSI Stack:</span>
                <strong className="text-cyan-600 dark:text-cyan-400 font-bold">7 Layers</strong>
              </div>
            ) : selectedTopic.id === 'pcm-voice-digitization' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <Radio className="h-3.5 w-3.5 text-cyan-500" />
                <span>Voice Stream:</span>
                <strong className="text-cyan-600 dark:text-cyan-400 font-bold">64 kbps DS0</strong>
              </div>
            ) : selectedTopic.id === 'multipath-free-space-loss' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <Activity className="h-3.5 w-3.5 text-cyan-500" />
                <span>Multipath:</span>
                <strong className="text-cyan-600 dark:text-cyan-400 font-bold">3 Waves</strong>
              </div>
            ) : selectedTopic.id === 'crc-arq-error-control' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>ARQ Link:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Active</strong>
              </div>
            ) : mode === 'contention' ? (
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
          <div className="w-full border-t border-slate-200 dark:border-slate-800/90 bg-slate-100/90 dark:bg-[#060a14] px-3 py-1.5 shrink-0">
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
