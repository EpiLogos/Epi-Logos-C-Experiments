# M-Dev Context Pack - 01.T0

Generated: 2026-06-02T12:20:07.558Z

## Task

- **ID:** 01.T0
- **Title:** Electron / Theia Runtime Boundary
- **Track:** 01-electron-theia-shell-0-slash-1-and-omnipanel.md
- **Computed status:** ready
- **Write scopes:** Body/M/epi-tauri, Body/M/epi-tauri/**, Body/S/S0/**, Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md, Idea/Pratibimba/System, Idea/Pratibimba/System/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/M/epi-tauri`
- `Body/M/epi-tauri/**`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Pratibimba/System`
- `Idea/Pratibimba/System/**`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/01-electron-theia-shell-0-slash-1-and-omnipanel.md`
- `docs/plans/2026-06-02-m-prime-cycle-2-canonical/11-open-architectural-decisions.md`

## Dependency Context

- None

## Track Source Specs

- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`

## Task Body

1. **T0 - Electron / Theia Runtime Boundary**

   Canonical source: `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
   Cycle 1 substrate inheritance: extends `Idea/Pratibimba/System/**` and preserves `Body/M/epi-tauri/**` as migration-source-only evidence.

   Deliverables:

   - Lock Electron-hosted Theia as the actual desktop runtime and `Body/M/epi-tauri` as migration-source-only.
   - Name the process boundary, workspace/package layout, and runtime responsibilities of the shell.
   - Keep a single kernel-bridge and a single gateway/runtime stream across the whole shell.

   Verification:

   - Theia/Electron app build passes in `Idea/Pratibimba/System`
   - shell runtime tests prove one bridge instance and one gateway/runtime authority

## Track Open Decisions

_No track-specific Open Decisions section found._

## Decision Register Excerpt

_No decision register found._

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
