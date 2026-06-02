# Review Pass — Implementation-Track Plans

**Date:** 2026-05-31
**Reviewer:** Review session against canon, prior Theia plan, `/Body/` substrate, and source M'/S' specs.
**Scope:** `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/00..11.md` (12 files, ~2,900 lines).
**Final-pass status:** Two architectural decisions confirmed during review (see §0 below); findings and sign-off criteria updated accordingly.

---

## §0 Decisions confirmed during review (final pass)

These are user-validated architectural decisions that landed during the review pass and propagate into the findings, next-actions, and sign-off criteria below.

### §0.1 S1 substrate reach via embedded `obsidian-md-vsc` — ⚠️ REVERSED (kept here as historical record)

> **Reversal — 2026-06-01 evening:** Research subagent surfaced that `willasm.obsidian-md-vsc` is an Obsidian-app remote-control shim via Advanced URI, NOT a vault renderer. It does not render wikilinks, parse vault structure, serve Smart Connections, or operate without a running Obsidian. The original §0.1 decision below is superseded by **§0.1-bis** (next subsection) which records the corrected S1 architecture: filesystem-direct-read via Theia FS provider + Hen-gateway-write via `s1'.vault.*` for wikilink integrity + Smart Connections via `s1'.semantic.*` over `Body/S/S1/hen-compiler-core/src/smart_env.rs`. See Track 11 IOD-18 (Smart Connections via Hen smart_env) and IOD-19 (Hen as vault-write gatekeeper) for the codified replacements; see `Idea/Pratibimba/System/docs/decisions/adr-05-008-obsidian-md-vsc.md` with full reversal note.

**Original §0.1 (historical, superseded):**

**Decision:** S1 (Obsidian/vault — canonical knowledge filesystem, canon §1.2) is reached into and rendered through the [`willasm.obsidian-md-vsc`](https://marketplace.visualstudio.com/items?itemName=willasm.obsidian-md-vsc) VS Code Extension Marketplace extension, hosted as a Theia VS Code-API extension inside `/pratibimba/system`.

**Architectural placement:**
- S1 = the user's Obsidian vault on the local filesystem (canonical knowledge filesystem per canon §1.2).
- `obsidian-md-vsc` runs as a VS Code-API extension inside Theia's dual-extension-API runtime (Theia supports both Theia-native and VS Code extensions per PRD-04 source options).
- The IDE chrome (`ide-shell-m0-m5` per Track 05 T4) hosts obsidian-md-vsc as an always-available view alongside the Bimba graph viewer, Canon Studio, Agentic Control Room, coordinate tree, and Logos Atelier.
- S1 becomes the *prime means into the local filesystem* via S4 (agent-SDK deposit pathways) and M4' (Nara journal/vault writes) inside the M5' shell.

**Cascading benefits:**
- **S2 ingestion** becomes filesystem-watcher-driven (the existing `s1.sync.flush` dependency referenced by Track 02 T6 and Track 04 resolves to a vault file watcher rather than a custom sync API). The S1-queue-drain language across Tracks 02/04/06 should be re-anchored to "vault file watcher → S2 ingestion".
- **Anuttara language fields** (`c_1_symbol`, `c_1_formulation_type`, `c_1_complete_formulation` — Track 02 T1 / IOD-06) become directly viewable in IDE chrome through obsidian-md-vsc's markdown + wiki-link rendering, with `[[bimba-coordinate]]` links resolving against the vault structure.
- **Logos Atelier** (Track 05 T4) composes with Obsidian's wiki-link graph rather than reinventing etymological navigation — the archaeological-archaeology workspace gets a real link-graph substrate to work in.
- **M4' Nara writes** (Track 06 T4) land directly in vault files that the canonical Obsidian app and IDE-hosted obsidian-md-vsc both read — no parallel storage layer.
- **S4 agent deposits** become vault file writes (with privacy gates per Track 06 T4 / Track 09 T3) rather than an abstract "deposit channel".
- **PRD-04 refinement (not violation):** The canon recommendation "Theia-native throughout for architectural coherence" is preserved as the rule; the strategic VS Code extension borrow for obsidian-md-vsc is the principled exception — exactly the ecosystem-compatibility advantage Theia's dual-extension-API model exists to enable.

**Impact on findings:** Resolves former [B-1]. Refines PRD-04 in Track 11. Cascades to new minor items about cross-track re-anchoring of S1-queue-drain language.

### §0.2 Cymatic engine as substantial substrate — confirmed truest-version scoping

**Decision:** The cymatic engine per [`m4-prime-psychoid-cymatic-field-engine.md`](../../../Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md) §11 (Engine architecture), §13 (Composition discipline), §14 (Privacy and protected-local status), §15.4 (Live SpaceTimeDB integration), §18.4 (The 0/1/4+2 layout), and §18.10 (Embedded graph view in Tauri-v2) is recognized as substantial substrate work consumed by both M2 cosmic-scale rendering (Track 07 T5C — full integrated 1-2-3 surface per canon §4.4.A) and M4 personal-field rendering (Track 07 T7D — full integrated 4/5/0 surface per canon §4.4.B). It is not downgraded.

**Architectural placement (truest-version):**
- A new **Track 12 — Cymatic Engine Substrate** owns the deterministic standing-wave renderer, three-fiber/WebGL stack, audio-bus consumer (`audio_octet[8]` + `nodal_quartet[4]` per kernel profile), cosmic-vs-personal mode parametrization, privacy gates (protected-local for M4 / shareable for M2 cosmic-scale), and the explicit Option-F-vs-stylized-fallback selector per m4-prime-psychoid-cymatic-field-engine §11.
- Tracks 07 T5C (`m2-parashakti` cosmic-scale cymatic) and 07 T7D (`m4-nara` personal psychoid cymatic) become **consumers** of Track 12 rather than re-implementations of substrate.
- Track 08 T3 (integrated 1-2-3 cosmic-engine composition) and Track 08 T5 (integrated 4/5/0 Jiva-is-Siva recognition surface) consume cymatic rendering through the Track 07 contribution exports per the existing IntegratedSurfaceContribution contract.
- Scope: Track 12 is substantial substrate work — deterministic-renderer + audio-bus consumer + cosmic/personal-mode parametrization + privacy gates, gated on Track 01 audio-bus contract completion. Per the m4-prime spec, Option F (full physics simulation per Karman/Stuart-Landau equations or comparable) is the canonical target; stylized fallback exists only as an explicit readiness-declared lower-fidelity mode, not as a substitute.
- The full IDE-embedded BimbaMap graph view per m4-prime §18.10 is also Track-12-adjacent substrate (or it can be folded into Track 05 T4 IDE chrome — see I-7 below).

**Impact on findings:** Reframes former [B-2]. Adds Track 12 as the substrate owner. Tracks 07 T5/T7 and 08 T3/T5 re-cast as consumers. Sign-off criterion C2 updated.

### §0.3 Track 02 is mis-framed — bimba map is already populated

**Decision:** Track 02 ("S2/S2' Bimba-Map Population Implementation Track") plans tranches T3 (Canonical coordinate seed baseline) and T4 (Dataset population from existing corpus) as if the graph were empty. It is not. The work has already been completed by prior plans and the live `Body/S/S2/graph-services/` substrate:

- `Body/S/S2/graph-services/src/` already contains `seed.rs`, `dataset_import.rs`, `embeddings.rs`, `pointers.rs`, `bidirectional_sync.rs`, `link_enforcement.rs`, `sync_coordinator.rs`, `relationship_manager.rs`, `retrieval/`, `retrieval_query.rs`, `semantic.rs`, `vault.rs`, `meta.rs`, `doctor.rs`, `coordinate.rs`, `schema.rs`, `graph_api.rs` — substantial production code.
- `docs/datasets/` carries all six deep branches (`anuttara-deep`, `paramasiva-deep`, `parashakti-deep`, `mahamaya-deep`, `nara-deep`, `epii-deep`) + `low-detail/` + `migrations/` + `nodes_hash.json` + `relations_hash.json`.
- Prior plans `2026-03-10-graph-bootstrap-health.md`, `2026-05-17-bimba-map-ingestion-plan.md`, and `2026-05-19-deep-bimba-regional-property-update-protocol.md` have already executed the population, deep-branch ingestion, and regional-property update work.

**Architectural recast (truest-version):** Track 02 should be renamed and restructured as **S2/S2' Graph Law Extension and Consumption Surface** — recognizing that population is done and what remains is drift reconciliation + plugin/ontology readiness + coordinate-native API surface for M5-3/M5-4 consumers + operational discipline.

**Tranche-level corrections:**
- **T0 (Authority and drift preflight)** — expand to inventory the *live populated state*: node counts per branch, relation type histogram, registry drift between `seed.rs`/`dataset_import.rs` emission and `graph-schema` registry, current `#`-vs-M-family residency, current Anuttara field-naming residency, semantic embedding coverage, `nodes_hash.json`/`relations_hash.json` reconciliation. Output the baseline snapshot future work measures against.
- **T1 (Schema and relation-law convergence)** — keep as drift-reconciliation work. This is genuinely ongoing maintenance since `seed.rs`/`dataset_import.rs` may still emit relations the registry hasn't accepted. Reference the actual current divergence rather than assuming.
- **T2 (Neo4j topology and plugin readiness)** — keep as plugin/n10s/GDS readiness work. Honest about current `docker-compose.epi-s2.yml` only carrying APOC; n10s/GDS packaging is the live question.
- **T3 (Canonical coordinate seed baseline)** — **delete or re-cast as idempotent verification**. The seed baseline exists. The tranche should be: "verify `seed_coordinate_space` is idempotent against the live graph; confirm seed-snapshot query set returns expected node/relation counts for `M0`, `M2`, `M4`, `M5`, `CF_FRACTAL`, `CPF`; document the baseline for future re-bootstrap operations".
- **T4 (Dataset population from existing corpus)** — **delete or re-cast as deep-branch reconciliation audit**. Population is done. The tranche should be: "audit current branch residency against `docs/datasets/` source; verify `c_3_source_dataset` / `c_3_dataset_branch` / `c_3_dataset_branch_label` provenance is complete; reconcile any missing endpoints or duplicate coordinates surfaced by prior `2026-05-19-deep-bimba-regional-property-update-protocol.md` work; confirm no ad-hoc property drift in subsequent edits". The "import all datasets from scratch" deliverable should be reserved for the documented destructive-rebuild path (existing T9 runbook scope), not normal forward work.
- **T5 (Anuttara/OWL/neosemantics bridge)** — keep as forward work. Genuine extension over current populated graph.
- **T6 (GDS baseline projections)** — keep as forward work. Genuine extension.
- **T7 (Coordinate-native graph API parity)** — keep as forward work. The API surface alignment is the load-bearing M5-3/M5-4 deliverable.
- **T8 (M5-3 and M5-4 consumption contracts)** — keep as forward work.
- **T9 (Reconciliation, runbook, release gate)** — keep as forward work, with destructive-rebuild policy + non-destructive-update policy + drift-audit cadence now central. This is where the "re-bootstrap from empty volume" path lives, not in T3/T4 forward planning.

**Reference inheritance:** Track 02 should explicitly cite `2026-03-10-graph-bootstrap-health.md`, `2026-05-17-bimba-map-ingestion-plan.md`, and `2026-05-19-deep-bimba-regional-property-update-protocol.md` as prior-work whose state Track 02 *inherits and extends*, the same way Track 04 inherits the live S5 cores under `Body/S/S5/epii-autoresearch-core|review-core|agent-core`.

**Impact on findings:** Adds [I-7] (important). D4 (Existing-substrate honouring) is downgraded — the substrate *inventory* is correct in Track 02 but the *state* of that substrate (already-populated) was not honoured in the tranche structure. Sign-off criterion C11 added.

### §0.4 VAK-as-Operational-Substrate has landed — Track 09/04/01 still reference the pre-landing state

**Decision (confirmed by user):** The VAK-as-Operational-Substrate work tracked by `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md` has completed all 10 chips. The three-way parity (`capability-matrix.json` ↔ runtime ↔ `anima.md`) is now enforced by `test_agent_capability_gates_anima_tools_matches_anima_md_tools` in `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`. What was descriptive metadata is now operational substrate.

**Concrete operational facts now in production (with commits):**
- **Anima's tool surface expanded** to 15 tools (vs prior 8): `vak_evaluate, goal_prelude, anima_orchestrate, nous_disclose, dispatch_agent, dispatch_parallel_agents, dispatch_fusion_agents, dispatch_moirai_night_pass, anima_self_invoke, run_chain, subagent_create, subagent_continue, subagent_list, subagent_remove, tilldone` — visible in both `Body/S/S4/pi-agent/agents/anima.md` frontmatter and `capability-matrix.json` `agent_capability_gates.anima.tools`.
- **`dispatch_tools[]` in `capability-matrix.json`** now carries `dispatch_agent`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `run_chain`, `dispatch_moirai_night_pass`, `anima_self_invoke` — each with `upstream_required: ["vak-evaluate"]`. Dispatch is gated on real VAK evaluation, not an advisory check.
- **`nous_disclose`** stays gate-only (capability-matrix governance) — not a dispatch tool. Scoping is by gate membership.
- **`sessions.patch` RPC carries `vak_address`** (C1, commit `19fbc8fc`).
- **Aletheia summary plumbed** (B2, `c7533a2`).
- **`closure_kind` discriminator** on Aletheia→Epii append (C2, `f7ba403`; C4 contract codified at `d1c89ab`) — this is how the Möbius seam tags what Epii routes into the next cycle.
- **`MOIRAI_CF` + `validateFusionDispatch`** promoted (C3, `7273ae9`) — fusion-agent dispatch carries a validated CF.
- **`anima.md` frontmatter ↔ Section 5 reconciled** (D1, `7103576`).
- **`epi gate dispatch anima-invoke`** CLI wired (D3, `419aac5`) — gateway dispatch of Anima invocation.
- **D5 guardrails applied to `dispatch_fusion_agents`** (`ec9592c`).
- **CT4 harmonized to CT4a/CT4b** (E1↔E2, `9abc13f`) — CT (Content-Type) thread distinguishes the two registers; this should propagate into Track 04's typed candidate/route DTO schema.
- **Three-way parity test locked** (`a664b51`) — any future drift between `capability-matrix.json` anima tools, runtime `animaDefaultTools`, and `anima.md` frontmatter `tools:` fails CI immediately.
- **The operational cycle is now load-bearing**: `Khora compose → execution → Moirai rehear → Sophia witness → Aletheia routes Sophia → Epii inbox (closure_kind tagged) → Epii recompose → next-cycle seed`. Both env-propagation and gateway-record are load-bearing.

**Where the implementation-track plans haven't caught up:**

- **Track 09 line 32** ("Current implementation surface for context only") cites `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` as the authority for Anima's tools and dispatch surface. That CONTRACT.md still shows only 8 tools (no `nous_disclose`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `dispatch_moirai_night_pass`, `anima_self_invoke`, `goal_prelude`, `tilldone`). The authoritative view is now the test-locked parity between `capability-matrix.json` + `pi-agent/agents/anima.md`. Track 09's source-inventory references the pre-landing artifact.
- **Track 09 T1 deliverable** ("VAK Routing And Anima Orchestration Gateway Surface") names `NousRequired`, `UserBrainstormRequired`, `SophiaLed`, `AnimaPrimary`, `PiDispatch`, `AletheiaDisclosure` as route outcomes — missing the new `MoiraiNightPass`, `AnimaSelfInvoke`, and `FusionDispatch` (with `MOIRAI_CF` + `validateFusionDispatch`) outcomes that are now operational. The "CFP/thread modes" enumeration should be updated.
- **Track 09 T2 (Agent Authority Registry)** should reference `capability-matrix.json` as the canonical governance authority and the three-way parity test (`test_agent_capability_gates_anima_tools_matches_anima_md_tools`) as the enforcement mechanism. Currently it describes a registry to be built; the registry already exists at `Body/S/S4/plugins/pleroma/capability-matrix.json` and Track 09 should extend it, not duplicate it.
- **Track 09 Open Decision "Anima orchestration binding"** is partially resolved — `epi gate dispatch anima-invoke` is wired (D3 chip, `419aac5`), and the gateway-record + env-propagation pattern is operational. The decision wording should be updated to "remaining wiring: full `vak_evaluate -> anima_orchestrate -> dispatch_X` chain for the five dispatch tool variants through the gateway, with each carrying canonical-prefix VAK keys end-to-end".
- **Track 04 (S5 autoresearch+review)** is missing `closure_kind` as a typed discriminator on candidates/route records. The Aletheia→Epii append contract (C4 chip) ought to land in Track 04's Tranche 1 (Typed Spine Core Schema) or Tranche 2 (Surfacing Intake and Routing Queues). The four-step rehearsal cycle (Khora compose → execution → Moirai rehear → Sophia witness → Aletheia routes → Epii inbox/closure_kind → Epii recompose → next-cycle seed) is the operational expression of Track 04's spine; it's currently described abstractly as "Z-cycle" and "recompose_pass" but the concrete VAK-substrate cycle is not named.
- **Track 04 Tranche 1** should add `ClosureKind` as a typed enum alongside the existing `TargetSubsystem`, `ImprovementVectorKind`, etc. The CT4 → CT4a/CT4b harmonization (E1↔E2 chip) ought to propagate into the typed candidate's Content-Type field.
- **Track 01 Tranche 7 (Agentic Capability And Observability Feed)** names "Encode VAK/CF metadata from the profile/context-frame layer" but doesn't acknowledge that **canonical-prefix VAK keys are now carried on every artifact** (per the VAK-substrate plan's outcome statement). The observability stream emitted by the kernel-bridge should specifically include the VAK route lineage so downstream S5 surfacing pipelines can detect Möbius-seam drift, dispatch-tool mismatch, and capability-matrix violations.
- **Track 11** carries no decision around `capability-matrix.json` as canonical governance authority. Worth adding (suggest `IOD-17 — capability-matrix.json as canonical agent-tool governance`) naming: the three-way parity test, the `upstream_required` invariant, the gate-vs-dispatch distinction (gate-only tools like `nous_disclose` vs dispatch tools), and the cross-plugin authority (the matrix lives under `Body/S/S4/plugins/pleroma/` but is consumed by Anima runtime + agent.md frontmatter).
- **Track 11 PRD-04 (Theia extension API)** discussion of skills/`SKILL.md` should note the implementer's deliberate scope departure: `vak_profile` is a skill-level concept (every `skills[]` entry has a matching `skills/<name>/SKILL.md`), but dispatch_tools[] entries are tools not skills and carry no `vak_profile`. This is the correct invariant per the matrix's `test_matrix_maps_real_agents_skills_and_hooks` test.
- **Source-spec drift:** `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` is now stale relative to the test-locked parity (matrix + anima.md). Either CONTRACT.md needs updating to match, or it should be marked deprecated with a pointer to the test-locked parity views as the canonical authority. Track 09's source-inventory should reference the canonical views.

**Impact on findings:** Adds [I-8] (important — operational reality not yet reflected in plans). Adds `IOD-17` recommendation. Sign-off criterion C12 added.

---

## §1 Executive summary

The plan-set is **ready-to-engineer once §0 decisions are folded in, with a small number of important revisions remaining**. The work demonstrates substantive canon-fidelity (M5-2/3/4 attributions hold across every track), substrate-first sequencing discipline (S0/S2/S3/S5 lanes precede surface lanes; Phase-1 vertical slice is explicit), engineering-actionable tranches with named deliverables / verification / readiness gates, faithful absorption of the prior Theia plan (Track 05 explicitly supersedes its §11), and a substantive open-decisions register (Track 11's 26-decision instrument with options/defaults/validation paths is a major artifact in its own right). The existing `/Body/` substrate is honoured throughout — tracks extend the live Rust cores at `Body/S/S0/portal-core/`, `Body/S/S2/graph-services/`, `Body/S/S3/epi-spacetime-module/`, and `Body/S/S5/epii-autoresearch-core|review-core|agent-core/` rather than greenfielding parallel implementations. Mock-free verification discipline is consistent. The §0.1 S1-via-obsidian-md-vsc decision resolves the former S1 gap with genuine architectural elegance — vault becomes the canonical knowledge filesystem reached as IDE chrome, and Nara/S4/Anuttara/Logos-Atelier all compose with that substrate rather than parallel storage. The §0.2 cymatic-engine truest-version scoping recognizes substantial substrate work as substantial substrate work.

**Top 5 issues (by severity, after §0 resolutions):**

1. **Resolved by R-4 propagation pass.** Former [I-8] — VAK-as-Operational-Substrate landing across Tracks 09 / 04 / 01 / 11 / 00-overview — is now landed. Track 09 source-inventory cites capability-matrix + test-locked parity; T1 route outcomes carry MoiraiNightPass / AnimaSelfInvoke / FusionDispatch; T2 extends matrix rather than duplicates; Track 04 Tranche 1 carries `ClosureKind` + `ContentTypeRegister` (CT4a/CT4b); Track 04 keystone #6 names the operational `Khora→Moirai→Sophia→Aletheia→Epii→recompose` cycle; Track 01 Tranche 7 carries canonical-prefix VAK keys + VAK route lineage; Track 11 carries `IOD-17` + PRD-04 skill-vs-tool invariant; 00-overview flags CONTRACT.md as historical-not-authority. C12 sign-off criterion is met.
2. **Important (state mismatch):** §0.3 surfaces that Track 02 ("Bimba-Map Population") is mis-framed against the actual S2 substrate state — the bimba map is already populated, datasets are imported, prior plans have executed the population work, and `Body/S/S2/graph-services/src/` carries production code. Track 02 T3/T4 plan first-time population that has already happened; the track needs to be re-cast as drift-audit + extension work. See [I-7].
3. **Blocking-now-resolved (tracking work):** §0.1 lands the S1 architectural decision but the plan-set still needs an explicit S1 chrome contribution added to Track 05 T4 and S1-queue-drain language across Tracks 02/04/06 re-anchored to "vault file watcher". This is a propagation pass, not a new design decision.
4. **Blocking-now-resolved (tracking work):** §0.2 lands the cymatic-engine truest-version scoping but the plan-set still needs Track 12 (Cymatic Engine Substrate) added and Tracks 07 T5C / 07 T7D / 08 T3 / 08 T5 re-cast as consumers. This is structural propagation, not new design.
5. **Important (still open):** Cascading-risk gap between PRD-01 (Theia hosting mode) and PRD-03 (kernel-bridge host). If PRD-01 falls back to Electron sidecar, the recommended-default Tauri-singleton-with-Theia-adapter (PRD-03) becomes non-trivial — bridge ownership ripples to all of Tracks 05–08. This cascade is not yet surfaced as a contingency in Track 11.

**Top 3 strengths:**

1. **Substrate-first vertical slice in Phase-1** (overview §Phase 1) names exactly the right end-to-end demo: S0 profile → S3 native projection → bridge → /body + Theia + M5-4 evidence deposit. This is the alpha §11.7 milestone framed as an integration gate rather than a documentation aspiration.
2. **Track 06's "Evolution, Not Replacement" discipline** — explicit foothold/compatibility/placeholder classification of every existing `/body` file (Shell.tsx, OmniPanel, kernelProjection, spacetime.rs, etc.). This is the right respect for the existing Tauri-v2 codebase.
3. **Track 11's 26-decision register** with consistent Question/Why/Affected-tracks/Options/Recommended-default/Validation-path/Consequence-of-delay structure across PRD/IOD/UFV/DSD/DCC categories. Defaults are conservative and preserve canon (one-app/two-surface, one bridge identity, S5 human gates, protected-local privacy). This is the load-bearing instrument that lets the user resolve architectural choices deliberately.

**Overall verdict:** Ready-to-engineer once the §0 decisions are propagated (S1 chrome contribution + Track 12 cymatic substrate), the PRD-01→PRD-03 cascade is annotated, Track 09 is reformatted for parity with its peers, and the M5-0 / S4-scope / DCC-05 items are landed. Several other items are polish. The plan-set as it stands plus the §0 decisions plus the §6 propagation pass yields a coherent, truest-version M'/S' build program.

---

## §2 Findings by severity

### Blocking (must fix before engineering work can begin)

After §0 resolutions, no blocking-design items remain. The two former blockers become propagation work:

- **[R-1] (Resolved by §0.1) S1 architectural reach via `obsidian-md-vsc`.** Canon §1.2 places S1 inside M5-2; §0.1 confirms S1 reach into the local filesystem is rendered via the `willasm.obsidian-md-vsc` VS Code Extension Marketplace extension hosted as a Theia VS Code-API extension inside `/pratibimba/system`. **Propagation work required (not blocking design):**
  - Add an S1 chrome contribution to Track 05 T4 alongside Bimba graph viewer / Canon Studio / Agentic Control Room / coordinate tree / Logos Atelier — specifically the obsidian-md-vsc-hosted vault browser/editor view, with vault path discovery, wiki-link rendering, and Bimba-coordinate `[[M3-5]]`-style cross-link resolution against S2 coordinate identity.
  - Re-anchor "S1 queue drain" / `s1.sync.flush` language in Tracks 02 (T6 dependency), 04 (Dependencies §1), and 06 (T0/T4 dependencies) to "vault file watcher → S2 ingestion / Nara write path observation". Tracks should reference `obsidian-md-vsc` configuration and the filesystem watcher rather than a custom sync API.
  - Add a small IOD to Track 11 (suggest `IOD-15 — vault-as-S1 conventions`) naming: vault root discovery, Bimba-coordinate filename conventions, wiki-link-to-coordinate resolution rules, write-discipline for Nara/S4 deposits, and the obsidian-md-vsc activation/configuration surface inside Theia.
  - Refine PRD-04 in Track 11 to note the strategic VS Code-API extension borrow as a principled exception that preserves the "Theia-native throughout for architectural coherence" rule — exactly the ecosystem-compatibility advantage Theia's dual-extension-API model exists for.

- **[R-2] (Resolved by §0.2) Cymatic engine sized as substantial substrate work.** Per §0.2, the cymatic engine per `m4-prime-psychoid-cymatic-field-engine.md` §§11/13/14/15.4/18.4 is recognized as substrate work consumed by both M2 cosmic-scale rendering and M4 personal-field rendering. **Propagation work required (not blocking design):**
  - Add **Track 12 — Cymatic Engine Substrate** to the folder. Suggested tranche shape: T0 audio-bus + WebGL/three-fiber baseline (gated on Track 01 audio-bus contract); T1 deterministic standing-wave renderer driven by `audio_octet[8]` + `nodal_quartet[4]` per spec §11; T2 cosmic-vs-personal mode parametrization with privacy gates; T3 Option F full-physics path per spec §11 (the truest-version target — stylized fallback only as explicit readiness-declared lower-fidelity mode per spec §13); T4 contribution exports for Tracks 07 + 08 consumption; T5 acceptance against real audio bus + real planetary-chakral data + privacy audit. Substantial substrate work; gate downstream consumers on real-functionality completion.
  - Re-cast Track 07 T5C (`m2-parashakti` cosmic-scale cymatic) as a Track-12 consumer — first slice now sized realistically as "meaning-packet builder + 72-tree browser + Klein-flip visualiser + routing traces + cymatic-substrate-subscriber-with-readiness-gate". The cosmic-scale rendering is fed by Track 12 rather than implemented inside T5C.
  - Re-cast Track 07 T7D (`m4-nara` personal psychoid cymatic) as a Track-12 consumer for the protected-local personal-field rendering, with the same readiness-gate pattern. The Option F full-physics target lives in Track 12 T3 and propagates to T7D.
  - Re-cast Track 08 T3 (integrated 1-2-3 cosmic-engine) and Track 08 T5 (integrated 4/5/0 Jiva-is-Siva recognition) as composers of Track-07-exported cymatic contributions which are themselves Track-12 consumers — preserves the existing IntegratedSurfaceContribution contract.
  - Update Track 00 dependency graph and Phase-3 description to show Track 12 in parallel with Track 07 (substrate consumed by extensions), gated on Track 01.

### Important (should fix; will produce friction otherwise)

- **[I-1] PRD-01 → PRD-03 cascade is not surfaced.** Track 11 PRD-01 names Electron sidecar as last-resort fallback. Track 11 PRD-03 recommends "hybrid Tauri singleton plus Theia-native adapter" as default for the kernel-bridge host. These are coupled: if PRD-01 resolves to Electron sidecar, then the bridge host can't naturally live "in the Tauri Rust process" any longer — the IDE is a separate Electron process. Tracks 05 T2, 05 T3, 06 T1, 07 Tranche 1, and 08 T2 all depend on the bridge-host decision. **Recommended fix:** add a "Cascading consequences" subsection to PRD-01 in Track 11 naming that Electron-fallback shifts PRD-03's recommended default; add a tranche-gate in Track 05 T2 noting "if Electron sidecar selected, re-open PRD-03 ADR before T3 starts".

- **[I-2] Track 09 tranches collapse Deliverables and Verification into single dense paragraphs.** Every other track uses the spacious format `Deliverables:` then `Verification:` then often `Readiness blockers:`. Track 09 T0 through T10 each compresses these into a continuous paragraph. The content is present but the format makes Track 09 — the densest cross-cutting track covering VAK routing, agent authority, six operational capacities, and the Agentic Control Room E2E — the hardest to scan, assign, or chunk into PR-sized work units. **Recommended fix:** reformat Track 09 T0–T10 to match the Track 04 / Track 07 / Track 08 pattern. No content change required.

- **[I-3] S4 PI runtime substrate is named only as a dependency, not as scope.** Track 09 names S4/PI/ta-onta as runtime dependencies and cites `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md`, `Body/S/S4/pi-agent/README.md`, etc. But no track in this folder builds out S4' VAK runtime, PI-agent agent-spawning, or ta-onta module hardening. Canon §1.2 places S4 inside M5-2 ("S4 Claude/agent-SDK — LLM integration substrate"). Track 09 T2 verification requires "`epi agent verify-runtime` lane must prove the run envelope reaches a managed agent runtime when provider credentials are available" — this assumes the PI runtime exists. **Recommended fix:** Acceptable to scope S4 internals out, but the plan should say so explicitly in 00-overview and 09 — naming `2026-04-23-vendor-spine-pi-port.md`, `2026-04-02-native-pi-epi-agent-convergence.md`, `2026-04-03-pi-cmux-native-orchestration.md` as the owners of S4 substrate work — and Track 09's claims about PI runtime should be gated as "S4 readiness blocker if those plans are not landing in parallel".

- **[I-4] M5-3 sub-coordinate coverage is partial.** Canon §1.2 names the M5 sixfold as M5-0 (Library/Gnostic Namespace), M5-1 (Philosophy/Canon Studio), M5-2 (Backend Studio), M5-3 (Frontend Studio), M5-4 (Agentic Control Room), M5-5 (Logos Atelier). Of these, M5-2/3/4 are explicit track owners. M5-1 (Canon Studio) appears as IDE chrome in Track 05 T4; M5-5 (Logos Atelier) is named as IDE chrome in Track 05 T4 and as workspace contribution in Track 06; **M5-0 (Library/Gnostic Namespace) has no explicit chrome contribution**. The canon places "Bimba pedagogy, Gnosis library, RAG-anything substrate, kbase integration, all subsystem documentation in queryable form" at M5-0. The `Body/S/S5/epi-gnostic/`, `epi-kbase/`, `epi-kbase-core/` directories exist. **Recommended fix:** either add an M5-0 Library-chrome contribution to Track 05 T4 (Bimba pedagogy/Gnosis library browser as IDE chrome), or annotate 00-overview that M5-0 surfaces are deferred behind M5-3 first slice with named Body/S/S5 owners. Otherwise the IDE's gnostic-namespace reach (referenced by Track 04 M5-3 DTOs `gnosis://`, `etymology://`) lacks a rendering owner.

- **[I-5] Track 11 IOD-12 (observability schema ownership) creates two potential authorities.** The recommended default is "Track 01 owns transport/runtime event envelope and Track 04 owns review/autoresearch meaning". This is sensible but produces two schemas that must stay aligned (kernel-bridge event shapes vs S5 observability candidates). Without a single fixture/contract authority, drift is likely. **Recommended fix:** add to IOD-12 a concrete location for the canonical event-family registry (e.g., "the shared event-family registry lives in `Body/S/S0/epi-cli/schemas` and is consumed by both `kernel-bridge` and `epii-autoresearch-core`"). Track 04 Tranche 0 should already register against that location.

- **[I-6] DCC-05 (audio bus / cymatic derivation ownership) holds an unresolved architectural truth as deferred contradiction.** The recommended default says "Document S0/portal-core as current bus derivation implementation". But `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` implements an M2-1' function under the S0 crate — that's not just a documentation wrinkle; it's load-bearing for the M5-2 attribution claim that S0 owns kernel substrate. The decision should either be **resolved** (S0 hosts M2-1' computation as an implementation detail with M2 retaining specification authority) or **escalated** (the file should move to a dedicated M2-1' crate). **Recommended fix:** promote DCC-05 from "deferred contradiction" to a Wave-1 IOD with the chosen home named explicitly. The current wording lets the issue persist past alpha without a concrete owner.

- **[I-8] Tracks 09 / 04 / 01 do not yet reflect the VAK-as-Operational-Substrate landing.** The `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md` plan has all 10 chips closed (`19fbc8fc`, `c7533a2`, `f7ba403`, `7273ae9`, `d1c89ab`, `7103576`, `419aac5`, `ec9592c`, `9abc13f`, `a664b51`); three-way parity (`capability-matrix.json` ↔ runtime `animaDefaultTools` ↔ `pi-agent/agents/anima.md` frontmatter) is enforced by `test_agent_capability_gates_anima_tools_matches_anima_md_tools`. What changed: Anima now carries 15 tools (was 8); `dispatch_tools[]` has 6 entries each with `upstream_required: ["vak-evaluate"]`; `nous_disclose` is gate-only; `sessions.patch` RPC carries `vak_address`; `closure_kind` discriminator tags Aletheia→Epii append; `MOIRAI_CF` + `validateFusionDispatch` gate fusion dispatch; `epi gate dispatch anima-invoke` CLI is wired; CT4 harmonized to CT4a/CT4b; `D5` guardrails apply to `dispatch_fusion_agents`. The operational cycle `Khora compose → execution → Moirai rehear → Sophia witness → Aletheia routes Sophia → Epii inbox (closure_kind tagged) → Epii recompose → next-cycle seed` is now load-bearing with env-propagation + gateway-record. **Recommended fix:** propagate the operational reality through Tracks 09, 04, 01, and 11 per §0.4 detailed list. Specifically: update Track 09 source-inventory and T1 route outcomes; reference `capability-matrix.json` + three-way parity test as canonical governance in Track 09 T2; partially resolve Track 09 "Anima orchestration binding" open decision; add `closure_kind` + `CT4a/CT4b` to Track 04 Tranche 1 typed schema; add `Khora→Moirai→Sophia→Aletheia→Epii→recompose` cycle naming to Track 04 architectural keystones; add canonical-prefix VAK keys on every artifact + VAK route lineage in observability stream to Track 01 Tranche 7; add `IOD-17 capability-matrix.json as canonical agent-tool governance` to Track 11; refine Track 11 PRD-04 with the skill-vs-tool / vak_profile-is-skill-level invariant. Also flag `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` (8-tool inventory) as stale relative to the test-locked parity — either bring it in line or deprecate with pointer.

- **[I-7] Track 02 plans population work that has already been done.** Track 02 is titled "S2/S2' Bimba-Map Population Implementation Track" and its T3 (Canonical coordinate seed baseline) + T4 (Dataset population from existing corpus) deliverables describe first-time `seed_coordinate_space` execution and first-time `epi graph import all` against `docs/datasets/`. Both are already done — the live `Body/S/S2/graph-services/` has `seed.rs` and `dataset_import.rs` as production code; `docs/datasets/` has all six deep branches imported with `nodes_hash.json` + `relations_hash.json` reconciliation artifacts; prior plans `2026-03-10-graph-bootstrap-health.md`, `2026-05-17-bimba-map-ingestion-plan.md`, and `2026-05-19-deep-bimba-regional-property-update-protocol.md` have executed the population work. The track's "Current implementation surface observed" line correctly inventories the substrate but the tranche structure treats it as empty. **Recommended fix:** rename and restructure Track 02 per §0.3 — title to "S2/S2' Graph Law Extension and Consumption Surface"; expand T0 to baseline-snapshot the populated state; delete or re-cast T3 as idempotent-verification; delete or re-cast T4 as deep-branch reconciliation audit; preserve T1, T2, T5–T9 as forward work; cite the three prior plans as inherited prior-work. Reserve "import datasets from scratch" semantics for the documented destructive-rebuild path in T9 runbook scope only.

### Minor (polish; nice-to-have)

- **[M-1] Source Specs lists across tracks 01–08 are extensive and partially redundant.** Each track lists 8–14 source specs with §-precise references. The repetition (`m5-prime-system-shape-and-tauri-ide-canon` cited in 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11) is reinforcing rather than wasteful, but a "shared canon manifest" at the folder root that tracks reference by ID would shrink each track by ~30 lines without losing precision.

- **[M-2] Track 11 and individual-track Open Decisions duplicate.** Each substrate/surface track has its own "Open Decisions" list, most of which restate items already in 11. This is by-design (local to-do vs master register) but a reader new to the plan-set may not realize the per-track list is a leaf of 11. **Recommended fix:** every per-track "Open Decisions" item should carry the 11-ID parenthetically (`(see IOD-04)`), and Track 11 should mark which per-track lists are folded in.

- **[M-3] Track 05 T2 fallback to Electron sidecar is not gated by a hard alpha-block criterion.** The plan correctly names Electron as "last-resort fallback" but does not say "if Electron sidecar is selected, alpha gate is re-scoped to single-product-not-two-app verification". This contradicts canon §3.3 ("the user experiences one Tauri app") — Electron sidecar makes this an "app supervises an embedded second app". A blocking criterion would force the team to surface this consequence rather than rationalize it post-hoc.

- **[M-4] Track 09 T7 (Nara Anima-primary) prerequisites include Anima gates 1–5 but the gate boundaries are paraphrased.** The five Anima gates (admission, refresh-trigger, deployment, rollback, DPO-trigger) come from `m5-prime-epii-on-nara-qlora-dialogic-voice.md` §6. Track 09 names them but does not anchor each to the source-spec §-number, which is the discipline followed elsewhere in the plan-set. Minor consistency fix.

- **[M-5] No track names the privacy-audit tool owner.** Tracks repeatedly require "privacy scans" / "privacy audit checks Tauri events, SpaceTimeDB rows..." (e.g., Track 03 T7, Track 06 T8, Track 09 T7). The tool to actually execute these audits is unowned — neither a CLI subcommand (`epi privacy audit ...`?), a CI lane, nor a script is named. **Recommended fix:** add a small workstream to Track 01 or Track 10 naming the privacy-audit harness (could be one tranche of S size).

- **[M-6] Track 02 T5 (Anuttara/OWL n10s bridge) and Track 11 IOD-06 (Anuttara field naming) are tightly coupled** but neither explicitly references the other. IOD-06 recommends `c_1_symbol`-style coordinate-prefixed keys; Track 02 T5 references "`symbol`, `formulation_type`, `complete_formulation` or their approved names". A single resolved naming choice should be in place before T5 starts.

---

## §3 Findings by dimension

### D1 — Canon fidelity

**Strong.** M5-2 = S-stack, M5-3 = M'-Tauri/Theia, M5-4 = operational-capacities + agentic mediation are the explicit framing in every track preamble. Citations are precise (file path + §-number, sometimes line numbers — e.g., `spacetimedb_bridge.rs:603-641` in Track 03). The Siva-Shakti polarity at the system register is honoured. The QL Mod 4 + Mod 6 inheritance for the two integrated plugins is preserved in Track 08's framing (cosmic-engine = `(0/1/2/3)`, user-experience = `(5/0)`). The kernel-bridge as foundational extension is consistently positioned as the M5-2 access point.

**Issues:** I-4 (M5-0 surface gap), I-6 (DCC-05 unresolved load-bearing ownership), M-4 (Anima gates not §-anchored).

### D2 — Sequencing discipline

**Strong.** Substrate tracks 01–04 are explicitly ordered ahead of surface tracks 05–08. Track 00 Phase 1 ("Substrate-First Vertical Slice") names the demo S0→S3→bridge→/body+Theia→M5-4 evidence. Track 05 T3 (kernel-bridge adapter) gated by Track 01 T5–T7 + Track 03 T1–T5. Track 06 T1 gated by Track 01 contract package. SpaceTimeDB native-WebSocket completion (alpha §11.7) lands in Track 03 Tranche 3 — the right place. Autoresearch surfacing-pipelines (Track 04 T8) gated by kernel-bridge observability (Track 01 T7). M-extension and plugin tranches all gate on backend readiness.

**Issues:** none material. The PRD-01→PRD-03 cascade [I-1] is sequencing-adjacent but lives in D6.

### D3 — Engineering actionability

**Strong with one weakness.** Tranches are scoped (named deliverables + named verification + readiness gates). Deliverables name concrete files, APIs, methods, services. Verification uses runnable commands (`cargo test --manifest-path Body/S/...`, `npm run test:e2e --prefix Body/M/epi-tauri`). Acceptance criteria are testable (`10 simultaneous subscribers hold world_clock within +/-30 ms for a sustained 10-minute run`, Track 03 T7).

**Issues:** I-2 (Track 09 format collapse). Former [B-2] cymatic-engine under-scoping resolved by §0.2 / Track 12 split.

### D4 — Existing-substrate honouring

**Strong overall, with one partial fail in Track 02.** Most tracks both inventory and honour the state of the live `/Body/` surfaces they extend:
- Track 01 cites `Body/S/S0/portal-core/src/parashakti/`, `nara_journal.rs`, `personal_identity.rs`, `codon_rotation_projection.rs`, `events.rs` — all real files in the current portal-core tree, framed as substrate to extend.
- Track 03 cites `spacetimedb_bridge.rs:603-641` and `SpacetimeProjectionSubscription::next_context:648-668` and the gateway-contract crate — line-level precision, framed correctly as completion-of-stub-not-restart.
- Track 04 cites all three S5 cores by Cargo.toml and their inbox/recompose/store modules — extends the live `Body/S/S5/epii-autoresearch-core`, `epii-review-core`, `epii-agent-core` per the spine spec §1.1, with Tranche 0 explicitly characterizing existing behavior before schema changes.
- Track 05 cites the existing `Body/M/epi-tauri/` package.json, vite/vitest/playwright configs, Shell.tsx, OmniPanel.tsx, commands/, gateway/, graph/, temporal/, vault/, agents/, atelier/, library/ — knows what's there.
- Track 06 makes "Evolution, Not Replacement" its first architectural keystone and inventories every existing service client (`gatewayClient.ts`, `temporalClient.ts`, `graphClient.ts`, `naraClient.ts`, `epiiClient.ts`, `agentExecutionClient.ts`) with foothold/compatibility/placeholder classification — exemplary.

**Partial fail:** Track 02 cites `Body/S/S2/graph-schema/src/lib.rs` (the 2,882-LOC schema authority), `seed.rs`, `dataset_import.rs`, `graph_api.rs`, `external/bimba-mcp/` — the inventory is correct. But the *tranche structure* (T3 first-time seed, T4 first-time dataset import) treats the substrate as empty rather than as already-populated production. The live state — bimba map populated, deep branches imported, `nodes_hash.json`/`relations_hash.json` reconciliation artifacts present, prior plans `2026-03-10-graph-bootstrap-health.md` / `2026-05-17-bimba-map-ingestion-plan.md` / `2026-05-19-deep-bimba-regional-property-update-protocol.md` executed — is not honoured in the work plan. This is the kind of issue that produces friction (engineer picks up T3, finds the graph already seeded, has to re-derive what the tranche actually means). See [I-7] and §0.3 for the recast.

The plan-set does not greenfield, but Track 02 plans phantom-population that has already happened. Other tracks are clean.

### D5 — Theia plan absorption

**Strong.** Track 05 explicitly: "Track 05 supersedes [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] section 11 as follows: T0-T2 replace Tranche 1.1, T3 consumes Tranche 1.2, T4-T5 consume Tranches 1.3-1.4, T6 consumes Tranche 1.5 as a contribution-registry slice, T7 consumes sections 6-7 integrated plugin planning, and T9 replaces Tranche 1.6 with an end-to-end release gate."

The Theia plan's 10 open architectural questions (§10) are folded into Track 11 (PRD-01 through IOD-14 + DSD-01..06). Tranche 1.1 (architectural prototype to resolve Tauri-webview-vs-Theia-Electron) becomes Track 05 T0–T2 with explicit ADR criteria. Theia §4 (kernel-bridge) → Track 01 Tranches 5–7 + Track 05 T3. Theia §5 (ide-shell-m0-m5) → Track 05 T4. Theia §6 (six individual M-extensions) → Track 07. Theia §7 (two integrated plugins) → Track 08. Theia §8 (0/1 ↔ IDE bridging) → Track 06 + Track 05 T5.

**Issues:** none. This absorption is exemplary.

### D6 — Open-decisions discipline

**Very strong.** Track 11's 26 decisions across 5 categories (4 declared in tranches, 5 in the index) cover the architecture-shaping space: PRD-01..04 prototype-gated, IOD-01..14 implementation-owner, UFV-01..04 user-final, DSD-01..06 dependency/sequencing, DCC-01..06 deferred-canon. Each entry: Question / Why it matters / Affected tracks / Options / Recommended default if safe / Validation path / Consequence of delaying. The defaults preserve canon (one-app/two-surface, one bridge identity, S5 human gates, protected-local privacy).

**Issues:** I-1 (PRD-01/PRD-03 cascade not surfaced), I-6 (DCC-05 should be IOD not DCC), M-2 (per-track lists not cross-IDed), M-3 (Electron-sidecar fallback not gated against canon §3.3 one-app law).

### D7 — Cross-track integration

**Strong.** Track 00 has a Mermaid dependency graph (lines 132–165) showing D→S0/S2/S3/S5/Tauri→Bridge→Body/Ide→Ext→Plugins→Alpha with M5-4 agents folded in. Track 00 names four phases with timelines and exit criteria. Track 10 specifies ten tranches T0–T9 with concrete cross-track demos:
- T1: profile generation observed through native SpaceTimeDB within 100 ms (alpha §11.7 milestone)
- T3: same profile generation in CLI/gateway/bridge/`/body`/Theia/M5-4 capability reader
- T5: Tauri summons real Theia workbench, opens real S2 graph node, opens real S5 review record, records evidence
- T9: full local alpha scenario with operator runbook, privacy report, replan

Critical path articulated (T0 → T1 → T3 → T4/T5 → T6 → T7 → T8 → T9). Parallel paths called out (T2 graph + review baselines parallel with T1).

**Issues:** none material.

### D8 — Bloat / concision

**Mostly acceptable.** ~2,900 lines for 12 tracks averages 240 lines/track. Track 11 at 434 lines is justified by its 26-decision instrument. Track 07 at 364 covers 6 extensions with per-extension sub-tranches. Architectural Keystones across tracks reinforce shared principles (one bridge, kernel-bridge-only, mock-free, readiness-is-capability-not-health) — this is reinforcement, not bloat. Source-spec citations include §-numbers which adds engineering value.

**Issues:** M-1 (Source Specs lists could share a folder manifest), partial bloat in track 01 and 05 preambles re-stating M5-2/3/4 framing.

### D9 — Coverage completeness

**Partial.** Verified present:
- S0 kernel-bridge (Track 01), S2 bimba-map (Track 02), S3 gateway+SpaceTimeDB (Track 03), S5 autoresearch+review (Track 04)
- Theia IDE shell + Tauri composition (Track 05), `/body` evolution (Track 06)
- All six M-extensions m0–m5 (Track 07), both integrated plugins (Track 08)
- All four agents Sophia/Anima/Pi/Aletheia (Track 09 keystone §3)
- All six operational capacities (Track 09 keystone §4, T5–T8)
- Omni panel (Track 05 T5), cross-surface deep-link (Track 06 T6), background/menubar lifecycle (Track 06 T7)

**Gaps (after §0 resolutions):**
- **S1 Obsidian/vault** — now owned per §0.1 via embedded `obsidian-md-vsc` as Theia chrome contribution; propagation work in [R-1]. Resolved.
- **Cymatic engine substrate** — now owned per §0.2 via new Track 12; propagation work in [R-2]. Resolved.
- **S4 Claude/agent-SDK substrate** — referenced as Track 09 dependency, scope-cap should be explicit. Still open. [I-3]
- **M5-0 Library/Gnostic Namespace** — no chrome contribution; canon §1.2 places substantial Bimba pedagogy + Gnosis library + kbase integration here. Note: with §0.1 in place, the Gnosis library could itself be a vault-resident corpus surfaced through obsidian-md-vsc chrome — but that's a refinement that needs to be deliberately landed, not assumed. Still open. [I-4]
- **M5-5 Logos Atelier** — mentioned as IDE chrome (Track 05 T4) and side workspace; with §0.1 it composes naturally with Obsidian's wiki-link graph. Sufficient for first slice.
- **M5-1 Philosophy / Canon Studio** — covered by Canon Studio (Track 05 T4). With §0.1, Canon Studio markdown editing can ride obsidian-md-vsc's rendering layer where it benefits. Sufficient.

---

## §4 What's working well

Beyond the executive-summary strengths, specific elements worth confirming as load-bearing:

1. **Track 04's characterization-tests-first tranche (Tranche 0).** Locking existing `ImprovementStore`, `ReviewStore`, `EpiiAgentAccess`, `InboxStore`, `recompose_pass` behavior **before** schema changes — and capturing fixture JSON for migration tests — is exactly the right way to extend live cores without breaking the Z-cycle / Aletheia / human-gate invariants the spine spec depends on. This pattern should be the template for every extension of live S-stack code.

2. **Track 03's verification numerics carry canon weight.** The 100 ms `bind_kairos_surface` → Tauri delta budget (alpha §11.7 milestone 1), the +/-30 ms 10-subscriber world-clock budget, the 50-user coincidence harness — these aren't fluff; they're the actual integration-gate criteria the alpha quaternionic spec set. Honoring them as Tranche-3 / Tranche-4 verification, not "follow-on perf work", is correct.

3. **Track 06's foothold/compatibility/placeholder taxonomy.** Classifying `kernelProjection.ts` as foothold, `clockStore`/`clockClient` as compatibility, `spacetime.rs` native-WebSocket as placeholder-to-replace, `HighlightSidebar` empty state as placeholder needing real backend — this gives the implementation team a per-file disposition map. No other track does this as explicitly.

4. **Track 09's M5-4-is-a-bridge framing.** Architectural Keystone §1: "M5-4 does not compute profile law, graph law, SpaceTimeDB truth, review state, or promotion authority. It mediates across S0/S2/S3/S4/S5 contracts." This is the right inversion of the temptation to make M5-4 a "smart layer that does things" — it's a routing/governance/evidence membrane only, and that constraint is what makes Sophia/Anima/Pi/Aletheia authority testable.

5. **Track 11's "recommended default if safe" pattern.** For every decision, naming a conservative default (Tauri-singleton-with-Theia-adapter for the bridge, browser-mode-first for Theia, JSON-backed S5 storage for first slice, hybrid local-first Nara vault, etc.) is the right way to unblock implementation behind seams while leaving the canonical decision open for user-final validation. The defaults are not silently resolved — each one names its validation path and consequence-of-delay.

6. **Mock-free verification discipline is consistent.** Every track ends its Verification sections with anti-mock criteria (`Body/S/S0/portal-core` tests must use real C arenas; S3 tests must run against local `spacetime start`; S5 tests must use real persisted JSON; Theia tests must use real DI/contribution activation, not a static "hello" page). This rejection of green-but-fake readiness is the kind of discipline that prevents alpha-stage rot.

7. **The kernel-bridge → autoresearch observability feed.** Track 01 Tranche 7 names the observability stream feeding S5 spine surfacing-pipelines per autoresearch spec §3.2/§3.4. Track 04 Tranche 8 closes the loop with per-pipeline adapters. This is the load-bearing seam of the whole self-improvement system, and both tracks build to it consistently.

8. **The §0.1 S1-via-obsidian-md-vsc decision (confirmed during review) is architecturally elegant.** Rather than building S1 vault sync from scratch, the plan-set borrows one strategic VS Code extension (Theia's dual-extension-API model was designed for exactly this) and lets the user's Obsidian vault become the canonical knowledge filesystem reached as IDE chrome. The cascade is genuinely deep: Nara writes (M4') land in real Obsidian-readable files; S4 agent deposits become vault file writes with privacy gates; S2 ingestion becomes filesystem-watcher-driven; Anuttara wiki-link rendering and Logos Atelier compose with Obsidian's link graph rather than reinventing them. This is *more* canon-faithful than a custom S1 sync would have been — the vault is genuinely a canonical knowledge filesystem, not a parallel storage layer.

---

## §5 New open questions surfaced during review

These are not yet in Track 11 but should be considered for the next revision pass:

- **NQ-1 — (Resolved by §0.1) S1 vault sync.** The vault-as-S1 reach is rendered through embedded `obsidian-md-vsc`; S2 ingestion becomes filesystem-watcher-driven. The remaining sub-decision — *Hen compiler mutation law* (DSD-03) for non-dry-run promotion — is genuinely distinct from vault sync and remains correctly held back as DSD-03; `Body/S/S1/hen-compiler-core/` and `Body/S/S1/hen-compiler/` exist and their mutation-law work is its own scope. Worth naming in 00-overview that "S1 vault is reached via §0.1 obsidian-md-vsc; S1 Hen compiler mutation law is owned by `2026-03-06-epi-skills-system-design.md` / `2026-03-07-epi-logos-lib-packaging.md` and follow-on Hen work; non-dry-run promotion blocked per DSD-03 until those land".

- **NQ-2 — S4 substrate evolution rhythm vs Track 09 readiness.** Tied to [I-3]. Track 09's mediation correctness depends on PI runtime + ta-onta Anima + S4 plugins. Existing plans `2026-04-23-vendor-spine-pi-port.md`, `2026-04-02-native-pi-epi-agent-convergence.md`, `2026-04-03-pi-cmux-native-orchestration.md`, `2026-04-04-omx-vak-skill-fork-plan.md` cover parts. Should Track 09 reference these as parallel/upstream plans, or should a Track 09.5 unify them under M5-4's scope?

- **NQ-3 — M5-0 Library/Gnostic Namespace as IDE chrome.** Tied to [I-4]. Should the Bimba pedagogy + Gnosis library + RAG-anything browser be IDE chrome (alongside graph viewer / Canon Studio / Agentic Control Room in Track 05 T4)? Or is it deferred to a future m5-0-library extension that doesn't yet exist in 6-individual-extensions? The `gnosis://` URI scheme is already in Track 04 T7's artifact-ref model — so its readers need an owning chrome.

- **NQ-4 — DCC-05 status as deferred-vs-implementation-owner decision.** Tied to [I-6]. Where does the M2-1' Vimarsha-reading function live for the rest of alpha — under `Body/S/S0/portal-core/src/parashakti/` (current implementation reality) or moved to a dedicated M2-1' crate (future canonical home)? This needs a Wave-1 decision before Track 01's `audio_octet` / `nodal_quartet` payload contract hardens.

- **NQ-5 — Privacy-audit harness owner and execution model.** Tied to [M-5]. The plan-set requires recurring privacy scans across Tauri events / SpaceTimeDB rows / S2 payloads / S5 DTOs / Theia state / `/body` DOM / observability events. Owner: Track 01? Track 04? A dedicated tooling tranche? Execution model: CLI subcommand, CI lane, both? Without this, "privacy audit" becomes an aspirational checklist rather than a runnable gate.

- **NQ-6 — Track 09 vs Track 04 workflow-state-machine ownership boundary.** Track 04 owns `OrchestrationState`, `ReviewStage`, `RetryPolicy`, persisted state transitions; Track 09 owns `MediationInvocationEnvelope`, agent authority registry, operational-capacity workflow registry. The seam between "S5 state machine" and "M5-4 mediation workflow" is conceptually clear but at the code level may produce two coupled state machines. Should this be an IOD?

- **NQ-7 — Reset and destructive-rebuild policy for local dev.** Track 02 Open Decision #8 names "destructive rebuild policy for local/dev graph population" but the same question applies to S5 persisted stores, SpaceTimeDB modules, Graphiti state, Nara vault fixtures. The Track 10 T0 harness should include a unified reset model.

---

## §6 Recommended next-action sequence

In order. Each step has a concrete deliverable. Items with `[user]` need user-final validation; the rest can be done by the planning author. §0 resolutions are already landed; the remaining work is propagation + open items.

**Propagation work from §0.1 (S1 via obsidian-md-vsc):**

1. **[R-1.a]** Add S1 chrome contribution to Track 05 T4 deliverables: `obsidian-md-vsc`-hosted vault browser/editor view alongside Bimba graph viewer / Canon Studio / Agentic Control Room / coordinate tree / Logos Atelier. Name vault root discovery, Bimba-coordinate filename conventions, wiki-link-to-coordinate resolution, write-discipline, and obsidian-md-vsc activation/configuration as deliverables.
2. **[R-1.b]** Re-anchor "S1 queue drain" / `s1.sync.flush` language in Tracks 02 (T6 dependency block; T7 ingestion), 04 (Dependencies §1), and 06 (T0/T4 dependencies; vaultClient migration ledger). Replace with "vault file watcher → S2 ingestion / Nara write path observation" semantics.
3. **[R-1.c]** Add `IOD-15 — vault-as-S1 conventions` to Track 11: vault root discovery, Bimba-coordinate filename conventions, wiki-link-to-coordinate resolution rules, write-discipline for Nara/S4 deposits, obsidian-md-vsc activation/configuration. Recommended defaults: vault root via user-specified or env-var; filenames mirror M-coordinate (e.g., `M3-5.md`); wiki-links resolve via S2 coordinate identity lookup.
4. **[R-1.d]** Refine PRD-04 in Track 11 to note the strategic VS Code-API extension borrow as a principled exception that preserves "Theia-native throughout" as the architectural rule for the M-extensions and integrated plugins, while admitting `obsidian-md-vsc` as the named ecosystem-borrow.

**Propagation work from §0.2 (Cymatic Engine Substrate as Track 12):**

5. **[R-2.a]** Add Track 12 — Cymatic Engine Substrate to the folder. Suggested tranche shape per §0.2: T0 audio-bus + WebGL/three-fiber baseline; T1 deterministic standing-wave renderer; T2 cosmic-vs-personal mode parametrization with privacy gates; T3 Option F full-physics path per spec §11 (the truest-version target); T4 contribution exports for Tracks 07 + 08; T5 acceptance + privacy audit. Substantial substrate work — gate downstream consumers on its real-functionality completion, not on a calendar.
6. **[R-2.b]** Re-cast Track 07 T5C (`m2-parashakti` cosmic-scale cymatic) as a Track-12 consumer with realistic first-slice scope. Re-cast Track 07 T7D (`m4-nara` personal psychoid cymatic) the same way with protected-local privacy class.
7. **[R-2.c]** Re-cast Track 08 T3 (integrated 1-2-3) and Track 08 T5 (integrated 4/5/0) as composers of Track-07-exported cymatic contributions, which are themselves Track-12 consumers. Preserves IntegratedSurfaceContribution contract.
8. **[R-2.d]** Update Track 00 dependency graph and Phase-3 description to show Track 12 in parallel with Track 07, gated on Track 01 audio-bus contract.

**Propagation work from §0.3 (Track 02 recast to graph-law-extension):**

9. **[R-3.a]** Rename Track 02 from "S2/S2' Bimba-Map Population Implementation Track" to "S2/S2' Graph Law Extension and Consumption Surface" (or equivalent). Update Goal/Architectural-Keystones preamble to lead with the inherited populated state, not "deliver a production-ready S2/S2' Bimba-map population path".
10. **[R-3.b]** Cite the three prior plans (`2026-03-10-graph-bootstrap-health.md`, `2026-05-17-bimba-map-ingestion-plan.md`, `2026-05-19-deep-bimba-regional-property-update-protocol.md`) in Track 02's Source Specs section as inherited-prior-work whose state Track 02 extends, the same way Track 04 inherits the live S5 cores.
11. **[R-3.c]** Expand Track 02 T0 (Authority and drift preflight) to baseline-snapshot the populated state: node counts per branch (`anuttara-deep`, `paramasiva-deep`, `parashakti-deep`, `mahamaya-deep`, `nara-deep`, `epii-deep`, `low-detail`); relation type histogram; registry drift between `seed.rs`/`dataset_import.rs` emission and `graph-schema` registry; current `#`-vs-M-family residency; current Anuttara field-naming residency; semantic embedding coverage; `nodes_hash.json` / `relations_hash.json` reconciliation. Output the baseline snapshot future work measures against.
12. **[R-3.d]** Re-cast Track 02 T3 (Canonical coordinate seed baseline) from "run schema creation and `seed_coordinate_space` idempotently" to "verify `seed_coordinate_space` is idempotent against the *live* graph; confirm seed-snapshot query set returns expected node/relation counts; document the baseline for future re-bootstrap operations". Or delete entirely and fold the verification into T0 / T9.
13. **[R-3.e]** Re-cast Track 02 T4 (Dataset population from existing corpus) from "import `docs/datasets/low-detail/` and all six deep branches through `DatasetImporter`" to "audit current branch residency against `docs/datasets/` source; verify `c_3_source_dataset` / `c_3_dataset_branch` / `c_3_dataset_branch_label` provenance is complete; reconcile any missing endpoints / duplicate coordinates / unregistered properties surfaced by prior deep-property-update work; confirm no ad-hoc property drift in subsequent edits". The "import datasets from scratch" semantics belong in T9 destructive-rebuild runbook, not in normal forward work.
14. **[R-3.f]** Preserve Track 02 T1, T2, T5, T6, T7, T8, T9 as forward work — they describe genuine extension over the existing populated graph (schema drift reconciliation, plugin readiness, OWL/n10s bridge, GDS overlays, coordinate-native API parity, M5-3/M5-4 consumption contracts, runbook + drift audit). T9 should expand its destructive-rebuild policy section to absorb the "import from scratch" path that T4 currently misframes as normal forward work.
15. **[R-3.g]** Update Track 00 Phase-1 description and dependency graph to reflect that Track 02 is not blocking on initial-population — only T1 drift reconciliation, T7 API parity, and T8 consumption contracts are the load-bearing M5-3/M5-4 prerequisites. Phase-1 timing may shorten as a result.

**Propagation work from §0.4 (VAK-as-Operational-Substrate landing) — LANDED:**

16. **[R-4.a] ✓ Landed.** Track 09 line 32 source-inventory replaced: `capability-matrix.json` + `anima.md` test-locked parity is now canonical; the 15-tool surface, 6 dispatch_tools[] entries with `upstream_required`, and `nous_disclose`-as-gate-only enumerated; three-way parity test named as the enforcement mechanism; CONTRACT.md marked historical-not-authority.
17. **[R-4.b] ✓ Landed.** Track 09 T1 deliverable extended: `MoiraiNightPass`, `AnimaSelfInvoke`, `FusionDispatch` (with `MOIRAI_CF` + `validateFusionDispatch`) added to route-outcome enumeration; canonical-prefix VAK keys carried end-to-end on every envelope; `sessions.patch` `vak_address` (C1) and `epi gate dispatch anima-invoke` (D3) named as the wired surfaces. Verification covers `MOIRAI_CF`, AnimaSelfInvoke recursive case, fusion validation rejection, and `upstream_required` enforcement.
18. **[R-4.c] ✓ Landed.** Track 09 T2 renamed to "Agent Authority Registry **Extension** And Bounded Run Envelope" — extends the existing matrix at `Body/S/S4/plugins/pleroma/capability-matrix.json` rather than building parallel registry; references three-way parity test; respects D5 guardrails on fusion dispatch (commit `ec9592c`); preserves skill-vs-tool / `vak_profile`-is-skill-level invariant.
19. **[R-4.d] ✓ Landed.** Track 09 Open Decision "Anima orchestration binding" marked partially-resolved by D3 chip; remaining work restated as extending the wired anima-invoke binding to the full dispatch-tool set with canonical-prefix VAK keys + env-propagation + gateway-record. Track 09 Dependencies §8 (S4 PI runtime) updated with full chip-commit lineage.
20. **[R-4.e] ✓ Landed.** Track 04 Tranche 1 typed schema extended with `ClosureKind` enum (C4 contract, commit `d1c89ab`) and `ContentTypeRegister` enum (CT4a/CT4b, E1↔E2 chip, commit `9abc13f`). Tranche 2 Aletheia intake updated to tag every entry with `closure_kind` per the C4 contract. Serde migration policy explicit on legacy-unspecified sentinel handling.
21. **[R-4.f] ✓ Landed.** Track 04 Architectural Keystone #6 (Continuity / Z-cycle) renamed to "the operational cycle is now load-bearing" and concretely names `Khora compose → execution → Moirai rehear → Sophia witness → Aletheia routes Sophia → Epii inbox (closure_kind tagged) → Epii recompose → next-cycle seed` with env-propagation + gateway-record as both load-bearing.
22. **[R-4.g] ✓ Landed.** Track 01 Tranche 7 deliverables and verification both updated: canonical-prefix VAK keys carried on every M5-4-crossing artifact; observability events include VAK route lineage; `epi gate dispatch anima-invoke` is the gateway-facing dispatch boundary; tests assert the three-way parity remains green and verify drift-detection signals for S5 surfacing pipelines.
23. **[R-4.h] ✓ Landed.** Track 11 carries `IOD-17 — capability-matrix.json as canonical agent-tool governance authority`. Decision Index updated; Wave 2 extended to include IOD-17; full entry covers question / why / affected tracks (01, 04, 09) / options / recommended default (matrix sole authority, parity test as enforcement, gate-vs-dispatch preserved, `vak_profile` skill-level only) / validation path / consequence of delaying.
24. **[R-4.i] ✓ Landed.** Track 11 PRD-04 refined with the Skill-vs-tool invariant subsection naming the `vak_profile`-is-skill-level rule and the `test_matrix_maps_real_agents_skills_and_hooks` enforcement; cross-references IOD-17.
25. **[R-4.j] ✓ Landed.** 00-overview Source Specs section now references `2026-05-22-vak-as-operational-substrate.md` as the upstream-completed work; flags `capability-matrix.json` + `anima.md` as canonical with mirror-view discipline; explicitly marks `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` as historical context (8-tool stale inventory) not authority.

**Open items still requiring resolution:**

26. **[I-1 resolution]** Add a "Cascading consequences" subsection to Track 11 PRD-01 naming that Electron-sidecar fallback shifts PRD-03's recommended default and re-opens IOD-01 (single-WebSocket surface). Add a Track 05 T2 gate clause: "if Electron sidecar selected, ADR re-open is required before T3 begins".

27. **[I-2 resolution]** Reformat Track 09 T0–T10 to match the Track 04 / Track 07 / Track 08 Deliverables / Verification / Readiness-blockers pattern. No content change.

28. **[I-3 resolution; user]** Decide S4 scope cap. Name owning plans (`2026-04-23-vendor-spine-pi-port.md`, `2026-04-02-native-pi-epi-agent-convergence.md`, `2026-04-03-pi-cmux-native-orchestration.md`, `2026-04-04-omx-vak-skill-fork-plan.md`) and the now-completed `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md` in 00-overview and Track 09 as the S4 substrate-evolution owners. Track 09 should reference these explicitly and mark S4-blocked readiness when their states require it.

29. **[I-4 resolution; user]** Decide M5-0 Library/Gnostic Namespace surface ownership. With §0.1 in place, a strong option is: Gnosis library + RAG-anything corpus live in the vault under conventional sub-paths and are surfaced through obsidian-md-vsc chrome + a dedicated `s5.gnostic.search` gateway method consuming `Body/S/S5/epi-gnostic/` and `epi-kbase-core/`. Add this as Track 05 T4 deliverable.

30. **[I-6 resolution; user]** Promote DCC-05 from deferred-canon-contradiction to Wave-1 IOD. Recommended truest-version stance: name S0/portal-core as the current and intended home for the M2-1' Vimarsha-reading function — it computes the audio bus at the kernel substrate register where audio-octet / nodal-quartet semantics live, and the M2-1' specification authority (per `M2'-SPEC`) is preserved as documentation/contract authority. Codify this in IOD (suggest `IOD-16`): "S0/portal-core hosts M2-1' Vimarsha computation as kernel-substrate implementation; M2'-SPEC retains specification authority; bridge emits typed `audio_octet` + `nodal_quartet` payload."

31. **[M-2 resolution]** Cross-reference all per-track "Open Decisions" entries with their Track 11 ID (`(see IOD-XX)`). Helps reader navigation.

32. **[I-5 resolution]** Add to Track 11 IOD-12 the canonical observability-event-family registry location: `Body/S/S0/epi-cli/schemas` shared by `kernel-bridge` and `epii-autoresearch-core`.

33. **[NQ-5 resolution]** Add a privacy-audit-harness tranche to Track 01 (or Track 10). Suggest: CLI subcommand `epi privacy audit` that scans persisted state, runtime SpaceTimeDB rows, gateway frames, S5 DTOs, vault Nara files, and Theia/Tauri runtime artifacts for forbidden field patterns. CI lane: dedicated privacy-audit job that runs on every PR touching schema/projection/DTO files.

**Final verification before sign-off:**
- §0.1 propagation (R-1.a through R-1.d) landed.
- §0.2 propagation (R-2.a through R-2.d) landed; Track 12 file exists.
- §0.3 propagation (R-3.a through R-3.g) landed; Track 02 retitled and tranches T3/T4 re-cast or absorbed.
- §0.4 propagation (R-4.a through R-4.j) landed; Track 09 source-inventory + T1 route outcomes + T2 registry references reflect capability-matrix + three-way parity; Track 04 Tranche 1 carries `closure_kind` + `CT4a/CT4b`; Track 04 Architectural Keystones name the Khora→Moirai→Sophia→Aletheia→Epii→recompose cycle; Track 01 Tranche 7 carries canonical-prefix VAK keys + VAK route lineage in observability stream; Track 11 carries `IOD-17` and PRD-04 refined.
- Every per-track Open Decisions item carries its Track 11 ID.
- No track has unowned dependencies — every "Dependencies" entry points to either a Track in this folder or an explicitly-named external plan.
- Track 11 has 29+ decisions (added `IOD-15` vault-as-S1, `IOD-16` M2-1' Vimarsha home, `IOD-17` capability-matrix governance, cascade-consequence note for PRD-01, PRD-04 refinement).
- Track 09 matches peers' Deliverables/Verification format.
- 00-overview explicitly states S1 reach via obsidian-md-vsc, names S4 substrate owners (including completed VAK-as-Operational-Substrate plan), and reflects Track 02's recast as graph-law-extension (not population).
- Privacy-audit harness has an owning tranche.
- `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` either updated to match test-locked parity (15 tools) or deprecated with pointer.

---

## §7 Sign-off criteria

These plans are ready-to-engineer when:

- **C1.** [§0.1 / R-1] S1 reach via embedded `obsidian-md-vsc` is propagated: Track 05 T4 carries an S1 chrome contribution; Tracks 02/04/06 re-anchor S1-queue-drain language to vault file watcher semantics; Track 11 carries `IOD-15 — vault-as-S1 conventions` and refines PRD-04 with the strategic VS Code extension borrow.

- **C2.** [§0.2 / R-2] Track 12 — Cymatic Engine Substrate exists in the folder covering audio-bus baseline, deterministic renderer, cosmic-vs-personal parametrization, Option F full-physics target, contribution exports, and acceptance + privacy audit. Tracks 07 T5C/T7D and 08 T3/T5 are re-cast as Track-12 consumers. Track 00 dependency graph updated.

- **C3.** [I-1] PRD-01/PRD-03 cascade is annotated in Track 11 PRD-01 with a "Cascading consequences" subsection. Track 05 T2 carries a gate-reopen clause for the Electron-sidecar-fallback case.

- **C4.** [I-2] Track 09 T0–T10 reformatted to the peer-track Deliverables / Verification / Readiness-blockers rhythm. Content preserved; structure parity restored.

- **C5.** [I-3] S4 substrate scope made explicit. 00-overview and Track 09 name the S4 substrate-evolution owning plans (`2026-04-23-vendor-spine-pi-port.md`, `2026-04-02-native-pi-epi-agent-convergence.md`, `2026-04-03-pi-cmux-native-orchestration.md`, `2026-04-04-omx-vak-skill-fork-plan.md`); Track 09 marks S4-blocked readiness where their states require it.

- **C6.** [I-4] M5-0 Library/Gnostic Namespace has an owning chrome contribution in Track 05 T4, riding the §0.1 obsidian-md-vsc substrate where it benefits — Gnosis library + RAG-anything corpus surfaced through the vault + a dedicated `s5.gnostic.search` gateway method over `Body/S/S5/epi-gnostic/` and `epi-kbase-core/`.

- **C7.** [I-6] `IOD-16` (or equivalent) lands the M2-1' Vimarsha-function home decision: S0/portal-core hosts the computation as kernel-substrate implementation while M2'-SPEC retains specification authority; bridge emits typed `audio_octet` + `nodal_quartet` payload. DCC-05 dissolves into this resolution.

- **C8.** All per-track Open Decisions items cross-referenced with Track 11 IDs.

- **C9.** Privacy-audit harness has a named owner, an execution surface (`epi privacy audit` CLI subcommand or named script), and a CI lane.

- **C10.** No regressions to the existing strengths: canon-fidelity precision, substrate-first sequencing, real-functionality-test discipline, existing-substrate honouring, Theia-plan absorption, Track 11's conservative-default register pattern. The §0 decisions deepen these strengths (S1 becomes more canon-faithful as vault-as-canonical-knowledge-filesystem; cymatic engine becomes substrate proper at truest scope; Track 02 honours not just the file inventory but the *state* of the populated graph).

- **C11.** [§0.3 / R-3] Track 02 retitled to "S2/S2' Graph Law Extension and Consumption Surface" (or equivalent), Source Specs section cites the three prior inherited plans (`2026-03-10-graph-bootstrap-health.md`, `2026-05-17-bimba-map-ingestion-plan.md`, `2026-05-19-deep-bimba-regional-property-update-protocol.md`), T0 baseline-snapshots the populated state, T3 and T4 are re-cast as idempotent-verification + branch-residency-audit (or absorbed into T0 / T9), T9 absorbs the destructive-rebuild "import-from-scratch" semantics. Track 02 honours the live state of `Body/S/S2/graph-services/` + `docs/datasets/` rather than planning phantom-population.

- **C12.** [§0.4 / R-4] The VAK-as-Operational-Substrate landing is reflected across the plan-set: Track 09 source-inventory cites `capability-matrix.json` + `pi-agent/agents/anima.md` (test-locked parity) as authority; Track 09 T1 route outcomes enumerate `MoiraiNightPass` / `AnimaSelfInvoke` / `FusionDispatch` (with `MOIRAI_CF` + `validateFusionDispatch`); Track 09 T2 extends the matrix rather than duplicating it; Track 09 "Anima orchestration binding" open decision marked partially-resolved by D3 chip; Track 04 Tranche 1 typed schema carries `closure_kind` + `CT4a/CT4b`; Track 04 Architectural Keystones name the operational cycle `Khora compose → execution → Moirai rehear → Sophia witness → Aletheia routes → Epii inbox (closure_kind tagged) → Epii recompose → next-cycle seed` with env-propagation + gateway-record as both load-bearing; Track 01 Tranche 7 carries canonical-prefix VAK keys + VAK route lineage in the observability stream; Track 11 carries `IOD-17` capability-matrix-as-governance-authority and PRD-04 refined with the `vak_profile`-is-skill-level invariant; `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` (8-tool inventory) is either updated to match test-locked parity or deprecated with pointer to canonical views. What was descriptive metadata is now operational substrate in the planning artifacts too.

When C1–C12 are met, the plan-set can be picked up by an engineering team starting Phase-0 work (Track 10 T0 decision gate + local harness topology) with no expected blockers beyond the open architectural questions Track 11 already surfaces. The §0 decisions plus the §6 propagation pass yield the truest-version M'/S' build program.

---

*End of review pass — final.*
