# Testing Audit Evidence

Captured: 2026-08-04
Mode: source, manifest, and receipt inspection only; no full suite execution

## Repository-Wide Inventory

The audit scanned tracked test-bearing source files under `Body/` and `.codex/` using language-specific declaration patterns.

Result:

```text
files:              1,356
test declarations:  9,189
skip indicators:       96
source-read calls:     711
```

Area summary:

```text
M-prime carrier:       411 files / 2,645 declarations
M-prime other:         167 files / 1,010 declarations
S0:                    410 files / 3,234 declarations
S1:                     26 files /   129 declarations
S2:                     99 files /   404 declarations
S3:                     47 files /   274 declarations
S4:                    100 files /   868 declarations
S5:                     55 files /   251 declarations
verification harness:  31 files /   320 declarations
```

The complete row set and limitations are in [[../data/test-suite-inventory]] and [[../data/test-suite-summary]].

## Carrier Audit

Static inspection of `Body/M/pratibimba-app` found:

```text
Playwright specs:                 100
Playwright test declarations:    192
Playwright data-testid refs:    1,507
Playwright getByRole refs:         26
Playwright screenshots:             4
```

The strongest real-system assets are `live-wire.mjs`, `boot-smoke.mjs`, the current `tauri-boot-smoke.mjs`, `semantic-connections.spec.ts`, `subsystem-pages.spec.ts`, and the filesystem/governance flows.

Representative false-positive patterns were observed in:

- `src/ui/activityBarModeCoverage.test.ts` - registry coverage without the visible activity-bar affordance;
- `tests/e2e/activity-bar-modes.spec.ts` - real browser but mostly command-palette and shell-attribute oracle;
- `src/ui/visualRegressionCatalog.test.ts` - snapshot catalog parity rather than product correctness;
- `src/ui/accessibility.test.ts` - helper law rather than applied running-DOM accessibility;
- fixture-fed review and axiom-translation paths - valid downstream consumer proof, not live producer proof.

## Cycle 3 Task-Proof Extraction

The audit used the same Verify-line extraction rule as `.codex/scripts/verify-tranche.mjs` against the current `plan.index.json`:

```text
indexed tasks:                                  656
without Verify label:                            22
Verify prose, no extractable command:           573
with at least one extractable command:           61
with only echo/exit/rg command:                    1
```

The verification-record directory contained 658 Markdown records at inspection time. Searching for the verifier's fallback marker returned:

```text
records using generic-gate-only marker:          602
```

This is the strongest direct evidence for the closure-scope failure.

## Central Gate

The executable `SUITES` inventory in `.codex/scripts/verify-all.mjs` contains 34 stages. `verify-tranche.mjs` documentation still refers to a 28-suite full sweep.

Notable scope boundaries:

- `gnostic-offline` explicitly sets `SKIP_NEO4J_TESTS=true`; its source comment records 15 passed and 16 skipped on its basis.
- `graph-live` proves a specific live coordinate/property read, not graph-wide truth.
- `kernel-truth` watches one current expected-red claim, not all kernel law.
- the gateway audit covers more methods than the expected-present ratchet requires.
- local [[S2]], [[S4]], and [[S5]] AGENTS contracts name checks not registered in the central 34-suite inventory.
- the Gnostic live lane remains documented as on-demand and ungated.

## Harness-Managed E2E State

`tests/e2e/global-setup.ts` currently:

- rebuilds `epi` from current source;
- creates a real temporary vault and copies selected canonical artifacts;
- creates isolated gateway state and home roots;
- seeds axiom-translation consumer data;
- seeds NOW, autoresearch config, identity, Kairos, and natal state;
- starts a real gateway with explicit Neo4j settings;
- starts a real-filesystem sidecar;
- seeds an isolated oracle Kairos cache.

This is a strong integration environment. It is also more curated than normal product startup and must not close producer or startup-ownership claims for state it pre-creates.

## Concurrent Source Drift

The worktree changed during this audit in another active session. In particular, current source now includes startup/supervisor assertions that were absent from the earlier runtime receipt, and multiple app/gateway/tests/spec files are concurrently modified.

Therefore:

- historical failing receipts remain valid evidence of the state they observed;
- current source must not be described as still containing every historical defect;
- current source must not be described as repaired until a fresh authoritative environment run succeeds;
- test inventory counts are a timestamped 2026-08-04 snapshot and should be regenerated after the parallel session settles.

## Execution Boundary

The full 34-suite gate, native smoke, provider-live tests, and ignored/live substrate tests were not run in this audit. Running them while the parallel session is changing startup, gateway, product, and verification files would produce an ambiguous receipt and risk resource collisions. The migration plan requires fresh runs after claim and environment ownership are fixed.
