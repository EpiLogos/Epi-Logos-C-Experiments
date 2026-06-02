# Track 05 T0 — Migration Inventory (Post-Canon-Recast)

**Generated:** 2026-06-01 (afternoon)
**Amended:** 2026-06-01 (evening — IOD-18/19 reversal absorbed; see Amendment Note below)
**Owner:** `admin-track05-theia` (parallel m-dev thread, Track 05 scope)
**Plan:** [05-tauri-ide-shell-and-pratibimba-system.md](../05-tauri-ide-shell-and-pratibimba-system.md)
**Canon authority:** [m5-prime-system-shape-and-tauri-ide-canon.md](../../../Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md) §2-§3 + §0.3a/§0.3b/§1.1 (Theia-only revision; Hen-vault-bridge replacement)
**Decisions resolved by canon:** PRD-01, PRD-02, PRD-03 — see [11-open-architectural-decisions.md](../11-open-architectural-decisions.md)
**Decisions added:** IOD-18 (Smart Connections via Hen `smart_env.rs`), IOD-19 (Hen as vault-write gatekeeper) — same decision register.

This artifact is the master T0 deliverable for the recast Track 05 (Theia-only, Electron-canonical, Hen-vault-bridge). It enumerates every file in the two inheritance sources and assigns each a Theia destination, an "absorb-by-already-landed" finding, a "lift to gateway / drop / retire" disposition, or a forward-port plan.

## Amendment Note (2026-06-01 evening) — IOD-18/19 reversal absorbed

**What changed:** The original T0 inventory (2026-06-01 afternoon, this thread) named `obsidian-md-vsc` as the canonical S1 vault reach per canon §0.1 / IOD-17. Research surfaced that `willasm.obsidian-md-vsc` is **not a vault renderer** — it is an Obsidian-app remote-control shim via the `obsidian-advanced-uri` plugin. It does not render `[[wikilinks]]`, parse the vault, read `.obsidian/plugins/` (so cannot surface Smart Connections), or operate without a running Obsidian desktop app. The decision was reversed same-day; ADR-05-008 carries the reversal note above its historical content.

**Replacement architecture (now canonical):**

| S1 vault function | Pre-amendment | Post-amendment |
|---|---|---|
| **Vault read** | `obsidian-md-vsc` commands | Theia's native filesystem provider against [[/Idea]] |
| **Vault write** | `obsidian-md-vsc` commands | `s1'.vault.{read_file, write_file, move_file, rename_file, append_block, update_frontmatter}` gateway methods routed through Hen ([IOD-19](../11-open-architectural-decisions.md#IOD-19)). Hen's [`Body/S/S1/hen-compiler-core/src/wikilinks.rs`](../../../Body/S/S1/hen-compiler-core/src/wikilinks.rs) + [`graph_promotion.rs`](../../../Body/S/S1/hen-compiler-core/src/graph_promotion.rs) protect wikilink integrity, path soundness, and rename-safety. |
| **Vault semantic-neighbours** | `obsidian-md-vsc` commands | `s1'.semantic.{suggest_links, neighbors_of, search, by_block}` gateway methods over [`Body/S/S1/hen-compiler-core/src/smart_env.rs`](../../../Body/S/S1/hen-compiler-core/src/smart_env.rs) `suggest_link_candidates(LinkCandidateRequest) → LinkCandidateResponse` ([IOD-18](../11-open-architectural-decisions.md#IOD-18)). Reads `Idea/.smart-env/multi/*.ajson` (user's existing Obsidian + Smart Connections produces local BGE-micro-v2 embeddings). No Obsidian-runtime IPC; the user's Obsidian app continues to author + embed independently. |
| **Markdown rendering** | `obsidian-md-vsc` UI | Theia's native markdown editor + a Theia-native **Canon Studio** extension (Track 05 T4) with QL/bimba-coordinate decorations + wikilink autocompletion (T4.5). |
| **Backlinks** | `obsidian-md-vsc` `BacklinksPanel` | Hen-derived via `s1'.semantic.search` + explicit-outlink parse via `wikilinks.rs`. Rendered by the new `smart-connections-sidebar` Theia contribution (T4.5). |

**Substrate inheritance (mature, no rebuild required):**

- [`Body/S/S1/hen-compiler-core/src/wikilinks.rs`](../../../Body/S/S1/hen-compiler-core/src/wikilinks.rs) — `parse_wikilinks(markdown)` returns typed `Wikilink { raw, raw_target, target: WikilinkTarget::{Path, Heading, PathHeading}, alias, line, column, context }`. Production-grade.
- [`Body/S/S1/hen-compiler-core/src/smart_env.rs`](../../../Body/S/S1/hen-compiler-core/src/smart_env.rs) — `LinkCandidateRequest { vault_root, note_path, source_wikilinks, limit, include_stale } → LinkCandidateResponse { seed_sources, candidates: [LinkCandidate { target_path, wikilink_title, score, kind: ExplicitOutlink|SemanticSource|SemanticBlock, evidence_source_path, evidence_lines, stale }], warnings }`. Reads `.smart-env/multi/*.ajson`. Production-grade with live integration test (`smart_env_link_candidates.rs`).
- [`Body/S/S1/hen-compiler-core/src/graph_promotion.rs`](../../../Body/S/S1/hen-compiler-core/src/graph_promotion.rs), [`property_intelligence.rs`](../../../Body/S/S1/hen-compiler-core/src/property_intelligence.rs), [`relation_inference.rs`](../../../Body/S/S1/hen-compiler-core/src/relation_inference.rs), [`artifact_evidence.rs`](../../../Body/S/S1/hen-compiler-core/src/artifact_evidence.rs) — Hen compiler surfaces that downstream `s1'.vault.*` / `s1'.semantic.*` gateway methods will compose.
- `Idea/.smart-env/` — live Smart Connections data directory at the vault root (BGE-micro-v2 embeddings authored by the user's running Obsidian instance).
- [`Body/S/S5/epi-gnostic/`](../../../Body/S/S5/epi-gnostic/) — production Python package: the **RAG-anything substrate** with Graphiti integration. Not a future composition target; treated here as already-landed substrate that downstream Track 04 / Track 09 surfaces will inherit.

**Net architectural simplification:**
- Drops a strategic VS Code Extension API borrow that didn't earn its place.
- Removes Theia's runtime dependency on a co-located Obsidian app.
- Promotes Hen `smart_env.rs` from optional to canonical for vault semantic-index.
- Makes Hen the explicit gatekeeper for vault integrity (wikilink reconciliation, rename atomicity, path soundness).
- Track 05 gains a new T4.5 sub-tranche ("Vault-Bridge Theia Extension, Smart Connections Sidebar, Canon Studio Wikilink Autocompletion") gated on **Track 03 T6.5** (`s1'.vault.*` + `s1'.semantic.*` gateway surface, active thread's writescope).

**Affected ADRs / sections in this inventory:** Per-file rows below referencing `obsidian-md-vsc` are updated in-place; the original `obsidian-md-vsc` row in the Source-A services table now reads "vault-bridge extension + Theia FS provider". ADR-05-008 superseded with reversal note; ADRs 05-004/005/006/007 carry minor edits to drop the `plugins/obsidian-md-vsc` references.

---

## Inheritance sources

| Source | Role | Description | Status |
|---|---|---|---|
| `Body/M/epi-tauri/` | Migration source A (Tauri R19+Vite app) | The lightweight current `/body` daily-driver. 60 TSX/TS in `src/`, 42 Rust in `src-tauri/src/`. Production typed-client + Tauri-command path. | Read-only / migration source only — no further extension under canon-recast. |
| `Body/S/S3/epi-app/` | Migration source B (Electron R19+Vite app) | The deeper Electron build with the production OmniPanel sub-tree, M-domain views, S3 gateway client. Pre-dates the Tauri port; Tauri took a slimmed extract. | Read-only / migration source only. |
| `Idea/Pratibimba/System/` | Migration destination (Theia 1.56) | The pnpm-workspace Theia surface. Skeleton already landed with 12 extension packages; needs Electron-build target added per canon §2 and full content migration per T2. | Active destination (this track's writescope). |

The user-handover specified that **both** sources be surveyed; the existing `Body/M/epi-tauri/contract-inventory/track-06-baseline.json` (14 KB, 2026-06-01) is the per-file inventory for source A and is referenced rather than duplicated here.

## Substrate-truth disposition for Track 05

Before recording the migration map, this section records what is already landed in the destination tree. Per /m-dev step 4.5, the plan is a hypothesis about what is still to do; the substrate is ground truth.

### Already landed (T1-level deliverables that do not need rebuilding)

| Deliverable | Substrate evidence | Notes |
|---|---|---|
| pnpm workspace | `Idea/Pratibimba/System/{package.json, pnpm-workspace.yaml, pnpm-lock.yaml, .npmrc}` | pnpm 10.25.0 chosen; `shamefully-hoist=true` and `node-linker=hoisted` for Theia compatibility. |
| Theia version pin | `Idea/Pratibimba/System/package.json#pnpm.patchedDependencies` + `patches/@theia__application-manager@1.56.0.patch` | Theia 1.56.0 pinned across all 12 extension packages and `theia-app/`. |
| Node engine pin | `Idea/Pratibimba/System/package.json#engines.node` = `">=20.0.0 <25"` | Verified compatible with Theia 1.56. |
| `theia-app/` workspace package | `Idea/Pratibimba/System/theia-app/{package.json, webpack.config.js, gen-webpack.config.js, gen-webpack.node.config.js, lib/, src-gen/}` | Browser target only — `"theia": { "target": "browser", ... }` with `applicationName: "Pratibimba System"`. **Electron target NOT yet added.** |
| 12 extension package skeletons | `Idea/Pratibimba/System/extensions/{contracts, kernel-bridge-readiness, m-extension-runtime, m0-anuttara, m1-paramasiva, m2-parashakti, m3-mahamaya, m4-nara, m5-epii, integrated-composition, plugin-integrated-1-2-3, plugin-integrated-4-5-0, test, scripts}/` | TS-file counts: m-extension-runtime 24, integrated-composition 48, kernel-bridge-readiness 12, m0-anuttara 8, m1..m5 6 each, plugin-integrated-1-2-3 8, plugin-integrated-4-5-0 10. |
| Shared bridge contract scaffold | `extensions/m-extension-runtime/src/common/{bridge-api,shared-bridge,coordinate-context,observability,readiness,contribution-contracts,route,profile}.ts` | Provides `SharedBridgeAdapter`, `MExtensionReadinessSnapshot`, `MathemeHarmonicProfileBoundary`, `CoordinateContext`, etc. consumed by M extensions. |
| Smoke-build harness | `Idea/Pratibimba/System/scripts/smoke-build.sh` | Builds all 11 extensions + `theia-app` and asserts every extension chunks into `theia-app/lib/frontend/`. |
| Track-08 contract preflights | `Idea/Pratibimba/System/extensions/contracts/{07-t0-extension-contract-preflight.{json,md}, 07-t2-track08-contribution-contracts.md, 08-t0-composition-contract-preflight.{json,md}}` | Extension contribution + composition shape locked. |
| Contract-test bundle | `Idea/Pratibimba/System/extensions/test/{shared-bridge-fan-out, activation-and-persistence, m0-anuttara-inspector, track-08-contribution-contract, track-08-integrated-layout-contract, validate-extension-contract-preflight, validate-composition-contract-preflight}.test.mjs` | Wired to `pnpm test:contracts`. |
| Per-extension docs | `Idea/Pratibimba/System/docs/{dependency-model.md, extension-naming.md, publishing-model.md}` | Layered dependency model, Track-08 composition rules. |
| Original Track-05-T0 ADRs (now superseded) | `Body/M/epi-tauri/decisions/{adr-001-theia-runtime-mode.md, adr-002-single-vs-multi-webview.md, adr-003-bridge-ownership.md, track-05-t0-runtime-baseline.json}` | ADRs answered the pre-recast PRD-01/02/03 questions; canon §2-§3 has since closed them differently. Carry forward as historical record. |
| Source-A inventory baseline | `Body/M/epi-tauri/contract-inventory/track-06-baseline.json` | 14 KB per-file inventory of the Tauri R19 app, classifications: production_foothold / compatibility_adapter / placeholder. **Source-A coverage is complete in that artifact.** |

### Genuine forward work for T0 (this artifact + ADRs below)

| Deliverable | Status before this run | Action this run |
|---|---|---|
| Migration inventory covering **both** inheritance sources (A + B) | Source A inventoried (`track-06-baseline.json`); Source B not inventoried | This document supplies B and consolidates A by reference. |
| Decision: add Electron target alongside browser target | Open | See ADR 05-004 below. |
| Decision: `electron-builder` configuration plan | Open | See ADR 05-005 below. |
| Decision: optional Docker browser-mode build plan | Open | See ADR 05-006 below. |
| Decision: local-dev topology + readiness contract | Captured partially in `track-05-t0-runtime-baseline.json` | See ADR 05-007 below. |
| Decision: `obsidian-md-vsc` embedding plan | Open | See ADR 05-008 below. |
| Recast disposition for ADRs 001/002/003 | Superseded by canon | See ADR 05-009 below (recast notice). |
| Dependency gate map: each downstream tranche → Track 01-04 readiness gates | Sparse in current track body | Section "Downstream tranche gates" below. |

## Migration map — Source A: `Body/M/epi-tauri/`

The full source-A inventory lives at [`Body/M/epi-tauri/contract-inventory/track-06-baseline.json`](../../../Body/M/epi-tauri/contract-inventory/track-06-baseline.json). Below is the cross-walk into Theia destinations under `Idea/Pratibimba/System/`.

### Frontend services (`Body/M/epi-tauri/src/services/*`)

| Source file | Source role | Theia destination | Disposition |
|---|---|---|---|
| `types.ts` | Canonical TS mirror of Rust IPC shapes | `extensions/m-extension-runtime/src/common/{bridge-api,profile,…}.ts` (existing) | **Partially landed.** Migrate any types not yet covered by `m-extension-runtime` into a new `extensions/shared-services/src/common/typed-shapes.ts` (Track 05 T2). Drop hand-maintained Rust-mirror — Theia consumes via gateway JSON-RPC, no Tauri invoke. |
| `kernelProjection.ts` | KernelConsumerReadiness enum + projection | `extensions/m-extension-runtime/src/common/readiness.ts` (existing) | **Partially landed.** Cross-check enum members; if any are missing, port to `readiness.ts`. |
| `kernelProfileObservation.ts` | Profile observation projection | `extensions/m-extension-runtime/src/common/observability.ts` (existing) | **Partially landed.** Cross-check shapes. |
| `gatewayClient.ts` | Tauri-invoke gateway RPC + send_raw + connection state | `extensions/kernel-bridge-readiness/src/browser/gateway-readiness-source.ts` (existing) + future `kernel-bridge` extension (Track 01 T5) | **Partially landed.** The Theia version connects via Theia `WebSocketConnectionProvider` directly to `Body/S/S3/gateway`; no Tauri-invoke intermediary. T2 ports the dispatch shapes. |
| `temporalClient.ts` | DAY/NOW + temporal runtime via Tauri-invoke | New `extensions/shared-services/src/browser/temporal-service.ts` (T2) | **Forward port.** Replace Tauri-invoke with gateway RPC. Re-publish through Theia DI as `TemporalService`. |
| `graphClient.ts` | Graph nav + geometry via Tauri-invoke | New `extensions/shared-services/src/browser/graph-service.ts` (T2) | **Forward port.** Replace Tauri-invoke with gateway RPC. M0/M2/M3 widgets consume via Theia DI. |
| `naraClient.ts` | Nara oracle + day surface via Tauri-invoke | New `extensions/m4-nara/src/browser/nara-service.ts` (T2/T6) | **Forward port** into the m4-nara extension's local service. |
| `epiiClient.ts` | Epii inbox/review (placeholder) | `extensions/m5-epii/src/browser/epii-service.ts` (T6/T8) | **Forward port** as real S5 wiring lands. |
| `agentExecutionClient.ts` | Agent run lifecycle via Tauri-invoke | New `extensions/shared-services/src/browser/agent-execution-service.ts` (T8) | **Forward port.** Replace Tauri-invoke with gateway RPC. Agentic Control Room consumes via DI. |
| `clockClient.ts` | Cosmic clock + oracle/kairos mutations via Tauri-invoke | New `extensions/shared-services/src/browser/world-clock-service.ts` (T2/T4) | **Forward port as compatibility view** over `MathemeHarmonicProfile + S3 world_clock`. Per source-A baseline, this is a `compatibility_adapter` — replace single-authority Tauri clock with bridge-derived clock. |
| `pratibimbaClient.ts` | Tauri `pratibimba_summon_ide` commands | **DROP.** | The protocol was Tauri-webview-summoned Theia. Canon §2-§3 retires the Tauri wrapper entirely. The summon path becomes "user double-clicks the Electron app" or the optional `epi-logos://` URL scheme (T5). |
| `vaultClient.ts` | Vault read/save/flow/file-tree/backlinks via Tauri-invoke | **REPLACED by Hen-vault-bridge** (Track 05 T4.5) | Per IOD-18/IOD-19 (reversal of original `obsidian-md-vsc` plan): vault reads use Theia's native FS provider against [[/Idea]]; vault writes route through `s1'.vault.*` gateway methods (Hen-mediated for wikilink integrity); backlinks/semantic-neighbours via `s1'.semantic.*` over [`hen-compiler-core/src/smart_env.rs`](../../../Body/S/S1/hen-compiler-core/src/smart_env.rs). The Theia `vault-bridge` extension (T4.5 deliverable) publishes `VaultBridgeAPI` + `SemanticBridgeAPI` through Theia DI. Source-A `vault_*` flow/file/backlink methods retire entirely. |
| `invoke.ts` | Thin `tauri::invoke` wrapper | **DROP.** | No Tauri runtime in destination. |
| `index.ts` | Service barrel | New `extensions/shared-services/src/common/index.ts` | **Forward port** as Theia-DI barrel. |
| `*.test.ts`, `*.contract.test.ts` | Vitest contract tests | Co-locate next to ported services | **Forward port.** Tests adapt: Tauri-invoke mocks become Theia DI mocks against the same JSON shapes (gateway responses unchanged). |

### Frontend stores (`Body/M/epi-tauri/src/stores/*`)

Theia conventions split state by lifetime:
- **Per-workspace durable** → `@theia/workspace`'s `WorkspaceStorage`
- **Per-user persistent** → `@theia/preferences` (`PreferenceService`)
- **In-process ephemeral** → DI-scoped frontend service (singleton or per-widget)

| Source file | Theia destination | Disposition |
|---|---|---|
| `uiStore.ts` (ephemeral UI state, hotkeys, OmniPanel open/closed) | New `extensions/shared-services/src/browser/ui-state-service.ts` (DI-scoped frontend service) | **Forward port.** Theia's `Layout Restorer` handles widget visibility; `uiStore`'s residual state (active workspace, panel open/close) becomes a thin DI singleton + a Preference key for cross-session toggles. |
| `gatewayStore.ts` (connection state) | Consumed from `kernel-bridge-readiness` extension's `GatewayReadinessSource` (existing) | **Already landed.** No new store. |
| `graphStore.ts` (graph result cache) | New `extensions/shared-services/src/browser/graph-cache-service.ts` | **Forward port** as a frontend service with explicit cache invalidation tied to bridge generation. |
| `temporalStore.ts` (DAY/NOW state) | New `extensions/shared-services/src/browser/temporal-state-service.ts` | **Forward port.** |
| `vaultStore.ts` (last vault hits) | **DROP** (replaced by `VaultBridgeAPI` DI state in the Theia `vault-bridge` extension, T4.5) | No parallel vault state. |
| `clockStore.ts` (compatibility_adapter per baseline) | Merge into `world-clock-service.ts` above | **Forward port as compatibility view.** |
| `index.ts` (barrel) | `extensions/shared-services/src/browser/index.ts` | **Forward port.** |

> **Note on `extensions/shared-services/`**: this package does not yet exist in the destination. T2 will create it as a workspace package alongside `m-extension-runtime`, hosting the typed gateway clients that the M extensions consume via DI. Naming follows the existing extension-naming convention.

### Frontend shells / panels (`Body/M/epi-tauri/src/{shell,components,domains}/`)

| Source file | Theia destination | Disposition |
|---|---|---|
| `src/shell/Shell.tsx` | **DROP.** Theia's `ApplicationShell` replaces it. | Theia owns the workbench shell; the Tauri React `Shell.tsx` (workspace toggle, hotkey routing) is superseded by Theia's `LayoutRestorer` + `WorkspaceService`. The `daily-0-1.layout` and `ide-deep.layout` workspace descriptors (T2 deliverable) replace it. |
| `src/components/OmniPanel.tsx` | Replaced by the wholesale port from source B (`Body/S/S3/epi-app/renderer/components/OmniPanel.tsx` + `omni/` sub-tree). | **Drop the Tauri slim version; port the Electron rich version.** See Source B mapping. |
| `src/components/CommandPalette.tsx` | New Theia contribution wrapping the existing `CommandRegistry` / `QuickInputService` | **Forward port as a thin contribution.** Theia already supplies the command palette UX; the Epi-Logos wrapper adds VAK / bimba-coordinate decoration. |
| `src/domains/ClockCosmos.tsx` | New `extensions/m3-mahamaya/src/browser/clock-cosmos-widget.tsx` (T6) | **Forward port** into m3-mahamaya extension (cosmos visualization is a Mahamaya-codon rhythm surface). |
| `src/domains/WorkspacePanel.tsx` | **DROP.** Replaced by Theia workbench layouts. | Theia's layout service is the workspace switcher. |
| `src/domains/M0_Anuttara/{BimbaMap2D, BimbaMap3D, index}.tsx` | `extensions/m0-anuttara/src/browser/*` | **Forward port to existing `m0-anuttara` widget.** Tauri 2D/3D Bimba maps land as inspector views inside the existing m0-anuttara widget (T6). |
| `src/domains/M1_Paramasiva/{SchemaWorkspace, index}.tsx` | `extensions/m1-paramasiva/src/browser/*` | **Forward port** (T6). |
| `src/domains/M2_Parashakti/{CollabWorkspace, index}.tsx` | `extensions/m2-parashakti/src/browser/*` | **Forward port** (T6). |
| `src/domains/M3_Mahamaya/{HopfClock, StrataPanel, index}.tsx` | `extensions/m3-mahamaya/src/browser/*` | **Forward port** (T6). |
| `src/domains/M4_Nara/{FlowTimeline, HighlightSidebar, NaraDashboard, NaraEditor, index}.tsx` | `extensions/m4-nara/src/browser/*` | **Forward port** (T6). NaraEditor relies on rich-text — under canon §0.1 the canonical S1 editor is `obsidian-md-vsc`, so NaraEditor becomes a coordinator that opens markdown files via `obsidian-md-vsc` rather than a parallel editor. |
| `src/domains/M5_Epii/{AtelierExcavator, EpiiAgent, EpiiDashboard, LibraryFolio, index}.tsx` | `extensions/m5-epii/src/browser/*` | **Forward port** (T6/T8). |
| `src/domains/MPrime_Subsystems/{MPrimeSubsystemPage, index}.tsx` | New `extensions/integrated-composition/src/browser/mprime-subsystem-view.tsx` (T7) | **Forward port** into the integrated-composition extension as the conversational 4+2 profile surface. |
| `src/App.tsx`, `src/main.tsx`, `src/global.d.ts` | **DROP.** Theia entrypoints replace them. | `theia-app/src-gen/` provides Theia's frontend entrypoint. |
| `src/utils/hotkeys.ts` | New `extensions/shared-services/src/browser/hotkey-bindings.ts` | **Forward port as Theia `KeybindingContribution`.** Theia has its own keybinding registry; the Tauri ad-hoc hotkey module becomes contributions. |
| `src/test/runtimeFixture.ts` | `extensions/test/runtime-fixture.ts` (alongside existing contract tests) | **Forward port.** |

### Tauri Rust shell (`Body/M/epi-tauri/src-tauri/src/`)

The recast removes the Tauri wrapper. Tauri Rust commands either (a) move into Theia backend modules (when the logic must live co-process with Theia), (b) lift into the external `Body/S/S3/gateway` Rust process (when they should be substrate-side authority), or (c) drop entirely (when they only existed to bridge Tauri ↔ web).

> **Boundary constraint:** this thread does not write to `Body/S/`. Any "lift to gateway" disposition below is a **dependency-on-active-thread** marker, not a write-scope claim. The active thread owns Track 03 / `Body/S/S3/gateway`.

| Rust module | Current role | Disposition |
|---|---|---|
| `lib.rs`, `main.rs` | Tauri builder + entrypoint | **DROP** with the Tauri wrapper. |
| `events.rs` | Cross-process Tauri event types | **DROP.** Theia uses its own `MessageService` / RPC events; gateway events flow via `WebSocketConnectionProvider`. |
| `state.rs` | `PortalRuntimeState`, `SpacetimeMode` shared state | **LIFT TO GATEWAY.** This authority belongs in `Body/S/S3/gateway`; Theia consumes via JSON-RPC. *Dependency on active thread.* |
| `error.rs` | `AppError` | **DROP** Tauri-specific; Theia adopts gateway error envelopes. |
| `commands/app.rs` (`app_version`, `app_platform`, `app_get_settings`, `app_update_settings`) | App-level commands | **PARTIAL DROP / LIFT.** `app_version`/`app_platform` become Electron-process info. `app_get/update_settings` use Theia `PreferenceService`. |
| `commands/vault.rs` (13 vault commands) | Tauri vault adapter | **DROP** — replaced by `s1'.vault.*` gateway methods over Hen (Track 03 T6.5; consumed via the Theia `vault-bridge` extension at Track 05 T4.5). |
| `commands/graph.rs` (11 graph commands) | Graph nav via Neo4j | **LIFT TO GATEWAY.** `Body/S/S3/gateway` already owns S2 graph; Theia consumes via JSON-RPC. *Dependency on active thread / Track 03.* |
| `commands/gateway.rs` (5 gateway proxy commands) | Tauri WS proxy | **DROP.** Theia's `WebSocketConnectionProvider` connects directly. |
| `commands/harmonic_profile.rs` (`harmonic_profile_for_tick`) | Profile compute | **LIFT TO GATEWAY** / Track 01 kernel-bridge contract. *Dependency on active thread.* |
| `commands/clock.rs` (6 clock commands) | Cosmic clock mutations | **LIFT TO GATEWAY.** S3 `world_clock` is canonical authority. *Dependency on Track 03.* |
| `commands/temporal.rs` (3 temporal commands) | DAY/NOW state | **LIFT TO GATEWAY.** *Dependency on Track 03.* |
| `commands/agents.rs` (4 agent commands) | Agent run lifecycle | **LIFT TO GATEWAY.** Track 04/09 S5 contract. *Dependency on active thread.* |
| `commands/atelier.rs` (8 atelier commands) | Logos Atelier session ops | **LIFT TO GATEWAY** or implement as Theia backend module if filesystem-local. *Dependency on active thread for the S5 portion.* |
| `commands/library.rs` (2 library commands) | Library ecology + search | **LIFT TO GATEWAY.** *Dependency on Track 04.* |
| `commands/mef.rs` (3 MEF commands) | MEF lens listing/commentary | **LIFT TO GATEWAY.** *Dependency on active thread.* |
| `commands/nara.rs` (1 nara command) | Nara oracle cast | **LIFT TO GATEWAY.** *Dependency on active thread.* |
| `commands/pratibimba.rs` (3 pratibimba_* commands) | Tauri webview summon | **DROP.** Tauri-summon obsoleted by canon §2-§3. |
| `gateway/{connection.rs, mod.rs}` | Gateway WS client | **DROP.** Theia replaces it. |
| `graph/{client.rs, geometry.rs, mod.rs}` | Neo4j client + geometry | **LIFT TO GATEWAY.** Already partially overlapped by `Body/S/S2/graph-services`. *Dependency on active thread.* |
| `temporal/{mod.rs, spacetime.rs}` | DAY/NOW + SpaceTimeDB stub | **LIFT TO GATEWAY.** Active thread's Track 03 owns native SpaceTimeDB. *Dependency on active thread.* |
| `vault/{backlinks.rs, daily.rs, flow.rs, frontmatter.rs, highlight_registry.rs, mod.rs, tree.rs}` | Tauri vault adapter | **DROP.** Replaced by `s1'.vault.*` over Hen (per IOD-19). The wikilink-integrity logic these modules duplicated now lives canonically in [`hen-compiler-core/src/wikilinks.rs`](../../../Body/S/S1/hen-compiler-core/src/wikilinks.rs) + `graph_promotion.rs`. |
| `agents/mod.rs`, `atelier/{mod.rs, types.rs}`, `library/{mod.rs, types.rs}`, `oracle/{iching.rs, tarot.rs, mod.rs}`, `clock/mod.rs` | Rust subsystem support modules | **LIFT TO GATEWAY** for the substrate-owned portions; **DROP** for the Tauri-specific glue. *Dependency on active thread.* |

> **Net for Source A:** the entire Tauri runtime retires; ≈ 75% of Rust commands lift to `Body/S/S3/gateway` (dependencies on the active thread), the rest drop. The Tauri React tree's *content* (M-domain widgets, OmniPanel, CommandPalette, services, stores) ports into Theia per the table above.

## Migration map — Source B: `Body/S/S3/epi-app/`

Source B is the older Electron app (~75 hand-written TS/TSX in renderer/, plus the OmniPanel sub-tree, plus 8 Electron-main files, plus 16 shared files). It pre-dates the Tauri slim port and carries deeper M-domain views and the production OmniPanel.

### Top-level renderer components (`Body/S/S3/epi-app/renderer/components/`)

| Source file | Theia destination | Disposition |
|---|---|---|
| `OmniPanel.tsx` (~960 LOC production OmniPanel) | New `extensions/omnipanel-shell/src/browser/omnipanel-widget.tsx` (T2) | **Wholesale port — adapted, not rewritten.** This is the canonical OmniPanel. Tauri-invoke calls inside become Theia DI service calls; Electron IPC becomes Theia frontend↔backend module pattern; the React tree itself is preserved. |
| `omni/chat/{ChatPanel.tsx, attachments.ts, messageNormalizer.ts}` | `extensions/omnipanel-shell/src/browser/chat/*` | **Wholesale port.** Chat panel + attachments + normalizer. |
| `omni/contracts/{modelCatalog.ts, panelRpcParity.ts, panels.ts}` | `extensions/omnipanel-shell/src/common/contracts/*` | **Wholesale port.** Shared between front + back. |
| `omni/layout/{AdvancedDrawer.tsx, OmniPanelHeader.tsx, PrimaryTabs.tsx}` | `extensions/omnipanel-shell/src/browser/layout/*` | **Wholesale port.** |
| `omni/panels/{Channels, Config, Cron, Debug, Instances, Logs, Models, Nodes, Overview, Sessions, Settings, Skills}Panel.tsx` + `panelUtils.ts` | `extensions/omnipanel-shell/src/browser/panels/*` | **Wholesale port.** All 12 sub-panels. |
| `omni/ui/{button, card, input, tabs}.tsx` | `extensions/omnipanel-shell/src/browser/ui/*` OR a Theia-styled equivalent | **Port with adaptation.** Tailwind+CVA UI primitives — port verbatim, or replace with Theia's `@phosphor-icons/react` + Theia widget styling. Decision: **port as-is to avoid visual regression**; Theia accommodates Tailwind classes via webpack. |
| `AIChatWidget.tsx` | Merge into `omnipanel-shell` chat panel | **Drop separate widget**, fold into OmniPanel chat. |
| `BacklinksPanel.tsx` | **DROP.** Replaced by `smart-connections-sidebar` (Track 05 T4.5). | Backlinks derived from `s1'.semantic.*` over Hen `smart_env.rs` (per IOD-18) + explicit-outlink parse via `wikilinks.rs`. Surfaced by the new Theia `smart-connections-sidebar` contribution. |
| `BottomNavigation.tsx`, `Header.tsx`, `Shell.tsx`, `Sidebar.tsx`, `SlidePanel.tsx`, `TopBar.tsx` | **DROP.** Theia `ApplicationShell` + `MenuContribution` + `TabBarToolbar` replace them. | Theia owns the workbench chrome. The Electron shell/header/sidebar contribute nothing Theia can't provide via the existing layout services. |
| `CommandPalette.tsx` | Merge into `extensions/shared-services/src/browser/epi-command-palette.ts` (T2) | **Port semantics only** as a Theia `CommandContribution` decorating the built-in palette. |
| `CrossDomainLink.tsx`, `DomainHeader.tsx`, `DomainHub.tsx` | New `extensions/integrated-composition/src/browser/cross-domain-link.tsx` (T7) | **Forward port** into the composition extension. |

### Bridges & effects (`Body/S/S3/epi-app/renderer/components/{Bridges,effects}/`)

| Source file | Theia destination | Disposition |
|---|---|---|
| `Bridges/{BridgeVisualizer.tsx, CrossDomainBridges.tsx, index.ts}` | `extensions/integrated-composition/src/browser/bridges/*` | **Forward port** (T7). |
| `effects/{Beams, BeamsOfficial, DitherOfficial, RippleGridOfficial}.tsx` + `src/components/{Beams, Dither, RippleGrid}.tsx` | New `extensions/shared-services/src/browser/effects/*` OR replace with Theia-native styling | **Forward port as optional polish** — these are R3F/postprocessing visual effects. Defer port until T2 confirms WebGL/Three.js bundle cost is acceptable inside Theia. **Default: port at low priority; gate behind a preference.** |

### M-domain renderer (`Body/S/S3/epi-app/renderer/domains/M{0..5}_*`)

Source B holds the **deeper M-domain views** (M0..M5, each with ~11 files including `index.tsx`, `core/useXxx.ts`, `ui/{Hub, Workspace}.tsx`, `components/views/M{n}-{0..5}View.tsx`). These are the views the matching Theia m-extension must absorb.

| Source path | Theia destination | Disposition |
|---|---|---|
| `M0_Anuttara/{index.tsx, core/useAnuttara.ts, ui/{AnuttaraHub, GraphWorkspace}.tsx, components/views/M0-{0..5}View.tsx, components/views/index.ts}` (11 files) | `extensions/m0-anuttara/src/browser/{anuttara-hub, graph-workspace, views/M0-{0..5}-view, hooks/use-anuttara}.{tsx,ts}` | **Wholesale port** (T6). M0 already has a scaffold widget — these views become its primary content. |
| `M1_Paramasiva/*` (11 files, same shape: index, core, ui, components/views/M1-{0..5}View) | `extensions/m1-paramasiva/src/browser/*` | **Wholesale port** (T6). |
| `M2_Parashakti/*` (11 files) | `extensions/m2-parashakti/src/browser/*` | **Wholesale port** (T6). |
| `M3_Mahamaya/*` (11 files) | `extensions/m3-mahamaya/src/browser/*` | **Wholesale port** (T6). |
| `M4_Nara/*` (22 files — deepest expansion, includes editor/) | `extensions/m4-nara/src/browser/*` | **Wholesale port** (T6). Caveat: any Tiptap editor pieces are subordinated to the **Canon Studio** Theia-native markdown editor (T4) for canonical markdown work. Tiptap views become read-only renderers for non-markdown content, or open files in Canon Studio which routes saves through `VaultBridgeAPI` per IOD-19. |
| `M5_Epii/*` (13 files, includes ui/components/{AgentPanel, FileTreePanel}.tsx) | `extensions/m5-epii/src/browser/*` | **Wholesale port** (T6/T8). The AgentPanel becomes the Agentic Control Room foothold (T8). |

### Renderer stores (`Body/S/S3/epi-app/renderer/stores/*`)

| Source file | Theia destination | Disposition |
|---|---|---|
| `domainStore.ts` | New `extensions/shared-services/src/browser/domain-state-service.ts` | **Forward port.** |
| `editorStore.ts` | **DROP.** Replaced by Theia's `@theia/editor` + `obsidian-md-vsc`. | |
| `epiClawGatewayStore.ts`, `epiClawStore.ts` | New `extensions/epi-claw/src/browser/*` (T8 / Track 09 dep) | **Forward port** if `epi-claw` flow remains in scope; otherwise **DROP**. *Dependency on Track 09 active thread.* |
| `flowStore.ts` | `extensions/m4-nara/src/browser/flow-state-service.ts` | **Forward port** (M4 owns flow). |
| `highlightsStore.ts` | `extensions/m4-nara/src/browser/highlights-service.ts` | **Forward port** (M4 owns highlights). |
| `layoutStore.ts` | **DROP.** Theia's `LayoutRestorer` + workspace storage replace it. | |
| `observabilityStore.ts` | `extensions/m-extension-runtime/src/browser/observability-store.ts` | **Forward port.** m-extension-runtime already has observability types — add a frontend service. |
| `panelStore.ts` | `extensions/omnipanel-shell/src/browser/panel-state-service.ts` | **Forward port** alongside OmniPanel migration. |
| `themeStore.ts` | **DROP.** Theia's `@theia/core` theme service replaces it. | |
| `useS3Gateway.ts` | `extensions/kernel-bridge-readiness/src/browser/gateway-readiness-source.ts` (existing) | **Already landed in destination.** Drop the source hook. |

### Renderer powers / providers / theme / utils

| Source path | Theia destination | Disposition |
|---|---|---|
| `powers/graph/ForceGraph.tsx` | New `extensions/shared-services/src/browser/force-graph-widget.tsx` | **Forward port** as a shared component (used by M0/M2 graph views). |
| `powers/layout/{FunctionalGrid, Panel, PanelGroup, ResizeHandle}.tsx + index.ts` | **DROP.** Theia's `ApplicationShell` + `react-resizable-panels` integration replaces it. | |
| `powers/markdown/{FrontmatterPanel, MarkdownViewer}.tsx` | **DROP.** Replaced by Canon Studio (T4) + Theia's native markdown rendering. | Frontmatter parsing comes from Hen via `s1'.vault.update_frontmatter`; viewer surface uses Theia's built-in markdown. |
| `providers/ThemeProvider.tsx` | **DROP.** Theia's theme service replaces it. | |
| `theme/resolveTheme.ts` | **DROP.** | |
| `utils/linkRouter.ts` | New `extensions/shared-services/src/browser/link-router.ts` | **Forward port** as Theia URI handler contribution. |

### Renderer controllers (`Body/S/S3/epi-app/renderer/controllers/epi-claw/`)

| Source file | Theia destination | Disposition |
|---|---|---|
| `epi-claw/{types, controllers, gateway-client}.ts` | New `extensions/epi-claw/src/browser/*` (only if Track 09 active thread requires it; otherwise drop) | **Forward port conditional on Track 09 scope.** *Dependency on active thread.* |

### Electron-main process (`Body/S/S3/epi-app/main/`)

| Source file | Theia destination | Disposition |
|---|---|---|
| `main.ts`, `preload.ts` | **DROP.** Theia's Electron entrypoint (`@theia/electron`) replaces them. | The Theia Electron build (ADR 05-004 below) provides its own `main.js` + preload via `electron-builder`. |
| `epi-claw-client.ts`, `epi-claw-rpc.ts` | New `extensions/epi-claw/src/node/*` (Theia backend module) | **Forward port** to Theia backend if Track 09 keeps epi-claw. *Dependency on active thread.* |
| `s3-gateway-client.ts`, `ws-wrapper.ts` | **DROP.** Theia's `WebSocketConnectionProvider` + future `kernel-bridge` extension replace them. | |
| `js-yaml.d.ts`, `repo-paths.ts` | **DROP** (utility, unused once Electron main drops). | |

### Shared (`Body/S/S3/epi-app/shared/`)

| Source file | Theia destination | Disposition |
|---|---|---|
| `capabilities/{cacheKey, contracts, coordinate, domainNamespaces, envelope, policy, registry, textMarkdown, trace}.ts` | New `extensions/contracts/src/common/capabilities/*` | **Wholesale port.** The `contracts` extension already exists as an empty scaffold; this populates it. These are governance shapes shared front+back. |
| `innerStrata.ts`, `navigationConfig.ts`, `s4ObservableTypes.ts`, `types.ts`, `utils.ts` | `extensions/contracts/src/common/*` | **Wholesale port.** |
| `js-yaml.d.ts`, `repo-paths.ts` | **DROP.** Theia provides equivalents. | |

### Tests (`Body/S/S3/epi-app/tests/`)

| Source path | Theia destination | Disposition |
|---|---|---|
| `tests/main/*`, `tests/omni/*` | `extensions/test/*` + per-extension `*.test.{ts,tsx}` | **Forward port** as Theia-compatible vitest / Playwright tests next to ported sources. Reframe Electron-main tests as Theia-backend tests once the Theia Electron entrypoint lands. |

### Build & config (top-level `Body/S/S3/epi-app/*`)

| Source file | Disposition |
|---|---|
| `package.json` | **DROP.** `Idea/Pratibimba/System/package.json` is destination. |
| `vite.config.ts`, `vitest.config.ts`, `playwright.local.config.ts` | **DROP.** Theia uses webpack via `@theia/cli`; tests stay vitest but with Theia configs. |
| `tsconfig.json`, `tsconfig.main.json` | **DROP.** Replaced by `tsconfig.base.json` + per-package tsconfigs. |
| `index.html`, `postcss.config.js`, `tailwind.config.js`, `components.json` (shadcn) | **DROP or extract.** If shadcn components are retained inside the OmniPanel port, copy `components.json` and `tailwind.config.js` into `extensions/omnipanel-shell/`. |
| `EpiLogos-Dev.app/`, `dist/`, `node_modules/`, `package-lock.json` | **DROP** (build artifacts). |
| `public/fonts/{gaegu, urbanist}/*` | Copy to `extensions/omnipanel-shell/style/fonts/` if OmniPanel uses them | **Conditional port.** |

## Outstanding decisions — ADR set committed under this T0

The full ADR text lands at [`Idea/Pratibimba/System/docs/decisions/`](../../../Idea/Pratibimba/System/docs/decisions/). Each ADR carries the canon §reference, the decision, the consequences for downstream tranches, and the test/build hooks where applicable.

| ADR | Decision | Status |
|---|---|---|
| ADR-05-004 | Add Electron-app build target alongside the existing browser-app, both from one `theia-app/` tree | Decided |
| ADR-05-005 | `electron-builder` configuration (app id, per-OS targets, file inclusion, signing-deferred, auto-update-deferred) | Decided |
| ADR-05-006 | Optional Docker browser-mode build for CI / headless deployment | Decided |
| ADR-05-007 | Local-dev topology + readiness contract | Decided |
| ADR-05-008 | ~~`obsidian-md-vsc` embedded VS Code extension wiring~~ | **SUPERSEDED 2026-06-01 evening** — research surfaced it as remote-control shim, not vault renderer. Replaced by ADR-05-010. |
| ADR-05-009 | Recast notice for ADR-001/002/003 (now superseded by canon §2-§3) | Recorded |
| ADR-05-010 | Hen vault-bridge architecture: Theia FS provider for read + `s1'.vault.*` (IOD-19) for write + `s1'.semantic.*` (IOD-18) for semantic-neighbours | **NEW.** Decided 2026-06-01 evening. Replaces ADR-05-008. |

## Cross-cutting finding: `epi app` and `epi up` need re-wiring (plan gap)

**Discovered:** 2026-06-01 during T0 substrate-truth gate, surfaced by user.

`Body/S/S0/epi-cli/src/app/mod.rs` defines the CLI `epi app` command branch (`AppCmd { Launch, Dev, Build }`). Under the pre-recast architecture it targets the Tauri build pipeline directly:

- `app_source_dir(repo_root) → Body/M/epi-tauri` (hard-coded, with `EPI_APP_SOURCE_DIR` env override)
- `app_bundle_path → app_source_dir.join("src-tauri/target/release/bundle/macos/Epi-Logos.app")`
- `cargo_tauri_command → cargo tauri {dev|build} (current_dir = source_dir)`
- `launch_command_for_repo(repo_root)` is consumed by `epi up` to launch the app as part of full-stack startup.

Two locked tests assert the Tauri targeting:

- `app_source_targets_epi_tauri` — asserts `app_source_dir.ends_with("Body/M/epi-tauri")`
- `app_bundle_targets_tauri_bundle` — asserts `app_bundle_path.ends_with("src-tauri/target/release/bundle/macos/Epi-Logos.app")`

Under the canon recast ([m5-prime-system-shape-and-tauri-ide-canon.md §2-§3](../../../Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md)), both functions and both tests must retarget at the Theia Electron build:

- `app_source_dir → Idea/Pratibimba/System/theia-app/electron-app` (per [ADR-05-004](../../../Idea/Pratibimba/System/docs/decisions/adr-05-004-electron-target.md))
- `app_bundle_path → theia-app/electron-app/dist/<per-OS>/Pratibimba System.app` (per [ADR-05-005](../../../Idea/Pratibimba/System/docs/decisions/adr-05-005-electron-builder.md))
- `cargo_tauri_command` → drop and replace with `pnpm --filter @pratibimba/theia-app-electron build` + `electron-builder` invocation
- Tests retarget at `Idea/Pratibimba/System/` and `dist/mac/Pratibimba System.app` (or per-OS equivalent)

`epi up` also depends on this — full-stack startup currently shells out to `cargo tauri dev` when the bundle is absent. Under the recast it should shell out to `pnpm --dir Idea/Pratibimba/System start` (browser mode) or `pnpm --dir Idea/Pratibimba/System/theia-app/electron-app dev` (Electron dev mode).

### Why this is a plan gap

| Plan file | Mentions `epi app` branch? |
|---|---|
| `01-kernel-bridge-and-s0-foundation.md` | Lists `Body/S/S0/epi-cli` write scopes for kernel-bridge readiness / FFI / schemas / `epi up` orchestration — but does **not** name the `src/app/mod.rs` re-wiring. |
| `05-tauri-ide-shell-and-pratibimba-system.md` (this track) | Talks about migrating the Tauri **app** code — but stops at the Theia side. Does not name the `epi-cli` `app` command. |
| All other plan files | No `app` command branch coverage. |

The re-wiring is a substrate write under `Body/S/S0/` (active thread's writescope). This thread does not write there.

### Recommended disposition

- **Owner:** the active m-dev thread (Track 01 / S0 substrate writescope).
- **Suggested home:** add a new sub-tranche to **Track 01** (or to **Track 05** if the active thread prefers cross-track ownership) titled "`epi app` and `epi up` retarget at Theia Electron build" with:
  - Update `Body/S/S0/epi-cli/src/app/mod.rs`:
    - `app_source_dir` → `Idea/Pratibimba/System/theia-app/electron-app` (with `EPI_APP_SOURCE_DIR` env override preserved)
    - `app_bundle_path` → per-OS Electron-builder output path (with `EPI_APP_BUNDLE_PATH` env override added)
    - Replace `cargo_tauri_command` with `pnpm` invocation
    - `launch_command_for_repo` → unpacked bundle if present, else `pnpm --dir … dev`
  - Update tests:
    - `app_source_targets_epi_tauri` → `app_source_targets_theia_electron`
    - `app_bundle_targets_tauri_bundle` → `app_bundle_targets_electron_dist`
  - Wire **after** Track 05 T1 lands the `theia-app/electron-app/` package (so the targets exist before `epi-cli` references them).
- **Ordering constraint:** This depends on 05.T1 producing the Electron build target. Until then, leave `epi app` pointing at Tauri (the Tauri build remains functional as migration source); flipping the pointer too early breaks `epi up` for users who haven't yet run a Theia build.
- **Forward compatibility hint:** Until the flip, set `EPI_APP_SOURCE_DIR` in dev shells to the new path to opt-in test the new wiring once T1 lands.

### Carry-forward

This finding is added to the migration inventory as a **cross-cutting** gap — it sits across Track 01 and Track 05 boundaries and was missed by both tracks' tranche bodies. Active thread / user-final decides which track owns it.

### Resolution (2026-06-01, post-T1-electron-app)

After the 05.T1 amendment landed `Idea/Pratibimba/System/electron-app/` (sibling of `theia-app`, **not** nested as originally specified — flatter than the inventory text above implies), the `epi-cli` `app` branch was retargeted in-place:

- `Body/S/S0/epi-cli/src/app/mod.rs`:
  - `app_source_dir` default → `Idea/Pratibimba/System/electron-app` (preserves `EPI_APP_SOURCE_DIR` env override).
  - `app_bundle_path` → per-OS electron-builder output (`dist/mac/Pratibimba System.app` on macOS, `dist/linux-unpacked` on Linux, `dist/win-unpacked` on Windows). New `EPI_APP_BUNDLE_PATH` env override added.
  - `cargo_tauri_command` removed; replaced with `pnpm_app_command(source, script)` invoking `pnpm run <script>`.
  - `AppCmd::Dev` → `pnpm run dev`; `AppCmd::Build` → `pnpm run dist:dir`; `launch_command_for_repo` falls back to `pnpm run dev` when no bundle is present.
- `Idea/Pratibimba/System/electron-app/package.json`: added `dev` (= `build && start`) and `dist:dir` (= `build:prod && package:dir`) scripts so the Rust side stays simple and script orchestration lives with the package.
- Tests renamed and retargeted: `app_source_targets_theia_electron` and `app_bundle_targets_electron_dist` (per-OS via `cfg!`).

Path correction: the inventory text above (and ADR-05-004) reads `theia-app/electron-app` reflecting the original nested intent. The landed package is at `Idea/Pratibimba/System/electron-app` — sibling, not child. ADR-05-004 should be amended or annotated to match.

## Downstream tranche → Track 01-04 dependency gates

| Tranche | Track 01 (S0/kernel-bridge) | Track 02 (S2 graph) | Track 03 (S3 gateway/SpaceTimeDB) | Track 04 (S5 review/autoresearch) | Track 11 (capability matrix) | Track 12 (cymatic) |
|---|---|---|---|---|---|---|
| T0 (this) | none | none | none | none | none | none |
| T1 (Theia skeleton) | none | none | gateway readiness endpoint shape (informational) | none | none | none |
| T2 (migration + layouts) | none | none | none | none | none | none |
| T3 (kernel-bridge ext) | **T5-T7 contract** | none | **T1-T5 (gateway + WebSocket parity, native STDB, world_clock, presence)** | none | none | none |
| T4 (IDE chrome) | T7 (observability) | **T7-T8 (S2 payloads, GDS overlays)** | T1-T5 | **T7 (M5-3 contract surface)** | IOD-17 governance shape | none |
| T5 (OmniPanel + lifecycle) | T7 | none | T3 (reconnect/resync) | none | none | none |
| T6 (6 M extensions) | T5-T8 | T7-T9 | T1-T5 | none | none | none |
| T7 (integrated plugins) | T5-T8 | T7-T9 | T1-T5 | T6-T8 | none | **Track 12 substrate ready** |
| T8 (agentic E2E) | T7 (capability + observability) | T8 | T1-T5 | **T8-T9 (full review + autoresearch DTOs, run lineage)** | **IOD-17 three-way parity** | none |
| T9 (acceptance) | All | All | All | All | All | All |

## Verification of the source-A baseline tests

Per the recast T0 verification list:

- **`pnpm --dir Body/M/epi-tauri test`** — last passing evidence in `track-06-baseline.json` reports vitest 17/17, and the dd985f7 prototype work added 4 more (`pratibimbaClient.test.ts`) to bring total to 21/21. Source A is migration-source-only in this thread; the tests are not re-run here. **Carry forward as: passing as of 2026-06-01 commit dd985f7.**
- **`cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml`** — last passing evidence reports 44/44 → 49/49 after pratibimba protocol tests. **Carry forward as: passing as of 2026-06-01 commit dd985f7.** This thread does not extend the Tauri Rust code.

These tests should not block T1 entry. Source A is sealed; further extension belongs in `Idea/Pratibimba/System/`.

## Disposition statement for ledger evidence

This artifact and the ADR set under `Idea/Pratibimba/System/docs/decisions/` together satisfy the recast Track 05 T0 deliverables:

1. **Migration inventory** — done (this document covers both inheritance sources; source A also has the prior `track-06-baseline.json`).
2. **Theia version pin** — confirmed at 1.56.0 in the destination; ADR-05-004 records the verification.
3. **Package-manager decision** — confirmed at pnpm 10.25.0 in the destination; ADR-05-004 records the verification.
4. **Electron-builder configuration plan** — ADR-05-005.
5. **Optional Docker browser-mode plan** — ADR-05-006.
6. **Local-dev topology** — ADR-05-007.
7. **Track 01-04 dependency gate map** — section above.
8. **`obsidian-md-vsc` plan** — ADR-05-008.

Mark T0 → `review` with evidence pointing at this artifact + the ADR set. T1 follows: implement the Electron build target and minimal readiness contribution.
