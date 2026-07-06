---
coordinate: "M1'/M2'/M3' :: modal-resonator-bell-kernel"
c_0_source_coordinates:
  - "[[M1'-SPEC]]"
  - "[[M2'-SPEC]]"
  - "[[M3'-SPEC]]"
  - "[[M4'-SPEC]]"
  - "[[M5'-SPEC]]"
  - "[[S0-SPEC]]"
c_2_depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]]"
  - "[[M1'-SPEC]]"
  - "[[M2'-SPEC]]"
  - "[[M3'-SPEC]]"
  - "[[M4'-SPEC]]"
  - "[[M5'-SPEC]]"
  - "[[physical-pole-stack-architecture]]"
  - "[[ql-musical-derivation-v3]]"
c_4_artifact_role: "seed"
c_4_artifact_kind: "architecture-spec"
c_5_status: "draft-spec-for-cycle-3-final-tranche"
c_5_created: "2026-06-29"
c_5_updated: "2026-06-29"
---

# Modal Resonator / Bell Kernel Spec

## 0. Ruling

The bell framing does not supersede the present [[audio_octet]] / [[nodal_quartet]] system. It makes that system explicit as the operational bell body.

The accepted construction is:

```text
12-slot chromatic resonant body
  -> 8 live modal carriers
  -> 4 nodal/boundary anchors
  -> 7 diatonic sounded roles
  -> 5 chromatic-complement silent anchors
  -> M1'/M2'/M3' chime frame
```

The current code already carries the centre of this shape:

- `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` writes `VimarshaReading.audio_octet: [f32; 8]` and `VimarshaReading.nodal_quartet: [MathemeNodalConstraint; 4]`.
- `Body/S/S0/portal-core/src/kernel/profile.rs` copies those into `MathemeHarmonicProfile.audio_octet` and `MathemeHarmonicProfile.nodal_quartet`.
- `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` declares the profile bus as the pitch and nodal authority for M' performance events.
- M1' and M2' already read `audio_octet` / `nodal_quartet` from the kernel profile bus in live surfaces. Integrated 1-2-3 currently displays and coordinates some of those bus facts, while M3' and M4' mostly consume adjacent profile fields (`degree720`, `mahamaya`, world-clock binding, `tick12`, `position6`, `phase`, `resonance`). This spec requires the final tranche to make exact-bus consumption, generation coherence, and no-local-recomputation explicit where they are not yet proven.

Therefore the final Cycle 3 tranche must add an explicit modal/bell contract around the existing bus. It must not rename, shrink, replace, locally synthesize, or downstream reinterpret the bus.

## 1. What Actually Chimes

The sounding unit is the full [[M1']] + [[M2']] + [[M3']] physical pole:

| Pole | Bell role | Present code anchor |
|---|---|---|
| [[M1']] | Resonant body: K2/torus topology, motion path, strike route, particle emitter carrier | `m1-paramasiva`, active M1 composition mount, `plugin-integrated-1-2-3`; consume the existing `m1-paramasiva-played-torus` handle only as a current/retiring surface |
| [[M2']] | Vibrational body: Vimarsha reading, 72-address cymatic texture, 8 live carriers, 4 boundary anchors | `portal-core::parashakti::vimarsha_reading`, `m2-parashakti` |
| [[M3']] | Clock inscription: tick, codon/world-clock binding, 72->64 fold, temporal proof that the chime happened at this address | `m3-mahamaya`, `kernelBridge.m2.epogdoonProjection(address72)`, `s3.world_clock` |

The bell is not "audio" alone. The bell is a chime event across topology, vibration, and temporal inscription. Audio output is an optional edge rendering of this event; the authoritative profile is still the kernel-side profile bus.

`m1-paramasiva-played-torus` is marked by local DOX as RETIRING. It remains useful evidence for current K2/profile-bus consumption, but new modal/K2 work must target the active M1 composition mount or a confirmed successor surface rather than deepening that retiring package.

The implementation target is two named surfaces:

1. `ModalResonatorProfile`: the standing resonant body and current modal condition derived from the kernel profile.
2. `M123ChimeFrame`: the tick event proving that [[M1']], [[M2']], and [[M3']] resolved the same resonant state at one tick.

## 2. The 8 + 4 Bus

The bus has two faces:

| Face | Current carrier | Meaning for this spec |
|---|---|---|
| Alive face | `audio_octet[8]` | The eight live modal carriers. Current Rust offsets are `[2, 4, 6, 8, 3, 5, 7, 9]`: four bimba inner-four positions plus four pratibimba inner-four positions relative to the current chromatic/lens frame. |
| Still face | `nodal_quartet[4]` | The four boundary anchors: P0/P5 on bimba and P0/P5 on pratibimba. They are not silent because they are absent; they are silent because they constrain, damp, split, reflect, and locate the live carriers. |

Bell partials map onto the octet. They do not create a second carrier ontology.

Required modal roles over the octet:

| Octet role | Bell reading | Required behavior |
|---|---|---|
| 0 | hum / ground residue | Low reference for decay and cymatic pressure. |
| 1 | prime | Perceived strike centre. |
| 2 | tierce / color partial | Modal color and overtone tension. |
| 3 | quint / stabilizer | Fifth/fold stabilization. |
| 4 | nominal | Named bell pitch / public note identity. |
| 5 | upper partial | Brightness and attack field. |
| 6 | warble/split carrier | Beating, Klein inversion, or bimba/pratibimba split. |
| 7 | residue/return carrier | After-ring, octave-lift, or profile-tail carrier. |

These roles are labels over the existing eight live carriers. The exact frequency values continue to be written by `MathemeHarmonicProfile.audio_octet`.

Required nodal roles over the quartet:

| Quartet role | Bell reading | Required behavior |
|---|---|---|
| 0 | bimba P0 anchor | Establishes one still pole of the bimba face. |
| 1 | bimba P5 anchor | Establishes bimba completion/return and boundary damping. |
| 2 | pratibimba P0 anchor | Establishes the reflected still pole. |
| 3 | pratibimba P5 anchor | Establishes reflected completion/return and Klein boundary. |

The quartet must remain a boundary authority. Renderers may read it, hash it, and display it. They must not treat it as four extra oscillators unless a later spec explicitly defines a protected synthesis edge.

## 3. The 7 + 5 View

The 7+5 split is a view over the same 12-slot chromatic body:

```text
12 chromatic slots
  7 diatonic sounded roles
  5 chromatic-complement silent anchors
```

Current state:

- `MathemeDiatonicContext` in `Body/S/S0/portal-core/src/kernel/projections/diatonic.rs` records only diatonic membership for pitch classes `0, 2, 4, 5, 7, 9, 11`.
- `MathemeChromaticProfile` in `Body/S/S0/portal-core/src/kernel/projections/chromatic.rs` records the active pitch and mirror facts, not the full 12-slot body.

Required update:

`ModalResonatorProfile` must carry an explicit `chromaticBody[12]` or equivalent projection where every slot supports orthogonal labels rather than a single enum. Current S0 math makes `octet-live` and `diatonic-sounded` overlap, so these labels must compose instead of competing.

At minimum, each slot needs:

- `pitchClass`
- `isDiatonic`
- `diatonicDegree`
- `octetIndices[]`
- `nodalRoles[]`
- `silentAnchorRole`
- `mirror`

The silent complement is not an absence bucket. It supplies cymatic constraint, color tension, and afterimage. It must be available to M2' and M3' as structured state so the diatonic reading can work with the cymatic/bell field instead of masking it.

## 4. `ModalResonatorProfile`

`ModalResonatorProfile` is an additive profile-bus field derived in S0 from `MathemeHarmonicProfile`. It is the modal/bell interpretation of the existing profile, not a new source of pitch truth.

Minimum shape:

```ts
interface ModalResonatorProfile {
  schemaVersion: 1;
  source: 'MathemeHarmonicProfile';
  tick: number;
  tick12: number;
  degree720: number;
  lensMode: { lens: number; mode: number; lensModeIndex: number };
  m2Address72: {
    address72: number;
    lensAnchorIndex: number;
    tick12: number;
    position: number;
    source: 'MathemeHarmonicProfile.resonance72.lensAnchorIndex';
  };
  chromaticBody: readonly ModalChromaticSlot[]; // length 12
  liveOctet: readonly ModalOctetCarrier[];      // length 8
  nodalQuartet: readonly ModalNodalAnchor[];    // length 4
  diatonicSet: readonly ModalDiatonicRole[];    // length 7 when resolved
  silentComplement: readonly ModalSilentAnchor[]; // length 5 when resolved
  bellPartials: readonly BellPartialRole[];     // length 8, maps onto liveOctet
  cymaticMaterial: ModalCymaticMaterialProfile;
  privacyClass: 'public-current-context';
  authority: {
    pitch: 'MathemeHarmonicProfile.audio_octet';
    nodal: 'MathemeHarmonicProfile.nodal_quartet';
  };
  sourceFields: {
    activeChromatic: 'MathemeHarmonicProfile.chromatic';
    activeDiatonicContext: 'MathemeHarmonicProfile.diatonic';
    resonance72: 'MathemeHarmonicProfile.resonance72';
  };
}
```

Field rules:

- `liveOctet[i].hz` must equal `MathemeHarmonicProfile.audio_octet[i]`.
- `nodalQuartet[i]` must be copied from or structurally derived from `MathemeHarmonicProfile.nodal_quartet[i]`.
- `bellPartials[i].octetIndex` must equal `i`.
- `chromaticBody.length` must be `12`.
- `liveOctet.length` must be `8`.
- `nodalQuartet.length` must be `4`.
- `diatonicSet + silentComplement` must cover the 12 chromatic slots without duplication as a diatonic/silent partition; `liveOctet` and nodal labels may overlap those slots.
- `lensMode.lens` must be `0..11`, `lensMode.mode` must be `0..6`, and `lensMode.lensModeIndex` must be `lens * 7 + mode`.
- `m2Address72.address72` must equal `MathemeHarmonicProfile.resonance72.lensAnchorIndex`. Current S0 derives that value as `tick12 * 6 + position`. It must not be derived from `lensMode.mode`.

Schema compatibility:

- The first implementation may introduce `modalResonator` as an optional field on profile schema v1 to avoid breaking current clients.
- `modalResonator` may remain optional in profile schema v1. Bump to profile schema v2 only if the field becomes mandatory or if an existing field's shape or semantics changes.
- Rust owns snake_case internals. Serialized Theia/profile JSON owns camelCase. New serialized field names must use `modalResonator`; `modal_resonator` may be accepted only as an alias at ingestion boundaries.

## 5. `M123ChimeFrame`

`M123ChimeFrame` is a tick event, not a standing profile field. It records that one tick has been resolved by the physical pole.

Minimum shape:

```ts
interface M123ChimeFrame {
  eventType: 'm123.chime';
  contract: 'S0.kernel-bridge.m123-chime-frame';
  sourceProfileGeneration: number;
  tick: number;
  tick12: number;
  degree720: number;
  m2Address72: number;
  m1: {
    surface: 'K2';
    k2SurfaceHandle: string | null;
    playedTorusHandle: string | null;
    playedTorusStatus: 'current-retiring' | 'active-successor' | null;
    strikeRoute: 'profile-bus' | 'world-clock' | 'manual-scrub';
  };
  m2: {
    modalResonator: ModalResonatorProfile;
    m2PrimeMeaningPacketRef: string | null;
    cymaticFrameHandle: string;
    cymaticTextureContributionHandle: string | null;
    exactProfileBus: true;
  };
  m3: {
    codonRotationProjection: Readonly<Record<string, unknown>> | null;
    worldClockBinding: {
      state: 'ready' | 'pending' | 'stale' | 'blocked';
      worldClockHandle: string | null;
      generation: number | null;
      source: 's3.world_clock' | null;
      subscriptionMode: string | null;
      tick: number | null;
      degree720: number | null;
      degree720MatchesProfile: boolean;
      tickMatchesProfile: boolean;
    };
  };
  privacyClass: 'public-current-context';
}
```

Rules:

- `M123ChimeFrame.m2.modalResonator.liveOctet` must remain byte-for-byte compatible with the source profile bus values after JSON numeric round-trip.
- If the world clock is present, `tickMatchesProfile` and `degree720MatchesProfile` must be explicit booleans. Any tick or degree mismatch makes the chime frame incoherent and must block integrated readiness.
- `cymaticFrameHandle` may be a digest/handle for renderer determinism; raw protected personal field bodies must not appear here.
- The event must be additive. It references the current composition proof objects (`K2SurfaceHandle`, `M2CymaticTextureContribution`, `M3CodonRotationProjectionForLensRing`) rather than replacing them.
- The event must be published as a sibling to the current M1 performance stream, or as an additive field on that stream only if all M1/M2/M3 consumers can remain backward-compatible.

## 6. Kernel And Bridge Surfaces

Required S0/S0' update surfaces:

| Surface | Required update |
|---|---|
| `portal-core/src/parashakti/vimarsha_reading.rs` | Keep `audio_octet[8]` and `nodal_quartet[4]` as the source bus. Add helper projection for modal roles only if it can be tested against the current bus values. |
| `portal-core/src/kernel/projections/chromatic.rs` | Add or expose a 12-slot chromatic body projection suitable for 7+5 and 8+4 cross-labelling. |
| `portal-core/src/kernel/projections/diatonic.rs` | Preserve existing diatonic membership; add complement derivation that returns the five silent anchors for the current chromatic body. |
| `portal-core/src/kernel/profile.rs` | Add `modal_resonator` / `modalResonator` as the additive profile field, with authority pointers back to the existing bus. |
| `portal-core/contract-inventory/baseline-profile.json` | Update with a real generated profile, not a hand-written fixture. |
| `epi-cli/src/gate/kernel_bridge_runtime.rs` | Publish `S0.kernel-bridge.m123-chime-frame` and keep `pitch_authority` / `nodal_constraint_authority` pointing at profile bus fields. |
| `epi-cli/schemas/src/kernel-bridge.ts` | Add Zod schemas for `ModalResonatorProfile` and `M123ChimeFrame`; normalize `lensMode` bounds/order; add the epogdoon projection capability if the Rust bridge continues to expose it. |
| `kernel-bridge/src/common/types.ts` | Mirror the new contracts and capability list exactly. |
| `m-extension-runtime/src/common/bridge-api.ts` and bridge adapters | Expose new modal/chime methods and existing epogdoon projection methods only when runtime registration, TypeScript capability lists, adapters, and preflight contracts agree. |

Known drift to fix:

- Rust defines `kernelBridge.m2.epogdoonProjection(address72)`, and M2' has a component contract for it, but it is missing from the Rust runtime capability allow-list, Zod `KernelBridgeCapabilityName`, Theia kernel-bridge capability allow-list, `m-extension-runtime` API/required capabilities, adapter methods, and contract preflight. Parity requires all of those surfaces to add it together before `EpogdoonBridgeEngine` can be treated as live rather than bridge-down.
- `lensMode` and the M2 72-address are different surfaces. `lensMode` is 12 lenses by 7 modes (`lens * 7 + mode`); the active M2 72-address comes from `resonance72.lensAnchorIndex`, currently derived by S0 as `tick12 * 6 + position`, and should be exposed in the modal/chime contract as `m2Address72.address72`.
- The Zod schema currently bounds `lensMode.lens` as `0..6` and `lensMode.mode` as `0..11`, while Rust `MathemeLensMode` is `lens 0..11` and `mode 0..6`. The schema must be corrected without collapsing `lensMode` into `resonance72`.
- Existing profile parity drift must be cleared before the new fields are considered locked: Rust has `diatonic: Option<...>` and `resonance: Option<f32>`, while the Zod schema currently describes `diatonic` and `resonance` with different shapes.
- Bridge parity work must also reconcile the capability request envelope (`sessionKey`, VAK context, route lineage) and runtime event envelope casing/shape (`kind`/`emittedAtMs` vs `type`/`emittedAt`) before adding new modal/chime capabilities or streams.

## 7. Theia Surfaces

Required M' update surfaces:

| Surface | Required update |
|---|---|
| `m1-paramasiva` | Show the modal resonator as strike/topology state. M1' consumes the bus; it does not write pitch. |
| `m1-paramasiva-played-torus` | Current/retiring evidence surface only. Keep existing `audio_octet` particle emitters and `nodal_quartet` satellites intact; do not build new modal/K2 ownership here unless the parent confirms this package as the successor surface. |
| `m2-parashakti` | Extend `M2PrimeMeaningPacket` with `modalResonator` or `modalResonatorDigest/ref`; extend cymatic frame surfaces with a digest/ref, 7+5 silent-anchor display, and bell-partial role labels over the exact 8 channels. |
| `m2-parashakti/AudioBusVisualiser` | Remain visual only. Browser audio APIs must stay absent. Real synthesis belongs behind an explicit music/audio edge such as `portal-core/src/music_tech.rs`. |
| `m2-parashakti/CymaticChladniSurface` | Keep the deterministic CPU/reference renderer and byte-hash tests. A richer modal/bell renderer may be added only with deterministic reference output. |
| `m2-parashakti/CymaticMonoPolyEngine` | Treat MonoPoly state as modal behavior over the chime, not as a local profile calculator. Continue reading kernel-bridge state. |
| `m3-mahamaya` | Bind `M123ChimeFrame` to `codonRotationProjection` plus world-clock binding. Surface stale tick/degree mismatches explicitly and block incoherent chimes. |
| `plugin-integrated-1-2-3` | Treat `M123ChimeFrame` as an additive composition proof that references current handles. Add `pending-modal-resonator` and `pending-m123-chime-frame` blockers without replacing `pending-k2-surface`, `pending-cymatic-mount-point`, `pending-codon-rotation-export`, or `pending-ananda-vortex`. |
| `plugin-integrated-1-2-3/src/common/wave-a-markers.ts` | Add `modalResonator` and `m123ChimeFrame` markers while preserving `klein_flip`, `resonance72`, six-axes-of-72, `audio_octet[8]`, and `nodal_quartet[4]`. |
| `m4-nara` | Receive protected lived resonance only through handle/digest-safe pathways. Do not expose raw personal field bodies. |
| `m5-epii` | Review chime coherence, schema drift, observed-vs-intended evidence, and readiness blockers. M5' verifies; it does not own the audio bus. |

## 8. Cymatics

Current M2' cymatic behavior is correct in principle:

- `renderM2CymaticFrame` requires exact `audioOctet[8]` and `nodalQuartet[4]`.
- `renderCymaticChladniSurfacePixels` is deterministic and byte-hashed.
- Tests use `portal-core/contract-inventory/baseline-profile.json` and assert byte-identical output for repeated renders.

Required next shape:

- `M2PrimeMeaningPacket` gains `modalResonator` or `modalResonatorDigest/ref`.
- `M2CymaticFrame` carries only a digest/ref plus exact 8+4 bus facts.
- `renderM2CymaticFrame` must not synthesize modal data locally.
- The renderer's `mode` remains honest about fidelity. Current `deterministic-stylised` may stay as the reference implementation.
- A later `modal-bell-reference` renderer can add bell/material behavior, but it must be deterministic, testable, and tied to the same 8+4 bus.
- No personal cymatic field body may cross into public-current M2'. M4' remains the protected local field owner.

## 9. Audio Output

The system currently carries audio state, not browser audio synthesis:

- M2' `AudioBusVisualiser` asserts `data-audio-output="none"`.
- It explicitly rejects `AudioContext`, `<audio>`, `OscillatorNode`, `getUserMedia`, and related browser audio APIs.
- It points to `portal-core/src/music_tech.rs` and MPE / MTS-ESP as future-facing music edges.

This is correct. The final tranche must not turn M2' UI into the audio engine.

Required audio-output rule:

- `ModalResonatorProfile` is the authority for "what would sound."
- `M123ChimeFrame` is the authority for "what chimed at this tick."
- Actual synthesis is a separate edge with explicit timing, permissions, and tests. It may consume the chime frame but must not back-write profile truth.

## 10. Privacy

Public-current:

- `ModalResonatorProfile`
- `M123ChimeFrame`
- public cymatic handles/digests
- bus values already exposed through the current profile contract

Protected-local:

- personal psychoid cymatic field bodies
- M4' local lived resonance
- any raw body derived from protected Nara context

The existing portal-core psychoid cymatic handle test is the privacy model for protected local handle derivation: it consumes real `audio_octet` and `nodal_quartet`, emits digests/handles, and rejects raw field-body exposure. Current privacy coverage is also distributed across M4/M5 and integrated-composition suites. This spec still requires dedicated acceptance tests proving `ModalResonatorProfile` and `M123ChimeFrame` serialization never emits raw protected field bodies or raw personal cymatic payloads.

## 11. Readiness And Tests

Mock-only tests are insufficient for signoff. For each contract surface introduced here, at least one acceptance test must use a real S0-generated profile or the generated baseline inventory, while narrower unit tests may continue to use compiled-source synthetic payloads.

Required test classes:

| Test class | Acceptance |
|---|---|
| S0 profile projection | Generated `MathemeHarmonicProfile` contains `modalResonator`; live octet equals `audio_octet` / serialized `audioOctet`; nodal quartet equals `nodal_quartet` / serialized `nodalQuartet`; 12-slot body has 12 slots; diatonic/silent partition covers 12 without duplication; octet and nodal labels may overlap that partition. |
| Bridge schema parity | Rust typed JSON, Zod schema, Theia bridge types, `m-extension-runtime`, and adapters accept the same generated profile/chime event and reject wrong octet/quartet lengths, missing VAK/session lineage, and stale event envelope shapes. |
| M2 cymatic determinism | Current byte-identical renderer tests remain passing, and a new acceptance test proves `modalResonator` metadata or digest changes deterministic hash only when the underlying authoritative bus or declared modal metadata changes. |
| M1/M2/M3 composition | At least one acceptance test drives a real generated profile plus world-clock payload through `plugin-integrated-1-2-3` and proves readiness fails on any generation, tick, degree720, or chime-frame mismatch across M1/M2/M3. |
| Privacy | M4' personal cymatic and psychoid renderer handle tests continue hiding raw protected field bodies; new public-current `ModalResonatorProfile` / `M123ChimeFrame` serialization tests prove no raw protected field body crosses the boundary. |
| Drift guard | A parity test fails if any one of Rust, Zod, TypeScript, Theia capability mirrors, or contract preflight disagrees on `lensMode` order/bounds, `m2Address72.address72` derivation from `resonance72.lensAnchorIndex`, field casing, or the presence of `kernelBridge.m2.epogdoonProjection(address72)`. |
| Wave-A markers | Integrated 1-2-3 readiness tests prove `modalResonator` and `m123ChimeFrame` markers exist without removing the existing Wave-A markers. |

## 12. Non-Goals

- Do not replace `audio_octet[8]`.
- Do not replace `nodal_quartet[4]`.
- Do not let Theia renderers locally synthesize authoritative pitch or nodal constraints.
- Do not expose protected M4' personal cymatic bodies in M1'/M2'/M3' public-current surfaces.
- Do not make browser audio output part of M2' visual components.
- Do not write plan files from this spec until the spec has been reviewed.

## 13. Canon Update Flags

When implemented, update these canon surfaces:

- [[M'-SYSTEM-SPEC]]: add `ModalResonatorProfile` and `M123ChimeFrame` to the shared harmonic/musical surface law.
- [[M'-PORTAL-SPEC]]: describe the `0` parent face as the visible chime surface for M1'/M2'/M3'.
- [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]]: add `M123ChimeFrame` as an additive composition proof object over the existing K2, M2 cymatic texture, and M3 codon projection handles.
- [[M1'-SPEC]]: declare M1' as resonant body/strike topology consumer.
- [[M2'-SPEC]]: declare M2' as modal/cymatic/bell partial interpreter over the exact 8+4 bus.
- [[M3'-SPEC]]: declare M3' world-clock/codon inscription of the chime event.
- [[M4'-SPEC]] and [[m4-prime-psychoid-cymatic-field-engine]]: preserve protected local field boundaries.
- [[M5'-SPEC]]: add review/evidence obligations for chime coherence and schema drift.
- [[ql-musical-derivation-v3]]: if canon language changes, clarify that 7+5 and 8+4 are two compatible cuts through the same 12-slot chromatic body.

## 14. Final Acceptance

The final Cycle 3 tranche is complete only when:

1. `ModalResonatorProfile` is generated from the real S0 profile and transported through bridge schemas.
2. `M123ChimeFrame` can be emitted for a real profile tick.
3. M1', M2', and M3' can each read the same chime frame without local recomputation of pitch or nodal truth.
4. M2' still passes deterministic cymatic tests.
5. M4' protected cymatic handle tests still prevent raw field exposure, and new public-current `ModalResonatorProfile` / `M123ChimeFrame` serialization tests prove no raw protected field body crosses the boundary.
6. The integrated 1-2-3 surface can use the chime frame as proof only when the same profile generation, tick, degree720, M2 address, and world-clock binding are coherent across all three contributors.
7. Zod, TypeScript, Theia capability mirrors, contract preflight, and Rust agree on `lensMode` order, `m2Address72.address72` derivation from `resonance72.lensAnchorIndex`, field casing, event envelope shape, and every bridge capability consumed by Theia.
8. `modalResonator` and `m123ChimeFrame` readiness markers are present without replacing the existing Wave-A markers.
