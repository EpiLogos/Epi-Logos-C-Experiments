# Claw Operator Protocol

**Status:** Experimental — claw-rust lane (Task 7 of OMX/Pleroma migration)
**Date:** 2026-04-04
**Coordinate:** S0' (terminal/runtime substrate layer)

## Overview

`claw-rust` is an experimental native runtime substrate for the Epi-Logos agent harness.
It runs alongside the PI (native PI harness) lane and is intended to eventually replace
PI as the default substrate once parity is verified.

The claw lane is currently **additive and non-destructive**: all existing PI defaults remain
intact. Claw occupies its own vendor directory and does not modify PI configuration.

## Vendor Location

```
vendors/claw-code-parity/   ← claw runtime vendor root
  PARITY.md                 ← parity status and deviation log
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `epi agent claw doctor --json` | Report health status of the vendored claw runtime |
| `epi agent claw verify-runtime --json` | Non-destructive smoke path through claw runtime |

### `epi agent claw doctor`

Checks for the presence and integrity of the vendored claw runtime. Reports:
- `clawVendorPresent` — whether `vendors/claw-code-parity/` exists
- `parityDocPresent` — whether `PARITY.md` is present in vendor root
- `status` — overall health (`ok`, `missing`, `degraded`)

### `epi agent claw verify-runtime`

Runs a non-destructive smoke path:
- Resolves the vendor root
- Reads the parity status document
- Reports the runtime status without modifying any tracked files
- Exits cleanly (status 0) whether the vendor is present or absent

## Parity Protocol

Parity between claw and PI is tracked in `vendors/claw-code-parity/PARITY.md`.

When claw parity reaches **FULL** (all PI capabilities matched), Task 8 of the migration
plan may proceed: defaulting to claw-first substrate.

Until then, the PI path remains the production default.

## Safety Contract

- Claw commands MUST NOT modify tracked repository files
- Claw commands MUST NOT alter PI configuration or state
- Claw doctor/verify must exit 0 even when vendor is absent (report status, don't crash)
- The `piBinaryPresent` field in `epi agent doctor` must remain present and accurate
  regardless of claw lane state

## Relation to PI

```
PI lane:    epi agent doctor          ← production default (unchanged)
Claw lane:  epi agent claw doctor     ← experimental (additive)
```

Both lanes coexist. The migration plan cutover (Task 8) will make claw the default
when parity is confirmed.

## See Also

- `docs/dev/pi-operator-protocol.md` — PI operator protocol (production default)
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-03-omx-pleroma-claw-runtime-migration.md` — full migration plan
- `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md` — authority matrix
- `vendors/claw-code-parity/PARITY.md` — live parity status
