# Audit Report — Thread G: Decision Register Update (11-open-architectural-decisions.md)

- **Owner:** `admin-audit-decisions`
- **Audited at:** 2026-06-01
- **Scope:** Update `11-open-architectural-decisions.md` to reflect resolutions that landed in the Track 05/06/07/08 parallel pass. Status updates only — preserve the analytical structure.

## Method

1. Read `11-open-architectural-decisions.md` cover-to-cover (456 lines, 32 ID'd entries: 4 PRD + 15 IOD + 4 UFV + 6 DSD + 6 DCC + grouping rows for tranches/dependencies/success criteria — note the IOD numbering is 01-14 plus 17/18/19, with 15/16 reserved or not assigned in this register).
2. Read ADR-05-011 (release-gate close) for the canonical PRD-01..04 disposition; cross-walked ADR-05-009 (recast notice) and ADR-05-010 (Hen vault-bridge) for substrate-truth substrate.
3. Read Thread A's three T4/T8/T9 summary files, Thread B's plan-hygiene evidence, Thread C's 07.T10 + 08.T9 reports.
4. Decided per-entry disposition: **Resolved** / **Updated** / **Unchanged**.

## Per-entry disposition

### PRD entries — all 4 Resolved by ADR-05-011

| ID | Pre-audit status | Post-audit status | Evidence pointer |
|---|---|---|---|
| PRD-01 | Already shown Resolved in index (table) and §Prototype-Resolved | **Resolved (citation strengthened in resolutions log)** | ADR-05-011 §Status of PRD blockers + ADR-05-001 chain |
| PRD-02 | Already Resolved in §Prototype-Resolved | **Resolved (citation strengthened)** | ADR-05-011 §1 (one process, two layouts) + ADR-05-002 |
| PRD-03 | Already Resolved in §Prototype-Resolved | **Resolved (citation strengthened)** | ADR-05-011 §2 + ADR-05-003 |
| PRD-04 | Open — labeled "Prototype-resolved" but still carrying full Question/Options/Recommended-default block | **Resolved** — added strikethrough title, ADR-05-011 status line; updated index table; updated Tranche-wave-0 line | ADR-05-011 §Status of PRD blockers (Theia 1.56 + pnpm + electron-app canonical + theia-app browser CI; `pnpm -r build` green; 42/42 extension tests; 21+ MB bundle with 16+ extension chunks) |

### IOD entries — 4 Resolved; 11 Unchanged

| ID | Disposition | What I wrote |
|---|---|---|
| IOD-01 (S3 single WebSocket surface) | Unchanged | No direct evidence in this run that the multiplexing-vs-app-level-manager question has been decided; Thread C's 08.T8 cargo evidence proves the gateway connects but does not assert the multiplexing pattern. |
| IOD-02 (SpaceTimeDB auth/RLS) | Unchanged | No evidence in the surveyed runs. |
| IOD-03 (`world_clock` source of truth) | Unchanged | Track 03 T2 is still pending per Thread B's hygiene findings. |
| IOD-04 (Profile versioning, `binary`/`mahamaya`) | Unchanged | No schema decision documented in the surveyed runs. |
| IOD-05 (`#` root mapping) | Unchanged | Track 02 territory; no evidence. |
| IOD-06 (Anuttara field naming) | Unchanged | Track 02 territory; no evidence. |
| IOD-07 (n10s/GDS packaging) | Unchanged | Track 02 territory; no evidence. |
| IOD-08 (Graphiti runtime boundary) | Unchanged | Track 03/04 territory; no evidence. |
| IOD-09 (S5 state storage + `ReviewSource`) | Unchanged | Track 04 territory; no evidence in the surveyed runs that the JSON-vs-embedded-store decision has been made. |
| IOD-10 (Deep-link URI grammar) | Unchanged | No evidence. |
| IOD-11 (Shell chrome vs individual extension ownership) | **Implicitly hardened by Track 05 T4 deliverables** but no explicit decision-record citation; left **Unchanged** to avoid overreach. The `@pratibimba/ide-shell-m0-m5` package ships always-available chrome (Bimba graph viewer, Canon Studio, Agentic Control Room, Coordinate Tree, Logos Atelier, Evidence Pane, Review Pane, Autoresearch Pane) while individual extensions own deep surfaces — matching the Recommended-default. A future audit could promote this to Resolved with a citation, but ADR-05-011 does not explicitly close IOD-11. |
| IOD-12 (Observability schema ownership) | **Resolved (Binding)** | Added Status line citing Thread C's `plan.runs/08-t9-perf-a11y-privacy-report.md`. Canonical schema in `integrated-composition/lib/common/release-gate.js`; 99/99 `test:contracts` enforce it; 18 forbidden keys × 6 surfaces = 108 blocking placements. |
| IOD-13 (Nara vault/write service ownership) | Unchanged | The Hen-gateway path resolves vault writes generally (IOD-19), but the specific Nara artifact/day-episode/highlight/dream/oracle service ownership decision is broader and the surveyed runs do not close it explicitly. Track 03 T6.5 + Track 05 T6 will likely close this; flagged but not promoted. |
| IOD-14 (Plugin activation + composition + mini-mode) | Unchanged | The `integrated-composition` extension exists and Thread C's 08.T9 verified composition; but no explicit ADR ties off the layout-claim arbitration contract. Leaving Unchanged. |
| IOD-17 (capability-matrix three-way parity) | **Resolved (Binding spec-time)** | Added Status line citing ADR-05-011 §5; named the three test surfaces; included the live-runtime follow-up flagged by Thread A (`s4'.mediation.capabilities.list`). |
| IOD-18 (Smart Connections via Hen `smart_env.rs`) | **Resolved (Binding)** | Added Status line citing ADR-05-010 + ADR-05-011 §4; noted Track 03 T6.5 is the live-runtime hardening gate. |
| IOD-19 (Hen vault-write gatekeeper) | **Resolved (Binding)** | Added Status line citing ADR-05-010 + ADR-05-011 §3; named the canonical test (`tests/canon-studio-save-routing.test.mjs`); noted T4.5 is the live-runtime closure. |

### UFV entries — all 4 Unchanged

UFV-01..04 (privacy/consent copy, recursive-change threshold, menubar/background lifecycle, daily-flow review interruption) all remain user-final-validation work. No evidence in the surveyed runs that the user-facing copy/policy has been authored.

### DSD entries — all 6 Unchanged

DSD-01..06 are sequencing decisions. While the acceptance harness (Thread A T9) provides the canonical local-service harness contract that DSD-01 calls for, it does not formally close the "one root local-service harness" decision — the harness is delivered, but multi-track adoption is the contract closure, which has not yet happened.

### DCC entries — all 6 Unchanged

DCC-01..06 are deferred canon contradictions. No canon-review activity in the surveyed runs that would resolve any of them.

## Cross-cutting changes

1. **Added "Recent resolutions log" at the top of the document** — 6-bullet index pointing at ADR-05-011 (PRD-01..04), Track 08.T9 (IOD-12), Track 05.T8 (IOD-17), and ADR-05-010 + ADR-05-011 §3-4 (IOD-18, IOD-19).
2. **Updated decision-index table rows** for PRD-04, IOD-12, IOD-17, IOD-18, IOD-19 to reflect Resolved/Binding status inline.
3. **Updated Tranche wave 0** to mark PRD-01..04 closed.
4. **Added `**Status (as of 2026-06-01):**` lines** to the five entry-detail sections (PRD-04, IOD-12, IOD-17, IOD-18, IOD-19) with strikethrough on resolved titles where appropriate.
5. **Preserved** all analytical structure: Question/Why/Affected tracks/Options/Recommended-default/Validation/Consequence blocks are untouched on every entry except the Status line addition.

## Counts

| Category | Resolved (new) | Resolved (already in file) | Updated | Unchanged | Total |
|---|---|---|---|---|---|
| PRD | 1 (PRD-04) | 3 (PRD-01..03, citation strengthened in log) | 0 | 0 | 4 |
| IOD | 4 (IOD-12, IOD-17, IOD-18, IOD-19) | 0 | 0 | 11 | 15 |
| UFV | 0 | 0 | 0 | 4 | 4 |
| DSD | 0 | 0 | 0 | 6 | 6 |
| DCC | 0 | 0 | 0 | 6 | 6 |
| **Total** | **5** | **3** | **0** | **27** | **35** |

## Decision entries the recent evidence does NOT contradict — but flags for human attention

Nothing in the surveyed evidence contradicts an existing decision in `11-open-architectural-decisions.md`. The Track 05/06/07/08 work has hardened defaults rather than violated them. The earlier ADR-05-008 (`obsidian-md-vsc`) reversal was already absorbed into the PRD-01 / IOD-18 / IOD-19 entries before this audit (see lines 126, 145, 305).

**Two notes worth surfacing:**

1. **IOD-11 (shell chrome ownership) is operationally resolved but not formally cited.** The `@pratibimba/ide-shell-m0-m5` package ships exactly the Recommended-default split (shell owns chrome, individual extensions own deep). A future audit can promote IOD-11 to Resolved if a follow-up ADR records the chrome/deep contribution boundary explicitly. I did not promote in this audit because no decision document names IOD-11 directly.
2. **IOD-17 runtime parity gap.** Thread A flagged that `s4'.mediation.capabilities.list` (or equivalent) is not exposed on the gateway, so three-way parity is currently spec-time (via tests over the static matrix file) rather than live-runtime. The IOD-17 status line names this follow-up explicitly. This is a follow-up, not a contradiction — spec-time parity is sufficient for the release-gate close.

## Files touched (lane discipline check)

Per the writescope:

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` — status updates only (resolutions log + 5 status lines + 5 index-row updates + 1 tranche-wave-0 update).
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/audit-11-decisions.md` — this file.

**Not touched:**
- `plan.state.json` (out of scope)
- Any source file under `Body/` or `Idea/Pratibimba/System/`
- Any other plan markdown file
- Any other `plan.runs/` file
