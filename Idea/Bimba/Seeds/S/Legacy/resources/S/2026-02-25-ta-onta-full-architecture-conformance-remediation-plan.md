# Ta-Onta Full Architecture Conformance Remediation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or superpowers:subagent-driven-development) to execute this plan with evidence gates.

**Goal:** Restore ta-onta to spec-conformant operability by remediating parallel-system implementations and enforcing native Epi-Claw/OpenClaw/PI + deep Quaternal Logic integration across all PRD user stories.

**Architecture:** This is a remediation-and-verification program, not a feature tranche. Work is organized as module-focused subagent lanes under a parent orchestrator that owns cross-module conformance, authority-doc alignment, and discharge gating. Every PRD US is tracked in a single ledger with evidence, divergence classification, and closure status.

**Tech Stack:** TypeScript, OpenClaw/Epi-Claw plugin runtime, PI embedded runner, Quaternal Logic deep substrate, Neo4j, Redis, Vitest, ta-onta conformance/e2e harness.

---

## Why This Exists

The current failure mode is not lack of planning detail. The planning/spec stack exists and is detailed. The failure mode is implementation drift: ta-onta code paths that invent parallel bootstrap/pathing/invocation/graph/runtime systems instead of extending native/deep infrastructure.

This plan converts that into a controlled remediation program with:
- full PRD US coverage (53/53 tracked)
- authority-doc checks per module
- explicit divergence typing (`parallel-bootstrap`, `parallel-pathing`, etc.)
- subagent lane ownership with parent orchestration
- evidence-based discharge only

## Non-Negotiable Core Audit Principle

ta-onta must extend native Epi-Claw/OpenClaw/PI infrastructure and deep Quaternal Logic wrappers.
ta-onta must not build parallel bootstrap/pathing/invocation/graph/frontmatter/runtime systems.

## Authority Documents (Locked References)

Use these as the source-of-truth stack during remediation reviews. Every module lane must cite which sections were checked.

### Primary authorities
- `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-22-ta-onta-first-working-e2e-readiness.prd.json` (full US contract, acceptance criteria, dependencies)
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/PLAN.md` (ta-onta canonical law, coordinate/form/frontmatter/system contract)
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/OUROBOROS_DEV_SPEC.md` (process / coordination discipline)
- docs/plans/2026-02-22-bimba-data-foundation-harmonization.md


### Deep PI / Quaternal Logic authorities (mechanics/wiring)
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-DEEP-TRANCHE-1.md`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-DEEP-TRANCHE-2.md`
- Deep runtime seam code references (must be cited when relevant):
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/graphrag-substrate.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/renderer-model-context-bridge.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/knowledge-vault-conventions.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/seeded-roster.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/routing/quaternal-logic-routing.ts`

### VAK integration authority (resolved current path)
- `/Users/admin/Documents/Epi-Logos/Idea/Empty/Present/ARCHIVE-2026-02-25-taonta-install/VAK-SUPERPOWERS-INTEGRATION-SPEC.md`
- Secondary related copy (if needed for diff/traceability): `/Users/admin/Documents/Epi-Logos/Idea/Empty/Present/ARCHIVE-2026-02-25-taonta-install/ta-onta-anima-superpowers-vak-integration-spec.md`

### Path drift note (must be handled explicitly)
The historical VAK path used in deep tranche docs appears moved/archived. Do not silently substitute paths during implementation. Record the resolved path in each affected task and backfill docs where needed.

## Parent Orchestrator + Subagent Lane Model

### Parent orchestrator responsibilities (holistic view)
- Own the master conformance matrix and US ledger
- Enforce authority-doc checks (PRD + PLAN + VAK + deep-QL docs) for every lane
- Enforce gate constraints before readiness/e2e discharge claims
- Review lane outputs for native/deep seam conformance, not just local tests
- Maintain cross-lane blockers, dependency releases, and discharge status
- Re-run and interpret shared conformance/e2e harness as integration evidence

### Required subagent lanes (parallel where safe)
- `Lane A: Khora (bootstrap / context / session finalization / queue)`
- `Lane B: Chronos (pathing / cutover / archive / cron result delivery)`
- `Lane C: Anima (NOW lineage / orchestration integration / tasknotes pathing)`
- `Lane D: Hen (frontmatter / normalization consumption / topology / graph access seams)`
- `Lane E: Aletheia (gate invocation integration / graph write path / crystallization wiring)`
- `Lane F: Pleroma (spawn/invocation / renderer bridge / Moirai coordination / graph shims)`
- `Lane G: Shared + Cross-Cutting Contracts (path service, normalization, janus envelope, fail-fast policy)`
- `Lane H: Deep PI/OpenClaw/QL Integration Verification (native seams, deep wrapper consumption, provenance backfill)`
- `Lane I: Conformance Harness + Install/E2E Campaign (US-017..US-020 evidence only after foundation gates)`

### Lane execution rule
A lane may claim a task complete only after parent orchestration review confirms:
- no new parallel-system seam introduced
- authority docs cited and checked
- integration point into native/deep runtime explicitly named
- verification evidence attached (tests/runtime checks)

## Core Framing (Single System, Multiple Apertures)

- ta-onta is one integrated system.
- Modules/plugins are the apertures through which this remediation work is executed.
- PRD US rows and planning/spec docs are verification layers over the same system, not separate implementation layers.
- Lane-based subagents are a parallel execution method for coverage and rigor, not a partitioning of the system into independent products.
- This plan defines gate constraints and evidence rules, not a global serial implementation doctrine.

## Immediate Foundation Gates (Do Not Skip)

### Gate 1: Bootstrap source-of-truth unification
- Khora must stop rebuilding a parallel bootstrap context in `before_agent_start`
- Native bootstrap file loading/hook overrides remain source-of-truth
- Khora may add only deltas (session-scoped NOW/cache context), not replace base bootstrap mechanics

### Gate 2: Shared path/workspace conformance
- Remove hardcoded/host-specific runtime path fallbacks
- Replace legacy global `Present/NOW.md` assumptions in active runtime codepaths with Day/NOW shared path service contracts
- Chronos and Khora must agree on Day/NOW/archive lineage semantics

### Gate 3: Graph/invocation mechanics no-bypass enforcement
- Pleroma/Aletheia/Hen mechanics must route through native/deep seams where available
- Plugin semantics remain local; mechanics/contracts/wiring are deep/native

Until Gates 1-3 pass, do not discharge US-017..US-020 as readiness evidence.

## Existing E2E / Conformance Harness (Use As Guides, Then Evidence)

Current guide rails to map against PRD scenarios:
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/conformance/e2e-01-08.test.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/conformance/e2e-09-24.test.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/ta-onta.e2e.test.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/docker-compose.e2e.yml`

Use these in two phases:
1. **Guide phase:** scenario intent extraction and gap mapping (what they claim vs what code actually routes through)
2. **Evidence phase:** only after foundation gates pass and scenario-to-US traceability is explicit

## Master Conformance Ledger Workflow (Per US)

Each US must be tracked with these fields before discharge:
- `US ID`
- `Title`
- `Dependencies`
- `Primary lane`
- `Current code status` (`missing`, `partial`, `implemented-but-bypassed`, `implemented-native`, `unknown`)
- `Divergence type` (if any)
- `Action` (`verify`, `backfill-doc`, `refactor`, `rewrite`)
- `Authority docs checked` (PRD / PLAN / VAK / Deep QL tranches)
- `Native/deep integration points touched` (or `none` with rationale)
- `Tests/evidence` (unit/integration/e2e/runtime)
- `Blocked by`
- `Discharge status`

## Module Audit Checklists (Must Be Applied By Lane)

### Khora checklist
- Native bootstrap is source-of-truth (`agent:bootstrap` + native bootstrap resolver)
- No plugin-local replacement bootstrap file loading
- No global `Present/NOW.md` source-of-truth in active runtime pathing
- Session finalization/cutover uses shared path service and explicit lineage
- Queue/sync paths resolved through shared path/deep contract
- Fail-fast on contract violations (no silent degrade)

### Chronos checklist
- Day rollover/archive path handling uses shared path service + deep archive contract
- No host-specific absolute defaults in runtime config
- Runtime file-set / cutover invariants match PRD + PLAN Day/NOW bundle semantics
- Cron-result notification path preserves native invocation/session lineage

### Anima checklist
- NOW coordination pathing uses shared path service (Day parent / NOW child)
- VAK-driven semantics do not replace native invocation/session/deep routing mechanics
- TaskNotes path derivation is workspace/config-driven (no host fallback literals)
- Lineage + breadcrumbs conform to Hen template-lens contract

### Hen checklist
- Frontmatter parsing/writing uses shared canonical normalization law
- Deprecated standalone `coordinate` / `ql_position` fields not used in canonical write paths
- Topology/index/query paths do not reintroduce legacy schema assumptions
- GraphRAG mechanics consume deep substrate where available

### Aletheia checklist
- Gate invocation path uses shared Janus envelope + native/deep invocation seam
- No direct plugin-owned graph writes when Hen/deep graph contracts are available
- Crystallization path uses canonical Bimba World targets and fail-fast policy

### Pleroma checklist
- Subagent spawn uses native `sessions_spawn`/deep orchestration envelope baseline
- No plugin-local pseudo-agent system replacing native PI/OpenClaw surfaces
- Renderer/modelContext bridge invocation follows deep bridge envelope conventions
- Plugin-local bridge state remains semantic/UI cache only (not parallel core invocation surface)

### Shared + Deep integration checklist
- Path/normalization/janus/fail-fast helpers are actually consumed by runtime flows (no orphan logic)
- Deep QL wrappers used for mechanics/contracts; ta-onta owns semantics only
- Provenance declarations recorded for PI pattern adaptions/mods

## Parallel Execution Protocol (Default)

### Parent orchestrator baseline (always on)
- Create and maintain the master conformance ledger (this file)
- Attach audit findings and code-path evidence to affected US rows
- Track gate status (`Gate 1`..`Gate 3`) and cross-lane blockers
- Pause readiness/e2e discharge while required gates are red

### Parallel subagent lanes (default mode)
- Run subagents in parallel by module/plugin aperture where file scopes do not conflict
- Require every lane to use the same authority stack (`PRD`, `PLAN`, `VAK`, deep QL tranche docs, native/deep seam code)
- Require every lane report to flow back into this one ledger (no side ledgers)
- Treat local lane test success as insufficient until parent review confirms system-level seam conformance

### Gate-constrained discharge (not serial order)
- Lanes may work in parallel across modules.
- US rows may be audited and remediated in parallel.
- Readiness/e2e discharge (`US-017..US-020`) remains blocked until `Gate 1`..`Gate 3` are explicitly green with evidence.
- Any US depending on bootstrap/pathing/no-bypass guarantees may be worked in parallel but not discharged while those gates remain red.

## Full PRD US Coverage Ledger (53/53)

Status key (fill during execution):
- `current_status`: `unknown | missing | partial | implemented-native | implemented-but-bypassed`
- `action`: `verify | backfill-doc | refactor | rewrite`
- `lane`: one of Lane A..I
- `discharge`: `blocked | in_progress | review | complete`

| US | Title | Depends On | Lane | current_status | action | divergence_type | authority_checked | integration_points | evidence | discharge |
|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | Freeze centralized wiring doc as single source for current developments | US-002 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-002 | Create architecture diagrams from the centralized wiring doc |  |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-003 | Implement shared ta-onta path service for locked filesystem conventions | US-001 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-004 | Refactor Anima NOW pathing to Day-parent child-NOW model via shared path service | US-003 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-005 | Refactor Khora filesystem writes and queue targets to shared path service | US-003 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-006 | Refactor Chronos day rollover/archive path handling to shared path service | US-003 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-007 | Normalize canonical target paths in Hen and Aletheia to Bimba World contract | US-003 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-008 | Implement shared relation/frontmatter law normalization from ta-onta PLAN authority | US-001 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-009 | Wire Hen frontmatter parsing and template invocation to canonical coordinate-key law | US-008 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-010 | Implement Hen CT/CT' template-lens artifact contract validators (`CTX = CT(x)` explicit) | US-009 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-011 | Wire Anima Day/NOW creation and closure events through Hen template-lens contracts | US-004, US-010 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-012 | Add shared Janus temporal-envelope injection utility for Aletheia gate invocations | US-004, US-006, US-011 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-013 | Wire Aletheia gate invocation contract into ta-onta runtime surfaces (dynamic + invocable) | US-012 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-014 | Verify and harden Pleroma/Moirai gate mechanics path for intra-plugin invocation | US-008, US-013 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-015 | Constrain Khora queue to minimal operational contract (Obsidian-safe updates + proposals) | US-005 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-016 | Enforce fail-fast error policy across shared contracts and runtime seams | US-003, US-010, US-012, US-013, US-015 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-021 | Wire native Epi-Claw/OpenClaw hook and invocation surfaces as mandatory shared runtime seam (no bypass) | US-001, US-040, US-041 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-022 | Implement hook/lifecycle observability contract across ta-onta runtime surfaces | US-021, US-041 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-023 | Implement Chronos KAIROS temporal enrichment as required runtime integration | US-006, US-012 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-036 | Implement Chronos cutover invariant preserving two-day presence across review/day-change thresholds | US-004, US-011, US-021, US-022, US-031, US-032, US-034 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-037 | Implement native configurable cron-result delivery path (Telegram-ready) with traceable session lineage | US-021, US-022, US-031 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-031 | Centralize ta-onta session naming/parsing on native OpenClaw-compatible helpers | US-001, US-021, US-040, US-041 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-032 | Normalize Khora lifecycle session identity and make session finalization idempotent | US-004, US-021, US-022, US-031 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-033 | Implement template-driven content wikilink breadcrumbs for Day/NOW/task artifacts | US-003, US-004, US-011, US-027, US-031 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-034 | Wire native session-propagation spine from spawn to Day/NOW lineage and breadcrumbed artifacts | US-021, US-022, US-031, US-032, US-033 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-024 | Implement TaskNotes integration for CT4b task-lane handling across Day and NOW contexts | US-004, US-011 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-025 | Centralize runtime credential access through existing 1Password skill boundary | US-013, US-014 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-026 | Integrate tmux/external terminal runtime (including mprocs launcher surfaces) through native invocation policy | US-014, US-021 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-027 | Implement canonical template-definition vs runtime-invocation lineage contract (CT/CT' families) | US-003, US-010, US-011 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-028 | Add template-alignment analysis and redesign-suggestion conformance workflow (day-1 learning loop) | US-001, US-010, US-027 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-029 | Implement NOW-thought lifecycle contract (flat NOW/thoughts, T-prefixed naming, programmatic Thought routing) | US-003, US-011, US-015, US-027 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-030 | Wire contextual "use Aletheia" activity surface for Anima/Sophia and enforce source-precedence verification | US-001, US-015, US-027, US-029, US-040, US-041 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-038 | Wire and verify claude-mem dual-harness parity contract across Claude Code and OpenClaw external paths | US-015, US-021, US-022, US-023, US-040 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-039 | Implement declarative Chronos runtime file-set contract for Nara live docs in Day archival/review flows | US-011, US-023, US-031, US-036 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-042 | Implement Quaternal Logic coordinate-kernel runtime payload contracts in deep substrate | US-001 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-043 | Implement native orchestration spawn/session metadata envelope in PI/OpenClaw deep surfaces | US-042 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-044 | Implement deep prompt-profile composition seam for coordinate/team-aware runtime profiles | US-043 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-045 | Implement unified hook/lifecycle/invocation observability envelope primitive in deep substrate | US-043 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-046 | Implement GraphRAG deep substrate interfaces as combined Neo4j and Redis capability | US-042, US-045 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-047 | Port/mod PI multi-agent extension primitives (agent-team/agent-chain/cross-agent/pi-pi) into Epi-claw deep customization layer with VAK 12-agent integration scaffolding | US-042, US-043, US-044 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-052 | Realize the combined Anima+Aletheia 12-agent roster as full PI-native agents and instantiate teams/chains from VAK/PLAN relationships | US-047, US-043, US-044, US-045 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-053 | Make PI-native subagent spawning a first-class harness capability and bridge it into gateway/control-plane surfaces without replacing native gateway session-spawn baseline | US-052, US-022 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-049 | Implement deep task-discipline and execution-guardrail primitives from selected PI extension patterns | US-043, US-044, US-045, US-047 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-050 | Implement deep renderer/modelContext bridge conventions and invocation wiring from selected PI extension patterns | US-043, US-045, US-047 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-051 | Implement deep knowledge/vault and Obsidian-safe retrieval-update conventions with GraphRAG alignment | US-045, US-046 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-048 | Prove bounded deep-substrate consumption path and capture implementation appendix for downstream wiring | US-043, US-044, US-045, US-046, US-047, US-049, US-050, US-051 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-040 | Complete Quaternal Logic deep substrate foundation in PI/OpenClaw for ta-onta alignment (Epi-claw fork-level) | US-001, US-042, US-043, US-044, US-045, US-046, US-047, US-048, US-049, US-050, US-051 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-041 | Implement TypeScript parity models for Quaternal Logic and GraphRAG deep-substrate contracts from Python canonical references | US-040 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-017 | Build conformance test harness for centralized wiring scenarios E2E-01 to E2E-08 | US-011, US-013, US-015, US-016, US-021, US-022 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-018 | Build conformance test harness for centralized wiring scenarios E2E-09 to E2E-24 | US-017, US-021, US-022, US-023, US-024, US-025, US-026, US-027, US-028, US-029, US-030, US-031, US-032, US-033, US-034, US-036, US-037, US-038, US-039 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-019 | Prepare ta-onta install and e2e run command path for external terminal execution | US-018 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-035 | Materialize bootstrap-safe PARADIGM kernel and Sophia-only distilled identity infusion from approved source file | US-001, US-004, US-011 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |
| US-020 | Final readiness verification: ta-onta first working version is ready for e2e command handoff | US-019, US-021, US-022, US-023, US-024, US-025, US-026, US-027, US-028, US-029, US-030, US-031, US-032, US-033, US-034, US-035, US-036, US-037, US-038, US-039 |  | unknown |  |  | PRD, PLAN, VAK, Deep-QL |  |  | blocked |

## Special Handling For Deep-Track Stories (US-040..US-053)

Do not let existing deep-tranche docs be treated as blanket completion evidence.
For each deep-track US:
- verify actual code path is consumed by ta-onta runtime where PRD requires consumption
- classify `backfill-doc` vs `verify` vs `redo/rewrite` with explicit rationale
- record upstream PI pattern provenance (`pi-vs-claude-code` path + commit/ref) or `none`
- record deep-wrapper integration points touched (or `none` with rationale)

## Review Cadence (Parent Orchestrator)

Every lane report must include:
- `[design]` intended seam vs current seam
- `[build]` exact files changed (or audited if no changes)
- `[test]` commands + outcomes
- `[blocker]` unresolved dependencies or missing authority clarity
- `[done]` only when parent review confirms cross-module conformance

## Acceptance / Discharge Standard

A US or module tranche is dischargeable only when all are true:
- code path exists and is invoked in real runtime flow
- native/deep seam is used where required (no parallel replacement)
- authority docs are checked and cited
- tests verify contract behavior and conformance (not just happy output)
- residual risk + next actions are recorded

## Session Start Protocol (Parent + Parallel Subagents)

1. Parent orchestrator fills lane assignments plus initial `action` / `divergence_type` for US rows using current audit evidence.
2. Launch parallel subagents by module/plugin aperture (non-conflicting scopes).
3. Require each lane report to cite authority docs and native/deep integration points touched.
4. Parent orchestrator merges results into this ledger and enforces gate-constrained discharge.
