import React, { useState } from 'react';
import { Topic, CategoryInfo } from '../types';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

interface TopicSidebarItemProps {
  topic: Topic;
  categoryInfo: CategoryInfo;
  isSelected: boolean;
  isCompleted: boolean;
  onSelect: (id: string) => void;
  activeSubStepIndex: number;
  onSelectSubStep: (index: number) => void;
}

export const TopicSidebarItem: React.FC<TopicSidebarItemProps> = ({
  topic,
  categoryInfo,
  isSelected,
  isCompleted,
  onSelect,
  activeSubStepIndex,
  onSelectSubStep,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isSelected);

  // If topic is selected, keep it expanded
  const expanded = isSelected || isExpanded;

  return (
    <div
      className={`group rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'bg-cyan-50/80 dark:bg-slate-900/95 border-cyan-400 dark:border-cyan-500/50 shadow-md shadow-cyan-900/10 dark:shadow-cyan-950/40 ring-1 ring-cyan-400/40 dark:ring-cyan-500/30'
          : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700/80'
      }`}
    >
      {/* Top Header Row: Click to select topic */}
      <div className="flex items-start gap-2.5 p-3">
        {/* Status Dot */}
        <div className="pt-0.5 shrink-0">
          {isCompleted ? (
            <div 
              className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 shadow-[0_0_6px_rgba(6,182,212,0.4)]"
              title="Topic Completed"
            >
              <CheckCircle2 className="h-3 w-3" />
            </div>
          ) : isSelected ? (
            <div 
              className="h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse mt-0.5"
              title="Active Topic"
            />
          ) : (
            <div 
              className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600 border border-slate-300 dark:border-slate-500/50 mt-1"
              title="Not Started"
            />
          )}
        </div>

        {/* Content Details */}
        <div 
          onClick={() => onSelect(topic.id)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
              {String(topic.order).padStart(2, '0')}.
            </span>
            <span
              className={`text-xs font-semibold leading-tight tracking-tight transition-colors ${
                isSelected
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-800 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
              }`}
            >
              {topic.title}
            </span>
            {topic.isDemo ? (
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold tracking-wider">
                Demo
              </span>
            ) : topic.isImplemented ? (
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/40 font-semibold tracking-wider">
                Simulator
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 line-clamp-2">
            {topic.description}
          </p>
        </div>

        {/* Expand / Collapse Chevron Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          aria-label={expanded ? 'Collapse sub-steps' : 'Expand sub-steps'}
          className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${
              expanded ? 'rotate-90 text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          />
        </button>
      </div>

      {/* Expandable Sub-Steps List */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/40 px-3 py-2 rounded-b-xl space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
            <span>Syllabus Steps</span>
            <span className="text-slate-400 dark:text-slate-600">{topic.subSteps.length} Steps</span>
          </div>
          {topic.subSteps.map((step, idx) => {
            const isSubStepActive = isSelected && activeSubStepIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  onSelect(topic.id);
                  onSelectSubStep(idx);
                }}
                className={`flex items-start gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSubStepActive
                    ? 'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 font-medium'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded text-[10px] font-mono shrink-0 font-bold ${
                    isSubStepActive
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="leading-tight text-[11px] flex-1">{step}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
