# S0 Contract Inventory

Machine-readable inventory of every S0 module that touches S1/S2/S3/S4/S5 behavior.

## Files

- `s0-membrane-inventory.json` — the canonical machine-readable inventory. Generated from Thread I's `track13-feed-inventory.md` (a hand-audited classification of every adapter, shim, temporary live host, and duplicated-service-law surface in `Body/S/S0/**`).

## Schema

Each entry in `modules[]` records:

- `path` — the S0 source-file path
- `classification` — one of `kernel-owner | cli-adapter | gateway-adapter | temporary-live-host | compatibility-shim | duplicated-service-law` (Track 13 T0 vocabulary)
- `parity_status` — one of `Native | Adapter | CompatibilityAdapter | TemporaryLiveHost | Missing` (Track 13 T1 vocabulary, mirrors `gate::parity::CoordinateParityStatus`)
- `authority_path` — the Body-native crate or substrate path that owns the law (`null` when S0 itself is the canonical kernel)
- `adapter_path` — the S0 file that adapts to that authority (`null` when no adapter is required)
- `extraction_task` — the Track 13 tranche ID that will move law out of S0 (`null` if the module is canonical and stays)
- `allowed_s0_responsibilities` — the explicit list of behaviors S0 is permitted to retain after Track 13 cleanup

## Provenance

T0 deliverable. Generated alongside T1 (parity vocabulary recast) by Thread O.
Source: `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/track13-feed-inventory.md`.
