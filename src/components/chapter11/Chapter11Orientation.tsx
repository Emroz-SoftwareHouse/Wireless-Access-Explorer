import React, { useState } from 'react';
import { Building2, ChevronDown, Home, RadioTower, Smartphone, Wifi } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SYSTEMS = [
  {
    id: 'cordless', title: 'Cordless phone', section: '11.1', icon: Smartphone,
    place: 'Inside a home or office', path: 'Handset → nearby base → telephone line',
    job: 'Lets a person walk around while making a telephone call.',
    limitation: 'The short radio hop ends at its own local base. It is not a town-wide access network.',
    topic: 'time-division-duplex-simple-tdd',
  },
  {
    id: 'wll', title: 'Wireless local loop', section: '11.2', icon: Home,
    place: 'Across a street or district', path: 'Home rooftop unit → operator tower → public network',
    job: 'Replaces the cable between a fixed subscriber and the operator.',
    limitation: 'The radio path still needs coverage, capacity, and sometimes a clear Fresnel zone.',
    topic: 'the-role-of-wll',
  },
  {
    id: 'wimax', title: 'IEEE 802.16 / WiMAX', section: '11.3', icon: Wifi,
    place: 'Across a provider coverage area', path: 'Subscriber station ⇄ base station ⇄ core network',
    job: 'Defines broadband radio access, scheduling, and service quality used for WLL.',
    limitation: 'WiMAX is one way to implement WLL; the two are not competing service categories.',
    topic: '802-16-system-reference-architecture',
  },
] as const;

export const Chapter11Orientation: React.FC = () => {
  const { selectedTopic, setSelectedTopicId } = useApp();
  const [open, setOpen] = useState(false);
  if (!['cordless', 'wll', 'wimax'].includes(selectedTopic.categoryId)) return null;

  return <div className="relative z-30 shrink-0 border-t border-cyan-400/25 bg-cyan-50/90 px-2 py-1.5 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
    <button type="button" aria-expanded={open} onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-left hover:bg-cyan-500/10">
      <span className="text-[11px] font-semibold"><strong>Chapter 11 map:</strong> Cordless is a nearby handset link. WLL connects a fixed home. WiMAX can provide the radio system for WLL.</span>
      <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">Compare <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} /></span>
    </button>
    {open && <div className="absolute bottom-full left-2 right-2 max-h-[min(40vh,300px)] overflow-y-auto rounded-2xl border border-cyan-400/40 bg-white p-3 shadow-2xl dark:bg-[#10192b]">
      <div className="mb-3 flex items-center gap-2 text-xs font-black"><Building2 className="h-4 w-4 text-cyan-500" /> One neighborhood, three different jobs</div>
      <div className="grid gap-2 md:grid-cols-3">
        {SYSTEMS.map(system => <button key={system.id} type="button" onClick={() => { setSelectedTopicId(system.topic); setOpen(false); }} className={`rounded-xl border p-3 text-left transition-colors hover:border-cyan-400 ${selectedTopic.categoryId === system.id ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
          <div className="mb-2 flex items-center gap-2"><span className="rounded-lg bg-cyan-500/15 p-2"><system.icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" /></span><span><strong className="block text-xs">{system.title}</strong><small className="text-slate-500">Section {system.section}</small></span></div>
          <div className="mb-2 rounded-lg bg-slate-100 p-2 text-[10px] font-semibold dark:bg-slate-800"><RadioTower className="mr-1 inline h-3 w-3" />{system.path}</div>
          <p className="mb-1 text-[11px]"><strong>Where:</strong> {system.place}</p>
          <p className="mb-1 text-[11px]"><strong>Why use it:</strong> {system.job}</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300"><strong>Watch for:</strong> {system.limitation}</p>
        </button>)}
      </div>
      <p className="mt-3 rounded-lg bg-amber-500/10 p-2 text-[11px]"><strong>Choose by need:</strong> A cordless handset adds mobility around one base. WLL avoids running a new local cable to a fixed building. IEEE 802.16 specifies a broadband wireless access technology that an operator may use to deliver WLL. The best access technology depends on terrain, spectrum, capacity, cost, and existing cable.</p>
    </div>}
  </div>;
};
