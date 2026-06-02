# M-Dev Context Pack - 09.T10

Generated: 2026-06-02T10:42:01.438Z

## Task

- **ID:** 09.T10
- **Title:** Full M5-4 Acceptance And Release Gate (gated by all prior tranches and upstream live-service harnesses)
- **Track:** 09-agentic-mediation-and-operational-capacities.md
- **Computed status:** ready
- **Write scopes:** Body/S/S4/**, Body/S/S5/**, Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md, Idea/Pratibimba/System/**, Idea/Pratibimba/System/extensions/**, Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md, Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/S/S4/pi-agent/README.md`
- `Body/S/S4/pi-agent/agents/anima.md`
- `Body/S/S4/plugins/pleroma/capability-matrix.json`
- `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`
- `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md`
- `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md`
- `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/*.md`
- `Body/S/S4/ta-onta/S4-5p-aletheia/clusters/*/RUPA.md`
- `Body/S/S5/epii-agent/agent-contract.json`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md`
- `Idea/Bimba/Seeds/S/S4/S4'/S4-5'-SPEC.md`
- `Idea/Bimba/Seeds/S/S4/S4-5-SPEC.md`
- `Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/06-zero-one-surface-evolution.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/07-m-extension-individual-tracks.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/08-integrated-plugin-tracks.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/09-agentic-mediation-and-operational-capacities.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md`
- `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md`

## Dependency Context

- 09.T9 - Agentic Control Room And `/body` Surfacing (gated by Track 05 T4/T8, Track 06 T5/T6, and T8.5 Aletheia lineage) (09-agentic-mediation-and-operational-capacities.md)

## Track Source Specs

- [[01-kernel-bridge-and-s0-foundation]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`, "Architectural Keystones", "Tranche 5 - Kernel Bridge Contract Package", "Tranche 7 - Agentic Capability And Observability Feed", "Tranche 8 - End-To-End S0-To-Surface Acceptance Slice", "Dependencies", and "Success Criteria". Track 09 consumes the shared `MathemeHarmonicProfile`, lite/full bridge modes, readiness taxonomy, bridge capabilities, VAK/CF metadata, observability events, and the rule that M5-4 agents receive bounded capabilities rather than raw kernel or private access.
- [[02-s2-bimba-map-population]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`, "Architectural Keystones", "T7 - Coordinate-native graph API parity", "T8 - M5-3 and M5-4 consumption contracts", "Dependencies", and "Success Criteria". Track 09 consumes coordinate-native graph APIs, namespace-aware graph pools, Anuttara syntax provenance, GDS/OWL readiness, source/spec/code/test anchors, and privacy-safe Graphiti handles.
- [[03-s3-gateway-and-spacetimedb]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`, "Architectural Keystones", "Tranche 2 - Gateway WebSocket multiplexer and RPC parity guard", "Tranche 5 - `/body` and Theia kernel-bridge consumption slice", "Tranche 6 - Graphiti runtime compatibility and temporal reference bridge", "Dependencies", and "Success Criteria". Track 09 consumes durable gateway sessions, DAY/NOW/session metadata, live event/run lineage, SpaceTimeDB readiness, Graphiti namespace refs, and one client-facing RPC/event surface.
- [[04-s5-autoresearch-and-review-extension]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`, "Architectural Keystones", "Tranche 6 - Epii Agent-Access and M5-4 Mediation Surface", "Tranche 7 - M5-3 IDE/Workbench Contract Surface", "Tranche 8 - Non-Aletheia Pipeline Adapters", "Tranche 9 - Full Spine Acceptance Scenario", "Dependencies", and "Success Criteria". Track 09 depends on typed candidates, route queues, orchestration state, governance metadata, privacy-filtered DTOs, dry-run promotion plans, and real persisted S5 stores.
- [[05-tauri-ide-shell-and-pratibimba-system]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md`, "Architectural Keystones", "T4 - M0/M5 IDE Shell Chrome And Evidence Workbench", "T8 - Agentic Run, Review, And Autoresearch E2E In The IDE", "Dependencies", and "Success Criteria". Track 09 supplies the mediation behavior that Track 05 exposes in the deep Theia Agentic Control Room.
- [[06-zero-one-surface-evolution]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/06-zero-one-surface-evolution.md`, "Architectural Keystones", "T5 - Lightweight M5-4 mediation", "T6 - Cross-surface summon and deep-link intents", "Dependencies", and "Success Criteria". Track 09 supplies the lightweight review alerts, agent check-in, and deep-link payload semantics consumed by `/body`.
- [[07-m-extension-individual-tracks]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/07-m-extension-individual-tracks.md`, "Architectural Keystones", "Tranche 2 - Shared Evidence, Routing, And Track 08 Contribution Contracts", "Tranche 8 - `m5-epii` First Slice And Deepening Path", and "Success Criteria". Track 09 consumes and returns evidence hooks from individual M extensions, especially `m5-epii` review/spine-state surfaces.
- [[08-integrated-plugin-tracks]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/08-integrated-plugin-tracks.md`, "Architectural Keystones", "T4 - 1-2-3 Evidence, Review, And Agent Hooks", "T6 - 4/5/0 Epii Review, Consent, And Canon-Recognition Hooks", "Dependencies", and "Success Criteria". Track 09 receives evidence envelopes and review requests from integrated 1-2-3 and 4/5/0 plugins and returns governed mediation state.
- [[M5'-SPEC]] - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, "Sixfold IDE Surface", "Graph Namespace Model", "Surface Philosophy: The Agentic IDE as Conversational Engagement", "User-Facing Surface", "Backend Contract Consumed", "Visual / Audio Interaction Model", and "Readiness / Test Criteria". This is the authority that M5-2 is the full S-family stack, M5-3 is the Tauri/Theia app, and M5-4 is operational-capacity and agentic mediation through real contracts.
- [[m5-prime-agentic-ide-research]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`, "M5' IDE Operational Surface Summary", "Graph Namespace/File/Code/Agent Integration Model", "Agentic Safety/Review/Promotion Flow", "Implementation/Test Implications", and "Open Research Questions". This supplies artifact URI refs, run/review/promotion flow, four-pane workbench shape, and the requirement that run evidence includes real artifact refs, graph refs, persisted deposits, review state, and promotion gating.
- [[m5-prime-autoresearch-self-improvement-loop]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md`, "Section 1 - What's already in place", "Section 5.2 The agentic-mediation surface per target", "Section 5.3 The orchestration-state model", "Section 9.2 The Sophia-on-Sophia anti-self-justification protocol", "Section 10 The full operational loop", "Section 11 Open spec gaps", and "Section 13 Implementation milestones". This is the spine source for surfacing, routing, orchestration, integration, governance lead differences, and known gaps.
- [[m5-prime-epii-on-anuttara-language-development]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`, "Section 4 M5-2: Backend technical construction", "Section 5 M5-3: Frontend developer-interface", "Section 6 M5-4: Agentic mediation", and "Section 11 Open development trajectories". This governs Sophia-led Anuttara construction-not-training, Pi axiom translation, Anima aesthetic checks, Aletheia disclosure tracking, and user-final validation for load-bearing axioms.
- [[m5-prime-epii-on-paramasiva-ql-cpt-and-rag]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`, "Section 4 M5-2 CPT/RAG/GDS pipeline", "Section 5 M5-3 corpus/checkpoint surfaces", "Section 6 M5-4 Agentic mediation", and "Section 11 Open development trajectories". This governs Sophia plus Epii co-review, Pi CPT/RAG dispatch, Anima light oversight, synthetic-proof governance, and corpus/checkpoint refresh gates.
- [[m5-prime-epii-on-parashakti-graph-relational-ml]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`, "Section 6 Embedding-quality metrics", "Section 7 M5-4: Agentic mediation", "Section 8 The governance gate", and "Section 12 Open development trajectories". This governs Sophia-led graph-relational ML, Anima cluster/rotation/Klein aesthetic review, Pi training and hot-swap dispatch, Aletheia disclosure tracking, and user-final validation for load-bearing embedding/lens changes.
- [[m5-prime-epii-on-mahamaya-process-reward-rl]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`, "Section 4 M5-2 process-reward RL/federated/genetic/GDS/SHACL integration", "Section 5 M5-3 pipeline monitors", "Section 6 M5-4: Agentic mediation", and "Section 11 Open development trajectories". This governs Sophia-led pipeline review, Anima user-pathway diversity oversight, Pi training/rollback dispatch, Aletheia pattern disclosure, tier-asymmetric gates, and runtime integration under rollback discipline.
- [[m5-prime-epii-on-nara-qlora-dialogic-voice]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`, "Section 0 Thesis: the Anima-led, slow-tuning surface", "Section 4 M5-2 QLoRA/DPO/eval/inference path", "Section 6 M5-4: Agentic mediation - Anima leading", "Section 8 Privacy, consent, and protected-local discipline", "Section 10 The autoresearch-spine connection", and "Section 12 What this spec delivers". This governs Nara's Anima-primary voice pipeline, five Anima gates, anti-frequency-bias, consent and PII stripping, and distinct parser versus dialogue model paths.
- [[m5-prime-epii-on-epii-self-referential-capacity]] - `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md`, "Section 5.4 The spine-state inspector", "Section 6 M5-4: Agentic mediation - the recursive review loops", "Section 10 Construction discipline summary", and "Section 11 Open development trajectories". This governs Epii-on-Epii recursive review, Sophia-on-Sophia anti-self-justification, Anima/Pi/Aletheia self-review variants, and user-final validation for recursive modification.
- [[S4-S4i-PI-AGENT]] - `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md`, "Architectural Role", "S4' Implicate - VAK System / Ta-Onta", "epi-citta: The Architectural Nucleus", "Ta-Onta -> epi-cli Translation Map", and "Implementation Plan". This is the S4/S4' authority for PI runtime, VAK instruction set, ta-onta modules, agent spawn, and Anima/Aletheia routes.
- [[S4-5-SPEC]] - `Idea/Bimba/Seeds/S/S4/S4-5-SPEC.md`, "Intent", "Build Scope", "Hooks / Dependencies", and "Success Criteria". This governs Aletheia as durable subagent orchestration, thought routing, lineage preservation, and crystallisation trigger without absorbing Epii governance.
- [[S4-5'-SPEC]] - `Idea/Bimba/Seeds/S/S4/S4'/S4-5'-SPEC.md`, "Aletheia Membrane", "Z-thread role", "Sub-agent rotation table", "Build Scope", and "Boundaries". This governs Anansi, Klotho/Lachesis/Atropos, Janus, Mercurius, Agora, and Zeithoven as differentiated Aletheia modes feeding S5/Epii review through Night' rehear output.
- `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md`, `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/*.md`, and `Body/S/S4/ta-onta/S4-5p-aletheia/clusters/*/RUPA.md`. These are the live S4.5 substrate anchors for Aletheia's tool/skill specialists: extension-level raw tools, skill-gated use, specialist subagents, Moirai operational modes, Gnosis/Graphiti/Chronos/Hen/REPL surfaces, and the S4.5 -> S5 handoff contract.
- [[S5-S5i-SYNC]] - `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md`, "Architectural Role", "S5' Implicate - QL Automations", "Current State in This Repo", "Integration Architecture", and "Implementation Plan". This is the world-sync/publication boundary; Track 09 can create canon-recognition and publication review gates now, but Notion/n8n/world execution remains downstream.
- Current implementation surface (test-locked parity is canonical): `Body/S/S4/plugins/pleroma/capability-matrix.json` is the canonical governance authority for agent tool surfaces and dispatch gating — its `agent_capability_gates.anima.tools` carries the 15-tool surface (`vak_evaluate, goal_prelude, anima_orchestrate, nous_disclose, dispatch_agent, dispatch_parallel_agents, dispatch_fusion_agents, dispatch_moirai_night_pass, anima_self_invoke, run_chain, subagent_create, subagent_continue, subagent_list, subagent_remove, tilldone`), and its `dispatch_tools[]` carries six entries (`dispatch_agent`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `run_chain`, `dispatch_moirai_night_pass`, `anima_self_invoke`) each with `upstream_required: ["vak-evaluate"]`. `nous_disclose` stays gate-only (not a dispatch tool). `Body/S/S4/pi-agent/agents/anima.md` frontmatter `tools:` field mirrors the matrix and is enforced by `test_agent_capability_gates_anima_tools_matches_anima_md_tools` in `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py` — three-way parity (matrix ↔ runtime `animaDefaultTools` ↔ anima.md frontmatter) drift-fails CI immediately. `Body/S/S4/pi-agent/README.md` documents managed PI runtime and source residency. `Body/S/S5/epii-agent/agent-contract.json` declares live `s5'.epii.*`, `s5'.review.*`, and `s5'.improve.*` methods, accepted deposits, allowed Anima requests, and forbidden authority. The older `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` shows only 8 tools and is stale relative to the test-locked parity — treat as historical context, not authority.

## Task Body

12. **T10 - Full M5-4 Acceptance And Release Gate (gated by all prior tranches and upstream live-service harnesses).** Deliverables: build a repeatable acceptance harness that starts or connects to local S0/S2/S3/S5 services, opens `/body`, summons `/pratibimba/system`, runs real VAK evaluation, creates mediated candidates for all six operational capacities, records at least one real agent-run/evidence/deposit path, resolves allowed gates, blocks human-required gates for agents, creates dry-run promotion plans where allowed, and emits a readiness report with every degraded/blocker state. Verification: acceptance tests prove the complete path for one Aletheia-disclosure intake with differentiated expert lineage, one Anuttara-first cross-target route, one Paramasiva or Parashakti metric/corpus route, one Mahamaya runtime-pipeline route, one Nara Anima-primary route, and one Epii-on-Epii recursive route; tests fail if any step uses placeholder IDs, mocked review state, local graph/profile derivation, flattened Aletheia source-only provenance, non-dry-run mutation, protected body leakage, or UI-only state; final readiness requires the relevant Track 01-08 test suites and live harnesses to pass or to be listed as explicit blockers.

## Dependencies

- **Track 01 is upstream for all mediated profile and capability work.** Track 09 cannot claim operational readiness until the bridge exposes real profile generation, readiness taxonomy, VAK/CF metadata, observability events, and bounded agent capabilities with privacy filtering.
- **Track 02 is upstream for graph-backed capacity evidence.** Anuttara, Parashakti, Paramasiva GDS augmentation, Mahamaya graph/pathway evidence, M5 graph namespaces, and protected pratibimba handles depend on S2 graph API parity and namespace law.
- **Track 03 is upstream for run/session/event lineage.** Agent runs, deposits, Graphiti handles, DAY/NOW metadata, world clock, SpaceTimeDB readiness, and gateway RPC/event streams must come from S3/S3' rather than hidden local process state.
- **Track 04 is upstream and adjacent for S5 core state.** Track 04 owns typed candidates, route queues, orchestration state, review gates, continuity, and promotion planning inside S5 cores. Track 09 owns the M5-4 mediation workflows, agent authority/run envelopes, capacity registry, and control-room consumption of those real states.
- **S4.5 Aletheia is upstream for disclosure lineage.** Track 09 may adapt and surface Aletheia material, but the specialist roster, tool/skill surfaces, Moirai modes, Gnosis/Graphiti/Hen/Chronos refs, and crystallisation path come from the S4.5 contract, seeds, agent files, and cluster RUPA files. S5 may receive and govern the result; it does not invent Aletheia expertise after the fact.
- **Track 05 is the deep surface dependency.** The Theia shell, kernel-bridge adapter, M0/M5 chrome, evidence panes, and Agentic Control Room host must exist before deep control-room acceptance can pass.
- **Track 06 is the lightweight surface dependency.** `/body` can only expose alerts, agent check-in, and deep-link intents after Track 06 has lite bridge consumption, S5 review alert DTOs, and protected-local Nara sendoff semantics.
- **Track 07 provides individual extension evidence hooks.** M0-M5 extension views need to emit route/evidence/action hooks into Track 09; Track 09 returns review state and mediation readiness to those extensions.
- **Track 08 provides integrated plugin evidence hooks.** The 1-2-3 and 4/5/0 plugins send evidence envelopes and recognition claims into M5-4; Track 09 must preserve privacy and human gates before those actions become operational.
- **S4 PI runtime and ta-onta Anima remain runtime dependencies, partially landed.** `epi agent vak evaluate` is callable, durable team dispatch surfaces are live, and `epi gate dispatch anima-invoke` is wired (per `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md`, all 10 chips closed: `19fbc8fc`, `c7533a2`, `f7ba403`, `7273ae9`, `d1c89ab`, `7103576`, `419aac5`, `ec9592c`, `9abc13f`, `a664b51`). The remaining dispatch-tool variants (`dispatch_parallel_agents`, `dispatch_fusion_agents`, `dispatch_moirai_night_pass`, `anima_self_invoke`, `run_chain`) live in the PI/ta-onta runtime and need their gateway/library bindings completed. Track 09 must either complete those bindings through gateway/library adapters or report blocked readiness per dispatch-tool variant.
- **S5 world-sync remains downstream.** `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md` is still a stub for Notion/n8n/publication execution. Track 09 may create canon-recognition and publication review gates, but external publication execution waits for a future S5 sync implementation.
- **Real agent-run CI needs provider/runtime policy.** If external model credentials are unavailable in CI, the implementation must separate deterministic contract/store/gateway tests from an operator-run PI smoke lane and report provider-unavailable as a blocker, not fake the run.

## Open Decisions

- **Anima orchestration binding (partially resolved).** `epi gate dispatch anima-invoke` is wired through the gateway (D3 chip, commit `419aac5`), and the three-way parity (`capability-matrix.json` ↔ `animaDefaultTools` ↔ `anima.md` frontmatter) is test-locked. Remaining work: extend the wired anima-invoke binding to the full set of dispatch tools — `vak_evaluate -> anima_orchestrate -> dispatch_{agent | parallel_agents | fusion_agents | moirai_night_pass | anima_self_invoke | run_chain}` — with canonical-prefix VAK keys carried end-to-end and env-propagation + gateway-record both load-bearing on every dispatch. `nous_disclose` remains gate-only (not dispatched).
- **Review source identity shape.** Track 04 leaves open whether `ReviewSource` expands with Sophia/Pi/Epii/Nara-specific variants or stays coarse while actor/governance metadata carries richer identity. Track 09 should preserve coarse source variants for compatibility and carry richer identity in structured governance/source metadata unless a later user-final architecture decision proves enum expansion is safer.
- **Agent-run execution substrate.** Decide whether implementation runs use isolated git worktrees, staged patch buffers, or both; the IDE must return patch/evidence artifacts into S5 review without making Theia/OpenVSCode/PI a competing source of truth.
- **Real PI/model verification policy.** Decide which local or hosted model/provider path is acceptable for production smoke tests, how credentials are supplied, and what readiness state appears when the provider is unavailable.
- **Per-pipeline observation fingerprints.** Aletheia can start with existing JSONL/recompose fingerprints, but Anuttara, Paramasiva, Parashakti, Mahamaya, Nara, and Epii-on-Epii each need canonical fingerprint fields to prevent duplicate surfacing without suppressing materially changed observations.
- **Routine versus load-bearing thresholds.** Parashakti embedding retrains, Paramasiva corpus refreshes, Mahamaya tier updates, and Nara adapter refreshes need precise thresholds for when Pi/Sophia/Anima authority is enough versus when user-final validation is mandatory.
- **Deployment gate workflow.** Beyond current `requires_human` semantics, production deployment gates need an operator protocol for acknowledge, rollback, post-deploy verification, and audit before any non-dry-run mutation is enabled.
- **Compiler mutation law.** Non-dry-run promotion remains blocked until Hen/S1 mutation law, per-target `MutationKind` execution, rollback capture, and deployment gates are implemented. Track 09 should keep surfacing dry-run plans only until then.
- **VAK UI representation.** The control room must show VAK route decisions clearly, but the exact UI shape for CPF/CT/CP/CF/CFP/CS, Nous clearing, and user-brainstorm blocks is unresolved.
- **Nara consent/corpus storage boundary.** The Nara spec is explicit about consent and PII stripping, but the exact artifact schema, revocation behavior, and Anima-bound corpus partition API need to land before Nara voice mediation can be production-ready.
- **Spine-state inspector ownership.** Track 04 owns S5 state, Track 07 owns `m5-epii`, and Track 09 owns mediation semantics. The implementation must decide which package owns inspector composition while preserving one source of S5 truth.
- **Theia/Tauri bridge host boundary.** Track 05 and Track 06 still leave open Tauri-owned, Theia-owned, or hybrid bridge hosting. Track 09 should target the stable API and treat host-specific assumptions as blocked until the ADR lands.
- **Source gap: S-side autoresearch seed.** `m5-prime-autoresearch-self-improvement-loop` names `Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md` as absent. Track 09 can proceed from Track 04 and M-side specs, but the S-side implementation-register mirror remains a documentation gap.
- **Source gap: exact control-room minimum receiver.** Track 05/06/08 define deep-link and control-room needs, but the smallest real `/pratibimba/system` receiver that satisfies "not a placeholder" still needs a joint acceptance definition.

## Success Criteria

- M5-4 mediation runs only through real S0/S2/S3/S4/S5 contracts and never through direct ad hoc agent powers, local graph/profile derivations, hidden filesystem mutation, or UI-only state.
- A real VAK route can be evaluated, mapped through Anima, recorded with CPF/CT/CP/CF/CFP/CS, and surfaced in the control room with blocked states for Nous clearing, brainstorming-required, unsupported thread type, or missing runtime capability.
- Sophia, Anima, Pi, and Aletheia each have explicit authority, evidence, and prohibition tests. Agents cannot approve, reject, revise, promote, weaken recursive gates, bypass Anima dispatch, or mutate raw runtime state without review records.
- All six operational capacities have working mediated readiness paths into S5 review/autoresearch state: Anuttara grammar/SHACL construction, Paramasiva CPT/RAG/GDS corpus governance, Parashakti graph-relational metric/hot-swap governance, Mahamaya process-reward/federated/genetic runtime governance, Nara Anima-primary QLoRA/DPO voice governance, and Epii-on-Epii recursive self-review governance.
- `/body` exposes only lightweight safe mediation affordances: review alerts, agent check-in, pending human validations, safe source handles, and deep-link intents. It does not become the deep Agentic Control Room.
- `/pratibimba/system` exposes the deep Agentic Control Room over real state: VAK route, agent run tree, evidence stream, S5 candidate/review/improvement records, dry-run promotion, continuity hints, governance gates, privacy blockers, and source/spec/code/test anchors.
- S5 review/autoresearch records are persisted, reloadable, linked to run/evidence/artifact refs, and privacy-filtered. Human-required, deployment, recursive, and user-final gates cannot be resolved by agents in tests or through public APIs.
- Aletheia disclosure records preserve differentiated expert lineage from S4.5 into S5 and M5-4: Anansi, Moirai Klotho/Lachesis/Atropos, Janus, Mercurius, Agora, Zeithoven, tool refs, skill refs, namespace refs, readiness, DAY/NOW/session, and privacy class are reloadable from real persisted records without granting those specialists Epii review-resolution authority.
- Evidence envelopes include artifact URIs, graph namespace refs, profile generation, pointer/deposition anchors where available, DAY/NOW/session, gateway/run id, S5 review/improvement id, actor lineage, test output handles, readiness state, and privacy class.
- Privacy audits prove raw Nara/Graphiti bodies, private profile internals, raw birth data, raw personal quaternion/vector fields, unreconciled episode text, and protected local personal graph facts do not enter public bridge payloads, S2 projections, SpaceTimeDB rows, S5 evidence, Theia workspace state, `/body` DOM, or control-room snapshots.
- Production readiness is blocked unless tests exercise real functionality: compiled CLI/library/gateway paths, real persisted S5 stores, real S0/S2/S3 payloads or captured-live fixtures, real Theia/Tauri activation for surfaced behavior, real privacy scans, and an operator-run PI smoke path when agent execution is claimed.

## Track Open Decisions

- **Anima orchestration binding (partially resolved).** `epi gate dispatch anima-invoke` is wired through the gateway (D3 chip, commit `419aac5`), and the three-way parity (`capability-matrix.json` ↔ `animaDefaultTools` ↔ `anima.md` frontmatter) is test-locked. Remaining work: extend the wired anima-invoke binding to the full set of dispatch tools — `vak_evaluate -> anima_orchestrate -> dispatch_{agent | parallel_agents | fusion_agents | moirai_night_pass | anima_self_invoke | run_chain}` — with canonical-prefix VAK keys carried end-to-end and env-propagation + gateway-record both load-bearing on every dispatch. `nous_disclose` remains gate-only (not dispatched).
- **Review source identity shape.** Track 04 leaves open whether `ReviewSource` expands with Sophia/Pi/Epii/Nara-specific variants or stays coarse while actor/governance metadata carries richer identity. Track 09 should preserve coarse source variants for compatibility and carry richer identity in structured governance/source metadata unless a later user-final architecture decision proves enum expansion is safer.
- **Agent-run execution substrate.** Decide whether implementation runs use isolated git worktrees, staged patch buffers, or both; the IDE must return patch/evidence artifacts into S5 review without making Theia/OpenVSCode/PI a competing source of truth.
- **Real PI/model verification policy.** Decide which local or hosted model/provider path is acceptable for production smoke tests, how credentials are supplied, and what readiness state appears when the provider is unavailable.
- **Per-pipeline observation fingerprints.** Aletheia can start with existing JSONL/recompose fingerprints, but Anuttara, Paramasiva, Parashakti, Mahamaya, Nara, and Epii-on-Epii each need canonical fingerprint fields to prevent duplicate surfacing without suppressing materially changed observations.
- **Routine versus load-bearing thresholds.** Parashakti embedding retrains, Paramasiva corpus refreshes, Mahamaya tier updates, and Nara adapter refreshes need precise thresholds for when Pi/Sophia/Anima authority is enough versus when user-final validation is mandatory.
- **Deployment gate workflow.** Beyond current `requires_human` semantics, production deployment gates need an operator protocol for acknowledge, rollback, post-deploy verification, and audit before any non-dry-run mutation is enabled.
- **Compiler mutation law.** Non-dry-run promotion remains blocked until Hen/S1 mutation law, per-target `MutationKind` execution, rollback capture, and deployment gates are implemented. Track 09 should keep surfacing dry-run plans only until then.
- **VAK UI representation.** The control room must show VAK route decisions clearly, but the exact UI shape for CPF/CT/CP/CF/CFP/CS, Nous clearing, and user-brainstorm blocks is unresolved.
- **Nara consent/corpus storage boundary.** The Nara spec is explicit about consent and PII stripping, but the exact artifact schema, revocation behavior, and Anima-bound corpus partition API need to land before Nara voice mediation can be production-ready.
- **Spine-state inspector ownership.** Track 04 owns S5 state, Track 07 owns `m5-epii`, and Track 09 owns mediation semantics. The implementation must decide which package owns inspector composition while preserving one source of S5 truth.
- **Theia/Tauri bridge host boundary.** Track 05 and Track 06 still leave open Tauri-owned, Theia-owned, or hybrid bridge hosting. Track 09 should target the stable API and treat host-specific assumptions as blocked until the ADR lands.
- **Source gap: S-side autoresearch seed.** `m5-prime-autoresearch-self-improvement-loop` names `Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md` as absent. Track 09 can proceed from Track 04 and M-side specs, but the S-side implementation-register mirror remains a documentation gap.
- **Source gap: exact control-room minimum receiver.** Track 05/06/08 define deep-link and control-room needs, but the smallest real `/pratibimba/system` receiver that satisfies "not a placeholder" still needs a joint acceptance definition.

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
| PRD-04 | ~~Theia extension API, version, package manager, and build composition~~ **Resolved: Theia 1.56 + pnpm workspaces + electron-app canonical / theia-app browser CI (ADR-05-011)** | Resolved | — |
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
| IOD-12 | Observability schema ownership — **Binding (Track 08.T9, 2026-06-01)** | Implementation-owner (Resolved) | 01, 04, 05, 06, 07, 08 |
| IOD-13 | Nara vault/write service ownership | Implementation-owner | 03, 04, 05, 06, 07, 08 |
| IOD-14 | Plugin activation, composition, and mini-mode model | Implementation-owner | 05, 07, 08 |
| IOD-17 | `capability-matrix.json` as canonical agent-tool governance authority — **Binding spec-time (ADR-05-011 §5, Track 05.T8)** | Implementation-owner (Resolved spec-time; runtime parity follow-up) | 01, 04, 09 |
| IOD-18 | Smart Connections via Hen `smart_env.rs` as canonical vault semantic-index reader — **Binding (ADR-05-010 / ADR-05-011 §4)** | Implementation-owner (Resolved) | 03, 04, 05, 07, 09 |
| IOD-19 | Hen as canonical vault-write gatekeeper (wikilink integrity, path soundness) — **Binding (ADR-05-010 / ADR-05-011 §3); Canon Studio rejects writes until T4.5** | Implementation-owner (Resolved) | 03, 05, 07, 09 |
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

### PRD-04 - ~~Theia extension API, version, package manager, and build composition~~ **RESOLVED**

- **Status (as of 2026-06-01):** Resolved by [ADR-05-011](../../../Idea/Pratibimba/System/docs/decisions/adr-05-011-release-gate-close.md) (release-gate close), anchored on ADR-05-005 (Theia 1.56 + pnpm workspaces) and ADR-05-006 (electron-app canonical + theia-app browser-mode for CI/Docker parity). All workspace packages green under `pnpm -r build`; 16+ extension chunks in the 21+ MB smoke-build bundle; 42/42 cross-extension tests passing. The Tauri-build-composition strand of the question is obviated (no Tauri wrapper) — see also the consolidated PRD-01..03 resolutions and `Body/M/epi-tauri/DEPRECATED.md`.
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
