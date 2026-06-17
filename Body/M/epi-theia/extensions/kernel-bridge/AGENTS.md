# AGENTS.md — kernel-bridge

## Purpose
First-loaded Theia extension (`@pratibimba/kernel-bridge`) that bridges the Pratibimba System frontend to the external [[S0-SPEC]] `Body/S/S0/epi-cli` gate runtime (port 18794) via WebSocket/JSON-RPC, and publishes `KernelBridgeAPI` through Theia DI to downstream M-extensions, OmniPanel, and the agentic control room.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (gate/contract authority: [[S3-SPEC]], [[S0-SPEC]]).

## Ownership
- `package.json` — `@pratibimba/kernel-bridge` package manifest; declares the `frontend`/`backend` Theia extension entry points.
- `src/common/types.ts` — TypeScript mirror of `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` (Track 01 T5): runtime event/capability/profile shapes, protocol constants.
- `src/common/protocol.ts` — service path + `KernelBridgeBackendService` / `KernelBridgeFrontendClient` RPC interfaces.
- `src/common/index.ts` — package barrel re-exporting `KernelBridgeAPI`, `KERNEL_BRIDGE_API`, types.
- `src/browser/` — frontend DI module, `KernelBridgeAPI` impl, runtime source, status bar, m-extension-runtime bridge.
- `src/node/` — backend service + module connecting to the gate over WebSocket/JSON-RPC.
- `tsconfig.json`, `lib/` — TS build config and compiled output.
- Does NOT own: gate runtime semantics (delegated to the [[S0-SPEC]] epi-cli gate + [[S3-SPEC]] gateway-contract); M' domain law (lives in each owning M-extension).

## Local Contracts
- No local `CONTRACT.md` / `README.md` here.
- Code Coordinate Header: `src/common/types.ts` `//!`-style header names source authority `Body/S/S3/gateway-contract/src/lib.rs` (protocol) and `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` (runtime shapes).
- Owning specs: [[M'-SYSTEM-SPEC]], [[S0-SPEC]], [[S3-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule (this is the single bridge consumed by all M-extensions).
- `src/common/types.ts` must stay structurally in lockstep with `kernel_bridge_runtime.rs` — Track-01 contract tests assert parity; drift breaks the bridge.
- Keys are `camelCase` to match the Rust `#[serde(rename_all = "camelCase")]` structs.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.

## Verification
`pnpm build` (the package `test` script is `pnpm build` — `tsc -b`); workspace-wide `pnpm --dir Body/M/epi-theia test:contracts` runs the Track-01 parity suite.

## Child DOX Index
- (leaf)
