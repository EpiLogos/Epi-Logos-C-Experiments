# Pratibimba System — Decision Records

Architectural decision records (ADRs) for `Idea/Pratibimba/System/` (the Theia surface at `/pratibimba/system`). These supersede the original Track-05-T0 ADRs at `Body/M/epi-tauri/decisions/` which were authored before the Theia-only canon recast.

## Index

| ADR | Title | Status | PRD/IOD link |
|---|---|---|---|
| [ADR-05-004](./adr-05-004-electron-target.md) | Add Electron-app target alongside the existing browser-app | Decided 2026-06-01 | PRD-01 / PRD-04 |
| [ADR-05-005](./adr-05-005-electron-builder.md) | `electron-builder` configuration plan | Decided 2026-06-01 | PRD-04 |
| [ADR-05-006](./adr-05-006-docker-browser-mode.md) | Optional Docker browser-mode build for CI / headless | Decided 2026-06-01 | PRD-04 |
| [ADR-05-007](./adr-05-007-local-dev-topology.md) | Local-dev topology and readiness contract | Decided 2026-06-01 | DSD-01 |
| [ADR-05-008](./adr-05-008-obsidian-md-vsc.md) | ~~`obsidian-md-vsc` embedded VS Code extension for S1 vault reach~~ | **SUPERSEDED 2026-06-01 evening** | IOD-17 / canon §0.1 |
| [ADR-05-009](./adr-05-009-recast-001-002-003.md) | Recast notice for ADR-001/002/003 (now superseded by canon §2-§3) | Recorded 2026-06-01 | PRD-01/02/03 |
| [ADR-05-010](./adr-05-010-hen-vault-bridge.md) | Hen vault-bridge: Theia FS read + `s1'.vault.*` write + `s1'.semantic.*` neighbours | Decided 2026-06-01 evening | IOD-18 / IOD-19 / canon §0.3a / §0.3b / §1.1 |

## Predecessor ADRs (historical record)

The pre-recast ADRs at [`Body/M/epi-tauri/decisions/`](../../../../Body/M/epi-tauri/decisions/) remain in place as historical record. They answered the PRD-01/02/03 questions assuming a Tauri wrapper; canon §2-§3 has since closed those questions differently (no Tauri wrapper; one Theia process; kernel-bridge as Theia extension). See ADR-05-009 for the explicit recast bridge.

## Authority

Decisions in this directory are bound by:
- [m5-prime-system-shape-and-tauri-ide-canon.md §2-§5](../../../Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md) (Theia-only authority)
- [docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md](../../../../docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md) (decision register)
- [docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md](../../../../docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md) (Track 05 plan body)
