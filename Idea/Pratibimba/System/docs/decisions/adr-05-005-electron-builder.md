# ADR-05-005 — `electron-builder` configuration plan

**Status:** Decided 2026-06-01
**Decision register:** PRD-04
**Affected tracks:** 05
**Depends on:** [ADR-05-004](./adr-05-004-electron-target.md)

## Context

Per ADR-05-004, the Electron-app target is canonical. T1 must produce a runnable Electron application bundle (signed installers explicitly out of scope for T1). This ADR records the `electron-builder` configuration plan.

## Decision

**`electron-builder` configuration** lives at `theia-app/electron-app/electron-builder.json`. T1 commits this file with the following shape:

```json
{
  "appId": "org.epi-logos.pratibimba-system",
  "productName": "Pratibimba System",
  "directories": {
    "buildResources": "build",
    "output": "dist"
  },
  "files": [
    "lib/**/*",
    "src-gen/backend/**/*",
    "src-gen/frontend/**/*",
    "package.json"
  ],
  "extraResources": [
    {
      "from": "../lib/frontend",
      "to": "frontend",
      "filter": ["**/*"]
    }
  ],
  "mac": {
    "category": "public.app-category.developer-tools",
    "target": ["dmg", "zip"],
    "hardenedRuntime": false,
    "gatekeeperAssess": false,
    "identity": null
  },
  "linux": {
    "category": "Development",
    "target": ["AppImage"]
  },
  "win": {
    "target": ["nsis"]
  },
  "publish": null
}
```

### Field-by-field rationale

| Field | Decision | Rationale |
|---|---|---|
| `appId` | `org.epi-logos.pratibimba-system` | Canonical reverse-DNS app identifier. Distinct from any Tauri-era `com.epi-logos.desktop` identifier (the Tauri shell is retired). |
| `productName` | `Pratibimba System` | Matches `theia-app/package.json#theia.frontend.config.applicationName`. |
| `files` | Lib + src-gen + package.json | Standard Theia-Electron file set; the browser bundle gets pulled in via `extraResources`. |
| `extraResources` | Re-pack `lib/frontend` from the browser bundle | Lets the Electron renderer load the exact same chunks as the browser build, fulfilling the "one codebase, two targets" canon. |
| `mac.target` | dmg + zip | dmg for end-user distribution; zip for auto-update channels when those land. |
| `mac.hardenedRuntime`, `gatekeeperAssess`, `identity` | `false`/`null` | **Signing deferred per T1 scope.** A future ADR (post-T9) will turn on hardened runtime + identity for notarization. |
| `linux.target` | AppImage | Single-file Linux distribution. `deb`/`rpm` deferred. |
| `win.target` | nsis | Standard Windows installer. Squirrel/auto-update deferred. |
| `publish` | `null` | **Auto-update deferred per T1 scope.** A future ADR (post-T9) will wire `publish` to a release channel. |

### Excluded from T1

- **Signing & notarization** (macOS Developer ID, Windows code-signing, hardened runtime, Apple notarization). Recorded as a follow-on decision once a release channel is chosen.
- **Auto-update** (`electron-updater` + `publish` configuration). Recorded as a follow-on decision once a release cadence is established.
- **Per-OS icons** beyond a placeholder. T1 ships a placeholder icon; final icon set is a content task.

These exclusions are explicit gates: the T1 verification — "Electron build target produces a runnable Electron application bundle (at least the unpacked directory)" — is satisfied without them.

### Build invocation

```sh
# T1 verification: unpacked build
pnpm --filter @pratibimba/theia-app-electron build
pnpm --filter @pratibimba/theia-app-electron run dist:dir   # electron-builder --dir
```

`dist:dir` produces `theia-app/electron-app/dist/mac/Pratibimba System.app/` (on macOS), `dist/linux-unpacked/` (on Linux), `dist/win-unpacked/` (on Windows). The unpacked bundle is the T1 acceptance artifact.

## Consequences

- T1 commits `electron-builder.json` and an `electron-app/package.json` wrapper.
- T1 verification produces and tests the unpacked bundle.
- T5 (Electron menu/tray/dock) consumes the build target.
- T9 (acceptance harness) runs against the canonical Electron build.

## Cross-references

- [`electron-builder` docs](https://www.electron.build/configuration/configuration) — for downstream additions.
- [Theia desktop application docs](https://theia-ide.org/docs/blueprint_documentation) — for parallel configuration in upstream reference apps.
