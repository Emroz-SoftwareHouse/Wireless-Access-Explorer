import React, { useState } from 'react';
import { BookOpen, Eye, Lightbulb, MoveRight, Pause, Play, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHAPTER11_SCENE_NOTES } from './chapter11/sceneNotes';

const CATEGORY_GUIDES = {
  fundamentals: {
    watch: 'Follow the bright colored signal from left to right. The highlighted stage is the operation happening now.',
    why: 'Each stage changes, protects, or transports the information before the next stage can use it.',
    result: 'The receiver should recover the same useful information that the sender produced.',
  },
  multiple_access: {
    watch: 'Watch which device is allowed to send and what separates users: frequency, time, code, or a grant.',
    why: 'Several people share one wireless medium, so the system needs a rule that prevents or resolves collisions.',
    result: 'A correctly coordinated packet reaches the base station without interfering with another user.',
  },
  cordless: {
    watch: 'Cyan means base station to handset; green means handset to base station; amber is a wait or guard interval.',
    why: 'A low-cost cordless handset shares limited radio spectrum and cannot transmit and receive at the same instant.',
    result: 'Voice and control data move both ways while using simple, inexpensive radio hardware.',
  },
  wll: {
    watch: 'Follow the labeled RF packet between the tower and the person. Red shows signal loss or an obstructed path.',
    why: 'A fixed wireless link replaces the copper subscriber cable, but weather and obstacles still affect the radio path.',
    result: 'A clear, correctly engineered path delivers reliable broadband to the subscriber.',
  },
  wimax: {
    watch: 'Follow the labeled request or data block. Pink is control and scheduling; green means granted or delivered.',
    why: 'The base station coordinates every subscriber so voice, video, files, and web traffic receive suitable service.',
    result: 'Each connection gets an identifiable, protected, and correctly scheduled MAC transmission.',
  },
} as const;

const SPECIAL_GUIDES: Record<string, { watch: string; why: string; result: string }> = {
  'tdma-tdd-vs-tdma-fdma': {
    watch: 'A moving person creates reflected copies of the signal. If they cancel at Antenna A, its path turns red; Antenna B remains green.',
    why: 'This brief cancellation is fast fading. Two spaced antennas rarely experience the same deep fade at the same moment.',
    result: 'The base station selects the stronger antenna. With TDD, the same-frequency return path is strong too.',
  },
  'time-division-duplex-simple-tdd': {
    watch: 'First the base station sends a cyan burst, then both radios wait, then the handset sends a green burst back.',
    why: 'The guard interval gives echoes time to disappear and lets each radio switch safely between transmit and receive.',
    result: 'One frequency carries both directions without the two bursts colliding.',
  },
  'differential-quantization-dpcm-adpcm': {
    watch: 'Follow one voice sample through prediction, subtraction, 4-bit quantization, and reconstruction.',
    why: 'Neighboring speech samples are similar, so sending only the small prediction error needs fewer bits.',
    result: 'ADPCM preserves understandable speech at 32 kbps instead of 64 kbps PCM.',
  },
  'fresnel-zone': {
    watch: 'The dashed oval is the full first Fresnel zone. The green center is the minimum 60% clearance area.',
    why: 'A building can disturb the radio wave even when the thin visual line between antennas still appears clear.',
    result: 'Raise or move an antenna until the green clearance zone no longer touches the obstacle.',
  },
  'rain-attenuation-calculator': {
    watch: 'Increase rain rate or path length and watch the remaining signal power decrease.',
    why: 'Millimeter-size raindrops absorb and scatter millimeter-wave energy along the entire link.',
    result: 'The fade margin must exceed the calculated rain loss to keep the link available.',
  },
  'orthogonal-frequency-division-multiplexing-ofdm': {
    watch: 'The fast input is split across many narrow subcarriers; each bar carries a slower part of the same message.',
    why: 'Longer symbols plus a cyclic prefix prevent delayed echoes from overlapping the next symbol.',
    result: 'The receiver recombines the subcarriers into the original high-speed data stream.',
  },
  'mac-service-flows-bandwidth-grants': {
    watch: 'The subscriber asks first, the scheduler checks QoS, a grant returns, and only then does the payload move.',
    why: 'Central permission prevents subscribers from transmitting over one another on the uplink.',
    result: 'The granted burst arrives in its assigned time and bandwidth.',
  },
  'fragmentation-reassembly': {
    watch: 'FIRST, MIDDLE, and LAST fragments move in sequence; FSN numbers show their exact order.',
    why: 'A large message may not fit inside one available radio grant.',
    result: 'The receiver joins the numbered fragments back into the original message.',
  },
};

export const SimulationGuide: React.FC = () => {
  const { selectedTopic, activeSubStepIndex, simPlaying } = useApp();
  const [explanationOpen, setExplanationOpen] = useState(false);
  const guide = SPECIAL_GUIDES[selectedTopic.id] || CATEGORY_GUIDES[selectedTopic.categoryId];
  const step = selectedTopic.subSteps[activeSubStepIndex] || selectedTopic.subSteps[0];
  const note = CHAPTER11_SCENE_NOTES[selectedTopic.id];

  return (
    <div className="relative z-20 border-t border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-[#090d1c] shrink-0">
      {note && <button type="button" aria-expanded={explanationOpen} onClick={() => setExplanationOpen(value => !value)} className="mb-1 flex w-full items-center justify-between gap-2 rounded-lg bg-violet-500/10 px-2 py-1.5 text-left text-[11px] font-semibold text-violet-800 hover:bg-violet-500/20 dark:text-violet-200"><span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 shrink-0" /> Explain this scene: {note.action}</span><span className="shrink-0 font-black">{explanationOpen ? 'Close' : 'Details'}</span></button>}
      {note && explanationOpen && <div className="absolute bottom-full left-2 right-2 max-h-[min(65vh,450px)] overflow-y-auto rounded-xl border border-violet-400/40 bg-white p-3 text-[12px] leading-relaxed shadow-2xl dark:bg-[#111a2c]">
        <div className="mb-2 flex items-center justify-between"><strong className="text-sm">{selectedTopic.title} · what you are seeing</strong><button type="button" aria-label="Close explanation" onClick={() => setExplanationOpen(false)} className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700"><X className="h-4 w-4" /></button></div>
        <div className="grid gap-2 sm:grid-cols-2"><p><strong>Who / what:</strong> {note.actors}</p><p><strong>What happens:</strong> {note.action}</p><p><strong>Try this:</strong> {note.change}</p><p><strong>Keep in mind:</strong> {note.caution}</p></div>
      </div>}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[auto_1.25fr_1fr_1fr]">
        <div className={`flex min-w-[74px] items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[9px] font-black uppercase tracking-wider ${simPlaying ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
          {simPlaying ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
          {simPlaying ? 'Moving' : 'Paused'}
        </div>
        <div className="min-w-0 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1.5">
          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300"><MoveRight className="h-3 w-3" />Now · Step {activeSubStepIndex + 1}</div>
          <div className="truncate text-[10px] font-bold text-slate-800 dark:text-slate-100" title={step}>{step}</div>
        </div>
        <div className={`min-w-0 rounded-lg border border-violet-400/25 bg-violet-500/5 px-2.5 py-1.5 ${note ? 'hidden sm:block' : ''}`}>
          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300"><Eye className="h-3 w-3" />Watch</div>
          <div className="line-clamp-2 text-[9px] leading-tight text-slate-600 dark:text-slate-300">{guide.watch}</div>
        </div>
        <div className={`min-w-0 rounded-lg border border-emerald-400/25 bg-emerald-500/5 px-2.5 py-1.5 ${note ? 'hidden sm:block' : ''}`}>
          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300"><Lightbulb className="h-3 w-3" />Why → Result</div>
          <div className="line-clamp-2 text-[9px] leading-tight text-slate-600 dark:text-slate-300">{guide.why} {guide.result}</div>
        </div>
      </div>
    </div>
  );
};
