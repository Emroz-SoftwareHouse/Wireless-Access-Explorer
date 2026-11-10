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
import { CHAPTER11_THEORY } from './chapter11Theory';

export interface TopicTheory {
  title: string;
  chapterRef: string;
  stallingsCitation: string;
  summary: string;
  keyConcepts: { heading: string; body: string; formula?: string }[];
  protocolStandardCallout?: string;
  reviewQuestions: string[];
}

const chapter11Pdf = '/assets/aistudio/pdfcoffee.com_wireless-communications-and-networking-by-william-stallings-2nd-edition-pdf-free_compressed_6bc17066.pdf';
const chapter11Sources: Record<string, { label: string; url: string }> = {
  cordless: { label: 'ETSI DECT standards and specifications', url: 'https://www.etsi.org/technical-groups/dect/' },
  wll: { label: 'ITU-R P.530 fixed radio link guidance', url: 'https://www.itu.int/rec/R-REC-P.530' },
  wimax: { label: 'IEEE 802.16 standard overview', url: 'https://standards.ieee.org/ieee/485/6996/' },
};

const StudyLinks: React.FC<{ categoryId: string }> = ({ categoryId }) => {
  const source = chapter11Sources[categoryId];
  if (!source) return null;
  return <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
    <a href={chapter11Pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 px-2.5 py-1.5 text-cyan-700 underline dark:text-cyan-300"><FileText className="h-3 w-3" />Open Chapter 11 textbook PDF</a>
    <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 px-2.5 py-1.5 text-cyan-700 underline dark:text-cyan-300"><ExternalLink className="h-3 w-3" />{source.label}</a>
  </div>;
};

const THEORY_DATABASE: Record<string, TopicTheory> = {
  ...CHAPTER11_THEORY,
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

  'time-division-duplex-simple-tdd': {
    title: 'Time Division Duplex (Simple TDD) & Transmission Rate Formulations',
    chapterRef: 'Section 11.1 Cordless Systems — Time Division Duplex',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.1 (pp. 319-321)',
    summary: 'In the technique of Time Division Duplex (TDD), also known as time-compression multiplexing (TCM), data are transmitted in one direction at a time, with transmission alternating between the two directions. TDD was originally developed for digital subscriber lines (ISDN ping-pong transmission) and has become a cornerstone of modern cordless telephony (DECT) and broadband wireless access (IEEE 802.16).',
    keyConcepts: [
      {
        heading: 'Burst Transmission Time (Tb) and Block Size (B)',
        body: 'A continuous user bit stream at effective rate R is divided into discrete blocks of size B bits. Each block is compressed and transmitted at a higher actual bit rate A over burst duration Tb = B / A. Because transmission alternates between forward and reverse directions, the effective rate is governed by the full cycle period.',
        formula: 'R = \\frac{B}{2(T_p + T_b + T_g)} \\quad \\Longleftrightarrow \\quad T_b = \\frac{B}{A}',
      },
      {
        heading: 'Propagation Delay (Tp) over Transmission Distance',
        body: 'The radio wave travels the physical link distance d at the speed of light c = 3 × 10⁸ m/s, introducing a one-way propagation delay Tp = d / c. In indoor cordless environments (d < 200 m), Tp is under 1 microsecond; in WLL fixed wireless loops (d up to 10 km), Tp reaches tens of microseconds and represents a non-negligible fraction of the frame.',
        formula: 'T_p = \\frac{d}{c} = \\frac{d}{3 \\times 10^8\\text{ m/s}}',
      },
      {
        heading: 'Channel Turnaround Guard Time (Tg)',
        body: 'Following each burst, a quiescent guard interval Tg gives the radios time to switch direction and prevents delayed energy from one turn overlapping the next. The required guard depends on the actual path and equipment; this lesson does not assume a universal minimum.',
      },
      {
        heading: 'Actual Transmission Data Rate Formula (A)',
        body: 'Combining block size B = A · Tb with the effective subscriber data rate R yields Stallings\' fundamental TDD rate equation. To deliver an effective two-way data rate R, the actual burst rate on the radio medium must exceed 2R by a factor proportional to the propagation and guard overhead.',
        formula: 'A = 2R \\left(1 + \\frac{T_p + T_g}{T_b}\\right)',
      },
    ],
    protocolStandardCallout: 'In DECT (§11.1), each 10 ms TDMA frame is split into 12 forward and 12 reverse time slots. The actual transmission rate on the radio carrier is 1.152 Mbps to accommodate 24 channels of 32 kbps voice plus framing, guard times, and synchronization overhead.',
    reviewQuestions: [
      'Explain the trade-off in selecting block size B: how does larger B affect data rate A versus buffering delay?',
      'Why is guard time Tg strictly necessary in time division duplex transmission?',
      'Calculate the required medium data rate A if effective subscriber rate R = 64 kbps, Tb = 2.0 ms, Tp = 0.2 ms, and Tg = 0.4 ms.',
    ],
  },

  'tdma-tdd-vs-tdma-fdma': {
    title: 'TDMA/TDD vs. TDMA/FDMA: Diversity & Dynamic Capacity',
    chapterRef: 'Section 11.1 Cordless Systems — TDMA/TDD Advantages',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.1 (pp. 321-322)',
    summary: 'Cordless design balances modest range, low cost, and limited spectrum. TDMA/TDD alternates directions on one carrier. Compared with separate-frequency duplexing, it can make recent antenna measurements more useful for a prompt reply and can shift time slots toward the busier direction.',
    keyConcepts: [
      {
        heading: 'RF Duplexer Elimination and Handset Simplification',
        body: 'In dual-carrier FDD, handsets must transmit and receive simultaneously on different frequencies, necessitating sharp, bulky, and expensive ceramic or SAW duplexer filters to isolate the sensitive receiver from the high-power transmitter. TDD never transmits and receives at the same instant, completely eliminating the duplexer in favor of a cheap, low-loss solid-state PIN diode switch.',
      },
      {
        heading: 'Spatial Antenna Diversity & Channel Reciprocity',
        body: 'Fast fading changes with movement, time, and frequency. A base station can compare two separated receive antennas. In calibrated TDD, a recent uplink measurement on the same carrier can help choose an antenna for a prompt downlink reply while the channel remains sufficiently stable. This is useful, not a guarantee of reception.',
        formula: 'H_{\\text{DL}}(f, t) \\approx H_{\\text{UL}}(f, t) \\quad \\text{when } \\Delta t < T_c \\text{ and } f_{\\text{DL}} = f_{\\text{UL}}',
      },
      {
        heading: 'Dynamic Capacity Allocation for Asymmetric Traffic',
        body: 'For some data applications, downstream demand exceeds upstream demand. A TDD controller can assign more time slots to the direction with higher offered load. The useful split depends on traffic and the standard profile; no fixed ratio is guaranteed.',
        formula: '\\text{Asymmetric Ratio} = \\frac{N_{\\text{Downlink}}}{N_{\\text{Uplink}}} \\approx \\frac{\\text{Offered Load}_{\\text{DL}}}{\\text{Offered Load}_{\\text{UL}}}',
      },
      {
        heading: 'Coherence Bandwidth and Frequency Invariance',
        body: 'Separate FDD carriers can fade differently, so the uplink antenna measurement alone may not predict downlink quality. Same-carrier TDD can use a recent estimate if the channel has not changed much; calibration and timing matter.',
      },
    ],
    protocolStandardCallout: 'The textbook uses base-station antenna selection as an example of why same-carrier TDD can help with fast fading. Real performance depends on antenna placement, calibration, channel change, and interference.',
    reviewQuestions: [
      'Why does spatial antenna selection diversity reciprocity fail in dual-carrier FDMA/FDD systems?',
      'Identify the three design considerations that dictate cordless system architecture according to Stallings.',
      'How does TDMA/TDD accommodate a 4:1 downstream web browsing asymmetry without wasting spectrum?',
    ],
  },

  'dect-protocol-architecture': {
    title: 'DECT Protocol Architecture & Mobility Management Service Groups',
    chapterRef: 'Section 11.1 Cordless Systems — DECT Operation',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.1 (pp. 321-324)',
    summary: 'Digital Enhanced Cordless Telecommunications (DECT) is the international standard for high-density cordless communications, operating across 10 RF carriers in the 1.88-1.90 GHz band (or 1.91-1.92 GHz for US PWT). Its protocol architecture spans Physical, Medium Access Control (MAC), Data Link Control (DLC), and a structured upper services layer including Call Control and Mobility Management.',
    keyConcepts: [
      {
        heading: 'Physical Layer: 10 RF Carriers and GFSK Modulation',
        body: 'The physical layer transmits TDMA-TDD frames over 10 radio carriers spaced 1.728 MHz apart. The modulation is Gaussian-filtered FSK (GFSK) with a nominal deviation of 288 kHz. As Stallings notes, this is essentially identical to the GMSK technique used in GSM (Chapter 10). The gross bit rate is 1.152 Mbps across 24 time slots per 10 ms frame (12 forward, 12 reverse), providing 120 full-duplex voice channels.',
        formula: '\\Delta f = 288\\text{ kHz}, \\quad R_b = 1.152\\text{ Mbps}, \\quad B_t = 0.5',
      },
      {
        heading: 'Medium Access Control (MAC): A-Field and B-Field Multiplexing',
        body: 'The MAC layer selects physical channels and establishes or releases connections. Within each time slot, the MAC frame multiplexes an A-field (64 bits for broadcast, signaling, and paging) and a B-field (320 bits carrying user voice/data payload). The MAC supports Broadcast, Connection-Oriented (B-field transfer), and Connectionless services.',
      },
      {
        heading: 'Data Link Control (DLC) Layer & LAPDm Procedures',
        body: 'The DLC layer provides reliable message transfer over the unguided wireless medium using LAPDm procedures (derived from GSM). It features frame sequencing, CRC error detection, and selective Automatic Repeat Request (ARQ) retransmission.',
      },
      {
        heading: 'Mobility Management (7 Formal Service Groups)',
        body: 'Above the DLC layer, Mobility Management (MM) manages security and access across seven standardized procedure groups: (1) Identity procedures: handset identifies via IPUI; (2) Authentication procedure: challenge-response verification via DSAA; (3) Location procedure: tracking across multi-cell PBX networks; (4) Access rights: validates authorization for local or public PSTN access; (5) Key allocation: distributes encryption keys (DCK); (6) Parameter retrieval: exchanges radio capabilities and codec formats; (7) Ciphering-related procedures: activates real-time DECT Standard Cipher (DSC) encryption.',
      },
    ],
    protocolStandardCallout: 'DECT Mobility Management organizes security and access into seven standardized service groups: Identity, Authentication, Location, Access rights, Key allocation, Parameter retrieval, and Ciphering-related procedures. Once ciphering is established, Call Control activates the 32 kbps ADPCM voice channel.',
    reviewQuestions: [
      'What is the function of the A field and B field in DECT MAC frames?',
      'List and briefly define the seven service groups of DECT Mobility Management.',
      'Why is DECT GFSK modulation with 288 kHz deviation essentially equivalent to GSM GMSK?',
    ],
  },

  'differential-quantization-dpcm-adpcm': {
    title: 'Differential Quantization, DPCM Feedback & ITU G.726 ADPCM',
    chapterRef: 'Section 11.1 & Appendix 11A — Linear Predictors',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.1 & Appendix 11A (pp. 323-328, 356-357)',
    summary: 'Voice signals exhibit strong sample-to-sample correlation due to the physiological dynamics of the human vocal tract. Standard 64 kbps PCM (§6.4) transmits absolute values with high redundancy. Differential Quantization encodes sample-to-sample differences; DPCM adds a linear predictor loop to eliminate transmitter-receiver drift; and ADPCM (ITU-T G.726) dynamically scales quantization step size y(k) and adapts 8 filter coefficients, halving the voice channel rate to 32 kbps with toll quality.',
    keyConcepts: [
      {
        heading: 'Differential Quantization Redundancy Reduction',
        body: 'In ordinary 8 kHz PCM telephony (§6.4), adjacent samples separated by 125 microseconds have an amplitude correlation coefficient > 0.85. The difference d(k) = m(k) - m(k-1) has a variance dramatically smaller than m(k). Quantizing this smaller difference requires only 4 bits rather than 8 bits to achieve equivalent perceptual fidelity.',
        formula: 'd(k) = m(k) - m(k-1) \\quad \\text{with } \\sigma_d^2 \\ll \\sigma_m^2',
      },
      {
        heading: 'DPCM Feedback Loop & Reconstructed Predictor Input',
        body: 'If an encoder simply transmitted differences of raw analog samples, quantization errors e(k) would accumulate without bound at the receiver, causing catastrophic drift. The DPCM encoder solves this by replicating the receiver\'s feedback loop locally: the difference d(k) = m(k) - m̂q(k) is taken between the input sample and the predicted estimate. The quantized difference dq(k) = d(k) + e(k) is fed back to the predictor, ensuring the encoder and decoder share the exact same state mq(k) = m(k) + q(k).',
        formula: 'm_q(k) = \\hat{m}_q(k) + d_q(k) = [m(k) - d(k)] + [d(k) + q(k)] = m(k) + q(k)',
      },
      {
        heading: 'Adaptive Quantizer with Dynamic Scale Factor y(k)',
        body: 'Speech signals vary between quiet pauses and explosive consonants. A fixed quantizer suffers from slope overload during high-energy bursts and granular noise during low-energy vowels. In ADPCM (ITU-T G.726), the quantizer step size is dynamically scaled by factor y(k), updated based on recent sample rates of change converted to logarithmic base-2 representation.',
        formula: 'd_q(k) = y(k) \\cdot Q^{-1}[I(k)]',
      },
      {
        heading: 'ITU-T G.726 Adaptive Predictor Filter (Equation 11.2)',
        body: 'For ADPCM, the predictor structure combines a 2nd-order recursive (all-pole) filter and a 6th-order non-recursive (all-zero) filter. Coefficients Ai and Bi are updated using gradient adaptation algorithms based on the rate of change of both signal estimates and difference samples.',
        formula: '\\hat{s}_e(k) = \\sum_{i=1}^2 A_i(k-i) s_e(k-i) + \\sum_{i=1}^6 B_i(k-i) d_q(k-i)',
      },
    ],
    protocolStandardCallout: 'DECT speech channels utilize G.726 ADPCM at 32 kbps, allowing each 10 ms TDMA frame to carry 320 speech bits per time slot with negligible delay and high audio fidelity.',
    reviewQuestions: [
      'Why does an open-loop differential quantizer drift, and how does the DPCM feedback loop prevent this error?',
      'Explain the function of scale factor y(k) in the G.726 adaptive quantizer.',
      'Why does the G.726 adaptive predictor employ a combination of a 2nd-order recursive and 6th-order non-recursive filter?',
    ],
  },

  'mean-opinion-score-comparison': {
    title: 'Subjective Speech Quality & Mean Opinion Score (MOS) Evaluation',
    chapterRef: 'Section 11.1 Cordless Systems — Subjective Measurement of Coder Performance',
    stallingsCitation: 'William Stallings, Wireless Communications and Networks, 2nd ed., Chapter 11.1 (pp. 328-330)',
    summary: 'The ultimate objective of voice coding in cordless and wireless systems is to minimize bit rate while preserving human auditory satisfaction. Objective metrics such as SNR or Mean Square Error correlate poorly with human perception because human hearing is insensitive to phase shifts but intolerant of harmonic distortion and transient clicks. The international benchmark for voice quality is the Mean Opinion Score (MOS) obtained through formal subjective listening tests.',
    keyConcepts: [
      {
        heading: 'ITU-T Formal Subjective Listening Methodology (5-Point Scale)',
        body: 'Under ITU-T Recommendation P.800, a panel of representative listeners evaluates recorded speech samples in a controlled acoustic environment. Each listener rates output on a standardized 5-point scale (Table 11.3): 5 = Excellent (Imperceptible), 4 = Good (Perceptible but not annoying), 3 = Fair (Slightly annoying), 2 = Poor (Annoying), and 1 = Unsatisfactory (Very annoying).',
      },
      {
        heading: 'Toll Quality Benchmark (4.0 to 4.5 MOS)',
        body: 'As Stallings emphasizes, even uncoded analog studio speech does not achieve a perfect 5.0 rating because human subjects occasionally award a 4 to samples with natural vocal irregularities. In telecommunications engineering, a score between 4.0 and 4.5 represents "Toll Quality"—the wireline benchmark established by copper wire PSTN.',
        formula: '4.0 \\le \\text{MOS} \\le 4.5 \\quad (\\text{Toll Quality / Wireline Equivalent})',
      },
      {
        heading: 'Comparative Analysis: PCM, ADPCM, CELP, and LPC',
        body: 'Figure 11.7 compares illustrative subjective scores: uncoded speech is the reference and has no encoded bitrate; PCM at 64 kbps and ADPCM at 32 kbps score near the good-quality range. Lower-bitrate coders trade more compression for possible audible artifacts. Scores vary with listeners and test material.',
        formula: '\\text{MOS}(\\text{ADPCM 32k}) = 4.1 \\approx \\text{MOS}(\\text{PCM 64k}) = 4.3',
      },
      {
        heading: 'MOS as a Quality of Service (QoS) Standard in IEEE 802.16',
        body: 'MOS comes from listening tests. Network QoS mechanisms such as 802.16 UGS can allocate periodic capacity to voice, but scheduling alone cannot guarantee a particular MOS: codec behavior, packet loss, delay, radio quality, and test conditions all matter.',
      },
    ],
    protocolStandardCallout: 'The textbook uses ADPCM at 32 kbps as an example of good voice quality. UGS in 802.16 provides periodic grants for constant-rate traffic; it does not specify or guarantee an MOS score.',
    reviewQuestions: [
      'Why do formal subjective listening tests matter more than objective SNR calculations for speech coding?',
      'Why does even uncoded analog studio speech fail to achieve a unanimous 5.0 rating on the MOS scale?',
      'Explain how ADPCM at 32 kbps achieves toll-quality speech while CELP coders at 8 kbps fall below MOS 4.0.',
    ],
  },
};

export const TheoryView: React.FC = () => {
  const { selectedTopic, activeSubStepIndex } = useApp();

  const theory = THEORY_DATABASE[selectedTopic.id];

  if (!theory) {
    return (
      <div className="w-full h-full p-3 sm:p-5 flex flex-col select-none overflow-y-auto no-pan gap-3 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <BookOpen className="h-5 w-5" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Study notes</span>
            </div>
            <span className="text-[10px] font-mono rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">Section {selectedTopic.sectionRef}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{selectedTopic.title}</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedTopic.fullDescription}</p>
          <div className="mt-3 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 p-2 rounded-lg border border-cyan-200 dark:border-cyan-800">
            Source: William Stallings, Wireless Communications and Networks, 2nd ed., {selectedTopic.sectionRef}
          </div>
          <div className="mt-3"><StudyLinks categoryId={selectedTopic.categoryId} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {selectedTopic.subSteps.map((step, index) => (
            <div id={`theory-concept-${index}`} key={step} className={`rounded-xl border p-3 transition-all ${activeSubStepIndex === index ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
              <div className="text-[9px] font-mono font-black uppercase text-cyan-600 dark:text-cyan-400 mb-1">Concept {index + 1}</div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{step}</p>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">Key values from the chapter</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedTopic.specs.map((spec) => <div key={spec.label} className="flex justify-between gap-3 rounded-lg bg-slate-50 dark:bg-slate-950 px-3 py-2 text-[11px]"><span className="text-slate-500">{spec.label}</span><strong className="text-right text-slate-800 dark:text-slate-200">{spec.value}</strong></div>)}
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
        <div className="mt-3"><StudyLinks categoryId={selectedTopic.categoryId} /></div>
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
