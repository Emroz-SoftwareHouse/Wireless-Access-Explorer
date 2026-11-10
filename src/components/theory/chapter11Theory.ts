import type { TopicTheory } from './TheoryView';

type Concept = [heading: string, body: string, formula?: string];

const lesson = (title: string, section: string, pages: string, summary: string, concepts: Concept[], questions: string[]): TopicTheory => ({
  title,
  chapterRef: `Section ${section}`,
  stallingsCitation: `William Stallings, Wireless Communications and Networks, 2nd ed., §${section}, pp. ${pages}. Historical textbook context; check current standards for deployment.`,
  summary,
  keyConcepts: concepts.map(([heading, body, formula]) => ({ heading, body, formula })),
  reviewQuestions: questions,
});

export const CHAPTER11_THEORY: Record<string, TopicTheory> = {
  'the-role-of-wll': lesson('Why use a wireless local loop?', '11.2', '329–332',
    'The local loop is the last connection between a subscriber and an operator. WLL replaces that cable span with a fixed radio link; the operator still needs a base station, switching or Internet connection, and backhaul.', [
      ['Follow the actual path', 'A home router or telephone connects to rooftop customer equipment. That fixed unit exchanges radio signals with an elevated base station. A wired or wireless backhaul takes traffic from the base to the operator network.'],
      ['Compare installation', 'A new cable route may require trenching or poles along every street. WLL needs a licensed or permitted channel, an elevated site, backhaul, and equipment at each subscribing building. Costs depend on local conditions.'],
      ['Know the service boundary', 'A cordless handset provides mobility near one base. WLL serves a fixed building across a wider area; it does not make a handset a cellular user.'],
      ['Place the antenna', 'A fixed directional antenna can aim toward the base station. This helps link quality, but obstacles, rain, interference, and shared capacity can still limit service.'],
    ], ['Which segment of the connection does WLL replace?', 'Why might WLL be economical in an area without existing cable?', 'How is WLL different from a cordless handset?']),

  'fresnel-zone': lesson('First Fresnel zone and clearance', '11.2', '332–334',
    'A radio path occupies space around the straight line between antennas. The first Fresnel zone is widest near the midpoint; a building or tree may harm reception even when the thin line of sight looks clear.', [
      ['Find the first zone', 'At a point with distances S and D to the two antennas, the radius depends on wavelength λ. Lower frequency or longer spans produce a larger zone.', 'R = \\sqrt{\\frac{\\lambda SD}{S+D}}'],
      ['Use a planning clearance', 'Stallings describes keeping obstructions outside about 0.6 times the first-zone radius. This is a common planning rule, not a guarantee for every link.', 'R_{\\text{clear}} \\approx 0.6R'],
      ['Check the whole route', 'Inspect terrain, buildings, tree growth, and earth curvature along the full path. The midpoint is often critical, but every point has its own radius and clearance.'],
      ['Fix a blocked path', 'Raise or relocate an antenna, shorten the path, or change the route. A top-down diagram cannot replace measured terrain profiles and a proper link budget.'],
    ], ['Why is visual line of sight insufficient?', 'How does wavelength affect Fresnel radius?', 'What does 60% clearance mean?']),

  'atmospheric-absorption': lesson('Absorption by air molecules', '11.2', '334–335',
    'Above roughly 10 GHz, oxygen and water vapor can noticeably absorb radio energy. Absorption changes with frequency, path length, and atmospheric conditions.', [
      ['Recognize absorption peaks', 'Water vapor has a notable feature near 22 GHz; oxygen has a strong feature near 60 GHz. These are examples from the textbook, not universal fixed attenuation values.'],
      ['Compare spectral windows', 'The textbook points to lower-absorption regions around 28–42 GHz and 75–95 GHz under its stated conditions. A real design uses current atmospheric profiles.'],
      ['Accumulate path loss', 'Specific attenuation in dB/km is multiplied by path length when conditions are treated as uniform.', 'A_{\\text{gas}} \\approx \\gamma_{\\text{gas}} L'],
      ['Separate causes', 'Gas absorption is different from rain, free-space spreading, and blockage. Add compatible losses in dB when assembling a link budget.'],
    ], ['Why does 60 GHz often have shorter practical reach?', 'Why does humidity matter?', 'How does doubling path length affect a uniform dB/km loss?']),

  'rain-attenuation-calculator': lesson('Rain attenuation and fade margin', '11.2', '335–336',
    'Rain absorbs and scatters microwave and millimeter-wave energy. The scene uses an ITU-R P.838 specific-attenuation relation as a teaching estimate, then compares it with a chosen fade margin.', [
      ['Set a rain rate', 'R is the chosen rainfall rate in mm/h. Larger drops and heavier rain generally produce more attenuation, especially at higher frequencies.'],
      ['Calculate specific attenuation', 'The coefficients k and α depend on frequency and polarization. The value γ is loss per kilometer for the chosen rain rate.', '\\gamma_R = kR^{\\alpha} \\quad (\\mathrm{dB/km})'],
      ['Apply an effective path', 'The simple scene multiplies γ by the full selected distance. Real availability calculations account for how rain varies along the path and over time.', 'A_R \\approx \\gamma_R L'],
      ['Compare against margin', 'A link with 12 dB of available fade margin cannot tolerate a modeled 15 dB rain fade under the same assumptions. Margin also has to cover other impairments.'],
    ], ['What do k and α depend on?', 'Why is a 5 km path usually more vulnerable than a 1 km path?', 'Why is a single rain-rate setting not an availability prediction?']),

  'foliage-effects': lesson('Trees in a fixed radio path', '11.2', '336–337',
    'A canopy can scatter, absorb, and diffract a signal. Its effect changes with depth, frequency, moisture, season, and movement; the app shows an illustrative penalty rather than a measured tree model.', [
      ['Locate the obstruction', 'The relevant question is whether leaves and branches intrude into the useful radio path or first Fresnel zone, not simply whether a tree is visible nearby.'],
      ['Expect variable loss', 'Wet leaves and wind can change the path over time. A fixed numerical loss per tree is unreliable without local measurements.'],
      ['Try geometry first', 'Move or raise an antenna so that the radio path clears the canopy. A different base-station sector or shorter route may also help.'],
      ['Account for residual fading', 'Error correction and fade margin can improve reliability, but cannot make a severely blocked path equivalent to a clear one.'],
    ], ['Why can a link vary in windy weather?', 'What site change would you try first?', 'Why is “one tree = fixed dB loss” misleading?']),

  'orthogonal-frequency-division-multiplexing-ofdm': lesson('Why OFDM uses many subcarriers', '11.2', '337–339',
    'OFDM divides one fast data stream into many slower parallel streams sent on tightly spaced, mathematically orthogonal subcarriers. A cyclic prefix can reduce interference from delayed echoes.', [
      ['Split one data stream', 'A serial-to-parallel converter assigns parts of one source to N subcarriers. This is not automatically N separate users.', 'R_{\\text{sub}} \\approx R/N'],
      ['Understand orthogonality', 'At each subcarrier center, ideally the other subcarriers contribute zero to the receiver decision. Their spectral shapes may overlap without the usual adjacent-carrier interference.'],
      ['Give echoes room', 'A cyclic prefix copies the end of a symbol before the symbol. If the prefix is long enough relative to channel delay spread, intersymbol interference is reduced.'],
      ['Rebuild at the receiver', 'The receiver removes the prefix, separates subcarriers with a Fourier transform, equalizes them, and reconstructs the stream. Real links still need synchronization and coding.'],
    ], ['Are OFDM subcarriers separate users?', 'Why may overlapping spectra remain separable?', 'What must be true about the cyclic prefix length?']),

  'mmds-vs-lmds': lesson('MMDS and LMDS as WLL examples', '11.2', '339–341',
    'The textbook contrasts lower-frequency MMDS with high-frequency LMDS. The former tends to cover wider cells; the latter can offer more bandwidth in shorter, denser cells.', [
      ['Compare spectrum', 'MMDS examples use frequencies around 2.5 GHz. LMDS examples use much higher bands, roughly 28–40 GHz. Exact allocations depend on region and era.'],
      ['Visualize cell size', 'A lower-frequency path may tolerate more distance and some obstacles. Millimeter-wave LMDS normally needs shorter paths and more care around buildings and foliage.'],
      ['Choose by deployment', 'Rural coverage and dense urban capacity create different site plans. A cell radius printed in a textbook is an example, not a guaranteed service radius.'],
      ['Connect to 802.16', 'IEEE 802.16 was developed in part to standardize broadband radio access associated with LMDS-style WLL systems.'],
    ], ['Which example better suits a sparse district?', 'Why might LMDS need more base stations?', 'Is MMDS versus LMDS the same distinction as WLL versus WiMAX?']),

  '802-16-system-reference-architecture': lesson('Follow the IEEE 802.16 network path', '11.3', '342–344',
    'An 802.16 access network joins a subscriber network to an operator network through a subscriber station, a radio air interface, and a base station.', [
      ['Start with the user', 'A laptop or phone sends ordinary data through the home LAN to a fixed subscriber station or rooftop CPE. The home device itself need not speak 802.16.'],
      ['Cross the air interface', 'The subscriber station and base station exchange scheduled radio bursts. This is the part defined by the broadband wireless access standard.'],
      ['Reach the operator', 'The base station forwards traffic over a backhaul connection to the operator core, which then reaches Internet or telephone services.'],
      ['Read reference points', 'Reference interfaces mark boundaries between subscriber equipment, the radio system, and the network. They are logical connection points, not extra radio towers.'],
    ], ['Which device actually transmits 802.16 radio?', 'Does the base station alone provide Internet service?', 'Which path in the map is backhaul?']),

  '802-16-protocol-stack-encapsulation': lesson('Packet handling inside an 802.16 station', '11.3', '343–346',
    'Protocol layers prepare higher-level data for a shared radio channel. These layers are processing functions inside stations, not separate geographic hops.', [
      ['Classify at convergence', 'The convergence sublayer accepts external traffic and maps it to an appropriate MAC service flow.'],
      ['Build a MAC PDU', 'The MAC common part provides connection identifiers, scheduling and framing. A PDU can contain user data or control information.'],
      ['Protect traffic', 'Security functions can authenticate and encrypt as specified by the applicable profile and key state. Security is distinct from error detection.'],
      ['Transmit with PHY', 'The physical layer codes and modulates bits into radio symbols. The receiving station reverses the processing to recover the original payload.'],
    ], ['Why does an IP packet receive a MAC header?', 'What is the difference between encryption and CRC?', 'Which layer turns bits into radio symbols?']),

  'services-qos-categories': lesson('Four 802.16 service classes', '11.3', '346–348',
    'Traffic with different delay and rate needs receives different scheduling treatment. The historical service categories in this chapter are UGS, rtPS, nrtPS, and Best Effort.', [
      ['UGS: regular voice', 'Unsolicited Grant Service provides periodic fixed-size grants, suitable for a constant-rate stream that should not have to request every burst.'],
      ['rtPS: time-sensitive variable data', 'Real-time Polling Service supports variable-size traffic such as live video by polling often enough to meet delay needs.'],
      ['nrtPS: throughput-sensitive data', 'Non-real-time Polling Service supports elastic traffic that needs a minimum throughput but can tolerate more delay.'],
      ['BE: remaining capacity', 'Best Effort traffic receives no reserved rate or delay guarantee and uses capacity the scheduler can provide. QoS cannot guarantee radio reception.'],
    ], ['Which class fits constant-rate voice?', 'Why is live video handled differently from file transfer?', 'What promise does Best Effort make?']),

  'mac-frame-format-bit-field-decoder': lesson('Decode an 802.16 MAC frame', '11.3', '348–350',
    'A MAC PDU is a structured bit sequence: header, optional payload, and optional error check. Its header tells the receiver how to interpret the rest.', [
      ['Read header type', 'A generic MAC header carries user data or control messages. A bandwidth-request header has a different layout and asks for capacity.'],
      ['Identify the connection', 'The 16-bit CID identifies a logical MAC connection; that connection maps to a service flow and its QoS parameters.'],
      ['Check length and header', 'The length field states total PDU size. The header check sequence detects header corruption so a damaged length or CID is not silently accepted.'],
      ['Interpret payload and CRC', 'The payload may contain application data or management information. An optional CRC detects frame corruption; it does not repair data by itself.'],
    ], ['What does CID identify?', 'Why is a header check needed?', 'Is a bandwidth request frame the same layout as a generic data frame?']),

  'mac-service-flows-bandwidth-grants': lesson('How an uplink gets permission', '11.3', '348–351',
    'The base station coordinates shared uplink capacity. A subscriber request, scheduling decision, and grant occur before a variable-rate payload burst is transmitted.', [
      ['Name the service flow', 'A service flow describes QoS, such as maximum delay or minimum rate. Its connection identifier lets the MAC associate a frame with the right flow.'],
      ['Request bandwidth', 'A subscriber can use the request mechanism allowed by its service class. Some services receive periodic unsolicited grants instead.'],
      ['Schedule a grant', 'The base station considers service requirements and available radio resources, then signals when and how much the subscriber may transmit.'],
      ['Send within allocation', 'The subscriber transmits its payload in the assigned uplink resources. The grant is permission, not a delivery acknowledgement.'],
    ], ['Why is an uplink request useful?', 'Does UGS request every burst?', 'Why is a grant not an acknowledgement?']),

  'fragmentation-reassembly': lesson('Fit a message into MAC allocations', '11.3', '350–351',
    'A higher-level message may be larger than one granted radio allocation. The sender can split it into numbered fragments that the receiver reassembles.', [
      ['Split the message', 'The MAC divides a service data unit into parts small enough for the available PDU or grant size.'],
      ['Mark each part', 'Fragment-control bits identify first, continuing, and final portions; a fragment sequence number distinguishes their order.'],
      ['Transmit sequentially', 'Each part crosses in a scheduled opportunity. The animation highlights one piece at a time rather than four copies of the whole message.'],
      ['Reassemble or recover', 'The receiver joins valid pieces in order. Missing or corrupt fragments require recovery according to the connection’s error-control rules.'],
    ], ['Why fragment a message?', 'What happens if a middle fragment is missing?', 'What do sequence numbers add?']),

  'physical-layer-duplexing-modes': lesson('Separate the two radio directions', '11.3', '351–353',
    'Duplexing describes how downlink and uplink share radio resources. FDD uses separate frequencies; TDD alternates directions in time. The chapter also discusses burst and continuous downstream modes.', [
      ['FDD uses two carriers', 'Downlink and uplink occupy distinct frequency bands. Depending on equipment, activity in both directions can occur at the same time.'],
      ['FSDD limits simultaneous activity', 'Frequency-separated half duplex still uses distinct bands but a subscriber need not transmit and receive simultaneously.'],
      ['TDD uses time separation', 'Both directions can share one carrier in alternating slots. A guard interval allows switching and propagation effects to settle.'],
      ['Mode B and assignment', 'Burst downstream operation and demand-assigned TDMA let the base allocate resources among subscribers. This is a scheduling choice, not a new physical device.'],
    ], ['Which mode needs two frequency bands?', 'Why does TDD need a guard interval?', 'Can two drawn lanes represent time rather than frequency?']),

  'ieee-802-16a-data-rate-calculator': lesson('What controls an 802.16a data rate?', '11.3', '353–354',
    'The historical 802.16a amendment extended broadband access to lower bands and non-line-of-sight scenarios. This lab illustrates the throughput effect of bandwidth and modulation, not a guaranteed customer speed.', [
      ['Choose channel width', 'A wider RF channel can carry more symbols per second, but uses more spectrum and may encounter more interference.'],
      ['Choose modulation', 'QPSK carries fewer bits per symbol and is more tolerant of weak signal. 16-QAM and 64-QAM offer greater raw capacity when signal quality is high enough.'],
      ['Allow for overhead', 'Coding, guards, pilots, MAC headers, and scheduling consume capacity. A practical useful rate is below a simple bandwidth-times-efficiency ideal.', 'R_{\\text{useful}} \\approx B \\eta_{\\text{effective}}'],
      ['Distinguish range from speed', 'A long or obstructed path may need more robust modulation and yield lower rate. The textbook’s maximum ranges and rates are design examples, not simultaneous guarantees.'],
    ], ['Why does 64-QAM need a cleaner link than QPSK?', 'Why is application throughput below raw PHY rate?', 'Can maximum range and maximum speed always occur together?']),
};
