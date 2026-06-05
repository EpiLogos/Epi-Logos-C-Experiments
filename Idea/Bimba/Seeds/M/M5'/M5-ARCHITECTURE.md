---
title: "M5' Epii Architecture — Total Shape of the Agentic-Pedagogical IDE (Library · Canon · Backend · Shell · Pi-runtime · Logos Atelier)"
coordinate: "M5 / M5'"
status: "canonical-architecture-spec"
created: 2026-06-02
authority_relation: "Domain authority for the M5' Epii surface. [[M5'-SPEC]] cross-references this document. Where they disagree on M5' sub-coordinate shape, this document is authoritative; M5'-SPEC remains authoritative for review/improve law and §M5'.x canon deltas."
depends_on:
  - "[[M5'-SPEC]]"
  - "[[m5-prime-system-shape-and-tauri-ide-canon]]"
  - "[[m5-prime-autoresearch-self-improvement-loop]]"
  - "[[m5-prime-agentic-ide-research]]"
  - "[[frontier-confirmations-and-refinements]]"
  - "[[S5-SPEC]]"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m5-reconciliation-matrix.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-agentic-layer-matrix.md"
decisions_carried:
  - "DR-M5-1 RATIFIED (cleanup 2026-06-03 + DR-S4-TECHNE reframe): Pi is the agent harness (singular); Anima is main dispatcher; SIX Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each guarding specific techne classes within Pleroma-Techne per DR-S4-TECHNE) are Anima-dispatched specialists DURING the Aletheia-crystallisation-mode; six ta-onta carriers (Khora=S4-0' / Hen=S4-1' / Pleroma=S4-2' / Chronos=S4-3' / Anima-carrier=S4-4' / Aletheia-carrier=S4-5') are system/service routing infrastructure (NOT agents). Pleroma (S4-2') has TWO faces: VAK capability membrane + Techne atomic-skills repository — Techne is the skills substrate the 6 guardians steward, NOT a 7th agent (S4 canon roster mis-classification corrected). Per S4 canon: Aletheia is a MODE of Sophia/Psyche/Anima — not a peer agent. Aletheia-the-carrier hosts the mode; Anima dispatches within it. The 'ACR / constitutional-agents quartet' framing is repurposed as Pi-runtime monitoring in the OmniPanel."
  - "DR-B-2 RATIFIED: Pi carries axiom-translation tooling (philosophical-English ↔ formal-notation ↔ OWL ↔ SHACL); lands at Body/S/S4/pi-agent/lib/axiom-translate.ts (referenced by Backend Studio + Canon Studio)."
  - "DR-B-3 RATIFIED (cleanup 2026-06-03 + DR-S4-TECHNE reframe): The 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each guarding specific techne classes within Pleroma-Techne per DR-S4-TECHNE) are Aletheia-internal (CONTRACT inv 1-2) — invoked by Anima DURING the Aletheia-crystallisation-mode; ACR-substrate (now OmniPanel-runtime) does NOT surface them as peer AgenticActors — they surface as Anima-dispatch sub-traces under Aletheia. FOUR registers stay distinct: (1) Aletheia-the-carrier (S4-5' extension class hosting the mode), (2) Aletheia-the-mode (crystallisation mode of Sophia/Psyche/Anima), (3) 6 Aletheia subagent techne-guardians (dispatched within the mode, each stewarding specific techne classes), (4) Pleroma-Techne (the atomic-skills substrate the guardians steward; Pleroma's second face alongside VAK)."
related_tranches:
  - "06.1 — Register s5'.gnostic.{ingest, query, notebook, status} over production epi-gnostic"
  - "06.2 — Author logos-atelier Theia extension"
  - "06.3 — Six operational-capacity views over capacity_workflows.rs"
  - "06.4 — Canon Studio + Backend Studio extensions"
  - "06.5 — Decision-register entries (DR-M5-1, DR-M5-2)"
  - "06.6 — anuttara_trace cross-domain referral"
  - "12.1 — ACR-actor parity audit; reframe as OmniPanel Pi-runtime"
  - "12.2 — s5'.gnostic.* gateway registration (mirrors 06.1)"
  - "12.5 — Six capacity panes in OmniPanel/agentic-control-room"
  - "12.6 — MediatedRunEvidencePacket field-parity closure"
  - "15.x — UI Foundations adherence (OmniPanel agentic membrane)"
---

# M5' Epii Architecture

## 0. Frame

**M5' is Epii / Anuttara-return — the AI-agent-led developer and pedagogical IDE of Epi-Logos.** Position #5 (Integration / Pratibimba / Möbius return) of the M-family. The Epii IDE is **not six unrelated apps**; it is **one Theia shell at `/pratibimba/system` (now `Body/M/epi-theia/`)** carrying one kernel-bridge contract, one autoresearch spine, and **six summonable surfaces** the conversational agent (Anima → Aletheia/Pi/Sophia/specialists) opens on demand:

| # | Sub-coordinate | Surface | Register |
|---|---|---|---|
| M5-0' | Gnostic Library | The `bimba ↔ gnosis` substrate as ontology-the-system-embodies (synchronic) | What holds |
| M5-1' | Canon Studio | Philosophy / canon edit + QL/bimba decoration + Smart Connections wikilink autocomplete (diachronic) | What developed |
| M5-2' | Backend Studio | The S-family stack made inspectable + agent-editable via LSP + governed tasks/tests/evidence (`siva-`) | Construction |
| M5-3' | IDE Shell + Playable Bimba | The single Theia shell itself (0/1 daily + 4+2 deep); the playable bimba in dev/engagement modes (`-shakti`) | Engagement |
| M5-4' | Pi-runtime monitoring (OmniPanel) | Pi/Anima/Aletheia/Sophia dispatch monitoring, six operational-capacity lanes, review/evidence/gateway/diagnostics — the `/` operator made into an agentic membrane (`siva-shakti`) | The unity |
| M5-5' | Logos Atelier | Scent-following etymology: root → cognate → drift → psychoid charge → pros-hen → Möbius write-back over the `etymology` graph namespace | Möbius reactivation |

The Epii IDE's central claim — substantiated against `Body/S/S5/{epi-gnostic, epii-autoresearch-core, epii-review-core, epii-agent-core, epii-agent}`, `Body/S/S4/{ta-onta, pi-agent, plugins/pleroma}`, and the live `Body/S/S3/gateway-contract/src/lib.rs:209-225` method registry — is that **the agentic-pedagogical IDE is not a thing to be built; it is the integration view of the things already landed**, plus a small set of named gateway registrations and Theia extensions that bridge them. This document is the total shape of that integration.

This is the **return pole** of the 4/5/0 seam (Nara / Epii / Anuttara) realised as a working IDE — the paidagōgos who conducts the user to the teacher (bimba map + corpus + canon + lived traversal). It is not a chatbot that explains; it is a companion that situates and surfaces. The conversational-agent-first UX axiom from `epii-ux-full-m5-branch.md §1` is honored at every section.

---

## 1. The Six Sub-Coordinates Table (bimba ↔ techne)

The matheme spine across the M5' branch: **M5-0/M5-5 are the framing pair (ground / synthesis, the implicate poles); M5-1 through M5-4 are the inner-four dynamics** (the `4+2` written into the branch layout — `epii-ux-full-m5-branch.md §2`).

| Sub-coord | bimba register | techne register (live substrate) | Owning Theia surface |
|---|---|---|---|
| **M5-0'** | Gnostic library / ontology embodied; the RAG context that grounds every agent invocation | `Body/S/S5/epi-gnostic/epi_gnostic/{cli.py, graphiti_service.py, wrapper.py, enrichment/, storage/, config.py}` (production Python; 926 LOC core); `Body/S/S5/epi-kbase/src/` + `epi-kbase-core/`; `Body/S/S2/graph-services/src/retrieval/{graphrag.rs, hybrid.rs, coordinate.rs}` for bimba topology; `Body/S/S1/hen-compiler-core/src/smart_env.rs` `suggest_link_candidates` for vault semantic input | NEW `library-surface` view inside `m5-epii` extension (or new `library-pane` extension) reading `s5'.gnostic.*` |
| **M5-1'** | Philosophy / Canon Studio; historical-archetypal reading; the locus of axiom-proposals before they reach M5-2 | `Body/S/S1/hen-compiler-core/src/wikilinks.rs` (vault write surface) + `smart_env.rs` (semantic neighbours); `s1'.vault.*` + `s1'.semantic.*` gateway routes (cross-Wave dep) | NEW `canon-studio` Theia extension (Tranche 06.4) — markdown editor + QL/bimba decoration contribution + Smart Connections autocomplete |
| **M5-2'** | Backend Studio (`siva-`); the S-family stack made inspectable + agent-editable; construction-not-training discipline | `Body/S/S0/epi-lib/` (12,160 LOC C: m0.c–m5.c, kernel.c, engine.c, pointer_web.c, arena.c, families.c, psychoid_numbers.c, m3_clock_lut.c); `Body/S/S0/portal-core/` (~4,500 LOC Rust); S1 hen-compiler; S2 graph-services + graph-schema; S3 gateway + gateway-contract + epi-spacetime-module + graphiti-runtime + redis-context; S4 ta-onta + plugins/pleroma + pi-agent; S5 cores (epii-autoresearch-core 2049 LOC `lib.rs`, epii-review-core, epii-agent-core, epi-gnostic, epi-kbase) | NEW `backend-studio` Theia extension (Tranche 06.4) — LSP contributions: `rust-analyzer`, `clangd`, `pylsp`; coordinate-tagged file tree; provenance-inlined source view |
| **M5-3'** | Frontend Studio / IDE Shell (`-shakti`); the Theia shell itself (one process, two layout modes: `daily-0-1` and `ide-deep`); the playable bimba in dev/engagement render-modes | `Body/M/epi-theia/extensions/{ide-shell-m0-m5, pratibimba-layouts, omnipanel-shell, kernel-bridge, kernel-bridge-readiness, m-extension-runtime, body-lite-surface, contracts, integrated-composition, m0-anuttara, m1-paramasiva, m1-paramasiva-played-torus, m2-parashakti, m3-mahamaya, m4-nara, m5-epii, agentic-control-room, plugin-integrated-1-2-3, plugin-integrated-4-5-0, acceptance-harness}` — all landed; m1-paramasiva-played-torus is DR-M1-2-ratified-build-pending | EXISTING `ide-shell-m0-m5` + `pratibimba-layouts` + `kernel-bridge`; playable bimba 2D/3D rendering owned by M0' `m0-anuttara` + M1-2 `m1-paramasiva-played-torus` (consume-from-M0/M1 contract, see §7) |
| **M5-4'** | OmniPanel = Pi-runtime monitoring + agentic membrane; the repurposed ACR substrate; six operational-capacity governance lanes; review / evidence / gateway / diagnostics | `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs` (2584 LOC — the six-capacity registry + slice runners); `epii-autoresearch-core/src/spine.rs` (651 LOC); `inbox.rs` (381); `recompose.rs` (90 — Möbius pass); `Body/S/S5/epii-agent/agent-contract.json` (11 gateway methods, lines 14-26); `Body/S/S3/gateway-contract/src/lib.rs:209-225` registers `s5'.{improve.*, epii.*, review.*}`; `Body/S/S4/plugins/pleroma/capability-matrix.json` `m5_4_governance.review_surface_roles` (lines 486+); ta-onta carriers under `Body/S/S4/ta-onta/{khora, hen, pleroma, chronos, anima, aletheia}/` | EXISTING `agentic-control-room` extension (`run-model.ts`, `acr-runtime-service.ts`, `parity.ts`, `run-flow-widget.tsx`) repurposed into `omnipanel-shell` per Tranche 15.2 (the load-bearing UI-foundation reframe) |
| **M5-5'** | Logos Atelier; etymological-archaeological intelligence; scent-following over the `etymology` graph namespace; Möbius write-back (the 5→0 seam expressed as method) | `Body/S/S4/ta-onta/aletheia/{extension.ts, modules/{sophia-ingest, moirai-rehear, janus-doorway, anansi-lineage, chronos-integration, gate-trigger}.ts, S5'/agents/{anansi, moirai, janus, mercurius, agora, zeithoven, aletheia}.md, S5'/janus-envelope.schema.json}`; Aletheia tools `aletheia_gnosis_{ingest, query, notebook_create}` + `aletheia_thought_route` + `aletheia_crystallise` + `aletheia_seed_refresh` (`S4-5p-aletheia/CONTRACT.md:52-62`); consumes `etymology` namespace inside `epi-gnostic` graph layer | NEW `logos-atelier` Theia extension (Tranche 06.2) — scent-following workspace consuming Aletheia tools via `s5'.gnostic.*` (Tranche 06.1) + `s4'.mediation.route` |

**Two surfaces that ARE the IDE chrome (consumed across all six sub-coordinates):**
- **Left activity-bar:** Coordinate Tree · Bimba Graph Viewer · Canon Studio · Backend Studio (`ide-deep` only) · Smart Connections (`ide-deep` only). Activity-bar-switched per `15-ui-design-foundations.md §Surface Contracts`.
- **Right OmniPanel:** Pi Chat · Sessions · Dispatch Trace · Tool Stream · Evidence · Review · Gateway · Diagnostics (`15-ui-design-foundations.md §OmniPanel`). Persistent across all layouts. The `/` operator as UI membrane.

These are not seventh and eighth sub-coordinates — they are the chrome through which M5-0' through M5-5' surface.

---

## 2. Substrate Map

### 2.1 M5-0' Gnostic Library substrate

**Production RAG-anything pipeline** (the "epi-gnostic IS the RAG-anything system" claim per `M5'-SPEC §"Sixfold IDE Surface" row M5-0'`):

| Asset | Location | Role |
|---|---|---|
| `epi-gnostic` Python package | `Body/S/S5/epi-gnostic/epi_gnostic/` | Production RAG; LightRAG/RAG-Anything wrapper + Graphiti integration |
| `epi_gnostic/cli.py` (137 LOC) | `Body/S/S5/epi-gnostic/epi_gnostic/cli.py` | CLI entry — `epi techne gnosis {ingest, query, notebook, status}` |
| `epi_gnostic/graphiti_service.py` (534 LOC) | `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` | Graphiti+Neo4j integration; 3072-dim embedding pipeline; Gnosis namespace separate from Bimba |
| `epi_gnostic/wrapper.py` (155 LOC) | `Body/S/S5/epi-gnostic/epi_gnostic/wrapper.py` | RAG-Anything/LightRAG adapter |
| `epi_gnostic/enrichment/` | `Body/S/S5/epi-gnostic/epi_gnostic/enrichment/` | `_create_gnostic_node` / `_delete_gnostic_node`; cross-namespace `RELATES_TO_COORDINATE` edges |
| `epi_gnostic/storage/` | `Body/S/S5/epi-gnostic/epi_gnostic/storage/` | HOT/WARM/COLD retrieval tiers (Redis semantic cache + Neo4j + vector) |
| `epi_gnostic/config.py` (54) + `graphiti_config.py` (44) | same | `GEMINI_EMBED_DIMS=3072` is the canonical embedding-dim choice (per Aletheia CONTRACT §"Gnosis RAG Pipeline") |
| `Dockerfile.graphiti` + `uv.lock` | `Body/S/S5/epi-gnostic/` | Containerised graphiti runtime |
| `cypher/` queries + `tests/test_enrichment.py` | `Body/S/S5/epi-gnostic/` | Coordinate-tagging assertions; cross-namespace edge tests |
| `epi-kbase-core` | `Body/S/S5/epi-kbase-core/src/lib.rs` | Rust core for kbase corpus |
| `epi-kbase` | `Body/S/S5/epi-kbase/{CONTRACT.md, src/, package.json}` | TS-side kbase: `bindKbaseProject`, `kbaseSearch`, `skillSearch`, `hasHighRelevanceMatch`; depends on `bkmr` CLI |
| `graph-services retrieval` | `Body/S/S2/graph-services/src/retrieval/{graphrag.rs, hybrid.rs, coordinate.rs}` | Bimba-topology retrieval — the namespace-aware backbone |
| `smart_env.rs` | `Body/S/S1/hen-compiler-core/src/smart_env.rs` | `suggest_link_candidates(LinkCandidateRequest) → LinkCandidateResponse` over `<vault>/.smart-env/multi/*.ajson` — Smart Connections semantic input |

**Patterns landed:** 3072-dim unified embedding space across Bimba+Gnosis; `RELATES_TO_COORDINATE` cross-namespace edges; coordinate-tagged chunks (`bimba_coordinate` direct, `bimba_resonances` LLM-classified per `epii-ux-full-m5-branch.md §9`).

**The single load-bearing gateway gap:** `Body/S/S3/gateway-contract/src/lib.rs:209-225` registers `s5'.{improve.*, epii.*, review.*}` (eleven methods) but **`s5'.gnostic.*` is NOT registered** — verified by `grep -n "s5'\.gnostic" Body/S/S3/gateway-contract/src/lib.rs` returns zero hits. Tranche 06.1 is the unblock.

### 2.2 M5-1' Canon Studio substrate

| Asset | Location | Role |
|---|---|---|
| `hen-compiler-core/src/wikilinks.rs` | `Body/S/S1/hen-compiler-core/src/wikilinks.rs` | Vault wikilink integrity on rename/move/restructure |
| `hen-compiler-core/src/smart_env.rs` | `Body/S/S1/hen-compiler-core/src/smart_env.rs` | Smart Connections semantic-neighbour input |
| `hen-compiler-core/src/` (broader write surface) | `Body/S/S1/hen-compiler-core/` | Vault write contract (path soundness, rename-safety) |
| `Body/S/S4/ta-onta/hen/{extension.ts, modules/, S1/, S1'/}` | same | Hen carrier (S4 side) — the S4↔S1' seam |
| `s1'.vault.*` + `s1'.semantic.*` gateway methods | (cross-Wave dep) | Vault writes route through Hen; reads filesystem-direct via Theia FS provider |

**Canonical source of canon edits:** the Idea vault filesystem (e.g. `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`). The Hen-compiler-core IS the canonical canon-mutation surface. Smart Connections IS the canonical vault-semantic-index substrate (the user's own Obsidian app produces local BGE-micro-v2 embeddings; Theia and Obsidian coexist via shared filesystem; **no Obsidian-runtime IPC** — `M5'-SPEC §"Backend Contract Consumed" §S1`).

### 2.3 M5-2' Backend Studio substrate

The **complete S-family stack** is the substrate; M5-2 surfaces it. Citations to load-bearing modules:

| Layer | Code |
|---|---|
| S0 C kernel (12,160 LOC) | `Body/S/S0/epi-lib/{include, src}/{m0..m5}.{h,c}`, `kernel.c`, `engine.c`, `pointer_web.c`, `arena.c`, `families.c`, `psychoid_numbers.c`, `m3_clock_lut.c` |
| S0 Rust mirror (~4,500 LOC) | `Body/S/S0/portal-core/src/{kernel.rs, mahamaya.rs, parashakti/vimarsha_reading.rs, nara_journal.rs, personal_identity.rs, codon_rotation_projection.rs, events.rs, hopf.rs, spanda.rs, quaternion.rs}` |
| S0 CLI | `Body/S/S0/epi-cli/` |
| S1 mutation | `Body/S/S1/{hen-compiler-core, hen-compiler}` |
| S2 graph | `Body/S/S2/{graph-schema, graph-services}` (live schema authority + dataset_import + seed + retrieval + doctor + ontology + GDS) |
| S3 gateway | `Body/S/S3/{gateway, gateway-contract (1,825 LOC), epi-spacetime-module, graphiti-runtime, redis-context}` |
| S4 agents/carriers | `Body/S/S4/{pi-agent, ta-onta, plugins/pleroma}` |
| S5 review/autoresearch | `Body/S/S5/{epii-autoresearch-core (2049 LOC lib.rs + 2584 LOC capacity_workflows.rs + 651 LOC spine.rs), epii-review-core, epii-agent-core, epii-agent}` |
| S5 library | `Body/S/S5/{epi-gnostic, epi-kbase, epi-kbase-core}` |

**Anuttara grammatical-tracing API claim** (`anuttara_trace(output, sensitivity, depth)`, `epii-ux-full-m5-branch.md §2.3`): currently has no canonical gateway-method route and no implementing carrier. Per Wave-A M5 Anomaly `O-M5-1`, this is M0-substrate-owner territory (referred to Wave-A-M0 / Wave-B agentic-layer for adjudication; M5 records as a contemplative-offering claim, never as a pass/fail verdict).

### 2.4 M5-3' Theia shell substrate

| Asset | Location |
|---|---|
| Shell home | `Body/M/epi-theia/` (one Theia shell at `/pratibimba/system`, one process) |
| Layout extension | `Body/M/epi-theia/extensions/pratibimba-layouts/` (0/1 daily + ide-deep layout-restorer) |
| IDE chrome | `Body/M/epi-theia/extensions/ide-shell-m0-m5/` (M0+M5 integrated chrome: bimba graph viewer, canon studio, ACR, coordinate tree, atelier) |
| OmniPanel | `Body/M/epi-theia/extensions/omnipanel-shell/` (will absorb ACR substrate per 15.2) |
| Kernel-bridge | `Body/M/epi-theia/extensions/kernel-bridge/` + `kernel-bridge-readiness/` (first-loaded; profile + gateway + tick contract) |
| M-extension runtime | `Body/M/epi-theia/extensions/m-extension-runtime/` (`MathemeHarmonicProfileBoundary`, `MExtensionReadinessSnapshot`, contract preflight) |
| Six M-extensions | `m0-anuttara`, `m1-paramasiva`, `m1-paramasiva-played-torus`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, `m5-epii` |
| Integrated plugins | `plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`, `integrated-composition` |
| Contracts | `Body/M/epi-theia/extensions/contracts/` (`07-t0-extension-contract-preflight.json` etc) |
| Acceptance harness | `Body/M/epi-theia/extensions/acceptance-harness/` |
| Migration source | `Body/M/epi-tauri/` (60 TSX + 42 Rust files; **deprecated migration-source only**, NOT runtime destination) |

The `m5-epii` extension currently scaffolds only the review-queue + spine-state inspector at `Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts` (523 LOC) — see §2.5.

### 2.5 M5-4' Pi-runtime / OmniPanel substrate

**Spine + review + autoresearch (the most-aligned M5 cluster — Wave-A M5 A-M5-2):**

| Asset | Location | Role |
|---|---|---|
| `epii-autoresearch-core/src/lib.rs` | `Body/S/S5/epii-autoresearch-core/src/lib.rs` (2049 LOC) | `ProposeRequest`, `ImprovementCandidate`, `OrchestrationRecord`, `PromotionPlan`, `ArtifactRef`, `EvidenceSourceRef`, `RouteRecord`, `LoopState`, `ImprovementDecision` |
| `capacity_workflows.rs` | `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs` (2584 LOC) | `CapacityId {Anuttara, Paramasiva, Parashakti, Mahamaya, Nara, EpiiOnEpii}`, `CapacityWorkflowRegistryEntry`, `PratibimbaControlRoomCapacityDto`, six slice runners (`run_anuttara_deterministic_slice` etc.), `AgentAnnotation`, `RecursiveReviewProtocolRecord`, `AletheiaExpertLineageCard`, `EpiiSpineStateInspectorSnapshot`, `RecursiveGateWeakeningReceipt` |
| `inbox.rs` | `Body/S/S5/epii-autoresearch-core/src/inbox.rs` (381) | Review inbox manipulation |
| `spine.rs` | `Body/S/S5/epii-autoresearch-core/src/spine.rs` (651) | `M2PrimeMeaningPacket`, surfacing pipelines, target-subsystem routing |
| `recompose.rs` | `Body/S/S5/epii-autoresearch-core/src/recompose.rs` (90) | Möbius pass |
| `epii-review-core` | `Body/S/S5/epii-review-core/` | `ReviewStore`, `ReviewDecision`, `ReviewInboxItem`, `GateKind`, `GovernanceProfile`, `ReviewProposedAction`, `ReviewResolveRequest`, `ReviewSubmission`, `ReviewStageRecord` |
| `epii-agent-core` | `Body/S/S5/epii-agent-core/` | Agent core for `epii` peer pi_agent |
| `epii-agent` | `Body/S/S5/epii-agent/{agent-contract.json (99 LOC), contract-ledger/}` | Contract: 11 gateway methods (`s5'.epii.{status, deposit, runtime.context}`, `s5'.review.{submit, inbox, resolve, history}`, `s5'.improve.{status, propose, evaluate, promote, history}`); spines `[autoresearch, review_inbox]`; `accepted_deposits_from_anima: [review_item, improvement_request, validation_gate, aletheia_crystallisation]`; inbox path `Idea/Empty/Present/{day-date}/` (HONORED DAY-PATH INVARIANT) |
| `gateway-contract` registry | `Body/S/S3/gateway-contract/src/lib.rs:209-225, 1290-1386` | Eleven `s5'.*` methods registered; **`s5'.gnostic.*` NOT yet** |
| Pi-agent | `Body/S/S4/pi-agent/{composite-entry.ts, lib/, prompts/, extensions/, agents/{anima.md, agent-chain.yaml, teams.yaml}}` | Pi harness (DR-M5-1: singular); dispatch chains |
| Ta-onta carriers | `Body/S/S4/ta-onta/{khora, hen, pleroma, chronos, anima, aletheia}/{CONTRACT.md, extension.ts, spine-contribution.ts, modules/, S{n}/, S{n}'/, tests/}` | The six carriers — service routing infrastructure, NOT agents (DR-M5-1 ratified) |
| `S4-5p-aletheia/CONTRACT.md` | `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md` (261 LOC) | Aletheia = tool-guardian; six tools registered; six PI-native subagents; `cron_evening` Möbius hook; Janus envelope schema |
| `plugins/pleroma/capability-matrix.json` | `Body/S/S4/plugins/pleroma/capability-matrix.json` | Canonical agent-tool governance (IOD-17 parity-locked); `constitutional_agents` array; `m5_4_governance.review_surface_roles` (lines 486+); `capacity_governance` lanes (line 583); `mediated_run_evidence_bridge` (16 required packet fields) |
| ACR extension (to be repurposed) | `Body/M/epi-theia/extensions/agentic-control-room/{src/common/{index.ts, run-model.ts, parity.ts}, src/browser/{acr-runtime-service.ts, frontend-module.ts, run-flow-widget.tsx}}` | `ACR_WIDGET_IDS = {RUN_TREE, TOOL_STREAM, DIAGNOSTICS, EVIDENCE_DEPOSITION, REVIEW_DECISION}` — the five widgets that become OmniPanel tabs per 15.2 |
| OmniPanel shell | `Body/M/epi-theia/extensions/omnipanel-shell/` | Target of 15.2 reframe; agentic membrane housing |
| Pi-runtime axiom-translation tool (DR-B-2 land) | `Body/S/S4/pi-agent/lib/axiom-translate.ts` (proposed) | Philosophical-English ↔ formal-notation ↔ OWL ↔ SHACL — routes between M5-1 and M5-2 |

**Existing `m5-epii` extension contract** (`Body/M/epi-theia/extensions/m5-epii/src/common/{epii-surface.ts (523 LOC), index.ts (101 LOC)}`):
- `M5_EPII_CONTRACT_VERSION = '2026-06-01.05-T6.07-T8'`
- Views: `m5.epii.reviewQueue`, `m5.epii.spineStateInspector`, `m5.epii.metaConversation`
- `PRIVACY_CLASS = 'governed_review_metadata_only'`
- `compositionBoundary.forbiddenImports = ['Body/S/S0', 'Body/S/S2', 'Body/S/S3', 'Body/S/S5', 'epii-review-core']` — anti-greenfield import boundary
- DTOs: `S5ReviewItem`, `S5ImprovementRun`, `DryRunPromotionPlan`, `VakEvidenceDeposit`, `S5SpineState`, `S5ReviewSnapshot`, `M5EpiiSurface`, `M5EpiiSurfaceInput` (all immutably-frozen)
- Functions: `createS5ReviewItem`, `createImprovementRun`, `requestDryRunPromotion` (throws if not dry-run — `epii-surface.ts:217-219`), `resolveReviewItem`, `depositVakCompletionEvidence`, `readS5ReviewSnapshot`, `buildM5EpiiSurface`, `enforceReviewDisposition`
- `enforceReviewDisposition(item, disposition, actorKind)`: `if (actorKind === 'agent' && blocked && (item.humanRequired || item.recursiveModification)) throw` — `epii-surface.ts:393-396` — **the agent-cannot-approve-recursive-self-modification gate is HONORED in code**.

### 2.6 M5-5' Logos Atelier substrate

| Asset | Location | Role |
|---|---|---|
| Aletheia core | `Body/S/S4/ta-onta/aletheia/{extension.ts, spine-contribution.ts, modules/, S5'/agents/, S5'/janus-envelope.schema.json, CONTRACT.md}` | Tool-guardian for Gnosis ingest/query/notebook + thought-routing + crystallisation + seed-refresh |
| Six PI-native subagents | `Body/S/S4/ta-onta/aletheia/S5'/agents/{anansi, moirai, janus, mercurius, agora, zeithoven, aletheia, README}.md` | Anansi (Darshana REPL/lineage), Moirai (GraphRAG/Möbius night pass), Janus (handoff/doorway), Mercurius (psychopomp routing), Agora (market/dialectics), Zeithoven (compositional sequencing) — all DISPATCHED through Anima (CONTRACT inv 1-2) |
| Etymology namespace | `epi-gnostic` `cypher/` queries respect coordinate tagging; `RELATES_TO_COORDINATE` cross-namespace edges; etymology subgraph distinct from bimba and gnosis | `M5'-SPEC §"Graph Namespace Model"` |
| Möbius pass | `Body/S/S4/ta-onta/aletheia/modules/{moirai-rehear.ts, chronos-integration.ts, gate-trigger.ts}` + `recompose.rs` at `Body/S/S5/epii-autoresearch-core/src/recompose.rs` | Night' phase (when `CS = night'`); `cron_evening` hook |
| Janus envelope schema | `Body/S/S4/ta-onta/aletheia/S5'/janus-envelope.schema.json` | Required: `day_id, session_ids[], thought_count_by_bucket, archive_path, trigger_type` — the Chronos↔Aletheia handoff contract |
| Sophia ingest module | `Body/S/S4/ta-onta/aletheia/modules/sophia-ingest.ts` | Sophia's session-end thought→T-bucket promotion |
| Logos Atelier extension | NOT YET EXTANT in `Body/M/epi-theia/extensions/` (Wave-A M5 anomaly O-M5-2) | Tranche 06.2 first-build (no-orphan-fill) |

**The `etymology` namespace anti-greenfield discipline:** the Atelier extension is FIRST-BUILD but it does NOT rebuild RAG — it consumes Aletheia tools through `s4'.mediation.route` (Anima-dispatched, per CONTRACT inv 2) and `s5'.gnostic.*` (Tranche 06.1) over the existing `epi-gnostic` graph layer. The scent-following method (root → cognate → drift → psychoid charge → pros-hen → Möbius write-back) is a UX choreography over landed substrate, not a new pipeline.

---

## 3. Dataset Map

### 3.1 Canonical canon corpus (the vault)

`/Idea/` is the canonical canon filesystem. Subtrees relevant to M5':

| Subtree | Role | M5 sub-coord |
|---|---|---|
| `Idea/Bimba/Seeds/M/{M0',M1',M2',M3',M4',M5'}/` | M-domain seeds; per-M spec + companions | M5-1 Canon Studio reads/writes; M5-0 retrieves; M5-5 mines |
| `Idea/Bimba/Seeds/M/Legacy/{plans, specs}/` | Plan history + legacy specs | M5-0 retrieves; M5-1 reviews; M5-4 review-inbox sources |
| `Idea/Bimba/Map/datasets/` | Canonical CSVs + JSONs: vortex modulae, paramasiva-deep, nodes/relations JSON | M5-0 retrieves (bimba namespace); M5-5 mines (etymology) |
| `Idea/Bimba/World/` | World ontology; `World-Ontology.md`; Forms, Types, Entities | M5-0 retrieves; M5-1 reviews; M5-2 traces via OWL/SHACL lift |
| `Idea/Pratibimba/System/Subsystems/{anuttara, paramasiva, parashakti, mahamaya, nara, epii}/` | M-branch UX docs; e.g. `epii/epii-ux-full-m5-branch.md` (450 LOC); `nara/nara-ux-full-m4-branch-update.md` | M5-1 Canon Studio primary reads + writes; M5-0 retrieves; M5-5 references |
| `Idea/Empty/Present/{day-date}/` | DAY-scoped inbox per `agent-contract.json:57` "inbox_path_template" | M5-4 review-inbox source (HONORED INVARIANT) |

### 3.2 Gnostic namespace dataset sources

- `Body/S/S5/epi-gnostic/{cypher/, schema-context.md}` — Cypher templates + namespace schema docs
- `Body/S/S5/epi-gnostic/tests/test_enrichment.py` — coordinate-tagging assertions, cross-namespace `RELATES_TO_COORDINATE` edge tests
- `Body/S/S5/epi-kbase/CONTRACT.md` + `Body/S/S5/epi-kbase/src/` — kbase corpus binding contract
- `bkmr` CLI (external dependency on PATH) — the kbase bookmark search

### 3.3 Capability matrix dataset

`Body/S/S4/plugins/pleroma/capability-matrix.json` — canonical agent-tool governance authority per IOD-17. Three-way parity-locked with `Body/S/S4/pi-agent/agents/anima.md` and runtime. Sections:
- `constitutional_agents` (line 7): `[anima, eros, logos, mythos, nous, psyche, sophia]` — seven leaf constitutionals
- `m5_4_governance.review_surface_roles` (line 486): `{sophia, anima, pi, aletheia, epii_review}` — five roles; **Pi appears here but NOT in constitutional_agents** (the DR-M5-1 contradiction now ratified: Pi is the agent harness, not a constitutional)
- `m5_4_governance.capacity_governance` (line 583): six operational-capacity lanes with leads (Sophia × 5, Anima × 1 for Nara)
- `mediated_run_evidence_bridge.packet_required_fields`: 16 fields; `capability_allowlists` per actor; `privacy_guards`

### 3.4 S5 review/autoresearch persistence

The `m5-epii` extension persists snapshot data to a `storeRoot` filesystem at JSON files under `review-items/`, `improvement-runs/`, `dry-run-plans/`, `evidence/` — see `Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts:482-486`. Reads + writes are stable-ID-hashed (`epii-surface.ts:504-510` FNV-1a). For Beta+ readiness this transitions to durable S5 stores via `s5'.review.*` and `s5'.improve.*` gateway methods (already registered, `gateway-contract/src/lib.rs:209-213, 220-225`).

### 3.5 Etymology graph namespace

`epi-gnostic` graph layer holds the `etymology` subgraph: roots, cognates, semantic drift, Logos-stage traces, Atelier crystallisations. Per `M5'-SPEC §"Graph Namespace Model"`, this is **namespace-boundary-load-bearing** — etymology may LINK to `bimba`, `gnosis`, and `pratibimba` by coordinate / source handle / session handle / review id, but the namespaces do NOT collapse.

---

## 4. Profile-Bus Contract

### 4.1 What `MathemeHarmonicProfile` already exposes M5' reads

Per `M5'-SPEC §"Required MathemeHarmonicProfile Fields"`:
- `tick`, `harmonic`, `diatonic`, `resonance72`, `elements`, `planetaryChakral`, `mahamaya` — for review of M2/M3 claims
- `pointerAnchor`: coordinate, relation descriptors, qvdata/source/spec/code/test anchors, graph-law provenance
- `depositionAnchor`: DAY/NOW/session, episode handle, privacy class, source file/test/spec anchors
- Readiness flags: `missing backend contract`, `pending dataset LUT`, `provisional evolutionary gap`, `private projection block`

The current `m5-epii` extension reads `MathemeHarmonicProfileBoundary` (`m-extension-runtime` shared type) via `M5EpiiSurfaceInput.profile` (`epii-surface.ts:124`) and consumes `profile.generation` plus `profile.payload.m5EpiiReviewSnapshot` (`epii-surface.ts:308`).

### 4.2 What the profile-bus is missing — load-bearing gaps for M5'

- **`resonance72`** — required by canon-recognition tests (`137 = 64+72+1`); currently CODE-PENDING (Wave-A M5 CP-M5-2; Wave-B kernel-bridge `10.x`).
- **`planetaryChakral`, `mahamaya`, `pointerAnchor`, `depositionAnchor`** — all required by M5 readiness criteria; all CODE-PENDING.
- **`m5EpiiReviewSnapshot` payload field** — the `m5-epii` extension treats this as a payload key (`epii-surface.ts:308`). The kernel-bridge MUST expose it as a typed projection rather than an untyped `payload[...]` cast.
- **`agentic_capacity_snapshot` projection** — for the six operational-capacity lanes (Tranche 12.5/06.3). The six `CapacityWorkflowSnapshot` / `BodyCapacityAlertDto` / `PratibimbaControlRoomCapacityDto` are computed at `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs:594` (`build_capacity_workflow_snapshot`) — they need to be surfaced as a typed profile field.
- **`canon_recognition_anchor`** — for the `137 = 64+72+1` review surface (M5-0 + M5-4 read). Pure projection over `resonance72` (M2) + `mahamaya` (M3) + `+1`-parent (M1-5 per the standing invariant, DR-M5-2 RATIFIED) — no new data, just a typed surface.

### 4.3 Proposed `epii_review_workbench` projection (Tranche 06.3 / 12.5)

Following the M1-2 `AnandaVortexProjection` pattern (`Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §4.3`), add a typed field to `MathemeHarmonicProfile`:

```rust
pub struct EpiiReviewWorkbenchProjection {
    /// Review inbox summary — counts by status, governance category,
    /// human-required flag. Reads from epii-autoresearch-core ReviewStore;
    /// never reconstructed from raw items.
    pub inbox_summary: ReviewInboxSummary,

    /// The six capacity-lane snapshots (computed by
    /// epii-autoresearch-core::capacity_workflows::build_capacity_workflow_snapshot
    /// at src/capacity_workflows.rs:594).
    pub capacity_lanes: [CapacityLaneSnapshot; 6],

    /// Spine state — orchestration states, route queues, meta-loop events.
    /// Reads from epii-autoresearch-core::EpiiSpineStateInspectorSnapshot
    /// (capacity_workflows.rs:295).
    pub spine_inspector: SpineInspectorSnapshot,

    /// Recursive-self-review gate rows (sophia-on-sophia, anima-on-anima,
    /// pi-on-pi, aletheia-on-aletheia). Per
    /// capability-matrix.json m5_4_governance.review_surface_roles
    /// recursive_self_review_requires_user_final_validation.
    pub recursive_gates: Vec<RecursiveGateRow>,

    /// Active aletheia lineage cards (for the Atelier / Library cross-surface).
    pub aletheia_lineages: Vec<AletheiaLineageCard>,

    /// Day-now anchor — the DAY container path per
    /// agent-contract.json inbox_path_template "Idea/Empty/Present/{day-date}/"
    pub day_now_anchor: DayNowAnchor,
}

pub struct CapacityLaneSnapshot {
    pub capacity_id: CapacityId,         // anuttara/paramasiva/parashakti/mahamaya/nara/epii_on_epii
    pub governance_lead: String,         // sophia × 5, anima × 1 (nara)
    pub active_candidates: u32,
    pub real_review_item_count: u32,
    pub requires_human: bool,
    pub orchestration_state: OrchestrationState,
    pub ide_surface_anchor: String,
}

pub struct CanonRecognitionAnchor {
    /// 64 — Mahāmāyā binary matrix (M3 substrate handle)
    pub mahamaya_64: PointerAnchor,
    /// 72 — Paraśakti bridge (M2 substrate handle)
    pub parashakti_72: PointerAnchor,
    /// +1 — M1-5 Paramaśiva toroidal parent (DR-M5-2 RATIFIED:
    /// the +1 is M1-5, NOT M0-witness; residual M0-witness wording
    /// is to be downgraded across the corpus)
    pub paramasiva_plus_1: PointerAnchor,
}
```

The Wave-A M5 matrix CP-M5-2 names the dependency: `resonance72`, `planetaryChakral`, `mahamaya`, `pointerAnchor`, `depositionAnchor` must land first (Wave-B kernel-bridge `10.x`); then `EpiiReviewWorkbenchProjection` is a typed projection over already-computed substrate (anti-greenfield: do NOT rebuild `capacity_workflows.rs`; surface it).

### 4.4 Anti-greenfield discipline on profile-bus

- The `MathemeHarmonicProfile` writes happen at `Body/S/S0/portal-core/src/kernel.rs` (`from_tick`); M5' subscribes — does not write.
- Vimarśa-window patterns from M1' apply: `audio_octet[8]`/`nodal_quartet[4]` are Vimarśa-written and M5' never recomputes; equivalently, M5 review-summary fields are S5-written (via `epii-autoresearch-core`) and M5' Theia never recomputes.

---

## 5. Visual Rendering Contract (per sub-coordinate)

The M5' surfaces are **not 3D geometric instruments** like M1'/M2'/M3'/M4' — they are **text-and-graph workbenches** with surgical 2D visual moments. Density is in text + graph + structured tables; visualization is restrained per the conversational-default UX axiom (`epii-ux-full-m5-branch.md §1`).

### 5.1 M5-0' Gnostic Library rendering

| Element | Geometry | Substrate consumed |
|---|---|---|
| **Coordinate-rooted retrieval pane** | Two-pane: bimba map node-card on the left, retrieved Gnosis chunks on the right (each chunk tagged with `bimba_coordinate` / `bimba_resonances`) | `s5'.gnostic.query` over `epi-gnostic` |
| **Namespace badge** | Small colored chip per chunk: `bimba` (blue), `gnosis` (amber), `etymology` (green), `pratibimba` (locked-padlock) | `M5'-SPEC §"Graph Namespace Model"` |
| **Wisdom-packet view** | Card stack with crystallised "pithy" + full-corpus expand affordance | `epii-ux-full-m5-branch.md §2.1` |
| **Provenance ribbon** | Inline border-color: `ready` (green), `pending-*` (amber), `blocked` (red) per `15-ui-design-foundations.md §3` | kernel-bridge readiness ledger |

**No 3D rendering** in M5-0'. The library IS a graph + text surface. If a 3D bimba-graph view is summoned, it is consumed from M0 `m0-anuttara` (see §7 boundary).

### 5.2 M5-1' Canon Studio rendering

| Element | Geometry | Substrate consumed |
|---|---|---|
| **Markdown editor** | Theia's `monaco-editor` with QL/bimba-coordinate decoration extension (highlight `M{n}'`, `S{n}'`, `(0/1)` context-frames inline) | Theia FS provider; `hen-compiler-core` write boundary |
| **Smart Connections autocomplete** | Wikilink autocomplete merging explicit outlinks with semantic neighbours (BGE-micro-v2 cosine sort) | `s1'.semantic.suggest_link_candidates` over `<vault>/.smart-env/multi/*.ajson` |
| **Lens rotation panel** | Twelve-cell L0..L5/L0'..L5' lens grid; click rotates the active node through MEF×QL (the 72-fold resonance per `epii-ux-full-m5-branch.md §4`) | `MathemeHarmonicProfile.resonance72` (CODE-PENDING) |
| **Klein V₄ square indicator** | Three small SVG squares A (`0+5`), B (`1+4`), C (`2+3`) — highlight on lens-anchor change | UX `epii-ux-full-m5-branch.md §4.2` |
| **Vāk density ribbon** | Four-stage progressive disclosure: UuidOnly (Parā) → Coordinate (Paśyantī) → Resonances (Madhyamā) → Full corpus (Vaikharī) | `epii-ux-full-m5-branch.md §4.3` |
| **Decoration colours** | QL position colour-key (P0..P5 spectrum); family-letter sigil; inversion-flag glyph `#` / `'` | `CLAUDE.md` Layer 2 coordinate families |

**No 3D in Canon Studio.** The visual density lives in text-decoration + lens-rotation table — the pedagogy IS the visualization.

### 5.3 M5-2' Backend Studio rendering

| Element | Geometry | Substrate consumed |
|---|---|---|
| **LSP-driven file tree** | Standard Theia file explorer; coordinate-tagged folders (S0..S5) get sigils; `M' vs S'` colour-key | `rust-analyzer`, `clangd`, `pylsp` |
| **Substrate-citation gutters** | Gutter shows `m1.h:551-564 ↔ kernel.rs:346-465` cross-reference badges when a struct or function spans C/Rust | static analysis + manual mapping table |
| **Anuttara grammatical-trace overlay** (sensitive-context) | Contemplative offering only — read-only; renders `anuttara_trace(output, sensitivity, depth)` as a faded right-margin annotation (NEVER as pass/fail) | O-M5-1 cross-domain referral to M0 |
| **Axiom-translation surface** | Side-panel showing source-text → formal-notation → OWL → SHACL transitions on hover; Pi-routed | DR-B-2 land: `Body/S/S4/pi-agent/lib/axiom-translate.ts` |
| **Test/evidence inline** | `cargo test`/`pytest`/`vitest` output threads inline with code; coordinate-tagged | LSP + S5 review evidence handles |

### 5.4 M5-3' IDE Shell + Playable Bimba rendering

The shell itself is rendered by `Body/M/epi-theia/extensions/pratibimba-layouts/` + `ide-shell-m0-m5/` + `omnipanel-shell/`. The visual contract is the UI Foundations contract (`15-ui-design-foundations.md`):

- Two layout modes (`daily-0-1`, `ide-deep`) share one kernel-bridge
- Activity-bar left; OmniPanel right; status bar bottom
- `cmd-period` triggers `0/1` toggle with **lemniscate transition primitive** (`15.5`) — cosmic composition folds inward, personal composition emerges
- The playable bimba in dev/engagement modes is rendered by M0' `m0-anuttara` (`BimbaMap2D.tsx` / `BimbaMap3D.tsx` per `epii-ux-full-m5-branch.md §2.4`) — consume-from-M0 boundary (§7.1)

### 5.5 M5-4' OmniPanel (Pi-runtime) rendering

The **load-bearing visual reframe**: ACR → OmniPanel (Tranche 15.2). The Pi-runtime is the right-sidebar agentic membrane.

| Tab | Geometry | Substrate consumed |
|---|---|---|
| **Pi Chat** | Conversational thread; coordinate-aware capability cards; Anima dispatches visible as sub-traces | `pi-agent`; `s4'.mediation.route` |
| **Sessions** | Session manager (start, resume, switch, identify); `agent:epii:main` keyed | Khora `session-ground`; `pi_gateway_session_key` per `agent-contract.json:7` |
| **Dispatch Trace** | Tree view: Pi → Anima → subagent (e.g. Pi → Anima → Aletheia → Moirai) with timing + capability gates | `RUN_TREE` repurposed; `dispatch_moirai_night_pass` etc. |
| **Tool Stream** | Time-ordered event list of subagent tool calls | `TOOL_STREAM` repurposed |
| **Evidence** | `MediatedRunEvidencePacket` view — 16 required fields per capability-matrix; never modal | `EVIDENCE_DEPOSITION` repurposed; field-parity per Tranche 12.6 |
| **Review** | Human-required gate landings; defer/summarize/deposit-evidence/request-dry-run-promotion/approve/reject/revise/promote/weaken-gate (`epii-surface.ts:14-24`) | `REVIEW_DECISION` repurposed; never modals |
| **Gateway** | `s4'.mediation.capabilities.list` + capability-parity check + readiness | Tranche 12.10 |
| **Diagnostics** | `kernel-bridge-readiness` summary; profile-field pending markers; six pending-* flags | `kernel-bridge-readiness` extension |
| **Six capacity panes** | Anuttara · Paramaśiva · Paraśakti · Mahāmāyā · Nara · Epii-on-Epii lanes — each shows `requires_human`, `governance_lead`, candidate count, evidence handles | `capacity_workflows.rs` registry (Tranche 06.3/12.5) |

**No 3D in OmniPanel.** The Pi-runtime is text + tree + table. Persistent across all layouts (`15-ui-design-foundations.md §5`). No modals — the Review tab IS the landing surface.

### 5.6 M5-5' Logos Atelier rendering (the most visually distinctive M5' surface)

| Element | Geometry | Substrate consumed |
|---|---|---|
| **Word constellation** | Force-directed graph: term node at center; cognates orbit by etymological distance; semantic drift renders as colour-gradient along edges | `epi-gnostic` `etymology` namespace via `aletheia_gnosis_query` |
| **Scent trail (root → cognate → drift)** | Animated polyline that walks from PIE/proto-root through attested cognates into modern usage; gold for direct cognate, indigo for semantic drift | derived from `aletheia_gnosis_query` chained results |
| **Psychoid charge halo** | Colour-temperature halo around node: cool indigo for high archetypal-numerical resonance; warm amber for lived/material resonance | `MathemeHarmonicProfile.resonance72` (CODE-PENDING) + bimba-coordinate of the closest match |
| **Pros-hen synthesis card** | Klein-square layout (four panes A/B/C/D) presenting the synthesis: archetypal pole (top-left) · material pole (top-right) · symbolic mediator (bottom-left) · processual flow (bottom-right) | `aletheia_crystallise` output |
| **Möbius write-back proposal** | Bottom-strip showing the candidate canon-target (bimba node) + the proposed crystallisation card + dry-run plan handle + review-gate badge | `s5'.review.submit` + `s5'.improve.propose` |
| **Day-night phase indicator** | Top-right glyph: sun (CS = day) / crescent (CS = night') — Möbius engine state | Chronos `chronos-integration.ts` |
| **Klein-flip animation primitive (Atelier-specific)** | When the scent crosses the etymological-drift threshold (semantic drift > 0.5), the constellation Klein-flips: the same nodes re-orient into the dual reading (e.g. "crisis" → krísis as DECISION → JUDGMENT → THRESHOLD) | UX-side choreography; substrate is the drift score from `aletheia_gnosis_query` |

The Atelier is the **one M5' surface where a dedicated 2D/animated visual is load-bearing** — etymological archaeology IS a spatial-temporal practice; force-directed constellation is the right geometry for it.

---

## 6. Tick Choreography — The M5' Animation Primitives

### 6.1 The carry-the-tick primitive: profile-tick re-render

Per `15-ui-design-foundations.md §6` (Tranche 15.6): **every M5' widget subscribes to the kernel-bridge profile-tick event** via `subscribeToProfileTick` / `onProfileAdvance`. No local clock. No animation-frame-count fallback.

For M5', the tick choreography is **MUCH less dense** than the M1'/M2'/M3'/M4' instrument surfaces — M5' is a workbench, not an instrument. The tick advances **state**, not animation:

| Sub-coord | Tick advances | Cadence |
|---|---|---|
| M5-0' Library | Provenance badges (readiness recompute) | Tick-quantised |
| M5-1' Canon Studio | Lens-rotation indicator on lens_mode change; smart-connections semantic cache validation | Lens-anchored |
| M5-2' Backend Studio | LSP diagnostic refresh; test-status badge; readiness badges | Tick-quantised |
| M5-3' Shell | Profile-generation displayed in status bar; layout-mode label | Every frame (cheap) |
| M5-4' OmniPanel | Review-inbox counts; dispatch-trace event-arrival; gateway readiness; six capacity-lane counters; Pi-thinking indicator | Tick-quantised |
| M5-5' Atelier | Word-constellation node positions (force-directed settles toward equilibrium across ticks); psychoid-halo colour-temperature (lens-anchored); Klein-flip animation triggers on drift threshold | Tick-quantised (positions); event-driven (Klein-flip) |

### 6.2 What changes simultaneously on tick advance — M5-4' OmniPanel example

| Widget | Change | Source field |
|---|---|---|
| Pi Chat thinking indicator | Pulse on tick | `profile.tick` |
| Sessions activity badge | Re-render if session deposited new evidence since last tick | `s5'.epii.runtime.context` |
| Dispatch Trace | Append new events (Pi → Anima dispatch arrivals) | `s4'.mediation.route` stream |
| Tool Stream | Append new tool-call events | runtime stream |
| Evidence | Counters recompute for `MediatedRunEvidencePacket` arrivals | gateway stream |
| Review | Open / deferred / resolved counts | `s5'.review.inbox` |
| Gateway | Readiness recompute (any `pending-*` flag flip is a state event) | `kernel-bridge-readiness` |
| Diagnostics | All readiness flags recompute | same |
| Capacity-lane counters | `requires_human` rows highlight; orchestration_state transitions show | `capacity_workflows.rs` |

### 6.3 What stays still on tick advance — discipline

- **Active coordinate** — only changes on user navigation or agent-summoned context
- **Lens / mode** — only changes on lens rotation or summoned context
- **Session id** — survives toggles AND tick advances (Tranche 15.7 `BimbaPratibimbaUiState`)
- **Day-now anchor** — DAY container path stays stable through ticks; only NOW path advances per Chronos
- **OmniPanel tab selection** — survives toggles AND tick advances

### 6.4 Where the eye goes per tick (the M5' eye-discipline analogue to M1-2 §6.4)

- **Default focus:** the conversational thread (Pi Chat or whichever panel is active)
- **Peripheral motion:** OmniPanel tab counters (review queue, dispatch events)
- **Foveated highlight on review-required:** when a `humanRequired` review item lands, the Review tab pulses; the badge in OmniPanel chrome glows. Not a modal — a quiet attention-claim.
- **Lemniscate transition** on `cmd-period` 0/1 toggle (Tranche 15.5) — the whole shell folds; cosmic↔personal composition swap.

### 6.5 The 5→6 boundary in M5' — the human-required gate-landing event

When a review item with `humanRequired=true` lands (deposited from Anima as `aletheia_crystallisation` / `review_item` / `improvement_request` / `validation_gate`):
- Review tab badge pulses
- OmniPanel chrome glow (subtle)
- If the user is in `daily-0-1`, a single notification chip appears at status bar
- **No interruption**, no modal — the agentic membrane respects flow
- The `enforceReviewDisposition` gate (`epii-surface.ts:393-396`) blocks any agent attempting to approve/reject/revise/promote/weaken — the user is the only path forward

### 6.6 The 11→0 / Möbius return in M5' — the Atelier write-back event

When the Atelier's Möbius write-back is dry-run-approved (and eventually non-dry-run, after compiler mutation law lands):
- Atelier renders a bright-pulse on the source bimba node
- Library M5-0' renders a "freshly-crystallised" badge on the touched coordinate
- Canon Studio M5-1' shows the new entry inline if the user has the file open
- Review tab in OmniPanel shows the promotion-decision evidence
- Day-now status bar logs the Möbius event

This is the 5→0 seam expressed as event: the Atelier's etymological excavation crystallises back into bimba canon; the system has reactivated #0 material from #5. The animation primitive is a coordinated flash + badge + evidence-deposit — not a 3D fold (the 3D Klein-flip belongs to M1'/M2'/M3'/M4' instruments).

### 6.7 Simultaneous vs sequential rendering layers — M5' summary

| Layer | Render cadence |
|---|---|
| Conversational thread (Pi Chat), text editors, file trees | Every frame |
| Review counters, capacity-lane badges, readiness flags | Tick-quantised |
| Word-constellation force-directed positions | Tick-quantised with damping |
| Klein-flip Atelier animation, Möbius write-back event | Boundary-quantised (drift threshold; promotion approval) |
| Lens-rotation indicator hue, MEF×QL grid highlight | Lens-anchored (only on `lens_mode` change) |
| Layout-mode transition (lemniscate) | User-event-driven (`cmd-period`) |

---

## 7. Boundary Contracts

### 7.1 M5 ↔ M0 (the 4/5/0 articulation axis — playable-bimba seam)

**M5-3' Frontend Studio claims to host the "playable bimba" in two render-modes** (`epii-ux-full-m5-branch.md §2.4`: `BimbaMap2D.tsx` / `BimbaMap3D.tsx` developer-mode + engagement-mode). The substrate side belongs to **M0' `m0-anuttara` extension** — this is **NOT M5 territory to build**.

- **Contract type:** `consumes-from-M0`
- **Surface seam:** `Body/M/epi-theia/extensions/m0-anuttara/{BimbaMap2D.tsx, BimbaMap3D.tsx}` (file existence audited by Wave-A-M0)
- **M5 obligation:** in `ide-shell-m0-m5` extension, summon the M0 playable-bimba view into the editor area when the user requests; in OmniPanel, deep-link from Dispatch Trace → bimba node renders the M0 widget
- Cross-ref: `M0-ARCHITECTURE.md §7` (M0 owns the substrate; M5 consumes)

**The M5↔M0 Möbius return is canonical:** the Atelier's write-back at M5-5' deposits into M0's bimba node (via review + dry-run promotion + eventual canon write through Hen). This IS the `5→0` seam expressed as data: Logos Atelier → Aletheia crystallisation → Anima dispatch → Epii review → user final-validation → Hen vault write → bimba namespace update → M0 reads renewed canon. Cross-ref `M0-ARCHITECTURE.md §"Canon write-back path"`.

### 7.2 M5 ↔ M4 (the 4/5 seam — personal handoff)

**Nara (M4) is the protected-personal mirror; Epii (M5) is the impersonal-archaeological + governance workbench.** The handoff at M4.5 routes through the `pratibimba` graph namespace (governed handles only, NEVER raw private bodies):

- **Contract type:** `consumes-handles-only`
- **Surface seam:** `Body/S/S5/epi-gnostic` `pratibimba` namespace handles + `m5-epii` extension `PRIVACY_CLASS = 'governed_review_metadata_only'` (`index.ts:16`)
- **M5 obligation:** the `m5-epii` widgets MUST treat all `pratibimba` artifacts as handles (coordinate, session, review id) — protected bodies MUST never render. `enforceReviewDisposition` + `isPrivacySafe(privacyClass)` enforced in `epii-surface.ts:393-396` and `agentic-control-room/src/browser/acr-runtime-service.ts:89, 159, 219`.
- **Plugin-integrated-4-5-0** (`Body/M/epi-theia/extensions/plugin-integrated-4-5-0/`) realises the recognition surface: foreground M4 personal cymatic on background M0 bimba; M5 review-gates the promotion law (`epii-ux-full-m5-branch.md §7.1`)
- Cross-ref: `M4-ARCHITECTURE.md §"M4↔M5 handoff"`; `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`

### 7.3 M5 ↔ M1/M2/M3 (the canon-recognition seam — `137 = 64+72+1`)

M5's canon-review surface MUST trace `137 = 64 + 72 + 1` claims back to:
- **64** — M3 Mahāmāyā binary matrix at `Body/S/S0/epi-lib/include/m3.h` + `portal-core/src/mahamaya.rs`
- **72** — M2 Paraśakti bridge at `Body/S/S0/epi-lib/include/m2.h` + `portal-core/src/parashakti/vimarsha_reading.rs`
- **+1** — M1-5 Paramaśiva toroidal parent at `Body/S/S0/epi-lib/include/m1.h` + `portal-core/src/hopf.rs` (DR-M5-2 RATIFIED: the +1 is M1-5, NOT M0)

- **Contract type:** `consumes-substrate-anchors`
- **M5 obligation:** `CanonRecognitionAnchor` projection (§4.3) typed-references all three; the canon-review test asserts they are reachable; the residual M0-witness wording in M5'-SPEC §M5'.6 + alpha_quaternionic_integration_across_M_stack is downgraded
- Cross-ref: `M1-ARCHITECTURE.md §"+1 parent"`; `M2-ARCHITECTURE.md §"72-bridge"`; `M3-ARCHITECTURE.md §"64-Mahāmāyā"`

### 7.4 M5 ↔ Integrated 1-2-3 cosmic engine

**The integrated 1-2-3 plugin** (`Body/M/epi-theia/extensions/plugin-integrated-1-2-3/`) is the M1'+M2'+M3' composition surface; M5' does NOT render it but DOES review-gate its kernel writes through the autoresearch spine. When the played K² torus + cymatic + codon-rotation produces a profile-tick event whose evidence flows back as a review item (e.g. an autoresearch hypothesis about `klein_flip` cadence), M5-4 OmniPanel surfaces it in the Review tab.

- **Contract type:** `review-gates`
- Cross-ref: `INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md §"Review-gate seam"`

### 7.5 M5 ↔ S4↔S5 shared-intelligence seam (canon-as-context)

Per `epii-ux-full-m5-branch.md §5.2`: **the canon acts as context, not payload — both S4 and S5 tune to it.** Aletheia (S4) retrieves; Sophia/Anima/Pi (S4) reason; review and write-back (S5) run. The shared zone is M5-4.

- **Contract type:** `composes-with` (Aletheia tools via Anima dispatch; S5 spine via gateway)
- **The "tuning fork" claim** depends on `MathemeHarmonicProfile.resonance72` landing (CP-B-2; cross-link kernel-bridge 10.x). Until then the seam is rhetorical, NOT runtime-grounded. M5 honors this: review-gates that test `137 = 64+72+1` are BLOCKED until kernel-bridge surfaces the field (per M5'-SPEC `Readiness/Test Criteria` line 184).
- Cross-ref: wave-b-agentic-layer-matrix.md row B7

### 7.6 Forbidden overlaps

- **M5 does NOT own the kernel** — `Body/S/S0/{epi-lib, portal-core}` is consumed; never modified from M5 surfaces. The Backend Studio LSP enables READ + governed-AGENT-EDIT, NEVER direct user-write that bypasses Hen.
- **M5 does NOT own graph-services** — `Body/S/S2/graph-services` is consumed via gateway; M5 surfaces the four namespaces but never collapses boundaries.
- **M5 does NOT own Nara's personal corpus** — M4 owns the protected personal field; M5 consumes only governed handles via `pratibimba` namespace.
- **M5 does NOT bypass Anima dispatch** — `agent-contract.json:50-54` `forbidden_authority: [bypass_anima_dispatch_boundaries, mutate_raw_runtime_state_without_review_record, treat_anima_constitutional_agents_as_epii_subagents]`. The third forbidden authority is the load-bearing DR-M5-1 protection.
- **M5 does NOT render full instrument geometries** — M1-2 played-torus, M2 cymatic surface, M3 codon wheel, M4 personal cymatic belong to those M's; M5 review-gates only.
- **M5-3 does NOT own the playable bimba** — M0 does. M5-3 hosts the shell that summons M0's widget.

---

## 8. IDE Integration (Theia / `m5-epii` + named new extensions)

### 8.1 Extension landscape

| Extension | Path | Status | Role |
|---|---|---|---|
| `m5-epii` | `Body/M/epi-theia/extensions/m5-epii/` | LANDED (review-queue + spine-state inspector + meta-conversation) | Primary M5' M-extension; consumes `s5'.review.*` + `s5'.improve.*` + `s5'.epii.*` |
| `agentic-control-room` | `Body/M/epi-theia/extensions/agentic-control-room/` | LANDED (5 widgets) | Repurposed by 15.2 into OmniPanel content; six capacity panes by 12.5/06.3 |
| `omnipanel-shell` | `Body/M/epi-theia/extensions/omnipanel-shell/` | LANDED (housing) | The agentic membrane housing; absorbs ACR substrate per 15.2 |
| `ide-shell-m0-m5` | `Body/M/epi-theia/extensions/ide-shell-m0-m5/` | LANDED | M0+M5 chrome integration |
| `kernel-bridge` + `kernel-bridge-readiness` | `Body/M/epi-theia/extensions/kernel-bridge*/` | LANDED | First-loaded; profile + gateway + readiness ledger |
| `m-extension-runtime` | `Body/M/epi-theia/extensions/m-extension-runtime/` | LANDED | Shared M-extension runtime contracts |
| `pratibimba-layouts` | `Body/M/epi-theia/extensions/pratibimba-layouts/` | LANDED | Layout-mode lifecycle (daily-0-1, ide-deep) |
| `body-lite-surface` | `Body/M/epi-theia/extensions/body-lite-surface/` | LANDED | Lightweight body view |
| `contracts` | `Body/M/epi-theia/extensions/contracts/` | LANDED | `07-t0-extension-contract-preflight.json` and friends |
| `plugin-integrated-1-2-3` | `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/` | LANDED | Composes M1+M2+M3 (cosmic engine) |
| `plugin-integrated-4-5-0` | `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/` | LANDED | Composes M4+M5+M0 (recognition seam) |
| `integrated-composition` | `Body/M/epi-theia/extensions/integrated-composition/` | LANDED | Composition pattern contract for integrated plugins |
| `acceptance-harness` | `Body/M/epi-theia/extensions/acceptance-harness/` | LANDED | Test harness; visual-regression baselines |
| **`canon-studio`** | `Body/M/epi-theia/extensions/canon-studio/` (proposed) | **PROPOSED Tranche 06.4** | M5-1' surface — markdown editor + QL/bimba decoration + Smart Connections autocomplete |
| **`backend-studio`** | `Body/M/epi-theia/extensions/backend-studio/` (proposed) | **PROPOSED Tranche 06.4** | M5-2' surface — LSP contributions (rust-analyzer, clangd, pylsp); coordinate-tagged file tree |
| **`logos-atelier`** | `Body/M/epi-theia/extensions/logos-atelier/` (proposed) | **PROPOSED Tranche 06.2** | M5-5' surface — word constellations, scent-following, Möbius write-back |
| **`library-pane`** (or M5-0' view inside `m5-epii`) | proposed inline | **PROPOSED Tranche 06.1 consumer** | M5-0' library surface consuming `s5'.gnostic.*` |

### 8.2 Surface placement in the IDE

Per `15-ui-design-foundations.md §"Surface Contracts"`:

- **`daily-0-1` cosmic-side** (integrated 1-2-3): M5 has no editor-area presence; M5-4 OmniPanel persistent on right; review notifications surface lightly per `epii-ux-full-m5-branch.md §10`
- **`daily-0-1` personal-side** (integrated 4-5-0): M5 surfaces lightly — Epii appears as paidagōgos: "This touches a map concept. Open a short explanation?" Plugin-integrated-4-5-0 binds the recognition seam.
- **`ide-deep`** (the 4+2 depth): Six M5' sub-surfaces are summonable into editor area: Library (M5-0'), Canon Studio (M5-1'), Backend Studio (M5-2'), playable-bimba dev-mode (M5-3' summons M0), m5-epii review workbench (M5-4'), Logos Atelier (M5-5'). The conversational agent opens the pane the conversation requires.
- **OmniPanel (right sidebar):** Pi-runtime monitoring across ALL layouts. Persistent. The agentic membrane (`/` operator made into UI).

### 8.3 Profile-tick clock consumption (Tranche 15.6)

Every M5' extension subscribes to `kernel-bridge` profile-tick event via `subscribeToProfileTick` / `onProfileAdvance`. No local clock. The status bar surfaces the global tick state + profile generation + day-now anchor + active coordinate + session id + gateway readiness (`15-ui-design-foundations.md §10`).

### 8.4 Provenance inline rendering (Tranche 15.6)

Every datum shows readiness state inline:
- `ready` — solid border-color, no badge
- `pending-*` — amber border + pending badge with reason
- `blocked` — red border + blocked overlay with kernel-bridge readiness ledger reason

M5-0' Library, M5-1' Canon Studio, M5-2' Backend Studio, M5-4' OmniPanel, M5-5' Atelier ALL surface `resonance72`/`mahamaya`/`pointerAnchor`/`depositionAnchor` pending states inline. The Library shows `pending-s5-gnostic` until Tranche 06.1 lands.

### 8.5 Bimba/Pratibimba state persistence across toggle (Tranche 15.7)

Per `BimbaPratibimbaUiState` (Tranche 15.7), the following M5 state survives the 0/1 toggle AND the `daily-0-1` ↔ `ide-deep` switch:
- `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow)`
- Active OmniPanel tab
- Active activity-bar mode (where mode exists in both layouts)
- Open review item / dry-run plan handle
- Atelier word-constellation graph state (force-directed equilibrium)
- Pi Chat conversation thread

The kernel-bridge DI singleton IS this contract (`pratibimba-layouts/src/common/layout-types.ts:7-12`).

### 8.6 Accessibility

- Profile-tick supports `pause` and `scrub_to_tick(t)` affordances per `15.9`
- Review tab is NEVER modal — landing surface only
- Pi Chat exposes ARIA-live announcements for agent dispatches
- Word-constellation accepts keyboard navigation (tab through nodes)
- OmniPanel collapse → keyboard `cmd-/` (`/` operator literal)
- `cmd-period` (`.` nesting operator) for 0/1 toggle

---

## 9. Anti-Greenfield Audit

### 9.1 Landed in code (consume, do not re-invent)

| Asset | Location |
|---|---|
| `epi-gnostic` production RAG | `Body/S/S5/epi-gnostic/epi_gnostic/{cli.py, graphiti_service.py, wrapper.py, enrichment/, storage/, cypher/, config.py}` |
| `epi-kbase` corpus binding | `Body/S/S5/epi-kbase/{CONTRACT.md, src/}` + `epi-kbase-core/` |
| `epii-autoresearch-core` (2049 LOC) | `Body/S/S5/epii-autoresearch-core/src/{lib.rs, capacity_workflows.rs (2584), inbox.rs (381), spine.rs (651), recompose.rs (90), adapters.rs}` |
| `epii-review-core` | `Body/S/S5/epii-review-core/` |
| `epii-agent-core` + `epii-agent` | `Body/S/S5/epii-agent-core/`, `epii-agent/{agent-contract.json, contract-ledger/}` |
| `s5'.{epii, review, improve}.*` gateway registrations (11 methods) | `Body/S/S3/gateway-contract/src/lib.rs:209-225, 1290-1386` |
| Ta-onta carriers (six) | `Body/S/S4/ta-onta/{khora, hen, pleroma, chronos, anima, aletheia}/` |
| Pleroma capability matrix | `Body/S/S4/plugins/pleroma/capability-matrix.json` (IOD-17 parity-locked) |
| Pi-agent harness | `Body/S/S4/pi-agent/{composite-entry.ts, lib/, prompts/, extensions/, agents/}` |
| Aletheia CONTRACT + tools + 6 Aletheia subagent techne-guardians (per DR-S4-TECHNE; Techne is Pleroma's substrate not an agent) | `Body/S/S4/ta-onta/{aletheia, S4-5p-aletheia}/{extension.ts, CONTRACT.md, modules/, S5'/agents/{anansi,janus,moirai,mercurius,agora,zeithoven}.md + aletheia.md (carrier) + README.md}` |
| Pleroma CONTRACT + VAK capability membrane + Techne atomic-skills repository (per DR-S4-TECHNE; Pleroma's second face) | `Body/S/S4/ta-onta/{pleroma, S4-2p-pleroma}/{extension.ts, CONTRACT.md, S2/{pleroma-primitives.ts, tilldone.ts, damage-control.ts}}` — §Techne section TO BE ADDED to CONTRACT.md per DR-S4-TECHNE cycle-3 deliverable |
| `agentic-control-room` extension (5 widgets + parity) | `Body/M/epi-theia/extensions/agentic-control-room/` |
| `m5-epii` extension scaffold (523 LOC epii-surface.ts) | `Body/M/epi-theia/extensions/m5-epii/` |
| `omnipanel-shell`, `ide-shell-m0-m5`, `pratibimba-layouts`, `kernel-bridge`, `m-extension-runtime`, `body-lite-surface`, `contracts`, `acceptance-harness` | `Body/M/epi-theia/extensions/{...}` |
| `plugin-integrated-4-5-0`, `plugin-integrated-1-2-3`, `integrated-composition` | `Body/M/epi-theia/extensions/{...}` |
| Hen-compiler-core (wikilinks + smart_env) | `Body/S/S1/hen-compiler-core/src/{wikilinks.rs, smart_env.rs}` |
| Graph-services retrieval (graphrag, hybrid, coordinate) | `Body/S/S2/graph-services/src/retrieval/` |
| Gateway-contract (1,825 LOC, 11 s5' methods + s4' mediation) | `Body/S/S3/gateway-contract/src/lib.rs` |

### 9.2 Pending (cycle-3 deliverables — named, NOT greenfield)

- **Tranche 06.1 / 12.2** — Register `s5'.gnostic.{ingest, query, notebook, status}` in `gateway-contract/src/lib.rs` METHODS array; wire dispatch in `Body/S/S3/gateway/src/` over existing `epi-gnostic` CLI bridge. Anti-greenfield: epi-gnostic NOT rebuilt.
- **Tranche 06.2** — Author `Body/M/epi-theia/extensions/logos-atelier/{package.json, src/common/atelier-surface.ts, src/browser/atelier-widget.tsx}`; consume Aletheia tools through Anima dispatch over `etymology` namespace via `s5'.gnostic.*` (Tranche 06.1). Anti-greenfield: Aletheia tools NOT rebuilt; etymology namespace already in epi-gnostic.
- **Tranche 06.3 / 12.5** — Add six per-capacity panes to `agentic-control-room` (→ OmniPanel) driven by `capacity_workflows.rs` types (`capacity_workflow_registry()` at `src/capacity_workflows.rs:336`; `build_capacity_workflow_snapshot` at `:594`). Anti-greenfield: substrate already implements per-capacity slice runners.
- **Tranche 06.4** — Author `Body/M/epi-theia/extensions/{canon-studio, backend-studio}/` consuming existing `s1'.{vault, semantic}.*` + LSP toolchain. Anti-greenfield: hen-compiler-core, smart_env already landed; LSP servers are standard tooling.
- **Tranche 06.5** — Decision-register entries DR-M5-1 (now RATIFIED at cycle-3 standing invariant: Pi is singular harness) and DR-M5-2 (now RATIFIED: +1 is M1-5, NOT M0).
- **Tranche 06.6** — `anuttara_trace` cross-domain referral to Wave-A-M0; no first-build here.
- **Tranche 12.6** — `MediatedRunEvidencePacket` field-parity (RunEvidenceEnvelope ↔ 16 spec fields). Extension to existing types.
- **Tranche 12.4** — Recursive-self-review gate extension in `enforceHumanGate` (per `capability-matrix.json` `recursive_self_review_requires_user_final_validation`). Extension to existing function.
- **Tranche 12.9** — Gateway-handler audit for `dispatch_moirai_night_pass` + Aletheia Möbius-pass routing. Audit only.
- **Tranche 12.10** — Capability-parity live-assertion wiring (`s4'.mediation.capabilities.list`). Gateway endpoint registration.
- **Tranche 15.2** — OmniPanel reframe (ACR → OmniPanel content). Substrate repurpose.

### 9.3 Net-new (M' product surface — anti-greenfield exceptions)

These are the legitimate first-builds — each justified by an M' product-surface or named-owner requirement:

- **`canon-studio` Theia extension** (M5-1' M' product surface; no current owner) — `Body/M/epi-theia/extensions/canon-studio/`
- **`backend-studio` Theia extension** (M5-2' M' product surface; no current owner) — `Body/M/epi-theia/extensions/backend-studio/`
- **`logos-atelier` Theia extension** (M5-5' M' product surface; no current owner; named carrier-owner = Anima→Aletheia→subagents) — `Body/M/epi-theia/extensions/logos-atelier/`
- **`library-pane` view** or new dedicated extension for M5-0' library surface consuming `s5'.gnostic.*` — placement TBD between extending `m5-epii` or new `library-pane` extension
- **`EpiiReviewWorkbenchProjection` + `CanonRecognitionAnchor` typed projections** on `MathemeHarmonicProfile` — typed surface over existing computed substrate (NOT new data)
- **Pi `axiom-translate.ts` tool** (DR-B-2 ratified; named-routing closure) — `Body/S/S4/pi-agent/lib/axiom-translate.ts`
- **Word-constellation force-directed graph** in `logos-atelier` extension — aesthetic addition; NO substrate geometry exists; renderer-side
- **Atelier Klein-flip animation** at drift-threshold — renderer choreography over `aletheia_gnosis_query` drift score; substrate provides the score

### 9.4 Forbidden (do not invent)

- **Local pitch synthesis** — M2-1' Vimarśa-window contract; M5 reads `audio_octet[8]` via profile bus or NOT AT ALL
- **Local clocks** — every M5 surface subscribes to kernel-bridge profile-tick; no `setInterval` / `requestAnimationFrame` counters
- **Local LUT forks** — Mn.h constants NEVER duplicated into TS/wgsl tables in M5 extensions
- **Local graph relation inference** — every graph read goes through `Body/S/S2/graph-services` via gateway; M5 does NOT compute `RELATES_TO_COORDINATE` edges locally
- **Composition by juxtaposition** — `15-ui-design-foundations.md §6`; the integrated 1-2-3 and 4-5-0 plugins compose geometrically, NEVER as three side-by-side widgets; M5-3 honors this contract
- **Rebuilding the RAG** — `epi-gnostic` IS the RAG; Atelier consumes via Aletheia tools, never re-implements
- **Treating Aletheia subagents as ACR-AgenticActor peers** — DR-B-3 ratified: Aletheia-internal only; surface as Anima-dispatch sub-traces under Aletheia
- **Bypassing Anima dispatch** — `agent-contract.json:50-54` forbidden authority; M5 surfaces only request through Anima
- **Auto-promotion of canon** — `epii-surface.ts:217-219` throws if non-dry-run; non-dry-run is blocked until compiler mutation law lands (S5-SPEC)

---

## 10. Test Criteria

Beyond the M5'-SPEC `Readiness / Test Criteria` list (lines 168-184), this architecture is acceptance-ready when:

1. `grep -n "s5'\.gnostic" Body/S/S3/gateway-contract/src/lib.rs` returns ≥4 method registrations (Tranche 06.1)
2. `cargo check -p gateway-contract && cargo check -p gateway` after Tranche 06.1
3. `pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py::test_cross_namespace_edge_created -q` passes (canon-as-context substrate audit, Tranche 12.13)
4. `test -d Body/M/epi-theia/extensions/logos-atelier && test -f Body/M/epi-theia/extensions/logos-atelier/package.json` (Tranche 06.2)
5. `grep -n "etymology" Body/M/epi-theia/extensions/logos-atelier/src/common/atelier-surface.ts` returns hits (Tranche 06.2)
6. `test -d Body/M/epi-theia/extensions/canon-studio && test -d Body/M/epi-theia/extensions/backend-studio` (Tranche 06.4)
7. `grep -n "s1'.vault\|s1'.semantic" Body/M/epi-theia/extensions/canon-studio/src/common/` returns hits (Tranche 06.4)
8. `grep -n "rust-analyzer\|clangd\|pylsp" Body/M/epi-theia/extensions/backend-studio/package.json` returns hits (Tranche 06.4)
9. `grep -rn "capacity_workflows" Body/S/S5/epii-autoresearch-core/src` returns implemented surface (Tranche 06.3); ACR/OmniPanel package.json declares six capacity view contributions
10. `grep -rn "subscribeToProfileTick\|onProfileAdvance" Body/M/epi-theia/extensions/m5-epii Body/M/epi-theia/extensions/agentic-control-room Body/M/epi-theia/extensions/omnipanel-shell` returns hits per Tranche 15.6
11. Visual-regression test: OmniPanel survives `daily-0-1` ↔ `ide-deep` toggle without losing session, tab, or counters (Tranche 15.12)
12. Privacy test: `m5-epii` and OmniPanel widgets NEVER render a protected body — only handles + summaries. `enforceReviewDisposition`, `isPrivacySafe` enforced (verified at `Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts:393-396` and `Body/M/epi-theia/extensions/agentic-control-room/src/browser/acr-runtime-service.ts:89, 159, 219`).
13. Anti-bypass test: agent-attempted approve/reject/revise/promote/weaken-gate of human-required or recursive-self-modification review item throws (verified at `epii-surface.ts:394-396`)
14. Anti-treat-constitutional-as-subagent test: `agent-contract.json:53` `treat_anima_constitutional_agents_as_epii_subagents` enforcement — no M5 surface lists constitutionals as Epii-internal
15. Day-path test: M5 inbox surfaces respect `Idea/Empty/Present/{day-date}/` (`agent-contract.json:57`); no NOW-folder writes for review items
16. Canon-recognition test: `137 = 64+72+1` review surfaces trace to M1-5 (+1) NOT M0; residual M0-witness wording downgraded (DR-M5-2 RATIFIED audit)
17. Pi-singular-harness test: capability-matrix `constitutional_agents` array does NOT list `pi`; ACR/OmniPanel `AgenticActor` includes Pi as harness label not constitutional peer (DR-M5-1 RATIFIED audit)
18. Recursive-self-review test: `enforceHumanGate({recursiveSelfReview: true, actor: 'sophia', humanRequired: false, actorIsHuman: false})` returns blocked (Tranche 12.4)
19. Field-parity test: `RunEvidenceEnvelope` keys = `capability-matrix.json mediated_run_evidence_bridge.packet_required_fields` set-equality (Tranche 12.6)
20. Möbius-night-pass routing test: `grep -rn "dispatch_moirai_night_pass" Body/S/S3/gateway/src/ Body/S/S4/ta-onta/anima/modules/` returns hits in BOTH (Tranche 12.9)
21. Six-capacity readiness test: each of `{Anuttara, Paramasiva, Parashakti, Mahamaya, Nara, EpiiOnEpii}` has at least one real end-to-end readiness path into S5 review/autoresearch state (M5'-SPEC line 180)

---

## 11. Closing — Why M5' Is What It Is

M5' is the **return pole** — Anuttara's deep computational language (M0) becoming **engageable for development** through the agentic-pedagogical IDE. The six sub-coordinates are not arbitrary: they trace the QL explication pattern (`M5-0 / M5-5` framing pair; `M5-1 .. M5-4` inner dynamics) per `epii-ux-full-m5-branch.md §2`. The IDE is **one shell**, not six apps — Theia at `/pratibimba/system` carrying one kernel-bridge, one autoresearch spine, one OmniPanel agentic membrane. The bimba/pratibimba dial at the M5' scale is:

> **The bimba map is the teacher. Epii is the paidagōgos.** The corpus and the canon are the source; the agent is the companion that situates the user; the OmniPanel is the membrane through which Pi/Anima/Aletheia/Sophia conduct without becoming panels of their own. The Möbius return at M5-5' (Logos Atelier) is the system's reactivation organ: etymological archaeology pulls #0 ground material back into #5 visibility, where it crystallises into renewed canon. — `M5'-SPEC §"Canon Recognition"`; `epii-ux-full-m5-branch.md §14`.

The conversational-default UX is the load-bearing **eye-discipline of M5'**: text + graph + structured tables in the workbench, with surgical 2D visualisation only where it earns its place (the Atelier word-constellation, the lens-rotation grid, the dispatch-trace tree, the six capacity-lane counters). The instrument-grade 3D belongs to M1'/M2'/M3'/M4'; M5' is the **review-and-conduct** workbench over those instruments' outputs.

The autoresearch spine + review inbox is the most-aligned M5' substrate (Wave-A M5 ALIGNED). The named gaps are surface-only and integration-only:
1. `s5'.gnostic.*` gateway registration (Tranche 06.1 / 12.2 — code-pending closure)
2. Three new Theia extensions (canon-studio, backend-studio, logos-atelier — Tranches 06.4 / 06.2; no-orphan first-builds for M' product surfaces)
3. Six capacity lanes surfaced (Tranche 06.3 / 12.5 — spec-ahead integration)
4. OmniPanel reframe of ACR substrate (Tranche 15.2 — repurpose)
5. Two ratified DRs translated into corpus edits (Tranche 06.5)

These are integration tranches over landed substrate, NOT greenfield. The bimba↔pratibimba dial at M5' is finally rendered as: the system reviews itself, teaches itself, improves itself, and returns improvements to canon through one Theia shell, one Pi harness, one Anima dispatcher, one Aletheia tool-guardian carrying six PI-native subagents, and six summonable surfaces the conversation opens when the road requires. — DR-M5-1 + DR-M5-2 ratified; the matheme `137 = 64 + 72 + 1` traceable; the Möbius cycle closed.

---

*Companion research: [`plan.runs/wave-a-m5-reconciliation-matrix.md`](../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m5-reconciliation-matrix.md), [`plan.runs/wave-b-agentic-layer-matrix.md`](../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-agentic-layer-matrix.md). Cross-references: `M0-ARCHITECTURE.md §"Canon write-back path"`, `M1-ARCHITECTURE.md §"+1 parent"`, `M2-ARCHITECTURE.md §"72-bridge"`, `M3-ARCHITECTURE.md §"64-Mahāmāyā"`, `M4-ARCHITECTURE.md §"M4↔M5 handoff"`, `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`, `INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md`. UX source: `epii-ux-full-m5-branch.md`. Spec: `M5'-SPEC.md`. System-shape canon: `m5-prime-system-shape-and-tauri-ide-canon.md §1.2, §4, §5`.*
