import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  ExternalLink, 
  FileText, 
  Layers, 
  Radio, 
  Cpu, 
  ShieldCheck, 
  GitBranch, 
  Clock, 
  Hash, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import { MathFormula } from '../common/MathFormula';

interface TopicTheory {
  title: string;
  chapterRef: string;
  stallingsCitation: string;
  summary: string;
  keyConcepts: { heading: string; body: string; formula?: string }[];
  protocolStandardCallout?: string;
  reviewQuestions: string[];
}

const THEORY_DATABASE: Record<string, TopicTheory> = {
  'osi-model-basics': {
    title: 'OSI 7-Layer Protocol Architecture & Wireless Encapsulation',
    chapterRef: 'Section 1.4 & Chapter 11 Architecture',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 1 & Chapter 11',
    summary: 'The Open Systems Interconnection (OSI) reference model establishes a 7-layer modular framework for computer communications. Each layer performs a related subset of functions and relies on the next lower layer to perform more primitive functions. In wireless access systems (DECT, WLL, IEEE 802.16 WiMAX), Chapter 11 focuses primarily on the Physical (Layer 1) and Data Link (Layer 2) boundaries.',
    keyConcepts: [
      {
        heading: 'Protocol Data Units (PDUs) and Encapsulation',
        body: 'At each layer N, user data from layer N+1 is combined with Layer N control information (header, and occasionally trailer) to form an (N)-PDU. As data traverses down the stack on the transmitter, successive headers (AH, PH, SH, TH, NH, DH) are prepended. At the receiving entity, each layer strips its corresponding header and passes the remaining payload upward (decapsulation).',
        formula: '(N)\\text{-PDU} = \\text{Layer } N \\text{ Header} + (N+1)\\text{-PDU (Payload)} [ + \\text{Trailer}]',
      },
      {
        heading: 'Chapter 11 Wireless Focus: L1 Physical and L2 Data Link',
        body: 'In wireless communications, layers 3 through 7 are largely agnostic to the physical transmission medium. Chapter 11 addresses the two lowest layers: (1) Physical Layer—modulating bitstreams into RF electromagnetic carriers (e.g. 1.88–1.90 GHz for DECT, 2–11 GHz for WiMAX), and (2) Data Link Layer—framing, Medium Access Control (MAC) arbitration across a shared broadcast medium, error detection (CRC-32), and flow control (ARQ).',
      },
      {
        heading: 'Service Access Points (SAPs)',
        body: 'Adjacent layers communicate through standardized Service Access Points (SAPs). Layer N provides services to Layer N+1 through primitives such as Request, Indication, Response, and Confirm.',
      },
    ],
    protocolStandardCallout: 'DECT (§11.1) defines its Physical layer and Data Link Control (DLC) layer matching OSI L1/L2. Similarly, IEEE 802.16 (§11.3) defines a 2-sublayer MAC (Convergence Sublayer and Common Part Sublayer) directly above the 802.16 Physical layer.',
    reviewQuestions: [
      'Why are higher layers (Network, Transport, Application) largely unaffected when transitioning from wired Ethernet to wireless WiMAX?',
      'Explain how a trailer differ from a header in layer-2 encapsulation.',
      'What specific functions in IEEE 802.16 belong to the Data Link Layer rather than the Physical Layer?',
    ],
  },

  'pcm-voice-digitization': {
    title: 'Pulse Code Modulation (PCM) & Voice Digitization',
    chapterRef: 'Section 11.1 Cordless Systems — DECT Speech Coding',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.1 (DECT Speech Processing)',
    summary: 'Pulse Code Modulation (PCM) is the foundational technique for converting analog speech signals into digital bit streams. The human voice has significant energy up to 3.4 kHz, standardized in telephony as a 4 kHz bandwidth channel.',
    keyConcepts: [
      {
        heading: 'The Nyquist Sampling Theorem',
        body: 'To reconstruct an analog band-limited signal of maximum frequency f_max without aliasing, the sampling rate f_s must be at least twice the maximum frequency: f_s >= 2 * f_max. For standard 4 kHz telephone speech, the sampling frequency is exactly 8,000 samples per second (one sample every 125 microseconds).',
        formula: 'f_s \\ge 2 \\cdot f_{\\max} = 2 \\cdot 4\\text{ kHz} = 8{,}000\\text{ samples/sec} \\quad (T_s = 125\\;\\mu\\text{s})',
      },
      {
        heading: 'Quantization and 64 kbps DS0 Stream',
        body: 'Each analog sample is quantized into discrete digital voltage levels using 8 bits (256 discrete levels). At 8,000 samples/sec with 8 bits per sample, the standard digital telephone channel produces exactly 64 kbps, known worldwide as a DS0 channel.',
        formula: '\\text{Bit Rate} = 8{,}000\\text{ samples/s} \\times 8\\text{ bits/sample} = 64{,}000\\text{ bps (64 kbps)}',
      },
      {
        heading: 'Non-Linear Companding (A-law and μ-law) vs. ADPCM',
        body: 'Logarithmic companding (compression-expansion) allocates more quantization intervals to low-amplitude signals, maintaining a constant Signal-to-Quantization-Noise Ratio (SQNR) over a wide dynamic range. In DECT cordless systems (§11.1), Adaptive Differential PCM (ADPCM) is used to compress the 64 kbps PCM voice stream down to 32 kbps per voice channel by quantizing only sample-to-sample differences using 4 bits per sample.',
        formula: '\\text{DECT ADPCM Rate} = 8{,}000\\text{ samples/s} \\times 4\\text{ bits/sample} = 32\\text{ kbps}',
      },
    ],
    protocolStandardCallout: 'DECT speech channels utilize G.726 ADPCM at 32 kbps, allowing each 10 ms TDMA frame to carry 320 speech bits per time slot with negligible delay and high audio fidelity.',
    reviewQuestions: [
      'State the Nyquist theorem and explain why an 8 kHz sampling rate is sufficient for telephony.',
      'Why does non-linear companding offer superior perceived voice quality compared to linear uniform quantization?',
      'How does ADPCM achieve a 50% bandwidth reduction (32 kbps vs 64 kbps) in cordless telephone standards like DECT?',
    ],
  },

  'multipath-free-space-loss': {
    title: 'Multipath Propagation, Fading & Free-Space Path Loss',
    chapterRef: 'Section 11.2 Wireless Local Loop (WLL) Propagation',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 5 & Chapter 11.2',
    summary: 'Radio frequency signals propagating between a fixed wireless base station and subscriber transceivers experience path loss, shadowing, and multipath interference. Understanding these propagation mechanisms is vital for Wireless Local Loop (WLL) link budget design.',
    keyConcepts: [
      {
        heading: 'Free-Space Path Loss (Friis Formula)',
        body: 'In an idealized line-of-sight environment free from obstacles, signal power attenuates with the square of the distance (d) and the square of the carrier frequency (f). Higher carrier frequencies experience significantly higher atmospheric and free-space attenuation.',
        formula: 'L_{\\text{dB}} = 32.44 + 20\\log_{10}(f_{\\text{MHz}}) + 20\\log_{10}(d_{\\text{km}})',
      },
      {
        heading: 'Three Primary Propagation Mechanisms',
        body: '1. Reflection: Occurs when an electromagnetic wave impinges on a surface with dimensions large compared to the wavelength (e.g. ground, buildings).\n2. Diffraction: Occurs when the radio path between transmitter and receiver is obstructed by a dense body with sharp edges (knife-edge diffraction).\n3. Scattering: Occurs when waves impinge on obstacles with dimensions on the order of the wavelength or less (e.g. foliage, lampposts, rain).',
      },
      {
        heading: 'Multipath Interference and Delay Spread',
        body: 'Signals arrive at the receiving antenna along multiple paths with differing amplitudes and phases. If the phase difference is 180 degrees, destructive interference produces deep fading notches. Differences in arrival times produce delay spread, resulting in frequency-selective fading and intersymbol interference (ISI).',
      },
    ],
    protocolStandardCallout: 'WLL systems in §11.2 overcome multipath fading using high-gain directional antennas, spatial antenna diversity, adaptive equalization, and OFDM modulation (as standardized in IEEE 802.16).',
    reviewQuestions: [
      'If the carrier frequency is doubled from 2.5 GHz to 5.0 GHz, by how many decibels does the free-space path loss increase over the same distance?',
      'Distinguish between flat fading and frequency-selective fading in terms of coherence bandwidth.',
      'Explain how directional antennas at subscriber premises in WLL reduce multipath delay spread.',
    ],
  },

  'multiple-access-techniques-overview': {
    title: 'Multiple Access Techniques Overview & Duplexing Schemes',
    chapterRef: 'Chapter 11 Introduction & §11.1–§11.3',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11',
    summary: 'Multiple access enables multiple geographically distributed mobile or fixed subscribers to share a common transmission medium simultaneously. The four principal orthogonal domain divisions are Frequency (FDMA), Time (TDMA), Code (CDMA), and Demand-Assignment (DAMA).',
    keyConcepts: [
      {
        heading: 'Orthogonal Multiple Access Taxonomies',
        body: '• FDMA: The radio spectrum is divided into non-overlapping frequency sub-bands; each user is assigned a dedicated carrier.\n• TDMA: Users share a single frequency carrier but transmit in dedicated, non-overlapping cyclical time slots.\n• CDMA: Users transmit simultaneously across the entire frequency band; separation is achieved mathematically using mutually orthogonal pseudo-random code sequences.\n• DAMA: Transmission resources are assigned dynamically based on reservation requests.',
      },
      {
        heading: 'Duplexing: FDD vs. TDD',
        body: '• Frequency Division Duplex (FDD): Separate frequency bands are assigned for Uplink (subscriber to base station) and Downlink (base station to subscriber), requiring a duplexer filter.\n• Time Division Duplex (TDD): Uplink and Downlink share the exact same frequency band on an alternating time-slot basis. TDD offers flexible asymmetric bandwidth allocation (e.g. 3:1 downlink to uplink for web browsing).',
      },
    ],
    protocolStandardCallout: 'DECT (§11.1) utilizes Multi-Carrier TDMA with TDD: 10 RF carriers divided into 24 time slots (12 downlink, 12 uplink). IEEE 802.16 (§11.3) supports both FDD and TDD modes.',
    reviewQuestions: [
      'Contrast the advantages and disadvantages of TDD versus FDD in asymmetric Internet data traffic.',
      'Why does TDMA require stricter clock synchronization than FDMA?',
      'How does cell frequency reuse enhance system capacity in cellular and WLL deployments?',
    ],
  },

  'crc-arq-error-control': {
    title: 'Cyclic Redundancy Check (CRC) & ARQ Error Control',
    chapterRef: 'Section 11.3 IEEE 802.16 MAC Sublayer Error Control',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 8 & Chapter 11.3',
    summary: 'Wireless channels are inherently prone to burst errors due to atmospheric noise, multipath nulls, and interference. Error control combines forward detection (CRC) with Automatic Repeat Request (ARQ) retransmission protocols.',
    keyConcepts: [
      {
        heading: 'Cyclic Redundancy Check (Modulo-2 Polynomial Division)',
        body: 'A k-bit block of data is treated as coefficients of a polynomial M(X). The transmitter appends an (n-k)-bit Frame Check Sequence (FCS) such that the transmitted polynomial T(X) is exactly divisible by a predetermined generator polynomial P(X) using modulo-2 arithmetic (XOR without carries). At the receiver, T(X) is divided by P(X); a non-zero remainder indicates an error.',
        formula: 'T(X) = M(X) \\cdot X^{n-k} + R(X), \\quad \\text{where } R(X) = \\text{remainder}\\left[\\frac{M(X) \\cdot X^{n-k}}{P(X)}\\right]',
      },
      {
        heading: 'ARQ Protocols: Stop-and-Wait vs. Go-Back-N / Selective Repeat',
        body: '• Stop-and-Wait: Transmitter sends one frame and halts until an Acknowledgement (ACK) or Negative ACK (NACK) arrives, or a timeout expires.\n• Go-Back-N: Transmitter continuously transmits up to a window size W; a NACK causes retransmission of all frames starting from the corrupted frame.\n• Selective-Repeat: Only the specific frame that failed the CRC check is retransmitted, maximizing throughput over high bandwidth-delay product links.',
      },
      {
        heading: 'Header Check Sequence (HCS) in IEEE 802.16',
        body: 'IEEE 802.16 MAC frame headers include an 8-bit Header Check Sequence (HCS) generated with polynomial X^8 + X^2 + X + 1 to protect the critical header fields before inspecting the payload.',
      },
    ],
    protocolStandardCallout: 'IEEE 802.16 (§11.3) incorporates an optional ARQ mechanism at the MAC Common Part Sublayer with sliding-window sequence tracking and block-level fragmentation.',
    reviewQuestions: [
      'Given a data bitstream 110011 and generator polynomial P(X) = X^3 + X + 1 (1011), calculate the 3-bit CRC FCS.',
      'Explain why CRC-32 detects all single-bit, double-bit, and odd numbers of errors.',
      'Why is Selective-Repeat ARQ preferred over Stop-and-Wait ARQ in broadband wireless access systems?',
    ],
  },

  'fdma-mode': {
    title: 'Frequency Division Multiple Access (FDMA)',
    chapterRef: 'Section 11.2 WLL Multiple Access Schemes',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.2',
    summary: 'In FDMA, the allocated radio bandwidth is divided into discrete frequency sub-channels. Each active subscriber station is assigned an exclusive carrier frequency for the duration of the call or session.',
    keyConcepts: [
      {
        heading: 'Frequency Orthogonality & Guard Bands',
        body: 'Because distinct users transmit on physically separated carrier frequencies, simultaneous transmissions do not collide. Guard bands (unused buffer spectrum) are required between adjacent channels to accommodate practical filter roll-off characteristics and prevent adjacent-channel interference (ACI).',
        formula: 'B_{\\text{channel}} = B_{\\text{signal}} + 2 \\cdot B_{\\text{guard}}',
      },
      {
        heading: 'Linear Amplification & Intermodulation',
        body: 'When multiple carrier frequencies pass through a non-linear high-power amplifier (HPA) at a base station, intermodulation products are generated that cause out-of-band interference. Power amplifiers must be operated backed off from saturation, reducing power efficiency.',
      },
      {
        heading: 'Channel Capacity and Efficiency',
        body: 'The number of simultaneous FDMA channels N is constrained by the total available spectrum B_total and channel spacing B_channel: N = (B_total - 2*B_guard_band) / B_channel. FDMA suffers from trunking inefficiency when channels sit idle.',
      },
    ],
    protocolStandardCallout: 'Analog cordless systems (CT1, CT2 in §11.1) and early WLL architectures relied primarily on FDMA frequency channelization.',
    reviewQuestions: [
      'Why are guard bands necessary in FDMA, and what impact do they have on spectral efficiency?',
      'Explain the phenomenon of intermodulation distortion in FDMA base stations.',
      'Compare the equipment complexity of an FDMA mobile terminal with a TDMA mobile terminal.',
    ],
  },

  'tdma-mode': {
    title: 'Time Division Multiple Access (TDMA)',
    chapterRef: 'Section 11.1 Cordless Systems — DECT Frame Structure',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.1',
    summary: 'TDMA divides a single radio frequency carrier into recurring cyclical time frames, each subdivided into a fixed number of time slots. Each user is assigned a specific time slot in each frame, transmitting in short high-speed bursts.',
    keyConcepts: [
      {
        heading: 'DECT TDMA Frame Structure (§11.1)',
        body: 'DECT defines a 10 ms recurring frame divided into 24 full time slots (numbered 0 to 23). Time slots 0–11 are reserved for downlink (base station to handset), and slots 12–23 for uplink (handset to base station), implementing Time Division Duplex (TDD). Each slot has a duration of 416.7 microseconds carrying 480 bits.',
        formula: 'T_{\\text{frame}} = 10\\text{ ms}, \\quad T_{\\text{slot}} = \\frac{10\\text{ ms}}{24} = 416.7\\;\\mu\\text{s}, \\quad R_{\\text{burst}} = 1.152\\text{ Mbps}',
      },
      {
        heading: 'Preamble, Sync Word, and Guard Times',
        body: 'Each burst begins with a synchronization preamble to allow the receiver bit clock to lock on, followed by a unique word for frame alignment. A guard time (e.g. 52 bits in DECT) concludes the slot to absorb timing discrepancies due to differing propagation delays from distant terminals.',
      },
      {
        heading: 'Advantages of TDMA',
        body: '• Single transmitter/receiver per carrier simplifies base station RF hardware.\n• No intermodulation distortion allows power amplifiers to operate near maximum saturation efficiency.\n• Dynamic slot allocation permits flexible aggregation of multiple slots for high-speed data.',
      },
    ],
    protocolStandardCallout: 'DECT (§11.1) combines 10 RF carriers with 24-slot TDMA/TDD, supporting up to 120 simultaneous duplex voice calls in a 20 MHz band without frequency planning.',
    reviewQuestions: [
      'Why do TDMA bursts require a guard time between consecutive slots?',
      'Calculate the raw transmission bit rate of DECT given 480 bits per slot and 24 slots per 10 ms frame.',
      'How does TDMA simplify handover and radio signal strength measurement compared to FDMA?',
    ],
  },

  'cdma-mode': {
    title: 'Code Division Multiple Access (CDMA) & Spread Spectrum',
    chapterRef: 'Section 11.2 WLL Multiple Access Schemes — CDMA',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 7 & Chapter 11.2',
    summary: 'CDMA permits all users to transmit simultaneously over the entire available bandwidth. Each subscriber transmission is modulated by a unique, orthogonal mathematical spreading code (e.g. Walsh code sequence).',
    keyConcepts: [
      {
        heading: 'Direct Sequence Spread Spectrum (DSSS)',
        body: 'The narrowband information bitstream (rate R_b) is multiplied by a high-rate pseudo-random binary sequence known as the chipping sequence (rate R_c >> R_b). The ratio of the chip rate to the bit rate is the Processing Gain (G_p), which determines the system jam resistance and interference tolerance.',
        formula: 'G_p = \\frac{B_{\\text{spread}}}{B_{\\text{info}}} = \\frac{R_c}{R_b} = \\frac{T_b}{T_c}, \\quad G_{p(\\text{dB})} = 10\\log_{10}(G_p)',
      },
      {
        heading: 'Orthogonal Walsh Code Sequences',
        body: 'Walsh codes generated via Hadamard matrices possess zero cross-correlation: the inner product of any two distinct Walsh codes W_i and W_j is exactly zero. At the receiver, multiplying the composite signal by the matching user Walsh code and integrating over the bit period recovers the desired data while canceling all other user transmissions.',
        formula: '\\sum_{k=0}^{N-1} W_i[k] \\cdot W_j[k] = \\begin{cases} N & \\text{if } i = j \\\\ 0 & \\text{if } i \\ne j \\end{cases}',
      },
      {
        heading: 'The Near-Far Problem and Fast Closed-Loop Power Control',
        body: 'If all subscribers transmit at equal power, a mobile close to the base station will overwhelm signals from distant mobiles. CDMA requires rapid closed-loop power control (up to 800–1500 power adjustments per second) so that all subscriber signals arrive at the base station antenna at equal power levels.',
      },
    ],
    protocolStandardCallout: 'IS-95 and cdma2000-based WLL systems (§11.2) use Walsh code sets of length 64 or 128 chips on the downlink and fast open/closed-loop power control on the uplink.',
    reviewQuestions: [
      'Show mathematically why two Walsh codes W1 = [+1, -1, +1, -1] and W2 = [+1, +1, -1, -1] are mutually orthogonal.',
      'Explain the near-far problem and describe how closed-loop power control resolves it in CDMA.',
      'What is processing gain, and how does it protect a CDMA receiver against multipath interference?',
    ],
  },

  'dama-mode': {
    title: 'Demand-Assignment Multiple Access (DAMA)',
    chapterRef: 'Section 11.3 IEEE 802.16 Broadband Wireless Access',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.3',
    summary: 'Unlike fixed pre-assigned FDMA/TDMA, DAMA allocates transmission time slots or sub-carriers on demand based on current subscriber queue depths. In broadband systems like IEEE 802.16 WiMAX, DAMA provides quality-of-service (QoS) guarantees for heterogeneous traffic types.',
    keyConcepts: [
      {
        heading: 'Uplink Bandwidth Reservation Protocol',
        body: '1. Subscriber stations contend for bandwidth request mini-slots or piggyback Bandwidth Requests on existing data frames.\n2. The base station MAC scheduler evaluates requests against Quality of Service (QoS) service flows.\n3. The base station broadcasts an Uplink Bandwidth Allocation MAP (UL-MAP) frame defining the exact transmission offsets and durations granted to each subscriber.',
      },
      {
        heading: 'IEEE 802.16 QoS Service Classes (§11.3)',
        body: '• Unsolicited Grant Service (UGS): Periodic fixed-size grants for real-time constant bit rate traffic (e.g. VoIP without silence suppression) with zero contention delay.\n• Real-Time Polling Service (rtPS): Periodic unicast request opportunities for variable bit rate real-time streams (e.g. MPEG video).\n• Non-Real-Time Polling Service (nrtPS): Guaranteed periodic polling with occasional contention for delay-tolerant large file transfers.\n• Best Effort (BE): Contention-based request opportunities for general web browsing and background traffic.',
      },
      {
        heading: 'Connection-Oriented MAC Layer',
        body: 'All communication in IEEE 802.16 is connection-oriented. Each service flow is assigned a 16-bit Connection Identifier (CID), enabling the base station scheduler to enforce strict bandwidth, latency, and jitter guarantees.',
      },
    ],
    protocolStandardCallout: 'IEEE 802.16 (§11.3) defines an elaborate DAMA mechanism governed by the UL-MAP and DL-MAP messages transmitted at the start of each MAC frame.',
    reviewQuestions: [
      'Why is DAMA significantly more spectrally efficient than static TDMA for bursty Internet web traffic?',
      'Explain the operation of the UL-MAP frame in IEEE 802.16 broadband wireless access.',
      'How does Unsolicited Grant Service (UGS) eliminate uplink contention overhead for VoIP calls?',
    ],
  },

  'unscheduled-contention-mode': {
    title: 'Unscheduled Contention Mode & ALOHA Protocol Analysis',
    chapterRef: 'Section 11.2 & Appendix C Access Protocols',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 10 & Chapter 11.2',
    summary: 'In unscheduled contention multiple access, subscriber terminals transmit packets asynchronously whenever data is generated without prior scheduling or central coordination. When two or more terminals transmit overlapping packets, a collision occurs and all colliding packets are corrupted.',
    keyConcepts: [
      {
        heading: 'Pure ALOHA vs. Slotted ALOHA',
        body: '• Pure ALOHA: Subscribers transmit immediately upon packet generation. The collision window is twice the packet transmission time (2 * T_p). Maximum theoretical throughput is 1 / (2e) ≈ 18.4% of total channel capacity.\n• Slotted ALOHA: Time is divided into discrete slots equal to packet duration T_p; transmissions must start at slot boundaries. The collision window is halved to T_p, doubling maximum throughput to 1 / e ≈ 36.8%.',
        formula: 'S_{\\text{Pure}} = G \\cdot e^{-2G} \\quad (S_{\\max} = 18.4\\% \\text{ at } G = 0.5), \\qquad S_{\\text{Slotted}} = G \\cdot e^{-G} \\quad (S_{\\max} = 36.8\\% \\text{ at } G = 1.0)',
      },
      {
        heading: 'Randomized Exponential Backoff',
        body: 'When a collision is detected (indicated by lack of an ACK from the base station), terminals do not retransmit immediately—doing so would guarantee repeated collisions. Instead, terminals wait for a randomized backoff interval uniformly chosen from [0, 2^k - 1] slot times before re-attempting.',
      },
      {
        heading: 'Instability Under Heavy Offered Load',
        body: 'As the offered traffic load G exceeds the optimum point, collisions multiply, triggering cascading retransmissions that drive effective throughput S toward zero. Wireless systems use contention only for initial network entry or bandwidth reservation, never for bulk data transfer.',
      },
    ],
    protocolStandardCallout: 'IEEE 802.16 (§11.3) uses truncated binary exponential backoff in dedicated Ranging and Bandwidth Request contention mini-slots.',
    reviewQuestions: [
      'Why is the collision vulnerability period of Pure ALOHA twice the packet duration?',
      'If the offered load G in Slotted ALOHA is 0.5 packets/slot, calculate the throughput S.',
      'Explain why pure contention protocols are unsuitable for voice or real-time multimedia wireless traffic.',
    ],
  },
};

export const TheoryView: React.FC = () => {
  const { selectedTopic, activeSubStepIndex } = useApp();

  const theory = THEORY_DATABASE[selectedTopic.id];

  if (!theory) {
    return (
      <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center select-none overflow-y-auto no-pan">
        <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md">
          <BookOpen className="h-10 w-10 text-cyan-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Textbook Theory Excerpt
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Theoretical analysis and textbook derivations for <strong>{selectedTopic.title}</strong> will be loaded in the next curriculum phase.
          </p>
          <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 p-2 rounded-lg border border-cyan-200 dark:border-cyan-800">
            Source: William Stallings, Wireless Communications and Networks, 2nd ed.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-5 select-none overflow-y-auto no-pan gap-4 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              Textbook Reference & Formal Analysis
            </span>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {theory.chapterRef}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          {theory.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          {theory.summary}
        </p>

        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>Citation: {theory.stallingsCitation}</span>
        </div>
      </div>

      {/* Key Concepts with Formulas */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Key Principles & Analytical Formulations
        </h3>

        {theory.keyConcepts.map((concept, idx) => {
          const isCurrentStep = activeSubStepIndex === idx;
          return (
            <div 
              key={idx}
              id={`theory-concept-${idx}`}
              className={`rounded-2xl p-4 transition-all duration-300 ${
                isCurrentStep
                  ? 'bg-cyan-50/80 dark:bg-slate-900/95 border-2 border-cyan-500 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-400'
                  : 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 rounded-md items-center justify-center font-mono text-xs font-bold ${
                    isCurrentStep ? 'bg-cyan-500 text-slate-950' : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{concept.heading}</span>
                </div>
                {isCurrentStep && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/30">
                    Active Syllabus Step #{idx + 1}
                  </span>
                )}
              </h4>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                {concept.body}
              </p>

              {concept.formula && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800/80 overflow-x-auto text-center shadow-inner">
                  <MathFormula tex={concept.formula} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chapter 11 Protocol Standard Callout */}
      {theory.protocolStandardCallout && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Chapter 11 Protocol Implementation Context:</span>
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-mono">
            {theory.protocolStandardCallout}
          </p>
        </div>
      )}

      {/* Self-Assessment Review Questions */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-2">
          <span>Stallings Textbook Review Questions:</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          {theory.reviewQuestions.map((q, i) => (
            <li key={i} className="leading-relaxed">
              <span className="text-slate-800 dark:text-slate-200">{q}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
