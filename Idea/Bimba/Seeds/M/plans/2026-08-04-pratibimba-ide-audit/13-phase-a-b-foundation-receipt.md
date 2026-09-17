# Phase A/B Foundation Receipt

Date: 2026-08-04

Scope: initial [[README|Pratibimba IDE Audit]] implementation pass in `Body/M/pratibimba-app/`

## Landed Runtime Truth

- Native binary resolution validates existence, executable permission, bounded `epi --help` compatibility, and command identity across explicit environment, saved configuration, repository-shared targets, bundled binary, and `PATH` candidates.
- A stale saved `epiBin` no longer blocks startup. A compatible fallback is selected and the structured config is repaired atomically.
- Supervisor status reports binary path, source class, and identity beside process state, port, pid, and detail.
- Renderer supervision installs the event listener before hydrating `gateway_status`, removing the first-event race.
- The native reveal gate requires supervisor adoption/spawn, gateway protocol connection, first valid profile generation, and vault root resolution.
- Native smoke begins from a stale-config fixture and accepts only a real [[Tauri]]/WKWebView receipt carrying supervised process evidence and non-zero workbench geometry.

## Landed Workbench Foundation

- One persistent frame now surrounds the preserved FlexLayout bodies: workspace bar, activity rail, contextual left host, editor/instrument groups, adjacent [[OmniPanel]], bottom operational panel, and compact status.
- Home plus [[M0']]-[[M5']] are typed, persisted workspace presets that route through the existing layout and subsystem controllers.
- Explorer, semantic search, graph, agent, review, diagnostics, and settings activities open real existing destinations. No placeholder destination was admitted.
- The operational panel reads real gateway events, per-binding readiness, session/coordinate/profile evidence, and runtime provenance.
- The frame was inspected at the native default size and the configured 900 × 600 minimum; workspace, review, and deep-search routes were driven in the running renderer with no console errors.

## Verification

- Native host: 15 unit tests plus 3 integration tests passed, including real executable compatibility and bounded wedged-candidate behavior.
- Renderer: `pnpm typecheck` passed.
- App gate: 303 test files passed, 3 existing files skipped; 2,428 tests passed and 4 existing tests skipped. All import, no-modal, single-clock, e2e-import-graph, and empty-state gates passed.
- Production renderer build passed.
- Real native stale-config smoke passed with `supervisorState=supervised`, `binarySource=repo-shared-target`, a compatible `Usage: epi [OPTIONS] <COMMAND>` identity, first profile generation, real `Idea/` vault root, and visible workbench dimensions.

## Boundary

This is the minimum Phase A contract and the Phase B skeleton, not the completed redesign. Redis, [[Neo4j]], [[Graphiti]], [[SpaceTimeDB]], and agent execution still need explicit required/optional startup ownership. Existing pane bodies still require staged migration into explorer/editor/panel roles. [[M5']] still lacks the complete task, context, tools, changes, diff, tests, evidence, approval, and promotion lineage described by [[06-redesign-brief]].
