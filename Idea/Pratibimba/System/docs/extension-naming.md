# Extension Naming Convention

This file is the **authoritative naming model** for every Theia extension and integrated plugin published from `Idea/Pratibimba/System/`.

## Package namespace

All published packages live under the `@pratibimba/` npm scope. The scope is private to the in-tree workspace — packages are NOT published to the public npm registry from this repository. They are loaded via `pnpm` workspace links and via Theia's local-plugin discovery at runtime.

## Naming rules

| Class | Pattern | Example |
| --- | --- | --- |
| Foundational | `@pratibimba/kernel-bridge-*` | `@pratibimba/kernel-bridge-readiness` |
| Individual M-extension (Track 07) | `@pratibimba/m{0..5}-{name}` | `@pratibimba/m0-anuttara`, `@pratibimba/m5-epii` |
| Integrated plugin (Track 08) | `@pratibimba/plugin-integrated-{range}` | `@pratibimba/plugin-integrated-1-2-3`, `@pratibimba/plugin-integrated-4-5-0` |
| Shared contracts | `@pratibimba/shared-{topic}` | `@pratibimba/shared-readiness` |
| Theia application | `@pratibimba/theia-app` | (the host workspace) |

The six individual M-extension names match the M5'-SPEC M-subsystem identifiers exactly: `anuttara`, `paramasiva`, `parashakti`, `mahamaya`, `nara`, `epii`. No abbreviations.

## Theia extension identifier

Each extension's `package.json` declares a `theiaExtensions` field. The entry `frontend` MUST point to `lib/browser/frontend-module` (or the back-end equivalent for non-browser extensions). The widget IDs use a colon-prefixed namespace:

```
<package-short-name>:<widget-purpose>
```

e.g. `kernel-bridge-readiness:widget`, `m0-anuttara:graph`, `plugin-integrated-1-2-3:cosmic-engine`.

## Forbidden import paths

Every extension MUST honour the forbidden-import set from `07-t0-extension-contract-preflight.json#sharedBridgeAdapter.forbiddenDirectImports`:

- `Body/S/S0`, `Body/S/S2`, `Body/S/S3`, `Body/S/S5`
- `@clockworklabs/spacetimedb-sdk`
- `neo4j-driver`, `redis`
- `portal-core`
- `epii-review-core`, `epii-agent-core`

S0/S2/S3/S5 are reached **only** through the shared `KernelBridgeAPI` adapter, never imported directly.

## File layout per extension

```
extensions/<name>/
├── package.json             # @pratibimba/<name>, theiaExtensions, deps
├── tsconfig.json            # extends ../../tsconfig.base.json
├── style/                   # CSS; loaded via Theia's static asset handling
├── src/
│   ├── common/              # types shared between front-end and back-end
│   ├── browser/             # frontend module + widgets
│   └── (node/)              # optional backend module if the extension needs one
└── lib/                     # compiled output (ignored in git)
```
