# Cycle 3 Traceability Data

## Files

- `cycle3-task-inventory.csv` joins all 656 July rerun task rows to current ledger state, verification class, graph-live add-on, dependencies, write scopes, and the latest per-task verification record.
- `cycle3-track-register.json` groups the rerun into 55 logical tracks, includes decision-law Track 13, retains `carrier-contract.json` law, and assigns a redesign inheritance disposition.
- `test-suite-inventory.csv` is a syntactic inventory of 1,356 tracked test-bearing source files across `Body/` and `.codex/`, with runner, layer, kind, declaration count, skips, mocks, source reads, selector style, screenshots, process spawns, and canon/task-reference indicators.
- `test-suite-summary.json` aggregates that inventory and records the Cycle 3 task-proof gap: 61 tasks with an extractable task-specific command, 573 with Verify prose but no extractable command, 22 without a Verify label, and 602 generic-gate-only verification records.

## Sources

- `2026-07-03-m-prime-cycle-3-full-rerun/plan.index.json`
- `2026-07-03-m-prime-cycle-3-full-rerun/plan.state.json`
- `2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json`
- `2026-07-03-m-prime-cycle-3-full-rerun/plan.runs/verification-classes.json`
- `2026-07-03-m-prime-cycle-3-full-rerun/plan.runs/verifications/*.md`
- the gateway expected-present and kernel-truth manifests in the same `plan.runs/` directory

## Snapshot Semantics

This is a 2026-08-04 audit snapshot. It does not replace the source plans or receipts. Regenerate or reconcile it when the Cycle 3 index, state, carrier contract, proof classes, or latest verification records change.

`PASS` and `REFUSED` describe the latest per-task verification file at snapshot time. A `done` ledger status does not override a later `REFUSED` record.

Test-suite counts are declaration-pattern counts, not executed-test discovery or coverage. Canon/task references, mocks, fixtures, test IDs, and source reads are review indicators; no individual occurrence is declared valid or invalid by the inventory alone.
