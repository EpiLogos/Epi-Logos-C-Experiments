# ADR-05-002 — Single-webview navigation vs multi-webview persistence

**Status:** Open — recorded by Track 05 T0 (2026-06-01).
**Decision register link:** `PRD-02` in `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`.
**Affected tracks:** 05, 06, 08.

## Context

When the user summons the deep IDE from `/body`, what should happen to the existing webview?

Canon prefers persistent co-existence of `/body` and `/pratibimba/system`. Implementation must prove state preservation, resource use, bridge identity, and user lifecycle semantics before either pattern is adopted as production.

## Options

1. **Single-webview navigation** with persisted restore — Tauri webview navigates from `/body` to `/pratibimba/system` and back; React Router-style restore for `/body` state.
2. **Multi-window / multi-webview co-existence** — Tauri opens a second window/webview for `/pratibimba/system`; both surfaces stay alive.
3. **Tray/background `/body` plus Theia foreground** — `/body` minimizes to menubar/background; Theia foregrounds; both share one bridge subscription.

## Recommended default if safe

Option 2 with `/body` capable of tray/background persistence (per UFV-03), **provided** the prototype proves shared bridge identity and acceptable resource use.

## Prototype acceptance criteria

The Track 05 T2 prototype must:

- Open `/body`, summon Theia, verify both surfaces share:
  - Same `profile generation` (one MathemeHarmonicProfile stream).
  - Same `session_key` and `DAY/NOW`.
  - Same review-alert subscription (no duplicate notifications).
- Close Theia and verify `/body` resumes without duplicate bridge subscriptions.
- Run memory + CPU profile of multi-webview vs single-webview baselines and record `pass`/`fail` thresholds.

## Consequence of delaying

Menubar/background semantics (UFV-03), deep links (IOD-10), workspace persistence, and integrated-plugin multi-window tests cannot close.

## Cross-references

- Inherited from `Body/M/epi-tauri/contract-inventory/track-06-baseline.json` migration ledger.
- Coordinates with ADR-05-003 (bridge ownership): multi-webview implies the bridge cannot live exclusively in one webview's JS scope.
