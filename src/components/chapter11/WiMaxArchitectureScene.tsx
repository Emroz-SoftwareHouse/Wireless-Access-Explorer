import React from 'react';
import { Building2, Cable, Home, RadioTower, Router, UserRound } from 'lucide-react';

const WAYPOINTS = [
  { x: 13, y: 31 }, { x: 35, y: 31 }, { x: 63, y: 67 }, { x: 87, y: 67 },
];

export const WiMaxArchitectureScene: React.FC<{ simTime: number }> = ({ simTime }) => {
  const progress = (simTime % 8) / 8;
  const segment = Math.min(2, Math.floor(progress * 3));
  const portion = progress * 3 - segment;
  const x = WAYPOINTS[segment].x + (WAYPOINTS[segment + 1].x - WAYPOINTS[segment].x) * portion;
  const y = WAYPOINTS[segment].y + (WAYPOINTS[segment + 1].y - WAYPOINTS[segment].y) * portion;
  const stage = segment === 0 ? 'Home LAN' : segment === 1 ? '802.16 radio hop' : 'Operator backhaul';

  return <div className="h-full w-full overflow-x-auto p-2 sm:p-4">
    <p className="sticky left-0 mb-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 sm:hidden">Swipe the map → to follow the packet to the tower and core</p>
    <div className="min-w-[580px]">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold"><span>Top-down neighborhood · follow one home data packet</span><span className="text-slate-500">Illustration, not a coverage survey</span></div>
      <div className="relative h-52 overflow-hidden rounded-xl border border-slate-300 bg-[#dce8d6] dark:border-slate-700 dark:bg-[#1b3535]">
        <div className="absolute inset-x-0 top-[48%] h-[19%] border-y-2 border-dashed border-slate-400/60 bg-slate-400/45" />
        <div className="absolute inset-y-0 left-[47%] w-[12%] border-x-2 border-dashed border-slate-400/60 bg-slate-400/45" />
        <div className="absolute left-[4%] top-[8%] h-16 w-[34%] rounded-lg border border-emerald-700/25 bg-emerald-800/10" />
        <div className="absolute right-[4%] bottom-[7%] h-14 w-[31%] rounded-lg border border-emerald-700/25 bg-emerald-800/10" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="13,31 35,31 63,67 87,67" fill="none" stroke="#0891b2" strokeWidth="1.1" strokeDasharray="2 1.5" />
          <line x1="35" y1="31" x2="63" y2="67" stroke="#22d3ee" strokeWidth="3.2" opacity=".22" />
        </svg>
        <div className="absolute left-[12%] top-[28%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-cyan-400 shadow-[0_0_14px_#22d3ee]" style={{ left: `${x}%`, top: `${y}%` }} data-packet-progress={progress.toFixed(3)} aria-label={`Data packet at ${stage}`} />
        <div className="absolute left-[7%] top-[10%] flex flex-col items-center rounded-lg border border-cyan-400 bg-white/95 p-1.5 text-[9px] font-bold shadow dark:bg-slate-900"><Home className="h-5 w-5 text-cyan-600" />Home users</div>
        <div className="absolute left-[29%] top-[10%] flex flex-col items-center rounded-lg border border-cyan-400 bg-white/95 p-1.5 text-[9px] font-bold shadow dark:bg-slate-900"><Router className="h-5 w-5 text-cyan-600" />Roof CPE</div>
        <div className="absolute left-[56%] bottom-[7%] flex flex-col items-center rounded-lg border border-violet-400 bg-white/95 p-1.5 text-[9px] font-bold shadow dark:bg-slate-900"><RadioTower className="h-5 w-5 text-violet-600" />802.16 base</div>
        <div className="absolute right-[6%] bottom-[7%] flex flex-col items-center rounded-lg border border-emerald-400 bg-white/95 p-1.5 text-[9px] font-bold shadow dark:bg-slate-900"><Building2 className="h-5 w-5 text-emerald-600" />Operator core</div>
        <div className="absolute bottom-1 left-2 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-bold dark:bg-slate-900/80">Blue dashed path = packet route · cyan band = radio hop</div>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5 text-[10px]">
        <div className="rounded-lg bg-cyan-500/10 p-2"><UserRound className="mb-1 h-3.5 w-3.5" /><strong>Home LAN</strong><br />The user's laptop or phone creates data.</div>
        <div className="rounded-lg bg-cyan-500/10 p-2"><Router className="mb-1 h-3.5 w-3.5" /><strong>Subscriber station</strong><br />Roof CPE converts local traffic to 802.16 radio.</div>
        <div className="rounded-lg bg-violet-500/10 p-2"><RadioTower className="mb-1 h-3.5 w-3.5" /><strong>Base station</strong><br />Coordinates radio access for many homes.</div>
        <div className="rounded-lg bg-emerald-500/10 p-2"><Cable className="mb-1 h-3.5 w-3.5" /><strong>Core + backhaul</strong><br />Carries traffic onward to public networks.</div>
      </div>
    </div>
  </div>;
};
