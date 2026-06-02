# Track 08 - Integrated 1-2-3 Cosmic Engine Plugin

This track owns the integrated `1-2-3` plugin as a real product surface over [[M1']], [[M2']], and [[M3']], rather than treating it as a byproduct of the individual extensions.

## Source Specs

- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`
- `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`
- `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`

## Tranches

1. **T0 - Composition Contract**

   Canonical source: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 integrated plugin scaffolding and shell `0` previews.

   Dependencies:

   - `03.T0` M1 primary surface must be owned.
   - `04.T0` M2 primary surface must be owned.
   - `05.T0` M3 primary surface must be owned.

   Deliverables:

   - Own the composition contract between M1, M2, and M3 inside the integrated plugin.
   - Define shared state, readiness, and provenance surfaces.

   Verification:

   - integrated plugin contract tests

2. **T1 - Shell `0` Product Surface**

   Canonical source: `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 shell `0` and `1-2-3` preview work.

   Deliverables:

   - Own the actual shell `0` product surface as rendered by the integrated plugin.
   - Keep it lean, current-coordinate-oriented, and backed by live runtime state.

   Verification:

   - shell `0` integration tests

3. **T2 - Evidence, Review, And Agent Hooks**

   Canonical source: `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 evidence/review hook work.

   Deliverables:

   - Own all evidence/review/agent hooks exposed by the integrated plugin.
   - Keep every surfaced claim tied back to backend provenance and S5 review law.

   Verification:

   - evidence hook tests
   - review deposit tests
