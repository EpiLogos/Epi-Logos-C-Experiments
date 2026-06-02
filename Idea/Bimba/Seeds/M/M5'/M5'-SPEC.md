---
coordinate: "M5'"
status: "active-domain-spec"
updated: "2026-05-31"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
  - "[[alpha_rasa_bridge_ql]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[m5-prime-agentic-ide-research]]"
  - "[[m5-prime-autoresearch-self-improvement-loop]]"
  - "[[m5-prime-system-shape-and-tauri-ide-canon]]"
  - "[[m5-prime-epii-on-anuttara-language-development]]"
  - "[[m5-prime-epii-on-paramasiva-ql-cpt-and-rag]]"
  - "[[m5-prime-epii-on-parashakti-graph-relational-ml]]"
  - "[[m5-prime-epii-on-mahamaya-process-reward-rl]]"
  - "[[m5-prime-epii-on-nara-qlora-dialogic-voice]]"
  - "[[m5-prime-epii-on-epii-self-referential-capacity]]"
  - "[[S5-SPEC]]"
  - "[[2026-05-31-theia-ide-shell-and-m-plugin-architecture]]"
---

# [[M5']] Domain Spec

[[M5']] is [[Epii]] / [[Anuttara]] return: the AI-agent-led developer and pedagogical IDE of [[Epi-Logos]]. It spans canon, graph, code, agents, review, and Logos-cycle archaeology so the system can read, teach, inspect, edit, run, review, and govern its own return to ground.

It reads harmonic-profile evidence as review material, not as decorative status. It also treats the [[Epi-Logos]] corpus itself as an editable, inspectable workbench: the philosophy files at [[M5-1']], the deep [[Bimba]]/[[Gnosis]] library at [[M5-0']], the backend/frontend/agentic code surfaces at [[M5-2']] through [[M5-4']], and the [[M5-5']] [[Logos Atelier]] as the etymological archaeology engine.

## Canonical Substrate Anchors

M5' should expose its library and orchestration substrate directly inside the spec corpus: [[Body/S/S0/epi-lib/include/m5.h]], [[Body/S/S0/epi-lib/src/m5.c]], [[Body/S/S5/epi-gnostic/epi_gnostic/cli.py]], [[Body/S/S5/epi-kbase/src/index.ts]], [[Body/S/S5/epi-kbase-core/src/lib.rs]], [[Body/S/S5/epii-autoresearch-core/src/lib.rs]], [[Body/S/S5/epii-review-core/src/lib.rs]], and [[Body/S/S5/epii-agent-core/src/lib.rs]].

## Sixfold IDE Surface

| Coordinate | IDE surface | Primary object | Operational role | Live substrate |
|---|---|---|---|---|
| [[M5-0']] | Library / Bimba Pedagogy / Gnostic Namespace | Bimba map, wisdom packets, Gnosis library graph, **the RAG-anything substrate (which IS [[Body/S/S5/epi-gnostic]] — not a future composition target)**, kbase integration, quintessential views | Reads and edits sedimented knowledge; teaches coordinate meaning; receives crystallisations from the Atelier; serves RAG retrieval for agents through `s5'.gnostic.*` over epi-gnostic | **[[Body/S/S5/epi-gnostic]] IS the RAG-anything system** — production Python + Graphiti-integrated (`epi_gnostic/cli.py`, `epi_gnostic/graphiti_service.py` 534 LOC, `epi_gnostic/wrapper.py`, `enrichment/`, `storage/`, `cypher/` queries, `Dockerfile.graphiti`, `uv.lock`); plus [[Body/S/S5/epi-kbase]] + [[Body/S/S5/epi-kbase-core]] for kbase corpus; **Smart Connections vault semantic-input** via `s1'.semantic.*` over [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] (`LinkCandidateResponse`); reads bimba topology via [[Body/S/S2/graph-services]] retrieval submodule ([[Body/S/S2/graph-services/src/retrieval/graphrag.rs]], [[Body/S/S2/graph-services/src/retrieval/hybrid.rs]], [[Body/S/S2/graph-services/src/retrieval/coordinate.rs]]) |
| [[M5-1']] | Philosophy / Canon Studio | Epi-Logos philosophy files, worldview docs, foundational instructions | Authors, reviews, and refines the system's theoretical ground and pedagogical canon | **Theia markdown editor** + custom QL/bimba-coordinate decoration extension + wikilink autocompletion merging explicit outlinks with Smart Connections semantic-neighbour suggestions (via `s1'.semantic.*`); **vault read** is filesystem-direct via Theia's FS provider; **vault writes** route through Hen via `s1'.vault.*` gateway methods so [[Body/S/S1/hen-compiler-core/src/wikilinks.rs]] + the broader hen-compiler-core write surface protect wikilink integrity on rename / move / restructure |
| [[M5-2']] | Backend Studio | S' kernel + S-family stack | Makes the actual S' kernel + S backend inspectable and agent-editable through governed tasks, tests, evidence, and live service contracts | S' kernel: [[Body/S/S0/epi-lib]] (12,160 LOC C) + [[Body/S/S0/portal-core]] (~4,500 LOC Rust); S0 CLI: [[Body/S/S0/epi-cli]]; S1 mutation: [[Body/S/S1/hen-compiler-core]] + [[Body/S/S1/hen-compiler]]; S2 graph: [[Body/S/S2/graph-schema]] + [[Body/S/S2/graph-services]]; S3 gateway: [[Body/S/S3/gateway]] + [[Body/S/S3/gateway-contract]] + [[Body/S/S3/epi-spacetime-module]] + [[Body/S/S3/graphiti-runtime]] + [[Body/S/S3/redis-context]]; S4 agents: [[Body/S/S4/pi-agent]] + [[Body/S/S4/ta-onta]] + [[Body/S/S4/plugins/pleroma]]; S5 review/autoresearch: [[Body/S/S5/epii-autoresearch-core]] + [[Body/S/S5/epii-review-core]] + [[Body/S/S5/epii-agent-core]] + [[Body/S/S5/epii-agent]] (carries `agent-contract.json` + `contract-ledger`) |
| [[M5-3']] | Frontend Studio | M'-Theia shell ([[/pratibimba/system]]): 0/1 daily layout, deep IDE layout, M-extensions, integrated plugins | Shapes one Theia shell whose 0/1 daily layout and deep IDE layout share the same kernel bridge in one process | Migrates from [[Body/M/epi-tauri]] (60 TSX + 42 Rust files: typed clients, M-domain components, Tauri Rust commands, stores, shell, OmniPanel); new shell home is [[/pratibimba/system]] |
| [[M5-4']] | Agentic Control Room | Operational-capacity family, Pi/Sophia/Anima/Aletheia, S5 Pi-agent, S' kernel + S0 CLI bridges | Routes surfacing, orchestration, review, bounded execution, and recursive improvement through governed agent capacities | [[Body/S/S4/plugins/pleroma/capability-matrix.json]] (canonical agent-tool governance authority per IOD-17); [[Body/S/S4/pi-agent/agents/anima.md]] (15-tool surface); [[Body/S/S4/ta-onta]] extensions (aletheia, anima, chronos, hen, khora, pleroma + S4-Np-* coordinate folders + spine + shared); [[Body/S/S5/epii-agent/agent-contract.json]] (live `s5'.epii.*` / `s5'.review.*` / `s5'.improve.*` methods); `epi gate dispatch anima-invoke` CLI bridge |
| [[M5-5']] | Logos Atelier | Etymological archaeology, word constellations, Logos-cycle FSM | Runs the scent-following method: root, cognate, drift, psychoid charge, pros-hen synthesis, and Mobius write-back | Composes with [[Body/S/S5/epi-gnostic]] + [[Body/S/S2/graph-services]] retrieval over the `etymology` graph namespace; consumes Smart Connections neighbour data via `s1'.semantic.*` over [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] for cross-term constellation discovery; vault-resident archaeological work read filesystem-direct, written through Hen via `s1'.vault.*` for wikilink integrity |

The six surfaces should feel like one IDE, not six unrelated apps. The user may read a philosophy file, inspect its [[Bimba]]/[[Gnosis]] graph context, ask [[Epii]] to trace a term etymologically, fork an implementation task, watch the bounded agent run, review tests and evidence, then promote the result back into canon.

This table absorbs the system-shape correction from [[m5-prime-system-shape-and-tauri-ide-canon]]: M5-2' is the S-family stack itself, M5-3' is the M'-Tauri/Theia application surface, and M5-4' is the operational-capacity and agentic-mediation layer described by the six Epii capacity papers.

## Graph Namespace Model

The graph viewer is a shared [[M5']] affordance over distinct graph namespaces, not a single flattened graph:

- `bimba`: canonical coordinate topology, M/[[Bimba]] nodes, pointer law, source traceability, and coordinate relations.
- `gnosis`: [[Gnosis]] library/document knowledge, wisdom packets, pithy views, pedagogical explanations, and retrieved source context.
- `etymology`: roots, cognates, semantic drift, word constellations, Logos-stage traces, and [[Logos Atelier|Atelier]] crystallisations.
- `pratibimba`: protected handles into [[Nara]]/[[Graphiti]] personal evidence where governance permits; not raw private journal or unreconciled episode bodies.

[[M5-0']] owns the library meaning of the graph. [[M5-2']] owns the backend graph service contract. [[M5-3']] owns the visual graph workspace. [[M5-4']] lets agents operate on graph-backed tasks. [[M5-5']] generates and validates the etymological graph layer.

Namespace boundaries are load-bearing. [[Bimba]] topology, [[Gnosis]] library context, etymological constellations, and protected [[Nara]] episodes may link by coordinate, source handle, session handle, and review id, but they do not collapse into one data plane.

UI naming migration: existing or interim surfaces may use `gnostic` for the Gnosis/library namespace and `atelier` for the etymology / Logos Atelier namespace. The canonical namespace names are `gnosis` and `etymology`; adapters should translate aliases rather than fork the graph model.

## Surface Philosophy: The Agentic IDE as Conversational Engagement

The [[M5']] subsystem-page is the **prime exemplar** of the conversational-agentic-surface UX philosophy that propagates across the [[M']] stack (per [[M'-SYSTEM-SPEC]] "Default Surface" subsection).

The user does not arrive at [[M5']] to be confronted with library-canon-code-graph-agent-review panels in their full technical glory. They arrive at [[M5']] to **converse with the system about its own self-articulation, code, philosophy, and ongoing work**. The agent ([[Epii]] / [[Anima]] / [[Aletheia]] / [[Pi]] / [[Logos Atelier]] specialist) is the **primary surface**; the panes (library, canon, backend, frontend, agent control room, [[Logos Atelier]]) are *summonable contexts* that the agent opens conversationally as the conversation requires. [[Sophia]] advises and coordinates across these capacities without becoming a panel of her own.

M5' is also the canon-recognition workbench: candidate artifacts are recognized as canon-worthy, evidence-worthy, or private/local before review and promotion. Editing is only one operation inside a larger cycle of recognition, validation, promotion, and return — the Möbius cycle from [[Bimba]] through [[Pratibimba]] back to ground.

When the user says "show me the [[Bimba]] node for Word", the agent opens [[M5-0']] Library to that node. When the user says "let me edit the Sacrifice philosophy file", the agent opens [[M5-1']] Canon Studio. When the user says "run a review on this proposal", the agent opens [[M5-4']] Agentic Control Room with the proposal pre-loaded — agent governance read from [[Body/S/S4/plugins/pleroma/capability-matrix.json]] and [[Body/S/S5/epii-agent/agent-contract.json]]. When the user asks "what's the etymology of [[pratibimba]]?", the agent opens [[M5-5']] [[Logos Atelier]] with the word constellation.

The pedagogical depth of v3 ([[Gebser]] stadia, Name-Power conjugate-pair-vocabulary, [[MEF|L-lenses]], [[Context-Frames]], [[Spanda]] equations, 84-fold mode-tonic landscape, Major/Minor as conjugate-form-selection, Barry Harris 8+4 jazz-scales) is **content the agent teaches in conversation when the user engages with it**, not a wall of always-visible structural detail. [[M5-5']] [[Logos Atelier]] exposes the 6-fold-of-layers as navigable artefacts; [[M5-0']] Library exposes consciousness-register on each [[Bimba]] node; both are summoned, not always-on.

## §-Numbered M5' Canon Deltas Absorbed

§M5'.1 — **System-shape correction.** [[M5-2']] is the **S' kernel substrate + S-family stack**, [[M5-3']] is the [[M']]-[[Theia]] shell at [[/pratibimba/system]], and [[M5-4']] is the operational-capacity layer that binds [[Pi]], [[Sophia]], [[Anima]], [[Aletheia]], [[S5]]/[[S5']], and S0/S0' bridges into governed work (governance authority at [[Body/S/S4/plugins/pleroma/capability-matrix.json]]; [[Epii]] agent contract at [[Body/S/S5/epii-agent/agent-contract.json]]). The kernel ([[Body/S/S0/epi-lib]] + [[Body/S/S0/portal-core]]) is now framed at S' level (substrate-of-substrate) rather than packed inside S0. [[m5-prime-system-shape-and-tauri-ide-canon]] is therefore the canonical [[M5']] dependency.

§M5'.2 — **One Theia shell, two layout modes.** M5' lives inside a single [[Theia]] shell (Electron-equivalent for desktop; browser-mode optional via the same Theia Node backend). The shell carries two workspace layout modes: the **0/1 daily layout** (lightweight workspace — journal, agent check-in, lightweight cymatic, status display; vault read filesystem-direct via Theia's FS provider; writes routed through Hen via `s1'.vault.*` for wikilink integrity) and the **deep IDE layout** (full 4+2 surface with M0/M5 IDE chrome, six M-extensions, two integrated plugins, agentic control room). Layout switching is intra-process via Theia's Layout Restorer / Workspace service; the omni panel is the canonical switch mechanism. There is no Tauri wrapper, no second app — the existing [[Body/M/epi-tauri]] work is migration source not destination. The shared kernel-bridge is the first-loaded Theia extension and the live contract for harmonic profile, [[SpaceTimeDB]] presence, world clock, gateway RPC, kernel trace, audio, cymatic state, and autoresearch observability; its backend module connects to the external [[Body/S/S3/gateway]] Rust process via WebSocket/JSON-RPC, keeping language divergence at the substrate boundary.

§M5'.3 — **Autoresearch spine.** [[m5-prime-autoresearch-self-improvement-loop]] is absorbed as the load-bearing [[Epii]] improvement loop: surfacing, routing, orchestration, and integration run through real [[S5]] review/autoresearch records. The spine may propose, classify, route, and dry-run promotion, but it does not self-promote canon and does not bypass human-required review states.

§M5'.4 — **Six operational capacities.** [[m5-prime-epii-on-anuttara-language-development]], [[m5-prime-epii-on-paramasiva-ql-cpt-and-rag]], [[m5-prime-epii-on-parashakti-graph-relational-ml]], [[m5-prime-epii-on-mahamaya-process-reward-rl]], [[m5-prime-epii-on-nara-qlora-dialogic-voice]], and [[m5-prime-epii-on-epii-self-referential-capacity]] define the target-specific capacities of [[M5-4']] — capability surface bound by [[Body/S/S4/plugins/pleroma/capability-matrix.json]] and [[Body/S/S5/epii-agent/agent-contract.json]]. They establish construction-not-training for [[Anuttara]], CPT/RAG proof support for [[Paramaśiva]], graph-relational ML for [[Paraśakti]], process-reward/federated/runtime learning for [[Mahāmāyā]], [[Anima]]-primary dialogic governance for [[Nara]], and recursive user-final-validation for [[Epii]]-on-[[Epii]].

§M5'.5 — **Recognition surface.** [[alpha_quaternionic_integration_across_M_stack]] and [[m4-prime-psychoid-cymatic-field-engine]] are absorbed as reviewable recognition law: `137 = 64 + 72 + 1` is taught as a canon-anchored psychoid skeleton, and [[Jiva-is-Śiva]] is rendered through protected personal-field foreground, canonical [[Bimba]]-map background, [[BEDROCK]] link, and activity-resonance traces without exposing raw private bodies.

§M5'.6 — **Open contradictions.** [[alpha_quaternionic_integration_across_M_stack]] primarily assigns the `+1` of `137 = 64 + 72 + 1` to [[M1]] [[Paramaśiva]], while one residual corridor passage names [[M0]]'s witness-axis as the `+1`; M5' records this as an unresolved source contradiction rather than harmonising it silently. The Tauri-vs-Theia editor-workbench question (previously open per [[m5-prime-agentic-ide-research]]) is now **resolved**: [[Theia]] is THE shell ([[m5-prime-system-shape-and-tauri-ide-canon]] §2-§3); [[Tauri]] is migration source not runtime destination; existing [[Body/M/epi-tauri]] components port into Theia extensions per the canon §8 Milestone 1 redistribution plan.

## User-Facing Surface

- **Primary surface: conversational agent.** [[Epii]] (or [[Anima]] / [[Aletheia]] / [[Pi]] / [[Logos Atelier]] specialist per task) is the entry point. The agent is the IDE; the panes are summonable working contexts.
- **One-shell two-layout rhythm.** The single [[Theia]] shell at [[/pratibimba/system]] carries the 0/1 daily layout (lightweight workspace mode) and the deep IDE layout (full 4+2 workspace mode); switching is via omni panel inside one process, no second app, no cross-process IPC. The kernel-bridge subscription state, selected coordinate, session, and profile generation all persist across layout switches automatically.
- **Library / canon / code / graph / agent-evidence / [[Logos Atelier]] panes** are split-pane working contexts that the agent opens as conversation requires. Multi-pane simultaneous display is available for explicit working sessions.
- **M-extension workbench.** Six individual M extensions plus the integrated 1-2-3 cosmic-engine plugin and 4/5/0 user-experience plugin are compositional [[Theia]] contributions, while [[M0]]/[[M5]] chrome supplies [[Bimba]] graph, Canon Studio, Agentic Control Room, coordinate tree, and [[Logos Atelier]].
- **Review inbox** shows deposits from [[Nara]], [[Anima]]/[[Aletheia]], [[Graphiti]], tests, and implementation runs — surfaced when the user enters review mode or when a notification needs attention; not always-on dashboard. Backed by [[Body/S/S5/epii-review-core]] / [[Body/S/S5/epii-autoresearch-core]].
- **Evidence panel** links coordinate, profile, pointer law, DAY/NOW/session, source/spec/code/test anchors, and readiness state — summoned for specific operational outputs (review-evidence, deposit envelope, audit-trail completion check).
- **Pedagogy and archaeology surfaces** use the diatonic CF/[[VAK]] projection as teaching/routing grammar; the 6-fold-of-layers (Gebser + Name/Power + L-lenses + CFs + Spanda + 84-fold-landscape) is exposable when the user engages with teaching, not as default display.
- **Safe fork/worktree/task affordances** for implementation work surface within the Agentic Control Room when an agent-run is initiated.

## Backend Contract Consumed

- [[S1]] / vault/file contracts for editable philosophy, spec, library, and source artifacts — **direct-filesystem-read** from Theia via its FS provider against [[/Idea]]; **writes-through-Hen** via `s1'.vault.*` gateway methods so [[Body/S/S1/hen-compiler-core/src/wikilinks.rs]] + the broader hen-compiler-core write surface protect wikilink integrity, path soundness, and rename-safety. Vault file watcher feeds S2 ingestion. Hen-compiler mutation layer at [[Body/S/S1/hen-compiler-core]] + [[Body/S/S1/hen-compiler]] gates non-dry-run canon promotion. Semantic neighbours via `s1'.semantic.*` reading [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] (`suggest_link_candidates(LinkCandidateRequest) → LinkCandidateResponse`) over `<vault>/.smart-env/multi/*.ajson` — Smart Connections is the canonical vault semantic-index substrate (the user's existing Obsidian app produces local BGE-micro-v2 embeddings; Theia and Obsidian coexist via shared vault filesystem; no Obsidian-runtime IPC).
- [[S2]] graph law and namespace-aware graph access for `bimba`, `gnosis`, `etymology`, and reviewed `pratibimba` projections — backed by [[Body/S/S2/graph-schema]] + [[Body/S/S2/graph-services]] (live schema authority + dataset_import + seed + retrieval/{graphrag,hybrid,coordinate} + doctor + ontology + GDS).
- [[S3]] gateway/session records, [[SpaceTimeDB]] `world_clock`, `pratibimba_presence`, shared archetype/coincidence signatures, [[Graphiti]]/[[Nara]] episodes, [[DAY/NOW]] deposition handles, and live run/event lineage — backed by [[Body/S/S3/gateway]] + [[Body/S/S3/gateway-contract]] (1,825 LOC contract authority) + [[Body/S/S3/epi-spacetime-module]] + [[Body/S/S3/graphiti-runtime]] + [[Body/S/S3/redis-context]].
- [[S4]] / [[S5]] bounded agent access, agent-run evidence, review inbox state, and autoresearch observation streams — agent governance at [[Body/S/S4/plugins/pleroma/capability-matrix.json]] (canonical authority per IOD-17, three-way parity test-locked with [[Body/S/S4/pi-agent/agents/anima.md]] and runtime); ta-onta extensions at [[Body/S/S4/ta-onta]] (aletheia, anima, chronos, hen, khora, pleroma + S4-Np-* coordinate folders + spine + shared).
- [[S5']] live `s5'.review.*`, `s5'.improve.*`, and `s5'.epii.*` gateway routes for deposits, transitions, dry-run promotion, and Epii agent access — backed by [[Body/S/S5/epii-autoresearch-core]] + [[Body/S/S5/epii-review-core]] + [[Body/S/S5/epii-agent-core]] + [[Body/S/S5/epii-agent]] (carries `agent-contract.json` + `contract-ledger`).
- [[M5-0']] Library / Gnostic Namespace substrate: **[[Body/S/S5/epi-gnostic]] IS the RAG-anything system** (production Python + Graphiti-integrated package; not a future composition target). Plus [[Body/S/S5/epi-kbase]] + [[Body/S/S5/epi-kbase-core]] for kbase corpus. Smart Connections vault semantic-input via `s1'.semantic.*` feeds candidate links + neighbours into the gnostic pipeline. Reached by agents through `s5'.gnostic.*` gateway methods consuming this substrate plus the `gnosis` graph namespace.
- **S' kernel** profile for harmonic clock evidence: [[Body/S/S0/epi-lib]] (12,160 LOC C kernel — m0.c through m5.c, m3_clock_lut.c, pointer_web.c, arena.c, families.c, kernel.c, engine.c, psychoid_numbers.c) + [[Body/S/S0/portal-core]] (~4,500 LOC Rust mirror — kernel.rs, mahamaya.rs, parashakti/vimarsha_reading.rs, nara_journal.rs, personal_identity.rs, codon_rotation_projection.rs, events.rs).
- The M5' kernel-bridge extension exposes these contracts to [[Theia]] as typed frontend capabilities rather than ad hoc UI calls; its backend module connects to the external [[Body/S/S3/gateway]] process via WebSocket/JSON-RPC, keeping Rust + C substrate untouched.

The review and improvement contract follows [[S5-SPEC]]: human-required items may be deferred by agents but not approved, rejected, or revised by agents, and non-dry-run canon promotion remains blocked until compiler mutation law is wired.

## Required `MathemeHarmonicProfile` Fields

- `tick`, `harmonic`, `diatonic`, `resonance72`, `elements`, `planetaryChakral`, and `mahamaya` fields when reviewing M2/M3 claims.
- `pointerAnchor`: coordinate, relation descriptors, qvdata/source/spec/code/test anchors, graph-law provenance.
- `depositionAnchor`: DAY/NOW/session, episode handle, privacy class, source file/test/spec anchors.
- Readiness flags for missing backend contract, pending dataset LUT, provisional evolutionary gap, and private projection block.

## Privacy Boundary

[[M5']] can inspect protected evidence only inside governed review capability — governance bound by [[Body/S/S4/plugins/pleroma/capability-matrix.json]]. Public [[Epii]] surfaces may show evidence handles, summaries, and promotion decisions, but not private journal bodies or unreconciled [[Graphiti]] text. Promotion requires explicit review state and source lineage.

[[Nara]] remains the personal-episodic identity stream. [[Epii]] remains the impersonal-archeological and system-governance workbench. Etymological constellations may resonate with [[Nara]] through identity hash previews, elemental/profile handles, coordinate tags, [[Graphiti]] episode ids, and review records; they must not treat personal narrative as canonical graph fact.

## Visual / Audio Interaction Model

- Visual: evidence matrix, review queue, and coordinate trace should make profile provenance inspectable: what came from S0, S2, S3, [[Graphiti]], tests, or spec.
- Audio: optional profile playback can teach or compare harmonic states, but review decisions are made from typed evidence, tests, and graph law.
- Interaction: [[VAK]] execution collects CPF, CT, CP, CF, CFP, CS; routes through [[Anima]]/[[Aletheia]]; and deposits outputs to [[Epii]] inbox with completion evidence — capability matrix at [[Body/S/S4/plugins/pleroma/capability-matrix.json]] governs which agent can do what.
- IDE: [[Theia]] workbench activity must make agent runs inspectable: task prompt, selected vault/repo/graph/artifact URIs, fork/worktree basis when present, tool stream, changed artifacts, kernel-bridge state, tests, review decision, and promotion target.

## Relationship To Portal 0/1 And The 4+2 Layer

The full [[M5']] IDE belongs to the deep 4+2 subsystem layer. It should not be compressed into the daily shell. Shell `1` may preview [[Epii]] through immediate affordances such as agent entry, [[Bimba]] resonance, review alerts, and recent [[Logos Atelier|Atelier]]/library items, but the complete [[M5']] workbench is the full subsystem page.

Shell `0` previews the integrated structural instrument from [[M1']] through [[M3']] — the [[Hopf]] / [[Spanda]] / [[Klein]] / [[Möbius]] mathematics made playable. Shell `1` previews the integrated lived/world return from [[M4']] through [[M5']] with a renewed [[M0']] ground doorway. The 4+2 subsystem pages deliver the depth: [[M0']] through [[M3']] for structural/instrument work, [[M4']] for [[Nara]], and [[M5']] for the [[Epii]] IDE.

The one-shell law is therefore explicit: the 0/1 daily layout and the deep IDE layout both live inside one [[Theia]] shell at [[/pratibimba/system]] and share one kernel-bridge. The omni panel switches layouts inside one process; there is no second app. The deep IDE layout remains the deep subsystem surface for canon, graph, code, agents, review, and Logos-cycle work.

The M5' IDE shell integrates [[M0]] and [[M5]] as chrome: [[Bimba]] graph viewer, Canon Studio, Agentic Control Room, coordinate tree, and [[Logos Atelier]]. The individual M0-M5 extensions disclose the six positions, the integrated 1-2-3 plugin discloses the cosmic-engine substrate, and the integrated 4/5/0 plugin renders the [[Jiva-is-Śiva]] recognition path between [[Nara]]'s protected field and [[Epii]]'s canon-review surface.

## Canon Recognition: 137 And [[Jiva-is-Śiva]]

[[M5']] is where the system can review and teach the fact that its [[M-stack]] embodies `137 = 64 + 72 + 1` as an integer-psychoid skeleton: [[M3]] carries the 64-fold [[Mahāmāyā]] binary matrix (via [[Body/S/S0/epi-lib/include/m3.h]] / [[Body/S/S0/portal-core/src/mahamaya.rs]]), [[M2]] carries the 72-fold [[Paraśakti]] bridge (via [[Body/S/S0/epi-lib/include/m2.h]] / [[Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs]]), and [[M1]] carries the +1 [[Paramaśiva]] toroidal parent (via [[Body/S/S0/epi-lib/include/m1.h]] / [[Body/S/S0/portal-core/src/hopf.rs]]). This is not a runtime superstition and not a claim that the physical constant is reduced to system numerology. It is a reviewable pedagogical-philosophical fact in the canon, with the [[Pauli-Jung]] psychoid speculation finding operational form in the architecture.

The contemplative punchline of the 4+2 depth surface is **[[Jiva-is-Śiva]] made computationally concrete**: the protected personal field at [[M4-4-4-4]] (persisted at [[Body/S/S0/portal-core/src/personal_identity.rs]]) can be read against the same [[M1]]/[[M2]]/[[M3]] substrate that the system uses for graph, sound, clock, and symbolic transcription. They share the same [[Cl(4,2)]] [[Quaternal|quaternionic]] algebra at different scales: personal-quaternion, codon-quaternion-in-charge-space, ring-quaternion. [[M5']] reviews that recognition carefully, with source anchors and tests, so synthesis opens further work rather than closing into doctrine.

The concrete visual law comes from [[m4-prime-psychoid-cymatic-field-engine]] §18.11: foreground personal [[Pratibimba]] field, background canonical [[Bimba]] map/city, visible [[BEDROCK]] link, and activity-resonance traces. The numerical skeleton comes from [[alpha_quaternionic_integration_across_M_stack]], with the unresolved [[M0]]/[[M1]] `+1` wording retained as an open canon question in §M5'.6. The [[Möbius]]-return from [[M5]] back to [[M0]] is the canon's self-cleaning loop.

## Readiness / Test Criteria

- Tests prove the review inbox reads real gateway/session/task deposits through live `s5'.review.*` routes and applies review transitions against durable S5 state.
- Tests prove `s5'.improve.*` autoresearch records can surface, route, orchestrate, and dry-run promotion through real review records, with non-dry-run promotion blocked until compiler mutation law is wired.
- Tests prove human-required review items can be deferred by agents but cannot be approved, rejected, revised, or promoted by agents.
- Tests prove VAK execution invokes bounded agent capability with diagnostics, completion evidence, selected artifact references, and S5 review deposition.
- Tests prove the Theia kernel-bridge extension consumes real S0/S3/S5 contracts: harmonic profile, SpaceTimeDB `world_clock` and presence subscriptions, gateway RPC, connection-state recovery, and observability events.
- Tests prove `/body` can summon `/pratibimba/system` inside one Tauri app without losing kernel-bridge identity, session state, or pending review notifications.
- Tests prove the six M extensions and the integrated 1-2-3 and 4/5/0 plugins contribute composable Theia surfaces without bypassing namespace, privacy, or review gates.
- Tests prove Epii does not treat Graphiti memory as canonical S2 topology.
- Tests prove graph queries preserve namespace boundaries across `bimba`, `gnosis`, `etymology`, and protected reviewed projections.
- Tests prove IDE-style agent runs preserve file/source/graph/task provenance and can be reviewed before promotion.
- Tests prove each operational capacity has at least one real end-to-end readiness path into S5 review/autoresearch state: Anuttara grammar construction, Paramaśiva CPT/RAG support, Paraśakti graph-relational evidence, Mahāmāyā process-reward/runtime evidence, Nara Anima-primary dialogic governance, and Epii-on-Epii recursive user-final-validation.
- Tests prove profile evidence distinguishes backend missing, private blocked, pending LUT, provisional gap, and ready states.
- Tests prove canon-review surfaces can trace `137 = 64 + 72 + 1` claims back to M1/M2/M3 spec anchors and do not promote Pauli-Jung interpretive overlays as separate coordinates.
- Tests prove Jiva-is-Śiva recognition claims include privacy boundary, M4 protected-field source, BEDROCK link, activity-resonance traces, and S2/S3 evidence handles before promotion into canon.
- Readiness is blocked for full M2/M3 review until the kernel profile tranche exposes resonance72, planetaryChakral, mahamaya, pointerAnchor, and depositionAnchor.

## Canonical Source Lock - 2026-06-02

M5' is Epii return/integration and agent-led developer/pedagogical IDE. It reviews, teaches, improves, and promotes; it does not bypass S5' review law or S1' residency law.

| Required coverage | Canonical citations |
|---|---|
| docs/specs | `docs/specs/M/M5-epii-holographic-integration.md` mtime 2026-03-05 14:45:32; `docs/specs/M/2026-03-13-epi-logos-ux-arc-spec.md` mtime 2026-04-04 13:46:16; `docs/specs/M/2026-03-11-epi-flow-design.md` mtime 2026-03-11 12:12:01 |
| docs/plans | `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md` mtime 2026-05-31 20:56:45; `05-tauri-ide-shell-and-pratibimba-system.md` mtime 2026-06-01 18:28:40; `07-m-extension-individual-tracks.md` mtime 2026-06-01 00:23:25 (`07-T8`); `08-integrated-plugin-tracks.md` mtime 2026-06-01 00:25:11; `09-agentic-mediation-and-operational-capacities.md` mtime 2026-06-02 00:16:51; `10-cross-cutting-integration-and-milestones.md` mtime 2026-06-02 00:17:57 |
| Body substrate | `Body/S/S1/hen-compiler-core/**`, `Body/S/S2/graph-services/**`, `Body/S/S3/gateway-contract/**`, `Body/S/S4/plugins/pleroma/capability-matrix.json`, `Body/S/S5/epii-agent-core/**`, `Body/S/S5/epii-review-core/**`, `Body/S/S5/epii-autoresearch-core/**`, `Body/S/S5/epi-gnostic/**`, `Body/S/S5/plugins/epi-logos/**`; `Body/M/epi-tauri/**` only as deprecated migration-source evidence |
| Idea/Theia substrate | `Idea/Pratibimba/System/extensions/m5-epii/**`, `agentic-control-room/**`, `omnipanel-shell/**`, `m-extension-runtime/**`, `kernel-bridge/**`, `plugin-integrated-4-5-0/**` |
| sibling seeds | `M'-SYSTEM-SPEC.md`, `M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, `m5-prime-agentic-ide-research.md`, `m5-prime-autoresearch-self-improvement-loop.md`, `M5'/epii-operational-capacities/*.md`, `alpha_quaternionic_integration_across_M_stack.md` |
| nominal tracks | Track 04 S5 review/autoresearch; Track 05.T4/T4.5/T8/T9 shell/control room; Track 07.T8 M5' extension; Track 08.T6/T9 integrated plugin; Track 09.T8/T9/T10 operational capacities; Track 10 gates |
| open decisions | review source identity, recursive validation, non-dry-run promotion, control-room ownership, VAK UI, Epii-on-Epii governance, typed M' API |

World coordinate note: M5' consumes World `P5/P5'`, `L5/L5'`, `Thought.md`, and `Seed.md` through the S/S' and M' umbrella specs; no M-specific World coordinate markdown exists yet.
