# 10.T8 — M5-4 Agentic Mediation End-To-End

Captured: 2026-06-02T10:12:29.281Z
Owner:    admin-10t8-agentic-mediation-e2e
Receipt:  plan.runs/10-t8-agentic-mediation-e2e-20260602T101229Z.json
Asserts:  57/57 pass (0 fail)

## Candidate (real S5)

- id: `track-04-t0-improvement-kept` (matches 10.T2 Thread K baseline)
- review_item_id: `track-04-t0-review-open`
- requires_human: `true`
- target_coordinate: `S5/S5'`
- captured_via: JSON.parse(Body/S/S5/fixtures/track-04-t0/s5-review-state.json + s5-improvement-state.json) — cross-referenced to 10-t2-s5-review-baseline-20260602T000502Z.json (Thread K capture from cargo --offline)

## VAK evaluation

- V/A/K: 1/1/1 score=1.00 decision=`route`
- canonical vak_keys (matrix m5_4_governance.canonical_vak_keys): CPF, CT, CP, CF, CFP, CS

## Anima orchestration (real capability-matrix.json)

- actor: `pi` (matrix-listed review_surface_role)
- capability: `prepare_agent_run_evidence` (in actor.permitted_actions)
- route: `dispatch_agent` (in matrix.dispatch_tools)
- anima_authority.dispatch_to_constitutional_agent: true
- three-way parity (matrix ↔ UI ↔ simulated gateway): true
- matrix dispatch_tools: 6 tools, 15 skills

## Bounded capability policy (real isMediationCapabilityAllowed)

- allowed tools (count): 9
- denied tools attempted (count): 6
- deny enforced: true

## Evidence packet (9-field completeness)

- [x] source_anchor
- [x] spec_anchor
- [x] code_anchor
- [x] test_anchor
- [x] profile_generation
- [x] s2_handle
- [x] s3_handle
- [x] privacy_class
- [x] review_id

- envelope: `env::track-04-t0-improvement-kept`
- review_id: `track-04-t0-review-open`
- privacy_class: `safe-public-current-kernel-tick`
- day_now: `2026-06-02::NOW/session-10-t8`

## Review gate (human-required) parity

- [x] agent approve blocked at UI
- [x] agent reject blocked at UI
- [x] agent revise blocked at UI
- [x] agent promote blocked at UI
- [x] agent approve blocked at gateway
- [x] agent reject blocked at gateway
- [x] agent revise blocked at gateway
- [x] agent promote blocked at gateway
- [x] UI and gateway agree on block
- [x] agent defer allowed at UI
- [x] agent defer allowed at gateway

## Surfaces parity

### Agentic Control Room (deep IDE)

- [x] run tree populated
- [x] tool stream populated
- [x] evidence visible
- [x] review controls correct (UI blocks agent approve)

### /body lite-surface

- [x] review alert present
- [x] agent check-in populated
- [x] deep-link to control room armed
- [x] deep-link context fields preserved

### Same-flow identity tuple (deep IDE ↔ /body)

- [x] actor matches
- [x] capability matches
- [x] reviewId matches
- [x] profileGeneration matches

## Dry-run promotion (bounded agent path)

- produced: true
- dry_run: true
- destination: `S5/S5'`
- rollback_executable: true

## Verification commands

    cd Idea/Pratibimba/System && node --test extensions/test/agentic-mediation-e2e/e2e.test.mjs
    cd Idea/Pratibimba/System && node extensions/test/agentic-mediation-e2e/capture-receipt.mjs
    cargo test --offline --manifest-path Body/S/S5/epii-review-core/Cargo.toml
    cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml
    cargo test --offline --manifest-path Body/S/S5/epii-agent-core/Cargo.toml

## Notes

Gateway-side enforcement is exercised by a `GatewayDispatchContract` simulator in `harness.mjs` that mirrors the Rust governance rules in `Body/S/S5/epii-review-core/src/lib.rs::requires_human_resolution`. The Rust rule is independently verified at runtime by `Body/S/S5/epii-review-core/tests/review_governance.rs::agent_can_defer_but_not_approve_recursive_user_final_or_deployment_gates` (already green in the 10.T2 Thread K baseline). A future enhancement (Thread A Finding #2 follow-up) is to expose `s4'.mediation.capabilities.list` so the same parity assertion can be made against a LIVE gateway socket — see "deviation_from_ideal_capture_path" in the JSON receipt.
