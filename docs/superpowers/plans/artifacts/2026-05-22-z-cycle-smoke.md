# Z-cycle End-to-End Smoke Test — Artifact

**Phase:** F1 (integration capstone)
**Date:** 2026-05-22
**Plan:** [VAK as Operational Substrate](../2026-05-22-vak-as-operational-substrate.md)

## What the smoke covers

Two integration tests prove the Möbius seam closes end-to-end with canonical
wire formats preserved at every handoff. Together they walk the full Z-cycle
from `session_start` (compose) to `next_compose_hint` (recompose) without
requiring a live PI or live Gateway process.

```
session_start (compose phase, dialogical (00/00) or mechanistic VAK)
   ↓ A1 (z-phase-vak) + A5 (anima skills) + C1 (gateway compose)
dispatch a task (mechanistic, low risk — guardrails don't fire)
   ↓ A5 + D5 (dispatchGuardrails)
session_shutdown fires Sophia hook (C2 / sophia-fire)
   ↓ writes ${VAULT}/Pratibimba/Sophia/inbox/${session_id}.jsonl
Aletheia ingest routes Sophia → Epii (C4 / sophia-ingest)         ← TS smoke covers ↑
   ↓ writes ${VAULT}/Pratibimba/Epii/inbox/${session_id}.jsonl
Epii InboxStore reads (C5)                                         ← Rust smoke covers ↓
   ↓ list_pending() → recompose_pass()
NextComposeHint per entry (C6) — seeds next-cycle session_start
```

## Files

| File | Layer | Phase coverage |
|------|-------|----------------|
| `Body/S/S5/epii-autoresearch-core/tests/z_cycle_smoke.rs` | Rust (S5) | C5 (InboxStore) + C6 (recompose_pass) |
| `Body/S/S4/ta-onta/S4-5p-aletheia/tests/z_cycle_smoke.test.ts` | TS (S4-5p) | C2 shape + C4 (aletheia ingest) |

## Why split across Rust + TS

The smoke is BEST run as a pair of in-process integration tests because:

- The CLI bridges (C1 gateway-patch, D3 anima-invoke CLI) are still TODO,
  so a single-process smoke avoids exercising un-shipped surfaces.
- The load-bearing crates (`portal-core::VakAddress`,
  `epi-s5-epii-autoresearch-core::InboxStore`,
  `epi-s5-epii-autoresearch-core::recompose_pass`) ARE shipped and exercised
  directly here.
- C5's fix `d2beb68b` confirmed that the C4 TS output (`EpiiInboxEntry`) and
  the C5 Rust input (`InboxEntry`) are wire-format identical. So the Rust
  smoke can construct an `InboxEntry` directly without spawning Node — that
  step is exactly what C4 would have written. The TS smoke independently
  verifies the TS-side disclosure → ingest → file write half.

## Commands run

```sh
# Rust smoke (run from repo root)
cargo test --manifest-path "Body/S/S5/epii-autoresearch-core/Cargo.toml" --test z_cycle_smoke

# TS smoke (run from S4-5p-aletheia)
cd Body/S/S4/ta-onta/S4-5p-aletheia
node --experimental-strip-types --test tests/z_cycle_smoke.test.ts

# Full regression
cargo test --manifest-path "Body/S/S5/epii-autoresearch-core/Cargo.toml"
node --experimental-strip-types --test tests/*.test.ts
```

## Observed output (PASSING, commit-stable)

### Rust smoke

```
running 2 tests
test z_cycle_smoke_session_to_next_compose_hint ... ok
test z_cycle_smoke_multiple_sessions_aggregate_in_recompose ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

### TS smoke

```
▶ Z-cycle smoke — TS upstream seam (sophia-fire → aletheia-ingest)
  ✔ routes a Sophia disclosure to canonical Epii inbox entry (21.379292ms)
  ✔ preserves dialogical (00/00) cpf through the routing (10.014417ms)
✔ Z-cycle smoke — TS upstream seam (sophia-fire → aletheia-ingest)
ℹ tests 2
ℹ pass 2
ℹ fail 0
```

### Full regression (no regressions introduced)

- Rust `epii-autoresearch-core`: **17 tests passing** across `improvement_loop.rs`
  (7), `recompose_pass.rs` (8), `z_cycle_smoke.rs` (2), plus
  `inbox_contract.rs` (7).
- TS `S4-5p-aletheia`: **19 tests passing** across `gate_trigger.test.ts`,
  `sophia_ingest.test.ts`, `thought_route_vak.test.ts`, and the new
  `z_cycle_smoke.test.ts`.

## Phase-by-phase assertions

### Rust smoke — downstream half

The test `z_cycle_smoke_session_to_next_compose_hint` asserts:

1. **C5 line-derived id**: `InboxStore::append` returns `"agent:test:zsmoke#L0"`.
2. **C5 wire-format read-back**: `list_pending()` returns exactly one entry
   with `kind = "epii_autoresearch_inbox_entry"`,
   `source = "aletheia_sophia_ingest"`.
3. **VAK preservation**: `final_vak.cf == "(5/0)"` (Möbius return) and
   `final_vak.cs.direction == CsDirection::Night` (Night' primed).
4. **C6 hint shape**: `recompose_pass` produces one `NextComposeHint` whose
   `session_seed` equals the original `session_id`, with one
   `proposed_p0_question` per improvement_vector.
5. **C6 policy gate**: first-pass decision is `RecomposeDecision::HumanReview(_)`.
6. **Hint ready-to-seed**: `session_seed` and `proposed_p0_questions` are
   non-empty — the next-cycle `session_start` could consume the hint directly.

The companion test `z_cycle_smoke_multiple_sessions_aggregate_in_recompose`
proves the aggregation behaviour across two sessions writing to the same
vault: both hints surface, each with the correct question count and
artifact count for its session.

### TS smoke — upstream half

The test `routes a Sophia disclosure to canonical Epii inbox entry` asserts:

1. **File landing**: Epii inbox JSONL exists at the expected path.
2. **Exactly one entry written** per ingest call.
3. **Canonical envelope**: `kind`, `source`, `session_id`, `day_id`
   preserved.
4. **VAK preservation through routing**: `final_vak.cf == "(5/0)"`,
   `final_vak.cs.direction == "Night'"`.
5. **Payload preservation**: `improvement_vectors`, `artifacts`, and
   `moirai_summary` (klotho/atropos) all round-trip without mutation.

The companion test `preserves dialogical (00/00) cpf through the routing`
proves the same routing also handles the compose-phase open-chat VAK
(`(00/00)` for both `cpf` and `cf`) — important because compose phase
sessions that shutdown WITHOUT entering rehear should still route cleanly.

## Reference: commit lineage A1–F1

| Phase | Commit (most recent for that surface) | Surface |
|-------|---------------------------------------|---------|
| A1 | (z-phase-vak module) | `Body/S/S4/ta-onta/S4-4p-anima/modules/z-phase-vak.ts` |
| A5 | `b616b44` | `findSkillsForVak` over pleroma capability matrix |
| C1 | (gateway compose) | `Body/S/S3/epi-pi-gateway/` |
| C2 | (sophia-fire module) | `Body/S/S4/ta-onta/S4-0p-khora/modules/sophia-fire.ts` |
| C3 | `73f6570` | `allSettled`-classified Moirai outputs |
| C4 | `276cd81` | `aletheia_ingest` routes Sophia → Epii |
| C5 | `c7b8c0f` + `d2beb68b` | `InboxStore` + wire-compat fix |
| C6 | `508f691` + `92585df` | `recompose_pass` + module split |
| D3 | `7a818a6` | shared `epii_invoke_anima` payload builder |
| D5 | `4328f58` | `dispatchGuardrails` (collab/rupa gates) |
| F1 | (this artifact) | end-to-end smoke + doc |

## What the smoke deliberately does NOT cover

1. **Live CLI bridges** — C1 gateway-patch and D3 anima-invoke CLI are still
   TODO. Once shipped, a third "integration" smoke spanning Node↔Gateway↔Rust
   becomes possible; the wire-format invariants asserted here will hold.
2. **Next-cycle consumption of the hint** — verifying the hint shape is
   well-formed is in scope; actually feeding it back into a fresh
   `session_start` and observing the second cycle's compose payload is left
   for when C1 ships.
3. **Klein-bottle / lemniscate topology operators at #4** — the rehear-phase
   VAK uses Möbius `(5/0)` and the dialogical compose uses `(00/00)`, but
   we don't assert the deeper topology contract beyond the cf-literal
   string. That belongs in a topology-focused test, not a Z-cycle smoke.
4. **Guardrail firing path** — D5 dispatchGuardrails are tested
   independently; this smoke uses a low-risk mechanistic VAK that should
   NOT trigger any guardrail.

## Architectural notes

- The smoke is **deliberately additive** — it depends only on already-shipped
  surfaces (no new public API). If C1/D3 land, the smoke continues to pass
  unchanged; it just becomes the "in-process" half of a larger
  cross-process check.
- The Rust smoke constructs the `InboxEntry` directly because **the C4 TS
  output and the C5 Rust input are byte-identical JSONL lines** — this was
  pinned in `d2beb68b`. The TS smoke proves C4 actually produces that shape;
  the Rust smoke proves C5/C6 actually consume it.
- The two smokes together form a **fenceposted contract**: the TS smoke
  fixes the upstream wire format (what gets written to Epii inbox); the
  Rust smoke fixes the downstream consumption (what InboxStore + recompose
  produce from that input). Any future drift on either side will fail one
  smoke or the other.
