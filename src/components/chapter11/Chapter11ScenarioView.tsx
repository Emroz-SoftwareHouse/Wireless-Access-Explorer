import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CloudRain,
  Download,
  FileStack,
  Gauge,
  Globe2,
  Home,
  Laptop,
  Network,
  PhoneCall,
  Radio,
  Scissors,
  Server,
  ShieldCheck,
  Smartphone,
  TreePine,
  UserRound,
  Video,
  Wifi,
  Waves,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BaseStationIcon } from '../icons/DeviceIcons';
import { TopDownLinkScene } from './TopDownLinkScene';

type SceneKind =
  | 'wll'
  | 'fresnel'
  | 'absorption'
  | 'rain'
  | 'foliage'
  | 'ofdm'
  | 'comparison'
  | 'architecture'
  | 'stack'
  | 'qos'
  | 'header'
  | 'grants'
  | 'fragments'
  | 'duplex'
  | 'rate';

interface ScenarioConfig {
  kind: SceneKind;
  eyebrow: string;
  headline: string;
  leftLabel: string;
  rightLabel: string;
  takeaway: string;
}

const SCENARIOS: Record<string, ScenarioConfig> = {
  'the-role-of-wll': {
    kind: 'wll', eyebrow: 'Fixed wireless access journey', headline: 'From a real subscriber to the public network',
    leftLabel: 'Amina at home', rightLabel: 'PSTN + Internet',
    takeaway: 'A rooftop subscriber unit replaces the copper local loop: no trenching, faster installation.',
  },
  'fresnel-zone': {
    kind: 'fresnel', eyebrow: 'Line-of-sight clearance', headline: 'The radio needs space around the visual path',
    leftLabel: 'School rooftop', rightLabel: 'Field engineer at WLL site',
    takeaway: 'A clear visual line is not enough. Keeping about 60% of the first Fresnel zone clear is a common planning target; detailed design depends on the path.',
  },
  'atmospheric-absorption': {
    kind: 'absorption', eyebrow: 'Millimeter-wave propagation', headline: 'Air molecules can absorb radio energy',
    leftLabel: '28 GHz transmitter', rightLabel: 'Office receiver',
    takeaway: 'Water vapor peaks near 22 GHz and oxygen peaks near 60 GHz; practical systems use lower-loss windows.',
  },
  'rain-attenuation-calculator': {
    kind: 'rain', eyebrow: 'Weather-aware link budget', headline: 'Rain weakens high-frequency links drop by drop',
    leftLabel: 'WLL sector antenna', rightLabel: 'Bilal in the office',
    takeaway: 'Higher rain rate and longer paths require a larger fade margin; vertical polarization usually loses less.',
  },
  'foliage-effects': {
    kind: 'foliage', eyebrow: 'Obstructed radio path', headline: 'Trees scatter and absorb the signal',
    leftLabel: 'Community tower', rightLabel: 'Sara working at home',
    takeaway: 'Wind makes foliage loss fluctuate. Raise or relocate the antennas instead of aiming through the canopy.',
  },
  'orthogonal-frequency-division-multiplexing-ofdm': {
    kind: 'ofdm', eyebrow: 'Parallel subcarriers', headline: 'One fast stream becomes many slower streams',
    leftLabel: 'Laptop data', rightLabel: 'OFDM receiver',
    takeaway: 'Orthogonal subcarriers overlap without interfering; the cyclic prefix absorbs delayed multipath copies.',
  },
  'mmds-vs-lmds': {
    kind: 'comparison', eyebrow: 'Coverage versus capacity', headline: 'MMDS reaches farther; LMDS carries more nearby',
    leftLabel: 'Rural MMDS user', rightLabel: 'Dense-city LMDS user',
    takeaway: 'Lower frequency favors range and penetration; millimeter wave favors dense, high-capacity microcells.',
  },
  '802-16-system-reference-architecture': {
    kind: 'architecture', eyebrow: 'IEEE 802.16 reference points', headline: 'Follow a user packet across the WirelessMAN',
    leftLabel: 'Subscriber network', rightLabel: 'Core network',
    takeaway: 'The subscriber station bridges local users to a base station, which connects onward to the core network.',
  },
  '802-16-protocol-stack-encapsulation': {
    kind: 'stack', eyebrow: '802.16 protocol stack', headline: 'Watch an application message gain every radio header',
    leftLabel: 'User application', rightLabel: 'Over-the-air PDU',
    takeaway: 'The convergence layer classifies traffic, MAC builds a connection-oriented PDU, and PHY transmits symbols.',
  },
  'services-qos-categories': {
    kind: 'qos', eyebrow: 'Four service classes', headline: 'Different people need different guarantees',
    leftLabel: 'Active subscribers', rightLabel: 'Base-station scheduler',
    takeaway: 'UGS protects constant voice, rtPS protects live video, nrtPS guarantees bulk data, and BE uses spare capacity.',
  },
  'mac-frame-format-bit-field-decoder': {
    kind: 'header', eyebrow: 'Interactive MAC PDU', headline: 'Decode the frame field by field',
    leftLabel: 'Subscriber MAC', rightLabel: 'Base-station MAC',
    takeaway: 'CID identifies the logical connection, HCS protects the header, and the optional CRC protects the frame.',
  },
  'mac-service-flows-bandwidth-grants': {
    kind: 'grants', eyebrow: 'Connection-oriented scheduling', headline: 'A subscriber asks before sending',
    leftLabel: 'Nadia + three apps', rightLabel: 'WiMAX scheduler',
    takeaway: 'Each service flow maps to a CID; the base station grants uplink capacity according to negotiated QoS.',
  },
  'fragmentation-reassembly': {
    kind: 'fragments', eyebrow: 'Grant-sized MAC fragments', headline: 'A large message crosses in smaller pieces',
    leftLabel: 'Large file on laptop', rightLabel: 'Reassembly buffer',
    takeaway: 'FC marks first, middle, and last fragments; the 4-bit FSN lets the receiver restore their order.',
  },
  'physical-layer-duplexing-modes': {
    kind: 'duplex', eyebrow: '802.16 physical modes', headline: 'See downlink and uplink share time or frequency',
    leftLabel: 'Base station', rightLabel: 'Subscriber station',
    takeaway: 'FDD separates directions by frequency; TDD separates them by time; Mode B uses burst DAMA-TDMA.',
  },
  'ieee-802-16a-data-rate-calculator': {
    kind: 'rate', eyebrow: '802.16a throughput lab', headline: 'Bandwidth and modulation set the useful data rate',
    leftLabel: 'NLOS subscriber', rightLabel: 'WirelessMAN-OFDM BS',
    takeaway: 'Wider channels and denser QAM increase throughput, but they demand a cleaner, higher-SNR radio link.',
  },
};

const PersonDevice: React.FC<{ name: string; device?: 'phone' | 'laptop'; color?: string; motion: number }> = ({
  name, device = 'laptop', color = '#22d3ee', motion,
}) => (
  <div className="flex flex-col items-center gap-1 min-w-[92px]" style={{ transform: `translateY(${Math.sin(motion * 2.2) * 2}px)` }}>
    <div className="relative h-20 w-20">
      <div className="absolute left-7 top-0 h-7 w-7 overflow-hidden rounded-full border-2 border-white/70 bg-amber-200 shadow-lg">
        <div className="absolute inset-x-0 top-0 h-2.5 bg-slate-800" />
        <div className="absolute left-1.5 top-3 h-1 w-1 rounded-full bg-slate-700" />
        <div className="absolute right-1.5 top-3 h-1 w-1 rounded-full bg-slate-700" />
        <div className="absolute left-2.5 top-5 h-0.5 w-2 rounded bg-rose-500" />
      </div>
      <div className="absolute left-5 top-7 h-9 w-11 rounded-t-2xl border border-white/30" style={{ backgroundColor: color }} />
      <div className="absolute left-2 top-10 h-2 w-6 origin-right rounded-full" style={{ backgroundColor: color, transform: `rotate(${8 + Math.sin(motion * 3) * 9}deg)` }} />
      <div className="absolute right-1 top-10 h-2 w-6 origin-left rounded-full" style={{ backgroundColor: color, transform: `rotate(${-8 - Math.sin(motion * 3) * 9}deg)` }} />
      <div className="absolute left-6 top-15 h-5 w-2 rounded bg-slate-700" />
      <div className="absolute right-6 top-15 h-5 w-2 rounded bg-slate-700" />
      <div className="absolute right-0 top-8 flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-slate-950 text-white shadow-lg">
        {device === 'phone' ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
      </div>
    </div>
    <span className="text-center text-[10px] font-bold text-slate-800 dark:text-slate-100">{name}</span>
  </div>
);

const Tower: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <div className="flex min-w-[86px] flex-col items-center gap-1">
    <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border ${active ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_28px_rgba(34,211,238,.35)]' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
      <BaseStationIcon size={58} color={active ? '#22d3ee' : '#94a3b8'} glow={active} />
    </div>
    <span className="text-center text-[10px] font-bold text-slate-800 dark:text-slate-100">{label}</span>
  </div>
);

const MovingPacket: React.FC<{ progress: number; label: string; color?: string; reverse?: boolean }> = ({ progress, label, color = '#22d3ee', reverse }) => {
  const p = reverse ? 1 - progress : progress;
  return (
    <div data-packet-progress={p.toFixed(3)} className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 bg-slate-950 px-2 py-1 text-[9px] font-black text-white shadow-xl transition-[left] duration-75"
      style={{ left: `${8 + p * 84}%`, borderColor: color, boxShadow: `0 0 16px ${color}88` }}>
      {label}
    </div>
  );
};

const Channel: React.FC<{ children?: React.ReactNode; danger?: boolean }> = ({ children, danger }) => (
  <div className="relative mx-2 h-16 min-w-[150px] flex-1 sm:mx-5">
    <div className={`absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full ${danger ? 'bg-gradient-to-r from-cyan-500 via-rose-500 to-cyan-500' : 'bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-500'} opacity-40`} />
    <div className="absolute inset-x-0 top-[calc(50%+10px)] flex justify-between text-[8px] font-mono text-slate-500"><span>TX</span><span>RF channel</span><span>RX</span></div>
    {children}
  </div>
);

const FieldStrip: React.FC<{ active: number; onSelect: (index: number) => void }> = ({ active, onSelect }) => {
  const fields = [
    ['HT', '1b', 'Header type'], ['EC', '1b', 'Encryption control'], ['EKS', '4b', 'Key sequence'],
    ['LEN', '11b', 'Total PDU length'], ['CID', '16b', 'Connection identifier'], ['HCS', '8b', 'Header CRC'], ['PAYLOAD', 'variable', 'User data'], ['CRC', '32b', 'Frame check'],
  ];
  return <div className="w-full">
    <div className="flex overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700">
      {fields.map((field, index) => <button key={field[0]} onClick={() => onSelect(index)} className={`min-w-0 flex-1 border-r border-slate-300 px-1 py-3 text-[8px] font-black last:border-r-0 dark:border-slate-700 ${active === index ? 'bg-pink-500 text-white' : 'bg-white text-slate-600 hover:bg-pink-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`} title={field[2]}>{field[0]}<span className="block text-[7px] font-normal opacity-70">{field[1]}</span></button>)}
    </div>
    <div className="mt-2 rounded-lg bg-pink-500/10 px-3 py-2 text-center text-[11px] text-pink-700 dark:text-pink-300"><strong>{fields[active][0]}</strong> · {fields[active][1]} · {fields[active][2]}</div>
  </div>;
};

export const Chapter11ScenarioView: React.FC = () => {
  const { selectedTopic, simTime, activeSubStepIndex, selectSubStep } = useApp();
  const config = SCENARIOS[selectedTopic.id];
  const [frequency, setFrequency] = useState(28);
  const [rainRate, setRainRate] = useState(25);
  const [pathKm, setPathKm] = useState(2);
  const [bandwidth, setBandwidth] = useState(7);
  const [modulation, setModulation] = useState<'QPSK' | '16-QAM' | '64-QAM'>('16-QAM');
  const [headerField, setHeaderField] = useState(4);
  const cycle = (simTime % 8) / 8;
  // Smooth ping-pong motion: sender → receiver for four seconds, then a visible
  // return/acknowledgement trip. This avoids the old end-of-path teleport.
  const packetReturning = cycle >= 0.5;
  const packetProgress = packetReturning ? (1 - cycle) * 2 : cycle * 2;
  const deliveredPackets = Math.min(2, Math.floor((simTime + 0.001) / 4));
  const active = Math.min(3, Math.floor(cycle * 4));

  const attenuation = useMemo(() => {
    const resonance = frequency === 60 ? 15 : frequency === 22 ? 0.2 : frequency >= 50 ? 1.6 : 0.13;
    return resonance * pathKm;
  }, [frequency, pathKm]);
  const rainLoss = useMemo(() => (0.102 * Math.pow(rainRate, 1.1) * pathKm), [rainRate, pathKm]);
  const dataRate = useMemo(() => {
    const efficiency = modulation === 'QPSK' ? 0.5929 : modulation === '16-QAM' ? 2.4929 : 3.7405;
    return bandwidth * efficiency;
  }, [bandwidth, modulation]);

  if (!config) return null;

  const isPropagationMap = config.kind === 'wll' || config.kind === 'fresnel' || config.kind === 'rain'
    || config.kind === 'foliage' || config.kind === 'absorption';

  const renderScene = () => {
    if (config.kind === 'header') return <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-3"><div className="flex w-full items-center justify-between gap-3"><PersonDevice name="Ibrahim's tablet" device="phone" motion={simTime} /><Channel><MovingPacket progress={packetProgress} label="MAC PDU" color="#ec4899" /></Channel><Tower label="802.16 BS" active /></div><FieldStrip active={headerField} onSelect={setHeaderField} /></div>;

    if (config.kind === 'qos') {
      const apps = [
        { icon: PhoneCall, name: 'Ayesha · voice', qos: 'UGS', color: 'bg-cyan-500' },
        { icon: Video, name: 'Hamza · live video', qos: 'rtPS', color: 'bg-violet-500' },
        { icon: Download, name: 'Noor · file transfer', qos: 'nrtPS', color: 'bg-amber-500' },
        { icon: Globe2, name: 'Ali · web browsing', qos: 'BE', color: 'bg-emerald-500' },
      ];
      return <div className="grid h-full w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-2"><div className="space-y-2">{apps.map((app, i) => <div key={app.qos} className={`flex items-center gap-2 rounded-xl border p-2 transition-all ${i === active ? 'border-pink-400 bg-pink-500/10 scale-[1.02]' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><div className={`rounded-lg p-2 text-white ${app.color}`}><app.icon className="h-4 w-4" /></div><div><div className="text-[10px] font-bold">{app.name}</div><div className="text-[9px] text-slate-500">{app.qos}</div></div></div>)}</div><ArrowRight className="h-5 w-5 text-pink-500" /><div className="flex flex-col items-center gap-2"><Tower label="QoS scheduler" active /><div className="text-center text-[10px] text-slate-500">Priority + delay + minimum rate</div></div></div>;
    }

    if (config.kind === 'fragments') {
      const labels = ['FIRST · FC 10 · FSN 0', 'MIDDLE · FC 11 · FSN 1', 'MIDDLE · FC 11 · FSN 2', 'LAST · FC 01 · FSN 3'];
      return <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4"><div className="flex w-full items-center justify-between gap-2"><PersonDevice name="Usman's laptop" motion={simTime} /><Scissors className="h-6 w-6 text-amber-500" /><div className="flex flex-1 gap-1">{labels.map((label, i) => <div key={label} className={`flex-1 rounded-lg border p-2 text-center text-[8px] font-bold transition-all ${i === active ? 'translate-y-[-6px] border-cyan-400 bg-cyan-500 text-slate-950 shadow-lg' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>{label}</div>)}</div><div className="flex flex-col items-center gap-1"><FileStack className="h-12 w-12 text-emerald-500" /><span className="text-[9px] font-bold">Reassembled MSDU</span></div></div><div className="w-full rounded-full bg-slate-200 p-1 dark:bg-slate-800"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all" style={{ width: `${(active + 1) * 25}%` }} /></div></div>;
    }

    if (config.kind === 'stack') {
      const layers = [
        ['Application', 'IP packet'], ['Convergence', 'Classify + map SFID'], ['MAC CPS', 'CID + scheduling header'], ['Security', 'Encrypt + authenticate'], ['Physical', 'FEC + QAM symbols'],
      ];
      const movingLayer = Math.min(4, Math.floor(cycle * 5));
      return <div className="grid h-full w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-3"><PersonDevice name="Mariam sends a photo" device="phone" motion={simTime} /><div className="space-y-1.5">{layers.map((layer, i) => <div key={layer[0]} className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${i === movingLayer ? 'border-pink-400 bg-pink-500 text-white translate-x-2 shadow-lg' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><span className="text-[10px] font-bold">{layer[0]}</span><span className="text-[9px] opacity-75">{layer[1]}</span></div>)}</div><Tower label="Radio channel" active /></div>;
    }

    if (config.kind === 'ofdm') {
      return <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-3"><div className="flex w-full items-center justify-between gap-3"><PersonDevice name="Fast video stream" motion={simTime} /><ArrowRight className="h-5 w-5 text-cyan-500" /><div className="grid flex-1 grid-cols-8 gap-1">{Array.from({ length: 16 }).map((_, i) => <div key={i} className="relative h-16 overflow-hidden rounded bg-slate-100 dark:bg-slate-900"><div className="absolute inset-x-0 bottom-0 rounded-t bg-cyan-500 transition-all" style={{ height: `${20 + ((i * 29 + active * 17) % 75)}%`, opacity: 0.45 + (i % 3) * 0.2 }} /><span className="absolute inset-x-0 bottom-1 text-center text-[7px] font-mono">f{i + 1}</span></div>)}</div><Tower label="OFDM receiver" active /></div><div className="flex w-full items-center gap-2 rounded-lg border border-violet-400/40 bg-violet-500/10 p-2 text-[10px]"><Waves className="h-4 w-4 text-violet-500" /><strong>Cyclic prefix:</strong><span className="text-slate-600 dark:text-slate-300">a copied tail creates a guard interval so delayed echoes do not corrupt the next symbol.</span></div></div>;
    }

    if (config.kind === 'comparison') {
      return <div className="grid h-full w-full grid-cols-2 gap-3 p-3"><div className="relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-cyan-500/10 p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs text-cyan-700 dark:text-cyan-300">MMDS · 2.5 GHz</strong><span className="text-[9px]">up to ~50 km</span></div><div className="flex items-center justify-between"><Tower label="Wide rural cell" active /><Channel><MovingPacket progress={packetProgress} label="tens of Mbps" /></Channel><PersonDevice name="Far-away family" motion={simTime} /></div></div><div className="relative overflow-hidden rounded-2xl border border-pink-400/40 bg-pink-500/10 p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs text-pink-700 dark:text-pink-300">LMDS · 28-40 GHz</strong><span className="text-[9px]">2-4 km cells</span></div><div className="flex items-center justify-between"><Tower label="Urban microcell" active /><Channel><MovingPacket progress={packetProgress} label="high capacity" color="#ec4899" /></Channel><PersonDevice name="Nearby business" device="phone" color="#ec4899" motion={simTime} /></div></div></div>;
    }

    if (config.kind === 'architecture') {
      const points = [
        { icon: Home, label: 'Subscriber network' }, { icon: Wifi, label: 'Subscriber station' }, { icon: Radio, label: 'Air interface' }, { icon: Network, label: 'Base station' }, { icon: Server, label: 'Core network' },
      ];
      const moving = Math.min(4, Math.floor(cycle * 5));
      return <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-5"><div className="flex w-full items-center justify-between">{points.map((point, i) => <React.Fragment key={point.label}><div className={`flex min-w-[70px] flex-col items-center gap-2 rounded-xl border p-3 transition-all ${i === moving ? 'border-pink-400 bg-pink-500/15 scale-105 shadow-lg' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><point.icon className={`h-7 w-7 ${i === moving ? 'text-pink-500' : 'text-slate-500'}`} /><span className="text-center text-[9px] font-bold">{point.label}</span></div>{i < points.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />}</React.Fragment>)}</div><div className="flex items-center gap-2 text-[10px] text-slate-500"><UserRound className="h-4 w-4 text-cyan-500" />A real user's packet crosses reference points R1 → air interface → R2 → core network.</div></div>;
    }

    if (config.kind === 'grants') {
      const states = ['BW request', 'Scheduler checks SFID/QoS', 'UL-MAP grant', 'Payload burst'];
      return <div className="flex h-full w-full flex-col justify-center gap-4 px-4"><div className="flex items-center justify-between gap-2"><PersonDevice name="Nadia · voice + file + web" device="phone" motion={simTime} /><Channel><MovingPacket progress={packetProgress} label={states[active]} color={active === 2 ? '#10b981' : '#ec4899'} reverse={active === 2} /></Channel><Tower label="Central scheduler" active /></div><div className="grid grid-cols-4 gap-2">{states.map((state, i) => <button key={state} onClick={() => selectSubStep(selectedTopic.id, i)} className={`rounded-lg border p-2 text-[9px] font-bold ${i === activeSubStepIndex ? 'border-pink-400 bg-pink-500 text-white' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>{i + 1}. {state}</button>)}</div></div>;
    }

    if (config.kind === 'duplex') {
      return <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4"><div className="flex w-full items-center justify-between gap-3"><Tower label="Base station" active /><div className="flex flex-1 flex-col gap-2"><div className={`relative h-10 overflow-hidden rounded-lg border ${active < 2 ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-300 dark:border-slate-700'}`}><MovingPacket progress={packetProgress} label="DOWNLINK" /><span className="absolute left-2 top-1 text-[8px] text-slate-500">f₁ or TDD downlink slot</span></div><div className={`relative h-10 overflow-hidden rounded-lg border ${active >= 2 ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-300 dark:border-slate-700'}`}><MovingPacket progress={packetProgress} label="UPLINK" color="#10b981" reverse /><span className="absolute right-2 top-1 text-[8px] text-slate-500">f₂ or TDD uplink slot</span></div></div><PersonDevice name="Subscriber" device="phone" motion={simTime} /></div><div className="grid w-full grid-cols-3 gap-2 text-center text-[9px]"><div className="rounded-lg bg-cyan-500/10 p-2"><strong>FDD</strong><br />two frequencies, same time</div><div className="rounded-lg bg-violet-500/10 p-2"><strong>FSDD</strong><br />two frequencies, one direction at a time</div><div className="rounded-lg bg-emerald-500/10 p-2"><strong>TDD</strong><br />one frequency, alternating time</div></div></div>;
    }

    if (config.kind === 'rate') {
      return <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4"><div className="flex w-full items-center justify-between gap-3"><PersonDevice name="NLOS customer" motion={simTime} /><Channel><MovingPacket progress={packetProgress} label={`${dataRate.toFixed(2)} Mbps`} color="#ec4899" /></Channel><Tower label="256-carrier OFDM" active /></div><div className="grid w-full grid-cols-1 gap-3 rounded-xl border border-pink-400/30 bg-pink-500/5 p-3 md:grid-cols-3"><label className="text-[10px] font-bold">Channel bandwidth <span className="float-right text-pink-500">{bandwidth} MHz</span><input aria-label={`Channel bandwidth ${bandwidth} MHz`} className="mt-2 w-full accent-pink-500" type="range" min="1.75" max="20" step="0.25" value={bandwidth} onChange={e => setBandwidth(Number(e.target.value))} /></label><div className="flex gap-1">{(['QPSK', '16-QAM', '64-QAM'] as const).map(m => <button key={m} onClick={() => setModulation(m)} className={`flex-1 rounded-lg px-2 py-1 text-[9px] font-bold ${modulation === m ? 'bg-pink-500 text-white' : 'bg-white dark:bg-slate-900'}`}>{m}</button>)}</div><div className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-white"><Gauge className="h-5 w-5 text-pink-400" /><div><div className="text-[8px] text-slate-400">Estimated useful rate</div><div className="font-mono text-lg font-black text-pink-400">{dataRate.toFixed(2)} Mbps</div></div></div></div></div>;
    }

    const obstacle = config.kind === 'foliage' || config.kind === 'fresnel';
    const weather = config.kind === 'rain';
    const absorptionScene = config.kind === 'absorption';
    const left = config.kind === 'wll' ? <PersonDevice name="Amina + Wi-Fi router" motion={simTime} /> : <Tower label={config.leftLabel} active />;
    const right = config.kind === 'wll' ? <div className="flex flex-col items-center gap-1"><Server className="h-16 w-16 text-emerald-500" /><span className="text-[10px] font-bold">PSTN + Internet</span></div> : <PersonDevice name={config.rightLabel} device="phone" color="#10b981" motion={simTime} />;
    return <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-3"><div className="flex w-full items-center justify-between gap-2">{left}<Channel danger={obstacle || weather}>{obstacle && <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">{config.kind === 'foliage' ? <TreePine className="h-16 w-16 text-emerald-600" /> : <Building2 className="h-14 w-14 text-amber-600" />}</div>}{weather && <div className="absolute inset-0 flex justify-around text-cyan-500/70">{Array.from({ length: 9 }).map((_, i) => <CloudRain key={i} className="h-6 w-6" style={{ transform: `translateY(${Math.sin(simTime * 3 + i) * 5}px)` }} />)}</div>}{absorptionScene && <div className="absolute inset-0 flex items-center justify-around text-[8px] font-bold text-violet-500"><span>H₂O</span><span>O₂</span><span>H₂O</span><span>O₂</span></div>}<MovingPacket progress={packetProgress} label={obstacle ? (packetProgress > .45 && packetProgress < .65 ? 'SCATTERED' : 'RF') : weather ? `${Math.max(0, 100 - rainLoss).toFixed(0)}% power` : absorptionScene ? `${Math.max(0, 100 - attenuation).toFixed(0)}% power` : 'USER DATA'} color={obstacle || weather ? '#f43f5e' : '#22d3ee'} /></Channel>{right}</div>{config.kind === 'wll' && <div className="grid w-full grid-cols-4 gap-2 text-center text-[9px]">{['Laptop / phone', 'Rooftop CPE', 'Sector base station', 'Public network'].map((s, i) => <div key={s} className={`rounded-lg border p-2 ${i === active ? 'border-cyan-400 bg-cyan-500/15 font-bold' : 'border-slate-200 dark:border-slate-800'}`}>{i + 1}. {s}</div>)}</div>}{config.kind === 'fresnel' && <div className="relative h-12 w-full overflow-hidden rounded-full border border-cyan-400/50 bg-cyan-500/10"><div className="absolute inset-x-[8%] top-1/2 h-[70%] -translate-y-1/2 rounded-[50%] border-2 border-dashed border-cyan-400" /><div className="absolute inset-x-[22%] top-1/2 h-[42%] -translate-y-1/2 rounded-[50%] bg-emerald-500/20" /><span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">green core = required 60% clearance</span></div>}{(weather || absorptionScene) && <div className="grid w-full grid-cols-3 gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><label className="text-[9px] font-bold">{weather ? 'Rain rate' : 'Frequency'} <span className="float-right text-cyan-500">{weather ? `${rainRate} mm/h` : `${frequency} GHz`}</span><input className="mt-2 w-full accent-cyan-500" type="range" min={weather ? 5 : 10} max={weather ? 145 : 95} step={weather ? 5 : 1} value={weather ? rainRate : frequency} onChange={e => weather ? setRainRate(Number(e.target.value)) : setFrequency(Number(e.target.value))} /></label><label className="text-[9px] font-bold">Path length <span className="float-right text-cyan-500">{pathKm} km</span><input className="mt-2 w-full accent-cyan-500" type="range" min="0.5" max="10" step="0.5" value={pathKm} onChange={e => setPathKm(Number(e.target.value))} /></label><div className="rounded-lg bg-slate-950 p-2 text-center text-white"><div className="text-[8px] text-slate-400">Estimated path loss</div><div className="font-mono text-lg font-black text-rose-400">{(weather ? rainLoss : attenuation).toFixed(2)} dB</div></div></div>}</div>;
  };

  return (
    <div className="no-pan flex h-full w-full max-w-6xl flex-col overflow-y-auto p-2 text-slate-800 dark:text-slate-100 sm:p-3">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div>
          <div className="mb-0.5 text-[9px] font-black uppercase tracking-[.2em] text-pink-500">{config.eyebrow}</div>
          <h2 className="text-sm font-black sm:text-base">{config.headline}</h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-3 w-3" />LIVE SIMULATION</div>
          <div className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-[9px] font-black text-cyan-700 dark:text-cyan-300">
            {packetReturning ? '← Return / acknowledgement' : 'Outbound packet →'} · {isPropagationMap ? 'Path animation loops' : `Delivered ${deliveredPackets}/2`}
          </div>
        </div>
      </div>

      <div className={`${isPropagationMap ? 'flex-none' : 'min-h-[190px] flex-1 sm:min-h-[260px]'} rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-cyan-50/50 shadow-inner dark:border-slate-800 dark:from-[#070b14] dark:to-pink-950/10`}>
        {isPropagationMap ? <TopDownLinkScene key={selectedTopic.id} kind={config.kind as 'wll' | 'fresnel' | 'rain' | 'foliage' | 'absorption'} simTime={simTime} /> : renderScene()}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {selectedTopic.subSteps.map((step, index) => <button key={step} onClick={() => selectSubStep(selectedTopic.id, index)} className={`rounded-xl border px-2 py-2 text-left transition-all ${index === activeSubStepIndex ? 'border-pink-400 bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'border-slate-200 bg-white hover:border-pink-300 dark:border-slate-800 dark:bg-slate-900'}`}><span className="mb-1 block text-[8px] font-black uppercase tracking-wider opacity-70">Step {index + 1}</span><span className="line-clamp-2 text-[9px] font-semibold leading-snug">{step}</span></button>)}
        </div>
        <div className="flex max-w-sm items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[10px] leading-snug text-amber-900 dark:text-amber-100"><ShieldCheck className="h-5 w-5 shrink-0 text-amber-500" /><span><strong>What to notice:</strong> {config.takeaway}</span></div>
      </div>
    </div>
  );
};
