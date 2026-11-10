import React from 'react';
import { CheckCircle2, ListOrdered, PlayCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StepSequenceView: React.FC = () => {
  const {
    selectedTopic,
    activeSubStepIndex,
    selectSubStep,
    setCanvasView,
  } = useApp();

  return (
    <div className="no-pan h-full w-full overflow-y-auto bg-slate-50 px-4 py-5 dark:bg-[#070b14] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-cyan-500/15 p-2.5 text-cyan-600 dark:text-cyan-300">
            <ListOrdered className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Four-step explanation</div>
            <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{selectedTopic.title}</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">Choose a step to understand the story first, then open that exact point in the live simulation.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {selectedTopic.subSteps.map((step, index) => {
            const isActive = index === activeSubStepIndex;
            const isEarlier = index < activeSubStepIndex;
            return (
              <button
                key={step}
                type="button"
                aria-current={isActive ? 'step' : undefined}
                onClick={() => selectSubStep(selectedTopic.id, index)}
                className={`flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-500/5 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-cyan-700'
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${isActive ? 'bg-cyan-500 text-slate-950' : isEarlier ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {isEarlier ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                <span>
                  <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Step {index + 1}</span>
                  <span className="mt-1 block text-xs font-bold leading-relaxed text-slate-800 dark:text-slate-100">{step}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-cyan-400/30 bg-white p-4 dark:bg-slate-950/70 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Selected · Step {activeSubStepIndex + 1}</div>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{selectedTopic.subSteps[activeSubStepIndex]}</p>
          </div>
          <button
            type="button"
            onClick={() => setCanvasView('network')}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-cyan-400"
          >
            <PlayCircle className="h-4 w-4" />
            Open this step in simulation
          </button>
        </div>
      </div>
    </div>
  );
};
