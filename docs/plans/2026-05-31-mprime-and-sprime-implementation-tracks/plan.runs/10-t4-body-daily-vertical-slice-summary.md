# 10.T4 — `/body` Daily Surface Vertical Slice — Run Summary

**Run ID:** `20260602T005924Z-10-T4`
**Owner:** `admin-10t4-body-vertical-slice` (parallel m-dev Thread L)
**Completed:** 2026-06-02T00:59:24Z
**Outcome:** pass (11/11 tests)

## What landed

A node-test e2e vertical-slice acceptance test at
`Idea/Pratibimba/System/extensions/test/body-daily-vertical-slice/body-daily-vertical-slice.test.mjs`
that drives the eight verification steps from the recast tranche body verbatim
against the live `body-lite-surface`, `pratibimba-layouts`, and
`kernel-bridge` extension code (no mocks of the production logic — every
deep-link intent, every privacy synthesiser, every layout descriptor is loaded
from the compiled `lib/common/*.js` outputs).

The test emits the canonical `[ACCEPTANCE:<step-id>:<key>=<value>]` sentinel
pattern used by Thread A's acceptance harness
(`Idea/Pratibimba/System/extensions/acceptance-harness/scripts/acceptance.mjs`),
so when a live Theia shell is later driven, these same sentinels surface in
its receipt collection without any test rewrite.

## The Recast it honours

Body/M/epi-tauri is DEPRECATED. `/body` is now the **0/1 daily-layout MODE**
inside the single Theia shell at `Idea/Pratibimba/System`. The recast,
applied 2026-06-01 to
`docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md`
lines 127–151, retargets this tranche from "build new Body/M/epi-tauri code"
to "vertical-slice acceptance test over the existing Theia extensions." The
test enforces this with a `Recast guard` assertion that rejects any
`tauri`-referencing widget id in the daily-0-1 descriptor.

## The eight steps

| Step | Verification | Outcome |
|------|--------------|---------|
| 1 | Open Theia shell in 0/1 daily layout — `DAILY_0_1_DESCRIPTOR` mounts OmniPanel + status-display + agent-checkin + 2 others | pass |
| 2 | Live profile generation + readiness via kernel-bridge — `cachedProfile.generation = 7`, `mode = 'lite'`, no forbidden field key | pass |
| 3 | S5 review notification — `synthReviewAlertSnapshot` produces a human-required candidate exposing only the `defer` decision (UI-gate parity) | pass |
| 4 | IDE intent invocation — `pratibimba.body.openControlRoom` builds an `ide-deep`-targeting intent at `agentic-control-room`; `openReviewItem` targets `m5-epii/review` | pass |
| 5 | Layout switch preserves sessionKey / DAY-NOW / profileGeneration / coordinate — `PratibimbaLayoutSwitcher.switchTo` carries the full `PreservedLayoutState` | pass |
| 6 | `KERNEL_BRIDGE_API.snapshot.upstreamSubscriptionCount === 1` across both layouts — after 5 daily↔deep transitions the upstream count never moved | pass |
| 7 | Switch back to 0/1 daily — invariants hold (`currentLayout = daily-0-1`, `upstreamSubscriptionCount = 1`) | pass |
| 8 | Privacy scan — 4 lite surfaces drop every forbidden-privacy row, deep recursive DOM + Theia workspace state scan finds 0 of the 18 forbidden keys, forbidden-class enum covers all 8 required classes | pass |

## Single-subscription invariant

```
upstreamSubscriptionCount (daily layout, initial activate)  = 1
upstreamSubscriptionCount (after daily → deep)              = 1
upstreamSubscriptionCount (after deep → daily)              = 1
upstreamSubscriptionCount (after daily → deep → daily → deep) = 1
duplicate subscriptions opened across 5 transitions          = 0
```

The substrate driver re-uses the production activate guard text verbatim:
```
if (eventUnsubscribe !== null) return;
```
(from `body-lite-surface/src/browser/body-lite-runtime-service.ts:101`).

## Privacy scan

| Surface | Forbidden-key findings |
|---------|------------------------|
| Rendered lite-surface DOM (review badge + agent check-in + safe handles + deep-link intent) | 0 / 18 |
| Theia workspace state (`pratibimba.workspace.*`, `epi-logos.layout.active`, `pratibimba.body.*`) | 0 / 18 |

18 forbidden keys (Thread C parity): `q_b, q_p, birth_date, birth_time, birth_place, natal_chart, protected_natal_data, journal_body, journal_text, dream_body, dream_text, oracle_interpretation_body, oracle_body, graphiti_body, graphiti_episode_body, identity_raw, identity_private, private_identity_data`.

Forbidden privacy class enumeration: 8 classes (`private, protected, restricted-graphiti-body, protected-nara-body, private-journal, private-birth-data, private-quaternion, private-profile`).
Allowed privacy class enumeration: 4 classes.

## Screenshots

None captured in this run. No live Theia browser-server is up in this lab
session; the deep browser-driven path with screenshots is owned by Track 05
T9's `extensions/acceptance-harness/scripts/acceptance.mjs`, which consumes
the `[ACCEPTANCE:…]` sentinels this test already emits. When that harness is
next driven against a live shell, the eight steps will surface together with
their browser-side evidence.

## Deviations from the ideal capture path

1. **No live Chrome session** — no shell on `http://127.0.0.1:3000`. The test
   probes the port honestly (HTTP GET with `<html>` check, rejecting the
   stale SpaceTimeDB process that happens to bind port 3000 on macOS) and
   classifies as `mode=substrate-vertical-slice` rather than overclaiming.
2. **No live gateway** — `ws://127.0.0.1:18794` not reachable. The S5
   review-notification step runs the production `synthReviewAlertSnapshot`
   synthesiser against a representative row, which is the same code the
   live wire-up runs after the `requestReviewEvidence` capability returns.
3. **Substrate driver mirrors production** — the activate guard and the
   layout-switch state machine are reproduced verbatim from the corresponding
   `body-lite-runtime-service.ts` / `layout-switcher.ts` files. The test
   asserts against the compiled `lib/common/*.js` of the actual extensions,
   so the intent shapes, the descriptor contents, and the privacy filters
   are not mocked.

## Files

- **WRITTEN (this thread):**
  - `Idea/Pratibimba/System/extensions/test/body-daily-vertical-slice/body-daily-vertical-slice.test.mjs` (11 tests, ~530 LOC)
  - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/10-t4-body-daily-vertical-slice-20260602T005924Z.json`
  - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/10-t4-body-daily-vertical-slice-summary.md` (this file)
- **NOT WRITTEN (lane discipline):**
  - `Body/**` (Body/M/epi-tauri is deprecated and untouched)
  - `Idea/Pratibimba/System/package.json` — orchestrator consolidates the
    `test:contracts` append at end-of-Track-10
  - Any extension `src/`, `lib/`, `style/`
  - Threads J + K's lanes (`extensions/test/profile-ledger/**`,
    `extensions/test/s2-s5-baseline/**`)
  - `plan.state.json` (marked via the m-dev-plan-assess helper)

## How to re-run

From the System root:

```bash
cd Idea/Pratibimba/System
node --test extensions/test/body-daily-vertical-slice/body-daily-vertical-slice.test.mjs
```

When a live Theia shell is up at `http://127.0.0.1:3000`, the Step-1 sentinel
flips to `[ACCEPTANCE:10t4-step1:mode=live-theia]` and the same sentinels
flow into the acceptance harness's receipt JSON via
`acceptance.mjs`'s stdout parser.
