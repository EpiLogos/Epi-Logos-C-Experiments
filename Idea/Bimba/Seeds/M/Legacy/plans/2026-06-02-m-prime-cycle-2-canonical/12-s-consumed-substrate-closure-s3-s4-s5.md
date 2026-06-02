# Track 12 - Consumed S Substrate Closure: S3 / S4 / S5

This is **not** a rebuild track. It exists only to close the real M' integration gaps in the already-landed `S3/S4/S5` substrate.

## Source Specs

- `Idea/Bimba/Seeds/S/S3/S3-SPEC.md`
- `Idea/Bimba/Seeds/S/S3/S3'/S3'-SPEC.md`
- `Idea/Bimba/Seeds/S/S4/S4-SPEC.md`
- `Idea/Bimba/Seeds/S/S4/S4'/S4'-SPEC.md`
- `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`
- `Idea/Bimba/Seeds/S/S5/S5'/S5'-SPEC.md`

## Tranches

1. **T0 - S3 Consumed Contract Closure For Shell / Bridge / Runtime**

   Canonical source: `Idea/Bimba/Seeds/S/S3/S3-SPEC.md`, `Idea/Bimba/Seeds/S/S3/S3'/S3'-SPEC.md`
   Cycle 1 substrate inheritance: consumes cycle 1 gateway, SpaceTimeDB, world-clock, and Graphiti runtime landings already present in `Body/S/S3`.

   Dependencies:

   - `01.T0` Electron / Theia runtime boundary must be locked so this track stays subordinate to actual M' consumption.

   Deliverables:

   - Close only the S3/S3' surfaces the shell, `/body`, OmniPanel, M3, M4, and M5 actually consume.
   - Record any still-missing projection or lifecycle contracts as integration blockers.

   Verification:

   - shell/bridge runtime tests against live S3 projection

2. **T1 - S4 Consumed Contract Closure For M5-4 And Constitutional Surfaces**

   Canonical source: `Idea/Bimba/Seeds/S/S4/S4-SPEC.md`, `Idea/Bimba/Seeds/S/S4/S4'/S4'-SPEC.md`
   Cycle 1 substrate inheritance: consumes cycle 1 capability matrix, mediation, and VAK/orchestration substrate already landed.

   Deliverables:

   - Close only the S4/S4' surfaces the Agentic Control Room, constitutional agents, and integrated review surfaces consume.
   - Record any provider-backed or capability-gated gaps explicitly.

   Verification:

   - M5-4 and constitutional surface tests

3. **T2 - S5 Consumed Contract Closure For Review / Autoresearch / Pedagogy**

   Canonical source: `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`, `Idea/Bimba/Seeds/S/S5/S5'/S5'-SPEC.md`
   Cycle 1 substrate inheritance: consumes cycle 1 review/autoresearch/gnosis/agent cores already landed in `Body/S/S5`.

   Deliverables:

   - Close only the S5/S5' surfaces the M5 extension, integrated plugins, and shell alerts actually consume.
   - Record any missing review/autoresearch UX contracts as explicit blockers.

   Verification:

   - review/autoresearch/pedagogy consumer tests

4. **T3 - Day / NOW / Session / Continuation Lifecycle Closure**

   Canonical source: `Idea/Bimba/Seeds/S/S3/S3'/S3'-SPEC.md`, `Idea/Bimba/Seeds/S/S4/S4'/S4'-SPEC.md`, `Idea/Bimba/Seeds/S/S5/S5'/S5'-SPEC.md`
   Cycle 1 substrate inheritance: cycle 1 landed these lifecycles as substrate, but not as a single M' integration closure track.

   Deliverables:

   - Close the full M' consumption path for Day/NOW/session/Continuation.
   - Keep lifecycle truth in S3/S4/S5 while making shell/extension/plugin dependencies explicit.

   Verification:

   - lifecycle tests across shell, M4, M5, review, and mediation surfaces

5. **T4 - No-New-S-Rebuild Guardrail**

   Canonical source: all S3/S4/S5 seeds above
   Cycle 1 substrate inheritance: explicit reaction to the cycle 1/first-draft cycle 2 planning failure.

   Deliverables:

   - Add a cycle-2 guardrail: no tranche here may reopen generic S3/S4/S5 implementation unless it is a real M' integration blocker.
   - Force every missing item to be phrased as a consumed-surface gap.

   Verification:

   - negative fixture/guardrail tests
   - no generic substrate-build language remains in this track
