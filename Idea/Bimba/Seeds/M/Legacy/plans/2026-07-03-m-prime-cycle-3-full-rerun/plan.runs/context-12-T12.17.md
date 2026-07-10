# M-Dev Context Pack - 12.T12.17

Generated: 2026-07-10T08:45:11.649Z

## Task

- **ID:** 12.T12.17
- **Title:** Aletheia tool-guardian carrier contract verification
- **Track:** 12-agentic-layer-s4-s5.md
- **Computed status:** in_progress
- **Write scopes:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md

## Active Development Context

- **Day:** 09-07-2026
- **Session:** 20260709-092303-053e70
- **NOW:** Idea/Empty/Present/09-07-2026/20260709-092303-053e70/now.md (present)
- **Daily note:** Idea/Empty/Present/09-07-2026/daily-note.md (missing)

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-07-03-m-prime-cycle-3-full-rerun/11-open-architectural-decisions.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-07-03-m-prime-cycle-3-full-rerun/12-agentic-layer-s4-s5.md`

## Dependency Context

- 12.T12.16 - S4-SPEC Techne wording patch (12-agentic-layer-s4-s5.md)

## Track Source Specs

_No Source Specs section found in the track file. Pause and gather source context manually before implementation._

## Task Body

24. **T12.17 — Aletheia tool-guardian carrier contract verification**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md` — Tranche 12.17 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

## Track Open Decisions

_No track-specific Open Decisions section found._

## Decision Register Excerpt

_No decision register found._

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
