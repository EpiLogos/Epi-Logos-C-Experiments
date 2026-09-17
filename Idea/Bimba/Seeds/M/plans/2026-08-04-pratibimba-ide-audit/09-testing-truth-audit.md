# Testing Truth Audit

Date: 2026-08-04
Status: static and receipt-level audit; no product or harness code changed
Scope: the Cycle 3 verification system, [[S]]/[[S']] owner-layer tests, and the [[M']] carrier suite

## Executive Verdict

The repository does not mainly suffer from too few tests. It suffers from a broken relationship between **claim**, **oracle**, **environment**, and **closure**.

The suite contains substantial real engineering: owner-layer kernel tests, schema tests, a real gateway wire harness, a live Neo4j gate, native Tauri startup work, real-filesystem browser flows, and harness self-tests. Those assets should be preserved.

But Cycle 3 made a much larger claim than those tests prove. The closure system allowed a task to inherit a broad green gate even when no test executed the task's own acceptance statement. Real browsers and real gateways then proved that the implemented surfaces behaved as implemented. They did not prove that those surfaces formed the IDE and agentic organism described by [[M'-SYSTEM-SPEC]].

The central finding is therefore:

> **Runner realism is not product truth. A test is only as truthful as its independently derived oracle and the exact claim it is allowed to close.**

## Quantitative Snapshot

The machine-readable basis is [[data/test-suite-summary]] and [[data/test-suite-inventory]]. Counts are syntactic inventory indicators, not executed coverage claims.

| Measure | 2026-08-04 snapshot | Meaning |
|---|---:|---|
| Test-bearing source files under `Body/` and `.codex/` | 1,356 | The suite is genuinely large. |
| Recognised test declarations | 9,189 | Volume is not the missing ingredient. |
| `verify-all` registered suites | 34 | The central gate covers many runtimes and languages. |
| [[M']] carrier test files with recognised declarations | 411 | Excludes standalone smoke executables without `test(...)` declarations. |
| [[M']] carrier recognised test declarations | 2,645 | Mostly unit/component tests plus 192 Playwright tests. |
| Playwright specs / declarations | 100 / 192 | Broad surface coverage, but not broad workflow truth. |
| Playwright `data-testid` references | 1,507 | Strong coupling to internal surface bookkeeping. |
| Playwright `getByRole(...)` references | 26 | User-perceived affordances are comparatively under-observed. |
| Playwright screenshot assertions | 4 | Visual protection is narrow and cannot judge architectural correctness by itself. |
| Cycle 3 indexed tasks | 656 | All were eligible for ledger closure. |
| Tasks with an extractable task-specific Verify command | 61 | Only 9.3% gave `verify-tranche` something task-specific to execute. |
| Tasks with `Verify:` prose but no extractable command | 573 | 87.3% fell through to generic class gates. |
| Tasks with no `Verify:` label | 22 | No task-local verification surface at all. |
| Verification records carrying the generic-gate-only marker | 602 of 658 | This was the normal closure path, not an edge case. |

The earlier Cycle 3 inheritance snapshot also found 635 latest `PASS` records and 21 later `REFUSED` records across the 656 indexed tasks. A `done` ledger state therefore cannot be read as a current proof state.

## What The Current Gate Really Proves

`.codex/scripts/verify-all.mjs` registers useful proof families:

- harness self-tests;
- C, Rust, TypeScript, and Python owner-layer suites;
- schema and boundary checks;
- the [[S3]] gateway and gateway contract;
- `live-wire` profile and event projection checks;
- a live Neo4j query path;
- gateway method presence ratchets;
- [[M']] typecheck, unit tests, build, native smoke, and browser flows;
- test-honesty and expected-red checks.

That is a strong **regression gate**. It is not yet a canonical **acceptance graph**.

The distinction matters:

- A regression gate asks whether known implementation behavior changed.
- An acceptance graph asks whether a named canonical claim was demonstrated in its required environment, through its real producer and consumer, with its forbidden outcomes excluded.
- A release decision asks whether all load-bearing claims compose in the launched product and whether the human-owned design and governance boundaries have been accepted.

Cycle 3 routinely used the first as evidence for the second and third.

## Primary Failure Modes

### 1. Generic Green Substituted For Task Proof

`verify-tranche.mjs` extracts backticked commands only from a task's `Verify:` line. When it finds none, it records:

`tranche check: (no machine-runnable commands on the Verify line - gate only)`

It then runs a class-scoped subset of the broad gate. This can show that *some* kernel, wire, or UI tests pass without showing that the task being closed has any executable acceptance test. The 602 generic-only records show that this fallback became the dominant proof model.

### 2. The Test Oracle Was Often Authored From The Implementation

Many tests cite a tranche identifier and assert the registry, `data-*` receipt, pane, tab, or state field created by that same tranche. This gives useful local regression protection, but it does not establish that the tranche translated canon correctly.

The suite can therefore be exquisitely specific about the wrong product.

### 3. A Real Browser Can Exercise A Non-Canonical Workflow

The Playwright environment is materially real: it rebuilds `epi`, starts a real gateway, uses a real temporary filesystem, and can reach live Neo4j. Yet most browser assertions are made through test IDs, shell attributes, registry state, and pane presence.

For example, `activity-bar-modes.spec.ts` proves command-palette routing and internal mode fallback. It does not prove the discoverability, visible geometry, iconography, or repeated-use ergonomics of a classical IDE activity bar. The browser is real; the product oracle is incomplete.

### 4. The Harness Is Healthier Than A Normal Product Boot

`tests/e2e/global-setup.ts` rebuilds the binary, creates an isolated vault and home, seeds selected canonical artifacts, writes profile/Kairos/natal/config state, writes an axiom-translation record, starts a dedicated gateway, and starts a filesystem sidecar.

This is valid for testing specific consumers. It is not evidence that the native product can create, discover, repair, or own those prerequisites.

The harness must label every seed as one of:

- **environmental precondition** - data a normal configured user is expected to possess;
- **producer output fixture** - valid only for testing a downstream consumer;
- **fault fixture** - deliberately malformed or absent state;
- **forbidden acceptance shortcut** - seeded state that bypasses the producer named by the claim.

A consumer test using a producer-output fixture may not close the producer claim.

### 5. Live Substrate Truth Is Partly Optional

The default `gnostic-offline` gate explicitly runs with `SKIP_NEO4J_TESTS=true`; its own comment records a basis of 15 passed and 16 skipped. Numerous Rust tests are `#[ignore]`d for Neo4j, Redis, Graphiti, SpaceTimeDB, provider, or forensic-corpus requirements.

Those exclusions can be sensible for a fast local lane. They cannot support the claim that the full [[S]]/[[S']] organism has been tested. Required live paths need a separately named, fail-closed environment and release lane. "Available on demand" is not a release proof.

### 6. Separate Real Gates Do Not Automatically Compose

`app-smoke`, `app-ui-flow`, `live-wire`, `graph-live`, and the owner-layer suites are separate stages. A green collection does not prove that one launched native carrier caused one user action to traverse the intended owners and return one governed result.

The missing object is a causal receipt or trace binding:

`user intent -> M' carrier -> S3 route -> owning S/S' operation -> durable effect -> returned projection -> visible state -> review/governance outcome`

Without that binding, each subsystem can be real while the assembled product remains false.

The current specialist gates are also intentionally narrower than their names may suggest:

- `live-wire` has substantial projection coverage and captures repeated real frames, but declared optional/absent channels can remain reported rather than required;
- the gateway audit currently probes a much larger method surface than the expected-present ratchet enforces, so present-but-unratcheted methods remain warnings;
- `graph-live` proves one coordinate/property read through the real stack, not graph-wide correctness;
- `kernel-truth` is an expected-red sentinel over a narrow manifest, not total kernel truth.

### 7. Visual Regression Can Preserve The Wrong Architecture

Screenshot tests answer "did these pixels change?" They do not answer "is this the correct IDE grammar?" A baseline captured before architectural acceptance makes the wrong layout harder to fix.

The current visual suite is narrow and includes a fixture-fed review fold. It remains useful for stability after a design has been accepted, but it must not be treated as architectural approval.

### 8. Accessibility And Usability Are Mostly Indirect

Helper mathematics, token checks, ARIA utilities, non-modal rules, and component mounts are useful. They do not prove the applied focus order, accessible names, keyboard reachability, live announcements, resizing behavior, text containment, or whether a person can understand what to do next.

Human architectural and usability review is not a test-suite defect to automate away. It is a required proof boundary.

### 9. Verification Classes Admit Known Misclassification

`verification-classes.json` itself records that tracks 01, 03, 04, and 05 remain classed `K` despite owning [[M0']], [[M2']], [[M3']], and [[M4']] carrier surfaces. It calls this a "SIBLING HOLE." Track 54 has no class in the current map.

The class model is useful, but class membership is too coarse to replace exact claim-to-proof traceability.

Several nearest-owner AGENTS contracts also name checks outside the 34-suite default gate, including additional [[S2]], [[S4]], and [[S5]] tests and the explicitly ungated Gnostic live lane. The central gate inventory and the local verification contracts therefore do not yet form one closed set.

### 10. The Honesty Lint Detects Only The Simplest Fraud

`lint-test-honesty.mjs` rejects a test block when all its assertions are banned source, file, manifest, or count checks, plus a small set of vacuous polyglot patterns. It does not detect:

- a wrong oracle;
- a test that proves only internal attributes;
- a seeded producer bypass;
- a "real" environment that differs from product startup;
- an omitted negative-space requirement;
- a snapshot of an unapproved design;
- a broad gate being cited for an unrelated task.

It should remain, but it is a floor, not an epistemic guarantee.

The verifier documentation also still describes a "full 28-suite sweep" while the executable gate now registers 34 suites. This is minor beside the oracle problem, but it illustrates why the executable inventory, local DOX contracts, and proof architecture must be reconciled continuously.

## Concrete False-Positive Patterns

| Pattern | Current example | What may still be broken while green |
|---|---|---|
| Registry parity | `src/ui/activityBarModeCoverage.test.ts` | The actual rail can be absent, illegible, or undiscoverable. |
| Command-driven UI surrogate | `tests/e2e/activity-bar-modes.spec.ts` | A dedicated IDE activity bar affordance can still be wrong. |
| Runtime-only native receipt | `scripts/tauri-boot-smoke.mjs` | The native shell can render the wrong chrome or workbench. |
| Screenshot catalog parity | `src/ui/visualRegressionCatalog.test.ts` | Baselines can be stale or canonically wrong. |
| Helper-level accessibility | `src/ui/accessibility.test.ts` | The running UI can have broken focus, names, and announcements. |
| Fixture-fed consumer proof | axiom translation and review-fold seeds | The live producer can be absent or incorrect. |
| Offline live-system surrogate | `gnostic-offline` | Graph/provider integration can remain unexecuted. |
| Generic class gate | 602 tranche receipts | The exact task behavior can have no executable proof. |

## High-Value Assets To Preserve

The audit does **not** recommend deleting the suite and starting again.

- `scripts/live-wire.mjs` is a strong bus-closure asset: real gateway, strict frame parsing, projection manifest, and invariant checks.
- `gateway-method-gate.mjs` is a useful expected-present ratchet.
- `graph-live.mjs` proves a real CLI-to-graph-services-to-Neo4j read.
- owner-layer mathematical, serialization, contract, privacy, and negative-path tests remain the fastest way to localise defects.
- harness self-tests and the honesty lint correctly test the adjudicator before it adjudicates.
- the current `nativeStartup` and `tauri-boot-smoke` source contains same-day repairs for stale binary resolution, supervision, profile generation, vault resolution, dimensions, and process identity. Those repairs require a fresh authoritative run; they should not be presumed either failed or proven from the earlier receipt.
- strong browser flows that operate real commands, real filesystem effects, real gateway routes, identity continuity, or honest unavailable states should be retained and attached to exact claims.

## Root Cause

Cycle 3 built a **suite inventory** and a **closure machine**, but not a canonical acceptance graph.

The system needs all three:

1. tests that localise owner-layer behavior;
2. integration and workflow proofs that compose the real organism;
3. a claim registry that prevents either category from proving more than it actually observed.

The remedy is not "more E2E." It is to make every proof declare its canonical claim, owner, environment, producer, observer, oracle, forbidden outcomes, and admissible closure scope.

## Audit Boundary

This is a static and receipt-level audit. It did not run the full 34-suite gate because another session is modifying the opening plan phases and the native startup source changed during the audit. Current source and historical receipts are distinguished explicitly. Fresh runs belong to the migration plan in [[11-test-suite-migration-plan]].
