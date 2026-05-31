# M1' Audio / Generative Instrument Research

Status: research lane draft
Date: 2026-05-22
Coordinate: M1' / Paramaśiva as playable audio-frequency instrument

## Local Sources Consulted

- `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md` — canonical domain authority. It corrects the ownership boundary: M1' is the primary techne renderer and playable surface, while audio-genesis math lives in the shared kernel/`portal-core` profile as `MathemeHarmonicProfile`. M1' must consume `audio_octet[8]`, `nodal_quartet[4]`, `harmonic.ratio_role`, `lensMode`, tick, relation, and deposition anchors rather than inventing pitch locally.
- `Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md` — long architectural derivation. It remains useful for the six M1-0'..M1-5' strata, proposed `m1_prime_*` APIs, 8+4 bridge, rate-band concept, strike-event flow, M2'/M3 seams, and testing invariants. Its older claim that M1' owns frequency genesis should be read through the newer domain specs: S0/M1 supplies the Prakasha substrate, M2-1' reads it as the shared 8+4 Vimarsha bus, and M1' renders/walks that output as melody rather than owning a private pitch engine.
- `docs/epi-logos-kernel/ql-musical-derivation.md` — primary musical derivation. Key facts: 16/9 totality stands one epogdoon (9/8) short of octave closure; bimba and pratibimba whole-tone helices split the chromatic 12; X/X' minor-second pairs, tritone mirrors, and X+Y=5 mirror-progressions are structural operations; the spectral observer stack is FFT/STFT -> CQT -> chromagram -> QL pitch-class reading.
- `docs/epi-logos-kernel/ql-musical-derivation-v2.md` — useful refinement. It clarifies the dual chromatic/fifths bases, the six pairing families that operate at every lens-mode instance, the 12 x 7 = 84 mode-tonic landscape, and the 8+4 cymatic correspondence.
- `docs/plans/2026-05-19-vak-musical-execution-z-thread.md` — execution sequencing constraint. It recommends deterministic VAK performance events, JSONL traces, rehearing, and recomposition before live MIDI/audio, with live MIDI/audio explicitly deferred until the trace layer is stable.
- `docs/epi-logos-kernel/physical-pole-stack-architecture.md` — additional implementation context. It argues for an audio-pulled clock, `cpal` for cross-platform Rust audio I/O, custom DSP, FFT-fed cymatic rendering, and 10-30ms audio latency as an acceptable interactive budget.
- `Body/S/S0/epi-lib/include/m1.h` — current M1 substrate. It exposes the Ananda matrices, O(1) nibble cell extraction, DR rings, Spanda engine, `QL_Tick`, 12-step SU(2) ring, `ql_get_stage`, 720-degree Hopf projection, quaternion algebra, `RING_QUATERNION_LUT`, Cl(4,2) trig basis, and compile-time Ananda/Spanda alignment assertions.
- `Body/S/S0/epi-lib/src/m1.c` — current implementation. It stores `.rodata` Ananda matrices, DR rings, M1/M0 crosslink table, Spanda CF substage LUT, QL flowering ring, lifecycle, verification, and CLI dispatch.
- `Body/S/S0/epi-lib/test/m1/test_m1.c` — current test coverage. Tests already verify matrix spot checks, SUM coherence, DR rings, ring/tick helpers, QL flowering integrity, M0 crosslinks, M1 lifecycle, topological LUT, and quaternion basics. There are no M1' audio, tuning, MIDI, profile-consumption, or graph-traversal tests yet.

External technical references checked for the MIDI/music-tech boundary:

- [MIDI Association MIDI 2.0 overview](https://midi.org/midi-2-0) — MIDI 2.0 extends MIDI 1.0, uses MIDI-CI for negotiated capabilities, and includes UMP, Profiles, and Property Exchange.
- [MIDI Association 2026 MIDI 2.0 status article](https://midi.org/the-state-of-midi-2-0-high-resolution-performance-and-the-rise-of-profiles-update-feb-2026) — current practical note that UMP carries 32/64/96/128-bit packets, MIDI 2.0 expands velocity/controller/pitch resolution, and real-world support remains mixed.
- [MIDI Association MIDI Tuning specification page](https://midi.org/midi-tuning-updated-specification) — MIDI Tuning supports sharing/switching microtunings during performance.
- [MIDI Association MPE overview](https://midi.org/midi-polyphonic-expression-mpe-specification-adopted) — MPE assigns notes to channels so channel-wide pitch/control data can become per-note expressive control in MIDI 1.0 environments.
- [W3C Web MIDI API](https://www.w3.org/TR/webmidi/) — Web MIDI exposes low-level device enumeration plus MIDI message send/receive; it does not define sequencing or semantic interpretation. SysEx requires explicit permission.
- [W3C Web Audio API](https://www.w3.org/TR/webaudio/) — relevant if a browser/WebView path needs an AudioWorklet renderer, though the desktop architecture here should prefer Rust `cpal` for the real-time audio engine.

## M1' Operational Surface Summary

M1' should be built as the playable renderer for a kernel-owned harmonic profile, not as a second pitch engine. The operational surface is therefore:

1. **Profile adapter:** receive `MathemeHarmonicProfile` snapshots from S0/`portal-core` with tick, `tick12`, `degree720`, `su2Layer`, phase, `position6`, `lensMode`, `audio_octet[8]`, `nodal_quartet[4]`, ratio-role, relation descriptors, and deposition anchors.
2. **Audio renderer:** turn `audio_octet[8]` into sample-accurate sound, preserving the exact Hz values and metadata in an auditable event stream.
3. **Generative walker:** request graph-neighbor traversal through S2 pointer relations; the relation is the interval, the coordinate is the pitch-state, and the route is the phrase. M1' may preview routes but must not fabricate relations or write private motive data into canonical topology.
4. **Playable controller layer:** map strike events, keyboard/MIDI input, and lens/mode selection to profile requests. Direct node selection may sound the node profile without becoming a graph walk-step.
5. **Observer layer:** compare intended output to actual audio via FFT/STFT -> CQT -> chromagram so tuning drift, cymatic coherence, and symbolic feedback can be measured.
6. **External music-tech bridge:** expose MIDI/MPE/MIDI 2.0/DAW-facing events as encodings of the profile stream, never as authority over the profile.

The immediate build-out should avoid a UI-first trap. The first production-ready slice is a deterministic, logged profile-to-audio/MIDI pipeline that can be tested offline. The visual torus and live controllers should sit on top of the same event stream, not beside it.

Current C substrate status:

- M1 has real, tested constants and APIs for Ananda, Spanda, QL tick, quaternion/Hopf, and ring traversal.
- M1' does not yet have a concrete C/Rust API in the checked sources. The companion's `m1_prime_*` signatures should be treated as design candidates, then reconciled with the canonical `MathemeHarmonicProfile` ownership boundary.
- The likely implementation boundary is a Rust safe wrapper over kernel/profile state plus a Rust audio thread; a future C `m1_prime_*` layer should only expose deterministic profile-derived helpers, not duplicate profile generation.

## Audio Synthesis / Scale / Tuning / MIDI Technical Details

### Audio Engine

The audio thread should be the timing master. Use a real-time-safe Rust `cpal` callback to pull or atomically read the latest profile frame and render buffers without allocation, blocking locks, graph queries, or UI IPC inside the callback. Kernel/graph/profile computation can run ahead of the audio callback and publish immutable snapshots into a lock-free ring buffer or double-buffered atomic pointer.

Recommended frame shape:

```text
M1PrimeAudioFrame
  profile_id
  tick, cycle, tick12, degree720, su2Layer, phase, position6
  lens, mode
  relation_id, relation_family, ratio_role, mirror_role, klein_flip
  audio_octet_hz[8]
  audio_octet_amp[8]
  audio_octet_role[8]
  nodal_quartet[4]
  cents_error[8]
  source_coordinate, target_coordinate
  deposition_anchor?
```

The renderer should maintain one phase accumulator per octet voice. On each buffer:

- Smooth frequency changes over a short sample window to avoid zipper noise when graph steps produce discontinuous intervals.
- Apply explicit envelopes for node strike, route preview, walk-step, sustain, and release. Avoid click-prone hard note starts.
- Normalize or compress the 8-voice sum with headroom. The octet is structural, but all 8 voices sounding at unity gain will clip.
- Preserve null/silent voices as structural positions with zero amplitude, not as missing array entries.
- Publish a measured output summary for observers: RMS, peak, active frequency estimates, chromagram, and latency markers.

The 8+4 split is load-bearing:

- `audio_octet[8]` = audible/antinodal inner positions: positions 1,2,3,4 and 1',2',3',4'.
- `nodal_quartet[4]` = implicate/nodal boundary positions: 0,5 and 0',5'. These are not frequencies for M1' to play as voices; they are boundary parameters for M2' cymatic rendering and meaning-correspondence.

### Scale And Lens Logic

M1' should expose the 84-state surface exactly as the canonical spec describes:

```text
12 lens anchors x 7 CF modes = 84 playable mode-tonic states
```

Lens anchors:

```text
Lens 0..5  = C, D, E, F#, G#, A#   (bimba helix)
Lens 0'..5'= C#, D#, F, G, A, B    (pratibimba helix)
```

Mode anchors:

```text
CF1 Ionian / major
CF2 Dorian
CF3 Phrygian
CF4 Lydian
CF5 Mixolydian
CF6 Aeolian / natural minor
CF7 Locrian
```

The lens is the scale-beneath or chromatic-substrate anchor. The mode is the CF-relational grounding inside that lens. These axes must remain independent: any lens can carry any mode, all 84 states must be distinguishable, and every state should produce a stable profile signature.

The v2 derivation adds an important implementation guard: every lens-mode instance carries the same six pairing families. Tests should prove that A/B/C/D1/D2/D3 pair behavior remains structurally present under transposition and mode rotation. This prevents a superficial "84 labels" implementation that does not preserve the musical grammar.

### Tuning Strategy

Internally, M1' should render the exact Hz values supplied in `audio_octet`. That means the audio engine can support pure-ratio tuning, 12-TET approximations, and comma-accumulating spiralic sessions without changing its core interface.

For external encoding, every frequency can be mapped to a MIDI note plus cent offset:

```text
midi_float  = 69 + 12 * log2(f_hz / 440.0)
midi_note   = round(midi_float)
cents_error = 100 * (midi_float - midi_note)
```

For MIDI 1.0 pitch bend fallback:

```text
pitch_bend_14bit = 8192 + round((cents_error / (100 * bend_range_semitones)) * 8192)
```

Production constraints:

- Store the exact source frequency alongside any MIDI approximation.
- Keep a configured pitch-bend range per destination and verify it with the target device or plugin when possible.
- Prefer MPE for MIDI 1.0 polyphonic microtuning because each active note can receive its own channel pitch bend and per-note expression.
- Use MIDI Tuning messages when the destination supports static or slowly changing tuning tables, but do not rely on them as the only path for dynamic graph traversal.
- Prefer MIDI 2.0 per-note pitch/per-note controllers when a negotiated MIDI 2.0 endpoint is available.
- Treat Pythagorean-comma accumulation as session state, not as hidden oscillator drift. If it changes future profile generation, that change must be visible in the profile/event log.

The key technical distinction: tuning conversion is allowed at the I/O edge, but M1' source-of-truth remains profile Hz plus profile metadata.

### MIDI And DAW Integration

MIDI should be an external representation of profile events. Recommended tiers:

1. **Internal event stream first:** JSONL or binary frames containing exact Hz, lens/mode, relation, tick, and graph anchors. This is the canonical test and replay substrate.
2. **MIDI 1.0 fallback:** note-on/off, velocity, channel pressure, CC, and pitch bend. Use MPE channel allocation for the 8 octet voices when polyphonic tuning or expression is required.
3. **MIDI Tuning support:** optional SysEx tuning table export/import for devices/plugins that support MTS. In Web MIDI, SysEx requires explicit permission and should be requested only when needed.
4. **MIDI 2.0 / UMP target:** native UMP packets, high-resolution velocity/control, per-note pitch, per-note controllers, and Profile/Property Exchange when available. Keep a deterministic down-conversion path for MIDI 1.0 environments.
5. **File/export path:** preserve exact profile streams as JSONL first; export MIDI 1.0/MPE for DAW compatibility; add MIDI 2.0 Clip/SMF2-style storage later when the runtime can preserve UMP/profile metadata end-to-end.

Suggested control mapping:

- Note number or grid pad selects a coordinate/lens-mode cell only through a profile request.
- Velocity maps to strike amplitude/envelope, not pitch.
- Poly pressure maps to voice brightness or M2' resonance depth.
- Pitch bend maps to performance inflection at the I/O edge; it must not mutate canonical profile tuning unless explicitly recorded as a performance gesture.
- CC74 or per-note controller can map to timbral aperture / filter cutoff.
- Mod wheel can map to route preview depth or lens-pair modulation.
- Program/Bank selection can select lens sets, modes, or performance scenes, but the state should also be explicit in the event log.

MIDI input should be decoded into the same internal event schema as UI strikes. A keyboard note should not directly decide a graph edge. It should request the nearest profile cell, then the S2 relation law decides whether that movement is a valid walk-step.

### Generative Instrument Behavior

"Generative" should mean graph-law generation, not random note production. Production-ready generation should be driven by:

- S2 pointer relation families and available route previews.
- Current `(lens, mode)` and six pairing-family grammar.
- Spanda tick and rate band.
- Session constraints: tempo, maximum route depth, allowed relation families, privacy/deposition policy.
- Optional external gestures: MIDI notes, MPE pressure, DAW transport, or UI strikes.

The generator can choose among valid next relations, but every choice must be logged with the candidate set, selected edge, profile before/after, and reason code. This makes generative output testable and rehearable by Aletheia/Epii rather than opaque.

## Integration Seams With M2' Frequency-To-Meaning And M3' Symbolic Transcription

### M2' Seam: Frequency-To-Meaning / Cymatic Correspondence

M2' should receive the M1' profile-render stream as evidence:

```text
M1' -> M2'
  audio_octet_hz[8]
  nodal_quartet[4]
  lens, mode
  relation_family / ratio_role
  klein_flip event
  chromagram observation
  tick / degree720 / su2Layer
```

M2' does not generate the frequencies. It maps the 8 frequency voices through the 72-space as harmonic-correspondential evidence and uses the 4 nodal parameters as boundary conditions for standing-wave / Chladni-like rendering. The visible cymatic pattern should be the intersection of audio content and nodal boundary form.

The M1' -> M2' contract needs three separate channels:

- **Audio evidence bus:** exact Hz and amplitudes for the 8 sounding positions.
- **Boundary bus:** four integer nodal parameters for cymatic mode constraints.
- **Semantic event bus:** relation, lens/mode, tritone crossing, X/X' flip, and observed-vs-intended chromagram deltas.

The Klein flip is especially important. M1' should emit a precise event when Lens N crosses to Lens N+3 or when an equivalent tritone mirror transition occurs. M2' can then render the opposite valence or surface re-reading without having to infer topology from pitch alone.

### M3' Seam: Symbolic Transcription / Codon-Rotation Projection

M3' should receive ticked musical events and produce symbolic transcription:

```text
M1' -> M3'
  tick address
  lens, mode
  source/target coordinate
  interval / relation family
  audio_octet role vector
  active cells
  codon?, rotation?
  gesture source
```

The target symbolic object is not just "MIDI notes." It is a transcription of graph traversal as tonal-symbolic structure:

- Note or chord = active profile cell(s) at a tick.
- Interval = traversed pointer relation or pairing-family operation.
- Phrase = route segment through S2.
- Mode change = CF-relational re-grounding.
- Lens change = chromatic-substrate shift.
- Klein flip = meaning-surface inversion.
- Codon rotation = M3' symbolic state corresponding to the active lens/mode/cell state.

The unresolved hard seam is the canonical `(lens, mode) <-> (codon, rotation)` map. The companion notes 40 non-dual codons with 7 rotations and 24 dual codons with 8 rotations, totalling 472 states. M1' can emit provisional anchors, but M3' must own final symbolic transcription rules so the mapping is not duplicated or silently improvised in the instrument renderer.

### Shared Event Schema

Both M2' and M3' benefit from a common event envelope:

```text
MPrimePerformanceEvent
  event_id
  session_id
  tick, tick12, degree720, su2Layer, position6
  source_surface: ui | midi | graph_generator | replay | external_audio
  coordinate_before
  coordinate_after
  relation_descriptor
  lens
  mode
  audio_octet_hz[8]
  nodal_quartet[4]
  intended_chromagram[12]
  observed_chromagram[12]?
  klein_flip
  codon_rotation?
  privacy/deposition policy
```

This event envelope should be the first testable artifact before live UI polish.

## Open Research Questions

- Where is the canonical `MathemeHarmonicProfile` type defined, and which crate/library owns profile generation today: S0 `epi-lib`, `portal-core`, or a Rust profile service not yet extracted?
- Should the first M1' API be C (`m1_prime.h/.c`) for kernel parity, Rust for Tauri/audio integration, or a split where C exposes deterministic kernels and Rust owns real-time audio/MIDI?
- What is the canonical fundamental `f0` policy: fixed A4=440-derived, user-selectable, coordinate-specific, or session-profile-specific?
- Should the runtime default to pure-ratio output, 12-TET output with exact-ratio metadata, or dual output where pure Hz drives internal audio and 12-TET drives basic MIDI fallback?
- How should Pythagorean-comma accumulation alter subsequent profiles, and what is the exact event that commits comma residue into M5/Epii?
- What is the authoritative source for S2 typed harmonic pointer relation descriptors, and how soon can route preview use real graph responses instead of static fixtures?
- How exactly do `audio_octet[8]` amplitudes derive: equal amplitude, quaternion basis components, relation weights, lens resonance, or profile-provided values?
- What are the nodal-quartet integer ranges and how do they map to Chladni `(m,n)` mode numbers without becoming arbitrary shader parameters?
- Which MIDI target is first-class for the prototype: Web MIDI, desktop virtual MIDI ports, DAW plugin, hardware DIN/USB, or native MIDI 2.0/UMP?
- What MPE channel allocation policy handles the structural 8 voices while leaving room for master channel control and external polyphony?
- Which MIDI 2.0 features should be required versus opportunistic: UMP transport, per-note pitch, per-note controllers, Profiles, Property Exchange, or MIDI Clip export?
- Should the spectral observer use STFT-only first, or implement CQT/chromagram immediately so tests operate in QL-native pitch-class space?
- What confidence threshold allows external audio or MIDI input to request a graph walk-step rather than only sounding a direct node profile?
- Where does M3' own the `(lens, mode) <-> (codon, rotation)` mapping, and how should M1' validate that it is not producing symbolic drift?
- What fixtures count as real enough for tests: captured S2 responses, generated profile traces from `portal-core`, recorded JSONL performance events, or live integration tests against a local graph service?
- How should privacy/deposition policy be encoded so generated musical phrases can be saved without leaking private journal motives or raw bioquaternion state?
