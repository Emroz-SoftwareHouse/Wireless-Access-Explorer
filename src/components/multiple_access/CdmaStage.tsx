import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useMultipleAccess } from '../../context/MultipleAccessSimulator';
import { MathFormula } from '../common/MathFormula';
import { 
  Sparkles, 
  Send, 
  Zap, 
  Radio, 
  CheckCircle2, 
  Info, 
  Layers, 
  Binary, 
  Calculator,
  RefreshCw
} from 'lucide-react';

interface CdmaStation {
  id: string;
  name: string;
  color: string;
  walsh: number[]; // e.g. [1, 1, 1, 1]
  walshStr: string;
}

const STATIONS: CdmaStation[] = [
  { id: 'sta-1', name: 'Laptop 1 (STA-1)', color: '#06b6d4', walsh: [1, 1, 1, 1], walshStr: 'W1 = [+1, +1, +1, +1]' },
  { id: 'sta-2', name: 'Smartphone (STA-2)', color: '#10b981', walsh: [1, -1, 1, -1], walshStr: 'W2 = [+1, -1, +1, -1]' },
  { id: 'sta-3', name: 'Tablet (STA-3)', color: '#f59e0b', walsh: [1, 1, -1, -1], walshStr: 'W3 = [+1, +1, -1, -1]' },
  { id: 'sta-4', name: 'Laptop 2 (STA-4)', color: '#ec4899', walsh: [1, -1, -1, 1], walshStr: 'W4 = [+1, -1, -1, +1]' },
];

export const CdmaStage: React.FC = () => {
  const { simTime } = useApp();
  const { sendPacket, sendAllPackets } = useMultipleAccess();

  // Active data bits transmitted by each station: +1, -1, or 0 (idle)
  const [dataBits, setDataBits] = useState<Record<string, number>>({
    'sta-1': 1,
    'sta-2': 1,
    'sta-3': -1,
    'sta-4': 0, // idle
  });

  // Selected station at Base Station despreader
  const [selectedDecodeSta, setSelectedDecodeSta] = useState<string>('sta-1');

  // Toggle data bit: 1 -> -1 -> 0 (idle) -> 1
  const toggleDataBit = (staId: string) => {
    setDataBits((prev) => {
      const cur = prev[staId] ?? 0;
      const next = cur === 1 ? -1 : cur === -1 ? 0 : 1;
      return { ...prev, [staId]: next };
    });
  };

  // Compute composite transmitted superposition signal S(t) = sum(d_i * W_i)
  const compositeSignal = useMemo(() => {
    const sum = [0, 0, 0, 0];
    STATIONS.forEach((sta) => {
      const d = dataBits[sta.id] ?? 0;
      if (d !== 0) {
        for (let i = 0; i < 4; i++) {
          sum[i] += d * sta.walsh[i];
        }
      }
    });
    return sum;
  }, [dataBits]);

  // Compute Despreading inner product at Base Station for the selected station
  const targetSta = STATIONS.find((s) => s.id === selectedDecodeSta) || STATIONS[0];
  const targetWalsh = targetSta.walsh;

  const productTerms = compositeSignal.map((sVal, idx) => sVal * targetWalsh[idx]);
  const innerProductSum = productTerms.reduce((acc, v) => acc + v, 0);
  const decodedBit = innerProductSum / 4;

  const expectedBit = dataBits[targetSta.id] ?? 0;
  const isCorrect = decodedBit === expectedBit;

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 select-none overflow-y-auto max-w-4xl mx-auto gap-3 text-slate-800 dark:text-slate-100">
      {/* 1. Header & Direct Sequence Spreading Summary */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              CDMA Dedicated Simulation: Orthogonal Spreading & Despreading Correlator
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setDataBits({ 'sta-1': 1, 'sta-2': 1, 'sta-3': 1, 'sta-4': 1 });
                sendAllPackets();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500 text-white font-mono text-xs font-bold hover:bg-purple-400 transition-all shadow-xs"
              title="Set all 4 stations to transmit simultaneously on the exact same carrier and time window"
            >
              <Zap className="h-3 w-3" />
              <span>Broadcast All 4 Codes</span>
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              Universal Frequency Reuse (N=1)
            </span>
          </div>
        </div>

        {/* 4 Stations Spreading Codes Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          {STATIONS.map((sta) => {
            const d = dataBits[sta.id] ?? 0;
            return (
              <div 
                key={sta.id}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: sta.color }}>{sta.name.split(' ')[0]}</span>
                  <button
                    onClick={() => toggleDataBit(sta.id)}
                    className={`px-1.5 py-0.2 rounded font-bold transition-all ${
                      d === 1 
                        ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                        : d === -1 
                        ? 'bg-rose-500 text-white shadow-xs' 
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                    title="Click to toggle transmitted data bit: +1, -1, or Idle (0)"
                  >
                    Bit: {d === 1 ? '+1' : d === -1 ? '-1' : 'IDLE'}
                  </button>
                </div>
                <div className="text-[9px] text-slate-500 mt-1">{sta.walshStr}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Air Interface Superposition Composite Waveform S(t) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Binary className="h-4 w-4 text-purple-500" />
            <span>Over-The-Air Superposition Waveform: S(t) = ∑ di · Wi</span>
          </span>
          <span className="text-[10px] text-slate-400">All signals overlap concurrently in air</span>
        </div>

        {/* Composite Chip Vector Card */}
        <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="text-slate-500 font-bold">Composite Air Waveform S:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-800 font-black">
              <span>[</span>
              {compositeSignal.map((val, i) => (
                <span 
                  key={i} 
                  className={`px-2 py-0.5 rounded ${
                    val > 0 
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' 
                      : val < 0 
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold' 
                      : 'text-slate-400'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </span>
              ))}
              <span>]</span>
            </div>
          </div>

          {/* SVG Chip Step Waveform representation */}
          <div className="h-20 w-full bg-slate-950 rounded-xl p-2 border border-slate-800 relative overflow-hidden flex items-center">
            <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
              {/* Centerline (0 level) */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#334155" strokeWidth="0.8" strokeDasharray="2 2" />

              {/* 4 Chip Bars */}
              {compositeSignal.map((sVal, idx) => {
                const x = idx * 100;
                // Height from center (30): sVal ranges from -4 to +4
                const y = 30 - sVal * 6;
                const barHeight = Math.abs(sVal * 6);
                const barY = sVal >= 0 ? 30 - barHeight : 30;

                return (
                  <g key={idx}>
                    <rect
                      x={x + 10}
                      y={barY}
                      width="80"
                      height={Math.max(2, barHeight)}
                      fill="#a855f7"
                      fillOpacity={0.65}
                      stroke="#c084fc"
                      strokeWidth="1.5"
                      rx="3"
                    />
                    <text
                      x={x + 50}
                      y={sVal >= 0 ? barY - 4 : barY + barHeight + 11}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Chip {idx + 1}: {sVal > 0 ? `+${sVal}` : sVal}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Base Station Inner Product Despreading Correlator */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Calculator className="h-4 w-4 text-emerald-500" />
            <span>Base Station Despreading Correlator: (1/N) ⟨S, Wi⟩</span>
          </span>
          <span className="text-[10px] text-slate-400">Select which station's stream to decode</span>
        </div>

        {/* Decoder Station Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-slate-500 mr-1">Target Despreader:</span>
          {STATIONS.map((sta) => (
            <button
              key={sta.id}
              onClick={() => setSelectedDecodeSta(sta.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                selectedDecodeSta === sta.id
                  ? 'bg-purple-500 text-white border-purple-600 shadow-sm ring-1 ring-purple-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {sta.name.split(' ')[0]} ({sta.walshStr.split(' = ')[0]})
            </button>
          ))}
        </div>

        {/* Mathematical Inner Product Calculation Box */}
        <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Dot-Product Arithmetic Step:</span>
            <span>Orthogonality Metric: ⟨Wi, Wj⟩ = 0 (for i ≠ j)</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {compositeSignal.map((sVal, idx) => {
              const wVal = targetWalsh[idx];
              const term = sVal * wVal;
              return (
                <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <span className="text-[9px] text-slate-400">Chip #{idx + 1}</span>
                  <span className="text-slate-900 dark:text-white font-bold my-0.5">
                    ({sVal > 0 ? `+${sVal}` : sVal}) × ({wVal > 0 ? `+${wVal}` : wVal})
                  </span>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    = {term > 0 ? `+${term}` : term}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Result Banner */}
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Decoded Result: </span>
              <strong className="text-purple-600 dark:text-purple-400">
                (1/4) × ({productTerms.join(' + ')}) = (1/4) × ({innerProductSum}) = {decodedBit > 0 ? `+${decodedBit}` : decodedBit}
              </strong>
            </div>

            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
              isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}>
              {decodedBit === 0 ? 'Station Idle' : `Recovered Bit = ${decodedBit > 0 ? '+1' : '-1'} ✓`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Theory Note */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
          <Info className="h-4 w-4 text-purple-500 shrink-0" />
          <span>CDMA Orthogonal Code Spreading (Stallings §7.4 / §10.4):</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          In Code Division Multiple Access, all transmitters occupy the <strong>same frequency carrier and the same time frame</strong> simultaneously. By modulating user bits with mathematically orthogonal Walsh sequences, mutual cross-correlation integrates to zero (<MathFormula tex={`\\langle W_i, W_j \\rangle = 0`} displayMode={false} />), completely eliminating interference at the receiver without frequency bands or time slots!
        </p>
      </div>
    </div>
  );
};
