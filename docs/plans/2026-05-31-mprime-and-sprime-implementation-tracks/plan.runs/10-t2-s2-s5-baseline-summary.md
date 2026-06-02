# 10.T2 — S2 Graph Baseline + S5 Review Baseline (Human Summary)

**Owner:** parallel m-dev Thread K (`admin-10t2-s2-s5-baseline`)
**Captured:** 2026-06-02T00:05:02Z
**Plan node:** `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md` lines 83-101
**Status:** done

---

## Summary

The 10.T2 milestone demanded that two parallel substrate baselines — S2's
canonical-coordinate graph and S5's review/autoresearch typed state — be
captured as **real** contract fixtures, not mocks. Per the plan body's
verification rule:

> S2 tests query real Neo4j state OR the repository-provided graph-services
> harness and return coordinate-native payloads with relation types accepted
> by schema tests.
> S5 tests persist and reload real candidate/review/evidence state; fake
> in-memory review counts do not satisfy the milestone.

The substrate was already in place from prior tracks (Track 04 T7/T8/T9
landed the typed S5 spine; Track 08 T8 landed the S2 dataset import path).
This thread's job was to capture the substrate's payloads as fixtures that
prove `/body`, Theia shell, M extensions, integrated plugins, and the
M5-4 agents can consume them safely.

Both fixtures were captured. All four crates' tests passed offline. Privacy
invariants asserted. Persist-reload round trip lossless.

## Verification snapshot

| Crate                          | Passed | Failed | Ignored |
|--------------------------------|-------:|-------:|--------:|
| `epi-s2-graph-services`        |    157 |      0 |      11 |
| `epi-s5-epii-review-core`      |      9 |      0 |       0 |
| `epi-s5-epii-autoresearch-core`|     46 |      0 |       0 |
| `epi-s5-epii-agent-core`       |     11 |      0 |       0 |
| **Total**                      |  **223** |  **0** |   **11** |

The 11 ignored tests are all live-Neo4j/live-gateway gated (they require
`docker compose -f docker-compose.epi-s2.yml up -d neo4j` plus
`EPI_GRAPH_LIVE=1`); they are correctly skipped in this offline capture.

## S2 fixture — `10-t2-s2-graph-baseline-20260602T000502Z.json`

- **6 canonical M-family coordinate nodes** (M0 Anuttara, M1 Paramasiva,
  M2 Parashakti, M3 Mahamaya, M4 Nara, M5 Epii), each with:
  - deterministic UUIDv5 fingerprint provenance
    (`Body/S/S2/graph-services/src/seed.rs::coord_uuid`)
  - full property set the seed module merges (`coordinate`, `c_2_uuid`,
    `c_1_name`, `c_4_family`, `c_4_layer`, `c_4_ql_position`, `c_4_topo_mode`,
    `c_4_weave_state`, `c_4_inversion_state`, `c_4_flags`)
  - topology mode (`ZERO_SPHERE` for M0/M5, `TORUS` for M1/M2/M3,
    `LEMNISCATE` for M4 — the Jung quaternity anchor)
  - source / spec / code / test anchors
- **25 accepted relation types** in the graph-schema registry, including
  the canonical 11 the seed module emits (`GENERATES`, `ENTANGLES`,
  `INTERLEAVES`, `MANIFESTS`, `BEDROCK`, `INVERTS_TO`, `FAMILY_CONTAINS`,
  `REFLECTS_AS`, `OPERATES_IN`, `MOBIUS_RETURN`, `ANCHORED_TO`) plus 14
  inference/compatibility types.
- **`#` root mapping: resolved.** The seed module distinguishes the
  transcendent root `#` from the legacy `#0..#5` axis. `service.node({#})`
  returns `resolution.canonical == "#"`; `service.node({#4})` returns
  `resolution.canonical == "M4"` (legacy axis aliases to M-family). Both
  forms are seeded, so old queries do not break. Evidence anchor:
  `tests/seed_contract.rs::live_seed_baseline_is_idempotent_and_queryable_by_coordinate_api`.
- **Schema/seed relation-type divergence: resolved.** `SEED_REL_TYPES` is
  proper subset of `RELATIONSHIP_TYPE_SPECS`. No seed-emitted type is
  unregistered. Evidence anchor:
  `tests/schema_creation_contract.rs::coordinate_property_registry_covers_nodes_and_relationships`.

## S5 fixture — `10-t2-s5-review-baseline-20260602T000502Z.json`

Seven canonical typed-shape samples, each backed by a concrete cargo test
that exercises the same shape against real persisted state:

| Sample                | Backed by test |
|-----------------------|----------------|
| `candidate`           | `spine_schema.rs::typed_candidate_round_trips_without_replacing_propose_request` |
| `route_queue_entry`   | `surfacing_routing.rs::multi_target_routing_splits_routes_without_duplicating_run_id` |
| `review_item`         | `review_inbox.rs::submit_persists_anima_review_item_and_lists_open_inbox` |
| `governance_gate`     | `review_governance.rs::agent_can_defer_but_not_approve_recursive_user_final_or_deployment_gates` |
| `evidence_envelope`   | `baseline_state_fixture.rs::tranche_04_t0_fixture_survives_typed_schema_migration_boundary` |
| `dry_run_promotion`   | `agent_access.rs::m5_promotion_dry_run_returns_filtered_dto_from_real_review_and_improvement_state` |
| `frontend_safe_dto`   | `agent_access.rs::m5_workbench_snapshot_serializes_real_state_with_namespace_refs_and_no_body_leakage` |

Persisted state source:
- `Body/S/S5/fixtures/track-04-t0/s5-review-state.json` (2 review items + 1 resolution)
- `Body/S/S5/fixtures/track-04-t0/s5-improvement-state.json` (2 runs: kept + pending)

**Persist/reload invariant:** asserted, lossless. Each sample is encoded,
decoded, re-encoded; first and second encodings byte-equal.

**Privacy invariant:** asserted. All 18 forbidden privacy fields from
`extensions/test/privacy-audit/forbidden-fields.test.mjs` (q_b, q_p,
birth_date, birth_time, birth_place, natal_chart, protected_natal_data,
journal_body, journal_text, dream_body, dream_text,
oracle_interpretation_body, oracle_body, graphiti_body,
graphiti_episode_body, identity_raw, identity_private,
private_identity_data) are absent from the frontend-safe DTO.

## Downstream consumability

Both fixtures explicitly declare their consumers:

| Surface                    | S2 payload? | S5 payload? |
|----------------------------|:-----------:|:-----------:|
| `/body` lite               |     yes     |     yes     |
| Theia shell                |     yes     |     yes     |
| M extensions               |     yes     |     yes     |
| Integrated plugins         |     yes     |     yes     |
| M5-4 agents                |     yes     |     yes     |

## Harness

- **Capture script:** `Idea/Pratibimba/System/extensions/test/s2-s5-baseline/capture-fixtures.mjs`
- **Re-run:**
  ```bash
  cd "$REPO_ROOT"
  node Idea/Pratibimba/System/extensions/test/s2-s5-baseline/capture-fixtures.mjs
  ```
  The script aborts non-zero if any cargo crate fails, any forbidden field
  appears, or persist-reload round trip diverges.

## Closes

10.T2 — S2 Graph Baseline And S5 Review Baseline.
