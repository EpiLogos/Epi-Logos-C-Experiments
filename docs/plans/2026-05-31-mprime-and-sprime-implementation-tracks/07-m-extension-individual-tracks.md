# Track 07 - Individual M-Extension Implementation Tracks

This track turns the six standalone M-extension surfaces inside the Theia IDE into buildable, dependency-aware implementation lanes: `m0-anuttara`, `m1-paramasiva`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, and `m5-epii`. These are individual explorable, pedagogical, and developer surfaces in M5-3; they consume M5-2 S/S' contracts through `kernel-bridge`, expose M5-4 evidence and action hooks where relevant, and deliberately stop short of implementing the integrated 1-2-3 and 4/5/0 plugins owned by Track 08.

## Goal

Build six production-ready Theia-native M-extension tracks that can activate independently, consume one shared `kernel-bridge`, render real S0/S2/S3/S5 data without local substrate-law forks, and provide enough observability/evidence/action surface for Sophia, Anima, Pi, Aletheia, and Epii to mediate work safely.

The first implementation slice must establish the extension packaging, shared contribution contracts, readiness handling, real-data test harnesses, and a narrow but useful vertical slice for each extension. The plan does not authorize `/Body` implementation edits and does not build the integrated plugins. It defines the engineering sequence and acceptance gates that future implementation work should follow.

## Source Specs

- [[01-kernel-bridge-and-s0-foundation]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`, "Architectural Keystones", "Tranche 5 - Kernel Bridge Contract Package", "Tranche 6 - `kernel-bridge` Runtime MVP", "Tranche 7 - Agentic Capability And Observability Feed". This is the upstream source for `MathemeHarmonicProfile`, bridge capability boundaries, lite/full mode, and the rule that extensions never own S0 law.
- [[02-s2-bimba-map-population]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`, "Architectural Keystones", "T7 - Coordinate-native graph API parity", "T8 - M5-3 and M5-4 consumption contracts". This is the upstream source for coordinate-native graph payloads, `#` to M-family resolution, OWL/SHACL/GDS readiness, and graph provenance.
- [[03-s3-gateway-and-spacetimedb]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`, "Architectural Keystones", "Tranche 5 - `/body` and Theia kernel-bridge consumption slice". This is the upstream source for one client-facing stream, `world_clock`, session/DAY/NOW handles, SpaceTimeDB deltas, and Graphiti reference boundaries.
- [[04-s5-autoresearch-and-review-extension]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`, "Architectural Keystones", "Tranche 6 - Epii Agent-Access and M5-4 Mediation Surface", "Tranche 7 - M5-3 IDE/Workbench Contract Surface". This is the upstream source for real S5 review/autoresearch state, governance gates, promotion dry-runs, and M5-4 mediation DTOs.
- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, especially "§4 - The kernel-bridge foundational extension", "§5 - The ide-shell-m0-m5 extension", "§6 - The six individual M-extensions", "§7 - The two integrated plugins", "§8 - The 0/1 <-> IDE bridging", and "§11 - Initial tranche specification". This is the immediate implementation-architecture source for Theia package shape, per-extension scopes, and the shell/individual/integrated separation.
- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, especially "§1.2 M5-2 = S-family; M5-3 = M'-family; M5-4 = operational-capacities + agentic mediation", "§4.3 The 6 individual M-extensions", "§4.5 Granularity decision", "§5.3 The downstream extensions consume from kernel-bridge", "§6 The QL context-frame inheritance pattern", and "§8 Milestone 5: Individual M-extensions". This is the canonical source for this track's scope.
- [[M0'-SPEC]] - `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`, "§M0'-1 Prior-Ground Boundary Delta", "§M0'-2 Inferential-Language Delta", "§M0'-3 Graph-Inference-GDS Delta", "§M0'-4 IDE/Surface Placement Delta", "Privacy Boundary", and "Readiness / Test Criteria". This governs `m0-anuttara`.
- [[M1'-SPEC]] - `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`, "Authority boundary", "§1 The Six M1-0' to M1-5' Strata", "§7 The 84-State `(lens, mode)` Playing Landscape", "§13.3 IDE / Kernel-Bridge Placement", "§13.6 Open Contradictions / Questions", and "§14 Readiness / Test Criteria". This governs `m1-paramasiva`.
- [[M2'-SPEC]] - `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`, "Authority boundary", "§4.1 The Canonical `M2PrimeMeaningPacket`", "§7 The Klein-Bottle L <-> L' Meaning-Flip", "§8 The Full 72-Fold Parashakti Correspondence-Tree", "§9.7 IDE Surface Placement", "§9.8 Open Questions / Contradiction Holds", and "§10 Readiness / Test Criteria". This governs `m2-parashakti`.
- [[M3'-SPEC]] - `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`, "Authority boundary", "§7 The 472-State Modal-Inversion Landscape", "§8.10 The 137 Spine, Pauli Overlay, And Four Render Views", "§8.11 Janus Temporal Doorway", "§8.14 App Surface and Pipeline Hooks", "§10.1 Open Questions and Held Contradictions", and "Readiness / Test Criteria". This governs `m3-mahamaya`.
- [[M4'-SPEC]] - `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`, "§6.5 Surface Philosophy", "§6.6 Canonical Nara Content Structure And Surface Placement", "§6.7 Cross-M Interface Seams And Promotion Law", "§7 The Personal-Quaternion at M4-4-4-4", "§7.11 Day Episodes, Artifact Graph, And Temporal Trajectory", "§7.13 Open Canon Questions / Contradiction Register", and "§8 Readiness / Test Criteria". This governs `m4-nara`.
- [[M5'-SPEC]] - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, "Sixfold IDE Surface", "Graph Namespace Model", "Surface Philosophy", "§M5'.1 - §M5'.6", "Backend Contract Consumed", "Relationship To Portal 0/1 And The 4+2 Layer", and "Readiness / Test Criteria". This governs `m5-epii` and the cross-extension M5-3/M5-4 contract.
- [[alpha_quaternionic_integration_across_M_stack]] - `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`, "§0.1 The manifestational sequence as the live spine", "§1 The triple correspondence", "§3 4π already lives at M1-5", "§11 Shared cosmos hosting at S3' via SpaceTimeDB", and "§11.8 Integration gotchas". This is the source for the M1(+1) / M2(72) / M3(64) spine, M4 protected quaternionic identity, and S3' shared-cosmos constraints.
- [[alpha_rasa_bridge_ql]] - `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md`, "§3 The missing prior derivation", "§7.1 Spinor double cover and 4π", "§9 The QL unit corrected", "§10 The 128-to-137 corridor", and "§11 Paramaśiva's fifth". This is supporting source for 137 pedagogy and the M1-5 toroidal parent attribution.
- [[m4-prime-psychoid-cymatic-field-engine]] - `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md`, "§2 The 0/1 layout discipline", "§5 The cymatic substrate", "§9 Temporal-processual integration", "§18.10 Embedded graph view in Tauri-v2", "§18.11 The Jiva-is-Śiva recognition computationally concrete", and "§19 Updated spec deltas". This governs M4's deep personal field and clarifies the M0/M3 graph/wheel relationship.
- [[m4-prime-nara-day-episodes-and-oracle-artifacts]] - `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md`, "§0 Thesis", "§2 The artifact taxonomy", "§4 The canonical Nara file-system layout", "§7 Graphiti integration", "§9 Privacy classes", "§10 The 0/1 free-flow surface and m4-nara IDE extension", and "§11 Implementation milestones". This governs Nara vault/Graphiti/day-artifact work.
- [[m5-prime-autoresearch-self-improvement-loop]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md`, "§3.2 The six surfacing pipelines", "§5.2 The agentic-mediation surface per target", "§8 Promotion-destination type system", "§11 Open spec gaps", and "§13 Implementation milestones". This governs cross-extension observability and Epii improvement routing.
- [[m5-prime-agentic-ide-research]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`, "M5' IDE Operational Surface Summary", "Graph Namespace/File/Code/Agent Integration Model", "Agentic Safety/Review/Promotion Flow", and "Implementation/Test Implications". This governs artifact URI references, review/promotion flow, and the risk of Theia/OpenVSCode sidecars becoming a second source of truth.
- [[m5-prime-epii-on-anuttara-language-development]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`, "§4 M5-2", "§5 M5-3", "§6 M5-4", and "§11 Open development trajectories". This governs Anuttara development actions exposed through M0/M5 surfaces.
- [[m5-prime-epii-on-paramasiva-ql-cpt-and-rag]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`, "§5 M5-3", "§6 M5-4", and "§11 Open development trajectories". This governs Paramaśiva corpus/checkpoint surfaces exposed through M1/M5.
- [[m5-prime-epii-on-parashakti-graph-relational-ml]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`, "§5 M5-3", "§6 Embedding-quality metrics", "§7 M5-4", and "§12 Open development trajectories". This governs Paraśakti recommendation/embedding evidence surfaces exposed through M2/M5.
- [[m5-prime-epii-on-mahamaya-process-reward-rl]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`, "§5 M5-3", "§6 M5-4", and "§11 Open development trajectories". This governs Mahāmāyā kernel-trace/pipeline evidence exposed through M3/M5.
- [[m5-prime-epii-on-nara-qlora-dialogic-voice]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`, "§8 Privacy, consent, and protected-local discipline", "§10 The autoresearch-spine connection", and "§12 What this spec delivers". This governs Nara voice/consent evidence exposed through M4/M5.
- [[m5-prime-epii-on-epii-self-referential-capacity]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md`, "§5.4 The spine-state inspector", "§6 Recursive review loops", "§10 Construction discipline summary", and "§11 Open development trajectories". This governs the `m5-epii` self-referential surface.

## Architectural Keystones

1. **Bridge-only substrate consumption.** Each extension consumes S0/S2/S3/S5 through `kernel-bridge` contracts. No extension opens its own raw SpaceTimeDB subscription, computes harmonic profile values, reimplements coordinate relation law, keeps local codon/tarot/correspondence tables as authority, or talks around S5 review/promotion gates.

2. **Individual extension first, integrated composition later.** `m0-anuttara`, `m1-paramasiva`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, and `m5-epii` must work independently in pedagogical/developer mode. They may export typed contribution points for Track 08, but they must not implement the integrated 1-2-3 or 4/5/0 layouts.

3. **Shell chrome vs deep extension boundary.** `ide-shell-m0-m5` owns always-available IDE chrome: bimba graph quick navigation, canon studio chrome, agentic control room, coordinate tree, and Logos Atelier entry. The individual `m0` and `m5` extensions own deep Anuttara and Epii engagement. Shared widgets are allowed; duplicate authority and competing panels are not.

4. **Theia-native dependency-injection boundary.** The first production lane should use Theia-native extensions for architectural coherence. Each extension declares a dependency on `kernel-bridge` and consumes the `KernelBridgeAPI` through DI or the approved shared adapter. The shared adapter owns reconnection, readiness taxonomy, profile generation metadata, and bridge capability checks.

5. **Readiness is visible, not papered over.** Missing S2 graph law, missing profile fields, missing SpaceTimeDB rows, pending dataset LUTs, missing Graphiti privacy anchors, and missing S5 review routes render as explicit blocked/degraded states. No extension fabricates default content to make a panel look ready.

6. **Real functionality tests.** Tests must exercise real generated/profile JSON, real S2/S3/S5 response fixtures captured from local services or integration harnesses, real Theia activation paths, real persisted stores where stores are involved, and privacy scans. Mock-only or placeholder visual tests do not satisfy readiness.

7. **Evidence and observability are first-class.** Each extension emits typed observability events and exposes evidence handles appropriate to its domain: graph provenance for M0, walk/profile evidence for M1, meaning packets/routing traces for M2, codon/projection/kernel-trace evidence for M3, protected Nara handles for M4, and S5 review/autoresearch state for M5.

8. **Privacy boundaries differ by extension.** M0/M1/M2/M3 mostly consume public-current profile and canonical graph data; M4 is protected-local by default; M5 may inspect protected evidence only through governed review capability. Cross-extension routes must preserve those privacy classes.

9. **M5-4 action hooks are bounded.** Extension actions are requests/deposits/review routes, not direct mutations. Examples: "open in M5 language development", "deposit M2 routing trace", "request review evidence", "open Nara artifact under protected capability". Agents may inspect and deposit according to capability, but they do not promote or mutate canon directly.

10. **Source contradictions are build constraints.** The M0 vs M1 `+1` ambiguity, M3 `16+1` / "17th lens" wording, M4 quaternion-axis differences, M4 0/1 surface polarity, M2 planet/Earth observer semantics, and M1/M2 audio ownership wording must remain visible in UI copy, tests, and readiness gates until owning tracks/spec updates resolve them.

## Tranches

1. **Tranche 0 - Extension Contract Preflight**

   Deliverables:

   - Produce an implementation inventory for the future `/pratibimba/system/extensions/` packages: extension ids, view ids, commands, bridge subscriptions, S2/S3/S5 methods, privacy class, observability event types, and Track 08 contribution exports for all six extensions.
   - Define the shared extension readiness taxonomy: `bridge_unavailable`, `profile_missing_field`, `s2_graph_blocked`, `s3_subscription_blocked`, `s5_review_blocked`, `pending_dataset_lut`, `privacy_blocked`, `degraded_but_readable`, and `ready_public_current`.
   - Define naming conventions for commands and routes: `m0.openCoordinate`, `m1.startWalk`, `m2.openMeaningPacket`, `m3.openCodon`, `m4.openArtifact`, `m5.openReview`, and their read-only/deposit-only variants.
   - Record exact first-slice priorities and blockers per extension before any UI work starts.

   Verification:

   - Contract inventory cites all required bridge methods and rejects direct S-stack access from extension code.
   - Static package checks, once code exists, fail if any extension imports S0/S2/S3/S5 clients directly instead of the shared bridge adapter.
   - Readiness-contract tests cover each blocked/degraded state with schema-valid bridge payloads captured from upstream integration tests, not handwritten placeholder JSON.

2. **Tranche 1 - Theia Extension Skeleton And Shared Runtime Adapter**

   Deliverables:

   - Create six Theia-native extension packages under the future `/pratibimba/system/extensions/` structure named exactly `m0-anuttara`, `m1-paramasiva`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, and `m5-epii`.
   - Each package registers one primary view contribution, one command to open the view, one route handler for deep links, and one observability publisher.
   - Implement a shared `m-extension-runtime` adapter over `KernelBridgeAPI`: profile subscription, graph query dispatch, gateway RPC dispatch, readiness state, privacy gate, observability emit, and safe late-subscriber cache.
   - Add a shared `CoordinateContext` model: selected coordinate, legacy `#` input, canonical M coordinate, current profile generation, pointer anchor, DAY/NOW/session handle when present, privacy class, and provenance.
   - Establish a shared visual shell component for readiness banners, evidence handles, provenance badges, and "open in M5 review" actions.

   Verification:

   - Theia app build loads all six extensions in a local Theia/Tauri prototype without activation-order races.
   - With a real local `kernel-bridge` running, all six extensions receive the same profile generation id and connection state.
   - With the bridge intentionally stopped, all six extensions render blocked readiness and do not crash or fabricate data.
   - Tests prove only one bridge subscription source fans out to six extensions.

3. **Tranche 2 - Shared Evidence, Routing, And Track 08 Contribution Contracts**

   Deliverables:

   - Define per-extension contribution interfaces that Track 08 may import later: compact view components, selection handlers, current-state selectors, evidence serializers, and "mini-mode" render options.
   - Define cross-extension route contracts: M0 coordinate -> M1 walk, M1 `(lens, mode)` -> M2 meaning packet, M2 DET evidence -> M3 codon projection, M3 scalar oracle refs -> M4 protected artifact inspectors, M4 reviewed insight handle -> M5 review item.
   - Define observability event families: `m0.graph.provenance`, `m1.walk.step`, `m2.meaning_packet`, `m2.klein_flip`, `m3.codon_projection`, `m3.kernel_trace_view`, `m4.artifact.created`, `m4.privacy.blocked`, `m5.review.transition`, `m5.spine.event`.
   - Add explicit "composition boundary" docs: Track 07 exports individual capabilities; Track 08 owns integrated screen real estate, multi-extension choreography, and plugin-level inhibition/mini-mode policy.

   Verification:

   - Contract tests assert Track 08 can import exported contribution types without pulling private implementation internals.
   - Tests prove exported contributions still read from the same bridge instance when rendered stand-alone or in a composition harness.
   - Observability events include source extension, coordinate context, profile generation, privacy class, and evidence/provenance handles.

4. **Tranche 3 - `m0-anuttara` First Slice And Deepening Path**

   First-slice priority:

   - Coordinate graph/language inspector for one selected M coordinate with legacy `#` search compatibility, Anuttara syntax fields, provenance, S2 readiness, pointer-web summary, and route buttons into M1-M5.

   Per-extension sub-tranches:

   - **T3.A Graph and language substrate.** Render graph node details from S2: canonical coordinate, label, `symbol`, `formulation_type`, `complete_formulation`, source/spec/code/test anchors, pointer summary, relation families, and missing-field provenance. `#0..#5` must resolve to `M0..M5`; absent M0 syntax fields render as canonical absence, not extraction failure.
   - **T3.B OWL/SHACL/GDS inspector.** Add summonable developer panes for n10s/OWL readiness, SHACL validation reports, GDS overlay handles, kernel-core relation audit status, and graph namespace badges. The extension displays S2-provided facts only.
   - **T3.C M5 action hooks.** Add "open language-development route", "deposit graph readiness evidence", and "request Anuttara review" actions that call S5/S5' review/autoresearch routes through `kernel-bridge`. These create review/deposit requests; they do not mutate Anuttara canon.
   - **T3.D Pedagogical copy.** Teach the M0 prior-ground boundary accurately: M0 is the `0/1` ground M1 receives; M1-5 carries the `+1` parent. Any `137 = 64 + 72 + 1` panel routes parent detail to M1/M2/M3 rather than absorbing it into M0.

   Verification:

   - Live or captured-real S2 tests render selected coordinates within 100 ms after `selectCoordinate` against a populated graph response.
   - Tests prove `#` and M-family input resolve to the same canonical coordinate branch and do not create parallel graph trees.
   - Tests prove missing `symbol` / `complete_formulation` fields render as provenance states and no client placeholders are invented.
   - Tests prove OWL/SHACL/GDS recommendations are shown as inferred/derived/review-pending and never as canonical relations unless S2 marks them canonical.
   - Tests prove M5 actions create S5 review/deposit requests through gateway-shaped methods and cannot write graph canon directly.

   Readiness blockers:

   - Track 02 T7/T8 graph payload parity for node, relation, namespace, OWL/SHACL/GDS, and source/spec/code/test anchors.
   - Track 01 profile and pointer anchors for public-current context.
   - Source contradiction: `alpha_quaternionic_integration_across_M_stack.md` contains residual M0 witness-axis-as-`+1` wording; UI must follow `M0'-SPEC` and `M1'-SPEC` while surfacing the contradiction in developer provenance.

5. **Tranche 4 - `m1-paramasiva` First Slice And Deepening Path**

   First-slice priority:

   - Clock/walk instrument that renders the active `MathemeHarmonicProfile`, the 84 `(lens, mode)` landscape, graph relation walk steps, and exact shared audio-bus values without local pitch generation.

   Per-extension sub-tranches:

   - **T4.A Profile clock and 84-state surface.** Render `tick12`, `degree720`, SU(2) layer, phase, helix, position6, ratio role, `(lens, mode)`, current CF/VAK projection, and readiness. The 84 grid is navigable but backend/profile authority remains S0/S2.
   - **T4.B Relation walk as melody.** Use S2 pointer relation descriptors and profile audio fields to render a coordinate walk. Each step carries previous/current profile, selected edge, reason code, relation law, source Hz, and privacy/deposition policy.
   - **T4.C Audio and external-music boundary.** Playback or export may render the profile's `audio_octet` and `nodal_quartet`; it must preserve exact source Hz/profile metadata and never make M1' the owner of the bus.
   - **T4.D Topology inspector.** Render M1-5 as single-torus recognition: `DOUBLE_COVER_DEG = 720`, `TORUS_GENUS = 1`, Hopf identity, K² tritone crossing, and the M1-origin Klein flip signal. Double-torus rendering stays downstream at M3/Track 08.
   - **T4.E Observability.** Emit `m1.walk.step` and `m1.klein_flip.source` events for Epii/autoresearch consumption.

   Verification:

   - Tests compare all displayed tick, degree, helix, mirror, profile, and relation labels against real `MathemeHarmonicProfile` and S2 response payloads.
   - Tests prove `audio_octet` and `nodal_quartet` consumed by M1 match kernel profile values exactly.
   - Tests prove no frontend constants duplicate `m1.h` substrate law as source of truth.
   - Tests prove M1-5 is presented as the `+1` parent / single-torus recognition site and that M0 is presented as prior ground.
   - Tests prove S2 typed relation descriptors are required before relation-walk readiness is green.

   Readiness blockers:

   - Track 01 profile fields and audio bus.
   - Track 02 typed harmonic pointer relation descriptors.
   - Open contradiction: companion M1 materials still contain older audio-genesis ownership language; implementation follows `M1'-SPEC` authority that M1' consumes the M2-1' Vimarsha-written bus.

6. **Tranche 5 - `m2-parashakti` First Slice And Deepening Path**

   First-slice priority:

   - 72-fold correspondence and meaning-packet surface driven by real profile, S2 provenance, Kerykeion/planetary-chakral state where available, and exact audio-bus values; add a deterministic cymatic renderer driven by those fields.

   Per-extension sub-tranches:

   - **T5.A `M2PrimeMeaningPacket` builder/viewer.** Render a structured meaning packet for a tick, note, routing event, or cymatic frame: 72 address, lens/mode, elemental frame, decan/face, sacred-sonic frame, planetary-chakral state, DET evidence, cymatic signature, provenance, and pending fields.
   - **T5.B 72 tree and correspondence browser.** Render MEF matrix, tattva/element throughline, decanic face, Shem/Asma/mantra/maqam axes, and planetary-chakral runtime as S2/profile-provided data. Configurable or pending correspondences must stay pending.
   - **T5.C Cymatic engine slice.** Implement a real deterministic standing-wave renderer driven by `audio_octet[8]` and `nodal_quartet[4]`. A stylised fallback is allowed only if it computes from the same bus and declares its lower-fidelity mode; static demo waves are not allowed.
   - **T5.D Klein flip visualiser.** Consume M1's `kleinFlipState` and visibly invert lens resonance, element panel, decan face, and planetary/chakral valence per `M2'-SPEC` §7.
   - **T5.E Routing traces.** Emit provenance-safe `m2.meaning_packet` and `m2.routing_trace` events for M5 graph-relational ML and autoresearch. Protected personal content must be excluded.

   Verification:

   - Tests prove all cymatic addresses stay in `[0, 71]`.
   - Tests prove `M2PrimeMeaningPacket` is built from a real profile, M2 data/provenance, S2/Kerykeion handles, and declared pending fields.
   - Tests prove the renderer does not locally synthesize or rewrite audio bus values and that profile `audio_octet` / `nodal_quartet` are consumed exactly.
   - Tests prove correspondence values come from S2/profile payloads or are explicitly pending, not hardcoded renderer folklore.
   - Tests prove the M2->M3 DET evidence is emitted as evidence only; final codon classification remains M3 authority.
   - Tests prove personal-Pratibimba cymatic rendering is blocked outside protected M4 surfaces.

   Readiness blockers:

   - Track 01 profile fields: `resonance72`, `elements`, `planetaryChakral`, `audio_octet`, `nodal_quartet`, `kleinFlipState`.
   - Track 02 S2 correspondence provenance and mapping law.
   - Track 03 Kerykeion/world-clock provider path.
   - Open decisions: planet count / Earth observer handling, active mantra/maqam synthesis policy, and exact API home for Vimarsha bus-writing.

7. **Tranche 6 - `m3-mahamaya` First Slice And Deepening Path**

   First-slice priority:

   - Codon/I-Ching/Tarot wheel that renders backend-provided 64/472 data, M3-0 provenance, and the current `(lens, mode) -> (codon, rotation)` projection through the shared profile.

   Per-extension sub-tranches:

   - **T6.A 64/472 wheel.** Render 64 codons with 7-or-8 rotational slots, active codon, codon class, rotational index, hexagram/trigram, Tarot compression, line-change operator, DNA/RNA phase, and readiness.
   - **T6.B Projection and provenance.** Render `(lens, mode) -> (codon, rotation)` projection, M2 72-source index, DET `floor(index72 * 8 / 9)`, 64-address, gap/provisional state, codon quaternion summary, and dataset LUT state.
   - **T6.C Multi-view depth modes.** Provide flat clock debug, lens annulus, toroidal/world-clock, Hopf identity, Janus orientation overlay, and graph/wheel dual-surface selector. All depth modes read the same profile and S2/S3 state.
   - **T6.D Oracle reference resolver.** Resolve scalar Tarot/I-Ching/codon refs from protected Nara artifacts into safe canonical library details without loading protected artifact bodies.
   - **T6.E Developer trace overlay.** Show backend-provided kernel traces, gap-honesty, Janus-bidirectionality, and pathway-provenance evidence read-only. Reward computation/training/promotion remain outside the renderer.

   Verification:

   - Tests prove 40 non-dual codons x 7 plus 24 dual codons x 8 totals 472 rendered rotational states.
   - Tests prove the same input `(lens, mode)` maps to the same backend-provided projection and that reverse-map constraints render honestly.
   - Tests prove M3-0 provenance renders backend-provided 72-index, DET result, 64-address, gap/readiness state, and no private planetary/chakral interpretation.
   - Tests prove flat wheel and double-torus/world-clock views render the same active tick, degree720, codon/rotation, and lens state.
   - Tests prove no frontend hardcoded codon, tarot, I-Ching, planetary, or reward-training tables are treated as authority.
   - Tests prove oracle scalar ref resolution never loads protected-local artifact bodies.

   Readiness blockers:

   - Track 01 codon-rotation projection and M3 profile fields.
   - Track 02 canonical M3 library graph nodes and scalar ref resolution.
   - Track 03 `world_clock` and native subscription path.
   - Open decisions: `16+1` vs "17th lens" terminology, `TCT` / Nine of Wands dataset mismatch, uniqueness scope of 72->64 DET, and final home for kernel/profile projection fields.

8. **Tranche 7 - `m4-nara` First Slice And Deepening Path**

   First-slice priority:

   - Protected Nara deep surface: DayContainer/artifact tree, journal/flow editor, oracle inspectors, Graphiti episode browser, and a protected personal-field renderer using real handles and privacy gates.

   Per-extension sub-tranches:

   - **T7.A Nara vault and DayContainer browser.** Render `${VAULT}/Pratibimba/Nara/{day_id}/` DayContainer metadata, artifact counts, artifact tree, NOW lineage, privacy class, scalar coordinate refs, and Graphiti episode handles.
   - **T7.B Journal/flow and artifact creation.** Create journal, dream, oracle, reminder, contemplative, and agent-chat artifacts through the canonical Nara service path with frontmatter, JSON envelope, `now_path`, session key, privacy class, and DayContainer linkage.
   - **T7.C Graphiti episodic browser.** Render `:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC`, cross-artifact links, and Saga/community handles from real Graphiti data while keeping bodies protected-local.
   - **T7.D Personal psychoid cymatic field.** Render the protected personal field at M4-4-4-4 from `Q_identity`, `Q_transit`, `Q_activity`, `Q_composed` handles, audio bus, and planetary-chakral state. If full physics rendering is not yet feasible, ship a lower-fidelity deterministic renderer with explicit readiness label, not a decorative placeholder.
   - **T7.E Oracle inspectors and temporal readings.** Render Quaternal Tarot/I-Ching artifacts with scalar M3 refs, lens applications, `Q_activity` update policy, and temporal reading generation over real DayContainer/Graphiti/Chronos/Kairos handles.
   - **T7.F Consent and voice-corpus hooks.** Expose consent records and Nara voice-adapter corpus admission state for M5 review. Consent is granular, revocable where technically possible, pressure-free, inspectable, and separated from ordinary dialogue.

   Verification:

   - Tests create real Nara artifact files and Graphiti episodes, link them to DayContainer, and verify the artifact tree renders from the persisted store.
   - Tests prove journal/dream/oracle bodies never enter S2 canonical graph projections, public profile payloads, or SpaceTimeDB rows.
   - Tests prove Quaternal Tarot/I-Ching artifacts carry real frontmatter/payloads, scalar M3 refs, and `Q_activity` updates only when decay/provenance policy allows.
   - Tests prove the personal field is protected-local, absent from public projections except opaque handles, and never rendered in non-M4 surfaces.
   - Tests prove temporal readings reconstruct trajectory from real Graphiti/Chronos/Kairos/history handles.
   - Tests prove consent-gated Nara corpus inclusion requires explicit consent, PII stripping, Anima admission, adapter provenance, and rollback-capable deployment state before any dialogue adapter is used.

   Readiness blockers:

   - Track 03 session/DAY/NOW/deposition and Graphiti reference shapes.
   - Track 04 Nara-dialogic review/autoresearch gates.
   - M4 protected identity profile and Nara vault service decision.
   - Open decisions: `q_personal` vs integrated `q_Nara`, quaternion axis ordering, Vāma classifier vs contemplative offering, and 0/1 surface polarity.

9. **Tranche 8 - `m5-epii` First Slice And Deepening Path**

   First-slice priority:

   - Epii meta-extension with real S5 review queue, autoresearch spine-state inspector, canon-evolution browser, evidence matrix, recursive-review gate visibility, and artifact URI routing.

   Per-extension sub-tranches:

   - **T8.A Review and improvement workbench.** Render open/deferred/resolved review items, linked improvement runs, governance category, human-required status, promotion destination, dry-run plan, and evidence handles from real S5/S5' state.
   - **T8.B Spine-state inspector.** Render routing configuration, active candidates, route queues, orchestration states, continuity hints, meta-loop events, effect-verification schedules, and recent spine refinements.
   - **T8.C Canon-evolution and artifact graph.** Render `vault://`, `repo://`, `graph://bimba/`, `gnosis://`, `etymology://`, `pratibimba://`, `run://`, `review://`, and `improvement://` refs with coordinate context and provenance.
   - **T8.D Recursive gate UI.** Surface Sophia-on-Sophia, Anima-on-Anima, Pi-on-Pi, and Aletheia-on-Aletheia patterns with structural separation: Pi prepares evidence, target agent reviews, Anima checks, user final-validates.
   - **T8.E Operational hooks.** Provide bounded actions: create review item, deposit evidence, request dry-run promotion, open linked artifact, ask for graph/context retrieval, and hand off implementation tasks through governed agent capability.

   Verification:

   - Tests use real persisted S5 stores or gateway-shaped calls to create a review item, linked improvement run, resolution, dry-run promotion plan, and snapshot.
   - Tests prove agents cannot approve, reject, revise, promote, or weaken human-required and recursive-modification gates.
   - Tests prove non-dry-run promotion remains blocked until compiler mutation law exists.
   - Tests prove artifact URI parsing rejects raw absolute paths where namespace URIs are required.
   - Tests prove protected Graphiti/Nara bodies are represented only as handles/summaries/readiness/review requirements unless a governed review capability opens them.
   - Tests prove VAK/Anima execution deposits completion evidence with CPF, CT, CP, CF, CFP, CS, session/DAY/NOW, source refs, changed artifact refs, and test output handles where applicable.

   Readiness blockers:

   - Track 04 S5 DTOs and gateway methods for review/autoresearch/spine state.
   - Track 03 session and runtime context.
   - Track 02 namespace-aware graph access across `bimba`, `gnosis`, `etymology`, and governed protected handles.
   - Open decision: how much of the agentic control room remains `ide-shell-m0-m5` chrome vs deep `m5-epii` extension view.

10. **Tranche 9 - Cross-Extension Handoff To Track 08**

   Deliverables:

   - Export stable typed contributions from M1/M2/M3 for Track 08's integrated 1-2-3 cosmic-engine plugin: compact M1 clock/walk state, M2 meaning/cymatic state, M3 wheel/projection state, and shared profile generation metadata.
   - Export stable typed contributions from M4/M5/M0 for Track 08's integrated 4/5/0 user-experience plugin: protected M4 field handle, M5 review/canon handle, M0 graph/canonical backdrop handle, BEDROCK link metadata, and privacy gates.
   - Define mini-mode/inhibition rules without implementing integrated layouts: an individual extension may offer compact inspectors while Track 08 owns the integrated screen and choreography.
   - Add deep-link route tests from omni panel routes such as `epi-logos://ide/m4-nara/context?...` into the relevant extension.

   Verification:

   - A composition harness can mount exported compact contributions while preserving one bridge subscription source.
   - Tests prove Track 08 imports do not require private extension internals.
   - Tests prove integrated-mode preparation does not open duplicate S0/S2/S3/S5 connections.
   - Tests prove privacy gates survive contribution export, especially M4 protected personal field handles.

11. **Tranche 10 - Six-Extension End-To-End Acceptance Slice**

   Deliverables:

   - Start local S0/S2/S3/S5 services and the Theia/Tauri prototype.
   - Open each individual extension and drive one real route through it:
     - M0: select coordinate and view Anuttara/S2 provenance.
     - M1: render current 84-state cell and one S2 relation walk step.
     - M2: build one meaning packet and cymatic frame from profile audio bus.
     - M3: render active codon/rotation and M3-0 provenance.
     - M4: create or open one protected Nara artifact and view DayContainer linkage.
     - M5: create/read one review or improvement item and inspect spine state.
   - Produce one cross-extension observability report with profile generation, readiness states, event counts, privacy blocks, and S5 evidence deposits.

   Verification:

   - End-to-end test proves all six extensions consume the same profile generation from one shared bridge instance.
   - End-to-end test proves each extension's first-slice action uses real upstream payloads or persisted stores; no placeholder fixture counts as readiness.
   - Privacy scan proves forbidden material is absent from public payloads: raw `q_b`, raw `q_p`, protected natal data, journal bodies, dream text, oracle interpretation bodies, raw Graphiti episode bodies, and private identity data.
   - Readiness report distinguishes health from usable capability and names every blocked S0/S2/S3/S5 dependency.
   - Final acceptance requires all per-extension contract tests plus the cross-extension E2E slice to pass.

## Dependencies

- **Track 01 must land before full extension readiness.** All six extensions require `kernel-bridge`, current profile generation metadata, profile schema validation, readiness taxonomy, profile/pointer anchors, observability events, and bounded gateway capability dispatch.
- **Track 02 is required for M0, M1, M2, M3, and M5 graph-backed surfaces.** M0 needs Anuttara fields, OWL/SHACL/GDS readiness, and `#` resolution. M1 needs typed relation descriptors. M2 needs correspondence provenance. M3 needs canonical M3 library/scalar refs. M5 needs namespace-aware graph access.
- **Track 03 is required for live temporal/session behavior.** M3 world-clock views, M4 Day/NOW/deposition, M5 runtime context, and all Theia live-stream states depend on S3 gateway/SpaceTimeDB contracts.
- **Track 04 is required for M5 and all M5-4 hooks.** Review queue, autoresearch deposits, spine-state inspector, governance gates, dry-run promotion, and agent evidence depend on S5 DTOs and gateway-shaped methods.
- **The Theia/Tauri prototype must choose the hosting shape.** This track assumes Theia-native packages and one shared bridge adapter, but final implementation depends on whether Theia runs in Tauri webview, localhost browser-mode, or another hybrid.
- **`ide-shell-m0-m5` must stabilize chrome boundaries.** M0 and M5 are both shell-integrated and individual deep surfaces; implementation must decide which commands/views live in chrome vs extension before avoiding duplicate UI ownership.
- **Track 08 depends on this track's exported contributions.** Track 08 should not start integrated UI choreography until Tranche 2 contribution contracts and at least M1/M2/M3 and M4/M5/M0 first-slice state exports exist.
- **M4 privacy and consent services are prerequisites for deep Nara.** `m4-nara` cannot be marked ready until protected-local Nara vault, Graphiti handles, consent records, and privacy-filtered bridge payloads are real.
- **M2/M3 dataset LUT readiness affects visual truthfulness.** Until codon/correspondence datasets are materialized, M2/M3 panels must render `pending_dataset_lut` or equivalent rather than inferred defaults.
- **S5 compiler mutation law remains out of scope.** `m5-epii` may render dry-run promotion and reviewed destination plans, but it must not enable non-dry-run mutation until the owning S1/S5 work explicitly wires mutation law and rollback.

## Open Decisions

- **M0 vs M1 `+1` ambiguity.** `M0'-SPEC`, `M1'-SPEC`, and the main alpha-quaternionic thesis assign M0 as prior `0/1` ground and M1-5 as the `+1` parent. A residual corridor in `alpha_quaternionic_integration_across_M_stack.md` still reads as M0 witness-axis-as-`+1`. The UI must follow the newer M1 attribution while surfacing the contradiction in provenance.
- **Shell vs individual ownership.** Theia canon says M0 graph viewer and M5 agentic/canon surfaces are shell chrome, while this track must also build `m0-anuttara` and `m5-epii` as individual extensions. The exact split of graph viewer, canon studio, agentic control room, and deep Anuttara/Epii panels needs a before-build boundary decision.
- **Theia-native vs VS Code extension API.** Canon recommends Theia-native throughout; implementation should confirm with `kernel-bridge` plus `m0-anuttara` first before all six extensions commit.
- **Bridge host boundary.** Track 01 flags whether `kernel-bridge` is pure Theia extension, Tauri-owned singleton with Theia adapter, or hybrid. All extension APIs should be stable across the decision, but activation and test harnesses depend on it.
- **M2 audio ownership and renderer synthesis.** M2-1' writes the shared bus, while renderer panels must not locally synthesize. The exact API that distinguishes bus-writing, bus-rendering, and optional playback still needs final naming.
- **M2 planet count and Earth observer.** M2 specs distinguish 10-entry LUT, Sun identity-root, nine planetary/rulership handles, and Earth observer-ground. The first M2 surface must show honest readiness until S2/profile law reconciles this.
- **M3 `16+1` / "17th lens" language.** The current law should be rendered as 16 lens positions plus a Level-0 / Fibonacci-Pisano meta-position until companion specs converge.
- **M3 dataset/code mismatch.** The `TCT` / Nine of Wands rotational-state mismatch remains reconciliation work; renderer tests should treat code/spec/tests as runtime authority and surface dataset mismatch as readiness/provenance.
- **M4 identity quaternion naming and axis ordering.** `q_personal`, `q_Nara`, `Q_identity`, and axis ordering differ across specs. M4 implementation needs a kernel-level decision before exposing numeric internals beyond handles.
- **M4 0/1 surface polarity.** The cymatic field engine distinguishes cosmic-facing 0 and personal-facing 1; the system-shape canon describes the lightweight 0/1 surface as carrying personal field affordances. Treat daily 0/1 as composite until M'-TAURI-PORT-SPEC resolves the polarity.
- **Nara vault service owner.** `m4-nara` needs a canonical service path for writing artifacts and Graphiti episodes. It is not yet settled whether this is a Theia service, Tauri Rust command, S3 gateway method, or hybrid `nara-vault-service`.
- **Epii review surface duplication.** The agentic control room in `ide-shell-m0-m5` and the deep `m5-epii` spine inspector overlap. The build needs explicit command/view ownership to avoid two review queues with different state.
- **State persistence across IDE sessions.** Theia workspace state, Tauri app state, bridge cache, extension layout state, Nara drafts, and agent conversation history need one persistence policy.
- **Observability event schema home.** Track 01 and Track 04 both need observability events; this track can define extension event families, but the canonical event schema should live in the shared bridge/S5 contract, not in individual extensions.
- **Source gap: `/pratibimba/system` is not yet an observed implementation tree.** This plan assumes the directory structure from the Theia plan, but actual package manager, Theia version, build scripts, and test harness are still prototype decisions.

## Success Criteria

- Six Theia-native individual extensions activate independently and depend on one shared `kernel-bridge` runtime adapter.
- Each extension ships a first real vertical slice: M0 coordinate/language inspector, M1 clock/walk instrument, M2 meaning/cymatic surface, M3 codon/projection wheel, M4 protected Nara artifact/field surface, and M5 review/spine workbench.
- No extension owns substrate law: harmonic profile, relation law, correspondence law, codon projection, temporal state, Graphiti handles, and review/autoresearch state all come from S0/S2/S3/S5 contracts.
- First-slice tests use real profile payloads, real graph/service fixtures captured from upstream functionality, real persisted stores where stores are involved, and real Theia activation paths.
- Readiness states surface upstream blockers explicitly and never hide missing capability behind placeholder content.
- M4 privacy is preserved across extension routes and Track 08 contribution exports.
- M5-4 evidence/action hooks exist for each relevant extension and route through bounded gateway/S5 capabilities rather than direct mutation.
- Track 08 receives typed contribution contracts and mini-mode exports but no integrated layout implementation from this track.
- End-to-end acceptance proves all six extensions consume the same profile generation and produce typed observability/evidence without duplicate backend subscriptions or protected-data leakage.
