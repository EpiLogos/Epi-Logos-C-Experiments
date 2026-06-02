# ADR-05-011 — Track 05 release gate close: Theia-only shell is the canonical IDE surface

**Status:** Decided 2026-06-01 (Track 05 T9 close)
**Tranche:** Track 05 T9 — full Theia-shell acceptance + release gate
**Authors:** Thread A (admin-track05-finishing) m-dev run, with substrate verification handed off from 08.T8 + cross-thread acceptance audit (Thread C 07.T10 + 08.T9)
**Supersedes/closes:** PRD-01 (Theia runtime mode), PRD-02 (single vs multi-webview), PRD-03 (bridge host boundary), PRD-04 (Theia extension API + package manager). All four were already resolved by ADRs 05-001..010; this ADR records the release-gate close.

## Context

Track 05 began with `Body/M/epi-tauri` as the user-facing IDE surface (Vite + React 19 + Tauri 2). Tranches T0–T2 inventoried the existing surface, decided Theia browser-mode + Electron as the canonical runtime (ADR-05-001), and migrated the OmniPanel + layouts + kernel-bridge to the `Idea/Pratibimba/System/` workspace. Tranches T3–T7 brought the six M-extension widgets, the two integrated plugins, the cross-layout intent dispatcher, and the omnipanel-shell live. Tranche T8 (Thread A) and earlier tranches (Tracks 03 + 04) verified the end-to-end agentic flow.

Tranche T9 closes the release gate.

## Decision

**The Theia-only shell (`Idea/Pratibimba/System/`) IS the canonical Epi-Logos IDE surface for M5-3.** `Body/M/epi-tauri` is tombstoned (per its `DEPRECATED.md`). The Electron build is the user-facing product; the browser-mode build exists for CI / Docker / headless parity.

This ADR makes the following invariants binding:

### 1. One Theia process, two layouts

Per ADR-05-002, the shell runs as a single Theia process with two named workspace layouts (`daily-0-1` and `ide-deep`) switched via `ApplicationShell.setLayoutData` + `LayoutRestorer`. Both layouts share the same DI singletons (kernel-bridge, M-extension runtime, OmniPanel, ide-shell-m0-m5, agentic-control-room). Verified by the T9 acceptance step `layout.switch-to-deep-ide` + `layout.switch-back-to-daily`, both of which assert `bridge-subscription-id:UNCHANGED`.

### 2. Kernel-bridge first-loaded, single source of truth

Per ADR-05-003, the `@pratibimba/kernel-bridge` extension is the only network surface from Theia to the gateway. All M-extensions, integrated plugins, the M0/M5 chrome (`@pratibimba/ide-shell-m0-m5`), and the Agentic Control Room (`@pratibimba/agentic-control-room`) call `KERNEL_BRIDGE_API.invokeCapability` for every gateway round-trip. The capability allow-list (`KERNEL_BRIDGE_CAPABILITIES`) is the gate; methods outside it are rejected before any network call.

### 3. Vault-bridge gatekeeper for vault writes (IOD-19)

Per ADR-05-010, Canon Studio (`@pratibimba/ide-shell-m0-m5`) routes every save through the vault-bridge extension's `vault-bridge.s1prime.vault.write_file` command. Until T4.5 lands the vault-bridge, saves are rejected with the canonical reason `no vault-bridge registered` — verified by `tests/canon-studio-save-routing.test.mjs::vault-bridge write throws "no vault-bridge registered" before T4.5`.

### 4. Smart Connections via Hen `smart_env.rs` (IOD-18)

Per ADR-05-010, Smart Connections surface routes through the Hen-gateway. No client-side Obsidian plugin coupling. Vault read remains Theia-native (per the same ADR §1).

### 5. Capability matrix is single-source-of-truth (IOD-17)

`Body/S/S4/plugins/pleroma/capability-matrix.json` is the IOD-17 governance source. The Agentic Control Room reads it directly; the gateway enforces dispatch against the same set. Three-way parity (matrix ↔ UI ↔ gateway) is asserted by `extensions/agentic-control-room/tests/run-flow.test.mjs::parity over the real capability-matrix.json` and by the gateway-side `Body/S/S3/gateway/tests/dispatch_contract.rs`.

### 6. Human-required gates BLOCK agent transitions

Per the Track 05 plan body T8 hard rule, any review item with `humanRequired === true` cannot be approved / rejected / revised by an agent. Only `defer` is allowed (it records the human-required state). Verified at:
- **UI side:** `extensions/agentic-control-room/tests/human-gate.test.mjs` (3/3 passing — human-required+agent blocks approve/reject/revise; defer always allowed; human-required+human passes all).
- **Gateway side:** `Body/S/S5/epii-review-core/tests/review_inbox.rs::human_required_review_cannot_be_resolved_by_agent` (passing via `cargo test --offline`).

### 7. Privacy audit refuses protected payloads on every surface

`FORBIDDEN_PRIVACY_CLASSES` (`@pratibimba/ide-shell-m0-m5/contract.ts`) lists the 8 protected/private classes (Nara private journals, Graphiti bodies, protected birth data, private quaternions, etc.). Every chrome widget (Bimba graph viewer, Canon Studio, Agentic Control Room, Coordinate Tree, Logos Atelier, Evidence Pane, Review Pane, Autoresearch Pane) gates payloads through `isPrivacySafe()` and increments a `privacyDropped` counter on refusal. The counter is surfaced in data-test attributes so headless tests can assert zero leakage. Verified by `tests/contract.test.mjs::privacy gate refuses every forbidden privacy class` (8/8 forbidden classes refused; all 4 allowed classes + unset accepted).

## Status of the four PRD blockers (resolved)

| PRD | Subject | Resolution |
|-----|---------|------------|
| PRD-01 | Theia runtime mode | Resolved by ADR-05-001 (Theia browser + Electron). |
| PRD-02 | Single vs multi-webview | Resolved by ADR-05-002 (one process, two layouts). |
| PRD-03 | Bridge host boundary | Resolved by ADR-05-003 (kernel-bridge first-loaded, KERNEL_BRIDGE_API DI singleton). |
| PRD-04 | Theia extension API, package manager | Resolved by ADR-05-005 + ADR-05-006 (Theia 1.56 + pnpm workspace + electron-app for Electron canonical / theia-app for browser CI). |

## Verification

The release gate is closed when the following are simultaneously true:

1. `pnpm -r build` succeeds across all workspace packages.
2. `bash Idea/Pratibimba/System/scripts/smoke-build.sh` produces a 21+ MB bundle with chunks for all extensions (currently 16+: kernel-bridge, kernel-bridge-readiness, m-extension-runtime, pratibimba-layouts, omnipanel-shell, m0..m5 (×6), integrated-composition, plugin-integrated-1-2-3, plugin-integrated-4-5-0, ide-shell-m0-m5, agentic-control-room, acceptance-harness).
3. `pnpm --filter @pratibimba/ide-shell-m0-m5 test` — 17/17 passing.
4. `pnpm --filter @pratibimba/agentic-control-room test` — 14/14 passing.
5. `pnpm --filter @pratibimba/acceptance-harness test` — 11/11 passing.
6. `cargo test --offline --manifest-path Body/S/S5/epii-review-core/Cargo.toml` — 6/6 passing (including human-gate test).
7. `node Idea/Pratibimba/System/extensions/acceptance-harness/scripts/acceptance.mjs --dry-run` produces a parseable receipt with 7+ services and 7+ steps.

When all of the above pass, the release gate is closed. The full live-services acceptance run (operator-driven, per operator-runbook.md) is the *operational* verification; it consumes the same plan and produces an `acceptance-receipt-<timestamp>.json` in `docs/plans/.../plan.runs/`.

## Consequences

- **Track 05 closes.** Subsequent tranches operating on the IDE shell (T4.5 vault-bridge, future hardening) work against this ADR.
- **Body/M/epi-tauri is frozen.** All new IDE-surface work goes through `Idea/Pratibimba/System/`.
- **The kernel-bridge is the only network surface.** Direct `fetch` / `WebSocket` from any new extension is a regression.
- **The capability matrix governs.** Adding a new agentic capability requires editing `Body/S/S4/plugins/pleroma/capability-matrix.json` first; UI + gateway changes follow.

## References

- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md` §2–§5
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md` Tranches T0–T9
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` (PRD-01..04 resolved; IOD-17/18/19 live)
- `Idea/Pratibimba/System/docs/decisions/adr-05-001..010-*.md`
- `Body/M/epi-tauri/DEPRECATED.md`
