export type CategoryId = 
  | 'fundamentals'
  | 'multiple_access'
  | 'cordless'
  | 'wll'
  | 'wimax';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  tabLabel: string;
  sectionCode?: string;
  colorHex: string;
  badgeClass: string;
  accentText: string;
  accentBorder: string;
  glowClass: string;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface Topic {
  id: string;
  order: number;
  title: string;
  categoryId: CategoryId;
  sectionRef: string;
  description: string;
  fullDescription: string;
  subSteps: string[];
  osiLayers: number[]; // 1 = Physical, 2 = Data Link, 3 = Network, 4 = Transport, 5 = Session, 6 = Presentation, 7 = Application
  specs: SpecRow[];
  isDemo?: boolean;
  isImplemented?: boolean;
}

export type EventType =
  | 'DATA_PACKET'
  | 'ACK_BURST'
  | 'CONTROL_POLL'
  | 'BEACON'
  | 'SYNCHRONIZE'
  | 'CONTENTION'
  | 'SYSTEM_IDLE'
  | 'REQUEST'
  | 'GRANT'
  | 'COLLISION'
  | 'RETRANSMIT'
  | 'DESPREAD'
  | 'NACK'
  | 'SAMPLE';

export interface SimEvent {
  no: number;
  timeFormatted: string; // e.g. "0.00s"
  timestamp: number;     // in seconds
  source: string;
  destination: string;
  type: EventType;
  info: string;
  sizeValue: string;
}

export type SimSpeed = 0.5 | 1 | 2;
export type CanvasViewMode = 'network' | 'sequence' | 'theory';
export type AppTheme = 'dark' | 'light';

// --- Multiple Access Engine Types (Phase 2) ---
export type MultipleAccessMode = 
  | 'fdma'
  | 'tdma'
  | 'cdma'
  | 'dama'
  | 'contention'
  | 'overview';

export type PacketType = 'data' | 'request' | 'grant' | 'ack' | 'collision';
export type PacketPattern = 'solid' | 'dots' | 'dashes' | 'stripes' | 'weave';

export interface PacketInFlight {
  id: string;
  deviceId: string;
  sourceName: string;
  type: PacketType;
  pattern: PacketPattern;
  laneIndex: number; // 0-3 for FDMA, 0 for shared lane
  startTime: number;
  duration: number; // in seconds, typically 0.60s
  progress: number; // 0 to 1
  color: string;
  label: string;
  sizeBits: number;
  collided?: boolean;
  collisionProgress?: number;
  direction: 'to_bs' | 'from_bs';
}

export interface DeviceConfig {
  id: string;
  name: string;
  shortName: string;
  deviceType: 'laptop' | 'smartphone' | 'tablet' | 'laptop2' | 'iot' | 'workstation';
  color: string;
  accentText: string;
  accentBorder: string;
  bgAccent: string;
  frequencyStr: string; // For FDMA (e.g. "2.150 GHz")
  bandwidthStr: string; // For FDMA (e.g. "5 MHz")
  tdmaSlotIndex: number; // 0, 1, 2, 3
  tdmaSlotName: string; // "Slot 1 (0.0 - 0.5s)"
  walshCodeStr: string; // For CDMA (e.g. "+1, +1, +1, +1")
  pattern: PacketPattern;
  queueCount: number;
  backoffTimer: number; // in seconds
  damaState: 'idle' | 'requesting' | 'granted' | 'sending';
  totalSent: number;
  totalDelivered: number;
  totalCollided: number;
  recentAck?: boolean;
}
