# Track 14 - Open Decisions, Release Gates, And No-Orphan Audit

This track owns the cross-cutting decision families and the final audit that prevents cycle 2 from repeating cycle 1’s “ambient surface” failure.

## Source Specs

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-1-close/SPRINT.md`
- `Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`

## Tranches

1. **T0 - IOD Matrix**

   Canonical source: `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
   Cycle 1 substrate inheritance: cycle 1 distributed IOD consequences across unrelated tracks.

   Dependencies:

   - `00.T0` M' surface ownership matrix must exist before cross-cutting decisions are re-homed.

   Deliverables:

   - Re-home every `IOD-*` item into a resolved-or-carry-forward matrix with explicit owning cycle 2 track.

   Verification:

   - no live `IOD-*` is ownerless

2. **T1 - PRD Matrix**

   Canonical source: `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`, `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
   Cycle 1 substrate inheritance: cycle 1 resolved some PRD items in canon but kept them diffuse in planning.

   Deliverables:

   - Re-home every `PRD-*` item and lock the already-settled shell/runtime decisions.

   Verification:

   - no contradictory PRD guidance remains in cycle 2

3. **T2 - UFV Matrix**

   Canonical source: `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`, `Idea/Bimba/Seeds/S/S5/S5'/S5'-SPEC.md`
   Cycle 1 substrate inheritance: cycle 1 surfaced UFV decisions through alpha gates and review work but never owned them cleanly.

   Deliverables:

   - Re-home every `UFV-*` item into explicit owner tracks and gates.

   Verification:

   - human-required gates and review tests name UFV ownership explicitly

4. **T3 - DCC Contradiction Register**

   Canonical source: `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`, `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
   Cycle 1 substrate inheritance: cycle 1 found contradictions but kept them dispersed.

   Deliverables:

   - Re-home every `DCC-*` contradiction into a visible owner map.
   - Include contradictions where `/`, shell `1`, and full `4+2` depth have been treated as interchangeable UX surfaces.

   Verification:

   - no contradiction remains ambient

5. **T4 - Release Gate Matrix**

   Canonical source: `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-1-close/SPRINT.md`
   Cycle 1 substrate inheritance: extends the alpha/beta/production gate work already landed in cycle 1.

   Deliverables:

   - Own the alpha/beta/production release-gate matrix for the real M' product.
   - Keep release evidence tied to real runtime/backing services.

   Verification:

   - release gate decision-tree tests
   - runtime/readiness gate tests

6. **T5 - No-Orphan Canonical Surface Audit**

   Canonical source: `Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md`, `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-1-close/SPRINT.md`
   Cycle 1 substrate inheritance: explicit correction to the cycle 1 planning-frame failure.

   Deliverables:

   - Audit that every shell surface, subsystem surface, extension, plugin, carrier, constitutional agent, subagent, lifecycle, and method family named by canon has a cycle 2 owner.
   - Audit that shell `0`, shell `1`, `/`, and `4+2` depth remain separate surfaces with explicit owners, shared-state contracts, and no duplicate authority.
   - Audit that shell `1` flow-writing, Nara artifact routing, task/day-note capture, prompt/chat initiation, review entry, and Epii/pedagogy entry all have real owners and real verification paths.
   - Audit that `/` remains operator transparency for sessions, direct Pi/agent chat, gateway state, logs, readiness, tools, and config rather than the primary lived UX.
   - Audit that every durable architecture diagram, World definition form, and Type/MOC canvas named by `Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md` has an owner, consumer, and update path across S/S' and M'.
   - Audit that load-bearing `/docs/specs`, `/docs/plans`, and `/docs/resources` files cited by cycle 2 have Seed-side mirrors, pointers, or traceability entries under `Idea/Bimba/Seeds/S/**` or `Idea/Bimba/Seeds/M/**`.

   Verification:

   - final no-orphan audit against all cycle 2 tracks
   - assessor route and index contain no uncited canonical surface
   - no-orphan audit fails if `0/1`, `4+2`, or `/` surface law is collapsed or ownerless
   - no-orphan audit fails if shell `1` flow-writing lacks real vault/session/review/task verification
   - no-orphan audit fails if an architecture diagram/MOC exists only as an ambient markdown/canvas artifact without S1'/S2/M' ownership
   - no-orphan audit fails if a canonical decision depends on `/docs/**` without a vault wikilink path inside `Idea/Bimba/Seeds/**`
