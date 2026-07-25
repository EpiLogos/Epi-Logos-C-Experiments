# 14.T14.4 — Cycle-Close No-Orphan Re-Audit

Re-audited: 2026-07-20 against the live rerun ledger; refreshed 2026-07-25 (one row moved review→CLOSED; G3/G5 mechanised — see the dated section below). This is a fresh pass over every original §Open Orphans row plus the Closed-Canonical pentadic row. `CLOSED` means every listed tranche is done; `ROUTED` retains an unfinished named tranche; `REVIEW` records a real, owned review surface; `RESOLVED` is a decision-register disposition with no implementation to land.

| Historical orphan | Current route (live status) | Verdict |
|---|---|---|
| M0-X' four layers (QL/time/personal/pedagogy views) | 01.T1.1:done · 09.T9.1:done | CLOSED |
| Image-assets-on-nodes (c_1_asset schema + handles) | 01.T1.6:done · 09.T9.3:done | CLOSED |
| F_routing carrier (M2 chained traversal) | 03.T3.2:done | CLOSED |
| S2 graph-correspondence adapter (271 typed relations) | 03.T3.4:done · 09.T9.5:done | CLOSED |
| Nara voice adapter / QLoRA dialogic-voice carrier | 12.T12.1:done | CLOSED |
| Psychoid cymatic field renderer surface | 05.T5.5:done | CLOSED |
| anuttara_trace(output,sensitivity,depth) API | 06.T6.6:done | CLOSED |
| Logos Atelier (M5-5) extension | 06.T6.2:done | CLOSED |
| Constitutional-agent profiles (6 remaining) | 12.T12.3:done | CLOSED |
| Daily-layer widgets (journal/agent-checkin/cymatic/status) | 11.T11.3:done | CLOSED |
| TillDone substrate residency | 12.T12.11:done | CLOSED |
| MathemeHarmonicProfileBoundary.payload opacity (intentional) | 10.T10.1:done | CLOSED |
| ACR extension repurpose (Pi-runtime monitor or deprecate) | 12.T12.07:done · 27.T27.10:done · 26.T26.7:pending | ROUTED — `12.T12.14` is retired; its current reframe route includes unclaimed `26.T26.7`. |
| K2 played-torus 3D extension (DR-M1-2) | 02.T2.6:done | CLOSED |
| Earth observer handle (DR-KB-1) | 03.T3.5:done · 03.T3.9:done · 10.T10.3:done | CLOSED |
| Hen vault-instance carrier (DR-M1-4) | 02.T2.10:done | CLOSED — closed 2026-07-21 (teacher-invocation rides the `pi` slot selector; the "deferred cloud call" framing was retracted as fabricated). |
| Hen entity-candidate lifecycle (CCT-14) | 16.T16.1:done | CLOSED |
| C-layer semantic typology (CCT-15) | 16.T16.1:done | CLOSED |
| K2SurfaceHandle ownership (composition mount-point) | 02.T2.6:done · 07.T7.1:done | CLOSED |
| bedrock_link computation (CCT-6) | 18.T18.7:done | CLOSED |
| pattern_packet_handle source-of-truth (CCT-7) | 16.T16.1:done | CLOSED |
| cron_evening Möbius hook scheduler | 12.T12.9:done | CLOSED |
| Techne profile (DR-S4-TECHNE, not an agent) | -- | RESOLVED |
| anuttara_pentadic_trace closure (Closed-Canonical row; final seal 36.7) | 36.T36.1:done · 36.T36.2:done · 36.T36.3:done · 36.T36.7:done | CLOSED |

**Result:** 22 CLOSED · 1 ROUTED · 1 RESOLVED. Every historical row has a current route or an explicit decision disposition, so there is no unclassified `STILL-ORPHAN` row.

## 2026-07-25 — G3/G5 mechanisation (the gates are live now)

The 2026-07-20 pass recorded G3/G5 as OPEN "because their load-bearing UX and `CODE-PENDING` audits are not mechanised." That was the honest reading of a defect: `release-gates.mjs` handed both gates a literal `null` status and closed on `status === 'done'`, so **both read unconditionally OPEN and could never close** — the cycle seal was structurally unreachable at 10/12 regardless of the work.

Resolution: both laws are mechanical accounting statements, not human sign-off, so both are now live-computed from the corpus + ledger.

- **G3 — CLOSED.** "Per-subsystem matrix files account for every claim in each UX doc; orphan rows above route to a tranche" now walks every claim row of all 22 wave-a/b/c matrices and requires a classification token in the row's own Status column, plus zero `STILL-ORPHAN` rows in this file. Live: **534/534 claim rows classified, 0 STILL-ORPHAN.**
- **G5 — OPEN, with a named route.** "Every CODE-PENDING has a closing tranche … No silent pending markers" now maps each matrix to its absorbing track and requires that track to carry no unrouted tranche (every task `done`, or `blocked` with a *classified* blocker — loud, not silent). Live: **96 CODE-PENDING markers; 13 absorbing tracks closing, 4 still unrouted — tracks 26, 28, 29, 32.**

G3 joins the corpus-integrity class (G1/G2/G3/G4/G6) that drives the runner's exit code — an unclassified claim row is now a hard failure, verified by injection. G5 stays in the progress class (G5/G7-G12): an OPEN row there is honest cycle state, not a defect.

**Cycle-close criterion: still not met, but no longer stuck.** Release gates read **11/12**. Two conditions remain, both ordinary implementation work rather than gate mechanics:

1. `26.T26.7` (ACR T8 contents + DR-M5-1 roster collapse + 12.14 Pi-monitor reframe) is pending behind `26.T26.6` — this is the one `ROUTED` row above.
2. G5's four absorbing tracks (26, 28, 29, 32) must finish; the gate then flips CLOSED on its own.

Do not mark 14.T14.4 done until release-gates reads 12/12 and an independent verifier reruns the full gate.
