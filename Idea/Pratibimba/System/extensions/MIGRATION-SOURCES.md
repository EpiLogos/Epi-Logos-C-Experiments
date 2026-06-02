# Migration sources for each extension

This file is the operational index of which legacy source files each extension absorbs during the Track 05 migration. The full per-file rationale lives in [`Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/migration-inventory.md`](../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/migration-inventory.md); this file is the workspace-local pointer so agents looking at a given extension can find its sources without leaving the tree.

T2 deliverable: every `Body/M/epi-tauri` source file is either (a) ported into a Theia destination listed below, or (b) marked retired with an explicit reason in the inventory.

## Extension → migration source map

| Extension | Track 05 tranche | Source-A (`Body/M/epi-tauri/`) | Source-B (`Body/S/S3/epi-app/`) |
|---|---|---|---|
| `kernel-bridge-readiness` | T1 (done) | — | — |
| `m-extension-runtime` | T1 (done) | `src/services/{types,kernelProjection,kernelProfileObservation}.ts` (partial — only shared contracts) | `shared/{innerStrata,navigationConfig,s4ObservableTypes,types,utils}.ts` (partial — only shared types) |
| `pratibimba-layouts` | **T2 (new)** | `src/shell/Shell.tsx`, `src/domains/WorkspacePanel.tsx` — superseded by Theia layout system. | `renderer/components/Shell.tsx` + `renderer/components/Sidebar.tsx` — superseded. |
| `omnipanel-shell` | **T2 scaffold; T5 full port** | `src/components/{OmniPanel,CommandPalette}.tsx` — superseded by source-B's depth. | `renderer/components/OmniPanel.tsx` (~960 LOC) + entire `renderer/components/omni/{chat,contracts,layout,panels,ui}/` sub-tree (26 files) — **wholesale port source.** |
| `m0-anuttara` | T6 | `src/domains/M0_Anuttara/{BimbaMap2D,BimbaMap3D,index}.tsx` | `renderer/domains/M0_Anuttara/*` (11 files: index, core/useAnuttara, ui/{AnuttaraHub, GraphWorkspace}, components/views/M0-{0..5}View) |
| `m1-paramasiva` | T6 | `src/domains/M1_Paramasiva/{SchemaWorkspace,index}.tsx` | `renderer/domains/M1_Paramasiva/*` (11 files) |
| `m2-parashakti` | T6 | `src/domains/M2_Parashakti/{CollabWorkspace,index}.tsx` | `renderer/domains/M2_Parashakti/*` (11 files) |
| `m3-mahamaya` | T6 | `src/domains/M3_Mahamaya/{HopfClock,StrataPanel,index}.tsx` + `src/domains/ClockCosmos.tsx` | `renderer/domains/M3_Mahamaya/*` (11 files) |
| `m4-nara` | T6 | `src/domains/M4_Nara/{FlowTimeline,HighlightSidebar,NaraDashboard,NaraEditor,index}.tsx` | `renderer/domains/M4_Nara/*` (22 files — includes editor/) |
| `m5-epii` | T6 / T8 | `src/domains/M5_Epii/{AtelierExcavator,EpiiAgent,EpiiDashboard,LibraryFolio,index}.tsx` | `renderer/domains/M5_Epii/*` (13 files — includes ui/components/{AgentPanel, FileTreePanel}.tsx) |
| `integrated-composition` | T7 | `src/domains/MPrime_Subsystems/{MPrimeSubsystemPage,index}.tsx` | `renderer/components/{CrossDomainLink,DomainHeader,DomainHub}.tsx` + `renderer/components/Bridges/*` |
| `plugin-integrated-1-2-3` | T7 | — (composes M1/M2/M3 services) | — (composes M1/M2/M3 views) |
| `plugin-integrated-4-5-0` | T7 | — (composes M4/M5/M0 services) | — (composes M4/M5/M0 views) |
| `contracts` | T2 (forward population from inventory) | — | `shared/capabilities/*` (9 files) |
| **`shared-services`** (forward) | T2 | `src/services/{gatewayClient,temporalClient,graphClient,naraClient,epiiClient,agentExecutionClient,clockClient}.ts` + `src/stores/{domainStore,uiStore,gatewayStore,graphStore,temporalStore}.ts` + `src/utils/hotkeys.ts` | `renderer/stores/{domainStore,flowStore,highlightsStore,observabilityStore,panelStore,useS3Gateway}.ts` + `renderer/utils/linkRouter.ts` + `renderer/powers/graph/ForceGraph.tsx` |
| **`vault-bridge`** (T4.5) | T4.5 (gated on Track 03 T6.5) | — (supersedes `vaultClient.ts` + all `vault_*` Tauri commands) | — (supersedes `BacklinksPanel.tsx`) |
| **`smart-connections-sidebar`** (T4.5) | T4.5 (gated on Track 03 T6.5) | — | — (new contribution; consumes `s1'.semantic.*` via vault-bridge) |
| **`canon-studio`** (T4) | T4 (gated on Track 02 T7-T8, Track 04 T7) | — | `renderer/powers/markdown/{FrontmatterPanel,MarkdownViewer}.tsx` — superseded; new Theia-native markdown editor with QL/bimba decorations. |

## Source files explicitly **retired** (not ported)

| Source | Reason |
|---|---|
| `Body/M/epi-tauri/src/services/{invoke,pratibimbaClient}.ts` | No Tauri runtime in destination. |
| `Body/M/epi-tauri/src/services/vaultClient.ts` | Replaced by `s1'.vault.*` via Hen-vault-bridge (T4.5). |
| `Body/M/epi-tauri/src/stores/vaultStore.ts` | Same. |
| `Body/M/epi-tauri/src/App.tsx`, `src/main.tsx`, `src/global.d.ts` | Theia entrypoints replace them. |
| `Body/M/epi-tauri/src-tauri/{lib,main}.rs`, `events.rs`, `error.rs`, `gateway/*` | Tauri runtime retired. |
| `Body/M/epi-tauri/src-tauri/src/commands/pratibimba.rs` | Tauri-summon path obsoleted by canon §2-§3. |
| `Body/M/epi-tauri/src-tauri/src/vault/*.rs` (7 files) | Replaced by `s1'.vault.*` over Hen per IOD-19. |
| `Body/S/S3/epi-app/renderer/components/{BottomNavigation,Header,Shell,Sidebar,SlidePanel,TopBar}.tsx` | Theia `ApplicationShell` + `MenuContribution` + `TabBarToolbar` replace them. |
| `Body/S/S3/epi-app/renderer/components/BacklinksPanel.tsx` | Replaced by `smart-connections-sidebar` (T4.5). |
| `Body/S/S3/epi-app/renderer/components/AIChatWidget.tsx` | Folded into OmniPanel chat panel. |
| `Body/S/S3/epi-app/renderer/stores/{editorStore,layoutStore,themeStore}.ts` | Theia's editor/layout/theme services replace them. |
| `Body/S/S3/epi-app/renderer/powers/layout/*` (5 files) | Theia's `ApplicationShell` + `react-resizable-panels` replaces them. |
| `Body/S/S3/epi-app/renderer/powers/markdown/*` (2 files) | Replaced by Canon Studio + Theia native markdown. |
| `Body/S/S3/epi-app/renderer/providers/ThemeProvider.tsx` | Theia theme service replaces it. |
| `Body/S/S3/epi-app/main/*.ts` (8 files) | Theia Electron entrypoint (when ADR-05-004 lands) replaces them. |
| `Body/S/S3/epi-app/{vite,vitest,playwright}.config.*`, `tsconfig*.json`, `package.json`, etc. | Build/config files. Replaced by `Idea/Pratibimba/System/` workspace files. |

## Forward extensions not yet scaffolded

These appear in the migration map but do not yet have a workspace package because their build is forward work for later tranches:

- `shared-services/` — T2 forward (typed gateway clients, DI singletons absorbing source-A services + stores).
- `vault-bridge/` — T4.5 (gated on Track 03 T6.5).
- `smart-connections-sidebar/` — T4.5 (gated on Track 03 T6.5).
- `canon-studio/` — T4 (gated on Track 02 T7-T8, Track 04 T7).
- `epi-claw/` (conditional) — only if Track 09 active thread keeps `epi-claw` in scope.

When these extensions get scaffolded, add a row to the table above and a corresponding migration-source note to their per-extension README.
