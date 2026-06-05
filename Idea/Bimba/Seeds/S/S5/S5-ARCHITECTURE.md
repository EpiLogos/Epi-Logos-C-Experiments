---
title: "S5 Integral World Boundary Architecture — Total Shape of Epii Corpus & Autoresearch Substrate (Gnostic / Kbase / Review / Autoresearch / Agent-Access / Möbius-Return)"
label_correction: "Per S5 canon at Idea/Bimba/World/Types/Coordinates/S/S5/S5.md: 'S5 is not identical with Notion. Notion is one optional manifestation of this layer.' Canonical label is Integral World Boundary — world-exchange AND world-return. Two directions: outward integrations (Notion/n8n/Telegram/webhooks, partially implemented) + inward knowledge-return (Gnostic via RAG-Anything + Graphiti episodic memory, currently most landed). Aletheia (S4-5') actualises S5 today via Gnostic ingestion/retrieval, Graphiti episodic memory, thought routing, crystallisation, seed refresh. Substrate-residency note: Body/S/S5/{epi-gnostic, epi-kbase, epii-autoresearch-core} physically under S5; Body/S/S3/graphiti-runtime physically under S3 but conceptually actualises S5."
coordinate: "S5 / S5'"
status: "canonical-architecture-spec"
created: 2026-06-03
authority_relation: "Domain authority for the S5 substrate layout. [[S5-SPEC]] and [[S5'-SPEC]] cross-reference this document. Where they disagree on file-level shape, this document is authoritative; the SPECs remain authoritative for canonical surface naming, gateway-method registries, and lifecycle invariants. M5-ARCHITECTURE.md is authoritative for the M5' product surface; this document is authoritative for the S-side substrate M5' consumes."
depends_on:
  - "[[S5-SPEC]]"
  - "[[S5'-SPEC]]"
  - "[[M5-ARCHITECTURE]]"
  - "[[CLAUDE.md]] (C-family categorical foundation)"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m5-reconciliation-matrix.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-agentic-layer-matrix.md"
decisions_carried:
  - "DR-M5-1 RATIFIED: Pi is the harness; Anima is main dispatcher; six Aletheia subagents are Anima-dispatched specialists; six ta-onta carriers are infrastructure not agents."
  - "DR-B-2 RATIFIED: Pi carries axiom-translation tooling at Body/S/S4/pi-agent/lib/axiom-translate.ts — S5'/Epii consumes this for review/promotion of formal artifacts."
  - "DR-B-3 RATIFIED: Aletheia subagents are Aletheia-internal — they enter S5 review/autoresearch only as DisclosureLineage records, not as peer agents."
related_tranches:
  - "06.1 — Register s5'.gnostic.{ingest,query,notebook,status} over production epi-gnostic (CODE-PENDING closure)"
  - "06.2 — logos-atelier Theia extension over Aletheia + etymology namespace"
  - "06.3 — Six operational-capacity views over capacity_workflows.rs"
  - "06.4 — Canon Studio + Backend Studio extensions consume epi-kbase + smart_env"
  - "10.x — kernel-bridge MathemeHarmonicProfile field landings (resonance72, depositionAnchor)"
  - "12.2 — Identical s5'.gnostic.* registration (mirrors 06.1 from agentic-layer side)"
  - "12.4 — Recursive-self-review gate (cross-references S5 review-core requires_human guard)"
  - "12.6 — MediatedRunEvidencePacket 16-field parity"
  - "12.13 — 3072-dim Bimba+Gnosis embedding-space audit"
  - "15.x — UI foundation adherence for M5' consumers"
---

# S5 Architecture

## 0. Frame

**S5 is the Epii corpus, autoresearch, and review substrate — the world-boundary and Möbius-return layer of the S-stack.** Position #5 of the S-family (per `CLAUDE.md §II.C`: P5 Integration / S5 Notion / T5 Insight / M5 Epii / L5 Integral / C5 Pratibimba). The bedrock archetype is `#5` — Integration, Pratibimba, Möbius return.

S5 is **not** the M' product surface (that is M5-ARCHITECTURE's domain). S5 is the **landed Body/S/S5 substrate**: the production Python RAG pipeline (epi-gnostic), the TypeScript+Rust kbase semantic-search stack (epi-kbase / epi-kbase-core), the durable autoresearch loop (epii-autoresearch-core, 2584 LOC in `capacity_workflows.rs` alone), the durable review inbox (epii-review-core, 558 LOC `lib.rs` with the `requires_human` non-bypassable guard), the Epii agent-access core (epii-agent-core, 1170 LOC `lib.rs` exposing the `M5WorkbenchSnapshot` DTO), the Epii agent contract (epii-agent/agent-contract.json with 11 gateway methods and four-tuple Anima reciprocity), and the promoted epi-logos plugin resource package (Body/S/S5/plugins/epi-logos, scoped to the `epii` PI runtime via `Body/S/S5/plugins/registry.jsonl`).

**The split S5 ↔ S5':** S5 is the world-boundary base (corpus + connectors); S5' is Epii's reflective governance (review + autoresearch + canon-promotion law + pedagogy spine). In substrate terms, both halves live under `Body/S/S5/` — there is no separate `Body/S/S5p/` tree. S5 vs S5' is a **role** assignment per sub-coordinate, not a directory split.

**Anti-greenfield posture:** All six sub-coordinates are LANDED. This document phrases cleanup as `consume as-is`, `audit/verify`, `extend`, or `refactor/modularise/cleanup with named scope`. The two CODE-PENDING items are concrete named integration blockers (gateway registration of `s5'.gnostic.*` and non-dry-run canon promotion), NOT greenfield rebuilds.

---

## 1. The Six Sub-Coordinates (bimba ↔ substrate)

The S5/S5' branch decomposes into six sub-coordinates per `S5'-SPEC.md` lines 22-29. Mapping bimba registers to landed substrate:

| Sub-coord | Bimba register | Substrate (live code) | S/S' role |
|---|---|---|---|
| **S5-0' / S5.0'** | Epii identity, Bimba/library ground, knowledge ground (Anuttara-pole within S5) | `Body/S/S5/epii-agent-core/src/lib.rs` (1170 LOC), `Body/S/S5/epii-agent/agent-contract.json` (4-tuple contract + 11 methods), `Body/S/S5/plugins/epi-logos/` (vendor-promoted resource package), `Body/S/S5/plugins/registry.jsonl` (epii-scoping) | Both S5 ground (identity) AND S5' ground (Epii agent surface) |
| **S5-1' / S5.1'** | Crystallised form, review inbox, synthesis receive, pedagogy/transmissible-return shape | `Body/S/S5/epii-review-core/src/lib.rs` (558 LOC) — `ReviewStore`, `ReviewSubmission`, `ReviewInboxItem`, `GovernanceProfile`, `ReviewResolution`, `requires_human` guard at `lib.rs:460-489` | Pure S5' (Epii's reviewable form) |
| **S5-2' / S5.2'** | Retrieval/governance, Gnosis, RAG, kbase, disclosure density | `Body/S/S5/epi-gnostic/epi_gnostic/{cli.py,wrapper.py,graphiti_service.py,enrichment/,storage/,config.py,graphiti_config.py}` (Python; 926+ LOC core), `Body/S/S5/epi-kbase-core/src/{lib.rs,kbase.rs,parse.rs,project.rs,script.rs,types.rs,vimarsa.rs}` (Rust; 399 LOC), `Body/S/S5/epi-kbase/src/{index.ts,project-scope.ts,envelope-metadata.ts,sem-search.ts,skill-search.ts}` (TS; 376+ LOC) | Both: S5 base (RAG production) + S5' governance (retrieval policy) |
| **S5-3' / S5.3'** | Episodic/memory-weave pattern, Graphiti, temporal axes | `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` (534 LOC — temporary FastAPI HTTP wrapper at port 37778), with target architecture moving to `Body/S/S3/graphiti-runtime` per `S5-SPEC.md:104-105` ("Graphiti is architecturally S3' temporal episodic runtime/library; S5 owns invocation, usage, search strategy, arc governance") | S5' governance, S3' runtime |
| **S5-4' / S5.4'** | Improvement context, autoresearch, Sophia/Darshana/Zeithoven vectors | `Body/S/S5/epii-autoresearch-core/src/{lib.rs,capacity_workflows.rs,spine.rs,inbox.rs,recompose.rs,adapters.rs}` (Rust; ~6700 LOC) — `ImprovementStore`, `capacity_workflow_registry()`, the six `CapacityId`s, `DisclosureLineage`, kernel-evidence advisory channel, Möbius `recompose_pass` | Pure S5' (Epii self-improvement spine) |
| **S5-5' / S5.5'** | Canon promotion, seed generation, Möbius return, QL schema evolution, teaching return | Hen dry-run promotion via `Body/S/S1/hen-compiler-core::plan_compile` (consumed at `epii-autoresearch-core/src/lib.rs:5-7`), `epi-logos` plugin skills/resources under `Body/S/S5/plugins/epi-logos/skills`, capacity-promotion destinations in `capacity_workflows.rs:336-543` (six target families: `m5-prime://{anuttara,paramasiva,parashakti,mahamaya,nara,epii}/...`) | Pure S5' (canon-return law) |

**Six sub-coordinates verified.** The substrate-layer crate organization (separate `epii-agent-core`, `epii-review-core`, `epii-autoresearch-core`, plus the Python `epi-gnostic` and the dual TS+Rust `epi-kbase`/`epi-kbase-core`) is a *deliberate* CT5-return decomposition — review-state law is separated from improvement-state law is separated from agent-access read-DTOs, mirroring the bimba↔pratibimba split between law-substrate and surfacing-substrate.

---

## 2. Substrate Map (file:line citations)

### 2.1 S5-0' — Epii agent-access core + agent contract

**`Body/S/S5/epii-agent-core/src/lib.rs`** (1170 LOC, single-file crate):

- `EpiiAgentAccess` struct at `lib.rs:19-22` — stateless reader holding a `state_root: PathBuf`; constructs `ReviewStore` and `ImprovementStore` on demand via `review_store()` (`lib.rs:592-594`) and `improvement_store()` (`lib.rs:596-598`).
- `EpiiAgentSnapshot` (lines 24-32): the canonical Epii read-DTO — `agent_id`, `coordinate: "S5/S5'"`, `relation_to_anima: "peer_pi_agent"`, `ReviewAccessSnapshot`, `ImprovementAccessSnapshot`, `gateway_methods: Vec<String>`.
- `M5WorkbenchSnapshot` (lines 112-123): the M5'-extension consumption surface — `schema_version: M5_WORKBENCH_SCHEMA_VERSION` (= 1 at line 17), `M5ReviewPaneDto`, `M5SpineStateDto`, `route_queues`, `candidate_details`, `continuity_hints`, `promotion_dry_run_results`, `compatibility_aliases`, `gateway_methods`.
- `M5ArtifactRefDto` (lines 181-193) with `M5ArtifactNamespace` enum (lines 195-207): `Vault | Repo | GraphBimba | Gnosis | Etymology | Pratibimba | Run | Review | Improvement` — the **9-namespace artifact discriminator** that gates UI readiness and `review_required` flags.
- `DepositType` enum (lines 234-241): `ReviewItem | ImprovementRequest | ValidationGate | AletheiaCrystallisation` — the four `accepted_deposits_from_anima` per `agent-contract.json:31-37`.
- `DepositRequest` (lines 252-269) — carries `day_id`, `now_path`, `session_key` for DAY-scoped inbox path resolution per `S5-SPEC.md:104` ("inbox path is DAY-scoped at `Idea/Empty/Present/{day-date}/`").
- `EpiiAgentAccess::snapshot()` at `lib.rs:313-377` — the gateway implementation backing `s5'.epii.status`.
- `EpiiAgentAccess::m5_workbench_snapshot()` at `lib.rs:379-437` — the surface backing the m5-epii Theia extension via `buildM5EpiiSurface` (consumed at `Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts:306`).
- `EpiiAgentAccess::deposit()` at `lib.rs:439-494` — Anima/Aletheia deposit pathway; auto-creates a review item AND, for `ImprovementRequest`, an autoresearch run with `source_review_item_id` linkage.
- `EpiiAgentAccess::deposit_typed_candidate()` at `lib.rs:496-534` — surfaces an `ImprovementCandidate` AND a review-blocking notice in one transaction.
- `EpiiAgentAccess::resolve_review()` at `lib.rs:544-556` — **enforces the source-actor gate**: only `human` or `epii` may resolve; `anima`/`aletheia` deposits are rejected with `"may deposit review material but cannot resolve Epii gates"`. This is a load-bearing authorisation contract per `agent-contract.json:38-49` (`epii_authority` includes `resolve_review_gate`; `forbidden_authority` includes `treat_anima_constitutional_agents_as_epii_subagents`).
- `EpiiAgentAccess::plan_promotion_dry_run()` at `lib.rs:577-582` — **enforces `dry_run: true`**: any non-dry-run promotion is rejected at this layer. This implements the load-bearing law from `S5'-SPEC.md:78` "explicit blockers: ... non-dry-run canon promotion."

**`Body/S/S5/epii-agent/agent-contract.json`** (100 lines): The 4-tuple Anima reciprocity contract. `gateway_methods` array (lines 14-26) is the **authoritative list of 11 Epii gateway methods** — used by `epii-agent-core/src/lib.rs` `gateway_methods()` (referenced at lines 32, 122, 123, 375, 435 etc.).

**`Body/S/S5/epii-agent/contract-ledger/`** — append-only contract evolution log (existence confirmed; contents not inventoried for this pass).

**`Body/S/S5/plugins/`**:
- `epi-logos/` — vendor-promoted (`vendor_promoted_canonical_body` per agent-contract.json:11) resource package containing `.pi-agent`, `.claude-plugin`, `.codex`, `agents/`, `commands/`, `hooks/`, `resources/`, `skills/`. Per `S5-SPEC.md:133`.
- `registry.jsonl` — scopes the epi-logos package to `epii` PI runtime only; **prevents** Anima from loading these skills.

### 2.2 S5-1' — Epii review-core (durable review inbox)

**`Body/S/S5/epii-review-core/src/lib.rs`** (558 LOC, single-file crate):

- Enum hierarchy at `lib.rs:9-75`: `ReviewSource {HumanGate, Anima, Aletheia, Autoresearch}` (lines 11-16), `ReviewStatus {Open, Resolved, Deferred}` (lines 20-24), `ReviewDecision {Approve, Reject, Revise, Defer}` (lines 28-33), `ReviewPriority {Low, Normal, High, Blocking}` (lines 37-42), `ReviewCategory` (lines 46-54) with seven variants — `StandardImprovement | DeploymentGate | UserFinalValidation | RecursiveSelfModification | NaraAnimaPrimaryGate | AletheiaCrystallisation | CanonRecognitionPublicationGate`, `GateKind` (lines 58-65) with six variants, `GovernanceLevel` (lines 69-75) with five variants.
- `ResolutionActor` enum at `lib.rs:78-81` with **custom Serde** (lines 83-125): serialises `Human` as `"human"`, `Agent(id)` as the agent id directly. This makes the wire-form human-vs-agent distinction stringly addressable while keeping the Rust type closed.
- `GovernanceProfile` at `lib.rs:147-169`: the **full governance envelope** — `category`, `gate_kind`, `governance_level`, `required_actors`, `candidate_id`, `orchestration_id`, `source_artifact_refs`, `target_subsystem`, `vector_kind`, `promotion_destination`, `source_actor_detail`, `stage_records`. This is the "MediatedRunEvidencePacket"-class field set Wave-B 12.6 names for 16-field parity audit.
- `KernelReviewVisibility` at `lib.rs:204-214` — **the kernel-evidence safety projection**: `projection: Value` (filtered), `energy_delta`, `resonance_delta`, `musical_readiness`, `visual_readiness`, `advisory_only: bool`. Validated at `lib.rs:491-532` to enforce `advisory_only: true`, projection privacy `"safe-public-current-kernel-tick"`, projection computation_source `"portal-core::KernelProjection"`, and **forbids** the protected kernel fields `bioquaternion` and `resonanceSquareEmphasis`.
- `ReviewStore` (lines 256-258, methods 268-407): file-backed durable store at `<root>/s5-review-state.json` (path at `lib.rs:386-388`). Methods: `submit`, `inbox(filter)`, `resolve(request)`, `history(limit)`.
- **`requires_human_resolution`** at `lib.rs:460-489` — the load-bearing non-bypassable gate. Returns `true` if `item.requires_human` is set, OR the governance profile's category is in `{DeploymentGate, UserFinalValidation, RecursiveSelfModification, CanonRecognitionPublicationGate}`, OR gate_kind is in `{HumanFinal, DeploymentGate, RecursiveSelfModification, PublicationGate}`, OR governance_level is in `{HumanRequired, DeploymentBlocking, RecursiveLoadBearing, PublicationBlocking}`. **Used at `resolve()` line 336-342**: if any of those conditions and `resolved_by != ResolutionActor::Human`, the resolution is rejected.

### 2.3 S5-2' — epi-gnostic (production RAG) + epi-kbase (semantic kbase)

#### 2.3.1 epi-gnostic (Python)

**`Body/S/S5/epi-gnostic/`**:

- `pyproject.toml` declares two binaries: `epi-gnostic` → `epi_gnostic.cli:main` and `epi-graphiti` → `epi_gnostic.graphiti_service:main`. Production deps: `raganything>=1.2.0`, `lightrag-hku>=1.0.0`, `neo4j>=5.0.0`, `google-genai>=1.0.0`, `graphiti-core>=0.3.0`, `fastapi>=0.110.0`, `redis>=5.0.0`.
- `epi_gnostic/cli.py` (137 LOC): CLI dispatcher for the Rust subprocess-bridge pattern. Commands: `status | ingest | ingest-text | query | enrich`. Output is JSON-on-stdout (line 20 `_json_out`) consumed by `Body/S/S0/epi-cli/src/techne/gnosis/`.
- `epi_gnostic/wrapper.py` (155 LOC): `GnosticRAG` class wrapping `RAGAnything` + `LightRAG` with `Neo4jVectorStorage`. **Embedding contract:** `embedding_dim: int` from `GnosticConfig` (default `3072` per `Aletheia CONTRACT §"Gnosis RAG Pipeline"`). `vector_storage="Neo4jVectorStorage"` registered via monkey-patch at lines 17-50 (`_register_neo4j_vector_storage`).
- `epi_gnostic/graphiti_service.py` (534 LOC): FastAPI HTTP wrapper at port 37778. The **temporary** Graphiti compatibility adapter — `S5-SPEC.md:104-105` explicitly names this as transitional and the target as `Body/S/S3/graphiti-runtime`. The wrapper monkey-patches `graphiti_core.graphiti.Graphiti.add_episode` to suppress `group_id → database` switching (lines 105-130) — all data stays in the single Neo4j database "neo4j", with `group_id` becoming a property filter only.
- `epi_gnostic/enrichment/coordinator.py` (297 LOC): `CoordinateEnricher` class. Two assignment paths: `assign_direct(entity_id, coordinate, family)` at lines 58-99 (deterministic) and `classify_entity(... llm_func ...)` (LLM-classified via Gemini at line 103 of `cli.py`). The Cypher MERGE at lines 82-92 creates `(:gnostic{vector_id:$vid})-[:MAPS_TO_COORDINATE {confidence:1.0, method:'direct'}]->(:Bimba {coordinate:$coord})` — **the cross-namespace edge contract** Wave-B 12.13 audits.
- `epi_gnostic/storage/neo4j_vector.py` (321 LOC): `Neo4jVectorStorage` implementing LightRAG's `BaseVectorStorage`. Uses Neo4j native HNSW vector indexes via `db.create.setNodeVectorProperty`. **Multi-tenant invariant:** all nodes carry a workspace label (`workspace` field; default `"gnostic"`).
- `epi_gnostic/config.py` + `epi_gnostic/graphiti_config.py`: env-driven config — `GEMINI_API_KEY`, `GEMINI_EMBED_DIMS=3072`, `NEO4J_URI`, etc.
- `cypher/` (4 cypher files): `00-bootstrap.cypher`, `02-relations-upsert.cypher`, `03-pointers-resolve.cypher`, `generated/`. Schema operations for the gnostic namespace.
- `tests/`: `test_config.py`, `test_cross_namespace.py` (104 LOC), `test_enrichment.py` (211 LOC), `test_neo4j_vector.py` (181 LOC), `test_wrapper.py` (71 LOC).
- `Dockerfile.graphiti`: containerised graphiti runtime image.
- `scripts/migrate_bimba_embeddings.py` (119 LOC), `scripts/enrich.py` — migration and batch-enrichment scripts.

#### 2.3.2 epi-kbase (TypeScript) + epi-kbase-core (Rust)

**`Body/S/S5/epi-kbase/`** (TypeScript, 376+ LOC):

- `src/index.ts` (35 LOC): exports the public API surface — `bindKbaseProject`, `kbaseSearch`, `skillSearch`, `hasHighRelevanceMatch`, `readKbaseProject`, `setKbaseProject`, `propagateKbaseToChild`, `parseSkillFrontmatter`, `extractExcerpt`, plus types.
- `src/skill-search.ts` (135 LOC): `skillSearch` over plugin/agent skill markdown bodies — the discovery surface for the epi-logos plugin package.
- `src/sem-search.ts` (114 LOC): `kbaseSearch` via `bkmr` semantic CLI.
- `src/project-scope.ts` (59 LOC): `DEFAULT_KBASE_PROJECT`, `buildRunScopedProject`, `buildDayScopedProject`, `resolveEffectiveProject`, `bindKbaseProject` — project-scope binding that gates which kbase corpus is queryable per run/day.
- `src/envelope-metadata.ts` (58 LOC): `METADATA_KBASE_PROJECT`, `METADATA_KBASE_PROJECT_FALLBACK`, `readKbaseProject`, `setKbaseProject`, `propagateKbaseToChild` — envelope-level project propagation across dispatch boundaries.
- `CONTRACT.md` (41 LOC): the canonical S5 contract for kbase consumption.

**`Body/S/S5/epi-kbase-core/`** (Rust, 399 LOC across six modules):

- `src/lib.rs` (6 LOC): `pub mod {kbase, parse, project, script, types, vimarsa}` — pure re-export façade.
- `src/kbase.rs` (106 LOC): kbase corpus driver.
- `src/vimarsa.rs` (154 LOC): `bkmr`/aperture bookmark integration (per `S5-SPEC.md:119`).
- `src/project.rs` (41 LOC): project-binding (Rust mirror of `epi-kbase/src/project-scope.ts`).
- `src/parse.rs` (12 LOC), `src/script.rs` (60 LOC), `src/types.rs` (26 LOC).

### 2.4 S5-3' — Graphiti episodic usage governance

**Substrate split:** `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` (transitional S5 HTTP wrapper at port 37778) ↔ `Body/S/S3/graphiti-runtime/` (target temporal-runtime authority). The **invocation/arc/governance** is S5'; the **runtime library** is S3'. Per `S5-SPEC.md:104-105` and `S5'-SPEC.md:27`.

Gateway routes for episodic operations are S3-side (`s5.episodic.{search, deposit, kernel_resonance.deposit, kernel_profile_observation.deposit}` registered at `Body/S/S3/gateway-contract/src/lib.rs:218-221` and 1344-1362). The `s5.episodic.*` family is the only `s5.*` (non-prime) gateway family currently registered.

### 2.5 S5-4' — Epii autoresearch-core (the improvement spine)

**`Body/S/S5/epii-autoresearch-core/`** — the largest S5 crate (~6700 LOC Rust, ~6700 LOC of integration tests):

- `Cargo.toml` deps: `epi-s1-hen-compiler-core` (via path) — for `plan_compile` / `CompilePlanRequest` / `HenTimestamp` / `TargetAgent` (consumed at `lib.rs:5-7`); `epi-s5-epii-review-core` — for the review-gate types (consumed at `lib.rs:8-10`); `portal-core` — for kernel projection types.
- `src/lib.rs` (2049 LOC): the main façade. Pubs `mod adapters, capacity_workflows, inbox, recompose, spine` (lines 15-19). **Critically `inbox` and `recompose` are intentionally not re-exported** (per comment at line 20-21: "callers namespace via `inbox::` / `recompose::` to keep the seam topology visible at import sites"). This is a deliberate **import-shape contract** worth preserving.
  - `ArtifactRef` (lines 31-37), `LoopState` (lines 49-56), `ImprovementDecision` (lines 58-63), `ProposeRequest` (lines 65-73).
  - `EvidenceSourceRef` (lines 75-83), `EvaluationEvidence` (lines 85-96) — the source-referenced evidence schema.
  - `KernelEvidence` family (lines 98-205) — `KernelEvidenceSnapshot`, `KernelEvidenceDelta`, `KernelEvidence`, `KernelTrajectoryRef`. **Privacy-locked**: `KERNEL_EVIDENCE_PRIVACY = "safe-public-current-kernel-tick"` (line 27), `KERNEL_EVIDENCE_COMPUTATION_SOURCE = "portal-core::KernelProjection"` (line 28). `from_public_projections` constructor at `lib.rs:144-190` validates the public projection and constructs the advisory-only delta.
  - `EvaluationResult` (lines 207-215), `ImprovementRun` (lines 217-237) — `closure_kind: ClosureKind` (default `LegacyUnspecified`), `ct_register: ContentTypeRegister` (default `LegacyUnspecified`); `typed_candidate: Option<ImprovementCandidate>`.
  - `ImprovementVector`, `ImproveStatus`, `ImprovementHistory`, `CandidateRecord`, `RouteStatus`, `RouteRecord`, `SurfacedCandidateReceipt` (lines 239-304).
  - `OrchestrationState` enum (lines 320-332): 9 states — `Queued | InReview | AwaitingUserValidation | Retrying | Integrating | Verifying | Promoted | Discarded | Abandoned`.
  - `ReviewStage` (lines 334-341), `RetryPolicy` (lines 343-358), `DiscardReason` (lines 360-367), `OrchestrationRecord` (lines 369-389).
  - `IntegrationVerificationEntry`, `ContinuityHint`, `CrossCycleContinuity`, `CompilerInvocationSummary`, `CompilePlanSummary`, `PromotionHenTimestamp` (lines 418-499) — the bridge into S1' Hen compiler.

- `src/capacity_workflows.rs` (**2584 LOC** — by far the largest single S5 file):
  - `CapacityId` enum (lines 27-36): `Anuttara | Paramasiva | Parashakti | Mahamaya | Nara | EpiiOnEpii` — the six operational capacities.
  - `CapacityWorkflowRegistryEntry` (lines 38-57) — 18-field registry record per capacity: `target_subsystem`, `governance_lead`, `evidence_requirements`, `first_trigger_types`, `review_category`, `required_agents`, `user_final_gate_conditions`, `promotion_destination_family`, `ide_surface_anchor`, `source_spec_anchors`, `vector_kind`, `surfacing_pipeline`, `initial_orchestration_state`, `gate_kind`, `governance_level`, `promotion_destination`.
  - `capacity_workflow_registry()` at `capacity_workflows.rs:336-544` — **the canonical six-capacity table**. For each capacity, the entry hard-codes its governance lead (`sophia` for 5 of 6, `anima` for `nara`), evidence requirements, trigger types, the M5'-extension `ide_surface_anchor` (e.g. `"pratibimba://system/control-room/capacity/anuttara"` — note: this anchor is **stale** per the Theia migration to `Body/M/epi-theia/`; the `/pratibimba/system/` URI scheme should be audited against current shell routes), and two `source_spec_anchors` per capacity pointing to `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-{capacity}-*.md`.
  - `DeterministicCapacitySliceReceipt` (lines 154-164), `NaraExchangeRecord`/`NaraVoiceGovernanceRequest`/`NaraVoiceGovernanceReceipt` (lines 195-236) — Nara consent-corpus governance with `pii_stripped_body`, `quality_score`, `quality_threshold`, `revoked`.
  - `RecursiveReviewProtocolKind` (lines 238-246): `SophiaOnSophia | AnimaOnAnima | PiOnPi | AletheiaOnAletheia | SpineOnSpine` — the **recursive-self-review classifier** Wave-B 12.4 needs. The classifier substrate is HERE; the ACR-side `enforceHumanGate` extension still pending.
  - `EpiiSpineStateInspectorSnapshot` (lines 294-303), `RecursiveGateWeakeningRequest`/`Receipt` (lines 305-319), `AletheiaExpertLineageCard` (lines 321-334).
  - `BodyCapacityAlertDto` (lines 68-80) and `PratibimbaControlRoomCapacityDto` (lines 82-99) — the M' surfacing DTOs.

- `src/spine.rs` (651 LOC):
  - `SPINE_SCHEMA_VERSION = 1` (line 5).
  - `TargetSubsystem` enum (lines 7-16) — six variants matching `CapacityId`.
  - `ImprovementVectorKind` (lines 18-45) — **24 variants** across the six subsystems with tagged-union dispatch: e.g. `ParashaktiEmbeddingRefresh { embedding_kind: String }`, `MahamayaSymbolicProgramPromotion { program_id: String }`, `EpiiAgentConfigurationUpdate { agent: String, scope: String }`. The `target_subsystem()` method at lines 47-76 routes each variant to its `TargetSubsystem`.
  - `SurfacingPipelineId` (lines 78-88): 7 pipelines — `AletheiaDisclosure | AnuttaraConstruction | ParamasivaDerivational | ParashaktiRelational | MahamayaCalculation | NaraDialogic | EpiiOnEpiiMeta`.
  - `ClosureKind` (lines 90-112): `Rehear | ForceClosed | LegacyUnspecified` — Möbius-closure discriminator with wire-form parser.
  - `ContentTypeRegister` (lines 114-126): `CT4a | CT4b | LegacyUnspecified`.
  - `CanonicalVakKeys` (lines 128-142): `cpf, ct, cp, cf, cfp, cs` — the six reflective/contextual coordinates from `CLAUDE.md §III.C`. **Real evidence** that S5 carries the C-family-canonical "execution matrix in `()`" forward.
  - `SensitivityClass` (lines 144-150): `PublicCurrent | ProtectedLocal | RequiresReview`.

- `src/inbox.rs` (381 LOC): **The Aletheia JSONL handoff seam.** Wire format documented at lines 1-22: TS-side (Aletheia) writes `epii_autoresearch_inbox_entry` JSONL lines per session under `${VAULT}/Empty/Present/{day_id}/${session_id}.jsonl`; Rust-side (this module) reads via `InboxStore::list_pending`, tagging each entry with `${session_id}#L${line_index}`. **Six Aletheia subagents' .md profiles are `include_str!`-embedded** at lines 32-39 (anansi, moirai, janus, mercurius, agora, zeithoven) plus their RUPA.md companions at lines 40-49 — the S4-side Aletheia substrate is **compiled into** the S5 autoresearch crate to keep their identity contracts inseparable from the disclosure-lineage that surfaces them.
  - `MoiraiMode` (lines 51-57): `Klotho | Lachesis | Atropos`.
  - `DisclosureLineageStage` (lines 59-69), `DisclosureLineage` (lines 71-80+): `lineage_id`, `source_subagent`, `moirai_mode`, `stages`, `tool_refs` — the structured trace surfacing Aletheia work to Epii review.

- `src/recompose.rs` (90 LOC): the **Möbius recompose pass** — produces next-cycle compose hints from the inbox-store, closing the 5→0 return seam in code form.

- `src/adapters.rs` (814 LOC): **non-Aletheia pipeline reports** — `NonAletheiaPipelineReport` enum (lines 18-28) with 7 variants:
  - `AnuttaraShaclFailureReport` (lines 30-40)
  - `ParashaktiEmbeddingDriftReport` (lines 42-53)
  - `ParashaktiMeaningPacketProfileReport` (lines 55-64)
  - `ParamasivaCorpusRefreshReport` (lines 66-79)
  - + 3 more (Mahamaya runtime training, Nara dialogic voice signal, Epii self-observation) — these are the **5 non-Aletheia surfacing pipelines** that feed the autoresearch loop from outside Aletheia's lineage.

- `tests/` directory (~3900 LOC):
  - `improvement_loop.rs` (648 LOC), `m5_4_acceptance_release_gate.rs` (563 LOC), `epii_recursive_spine_inspector.rs` (357 LOC), `non_aletheia_adapters.rs` (324 LOC), `surfacing_routing.rs` (291 LOC), `orchestration_continuity.rs` (280 LOC), `spine_schema.rs` (223 LOC), `aletheia_expert_lineage.rs` (221 LOC), `training_runtime_capacity_slices.rs` (199 LOC), `recompose_pass.rs` (190 LOC), `z_cycle_smoke.rs` (182 LOC), `deterministic_capacity_slices.rs` (154 LOC), `nara_anima_voice_governance.rs` (154 LOC), `capacity_workflow_registry.rs` (144 LOC), `inbox_contract.rs` (132 LOC), `baseline_state_fixture.rs` (95 LOC).

### 2.6 S5-5' — Canon promotion via Hen dry-run + epi-logos plugin

**Substrate split:** mutation law lives in `Body/S/S1/hen-compiler-core::plan_compile`; S5 calls it only in `dry_run` mode via `EpiiAgentAccess::plan_promotion_dry_run` (`epii-agent-core/src/lib.rs:577-582`). The **non-dry-run path is intentionally locked at the Epii access layer** — only Hen-direct callers may execute mutation.

**`Body/S/S5/plugins/epi-logos/`** — the canonical skill/resource body for Epii's pedagogy spine. Contains `agents/`, `commands/`, `hooks/`, `resources/`, `skills/`, plus vendored `.pi-agent`, `.claude-plugin`, `.codex` packaging. Scoped to PI-runtime `epii` via `Body/S/S5/plugins/registry.jsonl`.

**Gateway methods designed but NOT YET registered** per `S5'-SPEC.md:51` and `S5-SPEC.md:141-143`: `s5'.mef.*`, `s5'.ql.*`, `s5'.gnosis.*` (only `s5'.gnosis.context.retrieve` exists; `ingest/query/notebook/status` are CODE-PENDING per Wave-A M5 6.1 / Wave-B 12.2), `s5'.explain`, `s5'.teach`, `s5'.seed.generate`.

---

## 3. M' Dependency Map

The M' surfaces that consume S5/S5' substrate, with cross-references to the eight M' architecture docs.

| M' consumer | S5 substrate consumed | Consumption shape | Cross-ref |
|---|---|---|---|
| **M5-0' Gnostic Library** (M5-ARCHITECTURE §1, §2.1) | `epi-gnostic/epi_gnostic/{cli.py, wrapper.py, graphiti_service.py, enrichment/, storage/, cypher/}`; `epi-kbase-core/`; `epi-kbase/` | RAG ingest/query via designed `s5'.gnostic.*` gateway (NOT yet registered) — the spec-named method route to be added to `Body/S/S3/gateway-contract/src/lib.rs` per Tranche 06.1/12.2 | [[M5-ARCHITECTURE]] §1 row M5-0', §2.1; [[wave-a-m5-reconciliation-matrix]] row 2 |
| **M5-1' Canon Studio** | `epi-kbase/src/skill-search.ts`, `epi-kbase/src/sem-search.ts`, `epi-kbase-core/src/kbase.rs` (Smart Connections autocomplete corpus) | TS package consumed via Theia extension; also depends on S1 `smart_env.rs::suggest_link_candidates` | [[M5-ARCHITECTURE]] §1 row M5-1' (DA-M5-1 — extension not yet authored) |
| **M5-2' Backend Studio** | `epi-gnostic` (LSP-inspect path of the python pkg), `epi-kbase-core` (Rust crate among the S-stack LSP targets) | LSP contributions (rust-analyzer + pylsp) at Theia layer; reads `coordinate`-tagged file annotations from epi-gnostic CoordinateEnricher | [[M5-ARCHITECTURE]] §1 row M5-2' (DA-M5-2) |
| **M5-3' IDE Shell + Playable Bimba** | Indirect — consumes `epi-gnostic` namespace metadata for graph-viewer namespace boundaries (`bimba | gnosis | etymology | pratibimba` per Wave-A M5 row 11) | Read-only via the M0 graph-viewer; not a direct S5 consumer | [[M5-ARCHITECTURE]] §1 row M5-3' |
| **M5-4' OmniPanel Pi-runtime monitoring** | `epii-autoresearch-core/capacity_workflows.rs::capacity_workflow_registry()` (six lanes), `epii-review-core::ReviewStore` (inbox + governance gates), `epii-agent-core::M5WorkbenchSnapshot` + `EpiiAgentSnapshot`, `epii-agent/agent-contract.json` (11 methods, 4-tuple deposit contract) | M5-extension reads `buildM5EpiiSurface(input)` (m5-epii/src/common/epii-surface.ts:306) which consumes `M5WorkbenchSnapshot`; OmniPanel surfaces the 6 `BodyCapacityAlertDto` + 6 `PratibimbaControlRoomCapacityDto` instances | [[M5-ARCHITECTURE]] §1 row M5-4', §2.4; [[wave-b-agentic-layer-matrix]] B15, CP-B-4 |
| **M5-5' Logos Atelier** | `epi-gnostic` over `etymology` graph namespace (designed; Wave-A M5 6.2 names the unowned surface) | Scent-following workspace consumes Aletheia tools via `s5'.gnostic.*` (Tranche 06.1) + `s4'.mediation.route` to Aletheia subagents | [[M5-ARCHITECTURE]] §1 row M5-5'; [[wave-a-m5-reconciliation-matrix]] DA-M5-3 / O-M5-2 |
| **M4-4 Personal Cymatic Field** (integrated 4-5-0 plugin) | `epii-agent-core::DepositRequest` for Nara protected-corpus deposits with `pii_stripped_body` per `capacity_workflows.rs::NaraExchangeRecord` (lines 195-216) | Anima deposits Nara dialogic-voice signals as `DepositType::ValidationGate` items with `governance_level: Advisory`, gate `AnimaPrimary` (capacity registry lines 484-507) | [[M4-ARCHITECTURE]] (Nara Atomic Identity); [[wave-a-m5-reconciliation-matrix]] row 14 |
| **Integrated 4-5-0 Recognition seam** (Body/M/epi-theia/extensions/plugin-integrated-4-5-0) | `epii-review-core::GovernanceProfile` with `category: CanonRecognitionPublicationGate`, `governance_level: PublicationBlocking` per `capacity_workflow_registry` Epii-on-Epii entry (lines 508-543) | Canon-promotion of Jiva-is-Śiva surface claims (137 = 64+72+1) routes through Epii review with `requires_human` gate at `epii-review-core/src/lib.rs:471-489` | [[INTEGRATED-4-5-0-ARCHITECTURE]] §canon-recognition |
| **kernel-bridge readiness panel** | `epii-autoresearch-core::KernelEvidence` advisory-only channel (`KERNEL_EVIDENCE_PRIVACY` line 27) + `KernelReviewVisibility` in review items | Wave-B kernel-bridge writes safe-public kernel projections; S5 forbids re-publishing protected kernel fields per `epii-review-core/src/lib.rs:522-529` | [[kernel-bridge-architecture]]; [[wave-b-kernel-bridge-matrix]] CP-B-2 |

---

## 4. Contract Surface (exposed, missing, profile-bus)

### 4.1 Currently registered gateway methods

From `Body/S/S3/gateway-contract/src/lib.rs` (verified line numbers):

| Method | Lines (registration + handler) | S5 backing |
|---|---|---|
| `s5'.anuttara.diagnose` | 156, 524, 1284 | Cross-S routing into M0' diagnostic |
| `s5'.improve.status` | 209, 1290 | `ImprovementStore::status` |
| `s5'.improve.propose` | 210, 1296 | `ImprovementStore::propose` |
| `s5'.improve.evaluate` | 211, 1302 | `ImprovementStore::evaluate` |
| `s5'.improve.promote` | 212, 1308 | `ImprovementStore::promote` (review-gated dry-run only) |
| `s5'.improve.history` | 213, 1314 | `ImprovementStore::history` |
| `s5'.epii.status` | 214, 1320 | `EpiiAgentAccess::snapshot` |
| `s5'.epii.deposit` | 215, 1326 | `EpiiAgentAccess::deposit` |
| `s5'.epii.runtime.context` | 216, 1332 | `EpiiAgentAccess` runtime context |
| `s5'.gnosis.context.retrieve` | 217, 1338 | epi-gnostic context retrieval (single method only) |
| `s5.episodic.search` | 218, 1344 | Graphiti S3' runtime |
| `s5.episodic.deposit` | 219, 1350 | Graphiti S3' runtime |
| `s5.episodic.kernel_resonance.deposit` | 220, 1356 | Kernel resonance evidence deposit |
| `s5.episodic.kernel_profile_observation.deposit` | 221, 1362 | Kernel profile observation deposit |
| `s5'.review.inbox` | 222, 1368 | `ReviewStore::inbox` |
| `s5'.review.submit` | 223, 1374 | `ReviewStore::submit` |
| `s5'.review.resolve` | 224, 1380 | `ReviewStore::resolve` (requires_human guard) |
| `s5'.review.history` | 225, 1386 | `ReviewStore::history` |

Total: **18 registered gateway methods** (15 `s5'.*` + 3 `s5.episodic.*`). Eleven of these are mirrored in `agent-contract.json:14-26` as Epii's authoritative method registry.

### 4.2 Designed but unregistered (CODE-PENDING)

Per `S5'-SPEC.md:51` and Wave-A M5 / Wave-B agentic-layer matrices:

- **`s5'.gnosis.ingest`**, **`s5'.gnosis.query`**, **`s5'.gnosis.notebook`**, **`s5'.gnosis.status`** — substrate (`epi-gnostic` package) is fully landed; the gateway-side registration over `Body/S/S5/epi-gnostic/epi_gnostic/cli.py` is the **named integration blocker**. (Tranche 06.1 / 12.2.) Anti-greenfield: do NOT rebuild RAG.
- `s5'.mef.*`, `s5'.ql.*` — pedagogy/MEF surfaces; designed in `S5'-SPEC.md:51`.
- `s5'.explain`, `s5'.teach`, `s5'.seed.generate` — Epii pedagogy and seed-return surfaces; require epi-logos plugin extension.

### 4.3 Profile-bus integration

S5 receives kernel projections from the kernel-bridge profile-bus as **advisory-only** evidence:

- `KernelEvidence` (`epii-autoresearch-core/src/lib.rs:116-127`) is `advisory_only: true` per line 122-123; **cannot decide keep/discard** per `S5-SPEC.md:126`.
- `KernelTrajectoryRef` (`lib.rs:129-141`) carries `session_key`, `day_id`, `now_path`, `spacetimedb_session_surface`, `spacetimedb_global_surface`, `graphiti_arc_id` — the cross-runtime trajectory anchors.
- `KernelReviewVisibility` (`epii-review-core/src/lib.rs:204-214`) enforces projection privacy `"safe-public-current-kernel-tick"` and forbids `bioquaternion` / `resonanceSquareEmphasis` re-publication.

**Gap**: `MathemeHarmonicProfile.resonance72`, `planetaryChakral`, `mahamaya`, `pointerAnchor`, `depositionAnchor` are **CODE-PENDING at the kernel-bridge layer** (Wave-A M5 CP-M5-2, Wave-B CP-B-2). S5 cannot test the canon `137 = 64 + 72 + 1` recognition flow end-to-end until these land. Tranche 10.x owns the unblock.

### 4.4 Cross-crate type leakage to audit

- `epi-s5-epii-review-core` exports `GateKind`, `GovernanceLevel`, `ReviewCategory`, `ReviewDecision`, `ReviewStore` which `epii-autoresearch-core/src/{lib.rs:8-10, capacity_workflows.rs:8-12}` re-uses. **Acceptable** — review-state law is the canonical authority. **Not** a circular dep.
- `epi-s1-hen-compiler-core` exports `plan_compile`, `CompilePlanRequest`, `ExecutorKind`, `HenTimestamp`, `TargetAgent` consumed at `epii-autoresearch-core/src/lib.rs:5-7`. **One-way** — S5 calls S1 for dry-run compilation. Acceptable.
- `portal-core` (S0) is consumed at `epii-autoresearch-core/src/inbox.rs:24` for `VakAddress`. **One-way** read of S0 type. Acceptable.

---

## 5. Code Cleanup + Modularisation Findings

The S5 substrate is functionally complete. Findings below are quality-of-life refactors with named scope, current shape, proposed refactor, benefit, and blast radius (risk to M' consumers).

### 5.1 File-level splits

**F1. `epii-autoresearch-core/src/capacity_workflows.rs` (2584 LOC) — split by concern.**
- Current shape: one file holding (a) `CapacityId` + registry entry struct + the registry-table function; (b) per-capacity DTOs (`BodyCapacityAlertDto`, `PratibimbaControlRoomCapacityDto`); (c) Nara consent-corpus governance (`NaraExchangeRecord`, `NaraVoiceGovernanceRequest/Receipt`); (d) recursive-self-review protocol records (`RecursiveReviewProtocolKind`, `EpiiRecursiveGovernanceReceipt`); (e) spine inspector snapshot; (f) gate-weakening request/receipt; (g) Aletheia expert lineage card; (h) the actual `route_capacity_workflow` runner.
- Proposed refactor: extract into a `capacity_workflows/` mod-dir with `mod.rs` (re-exports) + `registry.rs` (the table, ~250 LOC), `nara_voice.rs` (Nara consent governance, ~150 LOC), `recursive_review.rs` (recursive protocols + gate weakening, ~150 LOC), `spine_inspector.rs` (spine state DTOs, ~150 LOC), `aletheia_lineage.rs` (`AletheiaExpertLineageCard`, ~50 LOC), `runner.rs` (the actual workflow execution).
- Benefit: testability per concern; smaller compilation units; the 2584 LOC monolith currently re-compiles when any single concern changes.
- Blast radius: **LOW** — the existing re-exports at `lib.rs:23-25` and `capacity_workflows::` namespace remain stable; no M' consumer imports the inner types directly.

**F2. `epii-autoresearch-core/src/lib.rs` (2049 LOC) — split type-defs out of the façade.**
- Current shape: the crate root holds all top-level type definitions (LoopState, ImprovementRun, ArtifactRef, EvidenceSourceRef, KernelEvidence, OrchestrationRecord, etc.) plus the `ImprovementStore` impl.
- Proposed refactor: extract `mod types` (~700 LOC of pure types — `ArtifactRef`, `LoopState`, `ImprovementDecision`, `ProposeRequest`, `EvidenceSourceRef`, `EvaluationEvidence`, `EvaluationResult`, `ImprovementRun`, `ImprovementVector`, `ImproveStatus`), `mod kernel_evidence` (~250 LOC — `KernelEvidence*`), `mod orchestration` (~400 LOC — `OrchestrationState`, `ReviewStage`, `RetryPolicy`, `DiscardReason`, `OrchestrationRecord`, `CreateOrchestrationRequest`, `TransitionOrchestrationRequest`, `IntegrationVerificationEntry`, `ContinuityHint`, `CrossCycleContinuity`), `mod promotion` (~200 LOC — `CompilerInvocationSummary`, `CompilePlanSummary`, `PromotionHenTimestamp`, `PromoteRequest`, `PromotionPlan`). Keep `lib.rs` as the façade + `ImprovementStore` impl (~500 LOC).
- Benefit: locating a type takes O(1) module navigation; review-readability of the type surface; PR diffs narrower.
- Blast radius: **LOW** — all current public exports remain re-exported from `lib.rs`. M' consumers (especially `epii-agent-core` which imports `ArtifactRef, CandidateRecord, ContinuityHint, ImprovementRun, ImprovementStore, ImprovementVector, M2PrimeMeaningPacket, OrchestrationRecord, PromoteRequest, PromotionPlan, ProposeRequest, RouteRecord, SurfacedCandidateReceipt, TargetSubsystem`) keep working.

**F3. `epii-agent-core/src/lib.rs` (1170 LOC) — split DTO definitions from agent-access impl.**
- Current shape: `EpiiAgentAccess` impl + all `M5WorkbenchSnapshot` / `M5ReviewPaneDto` / `M5SpineStateDto` / `M5CandidateDetailDto` / `M5ArtifactRefDto` / `M5PromotionDryRunDto` / `DepositRequest` / `DepositReceipt` DTOs in one file.
- Proposed refactor: `mod m5_workbench` for the M5'-extension DTOs (M5*Dto family ~450 LOC), `mod deposits` for the deposit family (DepositType, DepositArtifact, DepositRequest, TypedCandidateDepositRequest, DepositReceipt, ReviewItemReceipt, EpiiInboxSurface ~200 LOC), keep `lib.rs` as `EpiiAgentAccess` impl façade.
- Benefit: the M5'-extension consumer (`epii-surface.ts`) reads from a clearly-named module surface.
- Blast radius: **LOW** — re-exports keep external API stable.

### 5.2 Module-level — DTO duplication audit

**M1. `M5ArtifactRefDto` (epii-agent-core/lib.rs:181-193) vs `ArtifactRef` (epii-autoresearch-core/lib.rs:31-37).**
- Current shape: `ArtifactRef` has `path, coordinate, kind`; `M5ArtifactRefDto` has `uri, namespace, label, coordinate, kind, privacy, readiness, review_required` (8 fields). They are NOT duplicates — `M5ArtifactRefDto` is the UI-shaped enrichment of `ArtifactRef` with namespace discriminator and readiness flags. The conversion happens at `epii-agent-core/src/lib.rs` (helper functions referenced by `candidate_detail_dto` and `review_item_dto`).
- Proposed: document the relationship in a doc-comment on `M5ArtifactRefDto`; add a `From<ArtifactRef>` or `try_from` constructor with default `privacy: "review_required", readiness: "pending"` to surface the lossy conversion explicitly.
- Benefit: makes the bimba↔pratibimba (substrate↔surfacing) relationship readable in code.
- Blast radius: **NONE** — additive.

**M2. `EvidenceSourceRef` (epii-autoresearch-core/lib.rs:75-83) vs `M5ArtifactRefDto`.**
- Current shape: `EvidenceSourceRef` is `kind, uri, coordinate, summary`. `M5ArtifactRefDto` is the UI-shaped artifact. They overlap on `uri` (~= `path`/`uri`) and `coordinate`. Two parallel but distinct contracts.
- Proposed: keep separate (each carries different semantics); add cross-reference doc comments.
- Blast radius: **NONE**.

### 5.3 Type-level — unify the governance gate-family

**T1. Three parallel governance enums in epii-review-core (lib.rs:46-75) — `ReviewCategory` (7 variants) × `GateKind` (6) × `GovernanceLevel` (5).** The matrix is *not* full — only certain (category, gate_kind, governance_level) triples are valid (encoded implicitly in `requires_human_resolution` at lines 460-489).
- Proposed refactor: introduce a typed `GovernanceTriple` newtype with a `const fn` validator (or a curated `match` of allowed triples), so invalid combinations are rejected at construction. Alternative: keep the open enum trio but add a contract-test (`test_governance_triples_consistent`) that enumerates all valid combinations.
- Benefit: makes governance-misconfiguration a compile-time error (or a single test failure) rather than silently-wrong-at-runtime.
- Blast radius: **MEDIUM** — Wave-A M5 6.x and Wave-B 12.x tranches build new governance triples; the typed-newtype path would surface in their PRs.

### 5.4 API-level — surface tightening

**A1. `EpiiAgentAccess::resolve_review` (lib.rs:544-556) — string-typed `source_agent` parameter.**
- Current shape: takes `source_agent: &str` and matches on `"human" | "epii" | "anima" | "aletheia"`.
- Proposed refactor: introduce a `ResolutionAgent` enum (`Human | Epii | DepositOnly(DepositActor)`) where `DepositActor = Anima | Aletheia`. Make the source-actor authorisation a compile-time invariant of the type.
- Benefit: removes the failure-mode where a typo in `source_agent` would silently fall through to the "unsupported" error path.
- Blast radius: **LOW** — gateway layer reconstructs `source_agent` from envelope metadata; one call site update.

**A2. `EpiiAgentAccess::plan_promotion_dry_run` (lib.rs:577-582) — runtime dry_run check.**
- Current shape: checks `request.dry_run` at runtime; rejects if false.
- Proposed refactor: introduce a `DryRunPromotionRequest` newtype wrapping `PromoteRequest` with `dry_run: true` enforced by construction. Provide `try_into` that yields the dry-run wrapper from the open `PromoteRequest`.
- Benefit: the "non-dry-run path is locked" invariant moves from runtime-check to type-level. The Hen `plan_compile` call site can also accept the wrapper type.
- Blast radius: **LOW**.

**A3. Public re-exports at `epii-autoresearch-core/src/lib.rs:22-25` — `inbox` and `recompose` deliberately not re-exported.**
- Current shape: comment at line 20-21 documents this — "callers namespace via `inbox::` / `recompose::` to keep the seam topology visible at import sites."
- Proposed: **preserve as-is**. This is intentional API discipline; do not "fix" by adding re-exports.

### 5.5 Crate-level

**C1. `epi-kbase` (TS) + `epi-kbase-core` (Rust) — confirm the FFI seam.**
- Current shape: TS package `epi-kbase` exports `bindKbaseProject, kbaseSearch, skillSearch, hasHighRelevanceMatch`; Rust crate `epi-kbase-core` has parallel modules `{kbase, project, vimarsa, script, parse, types}`. Per `wave-b-agentic-layer-matrix.md` B10, the TS path depends on `bkmr` CLI on PATH.
- Proposed audit: verify which side of the TS/Rust pair is canonical for each function. Recommended: TS layer = consumer (Theia + ta-onta carriers per `wave-b B10`); Rust layer = core algorithm + bkmr subprocess. Document at `epi-kbase-core/Cargo.toml` and `epi-kbase/package.json` levels.
- Benefit: prevents drift between TS and Rust implementations of "the same" function.
- Blast radius: **LOW** — docs-only unless implementations actually drift.

**C2. `epi-gnostic` workspace organization.**
- Current shape: single Python package under `epi_gnostic/` with submodules `enrichment/`, `storage/`. Tests at `tests/`. Scripts at `scripts/`. The `graphiti_service.py` (534 LOC FastAPI wrapper) lives at the top level alongside the LightRAG wrapper (`wrapper.py`).
- Proposed refactor: extract `graphiti_service.py` into a sub-package `epi_gnostic/graphiti/` (with `service.py`, `monkeypatches.py` for the `_patch_graphiti_group_id` logic at lines 105-130, `config.py` for graphiti-specific config). The temporary HTTP-wrapper status per `S5-SPEC.md:104-105` ("not canonical architecture") makes this isolation valuable for the future migration to `Body/S/S3/graphiti-runtime`.
- Benefit: marks the transitional code as transitional; eases the S3' migration.
- Blast radius: **LOW** — `pyproject.toml` script entry `epi-graphiti = "epi_gnostic.graphiti_service:main"` needs updating to `epi_gnostic.graphiti.service:main`.

### 5.6 Test surface — gaps

**TS1. `s5'.gnosis.*` end-to-end test — does not exist (because the methods are not registered).**
- Proposed: add a Rust integration test scaffold at `epi-gnostic/tests/test_gateway_integration.py` that asserts the gateway-side method registration ONCE Tranche 06.1/12.2 lands.

**TS2. `epi-kbase` TS test coverage.** No test runner declared in current artefact inventory; verify via `cat Body/S/S5/epi-kbase/package.json` for test scripts.
- Proposed: ensure `kbaseSearch`/`skillSearch` have unit tests with bkmr-mocked fixtures.

**TS3. Cross-crate governance-triple consistency.** No test asserts that the autoresearch crate's `capacity_workflow_registry()` produces (category, gate_kind, governance_level) triples that are all *individually* consistent with `requires_human_resolution` (review-core/lib.rs:460-489).
- Proposed: add `cargo test -p epi-s5-epii-autoresearch-core --test capacity_workflow_registry` (file exists at 144 LOC; verify it asserts this). If not, extend.

**TS4. M5WorkbenchSnapshot schema-version freezing.** `M5_WORKBENCH_SCHEMA_VERSION: u16 = 1` is exported (line 17). Add a snapshot/golden-file test in `epii-agent-core/tests/m5_workbench_schema_v1.json` so any unintentional shape change is caught.

---

## 6. Boundary Contracts

### 6.1 What S5 produces

- **Review state law**: `ReviewStore` (epii-review-core) is the canonical durable inbox. Wire form: `ReviewInboxItem`, `ReviewResolution`. Gateway: `s5'.review.{inbox,submit,resolve,history}`.
- **Improvement state law**: `ImprovementStore` (epii-autoresearch-core) owns the keep/discard, dry-run-promotion, source-referenced evidence model. Gateway: `s5'.improve.{status,propose,evaluate,promote,history}`.
- **Epii agent-access**: `EpiiAgentAccess` (epii-agent-core) owns the `EpiiAgentSnapshot` and `M5WorkbenchSnapshot` read-DTOs and the four `DepositType` write-paths. Gateway: `s5'.epii.{status,deposit,runtime.context}`.
- **Gnostic context retrieval**: single method `s5'.gnosis.context.retrieve` over epi-gnostic. Production-ingest/query routes are CODE-PENDING.
- **Kbase corpus** (S5 base, not gateway-registered): `bindKbaseProject` / `kbaseSearch` / `skillSearch` consumed in-process by ta-onta carriers per Wave-B B10.
- **Six-capacity workflow registry**: `capacity_workflow_registry()` returns the canonical six-entry registry; `M5_4_GOVERNANCE` consumes in `capability-matrix.json`.
- **Möbius recompose hints**: `recompose_pass` produces next-cycle compose hints from the inbox; consumed by S5'-internal continuity hints.

### 6.2 What S5 consumes from other S layers

- **From S0**: `portal-core::VakAddress` (epii-autoresearch-core/inbox.rs:24); `portal-core::KernelProjection` advisory channel for kernel evidence; six Aletheia-subagent .md profiles `include_str!`-embedded from `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/*.md` (inbox.rs:32-49).
- **From S1**: `epi-s1-hen-compiler-core::{plan_compile, CompilePlanRequest, ExecutorKind, HenTimestamp, TargetAgent}` (epii-autoresearch-core/lib.rs:5-7) for dry-run canon promotion. Also `Body/S/S1/hen-compiler-core::wikilinks.rs::suggest_link_candidates` (consumed via TS bridge by Canon Studio).
- **From S2**: `Body/S/S2/graph-services/src/retrieval/{graphrag.rs, hybrid.rs, coordinate.rs}` for namespace-aware bimba retrieval (consumed by epi-gnostic's neo4j-vector storage).
- **From S3**: gateway-contract registration; `Body/S/S3/graphiti-runtime` is the target home for the transitional `epi-gnostic/graphiti_service.py`. S3' Redis context provides session-key hot state.
- **From S4**: Aletheia subagent .md profiles + their RUPA companions (inbox.rs:32-49); `Body/S/S4/pi-agent/lib/axiom-translate.ts` per DR-B-2 ratification; Anima dispatch is the upstream of all `DepositType::ReviewItem` / `DepositType::ImprovementRequest` / `DepositType::ValidationGate` / `DepositType::AletheiaCrystallisation` deposits.

### 6.3 Namespace-respect invariants

Per Wave-A M5 row 11 and `S5-SPEC.md:104`: the four graph namespaces `bimba | gnosis | etymology | pratibimba` must not be collapsed. S5 substrate enforces this via:
- `epi-gnostic/epi_gnostic/storage/neo4j_vector.py` uses `workspace` label (default `"gnostic"`) for multi-tenant isolation (lines 76-80).
- `epi-gnostic/epi_gnostic/enrichment/coordinator.py` `assign_direct` MERGE creates `(:gnostic)-[:MAPS_TO_COORDINATE]->(:Bimba)` — cross-namespace EDGE, not node-merge.
- `M5ArtifactNamespace` enum (epii-agent-core/lib.rs:195-207) discriminates UI surfaces across 9 namespaces (the 4 graph ones + `Vault | Repo | Run | Review | Improvement`).

---

## 7. Theia Integration Points

The Theia extensions in `Body/M/epi-theia/extensions/` that consume S5 (verified by ls):

| Theia extension | S5 surface consumed | Bridge mechanism | Status |
|---|---|---|---|
| **`m5-epii`** | `M5WorkbenchSnapshot` via `buildM5EpiiSurface(input)` at `src/common/epii-surface.ts:306`; widget at `src/browser/m5-epii-widget.tsx:80` | kernel-bridge `invokeCapability("s5'.epii.runtime.context")` → JSON → `buildM5EpiiSurface` | LANDED |
| **`agentic-control-room`** | `s4'.mediation.route` + `s5'.review.submit` + (designed) six-capacity views over `capacity_workflows.rs` | gateway-bridge | Six-capacity views CODE-PENDING (Tranche 06.3 / 12.5) |
| **`omnipanel-shell`** | repurposed ACR substrate per `15-ui-design-foundations.md`; consumes `EpiiAgentSnapshot` (`s5'.epii.status`), review-pane DTOs, improvement-vector DTOs | gateway-bridge | LANDED (reframe per Tranche 15.2) |
| **`m4-nara`** | `DepositRequest` with `DepositType::ValidationGate` for Nara consent-corpus deposits | via Anima dispatch then `s5'.epii.deposit` | Anima-side wiring pending |
| **`plugin-integrated-4-5-0`** | Canon-recognition gate (`category: CanonRecognitionPublicationGate`) for 4/5/0 Jiva-is-Śiva promotion | via Anima dispatch then `s5'.review.submit` | LANDED for substrate; recognition-UX gate pending |
| **NEW `library-pane`** (Tranche 06.1 dep) | `s5'.gnostic.{ingest,query,notebook,status}` — UNREGISTERED | requires gateway registration first | CODE-PENDING |
| **NEW `canon-studio`** (Tranche 06.4 / DA-M5-1) | `epi-kbase/src/skill-search.ts` + `epi-kbase/src/sem-search.ts` + S1 `smart_env.rs::suggest_link_candidates` | TS package import; S1 via gateway | DOC-AHEAD (no extension) |
| **NEW `backend-studio`** (Tranche 06.4 / DA-M5-2) | LSP contributions over `epi-gnostic` (pylsp), `epi-kbase-core` (rust-analyzer), `epii-autoresearch-core` (rust-analyzer); reads `coordinate`-tagged file annotations from CoordinateEnricher | LSP wiring | DOC-AHEAD (no extension) |
| **NEW `logos-atelier`** (Tranche 06.2 / O-M5-2) | `epi-gnostic` over `etymology` namespace + Aletheia tools via `s4'.mediation.route` | gateway-bridge | ORPHAN (no owner) |

### Bridge methods/types needed

1. **`KERNEL_BRIDGE_API.invokeCapability("s5'.gnosis.*")`** — depends on gateway registration (Tranche 06.1 / 12.2).
2. **Recursive-self-review classifier surface** on `submitReviewDecision` — S5 substrate has `RecursiveReviewProtocolKind` (capacity_workflows.rs:240-246); ACR `enforceHumanGate` extension is Tranche 12.4. The bridge needs to pass `recursive_self_review: bool` through to S5's `requires_human_resolution`.
3. **`M5WorkbenchSnapshot` schema versioning** — `M5_WORKBENCH_SCHEMA_VERSION = 1` is exported but no version-handshake at the kernel-bridge layer. Add `bridge.versionCheck("m5-workbench", 1)`.
4. **Six-capacity DTO surfacing** — `BodyCapacityAlertDto` + `PratibimbaControlRoomCapacityDto` (capacity_workflows.rs:68-99) are spec'd; bridge needs to surface them via a dedicated method (e.g. `s5'.improve.capacity.snapshot` returning `CapacityWorkflowSnapshot` at line 102).

---

## 8. Anti-Greenfield Audit

| Item | Status | Notes |
|---|---|---|
| `epi-gnostic` Python RAG production pipeline | **LANDED** | Consume as-is. The transitional `graphiti_service.py` migrates to `Body/S/S3/graphiti-runtime` per S3' authority. |
| `epi-kbase` (TS) + `epi-kbase-core` (Rust) | **LANDED** | Consume as-is. C1 cleanup is optional documentation refinement. |
| `epii-review-core` (durable review inbox + governance + requires_human guard) | **LANDED** | Consume as-is. T1 governance-triple type tightening is optional. |
| `epii-autoresearch-core` (autoresearch spine + six capacity workflows + adapters + recompose Möbius pass) | **LANDED** | Consume as-is. F1/F2 file-splits are optional. |
| `epii-agent-core` (Epii read-access core, M5WorkbenchSnapshot, DepositRequest pathway) | **LANDED** | Consume as-is. F3 DTO/impl split is optional. |
| `epii-agent` (agent contract.json + contract-ledger) | **LANDED** | Consume as-is. |
| `Body/S/S5/plugins/epi-logos` + `registry.jsonl` (vendor-promoted resource package) | **LANDED** | Consume as-is. |
| `s5'.gnosis.{ingest,query,notebook,status}` gateway methods | **CODE-PENDING (named blocker)** | Tranche 06.1 / 12.2. The substrate is landed; only the 4-line gateway-contract registration + dispatch wiring are missing. NOT a greenfield rebuild. |
| Non-dry-run canon promotion path through Hen | **CODE-PENDING (named blocker)** | The dry-run path is enforced at `epii-agent-core/lib.rs:577-582`. Production canon mutation must remain gated behind direct Hen-caller authorisation; the S5'/Epii path is intentionally read-only. |
| `s5'.mef.*`, `s5'.ql.*`, `s5'.explain`, `s5'.teach`, `s5'.seed.generate` | **CODE-PENDING (epi-logos plugin extension)** | Designed in S5'-SPEC; substrate is `Body/S/S5/plugins/epi-logos/skills`. Wiring through gateway is the named integration item. |
| `library-pane` Theia extension | **NEW (M' product surface)** | Genuine net-new at the M' product layer; depends on Tranche 06.1. |
| `canon-studio` Theia extension | **NEW (M' product surface)** | Genuine net-new. |
| `backend-studio` Theia extension | **NEW (M' product surface)** | Genuine net-new. |
| `logos-atelier` Theia extension | **NEW (M' product surface) + named carrier** | Genuine net-new + names the owning carrier (consume Aletheia + epi-gnostic etymology namespace). |

**No forbidden greenfield items.** The cleanup proposals in §5 are all refactor-with-named-scope.

---

## 9. Test Criteria (acceptance commands)

Per sub-coordinate:

### S5-0' (Epii agent-access)
```bash
cargo test -p epi-s5-epii-agent-core --test agent_access
cargo test -p epi-s5-epii-agent-core --test full_spine_acceptance
test -f Body/S/S5/epii-agent/agent-contract.json
jq '.gateway_methods | length' Body/S/S5/epii-agent/agent-contract.json   # expect: 11
jq '.accepted_deposits_from_anima | length' Body/S/S5/epii-agent/agent-contract.json   # expect: 4
```

### S5-1' (review-core)
```bash
cargo test -p epi-s5-epii-review-core --test review_inbox
cargo test -p epi-s5-epii-review-core --test review_governance
# requires_human guard regression:
cargo test -p epi-s5-epii-review-core requires_human
```

### S5-2' (gnostic + kbase)
```bash
pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py -q
pytest Body/S/S5/epi-gnostic/tests/test_cross_namespace.py -q
pytest Body/S/S5/epi-gnostic/tests/test_neo4j_vector.py -q
pytest Body/S/S5/epi-gnostic/tests/test_wrapper.py -q
pytest Body/S/S5/epi-gnostic/tests/test_config.py -q
cargo check -p epi-s5-epi-kbase-core
pnpm --filter epi-kbase test    # if package.json declares test script (audit)
# Embedding-dim invariant:
grep -rn "EMBED_DIMS\|embedding_dim" Body/S/S5/epi-gnostic/ | grep -v __pycache__   # expect: single 3072 value
```

### S5-3' (Graphiti governance)
```bash
# S5 invocation surface only; runtime is S3'.
# Verify Graphiti wrapper monkey-patch behaviour:
pytest Body/S/S5/epi-gnostic/tests/ -k graphiti
# Verify the 4 episodic gateway methods registered:
grep -n "s5.episodic" Body/S/S3/gateway-contract/src/lib.rs | wc -l   # expect: ≥8
```

### S5-4' (autoresearch spine)
```bash
cargo test -p epi-s5-epii-autoresearch-core --test improvement_loop
cargo test -p epi-s5-epii-autoresearch-core --test m5_4_acceptance_release_gate
cargo test -p epi-s5-epii-autoresearch-core --test epii_recursive_spine_inspector
cargo test -p epi-s5-epii-autoresearch-core --test capacity_workflow_registry
cargo test -p epi-s5-epii-autoresearch-core --test surfacing_routing
cargo test -p epi-s5-epii-autoresearch-core --test recompose_pass
cargo test -p epi-s5-epii-autoresearch-core --test inbox_contract
# Six-capacity invariant:
cargo test -p epi-s5-epii-autoresearch-core --test spine_schema
# Schema version freezing:
cargo test -p epi-s5-epii-autoresearch-core SPINE_SCHEMA_VERSION
```

### S5-5' (canon promotion + Möbius)
```bash
# Verify dry_run lock at agent-access layer:
cargo test -p epi-s5-epii-agent-core plan_promotion_dry_run
# Verify Hen consumption:
cargo check -p epi-s5-epii-autoresearch-core   # transitively uses epi-s1-hen-compiler-core
# Verify epi-logos plugin scoping:
jq '.[] | select(.scope=="epii")' Body/S/S5/plugins/registry.jsonl
```

### Cross-cutting
```bash
# Gateway parity: 18 s5*.* methods landed
grep -nE "(s5'\.|s5\.episodic\.)" Body/S/S3/gateway-contract/src/lib.rs | grep -E "^.*: .*\"s5" | wc -l   # expect: ≥18 in registration array
# Anti-greenfield: no Aletheia agent-contract.json missing-blocker leakage
test ! -f Body/S/S4/ta-onta/aletheia-agent/agent-contract.json   # should NOT exist (memory: tool-guardian, not peer agent)
test -f Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md   # SHOULD exist
```

---

## 10. Cross-Cutting Findings (cycle-3 ledger inputs)

### 10.1 New tranches needed (or existing-tranche extensions)

- **Tranche 06.1 / 12.2** — already exists. **No change.** The substrate is fully landed; only the 4-method gateway registration is the named CODE-PENDING.
- **Extension to Tranche 06.3 / 12.5** — when authoring six-capacity views, also surface a single `CapacityWorkflowSnapshot` gateway method (e.g. `s5'.improve.capacity.snapshot`) returning `body_alerts` + `control_room_panels` + `real_candidate_count` + `real_review_item_count` (capacity_workflows.rs:101-107). Currently the registry is consumable only crate-internal; M5' extension can't read it without one of (a) the snapshot gateway method, (b) widening `EpiiAgentSnapshot`. Recommendation: (a).
- **NEW Tranche S5-CL1 — Audit `pratibimba://system/` URI scheme in `capacity_workflows.rs` `ide_surface_anchor` strings against current Theia shell routes** (`Body/M/epi-theia/`). All six entries (lines 357, 392, 425, 461, 494, 527) currently use the old `pratibimba://system/control-room/capacity/{name}` form. Per stale-text memory ("/pratibimba/system" invariant text is now stale), this either needs to migrate to a new URI scheme OR the migration mapping must be documented.
- **NEW Tranche S5-CL2 — Lift dry-run promotion request to typed wrapper** (A2 in §5.4 above) as a small standalone PR; provides type-level safety for the "non-dry-run path is locked" invariant.
- **NEW Tranche S5-CL3 — Add M5WorkbenchSnapshot schema-version golden test** (TS4 in §5.6) as part of a release-gate.

### 10.2 New orphans

- **`s5'.mef.*` / `s5'.ql.*` / `s5'.explain` / `s5'.teach` / `s5'.seed.generate`** — designed in `S5'-SPEC.md:51`, but no owning Theia extension AND no carrier mapping to `Body/S/S5/plugins/epi-logos/skills`. Either name the carrier or downgrade to "epi-logos plugin internal" non-gateway surface.

### 10.3 New decisions (decision-register candidates)

- **DR-S5-1** — Does the transitional `epi-gnostic/graphiti_service.py` migrate to `Body/S/S3/graphiti-runtime` as a new Rust crate (matching the other graphiti-runtime adapters there), or does it become a Python-side library `epi_gnostic.graphiti.*` consumed by S3 via FFI? Decision affects `Body/S/S5/epi-gnostic/pyproject.toml` `epi-graphiti` binary entry.
- **DR-S5-2** — Recursive-self-review classifier: which layer owns the classification (autoresearch-core has `RecursiveReviewProtocolKind` at `capacity_workflows.rs:240-246`; review-core checks `ReviewCategory::RecursiveSelfModification` at lib.rs:471). Are these duplicate concepts or distinct? Recommendation: review-core's `ReviewCategory` is the canonical authorisation gate; autoresearch-core's `RecursiveReviewProtocolKind` is a finer-grained sub-classifier for the kind of recursive review. Document this in a doc-comment.

### 10.4 Profile-bus extensions surfaced

- **`KernelEvidence.trajectory` is `Optional`** — but for production audit-trail completeness, a kernel evidence record without trajectory should be reviewable as "missing-trajectory" provenance. The current optionality is silent. Consider widening `KernelTrajectoryRef` validation to require *at minimum* `session_key + day_id` whenever advisory evidence is attached.
- **MathemeHarmonicProfile fields (`resonance72`, `planetaryChakral`, `mahamaya`, `pointerAnchor`, `depositionAnchor`)** — confirmed CODE-PENDING at the kernel-bridge layer; S5's canon-recognition `137 = 64 + 72 + 1` flow blocks on these. Cross-link Tranche 10.x.

### 10.5 Theia integration points needed

- Six-capacity DTO surfacing (per Tranche 12.5 / 06.3) — gateway method per §7 bridge-methods item 4.
- `s5'.gnosis.*` registration (Tranche 06.1 / 12.2) — already named.
- Recursive-self-review parameter flow-through (Tranche 12.4) — gateway bridge passes `recursive_self_review: bool` to the requires_human guard.
- M5WorkbenchSnapshot schema-version handshake (§7 item 3) — add `bridge.versionCheck`.

---

## 11. Cross-Reference Index

- **S5/S5' specs**: `[[S5-SPEC]]` (Idea/Bimba/Seeds/S/S5/S5-SPEC.md), `[[S5'-SPEC]]` (Idea/Bimba/Seeds/S/S5/S5'/S5'-SPEC.md), `[[S5-SHARD-INDEX]]`, `[[S5-TRACEABILITY-INDEX]]`.
- **M' architectures**: `[[M5-ARCHITECTURE]]` (Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md), `[[M1-2-ANANDA-VORTEX-ARCHITECTURE]]` (pattern exemplar).
- **Reconciliation matrices**: `[[wave-a-m5-reconciliation-matrix]]`, `[[wave-b-agentic-layer-matrix]]`, `[[wave-b-kernel-bridge-matrix]]`.
- **Cross-domain consumers**: `[[M4-ARCHITECTURE]]` (Nara consent-corpus path), `[[INTEGRATED-4-5-0-ARCHITECTURE]]` (recognition seam canon-promotion).
- **UI grammar**: `[[15-ui-design-foundations]]` (OmniPanel as `/` operator membrane; coordinate-as-nav; profile-tick-clock).
- **Decision register**: `[[13-decision-register]]` (DR-M5-1 / DR-B-2 / DR-B-3 ratifications carried; DR-S5-1, DR-S5-2 proposed in §10.3).

---

*"5 → 0 is not a return to the same; it is the same returned different."* — The Möbius pole.
