# Track 13 — Tranche T1 (Parity Ledger Recast) — Evidence

- **Date:** 2026-06-02
- **Owner:** `admin-13t1-parity-recast` (Thread O)
- **Inputs:**
  - Track 13 T0 deliverable, completed inline: machine-readable contract inventory at `Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json` (derived from Thread I's `plan.runs/track13-feed-inventory.md`).
  - Plan body: `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/13-s-sprime-modularity-and-s0-membrane-cleanup.md` lines 34–71 (T0 + T1).

## Scope completed

1. **`gate/parity.rs` refactor.** `CoordinateParityStatus::Mirror` is split into the four explicit kinds the plan demanded:
   - `Adapter` — long-term S0 adapter to a Body-native authority
   - `CompatibilityAdapter` — in-transition shim tagged for extraction
   - `TemporaryLiveHost` — process/data host with no canonical Body-native home yet
   - `Missing` — unchanged
   - `Native` — preserved (Body-native crate is canonical authority)
   - The previous `Mirror` and `Compatibility` variants are preserved as `#[deprecated]` associated constants so existing test fixtures continue to compile (`gate_full_parity_contract.rs::Mirror` → `Adapter`; `Compatibility` → `CompatibilityAdapter`). No production code references them.

2. **Four new fields per record.** `CoordinateParityRecord` now carries `authority_path: Option<&'static str>`, `adapter_path: Option<&'static str>`, `extraction_task: Option<&'static str>`, `allowed_s0_responsibilities: &'static [&'static str]`. All 27 records are populated. The `s0.*` record carries `authority_path = "Body/S/S0/epi-cli"` (S0 itself is the authority); every non-S0 adapter record names a Body-native path.

3. **Portal surface rendering updated.** `Body/S/S0/epi-cli/src/portal/surfaces.rs::GatewayParityProvider` now emits metadata lines for `status`, `status_detail` (operator-facing description via `CoordinateParityStatus::describe_for_portal()`), `authority_path`, `adapter_path`, `extraction_task`, and `allowed_s0_responsibilities`. The surface `label` now uses the explicit status label (e.g. `"s4'.* (Adapter)"` rather than `"s4'.* (Mirror)"`).

4. **METHOD_NAMES preserved.** `epi_s3_gateway_contract::METHOD_NAMES` remains the truth source. `parity.rs` only re-exports it; no method names were added or removed in the contract. Two pre-existing mapping gaps observed during test runs (`s3'.temporal.subscribe` / `s3'.spacetime.subscribe` and the `s1'.vault.*` / `s1'.semantic.suggest_links` surface from 03.T6.5) were added to `coordinate_family_for_gateway_method` — these methods were already in `METHOD_NAMES` but had no parity mapping, which was a divergence noted in Thread I's §4-i.

5. **T0 deliverable inline.** Machine-readable S0 membrane inventory written at `Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json` (538 lines). Includes:
   - 30 module entries with `classification` (T0 vocabulary), `parity_status` (T1 vocabulary), `authority_path`, `adapter_path`, `extraction_task`, and `allowed_s0_responsibilities` per row
   - The 12 compatibility shims (§2 of Thread I)
   - The 4 temporary live hosts (§3 of Thread I)
   - The 3 duplicated-service-law surfaces (§4 of Thread I)
   - Counts block for quick aggregate verification
   - A `README.md` describing the schema and provenance

## Status distribution (post-recast)

Record count: **26** (same set the original ledger carried — vocabulary recast, no records added or removed). Distribution:

| Status | Count | Notable records |
|---|---:|---|
| `Native` | 9 | `s0.*`, `s1'.*`, `s3'.temporal.*`, `s4.agent.*`, `s5.episodic.*`, `s5'.improve.*`, `s5'.epii.*`, `s5'.review.*`, `s5'.gnosis.*` |
| `Adapter` | 9 | `s1.*`, `s2.graph.*`, `s2'.*`, `s3'.*`, `s4'.*`, `s5.gnostic.*`, `s5.bimba.*`, `s5.m.*`, `s5'.kbase.*` |
| `CompatibilityAdapter` | 2 | `connect`, `s3.*` |
| `TemporaryLiveHost` | 0 | The variant is exposed and tested but no ledger record carries it. The live-host nature of `server.rs` (Thread I §3 α) is captured in the contract-inventory module entry `gate.server` classification `temporary-live-host` and in the `s3.*` record's `extraction_task = 13.T2 + 13.T3` field. The status variant remains a first-class citizen for future records or for Track 13 T3 use. |
| `Missing` | 6 | `agent.capabilities`, `s5'.mef.*`, `s5'.ql.*`, `s5'.explain`, `s5'.teach`, `s5'.seed.generate` |

Total: 26 = 9 + 9 + 2 + 0 + 6.

## Verification

All required tests pass on `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml`:

```
gate_parity_manifest             ........... 11/11 passed
portal_surfaces_contract         ........... 10/10 passed
gate_full_parity_contract        ...........  4/4  passed (compat sanity check)
```

New tests added in `tests/gate_parity_manifest.rs`:

- `parity_status_vocabulary_recast_has_explicit_kinds` — verifies the five explicit variants are distinct, the deprecated `Mirror` / `Compatibility` aliases still resolve to `Adapter` / `CompatibilityAdapter`, and the `label()` / `describe_for_portal()` API is in place.
- `every_record_exposes_track13_t1_provenance_fields` — compile-time presence check that the four new fields exist on every record.
- `non_s0_method_with_s0_adapter_has_body_native_authority_path` — **the plan-mandated regression test.** For every non-S0 method whose record has an adapter (any of Adapter / CompatibilityAdapter / TemporaryLiveHost, plus Native records that point at an S0 file), the test asserts `authority_path` is `Some(…)`, non-empty, and distinct from `adapter_path`. Currently validates 18 records.
- `temporary_live_host_status_is_used_for_known_transitional_runtimes` — keeps the variant alive even when no current record uses it.

New assertions in `tests/portal_surfaces_contract.rs`:

- Verify each gateway parity surface metadata exposes `status`, `authority_path`, `adapter_path`, `extraction_task`, `allowed_s0_responsibilities`.
- Verify `s4'.*` is labeled `Adapter` (was `Mirror`).
- Verify `s3.*` is labeled `CompatibilityAdapter`.

## Call-site updates in server.rs

**None required.** `Body/S/S0/epi-cli/src/gate/server.rs` does not reference `CoordinateParityStatus` or any of the renamed variants. The only callers of the recast types are `portal/surfaces.rs` (updated) and the test fixtures (updated). The deprecated alias constants ensure the third caller (`tests/gate_full_parity_contract.rs`, outside this thread's write lane) continues to compile and pass without modification.

## Method mapping integrity (`METHOD_NAMES` preservation)

The test `every_product_gateway_method_has_coordinate_mapping` iterates every entry in `epi_s3_gateway_contract::METHOD_NAMES` and asserts a coordinate-family mapping exists. It passes. No method was removed; two new mappings (`s3'.{temporal,spacetime}.subscribe` → `s3'.temporal.*` and `s1'.vault.*` / `s1'.semantic.suggest_links` → `s1'.*`) close pre-existing divergence gaps that Thread I had flagged in §4-i.
