# M-Dev Context Pack - 07.T5

Generated: 2026-06-01T17:48:11.384Z

## Task

- **ID:** 07.T5
- **Title:** `m2-parashakti` First Slice And Deepening Path
- **Track:** 07-m-extension-individual-tracks.md
- **Computed status:** ready
- **Write scopes:** Idea/Pratibimba/System/extensions/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
- `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`
- `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`
- `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`
- `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md`
- `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`
- `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md`
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/07-m-extension-individual-tracks.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`

## Dependency Context

- 07.T4 - `m1-paramasiva` First Slice And Deepening Path (07-m-extension-individual-tracks.md)

## Track Source Specs

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

## Task Body

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

## Track Open Decisions

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
- **Source gap: `Idea/Pratibimba/System` is the observed implementation tree, but the Theia build shape is not settled.** The repo path is fixed; the actual package manager, Theia version, build scripts, and test harness are still prototype decisions.

## Decision Register Excerpt

| ID | Decision | Category | Primary affected tracks |
| --- | --- | --- | --- |
| UFV-01 | Privacy and consent copy | User-final validation | 04, 05, 06, 07, 08 |
| UFV-02 | User-final validation threshold for recursive or corpus-affecting changes | User-final validation | 04, 05, 07, 08 |
| UFV-03 | Menubar/background lifecycle semantics | User-final validation | 05, 06, 08 |
| UFV-04 | Daily-flow review interruption and default lightweight agent | User-final validation | 04, 06, 07, 08 |
| PRD-01 | ~~Theia browser-mode in Tauri versus local-server/Electron fallback~~ **Resolved: Theia-only, Electron-primary (no Tauri wrapper)** | Resolved | — |
| PRD-02 | ~~Single-webview navigation versus multi-webview persistence~~ **Resolved: Theia Layout Restorer / Workspace service handles layout switching inside one process** | Resolved | — |
| PRD-03 | ~~Kernel-bridge host boundary~~ **Resolved: first-loaded Theia extension; backend module connects to external Rust gateway via WS/JSON-RPC** | Resolved | — |
| PRD-04 | Theia extension API, version, package manager, and build composition | Prototype-resolved | 05, 07, 08 |
| IOD-01 | S3 single WebSocket surface: physical multiplexing versus app-level manager | Implementation-owner | 01, 03, 05, 06, 07, 08 |
| IOD-02 | SpaceTimeDB auth/RLS and privacy discipline | Implementation-owner | 03, 04, 05, 06, 08 |
| IOD-03 | `world_clock` source of truth and cadence | Implementation-owner | 01, 03, 05, 06, 08 |
| IOD-04 | Profile versioning and `binary`/`mahamaya` compatibility | Implementation-owner | 01, 05, 06, 07, 08 |
| IOD-05 | S2 canonical `#` root mapping | Implementation-owner | 02, 05, 06, 07, 08 |
| IOD-06 | Anuttara field naming and provenance contract | Implementation-owner | 02, 04, 05, 07, 08 |
| IOD-07 | n10s/GDS packaging and GDS output persistence | Implementation-owner | 02, 05, 07, 08 |
| IOD-08 | Graphiti runtime boundary | Implementation-owner | 02, 03, 04, 05, 06, 08 |
| IOD-09 | S5 state storage and `ReviewSource` metadata | Implementation-owner | 04, 05, 06, 07, 08 |
| IOD-10 | Deep-link URI grammar and intent acknowledgement | Implementation-owner | 05, 06, 07, 08 |
| IOD-11 | Shell chrome versus individual extension ownership | Implementation-owner | 05, 07, 08 |
| IOD-12 | Observability schema ownership | Implementation-owner | 01, 04, 05, 06, 07, 08 |
| IOD-13 | Nara vault/write service ownership | Implementation-owner | 03, 04, 05, 06, 07, 08 |
| IOD-14 | Plugin activation, composition, and mini-mode model | Implementation-owner | 05, 07, 08 |
| IOD-17 | `capability-matrix.json` as canonical agent-tool governance authority | Implementation-owner | 01, 04, 09 |
| IOD-18 | Smart Connections via Hen `smart_env.rs` as canonical vault semantic-index reader | Implementation-owner | 03, 04, 05, 07, 09 |
| IOD-19 | Hen as canonical vault-write gatekeeper (wikilink integrity, path soundness) | Implementation-owner | 03, 05, 07, 09 |
| DSD-01 | Live local-service harness and CI sequencing | Dependency and sequencing | 01, 02, 03, 04, 05, 06, 07, 08 |
| DSD-02 | Track 01-04 contract readiness before UI hardening | Dependency and sequencing | 05, 06, 07, 08 |
| DSD-03 | Non-dry-run promotion waits for compiler mutation law | Dependency and sequencing | 04, 05, 07, 08 |
| DSD-04 | SpaceTimeDB schema source, migration, and table compatibility | Dependency and sequencing | 01, 03, 05, 06, 08 |
| DSD-05 | Protected Nara/Graphiti substrate before M4 and 4/5/0 readiness | Dependency and sequencing | 02, 03, 04, 06, 07, 08 |
| DSD-06 | M2/M3 authority payload readiness before full 1-2-3 readiness | Dependency and sequencing | 01, 02, 07, 08 |
| DCC-01 | M0 versus M1 `+1` attribution | Deferred canon contradiction | 07, 08, M5' canon |
| DCC-02 | M3 `16+1` / "17th lens" language | Deferred canon contradiction | 07, 08 |
| DCC-03 | M2 planet count and Earth-observer semantics | Deferred canon contradiction | 07, 08 |
| DCC-04 | M4 identity quaternion naming, axis order, and 0/1 polarity | Deferred canon contradiction | 06, 07, 08 |
| DCC-05 | Audio bus and cymatic derivation ownership wording | Deferred canon contradiction | 01, 07, 08 |
| DCC-06 | Alpha section cross-reference drift | Deferred canon contradiction | 07, 08 |

### UFV-01 - Privacy and consent copy

- **Question:** What exact user-facing language explains protected-local data, derived handles, opt-in shared archetype events, audio playback consent, private projection blocks, and review visibility?
- **Why it matters:** Tracks 06 and 08 can only enforce privacy if users understand what is local, what is shared as an opaque handle, and what is explicitly published.
- **Affected tracks:** 04, 05, 06, 07, 08.
- **Options:** Minimal technical labels in readiness UI; full consent copy in `/body` plus Theia; staged consent with short prompts and inspectable detail panes.
- **Recommended default if safe:** Staged consent: concise default copy in `/body`, detailed reviewable privacy explanation in Theia/M5, and no shared archetype publishing or protected-open action without explicit user action.
- **Validation path:** Privacy-copy review by the user; UI tests that block publishing without consent; privacy audit over Tauri events, SpaceTimeDB rows, S2 payloads, S5 DTOs, observability events, workspace state, and DOM text.
- **Consequence of delaying:** M4, 4/5/0, shared archetype, audio, and review surfaces must remain in blocked or local-only mode even if backend contracts are available.

### UFV-02 - User-final validation threshold for recursive or corpus-affecting changes

- **Question:** When do Paraśakti embedding retrains, Paramaśiva corpus refreshes, Anuttara grammar changes, Mahāmāyā runtime-learning updates, Nara voice/corpus shifts, and Epii-on-Epii recursive changes require explicit user-final validation?
- **Why it matters:** S5 can encode gates, but only a user-final policy can say which changes are routine maintenance and which are canon-, identity-, or governance-affecting.
- **Affected tracks:** 04, 05, 07, 08.
- **Options:** Require human validation for all non-read-only changes; require it only for promotion/mutation; require it by target-specific risk class.
- **Recommended default if safe:** Use target-specific risk classes with a conservative rule: any recursive self-modification, deployment gate, protected-personal corpus change, canon publication, or model/profile behavior change that affects future outputs requires human approval.
- **Validation path:** S5 tests proving agents may defer but cannot approve/reject/revise/promote human-required items; review fixtures for each target subsystem; user acceptance of the gate taxonomy.
- **Consequence of delaying:** S5 dry-run promotion can exist, but operational M5-4 actions must stay read-only or deposit-only.

### UFV-03 - Menubar/background lifecycle semantics

- **Question:** What should close, quit, sleep, wake, auto-start, notification permission, global hotkey conflict, crash recovery, and "IDE closed but `/body` lives" mean to the user?
- **Why it matters:** The one-app/two-surface law depends on user trust that the app is neither secretly running too much nor losing session state when the IDE is summoned or dismissed.
- **Affected tracks:** 05, 06, 08.
- **Options:** Always quit on close; minimize to tray by default; ask once and persist preference; expose explicit "sleep app" and "quit app" commands.
- **Recommended default if safe:** Ask once on first close after IDE summon, persist the preference, and always expose visible connection/readiness state plus explicit sleep and quit commands.
- **Validation path:** Desktop e2e for close/foreground/background/wake flows; bridge subscription upgrade/downgrade tests; reconnect tests after gateway/SpaceTimeDB restart while backgrounded.
- **Consequence of delaying:** Track 06 T7 and deep-link/session continuity cannot be finalized, and multi-webview behavior remains only a prototype claim.

### UFV-04 - Daily-flow review interruption and default lightweight agent

- **Question:** Which actor appears in Shell `1` by default, and which review alerts interrupt daily flow versus staying passive?
- **Why it matters:** `/body` must not imply an agent governance model that S5 has not implemented, and review notifications can become either useful safety signals or ambient noise.
- **Affected tracks:** 04, 06, 07, 08.
- **Options:** Default to Nara; default to Anima; default to Epii; use a neutral "agent check-in" affordance that routes after S5/gateway context is known. Alerts may be all passive, priority-based, or always interrupting for human-required gates.
- **Recommended default if safe:** Neutral "agent check-in" entry with S5-routed actor resolution, and priority-based alerts where human-required/security/privacy/deployment gates can interrupt while routine evidence stays passive.
- **Validation path:** S5 DTO tests for alert category/priority; `/body` UX tests for passive versus interrupting alerts; human-gate tests proving no agent approval affordance appears for human-required reviews.
- **Consequence of delaying:** Shell `1` can show safe review counts and readiness, but should not expose default agent promises or interruption behavior as final UX.

### PRD-01 - ~~Theia browser-mode in Tauri versus local-server/Electron fallback~~ **RESOLVED**

- **Resolution:** Theia-only as THE shell. No Tauri wrapper. Electron is canonical desktop deployment (confirmed by Theia documentation and ecosystem reference architectures — Gitpod, Eclipse Che, Coder); browser-mode is built from the same Theia codebase and optionally containerised per the canonical `theiaide` Docker pattern for headless/CI/shared deployment. Decision recorded in `m5-prime-system-shape-and-tauri-ide-canon.md` §0 thesis points 2-3, §2-§3.
- **What this collapses:** Tauri composition prototype (Track 05 T2); single-vs-multi-webview question across surfaces (PRD-02); kernel-bridge host hybrid question (PRD-03); CSP-in-Tauri-webview verification; deep-link URL-scheme cross-app routing.
- **What remains:** Electron build configuration (electron-builder for Squirrel/AppImage/dmg distributions); optional Docker browser-mode build for CI. **No strategic VS Code Extension API borrows currently committed** — the earlier `obsidian-md-vsc` borrow was reversed once research surfaced that the extension is an Obsidian-app remote-control shim (via Advanced URI) not a vault renderer, requires a running Obsidian, and does not render wikilinks / parse vault structure / serve Smart Connections. S1 vault reach is now filesystem-direct-read + Hen-gateway-write per IOD-19; Smart Connections via Hen `smart_env.rs` per IOD-18.

### PRD-02 - ~~Single-webview navigation versus multi-webview persistence~~ **RESOLVED**

- **Resolution:** Obviated by PRD-01. Single Theia process, two workspace layout modes (0/1 daily + deep IDE), switched via Theia's built-in `Layout Restorer` / `Workspace` service. No cross-webview persistence problem because there's no webview-across-apps split. Inside the deep IDE layout, Theia handles its own multi-pane / multi-editor / multi-window UX natively.

### PRD-03 - ~~Kernel-bridge host boundary~~ **RESOLVED**

- **Resolution:** Kernel-bridge is a first-loaded Theia extension. Its frontend module publishes `KernelBridgeAPI` through Theia DI to all M-extensions and integrated plugins. Its backend module connects to the external [[Body/S/S3/gateway]] Rust process via WebSocket/JSON-RPC (the canonical Theia pattern for backend services — same as every LSP integration). Both the 0/1 daily layout and the deep IDE layout share the same bridge instance because there is one Theia process. The Rust gateway is the substrate-of-substrate and stays where it is; the bridge is the thin TS proxy.
- **What this resolves:** No Tauri-singleton hybrid; no cross-process subscription multiplexing; no `/body`-vs-Theia bridge-host ambiguity; one subscription source fans out via Theia DI inside one process. Language divergence stays at the substrate boundary (TS at shell, Rust + C in gateway/kernel).

### PRD-04 - Theia extension API, version, package manager, and build composition

- **Question:** Which Theia release, extension API style, package manager, and Tauri build composition are production for `/pratibimba/system`?
- **Why it matters:** All six individual extensions and two integrated plugins depend on a stable build and contribution model before package skeletons, activation tests, and CI can be meaningful.
- **Affected tracks:** 05, 07, 08.
- **Options:** Recent stable Theia with Theia-native extensions; VS Code Extension API for compatibility; Yarn workspaces per Theia convention; `pnpm` per repo convention; isolated package manager; bundled static assets or supervised local server.
- **Recommended default if safe:** Recent stable Theia, Theia-native extensions for `kernel-bridge` and M surfaces, in-tree `Idea/Pratibimba/System/extensions`, and a package-manager choice made by the Tauri/Theia prototype rather than assumed.
- **Skill-vs-tool invariant (from VAK-as-Operational-Substrate landing):** Within the agent-capability layer (`Body/S/S4/plugins/pleroma/capability-matrix.json`), `vak_profile` is a skill-level concept: every `skills[]` entry has a matching `skills/<name>/SKILL.md` directory enforced by `test_matrix_maps_real_agents_skills_and_hooks`. `dispatch_tools[]` entries are tools not skills and carry no `vak_profile`. Theia extensions hosting skills (under `Idea/Pratibimba/System/extensions/*/skills/*/SKILL.md`) inherit this invariant; new agent capabilities added through Theia extensions must respect skill-vs-tool distinction at matrix-authoring time. See `IOD-17` for the broader governance authority.
- **VS Code Extension API borrows — none currently committed.** Theia's dual-extension-API capability remains as an escape hatch but the earlier `obsidian-md-vsc` borrow was reversed (not a vault renderer; see IOD-19). M-extensions + integrated plugins + kernel-bridge + Canon Studio markdown editor + smart-connections-bridge sidebar + bimba-coordinate file-tree are all Theia-native. Future borrows must show clear ecosystem value before adoption.
- **Validation path:** Build `kernel-bridge` plus `m0-anuttara` as Theia-native slices; verify workbench command/layout service activation; record Theia version/package manager/update cadence ADR; verify any Theia-extension-hosted skills respect the skill-vs-tool invariant via the live `test_matrix_maps_real_agents_skills_and_hooks` check.
- **Consequence of delaying:** Track 07 package inventory and Track 08 composition contracts remain abstract and cannot be enforced by static checks.

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
