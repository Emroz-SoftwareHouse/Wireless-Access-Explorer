import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  MultipleAccessMode, 
  PacketInFlight, 
  DeviceConfig, 
  SimEvent, 
  EventType
} from '../types';
import { useApp } from './AppContext';

// Fixed Device Definitions across all modes
const BASE_DEVICES: DeviceConfig[] = [
  {
    id: 'sta-1',
    name: 'Laptop 1 (STA-1)',
    shortName: 'Laptop 1',
    deviceType: 'laptop',
    color: '#06b6d4', // Cyan
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-500',
    bgAccent: 'bg-cyan-500',
    frequencyStr: 'f1 = 2.150 GHz',
    bandwidthStr: '5 MHz BW',
    tdmaSlotIndex: 0,
    tdmaSlotName: 'Slot 1 (0.0s - 0.5s)',
    walshCodeStr: 'W1 = [+1, +1, +1, +1]',
    pattern: 'solid',
    queueCount: 0,
    backoffTimer: 0,
    damaState: 'idle',
    totalSent: 0,
    totalDelivered: 0,
    totalCollided: 0,
  },
  {
    id: 'sta-2',
    name: 'Smartphone (STA-2)',
    shortName: 'Smartphone',
    deviceType: 'smartphone',
    color: '#10b981', // Emerald
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500',
    bgAccent: 'bg-emerald-500',
    frequencyStr: 'f2 = 2.155 GHz',
    bandwidthStr: '5 MHz BW',
    tdmaSlotIndex: 1,
    tdmaSlotName: 'Slot 2 (0.5s - 1.0s)',
    walshCodeStr: 'W2 = [+1, -1, +1, -1]',
    pattern: 'dashes',
    queueCount: 0,
    backoffTimer: 0,
    damaState: 'idle',
    totalSent: 0,
    totalDelivered: 0,
    totalCollided: 0,
  },
  {
    id: 'sta-3',
    name: 'Tablet (STA-3)',
    shortName: 'Tablet',
    deviceType: 'tablet',
    color: '#f59e0b', // Amber
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500',
    bgAccent: 'bg-amber-500',
    frequencyStr: 'f3 = 2.160 GHz',
    bandwidthStr: '5 MHz BW',
    tdmaSlotIndex: 2,
    tdmaSlotName: 'Slot 3 (1.0s - 1.5s)',
    walshCodeStr: 'W3 = [+1, +1, -1, -1]',
    pattern: 'dots',
    queueCount: 0,
    backoffTimer: 0,
    damaState: 'idle',
    totalSent: 0,
    totalDelivered: 0,
    totalCollided: 0,
  },
  {
    id: 'sta-4',
    name: 'Laptop 2 (STA-4)',
    shortName: 'Laptop 2',
    deviceType: 'laptop2',
    color: '#ec4899', // Pink
    accentText: 'text-pink-400',
    accentBorder: 'border-pink-500',
    bgAccent: 'bg-pink-500',
    frequencyStr: 'f4 = 2.165 GHz',
    bandwidthStr: '5 MHz BW',
    tdmaSlotIndex: 3,
    tdmaSlotName: 'Slot 4 (1.5s - 2.0s)',
    walshCodeStr: 'W4 = [+1, -1, -1, +1]',
    pattern: 'stripes',
    queueCount: 0,
    backoffTimer: 0,
    damaState: 'idle',
    totalSent: 0,
    totalDelivered: 0,
    totalCollided: 0,
  },
];

// Extra devices for Contention mode stress-testing
const EXTRA_DEVICES: DeviceConfig[] = [
  {
    id: 'sta-5',
    name: 'IoT Sensor (STA-5)',
    shortName: 'IoT Sensor',
    deviceType: 'iot',
    color: '#8b5cf6', // Violet
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500',
    bgAccent: 'bg-purple-500',
    frequencyStr: 'f5 = 2.170 GHz',
    bandwidthStr: '5 MHz BW',
    tdmaSlotIndex: 0,
    tdmaSlotName: 'Slot 1 Contender',
    walshCodeStr: 'W5 = [+1, +1, +1, -1]',
    pattern: 'weave',
    queueCount: 0,
    backoffTimer: 0,
    damaState: 'idle',
    totalSent: 0,
    totalDelivered: 0,
    totalCollided: 0,
  },
  {
    id: 'sta-6',
    name: 'Workstation (STA-6)',
    shortName: 'Workstation',
    deviceType: 'workstation',
    color: '#38bdf8', // Sky Blue
    accentText: 'text-sky-400',
    accentBorder: 'border-sky-500',
    bgAccent: 'bg-sky-500',
    frequencyStr: 'f6 = 2.175 GHz',
    bandwidthStr: '5 MHz BW',
    tdmaSlotIndex: 1,
    tdmaSlotName: 'Slot 2 Contender',
    walshCodeStr: 'W6 = [+1, -1, -1, -1]',
    pattern: 'dots',
    queueCount: 0,
    backoffTimer: 0,
    damaState: 'idle',
    totalSent: 0,
    totalDelivered: 0,
    totalCollided: 0,
  },
];

const ALL_DEVICES = [...BASE_DEVICES, ...EXTRA_DEVICES];
const ALL_DEVICES_MAP = new Map(ALL_DEVICES.map((d) => [d.id, d]));

let globalEventSequence = 100;
let packetIdCounter = 1000;

interface MultipleAccessContextType {
  mode: MultipleAccessMode;
  devices: DeviceConfig[];
  packets: PacketInFlight[];
  autoTraffic: boolean;
  setAutoTraffic: (val: boolean) => void;
  collisionsCount: number;
  deliveredCount: number;
  extraDeviceCount: number;
  addExtraDevice: () => void;
  removeExtraDevice: () => void;
  sendPacket: (deviceId: string) => void;
  sendAllPackets: () => void;
  tdmaCurrentSlot: number;
  tdmaSlotProgress: number; // 0 to 1
  tdmaFramePeriod: number; // 2.0s
  damaPendingRequests: string[];
  despreadingActive: boolean;
  recentCollisionPoint: { x: number; y: number } | null;
}

const MultipleAccessContext = createContext<MultipleAccessContextType | null>(null);

export const MultipleAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    selectedTopic,
    simTime,
    simPlaying,
  } = useApp();

  // Resolve multiple access mode from active topic ID
  const mode: MultipleAccessMode = useMemo(() => {
    switch (selectedTopic.id) {
      case 'fdma-mode':
        return 'fdma';
      case 'tdma-mode':
        return 'tdma';
      case 'cdma-mode':
        return 'cdma';
      case 'dama-mode':
        return 'dama';
      case 'unscheduled-contention-mode':
        return 'contention';
      case 'multiple-access-techniques-overview':
      default:
        return 'overview';
    }
  }, [selectedTopic.id]);

  // Devices state (starts with 4 base devices, contention can add up to 2 extra)
  const [extraDeviceCount, setExtraDeviceCount] = useState<number>(0);
  const [deviceStats, setDeviceStats] = useState<Record<string, {
    queueCount: number;
    backoffTimer: number;
    damaState: 'idle' | 'requesting' | 'granted' | 'sending';
    totalSent: number;
    totalDelivered: number;
    totalCollided: number;
    recentAck?: boolean;
  }>>({});

  // Stable ref for deviceStats so effects and timers can read it without dependency recursion
  const deviceStatsRef = useRef(deviceStats);
  deviceStatsRef.current = deviceStats;

  // Auto-traffic toggle (default true for Contention mode, false for others)
  const [autoTraffic, setAutoTraffic] = useState<boolean>(() => mode === 'contention');

  // Packets in flight
  const [packets, setPackets] = useState<PacketInFlight[]>([]);
  const packetsRef = useRef(packets);
  packetsRef.current = packets;

  const [collisionsCount, setCollisionsCount] = useState<number>(0);
  const [deliveredCount, setDeliveredCount] = useState<number>(0);
  const [despreadingActive, setDespreadingActive] = useState<boolean>(false);
  const [recentCollisionPoint, setRecentCollisionPoint] = useState<{ x: number; y: number } | null>(null);

  // DAMA request queue at Base Station
  const [damaPendingRequests, setDamaPendingRequests] = useState<string[]>([]);

  // Stable ref to simTime
  const simTimeRef = useRef(simTime);
  simTimeRef.current = simTime;

  // Log event helper: Uses queueMicrotask to ensure AppProvider state updates NEVER run during render
  const logEvent = useCallback((
    source: string,
    destination: string,
    type: EventType,
    info: string,
    sizeValue: string
  ) => {
    const evt: SimEvent = {
      no: ++globalEventSequence,
      timeFormatted: `${simTimeRef.current.toFixed(2)}s`,
      timestamp: simTimeRef.current,
      source,
      destination,
      type,
      info,
      sizeValue,
    };
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', { detail: evt }));
    });
  }, []);

  // Sync autoTraffic default on mode change
  useEffect(() => {
    setAutoTraffic(mode === 'contention');
    setPackets([]);
    setCollisionsCount(0);
    setDeliveredCount(0);
    setExtraDeviceCount(0);
    setDamaPendingRequests([]);
    setDespreadingActive(false);
    setRecentCollisionPoint(null);
    setDeviceStats({});
    nextAutoSendTimesRef.current = {};
    lastDrainedSlotRef.current = -1;
  }, [mode]);

  // Handle explicit Reset when simTime returns to 0
  const prevSimTimeRef = useRef(simTime);
  useEffect(() => {
    if (simTime === 0 && prevSimTimeRef.current > 0) {
      setPackets([]);
      setCollisionsCount(0);
      setDeliveredCount(0);
      setDamaPendingRequests([]);
      setDespreadingActive(false);
      setRecentCollisionPoint(null);
      setDeviceStats({});
      nextAutoSendTimesRef.current = {};
      lastDrainedSlotRef.current = -1;
    }
    prevSimTimeRef.current = simTime;
  }, [simTime]);

  // Build active devices list
  const devices: DeviceConfig[] = useMemo(() => {
    const list = [...BASE_DEVICES];
    if (mode === 'contention' && extraDeviceCount > 0) {
      list.push(...EXTRA_DEVICES.slice(0, extraDeviceCount));
    }
    return list.map((dev) => {
      const stats = deviceStats[dev.id] || {
        queueCount: 0,
        backoffTimer: 0,
        damaState: 'idle',
        totalSent: 0,
        totalDelivered: 0,
        totalCollided: 0,
      };
      return {
        ...dev,
        ...stats,
      };
    });
  }, [mode, extraDeviceCount, deviceStats]);

  // TDMA Rotating Slot Calculations
  const tdmaFramePeriod = 2.0;
  const timeInFrame = simTime % tdmaFramePeriod;
  const tdmaCurrentSlot = Math.min(3, Math.floor(timeInFrame / 0.5));
  const tdmaSlotProgress = (timeInFrame % 0.5) / 0.5;

  // Send packet action: Uses static device definitions and simTimeRef so its callback identity is completely stable
  const sendPacket = useCallback((deviceId: string) => {
    const devStatic = ALL_DEVICES_MAP.get(deviceId);
    if (!devStatic) return;

    const tNow = simTimeRef.current;
    const packetDuration = 1.80; // 1.80s simulated duration for clear visual tracking

    if (mode === 'fdma') {
      const laneIdx = BASE_DEVICES.findIndex((d) => d.id === deviceId);
      const newPkt: PacketInFlight = {
        id: `pkt-${++packetIdCounter}-${devStatic.id}`,
        deviceId: devStatic.id,
        sourceName: devStatic.name,
        type: 'data',
        pattern: devStatic.pattern,
        laneIndex: laneIdx >= 0 ? laneIdx : 0,
        startTime: tNow,
        duration: packetDuration,
        progress: 0,
        color: devStatic.color,
        label: `DATA [${devStatic.frequencyStr.split(' ')[0]}]`,
        sizeBits: 240,
        direction: 'to_bs',
      };
      setPackets((prev) => [...prev, newPkt]);
      logEvent(
        devStatic.name,
        'Base Station (BS-01)',
        'DATA_PACKET',
        `Transmitted on dedicated ${devStatic.frequencyStr} (${devStatic.bandwidthStr}) with zero interference`,
        '240 bits'
      );
    } else if (mode === 'tdma') {
      const curTime = tNow % 2.0;
      const curSlot = Math.min(3, Math.floor(curTime / 0.5));
      const isMySlot = curSlot === devStatic.tdmaSlotIndex;

      if (isMySlot) {
        const newPkt: PacketInFlight = {
          id: `pkt-${++packetIdCounter}-${devStatic.id}`,
          deviceId: devStatic.id,
          sourceName: devStatic.name,
          type: 'data',
          pattern: 'solid',
          laneIndex: 0,
          startTime: tNow,
          duration: packetDuration,
          progress: 0,
          color: devStatic.color,
          label: `SLOT-${devStatic.tdmaSlotIndex + 1} [240b]`,
          sizeBits: 240,
          direction: 'to_bs',
        };
        setPackets((prev) => [...prev, newPkt]);
        logEvent(
          devStatic.name,
          'Base Station (BS-01)',
          'DATA_PACKET',
          `Dispatched during assigned Slot ${devStatic.tdmaSlotIndex + 1} on shared 2.15 GHz carrier`,
          '240 bits'
        );
      } else {
        // Enqueue at device
        setDeviceStats((prev) => {
          const cur = prev[devStatic.id] || {
            queueCount: 0,
            backoffTimer: 0,
            damaState: 'idle' as const,
            totalSent: 0,
            totalDelivered: 0,
            totalCollided: 0,
          };
          return {
            ...prev,
            [devStatic.id]: {
              ...cur,
              queueCount: cur.queueCount + 1,
            },
          };
        });
        logEvent(
          devStatic.name,
          'Local Buffer',
          'SYSTEM_IDLE',
          `Frame slot occupied by Slot ${curSlot + 1}. Packet queued awaiting Slot ${devStatic.tdmaSlotIndex + 1}`,
          'Queued'
        );
      }
    } else if (mode === 'cdma') {
      const newPkt: PacketInFlight = {
        id: `pkt-${++packetIdCounter}-${devStatic.id}`,
        deviceId: devStatic.id,
        sourceName: devStatic.name,
        type: 'data',
        pattern: devStatic.pattern,
        laneIndex: 0,
        startTime: tNow,
        duration: packetDuration,
        progress: 0,
        color: devStatic.color,
        label: `CDMA [${devStatic.walshCodeStr.split(' ')[0]}]`,
        sizeBits: 240,
        direction: 'to_bs',
      };
      setPackets((prev) => [...prev, newPkt]);
      logEvent(
        devStatic.name,
        'Base Station (BS-01)',
        'DATA_PACKET',
        `Direct-sequence spread using ${devStatic.walshCodeStr}. Transmitting across shared 2.15 GHz spectrum`,
        '240 b × 4 chips'
      );
    } else if (mode === 'dama') {
      setDeviceStats((prev) => {
        const cur = prev[devStatic.id] || {
          queueCount: 0,
          backoffTimer: 0,
          damaState: 'idle' as const,
          totalSent: 0,
          totalDelivered: 0,
          totalCollided: 0,
        };
        return {
          ...prev,
          [devStatic.id]: {
            ...cur,
            damaState: 'requesting',
          },
        };
      });

      const reqPkt: PacketInFlight = {
        id: `req-${++packetIdCounter}-${devStatic.id}`,
        deviceId: devStatic.id,
        sourceName: devStatic.name,
        type: 'request',
        pattern: 'dots',
        laneIndex: 0,
        startTime: tNow,
        duration: 1.00,
        progress: 0,
        color: devStatic.color,
        label: 'BW_REQ [16b]',
        sizeBits: 16,
        direction: 'to_bs',
      };
      setPackets((prev) => [...prev, reqPkt]);
      logEvent(
        devStatic.name,
        'Base Station (BS-01)',
        'REQUEST',
        `Transmitted Bandwidth Request mini-slot (16 b) to BS scheduler`,
        '16 bits'
      );
    } else {
      // Contention (Pure ALOHA)
      const newPkt: PacketInFlight = {
        id: `pkt-${++packetIdCounter}-${devStatic.id}`,
        deviceId: devStatic.id,
        sourceName: devStatic.name,
        type: 'data',
        pattern: 'solid',
        laneIndex: 0,
        startTime: tNow,
        duration: packetDuration,
        progress: 0,
        color: devStatic.color,
        label: `DATA [${devStatic.shortName}]`,
        sizeBits: 240,
        direction: 'to_bs',
      };
      setPackets((prev) => [...prev, newPkt]);
      logEvent(
        devStatic.name,
        'Shared Channel',
        'CONTENTION',
        `Unscheduled transmission initiated without carrier sensing`,
        '240 bits'
      );
    }
  }, [mode, logEvent]);

  // Send all packets concurrently
  const sendAllPackets = useCallback(() => {
    const list = [...BASE_DEVICES];
    if (mode === 'contention' && extraDeviceCount > 0) {
      list.push(...EXTRA_DEVICES.slice(0, extraDeviceCount));
    }
    list.forEach((dev) => {
      sendPacket(dev.id);
    });
  }, [mode, extraDeviceCount, sendPacket]);

  // Contention: Add / Remove Extra Devices
  const addExtraDevice = useCallback(() => {
    setExtraDeviceCount((prev) => Math.min(2, prev + 1));
  }, []);

  const removeExtraDevice = useCallback(() => {
    setExtraDeviceCount((prev) => Math.max(0, prev - 1));
  }, []);

  // TDMA Queue auto-drain when playhead enters a device's slot
  const lastDrainedSlotRef = useRef<number>(-1);
  useEffect(() => {
    if (mode !== 'tdma') {
      lastDrainedSlotRef.current = -1;
      return;
    }
    if (tdmaCurrentSlot === lastDrainedSlotRef.current) return;
    lastDrainedSlotRef.current = tdmaCurrentSlot;

    const targetDev = BASE_DEVICES.find((d) => d.tdmaSlotIndex === tdmaCurrentSlot);
    if (!targetDev) return;

    const curStats = deviceStatsRef.current[targetDev.id];
    if (curStats && curStats.queueCount > 0) {
      setDeviceStats((prev) => {
        const p = prev[targetDev.id];
        if (!p || p.queueCount <= 0) return prev;
        return {
          ...prev,
          [targetDev.id]: {
            ...p,
            queueCount: p.queueCount - 1,
          },
        };
      });

      const tNow = simTimeRef.current;
      const newPkt: PacketInFlight = {
        id: `pkt-${++packetIdCounter}-${targetDev.id}`,
        deviceId: targetDev.id,
        sourceName: targetDev.name,
        type: 'data',
        pattern: 'solid',
        laneIndex: 0,
        startTime: tNow,
        duration: 1.80,
        progress: 0,
        color: targetDev.color,
        label: `SLOT-${targetDev.tdmaSlotIndex + 1} [240b]`,
        sizeBits: 240,
        direction: 'to_bs',
      };
      setPackets((prev) => [...prev, newPkt]);
      logEvent(
        targetDev.name,
        'Base Station (BS-01)',
        'DATA_PACKET',
        `Dequeued and transmitted burst during designated Slot ${targetDev.tdmaSlotIndex + 1}`,
        '240 bits'
      );
    }
  }, [mode, tdmaCurrentSlot, logEvent]);

  // Auto-Traffic generator
  const nextAutoSendTimesRef = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!autoTraffic || !simPlaying) return;

    const activeList = [...BASE_DEVICES];
    if (mode === 'contention' && extraDeviceCount > 0) {
      activeList.push(...EXTRA_DEVICES.slice(0, extraDeviceCount));
    }

    activeList.forEach((dev) => {
      if (!nextAutoSendTimesRef.current[dev.id]) {
        nextAutoSendTimesRef.current[dev.id] = simTime + 1.5 + Math.random() * 2.5;
      }

      if (simTime >= nextAutoSendTimesRef.current[dev.id]) {
        const st = deviceStatsRef.current[dev.id];
        if (!st || st.backoffTimer <= 0) {
          sendPacket(dev.id);
        }
        nextAutoSendTimesRef.current[dev.id] = simTime + 2.5 + Math.random() * 3.0;
      }
    });
  }, [autoTraffic, simPlaying, simTime, mode, extraDeviceCount, sendPacket]);

  // Main Simulation Physics Tick: Calculates packet motion, collisions, and arrivals
  useEffect(() => {
    const curPackets = packetsRef.current;
    if (curPackets.length === 0) return;

    const tNow = simTime;
    const updatedPackets = curPackets.map((pkt) => {
      const elapsed = tNow - pkt.startTime;
      const p = Math.min(1, Math.max(0, elapsed / pkt.duration));
      return {
        ...pkt,
        progress: p,
      };
    });

    let newCollisions = 0;
    const collidedDevIds: string[] = [];
    const remainingPackets: PacketInFlight[] = [];
    const newPacketsToSpawn: PacketInFlight[] = [];
    const deliveredDevIds: string[] = [];
    const damaDataDevIds: string[] = [];
    let cdmaDespreadTrigger = false;

    // 1. Check Collisions (ONLY in Contention Mode on to_bs packets)
    if (mode === 'contention') {
      const activeToBS = updatedPackets.filter((p) => p.direction === 'to_bs' && !p.collided);
      for (let i = 0; i < activeToBS.length; i++) {
        for (let j = i + 1; j < activeToBS.length; j++) {
          const p1 = activeToBS[i];
          const p2 = activeToBS[j];

          if (p1.progress > 0.1 && p1.progress < 0.9 && p2.progress > 0.1 && p2.progress < 0.9) {
            p1.collided = true;
            p1.collisionProgress = (p1.progress + p2.progress) / 2;
            p2.collided = true;
            p2.collisionProgress = (p1.progress + p2.progress) / 2;

            newCollisions++;
            collidedDevIds.push(p1.deviceId, p2.deviceId);

            logEvent(
              `${p1.sourceName} & ${p2.sourceName}`,
              'Ether / Medium',
              'COLLISION',
              `💥 DESTRUCTIVE COLLISION at propagation distance ~${Math.round(p1.progress * 100)}%. Waveforms corrupted!`,
              'Corrupted'
            );
          }
        }
      }
    }

    // 2. Process Completed Packets
    updatedPackets.forEach((pkt) => {
      if (pkt.progress >= 1) {
        if (pkt.collided) {
          return; // Discard collided packet
        }

        if (pkt.type === 'data' && pkt.direction === 'to_bs') {
          if (mode === 'cdma') {
            cdmaDespreadTrigger = true;
          }
          logEvent(
            'Base Station (BS-01)',
            pkt.sourceName,
            'ACK_BURST',
            `Data burst from ${pkt.sourceName} decoded (CRC Valid). BS dispatched return ACK packet`,
            '16 bits'
          );

          newPacketsToSpawn.push({
            id: `ack-${++packetIdCounter}-${pkt.deviceId}`,
            deviceId: pkt.deviceId,
            sourceName: 'Base Station (BS-01)',
            type: 'ack',
            pattern: 'solid',
            laneIndex: pkt.laneIndex,
            startTime: tNow,
            duration: 1.20,
            progress: 0,
            color: pkt.color,
            label: 'ACK [16b]',
            sizeBits: 16,
            direction: 'from_bs',
          });
        } else if (pkt.type === 'ack' && pkt.direction === 'from_bs') {
          deliveredDevIds.push(pkt.deviceId);
          const devStatic = ALL_DEVICES_MAP.get(pkt.deviceId);
          const devLabel = devStatic?.shortName || pkt.deviceId;
          logEvent(
            devLabel,
            'Base Station (BS-01)',
            'SYNCHRONIZE',
            `ACK received by ${devLabel}. Two-way transaction confirmed (CRC OK)`,
            'ACK Confirmed'
          );
        } else if (pkt.type === 'request') {
          logEvent(
            'Base Station (BS-01)',
            pkt.sourceName,
            'GRANT',
            `BW_REQ from ${pkt.sourceName} approved. Transmitting BW_GRANT on downlink control`,
            '32 bits'
          );

          newPacketsToSpawn.push({
            id: `grant-${++packetIdCounter}-${pkt.deviceId}`,
            deviceId: pkt.deviceId,
            sourceName: 'Base Station (BS-01)',
            type: 'grant',
            pattern: 'dots',
            laneIndex: 0,
            startTime: tNow,
            duration: 1.00,
            progress: 0,
            color: pkt.color,
            label: 'BW_GRANT [32b]',
            sizeBits: 32,
            direction: 'from_bs',
          });
        } else if (pkt.type === 'grant') {
          logEvent(
            pkt.sourceName,
            'Shared Channel',
            'DATA_PACKET',
            `Grant received by ${pkt.sourceName}. Transmitting 240-bit data payload on assigned slot`,
            '240 bits'
          );

          newPacketsToSpawn.push({
            id: `dama-data-${++packetIdCounter}-${pkt.deviceId}`,
            deviceId: pkt.deviceId,
            sourceName: pkt.sourceName,
            type: 'data',
            pattern: 'solid',
            laneIndex: 0,
            startTime: tNow,
            duration: 1.80,
            progress: 0,
            color: pkt.color,
            label: 'DAMA DATA [240b]',
            sizeBits: 240,
            direction: 'to_bs',
          });
          damaDataDevIds.push(pkt.deviceId);
        }
      } else {
        remainingPackets.push(pkt);
      }
    });

    // Apply updates cleanly without nesting state setters inside updaters
    setPackets([...remainingPackets, ...newPacketsToSpawn]);

    if (newCollisions > 0) {
      setCollisionsCount((c) => c + newCollisions);
      setRecentCollisionPoint({ x: 50, y: 50 });
    }

    if (deliveredDevIds.length > 0) {
      setDeliveredCount((c) => c + deliveredDevIds.length);
    }

    if (cdmaDespreadTrigger) {
      setDespreadingActive(true);
      setTimeout(() => setDespreadingActive(false), 1200);
    }

    if (collidedDevIds.length > 0 || deliveredDevIds.length > 0 || damaDataDevIds.length > 0) {
      setDeviceStats((prev) => {
        const next = { ...prev };
        collidedDevIds.forEach((id) => {
          const backoff = Number((2.0 + Math.random() * 1.5).toFixed(1));
          const cur = next[id] || { queueCount: 0, backoffTimer: 0, damaState: 'idle' as const, totalSent: 0, totalDelivered: 0, totalCollided: 0 };
          next[id] = { ...cur, backoffTimer: backoff, totalCollided: cur.totalCollided + 1 };
        });
        deliveredDevIds.forEach((id) => {
          const cur = next[id] || { queueCount: 0, backoffTimer: 0, damaState: 'idle' as const, totalSent: 0, totalDelivered: 0, totalCollided: 0 };
          next[id] = { ...cur, totalDelivered: cur.totalDelivered + 1, recentAck: true };
        });
        damaDataDevIds.forEach((id) => {
          const cur = next[id] || { queueCount: 0, backoffTimer: 0, damaState: 'idle' as const, totalSent: 0, totalDelivered: 0, totalCollided: 0 };
          next[id] = { ...cur, damaState: 'sending' };
        });
        return next;
      });

      if (deliveredDevIds.length > 0) {
        setTimeout(() => {
          setDeviceStats((prev) => {
            const next = { ...prev };
            deliveredDevIds.forEach((id) => {
              if (next[id]) {
                next[id] = { ...next[id], recentAck: false };
              }
            });
            return next;
          });
        }, 1500);
      }
    }
  }, [simTime, mode, logEvent]);

  // Backoff timer countdown driven strictly by simulated clock
  const lastSimTimeTickRef = useRef<number>(simTime);
  useEffect(() => {
    if (!simPlaying) {
      lastSimTimeTickRef.current = simTime;
      return;
    }

    const simDelta = simTime - lastSimTimeTickRef.current;
    lastSimTimeTickRef.current = simTime;

    if (simDelta <= 0) return;

    const devicesToRetransmit: string[] = [];

    setDeviceStats((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k].backoffTimer > 0) {
          changed = true;
          const updatedTimer = Math.max(0, Number((next[k].backoffTimer - simDelta).toFixed(1)));
          next[k] = {
            ...next[k],
            backoffTimer: updatedTimer,
          };
          if (updatedTimer === 0 && mode === 'contention') {
            devicesToRetransmit.push(k);
          }
        }
      });
      return changed ? next : prev;
    });

    // Execute retransmissions outside of setDeviceStats updater
    if (devicesToRetransmit.length > 0) {
      devicesToRetransmit.forEach((devId) => {
        sendPacket(devId);
      });
    }
  }, [simTime, simPlaying, mode, sendPacket]);

  return (
    <MultipleAccessContext.Provider
      value={{
        mode,
        devices,
        packets,
        autoTraffic,
        setAutoTraffic,
        collisionsCount,
        deliveredCount,
        extraDeviceCount,
        addExtraDevice,
        removeExtraDevice,
        sendPacket,
        sendAllPackets,
        tdmaCurrentSlot,
        tdmaSlotProgress,
        tdmaFramePeriod,
        damaPendingRequests,
        despreadingActive,
        recentCollisionPoint,
      }}
    >
      {children}
    </MultipleAccessContext.Provider>
  );
};

export const useMultipleAccess = () => {
  const ctx = useContext(MultipleAccessContext);
  if (!ctx) {
    throw new Error('useMultipleAccess must be used within MultipleAccessProvider');
  }
  return ctx;
};
