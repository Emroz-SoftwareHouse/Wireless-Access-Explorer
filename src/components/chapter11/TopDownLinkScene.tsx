import React, { useMemo, useState } from 'react';
import { Building2, Home, RadioTower, TreePine } from 'lucide-react';

type Kind = 'wll' | 'fresnel' | 'rain' | 'foliage' | 'absorption';

const sources = {
  fresnel: { label: 'ITU-R P.530: terrestrial line-of-sight links', url: 'https://www.itu.int/rec/R-REC-P.530' },
  rain: { label: 'ITU-R P.838: rain specific attenuation', url: 'https://www.itu.int/rec/R-REC-P.838' },
  absorption: { label: 'ITU-R P.676: atmospheric gases', url: 'https://www.itu.int/rec/R-REC-P.676' },
  foliage: { label: 'ITU-R P.833: vegetation attenuation', url: 'https://www.itu.int/rec/R-REC-P.833' },
  wll: { label: 'ITU-R P.530: fixed radio link design', url: 'https://www.itu.int/rec/R-REC-P.530' },
};

// Selected integer-GHz entries from ITU-R P.838-3, Table 5: frequency, kH, alphaH, kV, alphaV.
const rainCoefficients = [
  [2, 0.0000847, 1.0664, 0.0000998, 0.9490],
  [5, 0.0002162, 1.6969, 0.0002428, 1.5317],
  [10, 0.01217, 1.2571, 0.01129, 1.2156],
  [15, 0.04481, 1.1233, 0.05008, 1.0440],
  [20, 0.09164, 1.0568, 0.09611, 0.9847],
  [25, 0.1571, 0.9991, 0.1533, 0.9491],
  [28, 0.2051, 0.9679, 0.1964, 0.9277],
  [30, 0.2403, 0.9485, 0.2291, 0.9129],
  [35, 0.3374, 0.9047, 0.3224, 0.8761],
  [40, 0.4431, 0.8673, 0.4274, 0.8421],
  [45, 0.5521, 0.8355, 0.5375, 0.8123],
  [50, 0.6600, 0.8084, 0.6472, 0.7871],
  [55, 0.7635, 0.7853, 0.7527, 0.7661],
  [60, 0.8606, 0.7656, 0.8515, 0.7486],
  [65, 0.9501, 0.7488, 0.9425, 0.7339],
  [70, 1.0315, 0.7345, 1.0253, 0.7215],
];

function rainParameters(frequency: number, polarization: 'H' | 'V') {
  const upperIndex = Math.max(1, rainCoefficients.findIndex(row => row[0] >= frequency));
  const lower = rainCoefficients[upperIndex - 1];
  const upper = rainCoefficients[upperIndex];
  const fraction = Math.max(0, Math.min(1, (frequency - lower[0]) / (upper[0] - lower[0])));
  const coefficient = polarization === 'H' ? 1 : 3;
  const k = Math.exp(Math.log(lower[coefficient]) + fraction * (Math.log(upper[coefficient]) - Math.log(lower[coefficient])));
  const alpha = lower[coefficient + 1] + fraction * (upper[coefficient + 1] - lower[coefficient + 1]);
  return { k, alpha };
}

export const TopDownLinkScene: React.FC<{ kind: Kind; simTime: number }> = ({ kind, simTime }) => {
  const [distance, setDistance] = useState(2);
  const [frequency, setFrequency] = useState(kind === 'absorption' ? 60 : 28);
  const [rain, setRain] = useState(kind === 'rain' ? 25 : 0);
  const [obstacleHeight, setObstacleHeight] = useState(kind === 'fresnel' ? 13 : 8);
  const [antennaHeight, setAntennaHeight] = useState(20);
  const [trees, setTrees] = useState(kind === 'foliage' ? 2 : 0);
  const [showObstacle, setShowObstacle] = useState(kind === 'fresnel');
  const [fadeMargin, setFadeMargin] = useState(20);
  const [polarization, setPolarization] = useState<'H' | 'V'>('H');

  const model = useMemo(() => {
    const fresnelRadius = 8.66 * Math.sqrt(distance / frequency);
    const clearance = antennaHeight - obstacleHeight;
    const clearanceNeeded = 0.6 * fresnelRadius;
    // P.838 specific attenuation, with a uniform-rate path for this teaching scenario.
    const { k, alpha } = rainParameters(frequency, polarization);
    const rainLoss = k * Math.pow(rain, alpha) * distance;
    const gasLossPerKm = frequency >= 58 && frequency <= 62 ? 15 : frequency >= 20 && frequency <= 24 ? 0.2 : frequency >= 50 ? 1.6 : 0.13;
    const gasLoss = gasLossPerKm * distance;
    const foliageLoss = trees * 4;
    const obstructionLoss = showObstacle && clearance < clearanceNeeded ? 12 : 0;
    const impairment = rainLoss + gasLoss + foliageLoss + obstructionLoss;
    const remaining = fadeMargin - impairment;
    return { fresnelRadius, clearance, clearanceNeeded, rainLoss, gasLoss, foliageLoss, obstructionLoss, impairment, remaining, k, alpha };
  }, [distance, frequency, rain, obstacleHeight, antennaHeight, trees, showObstacle, fadeMargin, polarization]);

  const phase = (simTime % 8) / 8;
  const position = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
  const returning = phase >= 0.5;
  const risks = [
    model.obstructionLoss > 0 && 'Building enters the 60% Fresnel clearance zone',
    model.rainLoss > 1 && `Rain adds ${model.rainLoss.toFixed(1)} dB loss`,
    model.foliageLoss > 0 && `Trees add about ${model.foliageLoss.toFixed(0)} dB illustrative loss`,
    model.gasLoss > 3 && `Air absorption adds about ${model.gasLoss.toFixed(1)} dB loss`,
  ].filter(Boolean);

  const slider = (label: string, value: number, unit: string, min: number, max: number, step: number, set: (value: number) => void) => (
    <label className="block rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
      <span className="flex justify-between gap-2 text-[10px] font-bold"><span>{label}</span><span className="font-mono text-cyan-600 dark:text-cyan-300">{value} {unit}</span></span>
      <input aria-label={label} className="mt-2 w-full accent-cyan-500" type="range" min={min} max={max} step={step} value={value} onChange={event => set(Number(event.target.value))} />
    </label>
  );

  return <div className="flex w-full flex-col gap-3 p-3">
    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold">
      <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-cyan-700 dark:text-cyan-300">TOP DOWN · fixed radio link · diagram, not a geographic survey</span>
      <span className={`rounded-full px-2 py-1 ${model.remaining >= 0 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'}`}>{model.remaining >= 0 ? 'Estimated margin available' : 'Estimated fade risk'} · {model.remaining.toFixed(1)} dB</span>
    </div>

    <div className="relative h-[220px] overflow-hidden rounded-2xl border border-slate-700 bg-[#102b34]" aria-label="Top down map of the radio path">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 260" preserveAspectRatio="none" role="img" aria-label="Radio path from rooftop tower through obstacles to subscriber home">
        <defs><pattern id="mapGrid" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M 35 0 L 0 0 0 35" fill="none" stroke="#94a3b8" strokeOpacity=".12" /></pattern></defs>
        <rect width="700" height="260" fill="url(#mapGrid)" />
        <path d="M 0 212 Q 160 195 340 220 T 700 205" fill="none" stroke="#64748b" strokeWidth="27" strokeOpacity=".35" />
        <path d="M 80 130 L 620 130" stroke="#22d3ee" strokeWidth="3" strokeDasharray="7 5" />
        <ellipse cx="350" cy="130" rx="265" ry="54" fill="#22d3ee" fillOpacity=".08" stroke="#22d3ee" strokeOpacity=".4" strokeDasharray="5 5" />
        {showObstacle && <rect x="322" y="101" width="56" height="58" rx="6" fill={model.obstructionLoss ? '#f97316' : '#94a3b8'} fillOpacity=".8" />}
        {Array.from({ length: trees }).map((_, i) => <circle key={i} cx={285 + i * 68} cy={128 + (i % 2 ? 17 : -18)} r="22" fill="#22c55e" fillOpacity=".55" />)}
        {rain > 0 && Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M ${175 + i * 26} ${40 + i % 3 * 20} l -10 23`} stroke="#60a5fa" strokeWidth="2" strokeOpacity=".65" />)}
      </svg>
      <div className="absolute left-[4%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 rounded-xl border border-cyan-400/50 bg-slate-950/90 p-2 text-center text-cyan-300"><RadioTower className="h-7 w-7" /><span className="text-[9px] font-bold">Rooftop base station</span></div>
      <div className="absolute right-[3%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 rounded-xl border border-emerald-400/50 bg-slate-950/90 p-2 text-center text-emerald-300"><Home className="h-7 w-7" /><span className="text-[9px] font-bold">Subscriber home + CPE</span></div>
      <div data-packet-progress={position.toFixed(3)} className="absolute top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white bg-cyan-500 px-2 py-1 text-[9px] font-black text-slate-950 shadow-[0_0_20px_#22d3ee]" style={{ left: `${12 + position * 76}%` }}>{returning ? '← ACK' : 'DATA →'}</div>
      {showObstacle && <div className="absolute left-1/2 top-[19%] -translate-x-1/2 rounded bg-slate-950/80 px-2 py-1 text-[9px] font-bold text-amber-300"><Building2 className="mr-1 inline h-3 w-3" />Building</div>}
      {trees > 0 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-slate-950/80 px-2 py-1 text-[9px] font-bold text-emerald-300"><TreePine className="mr-1 inline h-3 w-3" />Foliage</div>}
    </div>

    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {slider('Link distance', distance, 'km', 0.5, 10, 0.5, setDistance)}
      {slider('Carrier frequency', frequency, 'GHz', 2, 70, 1, setFrequency)}
      {slider('Rain rate', rain, 'mm/h', 0, 100, 5, setRain)}
      {slider('Fade margin', fadeMargin, 'dB', 0, 50, 1, setFadeMargin)}
      {slider('Antenna height', antennaHeight, 'm', 5, 40, 1, setAntennaHeight)}
      {slider('Building height', obstacleHeight, 'm', 0, 35, 1, setObstacleHeight)}
      {slider('Trees in path', trees, '', 0, 4, 1, setTrees)}
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-900"><input type="checkbox" checked={showObstacle} onChange={event => setShowObstacle(event.target.checked)} /> Place building in path</label>
      <label className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-900">Rain polarization <select aria-label="Rain polarization" className="rounded border border-slate-500 bg-transparent p-1" value={polarization} onChange={event => setPolarization(event.target.value as 'H' | 'V')}><option value="H">Horizontal</option><option value="V">Vertical</option></select></label>
    </div>

    <div className="grid gap-2 text-[10px] leading-relaxed sm:grid-cols-2">
      <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/5 p-2"><strong>What the equipment does.</strong> The base station sends radio bursts. Rooftop CPE (customer premises equipment) receives them for the home router and sends replies. The moving marker represents a data packet or acknowledgement, not the radio wave itself.</div>
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-2"><strong>What the colors mean.</strong> The cyan dashed line is the direct radio path. The oval shows the first Fresnel zone. Orange building, green trees, and blue rain add estimated loss. The marker keeps moving even when the link is at risk: radio attenuation is not an animation freeze.</div>
      <div className="rounded-xl border border-slate-400/30 p-2"><strong>Current result.</strong> {risks.length ? risks.join('; ') + '. ' : 'No added obstacle or weather loss. '}First Fresnel radius at midpoint ≈ {model.fresnelRadius.toFixed(1)} m; 60% clearance ≈ {model.clearanceNeeded.toFixed(1)} m. Rain: k = {model.k.toFixed(4)}, α = {model.alpha.toFixed(3)} ({polarization}). Total illustrative impairment ≈ {model.impairment.toFixed(1)} dB versus {fadeMargin} dB fade margin.</div>
      <div className="rounded-xl border border-slate-400/30 p-2"><strong>Model limits.</strong> This is a teaching estimate, not a measured path prediction. Rain uses ITU-R P.838 coefficients but assumes the chosen rate across the whole path; gas absorption is a coarse frequency band estimate, and foliage and blocked Fresnel losses are illustrative. Actual design needs local terrain, antenna patterns, climate and full ITU methods. <a className="font-bold text-cyan-600 underline dark:text-cyan-300" href={sources[kind].url} target="_blank" rel="noreferrer">Study source: {sources[kind].label}</a></div>
    </div>
  </div>;
};
