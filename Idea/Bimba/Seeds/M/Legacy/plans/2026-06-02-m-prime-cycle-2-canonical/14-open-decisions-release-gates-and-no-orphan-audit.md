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

## T5 No-Orphan Audit Result - 2026-06-02

This audit is the final Cycle 2 no-orphan closure certificate. It records the current canonical surface ownership state after Track 11 and Track 13 downstream blockers left review and their dependent closure tranches completed.

### Covered Canonical Surfaces

| Canonical surface family | Owner path | Verification path |
|---|---|---|
| Shell `0`, shell `1`, `/`, and deep `4+2` surface law | [[M'-PORTAL-SPEC]], [[M5'-SPEC]], Track `13.T3`, Track `13.T4`, Track `14.T3` | OmniPanel catalog tests, intent-routing parser, release gate parser, `portal_surfaces_contract.rs` |
| `/` operator transparency for sessions, direct chat, gateway state, logs, readiness, tools, and config | [[M'-PORTAL-SPEC]] `OmniPanel Operator Catalog`; [[S-SYSTEM-INDEX]] product alias map | `gate_parity_manifest.rs`, `portal_surfaces_contract.rs`, OmniPanel contract tests |
| Shell `1` flow-writing, Nara/DAY capture, task handoff, review entry, and Epii/pedagogy routing | [[M'-PORTAL-SPEC]] `DAY / NOW / Privacy / Review Intent Routing`; [[S3'-SPEC]] intent envelope projection; [[S5'-SPEC]] review routing gates | `13.T4` parser and Node intent/review bundle; S0 temporal-context, review, mediation, and session VAK gates |
| S/S' subsystem surfaces and method families | [[S-SYSTEM-INDEX]], [[S-SOURCE-TRACEABILITY-INDEX]], [[S0-SPEC]] through [[S5'-SPEC]] | Track `11`, `12`, and `13` closure ledgers plus gateway parity suites |
| M' subsystem surfaces, extensions, plugins, Agentic Control Room, and release gates | [[M'-SYSTEM-SPEC]], [[M'-PORTAL-SPEC]], [[M5'-SPEC]], Track `14.T4` | release decision-tree, integrated release gate, privacy/a11y/perf, kernel-bridge readiness, S0 release/readiness bundle |
| S4' carriers and constitutional/specialist agents | [[ARCHITECTURE-DIAGRAM-PACK]], [[S4'-SPEC]], ta-onta carrier specs, Track `09`, Track `12` | carrier/agent ownership rows in Cycle 2 ledgers and S4/S5 mediation/review tests |
| Architecture diagrams, World definitions, and Type/MOC canvases | [[ARCHITECTURE-DIAGRAM-PACK]] `Diagram Wikilink Legend`, `Durable Diagram And World/Types Ownership`, [[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]] | audit parser checks for diagram pack anchors; Track `11.T2` vault bridge and MOC/diagram intake closure |
| `/docs/**` legacy/canonical sources cited by Cycle 2 | [[S-SOURCE-TRACEABILITY-INDEX]], [[LEGACY-DOCS-MIGRATION-INDEX]], Seed-side Legacy mirrors under `Idea/Bimba/Seeds/**/Legacy/**` | no-orphan parser checks that docs references have Seed-side traceability; residual cleanup hooks remain below |

### Cleared Orphan Risks

| Former blocker | Closing ledger item | Closure evidence |
|---|---|---|
| Hen semantic-neighbor and downstream Track 11 surfaces | `11.T1` through `11.T4` done | Track `11.T2` closed CT0-CT5 artifact intake, T-family inference, vault bridge, and Smart Connections sidebar; Track `11.T3` closed graph viewer/retrieval consumer contracts; Track `11.T4` closed Pi-agent relation inference and legacy-doc guardrail. |
| S0 temporal-context review mismatch | `13.T4` done | `gate_temporal_context` passed 2/2 with the live Redis case ignored; `gate_epii_review`, `gate_mediation_route`, and `gate_sessions_patch_vak` all passed in the same S0 target. |
| Typed delta backlog and method drift guardrail | `13.T5` done | Negative drift tests prove fake S0-only methods are rejected, S0 carries no independent route table, every product gateway method has coordinate mapping, and typed SpacetimeDB deltas route by table identity. |

### Current Audit Verdict

The no-orphan audit is **clean for Cycle 2 closure**. The ledger currently reports `83` done, `1` review (`14.T5` itself), `0` pending, `0` in-progress, and `0` blocked-by-dependency before this final mark. The only remaining review item is this audit record; once marked done, the route has no ownerless canonical surface, no pending downstream method/intent blocker, and no untraced `/docs/**` authority path.
