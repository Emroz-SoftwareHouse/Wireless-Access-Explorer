export interface SceneNote {
  actors: string;
  action: string;
  change: string;
  caution: string;
}

export const CHAPTER11_SCENE_NOTES: Record<string, SceneNote> = {
  'time-division-duplex-simple-tdd': {
    actors: 'The home base station connects to a telephone line; the cordless handset is carried by the caller.',
    action: 'Both radios share one carrier. The base sends a burst, waits for a guard interval, then the handset sends its burst.',
    change: 'Increase burst, propagation, or guard time to see how much faster the radio must send during its short turn.',
    caution: 'The animation is slowed down for learning. A real RF burst is much faster than the moving symbol.',
  },
  'tdma-tdd-vs-tdma-fdma': {
    actors: 'A moving handset talks to a base station with two separated antennas.',
    action: 'Reflected waves can cancel at one antenna. The base chooses the antenna with the stronger measured signal.',
    change: 'Try fading antenna A or B, then compare shared-frequency TDD with separate-frequency FDD.',
    caution: 'TDD reciprocity is approximate and time-limited. FDD does not inherently drop packets; it needs downlink information measured separately.',
  },
  'dect-protocol-architecture': {
    actors: 'A DECT handset and its fixed base each contain protocol layers.',
    action: 'Call control requests a call; mobility management authenticates; MAC schedules the air slots; the physical layer sends radio bursts.',
    change: 'Click a layer to see which job it performs during call setup.',
    caution: 'Protocol layers are software functions, not additional devices between handset and base.',
  },
  'differential-quantization-dpcm-adpcm': {
    actors: 'A microphone creates speech samples; encoder and decoder reconstruct them on opposite ends.',
    action: 'The encoder predicts the next sample and sends a quantized difference rather than the whole sample.',
    change: 'Change the signal and quantizer settings to see the error and bitrate tradeoff.',
    caution: 'The plot shows sample values, not a radio packet moving through space.',
  },
  'mean-opinion-score-comparison': {
    actors: 'Listeners rate recorded speech after it passes through different codecs.',
    action: 'A codec saves radio bits at the cost of possible audible distortion; MOS is a subjective average on a 1–5 scale.',
    change: 'Select a coder to compare bitrate, likely quality, and where it is used.',
    caution: 'These example scores are illustrative; MOS varies with listeners, material, and test conditions.',
  },
  'the-role-of-wll': {
    actors: 'A fixed home has a rooftop subscriber unit. The operator tower feeds a public telephone or Internet network.',
    action: 'The radio hop replaces only the last local cable from operator to subscriber.',
    change: 'Follow traffic through the home router, rooftop unit, tower, and public network.',
    caution: 'WLL is a service architecture, not one radio standard. WiMAX is one possible implementation.',
  },
  'fresnel-zone': {
    actors: 'Two fixed antennas face each other across a building and trees.',
    action: 'A radio wave spreads around the visual ray; an obstruction inside the first Fresnel zone can weaken reception.',
    change: 'Raise an antenna or change the obstacle and watch the estimated clearance and fade margin.',
    caution: 'The oval is a path cross-section projected onto a teaching map, not surveyed terrain.',
  },
  'atmospheric-absorption': {
    actors: 'A rooftop transmitter and fixed receiver are linked through air containing oxygen and water vapor.',
    action: 'Molecular absorption depends strongly on frequency; a longer path accumulates more loss.',
    change: 'Move frequency near 22 or 60 GHz and adjust path length.',
    caution: 'Weather and humidity alter actual loss. This scene shows a coarse band comparison.',
  },
  'rain-attenuation-calculator': {
    actors: 'A tower and fixed customer antenna communicate through a rainy path.',
    action: 'Rain adds path loss; a link remains available only while its fade margin exceeds the modeled loss.',
    change: 'Adjust rain rate, polarization, distance, and fade margin.',
    caution: 'The model assumes uniform rain across the path; real availability needs local climate statistics.',
  },
  'foliage-effects': {
    actors: 'A tree canopy sits between tower and fixed subscriber antenna.',
    action: 'Leaves and branches scatter and absorb RF energy; moving foliage can make loss fluctuate.',
    change: 'Move or resize the canopy, or raise the antenna to clear it.',
    caution: 'Foliage loss is illustrative; species, leaf state, moisture, depth, and frequency matter.',
  },
  'orthogonal-frequency-division-multiplexing-ofdm': {
    actors: 'A transmitter divides a data stream across narrow subcarriers; the receiver combines them.',
    action: 'Parallel, orthogonal subcarriers use longer symbols. A cyclic prefix reduces interference from delayed copies.',
    change: 'Follow highlighted subcarriers and the copied guard interval.',
    caution: 'Bars represent subcarrier activity, not literal radio towers or independent user connections.',
  },
  'mmds-vs-lmds': {
    actors: 'A lower-frequency wide cell and a higher-frequency dense cell serve fixed customers.',
    action: 'Lower frequency can support broader coverage; higher-frequency LMDS has more bandwidth but shorter, more obstructable paths.',
    change: 'Compare cell radius, building density, and customer placement.',
    caution: 'Shown ranges are historical examples from the textbook, not guaranteed performance.',
  },
  '802-16-system-reference-architecture': {
    actors: 'A home network, subscriber station, 802.16 base station, and operator core are distinct nodes.',
    action: 'A packet crosses the subscriber interface, radio air interface, and base station network interface.',
    change: 'Follow each highlighted node and identify which one owns the radio link.',
    caution: 'IEEE 802.16 specifies a broadband access interface; the operator still provides backhaul and Internet service.',
  },
  '802-16-protocol-stack-encapsulation': {
    actors: 'An application packet moves down the subscriber station protocol stack before over-the-air transmission.',
    action: 'Convergence classifies traffic, MAC schedules and frames it, security protects it, and PHY maps bits to symbols.',
    change: 'Follow each highlighted layer from top to bottom.',
    caution: 'These blocks are functions inside equipment, not five wireless hops.',
  },
  'services-qos-categories': {
    actors: 'Voice, live video, bulk transfer, and web traffic share one base-station scheduler.',
    action: 'The scheduler gives each service flow a different delay and rate treatment.',
    change: 'Watch which application is highlighted and read its service class.',
    caution: 'QoS gives scheduling rules, not a promise that every packet always arrives.',
  },
  'mac-frame-format-bit-field-decoder': {
    actors: 'The subscriber MAC builds a frame; the base-station MAC reads it.',
    action: 'Header fields identify the connection and length; checks detect corruption; the payload carries user data.',
    change: 'Click each field to decode its purpose and size.',
    caution: 'The rectangle is a bit layout, not a physical packet floating above buildings.',
  },
  'mac-service-flows-bandwidth-grants': {
    actors: 'A subscriber station requests uplink capacity from a base-station scheduler.',
    action: 'Request travels up, grant travels back, then the subscriber sends a payload only in assigned resources.',
    change: 'Step through request, QoS check, grant, and payload.',
    caution: 'A grant is permission to transmit, not an acknowledgement that payload was received.',
  },
  'fragmentation-reassembly': {
    actors: 'A sender splits a large message; the receiver stores and rejoins fragments.',
    action: 'Sequence numbers and first/middle/last flags let the receiver recover the original order.',
    change: 'Watch each highlighted fragment enter the reassembly buffer.',
    caution: 'A highlighted fragment is a time step; the whole original message is not sent four times.',
  },
  'physical-layer-duplexing-modes': {
    actors: 'A base station and subscriber station exchange downlink and uplink radio bursts.',
    action: 'FDD separates directions by frequency. TDD alternates them in time on one channel.',
    change: 'Compare the upper and lower lanes and the active direction.',
    caution: 'Frequency and time are different dimensions; two drawn lanes do not always mean two frequency bands.',
  },
  'ieee-802-16a-data-rate-calculator': {
    actors: 'A fixed subscriber station uses an OFDM radio channel to the base station.',
    action: 'Wider channels and higher-order modulation can carry more bits per second when signal quality allows.',
    change: 'Adjust channel bandwidth and modulation to compare the illustrative useful rate.',
    caution: 'This is a teaching estimate. Coding, overhead, scheduling, and RF conditions determine actual throughput.',
  },
};
