# ta-onta US-003..US-010 Deep Grounding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ground ta-onta tranche `US-003..US-010` in Quaternal Logic deep-layer mechanics/primitives, then rewire ta-onta modules to consume those deep primitives while preserving ta-onta/VAK semantic authority.

**Architecture:** Extract generic filesystem/path/archive/frontmatter-mechanics into `Idea/epi-claw/src/agents/quaternal-logic/*` with typed envelopes/validators/tests, then keep ta-onta semantic law and CT/CT' doctrine in plugin-local wrappers (`extensions/ta-onta/modules/*`) that call the deep primitives. Finalize tranche with per-story integration/provenance declarations and verification evidence.

**Tech Stack:** TypeScript, Vitest, Epi-claw Quaternal Logic deep substrate modules, ta-onta plugin modules

---

## Design Checkpoint (Reframed Execution Model)

This tranche is **not** a plugin-only cleanup. It is a **deep-grounding tranche**:

1. Identify what in ta-onta `US-003..010` is mechanics/primitive-worthy for deep PI agent layer.
2. Implement those primitives in Quaternal Logic deep substrate (`src/agents/quaternal-logic`).
3. Rewire ta-onta modules (Anima/Khora/Chronos/Hen/Aletheia) to consume deep primitives.
4. Preserve ta-onta/VAK semantic ownership for relation law and CT/CT' doctrine.

This follows the final PRD rules:
- deep-wrapper-first
- explicit deep integration-point declarations
- exact provenance declarations (including explicit `none`)

## Story Mapping Matrix (Deep vs Plugin Ownership)

### `US-003` Shared ta-onta path service

**Move to deep (mechanics):**
- root/path profile composition helpers
- path-safe segment validation
- Day/NOW naming contract helpers (generic/profile-driven)
- canonical target assertions (forbidden legacy target classes)
- archive day-bundle path resolution helpers

**Remain plugin-local (ta-onta semantics):**
- ta-onta-specific root labels and path profile constants (`Bimba World`, `Present`, `Pratibimba History`)
- semantic naming of Day/NOW artifacts beyond path mechanics

**Primary deep targets:**
- `Idea/epi-claw/src/agents/quaternal-logic/taonta-filesystem-contracts.ts`
- `Idea/epi-claw/src/agents/quaternal-logic/taonta-filesystem-contracts.test.ts`

**ta-onta rewire points:**
- `extensions/ta-onta/modules/shared/path-service.ts` (becomes thin ta-onta wrapper over deep primitive)

### `US-004` Anima NOW Day-parent/child-NOW pathing

**Move to deep (mechanics):**
- none (Anima Day/NOW lineage semantics and Hen contract coupling remain plugin-owned)

**Remain plugin-local (ta-onta semantics):**
- NOW coordinator lineage model
- CT4b Day/NOW contract payload semantics
- Anima runtime read/write/handoff behavior

**Deep integration points consumed:**
- deep filesystem/path contracts (`US-003` extraction)
- deep observability envelope (`US-045`) for logging/telemetry paths (declaration only unless touched)

**ta-onta rewire points:**
- `extensions/ta-onta/modules/anima/now/coordinator.ts`

### `US-005` Khora filesystem writes and queue targets

**Move to deep (mechanics):**
- generic write-target contract validation envelope (canonical/proposal)
- queue record target-path validation primitive (path contract + non-empty collection rules)
- session artifact path derivation helpers (if generic enough)

**Remain plugin-local (ta-onta semantics):**
- Khora queue semantics (`neo4j_sync`, priority, provenance semantics)
- session lifecycle behavior and fallback policies

**Primary deep targets:**
- `Idea/epi-claw/src/agents/quaternal-logic/filesystem-write-contracts.ts`
- `Idea/epi-claw/src/agents/quaternal-logic/filesystem-write-contracts.test.ts`

**ta-onta rewire points:**
- `extensions/ta-onta/modules/khora/session.ts`
- `extensions/ta-onta/modules/khora/queue-contract.ts`

### `US-006` Chronos rollover/archive path handling

**Move to deep (mechanics):**
- Day-bundle archive destination resolver
- bundle/file archive fallback branching primitive
- contract validation for previous daily path shape

**Remain plugin-local (ta-onta semantics):**
- Chronos rollover workflow
- archive index semantics
- Neo4j temporal relation semantics (`m_3_archived`)

**Primary deep targets:**
- `Idea/epi-claw/src/agents/quaternal-logic/day-bundle-archive-contracts.ts`
- `Idea/epi-claw/src/agents/quaternal-logic/day-bundle-archive-contracts.test.ts`

**ta-onta rewire points:**
- `extensions/ta-onta/modules/chronos/paths.ts`
- `extensions/ta-onta/modules/chronos/index.ts` (archive target generation call site)

### `US-007` Canonical target path normalization (Hen + Aletheia to Bimba World)

**Move to deep (mechanics):**
- canonical target path validator/normalizer helper
- legacy `/Bimba/Forms` rejection primitive

**Remain plugin-local (ta-onta semantics):**
- Hen/Aletheia decisions about which artifacts are canonical
- ta-onta Bimba World ontology semantics

**Primary deep targets:**
- reuse `taonta-filesystem-contracts.ts` exported canonical target helpers (no second primitive if avoidable)

**ta-onta rewire points:**
- `extensions/ta-onta/modules/hen/service.ts`
- `extensions/ta-onta/modules/aletheia/crystallize.ts`

### `US-008` Shared relation/frontmatter law normalization from PLAN authority

**Move to deep (mechanics only):**
- generic frontmatter key normalization pipeline primitive (shape parsing hooks, alias application interface)
- parser utilities for key token normalization

**Remain plugin-local (ta-onta semantics, authoritative):**
- canonical alias table
- deprecation policy (`coordinate`, `ql_position`, `ctx_*`)
- plugin coordinates (`S3-4'` / `S3-5'`)
- coordinate-family doctrine + CTX = CT(x) law

**Primary deep targets:**
- `Idea/epi-claw/src/agents/quaternal-logic/frontmatter-mechanics.ts`
- `Idea/epi-claw/src/agents/quaternal-logic/frontmatter-mechanics.test.ts`

**ta-onta rewire points:**
- `extensions/ta-onta/modules/shared/normalization.ts` (semantic law wrapper over deep mechanics)

### `US-009` Hen frontmatter parsing + template invocation to canonical coordinate-key law

**Move to deep (mechanics):**
- strict frontmatter parsing + canonical write filtering primitive
- alias-preservation vs canonical-only serialization mechanics (policy-driven)

**Remain plugin-local (ta-onta semantics):**
- canonical coordinate law tables from `PLAN.md`
- Hen mapping semantics to graph/frontmatter
- template-lens field meanings and required subsets

**Primary deep targets:**
- reuse `frontmatter-mechanics.ts`

**ta-onta rewire points:**
- `extensions/ta-onta/modules/hen/frontmatter.ts`
- `extensions/ta-onta/modules/hen/service.ts`
- `extensions/ta-onta/modules/aletheia/crystallize.ts` (fallback write path must honor canonical law)

### `US-010` Hen CT/CT' template-lens artifact contract validators

**Move to deep (mechanics):**
- none (validators encode ta-onta doctrine)

**Remain plugin-local (ta-onta semantics):**
- CT/CT' lens semantics
- `CTX = CT(x)` explicit interpretation
- profile semantics (`day_parent`, `now_child`)

**Deep integration points consumed:**
- frontmatter mechanics parser/normalizer (`US-008/009` extraction)

**ta-onta rewire points:**
- `extensions/ta-onta/modules/hen/template-lens-contracts.ts`

## Full Tranche Task List (Comprehensive, Dependency-Ordered)

### Task 1: Baseline classification + evidence table (`US-003..010`)

**Files:**
- Modify: `docs/plans/2026-02-24-ta-onta-us003-us010-deep-grounding-implementation.md`
- Create/Modify (appendix target, later): `Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US003-US010.md`

**Steps:**
1. Record per-story current classification (`backfill-doc` / `verify` / `redo`) under the deep-grounding lens.
2. Record existing test evidence and known PRD gaps (e.g., legacy fallback frontmatter writes).
3. Record deep integration points and plugin-local semantic ownership declarations for each story.

### Task 2: TDD deep filesystem/path contracts primitive (`US-003`, supports `US-006`, `US-007`)

**Files:**
- Create: `Idea/epi-claw/src/agents/quaternal-logic/taonta-filesystem-contracts.test.ts`
- Create: `Idea/epi-claw/src/agents/quaternal-logic/taonta-filesystem-contracts.ts`
- Modify: `Idea/epi-claw/src/agents/quaternal-logic/deep-substrate-proof-path.test.ts` (optional bounded proof extension)

**Step 1: Write failing deep tests**
- Assert:
  - Bimba World / World/Types root resolution
  - Present Day + child NOW naming
  - archive Day-bundle destination
  - forbidden `/Bimba/Forms/` canonical target
  - invalid segment/session/date errors

**Step 2: Run targeted test and confirm RED**
- Run: `cd /Users/admin/Documents/Epi-Logos/Idea/epi-claw && pnpm vitest run src/agents/quaternal-logic/taonta-filesystem-contracts.test.ts`

**Step 3: Implement minimal deep primitive**
- Add typed profile + helpers + validators.
- Keep semantics minimal and contract-focused.

**Step 4: Run targeted test and confirm GREEN**

### Task 3: Rewire ta-onta shared path service to deep primitive (`US-003` completion)

**Files:**
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/shared/path-service.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/shared/path-service.test.ts`

**Steps:**
1. Replace duplicate mechanics with wrapper over deep primitive.
2. Preserve ta-onta API surface to avoid downstream churn.
3. Ensure no module-local path literal drift reintroduced.

### Task 4: TDD deep archive/day-bundle contract primitive (`US-006` support)

**Files:**
- Create: `Idea/epi-claw/src/agents/quaternal-logic/day-bundle-archive-contracts.test.ts`
- Create: `Idea/epi-claw/src/agents/quaternal-logic/day-bundle-archive-contracts.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/chronos/paths.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/chronos/paths.test.ts`

**Steps:**
1. Extract generic “bundle directory vs legacy file archive fallback” resolver.
2. Keep Chronos-specific archive index and relation semantics plugin-local.
3. Rewire `resolveArchivePathForPreviousDaily`.

### Task 5: TDD deep frontmatter mechanics primitive (`US-008`/`US-009` support)

**Files:**
- Create: `Idea/epi-claw/src/agents/quaternal-logic/frontmatter-mechanics.test.ts`
- Create: `Idea/epi-claw/src/agents/quaternal-logic/frontmatter-mechanics.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/shared/normalization.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/shared/normalization.test.ts`

**Steps:**
1. Extract grammar/tokenization/normalization pipeline mechanics (policy-driven alias hooks).
2. Keep ta-onta alias tables + doctrine in `shared/normalization.ts`.
3. Rewire ta-onta semantic wrapper to call deep mechanics.

### Task 6: Rewire Anima and Khora to deep-grounded path contracts (`US-004`, `US-005`)

**Files:**
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/anima/now/coordinator.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/anima/now/coordinator.test.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/khora/session.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/khora/session.test.ts`
- Modify (if needed): `Idea/epi-claw/extensions/ta-onta/modules/khora/queue-contract.ts`
- Modify (if needed): `Idea/epi-claw/extensions/ta-onta/modules/khora/queue-contract.test.ts`

**Steps:**
1. Confirm Anima consumes only ta-onta wrapper (now deep-grounded underneath).
2. Replace any remaining path-string mechanics in Khora with deep-grounded contracts.
3. Preserve explicit error behavior for invalid path contracts.

### Task 7: Canonical Bimba target normalization enforcement in Hen + Aletheia (`US-007`)

**Files:**
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/hen/service.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/hen/service.template-invoke.test.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/aletheia/crystallize.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/aletheia/crystallize.test.ts`

**Steps:**
1. Ensure all active canonical writes target Bimba World via shared/deep-grounded path contracts.
2. Forbid silent legacy canonical writes (`/Bimba/Forms`).
3. Leave explicit compatibility handling only where PRD allows and mark as explicit fallback/TODO.

### Task 8: Hen canonical frontmatter parsing/template invocation + Aletheia fallback canonical law alignment (`US-009`)

**Files:**
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/hen/frontmatter.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/hen/frontmatter.test.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/hen/service.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/hen/service.template-invoke.test.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/aletheia/crystallize.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/aletheia/crystallize.test.ts`

**Steps:**
1. Remove deprecated standalone `coordinate` / `ql_position` from canonical write paths.
2. Preserve deterministic canonical coordinate-key outputs and direct context-frame families.
3. Keep legacy input parsing policy explicit (accept/normalize/fail) per ta-onta law.

### Task 9: Validate and harden Hen CT/CT' template-lens contracts on deep mechanics parser (`US-010`)

**Files:**
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/hen/template-lens-contracts.ts`
- Modify: `Idea/epi-claw/extensions/ta-onta/modules/hen/template-lens-contracts.test.ts`

**Steps:**
1. Ensure CT validators consume deep frontmatter mechanics where appropriate.
2. Preserve plugin-local CT/CT'/CTX doctrine and actionable errors.
3. Confirm distinction of template-definition vs runtime invocation remains intact.

### Task 10: Comprehensive verification + tranche documentation/discharge

**Files:**
- Create: `Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US003-US010.md`
- Modify (optional append/ref): `Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-DEEP-TRANCHE-2.md`
- Modify (if needed): `docs/plans/2026-02-22-ta-onta-first-working-e2e-readiness.prd.json` (status notes only; no scope drift)

**Required documentation per story (`US-003..010`):**
- deep-wrapper integration points touched (or `none` with rationale)
- what remains plugin-local semantic interpretation
- external PI extension pattern provenance (`path+commit/ref` or `none`)
- classification (`backfill-doc` / `verify` / `redo`) and rationale
- exact code references + tests

**Verification command set (final evidence):**
- `cd /Users/admin/Documents/Epi-Logos/Idea/epi-claw && pnpm vitest run src/agents/quaternal-logic/taonta-filesystem-contracts.test.ts src/agents/quaternal-logic/day-bundle-archive-contracts.test.ts src/agents/quaternal-logic/frontmatter-mechanics.test.ts`
- `cd /Users/admin/Documents/Epi-Logos/Idea/epi-claw && pnpm vitest run extensions/ta-onta/modules/shared/path-service.test.ts extensions/ta-onta/modules/shared/normalization.test.ts extensions/ta-onta/modules/anima/now/coordinator.test.ts extensions/ta-onta/modules/khora/session.test.ts extensions/ta-onta/modules/chronos/paths.test.ts extensions/ta-onta/modules/hen/frontmatter.test.ts extensions/ta-onta/modules/hen/service.template-invoke.test.ts extensions/ta-onta/modules/hen/template-lens-contracts.test.ts extensions/ta-onta/modules/aletheia/crystallize.test.ts`
- `cd /Users/admin/Documents/Epi-Logos/Idea/epi-claw && git diff --name-only -- src/agents/quaternal-logic extensions/ta-onta/modules docs/plans`

## Known Pre-Implementation Findings (from current scan)

- `US-003`: largely implemented in ta-onta plugin (`shared/path-service.ts`) with tests; candidate for deep extraction + plugin wrapper rewire.
- `US-004`: implemented in `anima/now/coordinator.ts` and tested; likely `verify` + consume deep-grounded path wrapper.
- `US-005`: Khora session path contracts already use ta-onta path service; needs deep-grounding rewire and broader queue/write primitive extraction review.
- `US-006`: implemented in `chronos/paths.ts` with tests; candidate for deep archive-contract extraction.
- `US-007`: partially implemented (`Hen` and `Aletheia` reject/normalize some paths), but Aletheia fallback still emits legacy canonical frontmatter metadata in canonical writes.
- `US-008`: implemented in ta-onta `shared/normalization.ts` and tested; candidate for deep mechanics extraction while retaining semantic law plugin-local.
- `US-009`: partially implemented; `Hen` canonical pathways exist, but canonical write outputs still include legacy aliases in some paths and Aletheia fallback canonical write is non-compliant.
- `US-010`: implemented and tested in plugin-local Hen validator; should remain plugin-local while optionally consuming deep parser mechanics.

## Execution Discipline Notes (for this plan)

- No Bimba bulk transforms, no schema drift.
- Preserve dirty workspace changes outside touched files.
- TDD for all new/changed behavior.
- No destructive git operations.
- Record exact provenance and deep-integration declarations per story.

