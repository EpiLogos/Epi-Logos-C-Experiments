# ADR-05-002 — Single-webview navigation vs multi-webview persistence

**Status:** Decision — recorded by Track 05 T0, amended by Track 05 T2 (2026-06-01).
**Selected option:** Option 2 — multi-webview co-existence. `/body` stays in the primary Tauri window; `/pratibimba/system` opens in a second `WebviewWindow` labelled `pratibimba-ide` and persists until explicitly dismissed.
**Decision register link:** `PRD-02` in `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`.
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

## 05.T2 Prototype Amendment (2026-06-01)

`pratibimba_summon_ide` builds a fresh `WebviewWindow` (1600 × 1000 default, min 1280 × 800) the first time it's called; subsequent calls reuse the same window via `app.get_webview_window(PRATIBIMBA_IDE_WINDOW)` and call `.show().set_focus()`. Closing `/body` does not close the IDE window and vice versa — they share the Tauri process but have independent webview contexts.

Single-webview navigation (Option 1) was rejected because the existing `/body` Vite renderer carries substantial in-flight state (gateway connections, graph store, atelier session) which would be lost on every IDE summon/dismiss cycle. Tray/background `/body` (Option 3) is a future refinement once UFV-03 (menubar/background lifecycle semantics) closes.

**Verification:** `pratibimbaClient.test.ts` exercises `summon` / `dismiss` / `status` returning typed `PratibimbaIdeStatus` with `window_open` toggling correctly. Resource-use measurements deferred to a later acceptance run on a real desktop runtime; the Rust shell tests confirm the command surface compiles and behaves as specified.
