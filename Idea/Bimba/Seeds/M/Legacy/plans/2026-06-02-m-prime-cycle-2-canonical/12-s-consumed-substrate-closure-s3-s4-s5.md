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

## T4 No-New-S-Rebuild Guardrail

This track is now closed under a consumed-surface rule: every future `12.*`
claim must start from the already-landed S3/S4/S5 substrate and may only
describe work as M' consumption, verification, routing, lifecycle closure, or a
named integration blocker. A tranche may not re-open generic S3/S4/S5
implementation work just because a seed spec names a larger canonical surface.

### Allowed Closure Language

| Allowed phrase family | Required anchor | Example shape |
|---|---|---|
| `consume as-is` / `closed as consume-as-is` | a current M' consumer plus a live Body/S path or named test | M5 review queue consumes `Body/S/S5/epii-review-core` through the existing gateway review methods |
| `audit/verify` | a named existing contract plus the test or parser that proves it | verify S3 temporal context payload preservation in the shell deep-link tests |
| `extend` | an M' integration blocker that names the caller, callee, privacy class, and owner | extend only the gateway route for a missing `s5'.teach` method after S5' remains owner |
| `integration blocker` / `consumed-surface gap` | concrete consumer path and owner | `s4'.mediation.capabilities.list` exposure is a capability-list integration blocker, not a generic S4 rebuild |

### Forbidden Rebuild Language

The following language is invalid in Track 12 unless it is quoted as a negative
fixture inside this guardrail section or immediately paired with a concrete M'
integration blocker:

| Forbidden phrase family | Why it is invalid here | Required rewrite |
|---|---|---|
| `build S3/S4/S5 from scratch`, `greenfield S3/S4/S5`, `new S3/S4/S5 substrate` | cycle 1 already landed the S3/S4/S5 substrate consumed by this track | name the consumed M' surface and the missing contract |
| `implement the whole gateway/runtime/agent/review stack` | collapses S3, S4, and S5 ownership back into ambient substrate work | split into the exact shell, ACR, review, or lifecycle consumer gap |
| `replace the S3/S4/S5 architecture` | bypasses the canonical seed and ownership ledger | open an explicit architectural decision in Track 14 instead |

### Missing-Item Phrasing Rule

Every unresolved item in Track 12 must use this shape:

`<consumer surface> cannot yet consume <S3/S4/S5 owned contract> because <specific blocker>; owner=<track/tranche or coordinate>; verification=<real test/parser>.`

This keeps lifecycle truth in S3/S4/S5, keeps product ownership in M', and
prevents "missing substrate" from becoming a disguised invitation to rebuild an
already-landed S layer.
