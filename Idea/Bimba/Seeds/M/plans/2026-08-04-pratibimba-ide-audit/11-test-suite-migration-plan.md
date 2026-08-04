# Test Suite Migration Plan

Date: 2026-08-04
Status: staged remediation plan; designed to avoid a third indiscriminate Cycle 3 rerun

## Objective

Convert the existing suite from an implementation-shaped regression inventory into the proof graph defined by [[10-full-system-verification-architecture]], while preserving useful bodies and keeping the parallel [[M']] IDE planning session unblocked.

This is not a rewrite of 9,189 tests. It is a change to what tests are allowed to claim, followed by focused replacement of the tests that currently guard the wrong things.

## Non-Negotiable Outcomes

- 100% of implementation tasks map to at least one canonical claim.
- 100% of non-document task closures execute a task-specific proof.
- 0 tasks close from the generic class gate alone.
- 0 required live-path tests are skipped in the environment that claims full-system truth.
- Every critical workflow has success, refusal/degraded, and fault evidence.
- Every critical receipt has at least one demonstrated sabotage that the suite catches.
- No screenshot baseline becomes a release gate before human architectural acceptance.
- Test count is never a completion metric.

## Phase 0 - Stop Proof Inflation

**Purpose:** prevent the new plan from creating more false certainty while the migration is underway.

1. Mark generic-gate-only Cycle 3 receipts as regression evidence, not task acceptance.
2. Refuse new non-document closures without a task-specific command and claim ID.
3. Freeze new visual baselines until the IDE shell grammar is human-approved.
4. Label existing seeds and fixtures by producer/consumer scope.
5. Record current native-startup source as changed since the original runtime receipt and require a fresh run before citing it.

**Exit:** the closure machine cannot repeat the 602-record fallback pattern.

## Phase 1 - Build The Claim Registry

**Purpose:** establish the independent oracle before changing more tests.

1. Derive load-bearing claims from [[World-Ontology]], [[ARCHITECTURE-DIAGRAM-PACK]], [[S-SYSTEM-INDEX]], [[M'-SYSTEM-SPEC]], exact layer specs, and the accepted IDE redesign.
2. Assign each claim an owner, environment, positive behavior, negative space, proof IDs, and human gate.
3. Join all 656 Cycle 3 tasks through [[data/cycle3-task-inventory]] to the new claims.
4. Mark every task `preserve`, `adapt`, `supersede`, `quarantine`, or `reprove` without deleting historical evidence.
5. Make contract and canon changes invalidate dependent claims automatically.

**Exit:** every new-plan tranche can state exactly what truth it changes and what proof can close it.

## Phase 2 - Triage Existing Tests

Classify every test file or coherent test family using [[data/test-suite-inventory]].

| Disposition | Rule |
|---|---|
| `KEEP` | Independently tests owner law, a real boundary, a durable effect, or a user outcome within an honest claim scope. |
| `ATTACH` | Test is useful but must be linked to an explicit claim and environment. |
| `MERGE` | Repeats lower-level behavior without adding boundary or workflow confidence. |
| `REWRITE` | Protects implementation details, fixtures, registries, or attributes where a domain/user oracle is required. |
| `QUARANTINE` | Depends on unavailable live infrastructure or has unknown authority; cannot contribute green release evidence. |
| `DELETE` | Tests no meaningful behavior, is fully redundant, or freezes a superseded design. |

Start with the highest-risk concentrations:

- task closures with no executable Verify command;
- [[M0']], [[M2']], [[M3']], and [[M4']] carrier work still classed `K`;
- Track 54 without a verification class;
- producer-bypassing E2E seeds;
- ignored Neo4j/Redis/Graphiti/SpaceTimeDB/provider tests;
- UI tests dominated by internal `data-*` state;
- unratified screenshot baselines;
- tests reading implementation source to prove behavior.

**Exit:** every retained family has an honest maximum claim scope.

## Phase 3 - Repair The Verification Harness

1. Replace the Verify-line command extractor fallback with fail-closed task proof requirements.
2. Require `claim_id`, `proof_id`, `environment`, and evidence-path fields in verification records.
3. Separate regression suite result from acceptance result in every receipt.
4. Make required skips fail the environment lane; allow only explicitly out-of-scope skips.
5. Add fixture provenance and producer-bypass checks.
6. Add class-plus-claim validation; reclassify tracks 01, 03, 04, and 05 and cover Track 54.
7. Preserve the gate-lane lock and independent verifier law.
8. Add freshness checks for native binary identity, service versions, corpus revision, and visual baselines.

**Exit:** a green broad gate cannot be attached to an unrelated task.

## Phase 4 - Establish Truthful Environments

Create reproducible named lanes:

1. `offline-law` - current fast owner and contract tests.
2. `ephemeral-owner` - real temp vault/store/process integration.
3. `spawned-gateway` - current wire basis with typed causal receipts.
4. `full-substrate` - Neo4j, Redis, Graphiti, SpaceTimeDB, gateway, vault, and durable S5 stores with readiness and teardown ownership.
5. `native-carrier` - the real Tauri-owned startup path, not a helper-owned second gateway.
6. `provider-live` - explicit authenticated model/embedding/agent behavior.
7. `soak` - restart, reconnect, concurrency, and resource behavior.

Promote currently ignored live tests into the appropriate lane. Do not simply run all `#[ignore]` tests: several are destructive, forensic, paid-provider, long-running, or vendor tests and need explicit ownership.

**Exit:** "full-system green" names one reproducible environment with zero silently absent required dependencies.

## Phase 5 - Implement Canonical Workflows

Build the seven scenarios from [[10-full-system-verification-architecture]] in this order:

1. `native_boot_to_workbench`
2. `home_to_deep_with_identity_preserved`
3. `prompt_to_reviewed_change`
4. `canon_edit_to_review_submission`
5. `minimum_live_loop`
6. `personal_observation_to_governed_return`
7. `namespace_and_promotion_governance`

Each scenario must begin at the real user or carrier boundary and finish by inspecting the durable owning effect. Intermediate receipts must share one correlation identity.

**Exit:** the product can demonstrate its canonical work rather than its pane inventory.

## Phase 6 - Add Falsification

1. Run targeted mutation testing on high-value Rust owner-law crates.
2. Maintain a cross-language contract mutation corpus.
3. Add lifecycle fault injection for stale binary, wrong listener, version mismatch, first-profile timeout, service death, and reconnect.
4. Add privacy, namespace, provenance, and authority bypass attacks.
5. Remove each critical E2E seed in sabotage mode to show which producer claims would fail.
6. Require the harness self-test to demonstrate refusal of a generic-only task closure.

**Exit:** critical tests are known to detect plausible wrong implementations, not merely known to pass the current one.

## Phase 7 - Reduce And Rebalance

After stronger claims are proven:

- delete redundant high-level tests that add no boundary confidence;
- keep exhaustive edge cases at L2 rather than repeating them in Playwright;
- retain a small number of canonical native/browser workflows;
- replace user-facing `data-testid` assertions with roles, names, commands, work-object identity, and durable effects;
- keep test IDs for non-visual receipts and hard-to-observe technical state;
- consolidate source-grep structural tests into named lints;
- keep visual regression only for human-ratified workbench states and responsive viewports.

There is no target percentage reduction. The criterion is evidence value per maintenance cost.

## Initial Keep / Rewrite Decisions

| Asset | Initial disposition | Reason |
|---|---|---|
| `scripts/live-wire.mjs` | `KEEP + EXTEND` | Strong real bus proof; add causal trace and claim mapping. |
| `gateway-method-gate.mjs` | `KEEP` | Useful presence ratchet, but not method-behavior proof. |
| `graph-live.mjs` | `KEEP + EXTEND` | Real graph path; add corpus revision and namespace scenarios. |
| owner-layer mathematical/property tests | `KEEP` | Fast, diagnostic law proof. |
| `tauri-boot-smoke.mjs` | `REPROVE + EXTEND` | Same-day source repair exists; add real shell action and visual workbench assertion. |
| `activityBarModeCoverage.test.ts` | `REWRITE/MERGE` | Registry coverage cannot prove an IDE activity bar. |
| `activity-bar-modes.spec.ts` | `ADAPT` | Keep fallback semantics; drive the actual visible rail affordance. |
| `visualRegressionCatalog.test.ts` | `KEEP AS LINT` | Catalog parity only; remove release-confidence overclaim. |
| current visual baselines | `QUARANTINE UNTIL RATIFIED` | May preserve the rejected shell grammar. |
| `accessibility.test.ts` | `KEEP + ADD APPLIED FLOW` | Helper law is useful but not applied accessibility. |
| seeded axiom/review consumer flows | `ATTACH TO CONSUMER CLAIM ONLY` | Cannot prove live producer behavior. |
| `gnostic-offline` | `KEEP AS OFFLINE LANE` | Fast value remains; cannot represent full Gnostic truth. |

## Work Packages For Parallel Sessions

The other planning session can proceed with product architecture while this testing migration remains a parallel rail.

### Package A - Claim Registry

Owns canonical claim extraction and the Cycle 3 join. It does not change tests.

### Package B - Closure Harness

Owns verification record schemas, fail-closed task proof, classes, skips, and harness self-tests.

### Package C - Environment Orchestration

Owns full-substrate and native-carrier dependency lifecycle, readiness, isolation, and teardown.

### Package D - Canonical Workflows

Owns native/browser workflow tests and cross-process receipts. It consumes the accepted IDE shell design; it does not invent it.

### Package E - Suite Triage

Owns mechanical inventory, duplicate detection, source-grep consolidation, selector analysis, and disposition records.

### Package F - Falsification And Release

Owns mutation, sabotage, soak, human acceptance records, and release-candidate composition.

## Coordination With The Active IDE Plan

The product plan must not wait for every old test to be classified. It must, however:

- register claims before each new implementation tranche;
- provide a task-specific proof from the first tranche onward;
- avoid adopting current screenshot baselines as design authority;
- treat current tests as inherited evidence with bounded scope;
- use the same startup, dependency, workflow, and governance receipts defined here;
- never make a second plan-local verification protocol.

## Completion Definition

Migration is complete when the accepted IDE can be launched and can complete the canonical workflows in one fully identified organism, while owner-layer tests localise failures and the closure machine refuses every proof scope violation.

The goal is not a permanently enormous green table. It is a system that can tell the difference between "this function still behaves," "this service is really connected," "this workflow is canonically complete," and "a human has accepted the product."
