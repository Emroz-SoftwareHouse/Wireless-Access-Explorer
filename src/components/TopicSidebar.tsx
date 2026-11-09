import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_TOPICS, CATEGORIES } from '../data/topics';
import { CategoryId } from '../types';
import { TopicSidebarItem } from './TopicSidebarItem';
import { Search, X, BookOpen, Layers, PanelLeftClose, PanelLeftOpen, ChevronRight } from 'lucide-react';

const CATEGORY_TABS: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'multiple_access', label: 'Multiple Access' },
  { id: 'cordless', label: 'Cordless (11.1)' },
  { id: 'wll', label: 'WLL (11.2)' },
  { id: 'wimax', label: 'WiMAX & 802.16 (11.3)' },
];

export const TopicSidebar: React.FC = () => {
  const {
    selectedTopicId,
    setSelectedTopicId,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    completedTopicIds,
    activeSubStepIndex,
    setActiveSubStepIndex,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapse,
    selectSubStep,
  } = useApp();

  // Filter topics by category and search query
  const filteredTopics = useMemo(() => {
    return ALL_TOPICS.filter((topic) => {
      // Category filter
      if (selectedCategory !== 'all' && topic.categoryId !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        topic.title.toLowerCase().includes(q) ||
        topic.description.toLowerCase().includes(q) ||
        topic.subSteps.some((s) => s.toLowerCase().includes(q)) ||
        topic.specs.some(
          (sp) =>
            sp.label.toLowerCase().includes(q) ||
            sp.value.toLowerCase().includes(q)
        )
      );
    });
  }, [selectedCategory, searchQuery]);

  // Group filtered topics by category
  const groupedCategories = useMemo(() => {
    const categoriesToRender: CategoryId[] =
      selectedCategory === 'all'
        ? ['fundamentals', 'multiple_access', 'cordless', 'wll', 'wimax']
        : [selectedCategory];

    return categoriesToRender
      .map((catId) => {
        const topicsInCat = filteredTopics.filter((t) => t.categoryId === catId);
        return {
          categoryInfo: CATEGORIES[catId],
          topics: topicsInCat,
        };
      })
      .filter((group) => group.topics.length > 0);
  }, [filteredTopics, selectedCategory]);

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    // On mobile, auto-close drawer upon topic selection
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false);
    }
  };

  const handleSelectSubStep = (topicId: string, idx: number) => {
    selectSubStep(topicId, idx);
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#080c17] text-slate-800 dark:text-slate-100 select-none min-w-0 overflow-hidden">
      {/* Drawer Header on Mobile */}
      <div className="lg:hidden p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Syllabus Topics
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          aria-label="Close topics drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 1. Search Box with Desktop Collapse Toggle */}
      <div className="p-2.5 px-3 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080c17] flex items-center justify-between gap-2 relative z-20">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 30 topics..."
            className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <button
          onClick={toggleSidebarCollapse}
          title="Collapse sidebar to compact rail"
          className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Status Dot Legend Banner */}
      <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950/60 text-[10px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
        <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400 dark:text-slate-500">Legend:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title="Topic not started yet">
            <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 border border-slate-300 dark:border-slate-500/50" />
            <span>Not Started</span>
          </div>
          <div className="flex items-center gap-1" title="Currently active topic">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Active</span>
          </div>
          <div className="flex items-center gap-1" title="Topic completed">
            <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            <span className="text-cyan-700 dark:text-cyan-400 font-semibold">Done ✓</span>
          </div>
        </div>
      </div>

      {/* 3. Category Tabs */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isTabActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isTabActive
                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Grouped Topics Scrollable List */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-4">
        {groupedCategories.length === 0 ? (
          <div className="text-center py-10 px-4">
            <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400 font-medium">No matching topics found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try clearing your search query or switching categories</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          groupedCategories.map(({ categoryInfo, topics }) => (
            <div key={categoryInfo.id} className="space-y-2">
              {/* Category Group Header */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${categoryInfo.accentText}`}>
                    {categoryInfo.label}
                  </span>
                  {categoryInfo.sectionCode && (
                    <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {categoryInfo.sectionCode}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                  {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
                </span>
              </div>

              {/* Topic Cards */}
              <div className="space-y-1.5">
                {topics.map((topic) => (
                  <TopicSidebarItem
                    key={topic.id}
                    topic={topic}
                    categoryInfo={categoryInfo}
                    isSelected={selectedTopicId === topic.id}
                    isCompleted={completedTopicIds.has(topic.id)}
                    onSelect={handleSelectTopic}
                    activeSubStepIndex={activeSubStepIndex}
                    onSelectSubStep={(idx) => handleSelectSubStep(topic.id, idx)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-mono">30 Topics Loaded</span>
        <span className="text-cyan-600 dark:text-cyan-400/80 font-mono">Phase 3.5 Active</span>
      </div>
    </div>
  );

  const collapsedRailContent = (
    <div className="flex flex-col items-center h-full py-2.5 px-1 bg-white dark:bg-[#080c17] text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 select-none w-14">
      {/* Expand Button */}
      <button
        onClick={toggleSidebarCollapse}
        title="Expand syllabus sidebar"
        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors mb-3"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>

      {/* Mini Category Badges */}
      <div className="flex flex-col items-center gap-2 flex-1 overflow-y-auto scrollbar-none w-full">
        {CATEGORY_TABS.filter(t => t.id !== 'all').map((tab) => {
          const cat = CATEGORIES[tab.id as CategoryId];
          const isCatSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id);
                if (sidebarCollapsed) toggleSidebarCollapse();
              }}
              title={`${cat.label} (${cat.sectionCode || ''})`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all relative ${
                isCatSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md ring-2 ring-cyan-400'
                  : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab.id === 'fundamentals' && 'F'}
              {tab.id === 'multiple_access' && 'MA'}
              {tab.id === 'cordless' && '11.1'}
              {tab.id === 'wll' && '11.2'}
              {tab.id === 'wimax' && '11.3'}
            </button>
          );
        })}
      </div>

      {/* Active Topic Indicator Dot */}
      <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-1 w-full text-center">
        <div 
          className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" 
          title="Active topic running"
        />
        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
          30
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet In-Flow Sidebar (>= md) */}
      <aside className={`hidden md:flex flex-col transition-all duration-200 ${
        sidebarCollapsed ? 'w-14' : 'w-60 lg:w-64 xl:w-72 max-w-[280px]'
      } border-r border-slate-200 dark:border-slate-800 h-full shrink-0 overflow-hidden bg-white dark:bg-[#080c17]`}>
        {sidebarCollapsed ? collapsedRailContent : sidebarContent}
      </aside>

      {/* Mobile Full-Screen Slide-Out Drawer (< md) */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div className="relative w-80 max-w-[85vw] h-full z-10 shadow-2xl border-r border-slate-800 bg-white dark:bg-[#080c17] animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
