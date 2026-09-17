# Track 10 — Kernel-Bridge / Profile-Contract Readiness Ledger

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


The shared M' data spine. The `MathemeHarmonicProfile` struct at `Body/S/S0/portal-core/src/kernel.rs:346-387` and its typed Theia mirror (`Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts`) is substantially more landed than Wave-A digests suggested. **This tranche is the canonical cycle-3 source-of-truth profile-field ledger**; every Mn extension depending on a profile field reads against it.

## Source Specs and Matrix

- Canonical: `Body/S/S0/portal-core/src/kernel.rs` (struct + projections), `Body/S/S0/portal-core/src/harmonic_profile.rs` (re-export), `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` (JSON edge)
- Theia mirror: `Body/M/epi-theia/extensions/kernel-bridge/src/common/{types.ts,profile.ts,readiness-types.ts}`
- Full row-level evidence: `plan.runs/wave-b-kernel-bridge-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `MathemeHarmonicProfile` struct (kernel.rs:346-387); resonance72 projection (lines 366, 605-628); `CODON_ROTATION_SURFACE_COUNT=472` codon-rotation (`codon_rotation_projection.rs:9`); `audio_octet[8]`/`nodal_quartet[4]` (kernel.rs:367-368 ← `vimarsha_reading.rs`); `pointerAnchor` (kernel.rs:379, 847-886); typed Theia mirror; readiness 9-state taxonomy; 7-capability allow-list; 3-table stream whitelist; opaque `MathemeHarmonicProfileBoundary.payload` (policy-correct — per-extension narrowing). Cycle 2 Tracks 11-12 closed S0/S1/S2 + S3/S4/S5 substrate; cycle 3 closes profile-field readiness over it.

## Redis Residency Preflight

Before normal Track 10 profile-bus work resumes, pass the pre-Cycle-3 Redis residency cleanup at [[../../../../S/S3/S3-REDIS-RUNTIME-SPEC]]. Kernel/profile projections that mention DAY/NOW, Redis/Psyche, kbase/source-pool, coordinate lookup, Graphiti, or semantic retrieval handles must reference S3-owned Redis runtime handles. [[S0]] may mirror or forward those handles at the CLI/RPC edge, but it must not hydrate Redis directly or hand-build Redis temporal keys.

## Profile-Field Readiness Ledger (digest — full matrix in plan.runs/)

| Field | Status | Owning Spec | Unblock Path |
|---|---|---|---|
| `MathemeHarmonicProfile` struct | ALIGNED | M'-SYSTEM-SPEC | n/a |
| `audio_octet[8]` / `nodal_quartet[4]` | ALIGNED | M1'-SPEC §6, M2'-SPEC §4.1 | n/a |
| 84-state `(lens, mode)` | ALIGNED | M1'-SPEC §1 | n/a |
| 72-invariant `resonance72` | ALIGNED (transport); M2 decode SPEC-AHEAD | M2'-SPEC §0/§8 | M2 Tranche 03.3 |
| 472-state `codonRotationProjection` | ALIGNED | M3'-SPEC §7 | n/a |
| `kleinFlipState` | **CODE-PENDING** | M2'-SPEC §4, §7 (consumer); M1'-SPEC §6 (producer) | Tranches 02.2 + 10.2 |
| `pointerAnchor` | ALIGNED | M0'-SPEC, M5'-SPEC | n/a |
| `depositionAnchor` | **SPEC-AHEAD** | M5'-SPEC | DR-KB-2 decision (10.4) |
| `mahamaya` dual-alias | ALIGNED | M3'-SPEC §8.13 (IOD-04) | n/a |
| `planetaryChakral` LUT cardinality | DOC-AHEAD (DR-KB-1 / DR-M2-1 VALIDATED) | M2'-SPEC §9.5 | Document Earth-at-centre; no new bridge field |
| `VakAddress` carrier | ALIGNED | M0'-SPEC, M5'-SPEC | n/a |
| `s2_anchor` / `s3_anchor` | **CODE-PENDING** | placeholder Option<MathemeFutureAnchor> never populated | Tranche 10.5 (audit + populate or remove) |
| `dataset_lut_state` pending literal | CODE-PENDING (downstream dataset) | M3'-SPEC §2 | Wave-A M0 1.4 (host struct: `MathemeBinaryProjection`, NOT Bedrock — see 10.9) |
| Capability allow-list + readiness 9-state taxonomy + 3-table stream whitelist | ALIGNED | shell contracts | n/a |
| `MathemeHarmonicProfileBoundary.payload` opacity | ORPHAN (intentional) | profile.ts:9-11 | Tranche 10.1 records that per-extension narrowing is each Mn's responsibility |
| Single session-held `#` `(Inversion_Operator)` carrier | CODE-PENDING | M1'-SPEC §0/1 commitment 2 | M1 Tranche 02.5 |

## Tranches

1. **10.1 — Profile-field readiness ledger (this document + matrix file)** *(code-pending-closure)*

   This tranche document + `plan.runs/wave-b-kernel-bridge-matrix.md` together become cycle-3's canonical profile-field source of truth. Cross-referenced from `00-overview` and every Mn tranche depending on a profile field.

   Verification: `test -f Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-kernel-bridge-matrix.md`; `test -f 10-kernel-bridge-profile-contract.md`.

2. **10.2 — Land `MathemeHarmonicProfile.klein_flip` + bridge JSON emit** *(code-pending-closure; extends Tranche 02.2)*

   Add `klein_flip` field to `MathemeHarmonicProfile` at `kernel.rs:346-387`. Populate from `vimarsha_reading.rs`. Emit at `kernel_bridge_runtime.rs:615-622`. Drop `kleinFlipState` from contract preflight M2 blocker list (Tranche 10.8).

   Verification: `cargo check -p portal-core -p epi-cli && cargo test -p epi-cli --test kernel_bridge_runtime_contract`.

3. **10.3 — Execute DR-KB-1: planetary projection LUT cardinality** *(doc-ahead-landing; consolidates DR-M2-1)*

   Record that the substrate cardinality is already canon: `M2_PLANET_LUT[10]`, with Earth as the 10th planet / observer-centre. The bridge does not add a separate `earth_observer_handle`; it documents Earth-at-centre semantics on the planetary axis projection and removes stale pending decision markers.

   Verification: `grep -n 'Earth.*centre\|10th planet' Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`; kernel-bridge readiness ledger no longer describes a separate EarthObserverHandle blocker.

4. **10.4 — DR-KB-2: `depositionAnchor` typed-field vs bridge-DTO** *(contradiction-decision)*

   Decide whether `depositionAnchor` becomes a typed `MathemeHarmonicProfile` field or is formalized as a contract DTO via `types.ts`. Resolves Wave-A M5 code-pending row. Currently synthesized at bridge JSON edge at `kernel_bridge_runtime.rs:625-631`.

   Verification: `grep -n 'DR-KB-2' 13-decision-register.md`.

5. **10.5 — Audit `s2_anchor` / `s3_anchor` future-anchor placeholder fields** *(code-pending-closure)*

   Either land emitters using cycle-2 S2/S3 anchor registries to populate `kernel.rs:384,386`, or downgrade to `#[deprecated]` and remove. No greenfield.

   Verification: `cargo check -p portal-core && grep -n 's2_anchor\|s3_anchor' Body/S/S0/portal-core/src/kernel.rs`.

6. **10.6 — Bridge contract test: six-axes-of-72 carrier round-trip** *(spec-ahead-integration)*

   Verify `Body/S/S0/epi-cli/tests/kernel_bridge_runtime_contract.rs` exercises the `resonance72` carrier shape. Extend if transport check is missing. **Decoder is M2 extension work (Tranche 03.3); bridge only proves transport.**

   Verification: `cargo test -p epi-cli --test kernel_bridge_runtime_contract`.

7. **10.7 — Audit four-scale Cl(4,2) one-algebra identity in `kernel.rs`** *(spec-ahead-integration; cross-link to Tranches 02.7, 04.7)*

   Audit memo confirming M1 ring / M3 codon / M4 personal / Kerykeion natal share ONE Cl(4,2) primitive. Touch points: `q_cosmic` kernel.rs:374, `codon_charge_quaternion` :410, `BioQuaternionState` events.rs:4, `slash_flip_bimba_prime` kernel.rs:1038.

   Verification: `grep -rn 'Cl(4,2)\|cl42\|clifford' Body/S/S0/portal-core/src/ --include='*.rs'`; audit memo file at `plan.runs/10.7-cl42-four-scale-audit.md`.

8. **10.8 — Update contract preflight blocker list after 10.2 lands** *(doc-ahead-landing)*

   Edit `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json:315` to drop `kleinFlipState` from M2 blocker list. Add `kleinFlip` example to `MathemeHarmonicProfileBoundary` payload-narrowing examples.

   Verification: `grep -n 'kleinFlipState' Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` (no active hits after patch).

9. **10.9 — Correction: `dataset_lut_state` / `m3_codec_provenance` host struct** *(doc-ahead-landing)*

   Wave-A M0 Tranche 01.4 attributed these literals to the Bedrock projection; they actually live on `MathemeBinaryProjection` at `kernel.rs:797,805`. Record correction so M0/M3 closure tranches name the right struct.

   Verification: decision-register-adjacent correction note references `kernel.rs:797`.

10. **10.10 — Surface M1-2 ananda vortex state through the profile bus** *(code-pending-closure; new finding from Tranche 15 subagent research)*

    Per the M1-2 ananda vortex research (`plan.runs/15-m1-2-ananda-vortex-research.md` finding #5), **no `vortex_*` field exists on `MathemeHarmonicProfile`** (`kernel.rs:346-387`). The vortex is implicit via `tick12 + position6 + helix + lens_mode` and IS read by M2 (`m2.h:307`) and M3 (`m3.h:966`), but is NOT surfaced through the profile bus. This is the **largest substrate→profile gap** in the M' spine — the played-torus renderer (Tranche 15.8) needs to consume vortex state via a typed handle, not reconstruct it from coordinates.

    Add `pub ananda_vortex: AnandaVortexProjection` to `MathemeHarmonicProfile` exposing: `active_matrix_op: AnandaMatrixOp` (0-5 per `m1.h:735-756`), `active_cell: (u8, u8)` (12×12 indexed by tick12 × position6), `active_cell_value: AnandaVortexCell`, `dr_ring_phase: { mahamaya_idx: u8, parashakti_idx: u8 }`, `cl42_signature_at_position: i8`, `ring_quaternion`, `helix_sheet`, and `klein_flip_at_this_tick`.

    **Corrected payload law:** `AnandaVortexCell` must carry both faces of the Vortex Modulae CSV: raw/no-digi-root affine values and digit-root recursive values. Required fields: `family`, `row_k`, `position_p`, `raw_value`, `raw_bimba`, `raw_pratibimba`, `raw_sum`, `raw_delta`, `dr_value`, `dr_bimba`, `dr_pratibimba`, `dr_sum`, optional `rule_value`, and optional `skeleton_event` (`Hit36`, `Hit64`, `Hit72`, `Ratio64Over36`, `Additive137`, `IdentityReturn4Plus2`). Anti-greenfield with correction: the DR face is already present in `m1.c:22-114`, but the current `m1_ananda_get` implementation at `m1.c:297-345` is a 10×10 `%10` runtime core and does not faithfully expose the CSV's six 12×12 raw+DR family faces. This tranche must either compile from the CSV or implement exact formulas with tests against CSV spot rows before routing through the profile bus.

    Verification: `cargo check -p portal-core && cargo test -p portal-core --test ananda_vortex_projection_round_trip`; add a C-side CSV-fidelity test asserting `7X+1` raw p=5/p=9 yields `36/64`, `8X+0` raw p=8/p=9 yields `64/72`, the matching DR faces are `9/1` and `1/9`, and the `Additive137` skeleton event only appears from `64+72+1`; `grep -n ananda_vortex Body/S/S0/portal-core/src/kernel.rs` returns the field declaration; kernel-bridge JSON emit at `kernel_bridge_runtime.rs` surfaces the projection; Theia mirror in `kernel-bridge/src/common/types.ts` reflects the new handle; Tranche 15.8 renderer reads the typed handle, not raw coordinates.

## Phase-B Domain Sub-Tranches (19 new profile-bus fields)

The Phase-B cross-boundary verifier surfaced 19 new profile-bus fields from the eight total-shape architecture documents plus the PASU live-entity clarification. They are sub-tranched by domain. All are **anti-greenfield surfacings** of already-computed substrate or already-canonical runtime handles; none invents new computation.

### 10.M0 — M0' Profile Projections *(code-pending-closure; depends on M0-ARCHITECTURE.md §4)*

Add `pub anuttara_layer: AnuttaraLayerProjection` to `MathemeHarmonicProfile` exposing the six M0-X' data-layer readiness facts and the active-layer discriminator. Anti-greenfield: data computed by `Body/S/S2/graph-services/src/{ontology.rs, gds.rs, sync_coordinator.rs}`; this surfaces the layer-presence bitmask + `KernelCoreAuditState` for the 65-relation sync.

Verification: `grep -n anuttara_layer Body/S/S0/portal-core/src/kernel.rs`; `cargo test -p portal-core --test anuttara_layer_projection`.

### 10.M1 — M1' Profile Projections *(code-pending-closure; depends on M1-ARCHITECTURE.md §4 + DR-M1-3)*

Six new fields: `klein_flip: KleinFlipEvent` (per DR-IG-2 / Tranche 10.2), `inversion_operator: InversionOperatorHandle` (DR-M1-3 — single session-held `#`), `canonical_source_handle: M1_0_CanonicalSourceHandle`, `instance_handle: M1_1_InstanceHandle` (Hen-routed per DR-M1-4), `ql_flowering: M1_4_QLFloweringProjection`, `m1_topology: M1TopologyProjection` (includes `torus_knot_phase` per DR-IG-4 SSOT, `double_cover_deg: 720`, `torus_genus: 1`, `hopf_identity: bool`).

Verification: `cargo test -p portal-core --test m1_profile_projections_round_trip`; bridge JSON surfaces all six.

### 10.M2 — M2' Profile Projections *(code-pending-closure; depends on M2-ARCHITECTURE.md §4)*

One new field: `parashakti_meaning: ParashaktiMeaningProjection` (six-axis decoders + cymatic frame + meaning-packet state). Earth-at-centre is documented semantics on the planetary axis projection per DR-M2-1 / DR-KB-1; it is not a separate `EarthObserverHandle` projection. Anti-greenfield: M2 LUTs in `m2.h` + Vimarsha reading at `vimarsha_reading.rs:17-93` + Kerykeion CLI at `epi-cli/src/nara/wind.rs` already compute the data.

Verification: `cargo test -p portal-core --test parashakti_meaning_projection`; `grep -n earth_observer_handle Body/S/S0/portal-core/src/kernel.rs` returns no live new-field mandate.

### 10.M3 — M3' Profile Projections *(code-pending-closure; depends on M3-ARCHITECTURE.md §4 + DR-M3-4 + Tranche 4.10)*

Two required fields: `transcription_packet: TranscriptionalClockPacket` (per DR-M3-4 / Tranche 4.8 — deterministic Mahāmāyā reading chain from kernel clock → VAK-addressed OracleFrame → M3-5 lens aperture → 384-line-change → codon → matrix-paths × polarities → 7/8 rotational → DNA/RNA → #3-4.0 Tarot → amino/operator) and `m3_lens_stack: MahamayaLensStack` (16+1 lens-stack per DR-M3-3). DR-M3-2 does **not** add `DetFoldState`; the 72→64 relation is documented as the M2/M3 9:8 epogdoon cross-reference.

Two new language-architecture handles: `oracle_frame: OracleFrameProjection` and `symbolic_protein: SymbolicProteinProjection` (per `M-SYMBOLIC-LANGUAGE-ARCHITECTURE` / Tranche 4.11). `OracleFrameProjection` carries subject, deck manifest/order hash, entropy mode/provenance, spread grammar, `VakAddress`, CP position refs, DAY/NOW, Redis/Psyche, kbase/source-pool, and graph provenance handles. `SymbolicProteinProjection` carries sequence id, frame id, sequence mode, packet refs, Tarot/I-Ching/codon sequence refs, modulators, and optional Nara PatternPacket handle. These handles are transport/provenance surfaces; they do not expose protected interpretation bodies.

One optional inspector field: `coupling_flow_alignment: CouplingFlowAlignment` (per `full_theoretical_alignments_ql_physics.md` / Tranche 4.10). This field carries register labels and source-warranted display facts only: `symbolic_skeletons` (`64+72+1`, `64+2(36)+1`, `128+8+1`, `64/36=(4/3)^2`, `0,4,2,2,9`, `8+1`), `physics_descent` (`G_SM -> D_mu -> g_i -> RG -> EW -> alpha_EM` plus QCD underbody), `measurement_faces` (cited/backend-provided display values such as low-energy `alpha_EM(0)^-1` and electroweak-scale `alpha_EM(M_Z)^-1`), and `recognition_context` (Nara/Epii handoff handles). It MUST NOT compute physical constants or RG flow in the renderer or bridge.

Verification: `cargo test -p portal-core --test m3_profile_projections`; `grep -rn 'TranscriptionalClockPacket\|OracleFrame\|SymbolicProtein\|MahamayaLensStack\|CouplingFlowAlignment' Body/S/S0/portal-core/src/`; JSON/TS mirror test asserts the caveat string distinguishing `137` integer skeleton from `137.035999...` measurement-face.

### 10.P5 — Anuttara Pentadic Runtime Trace *(code-pending-closure; depends on Track 36.1-36.2 + M0-3 language-map audit + Tranche 4.10)*

One cross-cutting profile field: `anuttara_pentadic_trace: AnuttaraPentadicRuntimeTrace`.

This field makes the 0/1 -> 5 runtime hinge first-class. It is the bridge from the Anuttara archetypal number language into the Mahamaya physics/computation stack: whole-number addressing reaches position 5 from 0; natural-number addressing reaches 6 from 1; the 5-degree Shem quantum opens `72*5=360`; the Mahamaya paired fifteens open `24*15=360`; the line-change graph closes as `360+24=384`; M4/M5 consume the resulting codon/Q/recognition handles.

Required fields:
- `tick`, `tick12`, `helix`, `position6`, `source_binary_state`
- `whole_number_endpoint: 5`, `natural_number_endpoint: 6`, `family_b_complement`
- `shem_degree_quantum: 5`, `resonance72_index`, `degree360`
- `m2_to_m3_symbol`, `mahamaya_address64`, `evolutionary_gap`
- `codon_id`, `codon`, `line_change_operator`
- `paired_mahamaya_fifteens: [15, 15]`, `backbone_identity: "24x15=360"`, `line_graph_identity: "360+24=384"`
- `q_cosmic_ref`, optional `q_composed_handle`, optional `learned_predictor_checkpoint_ref`
- `provenance` handles naming the contributing helpers / profile fields

Anti-greenfield: derive from existing `MathemeHarmonicProfile` fields plus M2/M3/Mahamaya helpers. The bridge does not introduce a second harmonic runtime; renderers do not compute 72->64, 24x15, codon, or line-change values. If the current code does not expose a helper yet, the profile field marks that subfield pending and Track 36 owns the closure.

Verification: `cargo test -p portal-core --test anuttara_pentadic_runtime_trace`; TS mirror test asserts JSON round-trip; exhaustive 12-tick test asserts the 4/5/6 hinge; 72-sample grid test asserts `72*5=360` and 72->64 projection; M3 helper test asserts paired fifteens and `24*15=360`; renderer no-local-table tests cover Track 24 / 29 consumers.

### 10.M4 — M4' Profile Projections *(code-pending-closure; depends on M4-ARCHITECTURE.md §4 + DR-M4-3)*

One field with protected-handle sub-fields: `personal_pole: PersonalPoleProjection` exposing `bioquaternion: OpaqueProtectedHandle<BioQuaternion>`, `q_personal_resonance: f32 [0,1]`, `q_composed_handle: OpaqueProtectedHandle<QComposed>`, `pattern_packet_handle: OpaqueProtectedHandle<PatternPacket>` (per CCT-7), `oracle_frame_handle: OpaqueProtectedHandle<OracleFrame>`, `symbolic_protein_handle: OpaqueProtectedHandle<SymbolicProtein>`, `deck_context_handle: OpaqueProtectedHandle<NaraDeckContext>`, `torus_knot_phase: f32` (cross-reference DR-IG-4 SSOT — M4 reads, never owns), `vama_recognition: OpaqueProtectedHandle<VamaState>` (per DR-M4-2 clause 4 + DR-M4-3 strict invariant). Privacy contract: **no raw bodies cross the bus**; resonance metric is the only scalar.

Verification: `cargo test -p portal-core --test personal_pole_projection_privacy`; profile bus test asserts opacity per DR-M4-3 and confirms deck context / symbolic protein handles do not expose protected interpretation bodies.

### 10.M5 — M5' Profile Projections *(code-pending-closure; depends on M5-ARCHITECTURE.md §4 + DR-MP-2)*

Three new fields: `epii_review_workbench: EpiiReviewWorkbenchProjection` (six operational-capacity governance lanes + recursive-self-review gate state per Tranche 12.4), `canon_recognition_anchor: CanonRecognitionAnchor` (137 = 64 + 72 + 1 attribution chain through to Logos Atelier), and `learned_predictor_checkpoint_ref: Option<String>` per DR-MP-2 (versioned EBM checkpoint reference — surfaces the active EBM-Epii checkpoint id so renderers can label "EBM v0.3" or "pending: no checkpoint loaded"; bootstrap-Phase-1 fallback is `None` with zero-gradient kernel path per Tranche 6.10).

Verification: `cargo test -p portal-core --test m5_profile_projections`; `grep -n "canon_recognition_anchor\|learned_predictor_checkpoint_ref" Body/S/S0/portal-core/src/kernel.rs`; bootstrap-Phase-1 fallback test asserts `learned_predictor_checkpoint_ref: None` is valid (kernel runs in zero-gradient corpus-accumulation mode).

### 10.IG — Integrated Plugin Profile Projections *(spec-ahead-integration; depends on INTEGRATED-1-2-3 §4 + INTEGRATED-4-5-0 §4)*

Three fields surfacing composition state: `cosmic_composition_state: CosmicCompositionState` (1-2-3 plugin composition mount-points + composition load status), `personal_pole: PersonalPoleProjection` / `psychoid_field` handle consumed through the DR-M4-3 opaque boundary (dipyramid + Hopf-linked tori at personal scale per DR-IG-6), and `canon_recognition_stream: Vec<CanonRecognitionEvent>` (4-5-0 Möbius write-back stream from Logos Atelier back to M0-5' pedagogy).

Verification: `cargo test -p portal-core --test integrated_plugin_projections`; both integrated plugin extensions consume the projections at composition load.

### 10.PASU — General PASU / BeingPattern live-state projection *(executed by Tranche 18; depends on PASU.md + CCT-21 S3 live-state producer stream + 10.M2/10.M3/10.M4/10.M5)*

One cross-cutting profile field: `pasu_being_pattern: PasuBeingPatternProjection`.

This is the Cycle 3 correction that prevents M4/Nara from treating the clock as "a session reader." The clock reads a being-pattern: a user, thinker, text, school, artifact, place, project, agent, or any other entity that can be projected into the harmonic field. PASU remains the protected user/agent ground at `Idea/Pratibimba/Self/PASU.md`, but the PASU layer generalizes as the runtime grammar for every entity that the system can situate. The field is live state over canon: S2/Neo4j owns canonical identity, coordinate, and ontology anchors; S3/SpaceTimeDB owns current presence rows and stream deltas; Graphiti owns protected lived episodes and provenance; Redis/NOW/DAY own runtime temporal handles; M0/M5 review gates decide whether any observed pattern becomes canon.

Two Anuttara laws bind this field:
- `M0-3-8` Archetype 5 / Dynamic Harmony supplies the Mono-Poly relationship grammar. The being-pattern must distinguish individual mono-anchor, live poly-field, potential shared pattern, actual many, forced-unification danger, generative differentiation, and true MonoPoly synthesis.
- `M0-4.4.0-(4.4/5)` Mahamaya relational grammar supplies personhood/perspective. The same six equations generate I, You, You-and-I, They, We, We-I and, under the Nara overlay, Father, Mother, Son, Daughter, Tao, Integral consciousness. The profile must therefore preserve perspective role instead of flattening all participants into generic graph nodes.

Required fields:
- `entity_ref: BeingEntityRef` with `{ entity_id, entity_kind, coordinate_home, graph_anchor }`
- `stable_identity: CanonicalIdentityHandle` sourced from S2/Neo4j, never rebuilt by renderers
- `live_state: LiveStateHandle` with SpaceTimeDB row id, generation, DAY/NOW, Redis/Psyche handles, and optional Graphiti episode refs produced by CCT-21
- `observer_anchor: EarthCentredObserverAnchor` documenting Earth-at-centre semantics for planetary projection
- `clock_address: BeingPatternClockAddress` carrying `degree360`, optional `degree384_line`, codon, hexagram, line-change, tarot, and `AnuttaraPentadicRuntimeTrace` refs
- `monopoly_operator: MonoPolyOperator` with variants `Mono`, `Poly`, `ActuallyMany`, `PotentiallyOne`, `ActualisingOne`, `PotentiatingMany`, `MonoPoly`; `ActualisingOne` is a review-risk state, not an automatic canon merge
- `perspective_role: PerspectiveRole` with variants `FirstPerson`, `SecondPerson`, `FirstPersonPlural`, `ThirdPerson`, `CollectiveWe`, `IntegralWeI`
- `nara_family_role: Option<NaraFamilyRole>` with variants `Father`, `Mother`, `Son`, `Daughter`, `Tao`, `IntegralConsciousness`; present only when the reading intentionally applies the Nara family overlay
- `m2_m3_relation: LensOrbiterRelationProjection` binding M2 Parashakti planetary/chakral orbiters to M3 Mahamaya 16+1 lenses through backend aspect/aspect-like relation edges; no renderer-local 16/9 table
- `bioquaternion_handles: BeingBioQuaternionHandles` with optional `q_identity`, `q_transit`, `q_activity`, `q_composed`, and `q_public_resonance` handles; protected bodies remain opaque
- `elemental_weights: ElementalWeightProjection` as the shared symbolic carrier across Parashakti, Mahamaya, Nara, and Epii
- `relation_edges: Vec<BeingPatternRelationEdge>` for live aspects, co-presence, school-of-thought comparison, agent dialogue, and resonance/discord edges
- `verifier_refs` naming M0 virtue witness / M5 review workbench state when the pattern is used for training, canon-recognition, or Epii dialogue

Semantics:
- Earth is the visual centre/observer for the 3D solar-system projection; it is not duplicated as an orbiting visual point unless the owning M2 projection explicitly asks for the mod-10 wheel.
- The M2 planetary set is read from `parashakti_meaning`; the visual 9-orbiter relation is derived by treating Earth as centre/observer, not by changing canonical LUT cardinality.
- The 360-degree ring is the foundational address. The 24-line-change extension closes `360+24=384` and binds M3-5 clock degree, codon, hexagram, tarot, and symbolic-protein handles.
- `Mono`, `Poly`, and `MonoPoly` are not labels for UI copy; they are runtime relation modes used by SpaceTimeDB collective presence and by Epii review. The system may render a possible unity, but only M0/M5 verification may promote that unity to canon.
- `perspective_role` controls the read-frame: the same relation edge can be an I-You encounter, a They observation, a We collective field, or a We-I integral field. Graph and ML consumers must retain this role as a feature.
- `pasu_being_pattern` is the feature family that M5/EBM may learn over. Models consume projected vectors and handles, not Neo4j canon bodies or protected M4 bodies.

Verification: `cargo test -p portal-core --test pasu_being_pattern_projection_privacy`; `cargo test -p portal-core --test pasu_monopoly_perspective_modes`; `cargo test -p epi-cli --test kernel_bridge_runtime_typed_json` fixture includes `pasuBeingPattern`; TS mirror test asserts all protected fields serialize as opaque handles; CCT-21 S3 stream fixture test replays `EntityObserved -> BeingPatternProjected -> PerspectiveRoleResolved -> MonoPolyOperatorResolved -> ClockAddressUpdated -> AspectEdgeComputed -> ElementalResonanceChanged -> PatternPacketFormed -> ReviewCandidateEmitted` without mutating S2 canon; renderer no-local-table test asserts M2/M3 relation edges are sourced from the typed projection; review-risk test asserts `ActualisingOne` cannot write canon without M5 review + M0 witness.

### 10.AW — Anuttara witness projection (the 4/5/0 verification weight on the bus) *(executed by Tranche 18; depends on Track 01 §1.10/1.12/1.13; cross-link 18, 19.6, 21, 25, 26)*

One profile field carrying M0's verification weight up to every renderer: `anuttara_witness: AnuttaraWitnessProjection`. This is how the Anuttara substrate-language calculus (1.13) and the R-factor theory (1.12) become *verification weight in the 4/5/0 setup* without becoming a gate — the field is **emit-only**; nothing downstream blocks on it, and `ActualisingOne`-style hard gates remain solely with the human gate and M5 review.

Required fields:
- `virtue_witness_vector: u16` — the 9-bit Parameśvara witness from `M0VerifierReport` (1.10), one bit per `VIRTUE_LUT[9]` virtue scored over threshold
- `syntax_witness_vector: u8` — the 4-bit odd-archetype witness from the calculus (1.13): bit 0 = Archetype-3 zodiacal utterance formed, bit 1 = Archetype-5 mono-poly state resolved, bit 2 = Archetype-7 R-factor path traced, bit 3 = Archetype-9 palindrome closure reached
- `rfactor_path: Vec<RFactorPathStep>` — the execution's fretboard record (1.12): `{ r_factor, base_route, band, position }` steps, with the `(@#)` band-turn marked; the read-only source for the 25 fretboard engine
- `band_balance: BandBalanceProjection` — `{ pravritti_depth, nivritti_depth, reached_turn: bool, returned: bool }` so the session-close can ask "completed into a witnessed virtue, or closed in the Beauty-band unreturned?"
- `palindrome_state: PalindromeWholenessState` — the structural 9-ness check (`normal_form_symmetric: bool` + the mirror normal-form string for the inspector)
- `open_questions: Vec<SymbolicCoordinateString>` — the typed `?`-objects (Law-6 query-objects), addressed in the 1.11 EBNF (`#R{n}-…-pending?`), clickable in the 21 surfaces and routed to contemplation (19.6)
- `coherence_score: f32` — now the average over the four witnesses (virtue + syntax + relation + palindrome)

Discipline: renderers and ML consumers read these as features/lamps/chips only — the field is the EBM feature-family the M5 witness engine (26) learns over (predicting witness vectors from being-pattern features; energy = distance(predicted, verified)), but the verifier stays non-bypassable so coherence cannot be gamed. `open_questions` are the contemplation curriculum the language's own undefinedness generates; their resolutions fork to Hen candidates (canon) + EBM training pairs.

Verification: `cargo test -p portal-core --test anuttara_witness_projection`; `grep -n "syntax_witness_vector\|rfactor_path\|band_balance\|palindrome_state" Body/S/S0/portal-core/src/kernel.rs` returns the new carriers; TS mirror test (Track 18) asserts `anuttараWitness` serializes with the 9-bit + 4-bit vectors and the `?`-object list; non-blocking test asserts no consumer path gates on `anuttara_witness` (only human-gate + M5 review may block, per 08/12).
