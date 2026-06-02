# Nara / Cosmic Clock Canonical Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the harmonized M0-M4 Nara / Cosmic Clock architecture end-to-end across `epi-lib`, `epi-cli`, gateway transport, SpacetimeDB, and the portal/TUI, with dataset-backed parity, real tests, and explicit multi-subagent execution boundaries.
**Architecture:** Dataset coordinates (`#0`-`#4`) are the canonical address space. C in `epi-lib` owns bare-metal structs, LUTs, and deterministic transforms; Rust in `epi-cli` mirrors C through FFI and owns runtime orchestration, gateway transport, session integration, and portal UX. All state must obey the raw -> derived -> rendered rule and the canonical primitives in `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-canonical-invariants.md`: `quintessence_hash[32]`, `quintessence_quaternion`, `live_quaternion`, `tick12`, `PlanetState[10] + EarthBodyState`, and `nara.oracle.payload`.
**Tech Stack:** C11 (`epi-lib`), Rust (`epi-cli`, `epi-spacetime-module`), vendored BLAKE3, Kerykeion/Kairos, SpacetimeDB, ratatui portal plugins, dataset-derived fixtures and lookup generators under `docs/scripts/lookups`

---

## Authoritative Sources

The implementation must follow this precedence order:

1. `docs/datasets/**` and dataset-bridge coordination docs for canonical coordinate truth
2. `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-canonical-invariants.md`
3. `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-spec-harmonization-plan.md`
4. The harmonized clock/Nara specs:
   - `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/01-quintessence-hash-architecture.md`
   - `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/02-16-lenses-backbone-temporal.md`
   - `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/03-spanda-double-helix-12fold.md`
   - `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/04-shadow-dynamics-three-computations.md`
   - `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md`
   - `Idea/Bimba/Seeds/M/M1'/Legacy/plans/CLOCK-AND-NARA-SPECS/11-m1-m2-epogdoon-vibrational-bridge.md`
   - `Idea/Bimba/Seeds/M/M0'/Legacy/specs/M/M0-anuttara-language-architecture.md`
   - `Idea/Bimba/Seeds/M/M1'/Legacy/specs/M/M1-paramasiva-mathematical-dna.md`
   - `Idea/Bimba/Seeds/M/M3'/Legacy/specs/M/M3-mahamaya-symbolic-transcription.md`
   - `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-personal-interface.md`
   - `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-subtle-body-map.md`
   - `Idea/Bimba/Seeds/M/Legacy/specs/M/HMS-quaternionic-overlay.md`
   - `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-12-cosmic-clock-full-architecture.md`
   - `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md`
5. Historical implementation text only where it does not conflict with the above

## Non-Negotiables

- No placeholder logic, mock pipelines, or demo-only shims.
- Tests must exercise real C/Rust functionality against real fixtures or real integrations.
- Every runtime field must have a named dataset/spec origin or an explicitly named derivation.
- M0 is not optional. The implementation must tabulate and carry M0 surfaces through the same parity discipline as M1-M4.
- Deprecated local truths must be removed or wrapped in explicit compatibility adapters, not silently preserved.
- Planetary dataset lag is not a blocker. Implementation uses canonical runtime ordering now and may translate from legacy dataset order where needed.
- SpacetimeDB, gateway, portal, and CLI must all converge on the same public contract.
- Before any symbol edits during execution, subagents must follow the repo GitNexus rules for impact analysis.

## Canonical Runtime Targets

These are the contract-level outcomes this plan exists to realize:

- `quintessence_hash` is canonical `[u8; 32]` everywhere internally.
- Preview strings are explicitly derived, never treated as the identity itself.
- `quintessence_quaternion` is the stable identity-derived orientation.
- `live_quaternion` is updated from oracle `oracle_eval4` / coin charges.
- `tick12` is the single canonical discrete clock state.
- `cf_substage6` is always derivable from `tick12`.
- `PlanetState[10]` tracks Sun through Pluto in canonical order.
- `EarthBodyState` is separate from the planetary array and anchors the 8-site bodily projection.
- `nara.oracle.payload` exists as a real machine-readable plus human-readable transport, not a deferred stub.
- `identity -> clock -> oracle -> payload -> medicine/transform/logos` is executable and testable.

## Current Runtime Gaps This Plan Must Close

- `epi-lib/src/m4.c` still copies only 8 bytes of BLAKE3 output into `quintessence_hash`.
- `epi-lib/include/m4.h` still exposes stale `uint64_t quintessence_hash` and `planet_degrees[7]` surfaces.
- `epi-lib/include/m0.h` and `epi-lib/src/m0.c` still expose `m1_torus_stage` instead of the canonical `tick12`.
- `epi-cli/src/nara/identity.rs` and `epi-cli/src/nara/wind.rs` still treat identity as `u64`/preview-first.
- `epi-cli/src/portal/clock_state.rs` still uses `torus_stage` and a 9-slot `KairosState`.
- `epi-cli/src/gate/nara.rs` still defers `nara.oracle.payload`.
- `epi-cli/src/gate/spacetimedb_bridge.rs` and `epi-spacetime-module/src/lib.rs` still transport `torus_stage`/truncated-hash semantics.
- `epi-lib/test/m4/test_m4.c` still asserts `u64`-style hash behavior and 7-planet temporal defaults.

## Execution Model

This plan is built for multi-subagent execution. Work must proceed in waves with hard barriers:

1. **Foundation wave** creates contract fixtures and the parity manifest the rest of the system will target.
2. **Bare-metal wave** updates C structs/LUTs/tests in parallel across disjoint write sets.
3. **Rust domain wave** updates FFI mirrors and runtime domain modules in parallel.
4. **Transport/UI wave** wires gateway, SpacetimeDB, session boundaries, and portal plugins.
5. **Integration wave** removes final stubs, resolves adapters, and proves the end-to-end chain.
6. **Verification wave** runs the full real test/build matrix and writes back the implementation-status truth.

No later wave should start on guesswork. Every barrier must end with a checked contract surface.

## Parallelization Rules

- Each workstream owns a disjoint write set.
- Workers are not alone in the repo and must not revert others' edits.
- Shared contract files must be finalized before downstream workers start.
- If a write set cannot be made disjoint, that work belongs to the integrator barrier, not a parallel worker.
- Tests added in one wave must become regression gates for later waves.

## Phase Overview

| Phase | Mode | Purpose | Blocking Output |
|---|---|---|---|
| 0 | Single-owner | Freeze executable contracts and fixtures | Canonical fixture set and parity manifest |
| 1 | Parallel | Bring C M0-M4 surfaces into contract parity | Passing `make test` on updated C substrate |
| 2 | Parallel | Bring Rust FFI and Nara runtime modules into parity | Passing targeted Rust contract tests |
| 3 | Parallel | Wire gateway/SpacetimeDB/session and portal/TUI | No deferred core Nara payload paths |
| 4 | Integrator | Resolve cross-layer glue and remove compatibility leftovers | End-to-end chain live in code |
| 5 | Single-owner | Full verification and implementation-status closeout | Green build/test matrix and updated status docs |

## Phase 0: Contract Freeze And Fixture Generation

**Owner:** Integrator only
**Why first:** Every other worker needs one machine-readable contract target.

### Scope

- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/dataset-bridge/00-master-coordination.md`
- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/dataset-bridge/2026-03-19-codex-binary-findings-first-pass.md`
- `docs/scripts/lookups/surface_formulations.py`
- `docs/scripts/lookups/surface_generation_events.py`
- `docs/scripts/lookups/surface_qv_fields.py`
- Create fixture outputs under:
  - `epi-lib/test/fixtures/nara_clock/`
  - `epi-cli/tests/fixtures/nara_clock/`

### Deliverables

1. A machine-readable parity manifest covering M0-M4:
   - dataset coordinate
   - canonical struct/LUT name
   - raw properties
   - derived fields
   - transport/public fields
   - current code owner
2. Real fixture files for:
   - M0 LUT and registry constants
   - M1 frame/spanda/tick expectations
   - M2 planet/decan/chakra mappings
   - M3 charge tuples, generation events, canonical tags
   - M4 identity/payload/lens/logos contract examples
3. A one-page compatibility note for known translation layers:
   - legacy Parashakti planet ordering -> canonical runtime ordering
   - preview-hash strings -> canonical `[u8; 32]`
   - old `torus_stage` naming -> `tick12`

### Acceptance Criteria

- Downstream tests can read fixtures without re-deriving the theory by hand.
- M0-M4 are all covered.
- No downstream work depends on ambiguous prose when a fixture could decide it.

### Verification

- Run the lookup scripts directly against current datasets.
- Manually inspect emitted fixture counts against the dataset-bridge docs.

## Phase 1: Bare-Metal C Runtime Parity

### Workstream 1A: M0-M1 Foundational Carriers

**Owner:** Subagent A
**Write set:** `epi-lib/include/m0.h`, `epi-lib/src/m0.c`, `epi-lib/include/m1.h`, `epi-lib/src/m1.c`, `epi-lib/test/m0/*`, `epi-lib/test/m1/*`

### Objectives

- Replace public `m1_torus_stage` semantics with canonical `tick12`.
- Introduce an explicit raw/derived/rendered split in shared clock carriers where needed.
- Tabulate M0 surfaces against fixtures and keep them executable:
  - `VIMARSA_TABLE`
  - `Spanda_Discriminator`
  - `VIRTUE_LUT`
  - `ARCHETYPE_LUT`
  - `ZODIACAL_LUT`
  - `QL_STACK`
  - `NARA_MSHARP_LUT`
  - `SIVA_TABLE`
  - `SHAKTI_TABLE`
  - `R_FACTOR_ROUTE_TABLE`
  - `M0_CROSS_BRANCH_REGISTRY`
  - `M0_CORE_RELATIONS`
  - `Unified_Clock_State`
  - `Unified_Logos_State`
- Make sure M1 binary-frame semantics can carry:
  - `binary_address6`
  - modular regime metadata
  - phase
  - `tick12`
  - `cf_substage6`

### Acceptance Criteria

- M0 tables are represented or explicitly classified as graph-only/non-runtime.
- `tick12` is the canonical exported discrete state.
- No new C code reintroduces `torus_stage` as the public truth.

### Verification

- `make test_m0_init`
- `make test_m0_rfactor`
- `make test_m1`

### Workstream 1B: M2 Planetary, Chakra, And Embodiment Layer

**Owner:** Subagent B
**Write set:** `epi-lib/include/m2.h`, `epi-lib/src/m2.c`, `epi-lib/test/m2/*`

### Objectives

- Implement canonical runtime ordering for `PlanetState[10]` without waiting for dataset repopulation.
- Add a translation layer from any legacy dataset/order assumptions into canonical runtime order.
- Introduce `EarthBodyState` explicitly as:
  - geocentric center
  - solar child of Sun
  - `CHAKRA_EARTH = 0`
  - special bodily anchor distinct from the seven canonical chakra bars
- Normalize M2 surfaces for:
  - 10 tracked planets
  - 7 canonical chakras plus EarthBody bridge
  - decan/body/light-shadow data
  - outer/transpersonal planet flags

### Acceptance Criteria

- Runtime can represent the canonical planet model now.
- Earth is no longer forced into the planetary array to satisfy bodily semantics.
- Any remaining dataset lag is localized to an adapter.

### Verification

- `make test_m2`

### Workstream 1C: M3-M4 Identity, Oracle, And Payload Substrate

**Owner:** Subagent C
**Write set:** `epi-lib/include/m3.h`, `epi-lib/src/m3.c`, `epi-lib/include/m4.h`, `epi-lib/src/m4.c`, `epi-lib/src/qv_data.c`, `epi-lib/test/m3/*`, `epi-lib/test/m4/*`, `epi-lib/test/m5/*`

### Objectives

- Expand `quintessence_hash` to the canonical 32-byte surface everywhere internally.
- Ensure M3 charge tuples are consumed from real stored/generated lookup data, not hand-coded ad hoc math.
- Introduce/normalize:
  - `quintessence_quaternion`
  - `live_quaternion`
  - canonical oracle faces
  - canonical M4 temporal and payload carrier structs
  - 10-planet temporal surfaces plus EarthBody-aware bodily mapping
- Upgrade `M4_Temporal_Now`, identity, oracle draw, canonical tag, and medicine-facing structs to match harmonized spec language.
- Rewrite stale C tests that currently assert `u64`-style hash and 7-planet assumptions.

### Acceptance Criteria

- C can express the canonical identity/oracle payload substrate without lossy hash truncation.
- M4 tests validate real BLAKE3 byte arrays and real field parity.
- M3->M4 surfaces line up with fixtures and the canonical payload contract.

### Verification

- `make test_m3`
- `make test_m4`
- `make test_m5`

## Barrier 1: Bare-Metal Integration

**Owner:** Integrator only

### Tasks

- Resolve any header-boundary friction between 1A, 1B, and 1C.
- Remove any temporary compatibility aliases that are no longer needed.
- Confirm the canonical carrier shapes compile across all C modules.

### Verification

- `make test`

## Phase 2: Rust Contract And Domain Parity

### Workstream 2A: Rust FFI Mirrors And Contract Fixtures

**Owner:** Subagent D
**Write set:** `epi-cli/src/ffi/m1.rs`, `epi-cli/src/ffi/m2.rs`, `epi-cli/src/ffi/nara.rs`, new Rust FFI contract tests

### Objectives

- Mirror the new C shapes field-for-field with `#[repr(C)]`.
- Eliminate stale `u64`/short-hash mirrors.
- Mirror canonical 10-planet plus EarthBody-aware contracts where C exposes them.
- Add size/layout tests and fixture-driven parity tests so Rust cannot silently drift.

### Suggested Tests

- `epi-cli/tests/nara_ffi_contract.rs`
- `epi-cli/tests/nara_temporal_contract.rs`

### Verification

- `make rust-test RUST_TEST_ARGS="nara_ffi_contract"`
- `make rust-test RUST_TEST_ARGS="nara_temporal_contract"`

### Workstream 2B: Identity, Kairos, Clock, And Vault Domain

**Owner:** Subagent E
**Write set:** `epi-cli/src/nara/identity.rs`, `epi-cli/src/nara/wind.rs`, `epi-cli/src/nara/kairos.rs`, `epi-cli/src/nara/clock.rs`, `epi-cli/src/vault/kairos.rs`

### Objectives

- Move Rust identity to canonical `[u8; 32]` handling internally.
- Make preview strings explicit derivatives, not the runtime identity type.
- Bring Kairos into canonical planet ordering and EarthBody-aware embodied routing.
- Replace stale 9-slot/legacy temporal assumptions with the harmonized contract.
- Make the vault/Kairos persistence path capable of carrying the new temporal state cleanly.

### Suggested Tests

- `epi-cli/tests/nara_identity_contract.rs`
- `epi-cli/tests/nara_kairos_contract.rs`
- extend `epi-cli/tests/vault_commands.rs`

### Verification

- `make rust-test RUST_TEST_ARGS="nara_identity_contract"`
- `make rust-test RUST_TEST_ARGS="nara_kairos_contract"`
- `make rust-test RUST_TEST_ARGS="vault_commands"`

### Workstream 2C: Oracle, Medicine, Transform, Logos, And Lens Runtime

**Owner:** Subagent F
**Write set:** `epi-cli/src/nara/oracle.rs`, `epi-cli/src/nara/medicine.rs`, `epi-cli/src/nara/transform.rs`, `epi-cli/src/nara/logos.rs`, `epi-cli/src/nara/lens.rs`, `epi-cli/src/nara/pratibimba.rs`, `epi-cli/src/nara/weights.rs`

### Objectives

- Make `oracle_eval4`, canonical faces, and payload generation first-class runtime outputs.
- Make medicine consume the canonical payload contract instead of only local decan lookups.
- Carry contextual weighting as modulation, not identity mutation.
- Ensure transform/logos/lens layers consume the same canonical payload and temporal context.

### Suggested Tests

- `epi-cli/tests/nara_oracle_payload.rs`
- `epi-cli/tests/nara_medicine_contract.rs`
- `epi-cli/tests/nara_transform_contract.rs`

### Verification

- `make rust-test RUST_TEST_ARGS="nara_oracle_payload"`
- `make rust-test RUST_TEST_ARGS="nara_medicine_contract"`
- `make rust-test RUST_TEST_ARGS="nara_transform_contract"`

## Barrier 2: Rust Domain Integration

**Owner:** Integrator only

### Tasks

- Reconcile FFI mirror changes with domain modules.
- Remove any now-stale preview-first or torus-stage-first wrappers.
- Confirm the domain layer can compile and serialize canonical structures end-to-end.

### Verification

- `cargo build --manifest-path epi-cli/Cargo.toml`
- `make rust-test`

## Phase 3: Transport, Session, And Portal Integration

### Workstream 3A: Gateway, Session Boundaries, And SpacetimeDB

**Owner:** Subagent G
**Write set:** `epi-cli/src/gate/nara.rs`, `epi-cli/src/gate/spacetimedb_bridge.rs`, `epi-spacetime-module/src/lib.rs`, gateway/session tests

### Objectives

- Replace deferred `nara.oracle.payload` with a real payload endpoint.
- Align transport fields to canonical public forms:
  - 64-char hex of the 32-byte hash where transport needs strings
  - `tick12` instead of `torus_stage`
  - real payload structs instead of opaque strings/stubs
- Make session ownership explicit:
  - Khora/PI lifecycle owns session-start/session-open facts
  - Nara reads session authority and derives only allowed session-linked values
- Update SpacetimeDB schema/reducers so presence, oracle draws, and logos phase reflect the harmonized contract.

### Suggested Tests

- extend `epi-cli/tests/gate_spacetimedb_bridge.rs`
- extend `epi-cli/tests/gate_khora_integration.rs`
- extend `epi-cli/tests/session_lifecycle.rs`
- add `epi-cli/tests/gate_nara_contract.rs`

### Verification

- `make rust-test RUST_TEST_ARGS="gate_spacetimedb_bridge"`
- `make rust-test RUST_TEST_ARGS="gate_khora_integration"`
- `make rust-test RUST_TEST_ARGS="session_lifecycle"`
- `cargo build --manifest-path epi-spacetime-module/Cargo.toml`

### Workstream 3B: Portal Shared Clock State And TUI Plugins

**Owner:** Subagent H
**Write set:** `epi-cli/src/portal/clock_state.rs`, `epi-cli/src/portal/plugins/clock.rs`, `epi-cli/src/portal/plugins/m4.rs`, `epi-cli/src/portal/plugins/mod.rs`, `epi-cli/src/portal/mod.rs`

### Objectives

- Replace stale `torus_stage` naming with `tick12` in shared clock state and rendering.
- Upgrade `KairosState` and related portal rendering to the canonical 10-planet model plus EarthBody anchor semantics.
- Make oracle casts update shared clock state and payload consumers for real.
- Bring the portal/tab/plugin configuration into line with the harmonized clock/TUI spec.

### Suggested Tests

- `epi-cli/tests/portal_clock_state.rs`
- extend TUI/gate parity tests where relevant

### Verification

- `make rust-test RUST_TEST_ARGS="portal_clock_state"`
- `cargo build --manifest-path epi-cli/Cargo.toml`

## Barrier 3: Cross-Layer Runtime Glue

**Owner:** Integrator only

### Tasks

- Ensure `identity -> clock -> oracle -> payload -> medicine/transform/logos` is real in runtime code, not just type-compatible.
- Remove or isolate any final compatibility shims that keep stale field names alive.
- Confirm that gateway, portal, and CLI all agree on the same transport surface.

### Verification

- `make rust-test RUST_TEST_ARGS="gate_nara_contract"`
- `make rust-test RUST_TEST_ARGS="gate_method_parity"`
- `make rust-test RUST_TEST_ARGS="gate_full_parity_contract"`

## Phase 4: End-To-End Contract Completion

**Owner:** Integrator only

### End-To-End Scenarios

1. **Identity seed path**
   - set natal data
   - compute quintessence hash and quaternion
   - confirm canonical preview outputs are derived only
2. **Kairos path**
   - sync temporal state
   - confirm 10-planet ordering and EarthBody/7-chakra routing
3. **Oracle path**
   - cast I-Ching/tarot
   - update shared clock state
   - emit canonical `nara.oracle.payload`
4. **Medicine/transform/logos path**
   - consume payload
   - produce medicine, transform, and logos outputs from the same reading state
5. **Transport path**
   - publish presence/oracle/logos into gateway and SpacetimeDB using harmonized fields
6. **Portal path**
   - render updated clock, oracle, and body semantics from shared state without local reinterpretation

### Acceptance Criteria

- Every step above is executable in real code.
- No core `nara.*` path returns a deferred stub.
- No field required by the harmonized specs is missing from the runtime carrier chain.

## Phase 5: Final Verification And Closeout

**Owner:** Single owner only

### Verification Matrix

- `make test`
- `cargo build --manifest-path epi-cli/Cargo.toml`
- `make rust-test`
- `cargo build --manifest-path epi-spacetime-module/Cargo.toml`

### Required Targeted Regressions

- C:
  - `make test_m0_init`
  - `make test_m0_rfactor`
  - `make test_m1`
  - `make test_m2`
  - `make test_m3`
  - `make test_m4`
  - `make test_m5`
- Rust:
  - `make rust-test RUST_TEST_ARGS="nara_identity_contract"`
  - `make rust-test RUST_TEST_ARGS="nara_kairos_contract"`
  - `make rust-test RUST_TEST_ARGS="nara_oracle_payload"`
  - `make rust-test RUST_TEST_ARGS="nara_medicine_contract"`
  - `make rust-test RUST_TEST_ARGS="portal_clock_state"`
  - `make rust-test RUST_TEST_ARGS="gate_nara_contract"`
  - `make rust-test RUST_TEST_ARGS="gate_spacetimedb_bridge"`
  - `make rust-test RUST_TEST_ARGS="session_lifecycle"`

### Closeout Tasks

- Update `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md` implementation status to reflect reality after landing.
- Update any remaining historical notes that still mention superseded public field shapes.
- Run the repo-required pre-commit scope checks before any final integration commit.

## Subagent Batch Layout

Use this exact worker grouping unless the write sets change:

| Batch | Worker | Scope | Write Set |
|---|---|---|---|
| 0 | Integrator | Contract fixtures and parity manifest | `docs/scripts/lookups/*`, `epi-lib/test/fixtures/nara_clock/*`, `epi-cli/tests/fixtures/nara_clock/*` |
| 1 | A | M0-M1 C substrate | `epi-lib/include/m0.h`, `epi-lib/src/m0.c`, `epi-lib/include/m1.h`, `epi-lib/src/m1.c`, `epi-lib/test/m0/*`, `epi-lib/test/m1/*` |
| 1 | B | M2 C embodiment layer | `epi-lib/include/m2.h`, `epi-lib/src/m2.c`, `epi-lib/test/m2/*` |
| 1 | C | M3-M4 C substrate | `epi-lib/include/m3.h`, `epi-lib/src/m3.c`, `epi-lib/include/m4.h`, `epi-lib/src/m4.c`, `epi-lib/src/qv_data.c`, `epi-lib/test/m3/*`, `epi-lib/test/m4/*`, `epi-lib/test/m5/*` |
| 2 | D | Rust FFI mirrors | `epi-cli/src/ffi/*`, Rust FFI contract tests |
| 2 | E | Identity/Kairos/Clock domain | `epi-cli/src/nara/identity.rs`, `epi-cli/src/nara/wind.rs`, `epi-cli/src/nara/kairos.rs`, `epi-cli/src/nara/clock.rs`, `epi-cli/src/vault/kairos.rs` |
| 2 | F | Oracle/Medicine/Transform/Logos domain | `epi-cli/src/nara/oracle.rs`, `epi-cli/src/nara/medicine.rs`, `epi-cli/src/nara/transform.rs`, `epi-cli/src/nara/logos.rs`, `epi-cli/src/nara/lens.rs`, `epi-cli/src/nara/pratibimba.rs`, `epi-cli/src/nara/weights.rs` |
| 3 | G | Gateway/SpacetimeDB/session | `epi-cli/src/gate/nara.rs`, `epi-cli/src/gate/spacetimedb_bridge.rs`, `epi-spacetime-module/src/lib.rs`, gateway/session tests |
| 3 | H | Portal/TUI | `epi-cli/src/portal/clock_state.rs`, `epi-cli/src/portal/plugins/clock.rs`, `epi-cli/src/portal/plugins/m4.rs`, `epi-cli/src/portal/plugins/mod.rs`, `epi-cli/src/portal/mod.rs` |
| 4 | Integrator | Cross-layer glue and full verification | cross-cutting integration only |

## What Is Explicitly Not Blocked

- Full ground-up Parashakti/Neo4j repopulation is not required before runtime canonicalization.
- Any relation types that are intentionally graph-only may remain graph-only if they are explicitly classified that way in the parity manifest.
- Historical preview formats may continue to exist only as explicitly named derivatives of the canonical runtime fields.

## Definition Of Done

This plan is complete only when all of the following are true:

- C, Rust, gateway, SpacetimeDB, and portal share the same core clock/Nara contract.
- M0-M4 parity is tabulated and reflected in executable runtime surfaces.
- No core Nara method remains a deferred stub.
- Identity hash handling is 32-byte canonical internally and preview-only externally.
- `tick12` is the public discrete clock state everywhere.
- Planetary and bodily semantics follow `PlanetState[10] + EarthBodyState`.
- The end-to-end chain from identity to medicine/logos is real and regression-tested.
- The repo has one trustworthy implementation plan and the historical runtime plan has been reduced to status reporting rather than competing architecture.
