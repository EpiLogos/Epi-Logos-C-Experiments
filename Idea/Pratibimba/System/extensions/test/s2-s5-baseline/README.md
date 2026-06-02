# 10.T2 — S2 Graph Baseline + S5 Review Baseline Contract Fixtures

This harness captures **real** S2 and S5 substrate payloads as contract fixtures
for `/body`, Theia shell, M extensions, integrated plugins, and M5-4 agents.

## What this harness does

1. **S2 capture**
   - Runs `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml`
     and asserts all 26 contract suites pass (with the live-Neo4j-gated tests
     correctly ignored).
   - Pulls the canonical six coordinate nodes (M0-M5) plus the root `#` and the
     legacy `#0-#5` axes from `Body/S/S2/graph-services/src/seed.rs`.
   - Pulls the `accepted_relation_registry` from
     `Body/S/S2/graph-schema/src/lib.rs::RELATIONSHIP_TYPE_SPECS` cross-checked
     against `seed::SEED_REL_TYPES`.
   - Captures source/spec/code/test anchors for every coordinate.
   - Emits `plan.runs/10-t2-s2-graph-baseline-<ts>.json`.

2. **S5 capture**
   - Runs cargo tests for `epii-review-core`, `epii-autoresearch-core`,
     `epii-agent-core` and asserts they all pass.
   - Loads the real persisted fixture state under
     `Body/S/S5/fixtures/track-04-t0/{s5-review-state.json,s5-improvement-state.json}`,
     which the tests themselves load via `ReviewStore` / `ImprovementStore`.
   - Captures one real sample of each typed shape: `candidate`,
     `route_queue_entry`, `review_item`, `governance_gate`, `evidence_envelope`,
     `dry_run_promotion`, `frontend_safe_dto`.
   - Asserts persist/reload invariant (encode → decode → re-encode byte-equal).
   - Asserts every one of the 18 forbidden privacy fields (from
     `extensions/test/privacy-audit/forbidden-fields.test.mjs`) is absent from
     the frontend-safe DTO.
   - Emits `plan.runs/10-t2-s5-review-baseline-<ts>.json`.

## Running

```bash
node Idea/Pratibimba/System/extensions/test/s2-s5-baseline/capture-fixtures.mjs
```

The script writes both fixtures into
`docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/`
and prints a one-line summary.

## Why this matters

Per `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md`
lines 83-101, T2 demands:

> S2 tests query real Neo4j state or the repository-provided graph-services harness and return coordinate-native payloads with relation types accepted by schema tests.
> S5 tests persist and reload real candidate/review/evidence state; fake in-memory review counts do not satisfy the milestone.

This harness consumes the same real state the cargo tests do, captures the
exact shapes those tests pass, and proves both substrates are consumable by
downstream surfaces without leaking forbidden private data.
