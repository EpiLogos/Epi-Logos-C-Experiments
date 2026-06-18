# Track 36 — Anuttara Pentadic Runtime Trace

This track integrates the 0/1 -> 5 discovery as a Cycle-3 development surface, not as commentary. It owns the profile-level trace that carries the Anuttara fivefold hinge through the M' runtime: M0' source substrate, M1' tick and K2 breath, M2' 72-frequency flow, M3' 64-codon Mahamaya computation, M4' bioquaternionic recognition, and M5' Epii EBM review. The target is a real typed payload, renderer consumption contract, tests, and composition overlays.

The core invariant is:

```text
0/1 tick substrate
  -> 5-degree Shem quantum
  -> 72 * 5 = 360
  -> paired Mahamaya 15s across the DNA-code matrices
  -> 24 * 15 = 360
  -> 360 + 24 = 384 line-change graph
  -> 64 codons / 4l + 2 chemical rhythm / bioquaternionic Q_composed
  -> M5' energy-evaluation and return
```

This is the missing complement layer around the 4/5/6 hinge: 4 is the stable bioquaternionic/form-body, 5 is the runtime relation-return and master modulo-6 hinge, 6 is the natural-number completion once counting starts at 1. Whole-number indexing reaches 5 from 0; natural-number indexing reaches 6 from 1. Cycle 3 must preserve that double reading instead of flattening the hinge into a generic "+2".

## Source Ground

- `Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md` — M0-3 archetypal number language; 12fold language from 0-9 plus pre-mathematical `0/1` and `(-)`; Archetype 5 as dynamic harmony / quintessence / relation-return.
- `Body/S/S0/portal-core/src/kernel.rs` — `MathemeHarmonicProfile` tick, `tick12`, `helix`, `position6`, `degree720`, `degree360`, `resonance72`, `binary`, `mahamaya`, `codonRotationProjection`, `qCosmic`, `harmonicGrammar`, `personalPole`, and `learned_predictor_checkpoint_ref` source fields.
- `Body/S/S0/epi-lib/include/m2.h` and `Body/S/S0/epi-lib/src/m2.c` — 72-frequency substrate, 9:8 / 72->64 projection, DET bridge.
- `Body/S/S0/epi-lib/include/m3.h` and `Body/S/S0/epi-lib/src/m3.c` — Mahamaya nucleotide values 6/9/7/8, complementary pair sums of 15, Pauli/trigram base-combination matrices, codon charges, 384 line-change graph, and 24-spoke clock backbone.
- `Body/S/S0/portal-core/src/mahamaya.rs` — 64-address projection, epogdoon relation, Mahamaya payload typing.
- Tracks 04, 10, 24, 29 — M3 physics/profile/frontend/composition owners consumed and extended below.
- Tracks 05, 06, 25, 26 — M4/M5 bioquaternionic and EBM consumers of the trace.
- Track 35 — Fibonacci ground-level-0 temporal substrate; consumed only as clock-backbone companion, not re-authored here.

## Development Tranches

1. **36.1 — `AnuttaraPentadicRuntimeTrace` profile projection**

Add a cross-cutting profile projection to the kernel bridge:

```ts
export interface AnuttaraPentadicRuntimeTrace {
    readonly tick: number;
    readonly tick12: number;
    readonly helix: 0 | 1;
    readonly position6: 0 | 1 | 2 | 3 | 4 | 5;
    readonly sourceBinaryState: '0' | '1' | '0/1';
    readonly wholeNumberEndpoint: 5;
    readonly naturalNumberEndpoint: 6;
    readonly familyBComplement: readonly [0 | 1 | 2 | 3 | 4 | 5, 0 | 1 | 2 | 3 | 4 | 5];
    readonly shemDegreeQuantum: 5;
    readonly resonance72Index: number;
    readonly degree360: number;
    readonly m2ToM3Symbol: number;
    readonly mahamayaAddress64: number;
    readonly evolutionaryGap: 'm2-wholeness-gap' | 'm3-transcription-gap' | 'm1-parent-restored';
    readonly codonId: number;
    readonly codon: string;
    readonly lineChangeOperator: number;
    readonly pairedMahamayaFifteens: readonly [15, 15];
    readonly backboneIdentity: '24x15=360';
    readonly lineGraphIdentity: '360+24=384';
    readonly qCosmicRef: string;
    readonly qComposedHandle?: string;
    readonly learnedPredictorCheckpointRef?: string;
    readonly provenance: readonly string[];
}
```

Anti-greenfield rule: derive every field from existing `MathemeHarmonicProfile` fields and Mahamaya/M2/M3 helpers. No renderer-local tables; no standalone numerology module. If a field cannot be derived from current kernel payloads, it lands as `pending-*` in readiness, with Track 10 owning the closure.

Verification:
- Rust/TS mirror tests prove JSON round-trip for `AnuttaraPentadicRuntimeTrace`.
- Exhaustive 12-tick test proves whole-number 0->5 and natural-number 1->6 readings are both present at the hinge.
- 72-sample grid test proves `72 * 5 = 360`, `m2ToM3Symbol == floor(resonance72Index * 8 / 9)`, and `mahamayaAddress64 == floor(degree360 * 64 / 360)`.
- Mahamaya backbone test proves the paired 15s and `24 * 15 = 360` identity are sourced from M3 helpers, not duplicated constants.

2. **36.2 — Complement-family and mod-6 hinge tests**

Land kernel tests for the complement family that the user called out as the missing middle layer. The test names should use the system language, not generic math labels:

- `anuttara_family_b_complement_pairs_are_pentadic_runtime_hinges`
- `whole_number_five_and_natural_number_six_are_the_same_hinge_in_two_addressing_modes`
- `tick_substrate_0_1_projects_to_position5_without_losing_position6_completion`

The expected complement pairs are read from the existing harmonic grammar / Ananda matrix family data, then asserted against the projection. If the current family labels have moved, the tests should bind to the canonical complement-family enum rather than to the old letter name.

Verification: tests fail if the trace hard-codes the old family naming, if position 5 is swallowed by the 6-count, or if the 0/1 tick substrate is absent from the trace.

3. **36.3 — M3 Maxwell/Mahamaya 15 inspector extension**

Extend Track 04 / Track 24 M3 work with a real inspector panel that puts the two fifteens into one runtime surface:

- Maxwell/Kaluza-Klein witness: 5D symmetric metric components `15 = 10 + 4 + 1`.
- Mahamaya DNA-code witness: paired 15s across the canonical nucleotide / trigram / Pauli matrix combinations.
- Backbone identity: `15 * 24 = 360`.
- Line-change identity: `360 + 24 = 384`.
- Runtime trace: active `AnuttaraPentadicRuntimeTrace` tick, 5-degree quantum, 72-index, 64-address, codon, and Q reference.

This panel is not a caveat box. It is the physics/computation hinge made visible: relation-coordinate, charge/vector field, codon matrix, and clock backbone occupying the same runtime address. Renderer must consume backend-provided display facts and typed trace fields only.

Verification: M3 frontend tests assert the inspector renders `10+4+1`, paired `15+15`, `24x15=360`, `360+24=384`, and the live trace fields from the profile payload; tests fail on local recomputation tables.

4. **36.4 — Integrated 1-2-3 composition overlay**

Extend Track 29 cosmic composition with a pentadic trace overlay:

- M1 K2 surface displays the tick/position6 hinge and the 0/1 substrate marker.
- M2 texture displays the resonance72 index and 5-degree Shem quantum.
- M3 lens-ring displays the Mahamaya address64 and codon cell.
- The overlay line joins `9_M2 = 8_M3 + 1_M1` to the 0/1->5 hinge rather than rendering the Third Spanda spine as an isolated proof label.

The composition continues to use a single profile subscription. The overlay is read-only, profile-tick driven, and rejects stale trace generation mismatches.

Verification: integrated composition tests assert one `ProfileTickSubscription`, matching trace generation across M1/M2/M3 slots, and no renderer-local 72/64 conversion.

5. **36.5 — Integrated 4-5-0 recognition handoff**

Extend Track 29 personal composition and Tracks 25/26 so the trace flows into recognition:

- M4 consumes `qComposedHandle` and the trace's codon/line-change address as protected handles/public-safe scalars.
- M5 consumes `AnuttaraPentadicRuntimeTrace` as an EBM feature context paired with `learned_predictor_checkpoint_ref`.
- M0 grounding displays the 0/1 substrate and R-virtue witness relation to the current hinge.

Privacy invariant: no raw quaternion, journal body, natal-chart body, or raw model feature vector crosses the bus. The trace is public-safe because it carries addresses, handles, and provenance, not protected bodies.

Verification: protected-boundary tests reject raw bodies on geometric slots; EBM tests prove the trace feature is accepted in zero-gradient bootstrap mode and with a real checkpoint ref.

6. **36.6 — M3-to-M5 learning-loop feature contract**

Add the trace to the M5 autoresearch / self-improvement loop as a named feature family:

- Feature family id: `anuttara_pentadic_runtime_trace`.
- Inputs: trace payload, M3 codon charge tuple, M4 `q_composed_handle`, M5 checkpoint ref.
- Target: energy-evaluation of whether a recognition event preserves the hinge coherently across 0/1, 5, 6, 72, 64, 360, and 384.
- Output: review annotation / wisdom delta, never a direct rewrite of canon.

Verification: M5 test uses real trace fixtures emitted by portal-core, not mocks; the zero-gradient path records the feature family without pretending a trained checkpoint exists.

7. **36.7 — No-orphan and routeability closure**

Update the no-orphan audit so `anuttara_pentadic_trace` is a named canonical profile field with owners:

- Producer: portal-core / kernel bridge.
- Physics/computation inspector: M3 Mahamaya.
- Cosmic composition consumer: integrated 1-2-3.
- Personal recognition consumer: integrated 4-5-0 + M4/M5.
- Learning-loop consumer: M5 Epii.
- Grounding witness: M0 Anuttara.

Verification: `m-dev-plan-assess.mjs` indexes Track 36; no orphan rows remain for `0/1->5`, paired 15s, `24x15=360`, or pentadic runtime trace.

8. **36.8 — Languification trace: Parā → Vaikharī descent as profile-bus projection**

Adds the *speech-mode* companion to 36.1's pentadic-content trace. Where 36.1 exposes WHAT the system is computing (0/1 substrate → 5-degree quantum → 72-fold resonance → 64-codon → recognition), 36.8 exposes HOW it is uttering it — which of the four Vāk-levels (Parā, Paśyantī, Madhyamā, Vaikharī) the current VAK evaluation is speaking at, and at which M0 sub-coordinate address. Per DR-VAK-4 the seven CF literals ARE M0 sub-coordinate addresses; per DR-VAK-5 the cycle is complete only when Vaikharī returns to Parā (M0-5 `recognized = true`); per DR-VAK-6 the audible degree is already kernel-side and now lifted to the event surface. 36.8 makes all three projectable together.

The typed projection added to the kernel bridge:

```ts
export interface VakLanguificationTrace {
    readonly cpfNotation: '(00/00)' | '(4.0/1-4.4/5)';
    readonly cfNotation: CfNotation;             // (00/00) | (0/1) | (0/1/2) | (0/1/2/3) | (4.0/1-4.4/5) | (4.5/0) | (5/0)
    readonly m0Address: string;                  // canonical M0 sub-coordinate per DR-VAK-4 address table
    readonly vakLevel: 'para' | 'pashyanti' | 'madhyama' | 'vaikhari';
    readonly diatonicDegree: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;   // 0 = octave-return aperture (enriched Nous)
    readonly modeTonicCf?: CfNotation;           // null/absent = Ionian; (4.0/1-4.4/5) = Mixolydian (Anima default); (5/0) = Locrian
    readonly resonance72Index?: number;          // 0..71 if music-theoretic context active
    readonly halfDecanIndex?: number;            // resonance72_index / 2; 0..35
    readonly biasWeightsEmpty: boolean;          // true iff CPF = Dialogical; the Parā aperture
    readonly recognitionClosed: boolean;         // M0-5 recognized = true; Vaikharī→Parā return per DR-VAK-5
    readonly provenance: readonly string[];      // ['s4.vak.evaluate', 'm0.vak_cf', 'kernel.diatonic_context', ...]
}
```

**Vāk-level assignment rule (binding):**

| `vakLevel` | M0 ground | When |
|---|---|---|
| `para` | M0-0 / M0-1 receptive aperture | `cpfNotation = '(00/00)'` AND `biasWeightsEmpty = true` — the aperture before speech takes direction; empty `vak_bias_weights` per [`Body/S/S2/graph-services/src/retrieval/hybrid.rs`](../../../../../Body/S/S2/graph-services/src/retrieval/hybrid.rs) |
| `pashyanti` | M0-3 archetypal language (intuitive seeing) | CF is `(0/1)`, `(0/1/2)`, or `(0/1/2/3)` — the M0-3 12-fold number language as pure potential |
| `madhyama` | M0-4 Holographic Matrix (interior speech / oikonomia) | CF is `(4.0/1-4.4/5)` (M0-4 itself, Anima's frame) or `(4.5/0)` (M0-4.5/0 Nara, Psyche's lemniscate-synthesis bridge) — the lemniscate fold applying M0-3 grammar to subsystem outputs |
| `vaikhari` | M0-5 Śiva-Śakti (manifest utterance) | CF is `(5/0)` AND `recognitionClosed = true` — the cycle has closed; speech has returned to silence. CF `(5/0)` without recognition flushes as `madhyama` (open cycle, Möbius not yet sealed). |

**Anti-greenfield rule:** every field derives from existing carriers. `cpfNotation` and `cfNotation` come from `VakAddress`. `m0Address` is a static lookup from the DR-VAK-4 address-table (no new graph state; the table lives in spec 07 §M0-Anchoring and is mirrored as a Rust `const M0_CF_ADDRESS: &[(CfNotation, &str)]`). `diatonicDegree` and `modeTonicCf` read `MathemeDiatonicContext` already in the profile. `resonance72Index` reads `MathemeResonance72Projection`. `recognitionClosed` reads `CsField.recognized` (added in DR-VAK-5). `biasWeightsEmpty` is `HybridRetriever::vak_bias_weights(...).is_empty()`. No new lookup tables; no renderer-local computation; no parallel diatonic engine. If a field cannot be derived from current kernel payloads (e.g. `resonance72Index` when M2 has not bound), it lands as `Option::None`, NEVER as a placeholder zero.

**Source ground:**

- [`Body/S/S0/portal-core/src/vak_address.rs`](../../../../../Body/S/S0/portal-core/src/vak_address.rs) — `VakAddress`, `CsField` (with `recognized` per DR-VAK-5).
- [`Body/S/S0/portal-core/src/kernel.rs`](../../../../../Body/S/S0/portal-core/src/kernel.rs) — `MathemeDiatonicContext`, `MathemeResonance72Projection`, `MathemeHarmonicProfile`.
- [`Body/S/S0/epi-lib/include/psychoid_numbers.h:64-72`](../../../../../Body/S/S0/epi-lib/include/psychoid_numbers.h) — the seven canonical CF positions; the M0-anchoring lookup mirrors this table.
- [`Body/S/S0/epi-lib/src/m0.c:805-886`](../../../../../Body/S/S0/epi-lib/src/m0.c) — VAK family handler registration + handlers (M0 IS the VM that VAK speaks in; provenance entries point here).
- [`Body/S/S2/graph-services/src/retrieval/hybrid.rs`](../../../../../Body/S/S2/graph-services/src/retrieval/hybrid.rs) — `vak_bias_weights` (empty in Dialogical mode = Parā aperture; this is already the runtime's correct embodiment of "Anuttara is parā vāk; not even a coherent statement; not an 'it'").
- [`Idea/Bimba/Seeds/M/M0'/Legacy/plans/CLOCK-AND-NARA-SPECS/12-anuttara-m0-languification.md`](../../M0'/Legacy/plans/CLOCK-AND-NARA-SPECS/12-anuttara-m0-languification.md) §§VI–VIII — the canonical languification pipeline (Madhyamā as M0-3 → M0-4 fold; Vaikharī as M0-5 closure).
- DR-VAK-4 (M0 address authority); DR-VAK-5 (recognition closure); DR-VAK-3 (diatonic carrier); DR-VAK-6 (audible eval payload).

**Verification:**

- Rust/TS mirror tests round-trip `VakLanguificationTrace` (every field present, optional fields absent serialize as omitted not null-zero).
- Property test `vak_level_assigned_uniquely_per_cf_under_recognition`: every CF in the seven-position enum × {recognized, not-recognized} × {dialogical, mechanistic CPF} maps to exactly one `vakLevel` per the rule table.
- Property test `dialogical_cpf_with_empty_bias_is_para`: any trace with `cpfNotation = '(00/00)'` and `biasWeightsEmpty = true` carries `vakLevel = 'para'` regardless of CF.
- Property test `cf_mobius_without_recognition_is_madhyama_not_vaikhari`: CF `(5/0)` with `recognitionClosed = false` flushes as `madhyama`, exposing the open-cycle state.
- Property test `m0_cf_address_table_matches_psychoid_numbers_h`: the `M0_CF_ADDRESS` table mirrors `psychoid_numbers.h` ordering and notation byte-for-byte; if `psychoid_numbers.h` changes, the test fails first.
- Integration test `full_day_night_cycle_languification_sequence`: a Day-forward Nous→Logos→Eros→Mythos→Anima pass with Night′-return through Psyche→Sophia produces a trace sequence whose `vakLevel` sequence is `para → pashyanti(×3) → madhyama(×2) → vaikhari` and whose terminal trace carries `recognitionClosed = true`, `diatonicDegree = 0` (octave-return).
- Integration test `dialogical_aperture_emits_para_trace_with_empty_bias`: an Ouroboros-mode brainstorm produces a trace with `vakLevel = 'para'`, `biasWeightsEmpty = true`, and no CF dispatch logged.

**Owners:**

- **Producer**: portal-core kernel bridge (`MathemeHarmonicProfile` extension).
- **Consumer (dispatch)**: Anima `vak_evaluate` skill — reads `vakLevel` to gate Ouroboros-vs-execution branch.
- **Consumer (event)**: `portal.vak_eval` event payload per DR-VAK-6, extended with the trace; OmniPanel renders the current `vakLevel` and `m0Address` as state chips (Parā = aperture marker / silence-of-tonic; Vaikharī = closure-bell with recognition glyph).
- **Consumer (recognition)**: M5 Epii EBM scoring — adds `vakLevel` distribution as a feature dimension on the 72-vector substrate (per DR-MP-2 the EBM operates on the 72-fold lens architecture; languification distribution becomes meta-feature).
- **Consumer (review gating)**: per DR-VAK-5, canon-affecting actions gate on `recognitionClosed = true`; the trace is the public-safe surface S5 review-queue policy reads.
- **Consumer (visual)**: IDE shell + OmniPanel state chips; M0' inspector (Track 21) renders the M0-coordinate address the current CF is speaking at, making the M0↔CF identity visible on the surface.
- **Grounding witness**: M0 Anuttara — the trace is the dev-visible answer to "where is the system speaking from right now, in Anuttara's own notation."

**Composition with Track 36's other tranches:**

- 36.1 produces `AnuttaraPentadicRuntimeTrace` (pentadic content). 36.8 produces `VakLanguificationTrace` (speech-mode). Both ride one `ProfileTickSubscription`; the same generation field gates both. Together they form a complete answer to "where is the system?" — both *what it knows* and *how it is uttering it*.
- 36.4 integrated 1-2-3 overlay consumes `diatonicDegree` (per DR-VAK-6) on the cosmic composition surface — the audible reading of the cosmic engine.
- 36.5 integrated 4-5-0 recognition handoff consumes `recognitionClosed` from 36.8 (per DR-VAK-5) and `q_composed_handle` from 36.1, together gating M4→M5 review-queue entry.
- 36.6 M3-to-M5 learning-loop feature family `anuttara_pentadic_runtime_trace` extends with companion family `vak_languification_trace`; energy-evaluation scores whether a recognition event preserves the hinge AND the speech-mode return-to-silence coherently.
- 36.7 no-orphan audit names `vak_languification_trace` as a canonical profile field with the owner set above.

Verification under 36.7 closure: `m-dev-plan-assess.mjs` indexes Track 36.8; no orphan rows remain for Parā-Paśyantī-Madhyamā-Vaikharī, the M0 address table, or the languification trace.

## Execution Order

1. Land 10.P5 profile contract and Track 36.1 tests.
2. Land 36.2 complement-family / mod-6 hinge tests.
3. Extend M3 backend/profile payload and M3 frontend inspector (36.3).
4. Extend integrated 1-2-3 overlay (36.4).
5. Extend integrated 4-5-0 / M4 / M5 handoff (36.5).
6. Wire M5 feature family (36.6).
7. Close no-orphan and routeability gates (36.7).
8. Land 36.8 languification-trace projection (after DR-VAK-4/5/6 validate; depends on the `CsField.recognized` field from DR-VAK-5 and the `M0_CF_ADDRESS` table from DR-VAK-4). 36.8 is the closing tranche — once it lands, both *content* (36.1) and *speech-mode* (36.8) traces ride one profile tick, and the no-orphan audit (36.7) covers the full eight.

## VAK Routing

- CPF: `(0/1)` — the runtime tick substrate is the root operational concern.
- CT: CT5 — integration across source, computation, recognition, and return.
- CP: 4.5 — Sophia handoff; synthesis that opens the next cycle.
- CF: `(5/0)` — pentadic return, not sidecar theory.
- CFP: M0' -> M4' with M5' learning overlay.
- CS: profile-bus trace, M3 inspector, integrated-composition overlay, M5 feature family.

Absent direct VAK dispatch tools in this session, this track writes the routing into the tranche itself so downstream `/m-dev` execution can dispatch the work through the constitutional agents without reconstructing the context.
