# Visual-regression fixtures — acceptance-harness

**Track 15.T15.12** — visual-regression baseline fixtures for the 0/1
toggle, profile-tick choreography, and the two integrated compositions the
Theia shell ships.

These fixtures are the *expected* render contract for each composition layout.
The acceptance harness (`scripts/acceptance.mjs`) drives the real Theia shell
through the canonical [Track 05 T9 acceptance plan](../../src/common/acceptance-plan.ts),
then diffs the live render against the baselines indexed here. A drift in DOM
structure, owner→slot assignment, OmniPanel tab set, or persisted composition
state fails the visual-regression gate.

## Status — BASELINE-COMMITTED

The frame manifests and PNG baseline bytes are committed. Each PNG is generated
from deterministic fixture metadata by
`scripts/generate-visual-regression-baselines.mjs`, then decoded and diffed by
`tests/visual-regression.test.mjs`. The documented diff threshold is `0.02`
pixel ratio. Nothing here contains protected user data — every payload is
classed `protected-local-synthetic-fixture`.

## Fixture sets (index)

| Fixture set | Coverage | Baseline frames | Composition / layout |
|-------------|----------|-----------------|----------------------|
| [`lemniscate-transition/`](./lemniscate-transition/manifest.json) | 15.5 0/1 toggle fold | 5 phase frames (`0%`..`100%`) | `daily-0-1` -> `ide-deep` |
| [`six-matrix-tick-choreography/`](./six-matrix-tick-choreography/manifest.json) | 15.9 profile-tick choreography | 12 tick frames across `M0`..`M5` | kernel-bridge profile tick |
| [`integrated-1-2-3/`](./integrated-1-2-3/manifest.json) | 15.4 + Track 07 integrated composition | 2 viewport frames | `cosmic-engine.integrated` on `daily-0-1` |
| [`integrated-4-5-0/`](./integrated-4-5-0/manifest.json) | 15.4 + Track 08 integrated composition | 2 viewport frames | `jiva-siva.integrated` on `ide-deep` |
| [`block-host-widget/`](./block-host-widget/manifest.json) | 44.9 Surface Standard / G8 | 3 block-host frames | `BlockHostWidget` via `@pratibimba/block-kit` |
| [`m2-parashakti-manifest.json`](./m2-parashakti-manifest.json) | 23.17 M2 cymatic determinism | 27 `m2-*` frames | `m2-parashakti` suite |

## Per-set layout

```
integrated-<range>/
  manifest.json                  fixture manifest / index (artifacts + baselines)
  expected-state.json            expected composition + per-widget + OmniPanel state
  dom-snapshot.html              deterministic DOM baseline for the layout
  screenshots/
    baseline.manifest.json       named PNG baselines (per viewport) + capture recipe
    *.png                        committed PNG baselines

lemniscate-transition/
six-matrix-tick-choreography/
block-host-widget/
  manifest.json                  fixture manifest / choreography metadata
  screenshots/
    baseline.manifest.json       frame list + sha256 + tolerance
    *.png                        committed frame-by-frame PNG baselines
```

## How a baseline is consumed

1. Harness boots the real stack (gateway, SpaceTimeDB, Neo4j, Redis, S5 stores).
2. Harness opens the composition via its `primaryCommandId`.
3. For each `viewport` or choreography frame, the live render is captured and compared:
   - **DOM** vs `dom-snapshot.html` (structural, owner→slot, tab order).
   - **Pixels** vs the named PNG in `screenshots/baseline.manifest.json`.
   - **State** vs `expected-state.json` (composition codec + per-tab state).
4. Any diff outside `tolerance` fails the gate with the offending owner named.

Regenerate approved baselines with:

```bash
pnpm --filter @pratibimba/acceptance-harness baseline:visual
```

Verify with:

```bash
pnpm --filter @pratibimba/acceptance-harness test:visual
```

See [`../../tests/visual-regression.test.mjs`](../../tests/visual-regression.test.mjs)
for the contract these fixtures must satisfy.
