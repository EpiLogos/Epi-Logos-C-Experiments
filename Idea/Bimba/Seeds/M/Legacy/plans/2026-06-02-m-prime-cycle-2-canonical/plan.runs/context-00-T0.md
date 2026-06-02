# M-Dev Context Pack - 00.T0

Generated: 2026-06-02T12:15:54.150Z

## Task

- **ID:** 00.T0
- **Title:** M' Surface Ownership Matrix
- **Track:** 00-overview-and-m-prime-first-coverage.md
- **Computed status:** ready
- **Write scopes:** Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md, Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md, Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-1-close/SPRINT.md

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-1-close/SPRINT.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/00-overview-and-m-prime-first-coverage.md`
- `docs/plans/2026-06-02-m-prime-cycle-2-canonical/11-open-architectural-decisions.md`
- `scripts/m-dev-plan-assess.mjs`

## Dependency Context

- None

## Track Source Specs

_No Source Specs section found in the track file. Pause and gather source context manually before implementation._

## Task Body

1. **T0 - M' Surface Ownership Matrix**

   Canonical source: `Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md`, `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
   Cycle 1 substrate inheritance: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-1-close/SPRINT.md` is the only cycle 1 closing artifact; every cycle 2 track must inherit from it rather than rediscovering landed work.

   Deliverables:

   - Map every M' surface to an owning cycle 2 track: Electron/Theia shell, `/body` 0/1, OmniPanel, M0-M5 subsystem pages, six extensions, `1-2-3`, `4-5-0`, Agentic Control Room, constitutional/ta-onta surfaces, review/autoresearch UX.
   - Map every S/S' surface to either `consumed contract`, `integration gap`, or `already-landed substrate`.
   - Fail the matrix if any carrier, constitutional agent, Aletheia subagent, extension, plugin, or shell surface is ambient.

   Verification:

   - `node .codex/scripts/m-dev-plan-assess.mjs --reset --write --json docs/plans/2026-06-02-m-prime-cycle-2-canonical`
   - Every non-overview track below is referenced by this ownership matrix.

## Track Open Decisions

_No track-specific Open Decisions section found._

## Decision Register Excerpt

_No decision register found._

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
