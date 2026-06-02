# ADR-05-004 — Add Electron-app target alongside the existing browser-app

**Status:** Decided 2026-06-01
**Decision register:** PRD-01 (resolved by canon), PRD-04 (Theia API/version/PM/composition)
**Affected tracks:** 05, 07, 08
**Predecessor:** [ADR-001](../../../../Body/M/epi-tauri/decisions/adr-001-theia-runtime-mode.md) (Tauri-runtime mode — superseded)

## Context

`Idea/Pratibimba/System/theia-app/package.json` currently declares `"target": "browser"`. The canon recast ([m5-prime-system-shape-and-tauri-ide-canon.md §2-§3](../../../Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md)) names Electron as the **canonical desktop distribution** with the browser bundle retained for CI / Docker / optional headless deployment.

The pre-recast ADR-001 selected a Tauri-webview-loads-Theia-browser-bundle path with the `pratibimba://` custom URI protocol. That decision was prototype-resolved by commit `dd985f7` at Track 05 T2. Canon §2-§3 has since retired the Tauri wrapper entirely — leaving the question: which Theia delivery target is canonical?

## Decision

**Both targets are built from one `theia-app/` tree.**

- **Electron-app target (canonical desktop distribution)** — added via `@theia/electron` 1.56.0 and `electron-builder`. Per-OS targets dmg/zip (macOS), AppImage (Linux), nsis (Windows). Signing and auto-update are deferred (see ADR-05-005).
- **Browser-app target (existing)** — retained at its current configuration. Used for CI smoke builds (`scripts/smoke-build.sh`), optional Docker headless deployment (see ADR-05-006), and future hosted/shared deployment.

Implementation shape:

```
theia-app/
  package.json                # primary workspace package — browser target (existing)
  webpack.config.js           # browser webpack (existing)
  gen-webpack.config.js       # generated (existing)
  gen-webpack.node.config.js  # generated (existing)
  electron-app/               # NEW (T1 deliverable)
    package.json              # electron target, reuses browser bundle
    electron-builder.json     # electron-builder config (ADR-05-005)
```

The Electron target's renderer **reuses** the browser bundle via `@theia/electron`'s standard composition; this is the canonical Theia pattern (used by Gitpod, Eclipse Che, Coder, and reference architectures).

## Version pin verification

Theia 1.56.0 is already pinned in the workspace (via `patches/@theia__application-manager@1.56.0.patch` and per-package `"@theia/*": "1.56.0"` deps). Adding the Electron target requires:

- `"@theia/electron": "1.56.0"` (compatible with the existing pin)
- `"@theia/cli": "1.56.0"` already present in `theia-app/devDependencies`
- Node engine `>=20.0.0 <25` (already pinned, verified compatible with `@theia/electron@1.56.0` per Theia upstream release notes)

The patch file `@theia__application-manager@1.56.0.patch` will be re-verified against the Electron target during T1 first build. If the patch needs an Electron-specific addition, that addition is recorded as a T1 amendment to this ADR.

## Consequences

- T1 adds `theia-app/electron-app/` and the `electron-builder` invocation.
- T1 verification adds: `pnpm --filter @pratibimba/theia-app-electron build` produces an unpacked Electron app bundle (signed installers out of scope for T1).
- T9 acceptance harness can drive either the Electron build (canonical user product) or the browser build (CI / Docker), and both must surface the same bridge generation per success criteria.
- No second Theia codebase. One tree, two targets.

## Cross-references

- [m5-prime-system-shape-and-tauri-ide-canon.md §2-§3](../../../Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md) — Theia-only authority.
- [11-open-architectural-decisions.md#PRD-01](../../../../docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md) — PRD-01 resolution.
- [Theia upstream releases — 1.56.0](https://github.com/eclipse-theia/theia/releases/tag/v1.56.0) — release notes (consult during T1 first build).
