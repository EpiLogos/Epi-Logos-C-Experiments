# Visual-regression fixtures — acceptance-harness

**Track 29.T29.12** — visual-regression baseline fixtures for the two
integrated compositions the Theia shell ships.

These fixtures are the *expected* render contract for each composition layout.
The acceptance harness (`scripts/acceptance.mjs`) drives the real Theia shell
through the canonical [Track 05 T9 acceptance plan](../../src/common/acceptance-plan.ts),
then diffs the live render against the baselines indexed here. A drift in DOM
structure, owner→slot assignment, OmniPanel tab set, or persisted composition
state fails the visual-regression gate.

## Status — SPEC-AHEAD-INTEGRATION

The structure is canonical now; the binary screenshot bytes are captured by the
harness on first green run. Until then each composition ships a deterministic
**DOM snapshot** as the structural baseline and a **screenshot manifest** that
names the PNG baselines the harness will write. Nothing here contains protected
user data — every payload is classed `protected-local-synthetic-fixture`.

## Fixture sets (index)

| Fixture set | Composition | Named layout | Range | Active layout |
|-------------|-------------|--------------|-------|---------------|
| [`integrated-1-2-3/`](./integrated-1-2-3/manifest.json) | `plugin-integrated-1-2-3` | `cosmic-engine.integrated` | `1-2-3` | `daily-0-1` |
| [`integrated-4-5-0/`](./integrated-4-5-0/manifest.json) | `plugin-integrated-4-5-0` | `jiva-siva.integrated` | `4-5-0` | `ide-deep` |

## Per-set layout

```
integrated-<range>/
  manifest.json                  fixture manifest / index (artifacts + baselines)
  expected-state.json            expected composition + per-widget + OmniPanel state
  dom-snapshot.html              deterministic DOM baseline for the layout
  screenshots/
    baseline.manifest.json       named PNG baselines (per viewport) + capture recipe
```

## How a baseline is consumed

1. Harness boots the real stack (gateway, SpaceTimeDB, Neo4j, Redis, S5 stores).
2. Harness opens the composition via its `primaryCommandId`.
3. For each `viewport`, the live render is captured and compared:
   - **DOM** vs `dom-snapshot.html` (structural, owner→slot, tab order).
   - **Pixels** vs the named PNG in `screenshots/baseline.manifest.json`.
   - **State** vs `expected-state.json` (composition codec + per-tab state).
4. Any diff outside `tolerance` fails the gate with the offending owner named.

See [`../../tests/visual-regression.test.mjs`](../../tests/visual-regression.test.mjs)
for the contract these fixtures must satisfy.
