import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  CategoryId, 
  Topic, 
  SimEvent, 
  SimSpeed, 
  CanvasViewMode, 
  AppTheme 
} from '../types';
import { ALL_TOPICS } from '../data/topics';

interface AppContextType {
  // Navigation & Topics
  selectedTopicId: string;
  setSelectedTopicId: (id: string) => void;
  selectedTopic: Topic;
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (category: CategoryId | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Progress & Completion
  completedTopicIds: Set<string>;
  toggleTopicCompleted: (id: string) => void;
  totalTopics: number;
  completedCount: number;
  progressPercent: number;

  // Mobile Drawer State
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  // Collapsible Panels (Desktop & Mobile)
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebarCollapse: () => void;
  overviewCollapsed: boolean;
  setOverviewCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleOverviewCollapse: () => void;
  mobileOverviewOpen: boolean;
  setMobileOverviewOpen: (open: boolean) => void;
  toggleMobileOverview: () => void;
  eventLogCollapsed: boolean;
  setEventLogCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleEventLogCollapse: () => void;

  // Active Sub-Step
  activeSubStepIndex: number;
  setActiveSubStepIndex: (index: number) => void;
  selectSubStep: (topicId: string, subStepIndex: number) => void;

  // Canvas View Mode
  canvasView: CanvasViewMode;
  setCanvasView: (mode: CanvasViewMode) => void;

  // Theme
  theme: AppTheme;
  toggleTheme: () => void;

  // Simulation Engine (generic & reusable)
  simPlaying: boolean;
  simSpeed: SimSpeed;
  simTime: number; // in seconds
  setSimTime: React.Dispatch<React.SetStateAction<number>>;
  deliveredPacketsCount: number;
  events: SimEvent[];
  playSimulation: () => void;
  pauseSimulation: () => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
  setSimSpeed: (speed: SimSpeed) => void;
  
  // Demo specific helpers
  isDemoActive: boolean;
  demoPacket1Progress: number; // 0 to 1
  demoAck1Progress: number; // 0 to 1
  demoPacket2Progress: number; // 0 to 1
  demoAck2Progress: number; // 0 to 1

  // Phase 3 Fundamentals States
  selectedOsiLayer: number | null;
  setSelectedOsiLayer: (layer: number | null) => void;
  multipathFreq: number;
  setMultipathFreq: (freq: number) => void;
  simulateBitError: boolean;
  setSimulateBitError: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | null>(null);

// Static placeholder dummy rows for non-demo topics
function getPlaceholderEvents(topic: Topic): SimEvent[] {
  return [
    {
      no: 1,
      timeFormatted: '0.00s',
      timestamp: 0.0,
      source: 'Transmitter',
      destination: 'Receiver',
      type: 'SYSTEM_IDLE',
      info: `Initial state for ${topic.title} [Phase 1 Skeleton]`,
      sizeValue: 'Ready',
    },
    {
      no: 2,
      timeFormatted: '0.25s',
      timestamp: 0.25,
      source: 'Control Unit',
      destination: 'Channel',
      type: 'CONTROL_POLL',
      info: `Parameter setup: ${topic.specs[0]?.label || 'Config'} = ${topic.specs[0]?.value || 'Default'}`,
      sizeValue: '32 b',
    },
    {
      no: 3,
      timeFormatted: '0.50s',
      timestamp: 0.5,
      source: 'Engine',
      destination: 'Scheduler',
      type: 'BEACON',
      info: 'Simulation engine hooked and awaiting Phase 2 event timeline logic',
      sizeValue: '64 b',
    },
  ];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Topics & Navigation
  const [selectedTopicId, setSelectedTopicIdState] = useState<string>('multiple-access-techniques-overview');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubStepIndex, setActiveSubStepIndex] = useState<number>(0);

  // Initial responsive state detection: default collapsed on tablet/mobile (<1280px)
  const isLargeDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1280 : true;

  // Collapsible Panels (Desktop & Tablet)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(!isLargeDesktop);
  const toggleSidebarCollapse = useCallback(() => setSidebarCollapsed(prev => !prev), []);

  const [overviewCollapsed, setOverviewCollapsed] = useState<boolean>(!isLargeDesktop);
  const toggleOverviewCollapse = useCallback(() => setOverviewCollapsed(prev => !prev), []);

  // Mobile Drawers (<768px): Only one open at a time!
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(prev => {
      if (!prev) setMobileOverviewOpen(false);
      return !prev;
    });
  }, []);

  const [mobileOverviewOpen, setMobileOverviewOpen] = useState<boolean>(false);
  const toggleMobileOverview = useCallback(() => {
    setMobileOverviewOpen(prev => {
      if (!prev) setMobileSidebarOpen(false);
      return !prev;
    });
  }, []);

  const [eventLogCollapsed, setEventLogCollapsed] = useState<boolean>(false);
  const toggleEventLogCollapse = useCallback(() => setEventLogCollapsed(prev => !prev), []);

  // Completion State (initialize with default topic completed = false, or track in state)
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(() => new Set<string>());

  // Canvas View Mode
  const [canvasView, setCanvasView] = useState<CanvasViewMode>('network');

  // Theme (default dark)
  const [theme, setTheme] = useState<AppTheme>('dark');

  // Simulation Engine State
  const [simPlaying, setSimPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<SimSpeed>(1);
  const [simTime, setSimTime] = useState<number>(0);
  const [deliveredPacketsCount, setDeliveredPacketsCount] = useState<number>(0);
  const [events, setEvents] = useState<SimEvent[]>([]);

  // Phase 3 Fundamentals States
  const [selectedOsiLayer, setSelectedOsiLayer] = useState<number | null>(null);
  const [multipathFreq, setMultipathFreq] = useState<number>(10.0);
  const [simulateBitError, setSimulateBitError] = useState<boolean>(false);

  // Find active topic
  const selectedTopic = useMemo(() => {
    return ALL_TOPICS.find(t => t.id === selectedTopicId) || ALL_TOPICS[3];
  }, [selectedTopicId]);

  const isMultipleAccessTopic = selectedTopic.categoryId === 'multiple_access' || selectedTopic.id === 'multiple-access-techniques-overview';
  const isDemoActive = selectedTopic.id === 'multiple-access-techniques-overview';

  // Toggle Theme handler
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  // Sync theme with DOM initially
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen for live simulation events with deduplication
  useEffect(() => {
    const handleSimEvent = (e: Event) => {
      const customEvt = (e as CustomEvent<SimEvent>).detail;
      setEvents(prev => {
        if (
          prev.length > 0 &&
          prev[0].type === customEvt.type &&
          prev[0].source === customEvt.source &&
          prev[0].destination === customEvt.destination &&
          prev[0].info === customEvt.info &&
          Math.abs(prev[0].timestamp - customEvt.timestamp) < 0.25
        ) {
          return prev;
        }
        return [customEvt, ...prev.slice(0, 49)];
      });
    };
    window.addEventListener('WIRELESS_SIM_EVENT', handleSimEvent);
    return () => window.removeEventListener('WIRELESS_SIM_EVENT', handleSimEvent);
  }, []);

  // Toggle Topic Completed
  const toggleTopicCompleted = useCallback((id: string) => {
    setCompletedTopicIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Select Topic handler
  const setSelectedTopicId = useCallback((id: string) => {
    setSelectedTopicIdState(id);
    setActiveSubStepIndex(0);
    // Reset simulation on topic switch
    setSimPlaying(false);
    setSimTime(0);
    setDeliveredPacketsCount(0);
    setSelectedOsiLayer(null);
    setSimulateBitError(false);
    const targetTopic = ALL_TOPICS.find(t => t.id === id);
    if (targetTopic && (targetTopic.categoryId === 'multiple_access' || targetTopic.id === 'multiple-access-techniques-overview' || targetTopic.isImplemented)) {
      setEvents([]);
    } else if (targetTopic) {
      setEvents(getPlaceholderEvents(targetTopic));
    }
  }, []);

  // Generic Sub-Step selection handler: scrubs simulation & scrolls Theory tab
  const selectSubStep = useCallback((topicId: string, subStepIndex: number) => {
    if (selectedTopicId !== topicId) {
      setSelectedTopicId(topicId);
    }
    setActiveSubStepIndex(subStepIndex);

    // Scrub simulation stage per topic
    if (topicId === 'osi-model-basics') {
      const times = [5.60, 4.00, 2.40, 0.00];
      setSimTime(times[subStepIndex] ?? 0);
      if (subStepIndex === 0) setSelectedOsiLayer(1);
      else if (subStepIndex === 1) setSelectedOsiLayer(2);
      else if (subStepIndex === 2) setSelectedOsiLayer(3);
      else setSelectedOsiLayer(7);
    } else if (topicId === 'pcm-voice-digitization') {
      const times = [0.00, 1.20, 2.40, 3.60];
      setSimTime(times[subStepIndex] ?? 0);
    } else if (topicId === 'multipath-free-space-loss') {
      const times = [0.00, 1.20, 2.40, 3.60];
      setSimTime(times[subStepIndex] ?? 0);
    } else if (topicId === 'crc-arq-error-control') {
      const times = [0.20, 1.20, 1.85, 2.40];
      setSimTime(times[subStepIndex] ?? 0);
    } else if (topicId === 'multiple-access-techniques-overview') {
      const times = [0.00, 1.80, 3.20, 5.00];
      setSimTime(times[subStepIndex] ?? 0);
    } else if (topicId === 'fdma-mode') {
      const times = [0.00, 1.00, 2.00, 3.00];
      setSimTime(times[subStepIndex] ?? 0);
      window.dispatchEvent(new CustomEvent('TRIGGER_SUBSTEP_ACTION', { detail: { mode: 'fdma', step: subStepIndex } }));
    } else if (topicId === 'tdma-mode') {
      const times = [0.00, 0.50, 1.00, 1.50];
      setSimTime(times[subStepIndex] ?? 0);
      window.dispatchEvent(new CustomEvent('TRIGGER_SUBSTEP_ACTION', { detail: { mode: 'tdma', step: subStepIndex } }));
    } else if (topicId === 'cdma-mode') {
      const times = [0.00, 0.80, 1.60, 2.40];
      setSimTime(times[subStepIndex] ?? 0);
      window.dispatchEvent(new CustomEvent('TRIGGER_SUBSTEP_ACTION', { detail: { mode: 'cdma', step: subStepIndex } }));
    } else if (topicId === 'dama-mode') {
      const times = [0.00, 1.00, 2.00, 3.20];
      setSimTime(times[subStepIndex] ?? 0);
      window.dispatchEvent(new CustomEvent('TRIGGER_SUBSTEP_ACTION', { detail: { mode: 'dama', step: subStepIndex } }));
    } else if (topicId === 'unscheduled-contention-mode') {
      const times = [0.00, 0.80, 1.60, 2.40];
      setSimTime(times[subStepIndex] ?? 0);
      window.dispatchEvent(new CustomEvent('TRIGGER_SUBSTEP_ACTION', { detail: { mode: 'contention', step: subStepIndex } }));
    } else if (topicId === 'time-division-duplex-simple-tdd') {
      const times = [0.00, 0.50, 1.00, 1.60];
      setSimTime(times[subStepIndex] ?? 0);
    } else if (topicId === 'tdma-tdd-vs-tdma-fdma') {
      const times = [0.50, 2.50, 4.00, 5.20];
      setSimTime(times[subStepIndex] ?? 0);
    } else if (topicId === 'dect-protocol-architecture') {
      const times = [0.00, 1.50, 3.00, 4.50];
      setSimTime(times[subStepIndex] ?? 0);
    } else if (topicId === 'differential-quantization-dpcm-adpcm') {
      const times = [0.00, 3.60, 7.20, 9.00];
      setSimTime(times[subStepIndex] ?? 0);
    } else if (topicId === 'mean-opinion-score-comparison') {
      const times = [0.00, 1.20, 2.40, 3.60];
      setSimTime(times[subStepIndex] ?? 0);
    }

    // Scroll Theory tab to matching concept if element exists
    setTimeout(() => {
      const el = document.getElementById(`theory-concept-${subStepIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  }, [selectedTopicId, setSelectedTopicId]);

  // Two-way synchronization: Keep activeSubStepIndex synced with live simulation stage
  useEffect(() => {
    if (!simPlaying) return;

    if (selectedTopicId === 'osi-model-basics') {
      const cycleTime = simTime % 12.8;
      const stage = Math.floor(cycleTime / 0.80);
      if (stage <= 1) setActiveSubStepIndex(3);
      else if (stage <= 4) setActiveSubStepIndex(2);
      else if (stage === 5) setActiveSubStepIndex(1);
      else if (stage <= 8) setActiveSubStepIndex(0);
      else if (stage === 9) setActiveSubStepIndex(1);
      else if (stage <= 12) setActiveSubStepIndex(2);
      else setActiveSubStepIndex(3);
    } else if (selectedTopicId === 'pcm-voice-digitization') {
      const step = Math.min(3, Math.floor((simTime % 4.8) / 1.2));
      setActiveSubStepIndex(step);
    } else if (selectedTopicId === 'multipath-free-space-loss') {
      const step = Math.min(3, Math.floor((simTime % 4.8) / 1.2));
      setActiveSubStepIndex(step);
    } else if (selectedTopicId === 'crc-arq-error-control') {
      const cycleTime = simTime % (simulateBitError ? 6.80 : 3.60);
      if (cycleTime < 1.0) setActiveSubStepIndex(0);
      else if (cycleTime < 1.8) setActiveSubStepIndex(1);
      else if (cycleTime < 2.2) setActiveSubStepIndex(2);
      else setActiveSubStepIndex(3);
    } else if (selectedTopicId === 'multiple-access-techniques-overview') {
      const t = simTime % 6.4;
      if (t < 1.8) setActiveSubStepIndex(0);
      else if (t < 3.2) setActiveSubStepIndex(1);
      else if (t < 5.0) setActiveSubStepIndex(2);
      else setActiveSubStepIndex(3);
    } else if (selectedTopicId === 'tdma-mode') {
      const slot = Math.floor((simTime % 2.0) / 0.5);
      setActiveSubStepIndex(Math.min(3, Math.max(0, slot)));
    } else if (selectedTopicId === 'time-division-duplex-simple-tdd') {
      const s = Math.min(3, Math.floor((simTime % 4.0) / 1.0));
      setActiveSubStepIndex(s);
    } else if (selectedTopicId === 'tdma-tdd-vs-tdma-fdma') {
      const s = Math.min(3, Math.floor((simTime % 6.0) / 1.5));
      setActiveSubStepIndex(s);
    } else if (selectedTopicId === 'dect-protocol-architecture') {
      const s = Math.min(3, Math.floor((simTime % 8.0) / 2.0));
      setActiveSubStepIndex(s);
    } else if (selectedTopicId === 'differential-quantization-dpcm-adpcm') {
      const s = Math.min(3, Math.floor((simTime % 10.8) / 2.7));
      setActiveSubStepIndex(s);
    } else if (selectedTopicId === 'mean-opinion-score-comparison') {
      const s = Math.min(3, Math.floor((simTime % 4.8) / 1.2));
      setActiveSubStepIndex(s);
    } else if (selectedTopic.categoryId === 'multiple_access') {
      const s = Math.min(3, Math.floor((simTime % 4.0) / 1.0));
      setActiveSubStepIndex(s);
    }
  }, [simTime, simPlaying, selectedTopicId, selectedTopic.categoryId, simulateBitError]);

  // Compute Demo Packet & ACK Travel Progress
  // Packet 1 travels from t = 0.00s to t = 1.80s (Laptop -> Base Station)
  const demoPacket1Progress = useMemo(() => {
    if (!isDemoActive) return 0;
    if (simTime < 0) return 0;
    if (simTime >= 1.80) return 1;
    return Math.min(1, Math.max(0, simTime / 1.80));
  }, [isDemoActive, simTime]);

  // ACK 1 travels from t = 1.80s to t = 3.00s (Base Station -> Laptop)
  const demoAck1Progress = useMemo(() => {
    if (!isDemoActive) return 0;
    if (simTime < 1.80) return 0;
    if (simTime >= 3.00) return 1;
    return Math.min(1, Math.max(0, (simTime - 1.80) / 1.20));
  }, [isDemoActive, simTime]);

  // Packet 2 travels from t = 3.20s to t = 5.00s (Phone -> Base Station)
  const demoPacket2Progress = useMemo(() => {
    if (!isDemoActive) return 0;
    if (simTime < 3.20) return 0;
    if (simTime >= 5.00) return 1;
    return Math.min(1, Math.max(0, (simTime - 3.20) / 1.80));
  }, [isDemoActive, simTime]);

  // ACK 2 travels from t = 5.00s to t = 6.20s (Base Station -> Phone)
  const demoAck2Progress = useMemo(() => {
    if (!isDemoActive) return 0;
    if (simTime < 5.00) return 0;
    if (simTime >= 6.20) return 1;
    return Math.min(1, Math.max(0, (simTime - 5.00) / 1.20));
  }, [isDemoActive, simTime]);

  // Simulation Clock Runner using requestAnimationFrame for ultra-smooth precision
  const lastTimestampRef = useRef<number | null>(null);
  const processedEventsRef = useRef<Set<number>>(new Set());

  // Reset simulation handler
  const resetSimulation = useCallback(() => {
    setSimPlaying(false);
    setSimTime(0);
    setDeliveredPacketsCount(0);
    processedEventsRef.current.clear();
    lastTimestampRef.current = null;
    setSelectedOsiLayer(null);
    if (isDemoActive || selectedTopic.categoryId === 'multiple_access' || selectedTopic.isImplemented) {
      setEvents([]);
    } else {
      setEvents(getPlaceholderEvents(selectedTopic));
    }
  }, [isDemoActive, selectedTopic]);

  const pauseSimulation = useCallback(() => {
    setSimPlaying(false);
    lastTimestampRef.current = null;
  }, []);

  const playSimulation = useCallback(() => {
    setSimPlaying(true);
    lastTimestampRef.current = null;
  }, []);

  // Step Simulation handler: Advances to next discrete event breakpoint
  const stepSimulation = useCallback(() => {
    setSimPlaying(false);
    lastTimestampRef.current = null;

    if (selectedTopic.id === 'osi-model-basics') {
      // Step advances one layer step (0.80s)
      setSimTime(prev => Number((prev + 0.80).toFixed(2)));
      return;
    }

    if (selectedTopic.id === 'pcm-voice-digitization') {
      // Step advances one sample (1.20s per sample)
      setSimTime(prev => Number((Math.floor(prev / 1.20 + 0.999) * 1.20).toFixed(2)));
      return;
    }

    if (selectedTopic.id === 'multipath-free-space-loss') {
      // Step advances by 0.40s
      setSimTime(prev => Number((prev + 0.40).toFixed(2)));
      return;
    }

    if (selectedTopic.id === 'crc-arq-error-control') {
      // Step advances by 0.60s
      setSimTime(prev => Number((prev + 0.60).toFixed(2)));
      return;
    }

    if (isMultipleAccessTopic && !isDemoActive) {
      setSimTime(prev => Number((prev + 0.50).toFixed(2)));
      return;
    }

    if (!isDemoActive) {
      setSimTime(prev => Number((prev + 0.25).toFixed(2)));
      return;
    }

    setSimTime(prev => {
      let nextTime = prev;
      if (prev < 0.001) {
        nextTime = 1.80; // P1 arrives at BS
      } else if (prev < 1.799) {
        nextTime = 1.80;
      } else if (prev < 2.999) {
        nextTime = 3.00; // ACK1 arrives at STA-1
      } else if (prev < 3.199) {
        nextTime = 3.20; // P2 starts
      } else if (prev < 4.999) {
        nextTime = 5.00; // P2 arrives at BS
      } else if (prev < 6.199) {
        nextTime = 6.20; // ACK2 arrives at STA-2
      } else if (prev < 6.399) {
        nextTime = 6.40; // Frame done
      } else {
        nextTime = 0.00;
        processedEventsRef.current.clear();
        setDeliveredPacketsCount(0);
        setEvents([]);
        return 0;
      }
      return nextTime;
    });
  }, [isDemoActive, isMultipleAccessTopic, selectedTopic.id]);

  // Handle Event Triggers based on simTime
  useEffect(() => {
    if (!isDemoActive) return;

    // Check milestones and emit events only once per cycle
    const p = processedEventsRef.current;

    // Event 1 at t >= 0.00s: Laptop sends Packet 1
    if (simTime >= 0.0 && !p.has(1)) {
      p.add(1);
      const e1: SimEvent = {
        no: 1,
        timeFormatted: '0.00s',
        timestamp: 0.0,
        source: 'Laptop (STA-1)',
        destination: 'Base Station (BS-01)',
        type: 'DATA_PACKET',
        info: 'Uplink Burst #1 (Slot 1) transmitted · RF Carrier 890.2 MHz (1.8s transit)',
        sizeValue: '240 bits',
      };
      setEvents(prev => [e1, ...prev.filter(item => item.no !== 1)]);
    }

    // Event 2 at t >= 1.80s: Packet 1 delivered to BS, BS emits ACK 1
    if (simTime >= 1.80 && !p.has(2)) {
      p.add(2);
      setDeliveredPacketsCount(1);
      const e2: SimEvent = {
        no: 2,
        timeFormatted: '1.80s',
        timestamp: 1.8,
        source: 'Base Station (BS-01)',
        destination: 'Laptop (STA-1)',
        type: 'ACK_BURST',
        info: 'Packet #1 decoded at BS · CRC VALID · Dispatched ACK burst to STA-1',
        sizeValue: '16 bits',
      };
      setEvents(prev => [e2, ...prev.filter(item => item.no !== 2)]);
    }

    // Event 2b at t >= 3.00s: ACK 1 delivered to Laptop! Round trip complete
    if (simTime >= 3.00 && !p.has(25)) {
      p.add(25);
      const e2b: SimEvent = {
        no: 3,
        timeFormatted: '3.00s',
        timestamp: 3.0,
        source: 'Laptop (STA-1)',
        destination: 'Base Station (BS-01)',
        type: 'SYNCHRONIZE',
        info: 'ACK #1 received at STA-1 · Round-trip transaction verified (3.0s RTT)',
        sizeValue: 'RTT Confirmed',
      };
      setEvents(prev => [e2b, ...prev.filter(item => item.no !== 3)]);
    }

    // Event 3 at t >= 3.20s: Packet 2 sent by Phone
    if (simTime >= 3.20 && !p.has(3)) {
      p.add(3);
      const e3: SimEvent = {
        no: 4,
        timeFormatted: '3.20s',
        timestamp: 3.2,
        source: 'Smartphone (STA-2)',
        destination: 'Base Station (BS-01)',
        type: 'DATA_PACKET',
        info: 'Uplink Burst #2 (Slot 2) transmitted · RF Carrier 890.2 MHz (1.8s transit)',
        sizeValue: '240 bits',
      };
      setEvents(prev => [e3, ...prev.filter(item => item.no !== 4)]);
    }

    // Event 4 at t >= 5.00s: Packet 2 delivered to BS, BS emits ACK 2
    if (simTime >= 5.00 && !p.has(4)) {
      p.add(4);
      setDeliveredPacketsCount(2);
      const e4: SimEvent = {
        no: 5,
        timeFormatted: '5.00s',
        timestamp: 5.0,
        source: 'Base Station (BS-01)',
        destination: 'Smartphone (STA-2)',
        type: 'ACK_BURST',
        info: 'Packet #2 decoded at BS · CRC VALID · Dispatched ACK burst to STA-2',
        sizeValue: '16 bits',
      };
      setEvents(prev => [e4, ...prev.filter(item => item.no !== 5)]);
    }

    // Event 4b at t >= 6.20s: ACK 2 delivered to Smartphone!
    if (simTime >= 6.20 && !p.has(45)) {
      p.add(45);
      const e4b: SimEvent = {
        no: 6,
        timeFormatted: '6.20s',
        timestamp: 6.2,
        source: 'Smartphone (STA-2)',
        destination: 'Base Station (BS-01)',
        type: 'SYNCHRONIZE',
        info: 'ACK #2 received at STA-2 · Round-trip transaction verified (3.0s RTT)',
        sizeValue: 'RTT Confirmed',
      };
      setEvents(prev => [e4b, ...prev.filter(item => item.no !== 6)]);
    }

    // Event 5 at t >= 6.40s: Frame completed, pause
    if (simTime >= 6.40 && !p.has(5)) {
      p.add(5);
      const e5: SimEvent = {
        no: 7,
        timeFormatted: '6.40s',
        timestamp: 6.4,
        source: 'Base Station (BS-01)',
        destination: 'All Subscribers',
        type: 'SYNCHRONIZE',
        info: 'TDMA frame cycle complete · 2/2 two-way round-trips verified',
        sizeValue: 'Frame End',
      };
      setEvents(prev => [e5, ...prev.filter(item => item.no !== 7)]);
      setSimPlaying(false);
    }
  }, [simTime, isDemoActive]);

  // Animation frame loop
  useEffect(() => {
    if (!simPlaying) return;

    let animId: number;

    const tick = (now: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = now;
      }
      const deltaSec = (now - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = now;

      setSimTime(prev => {
        const nextTime = prev + deltaSec * simSpeed;
        if (isDemoActive && nextTime >= 6.45) {
          return 6.40;
        }
        return nextTime;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [simPlaying, simSpeed, isDemoActive]);

  // Overall Learning Progress calculations
  const totalTopics = ALL_TOPICS.length;
  const completedCount = completedTopicIds.size;
  const progressPercent = Math.round((completedCount / totalTopics) * 100);

  return (
    <AppContext.Provider
      value={{
        selectedTopicId,
        setSelectedTopicId,
        selectedTopic,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        completedTopicIds,
        toggleTopicCompleted,
        totalTopics,
        completedCount,
        progressPercent,
        activeSubStepIndex,
        setActiveSubStepIndex,
        selectSubStep,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        toggleMobileSidebar,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebarCollapse,
        overviewCollapsed,
        setOverviewCollapsed,
        toggleOverviewCollapse,
        mobileOverviewOpen,
        setMobileOverviewOpen,
        toggleMobileOverview,
        eventLogCollapsed,
        setEventLogCollapsed,
        toggleEventLogCollapse,
        canvasView,
        setCanvasView,
        theme,
        toggleTheme,
        simPlaying,
        simSpeed,
        simTime,
        setSimTime,
        deliveredPacketsCount,
        events,
        playSimulation,
        pauseSimulation,
        stepSimulation,
        resetSimulation,
        setSimSpeed,
        isDemoActive,
        demoPacket1Progress,
        demoAck1Progress,
        demoPacket2Progress,
        demoAck2Progress,
        selectedOsiLayer,
        setSelectedOsiLayer,
        multipathFreq,
        setMultipathFreq,
        simulateBitError,
        setSimulateBitError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
