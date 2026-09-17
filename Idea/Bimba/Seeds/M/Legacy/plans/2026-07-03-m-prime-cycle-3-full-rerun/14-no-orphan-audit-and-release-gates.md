# Track 14 — No-Orphan Audit + Release Gates (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/14-no-orphan-audit-and-release-gates.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 14). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 14) — build/verify HERE, never epi-theia:** AUDIT — gates G1-G14 (never truly passed; the gate list IS the recapture checklist) + open-orphan table. CARRIER: phase-2 no-orphan registry. §2 track 14.

1. **T0 — Absorb and retarget: 14-no-orphan-audit-and-release-gates.md (law-only source)**

   Brief: read `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/14-no-orphan-audit-and-release-gates.md` IN FULL. It carries binding law/design with no tranche list. Enumerate its unbuilt commitments against the current carrier (register §2 track 14 lists known gaps) as new numbered tranches appended to THIS file, then close this task with the enumeration as evidence.
   Depends on Track 00 Tranche 3.
   Verify: new tranches parse into the ledger (re-run the assess script and show the new task ids); each cites its original section.

2. **T14.1 — Release-gate runner (G1/G2/G4/G6 mechanised; G3/G5/G7-G12 as track-status lookups)**

   Brief: original §Release Gates + §Verification Commands. Land `.codex/scripts/release-gates.mjs`: runs the original's G1 (assess re-index parses all tranche-bearing files — plain `--write`, NEVER `--reset`), G2 (all wave-a/wave-b matrix files present), G4 (DR row count ≥ 20), G6 (anti-greenfield smell-test with the M' product-surface allow-list) mechanically per the original's Verification Commands, and reports G3/G5/G7-G12 as ledger/track-status lookups (15.1, 15.12, 43.x, CCT rows) — a REPORT stage, never wired into the per-tranche gate. Retarget: gate targets are the RERUN plan folder + the current carrier.
   Depends on Track 00 Tranche 3.
   Verify: `node .codex/scripts/release-gates.mjs` runs green on its own mechanised gates and prints an honest OPEN/CLOSED row per remaining gate with its owning track; honesty-lint clean.

3. **T14.2 — Decision-register gate audit (all named DR rows VALIDATED or explicitly downgraded)**

   Brief: original §Decision-Register Gate + §Decision-Register Gate (updated). Machine-audit `13-decision-register.md`: every DR row named in the gate list (DR-M0-1..3, DR-M1-1..2, DR-M2-1..2, DR-M3-1..3, DR-M4-1..2, DR-M5-1..2, DR-B-2..3, DR-KB-1..2, DR-TS-1, DR-IG-1, DR-S1-4..5) AND the Phase-B rows (DR-IG-2..6, DR-M1-3..4, DR-M2-3, DR-M4-3, DR-M5-3) carries Status VALIDATED or an explicit DOWNGRADED marker; emit the exception list to `plan.runs/14-dr-gate-audit.md`.
   Depends on 14.T14.1.
   Verify: audit file lists every named row with its live status; zero silently-missing rows; assess re-index green.

4. **T14.3 — Open-orphans re-audit against the current carrier**

   Brief: original §Open Orphans Routed Through Cycle 3 (the full table) + §Closed Canonical Profile Fields. Walk every orphan row against the CURRENT carrier/ledger state (many closed since authoring: F_routing 03.2, played-torus 02.6, Earth handle DR-KB-1, pentadic trace 36.x, TCT validator 04.4); record per-row CLOSED / ROUTED(tranche id, status) / STILL-ORPHAN into `plan.runs/14-open-orphans-reaudit.md`. Any STILL-ORPHAN row without a live routed tranche is escalated in the report, never silently dropped.
   Depends on 14.T14.2.
   Verify: re-audit file carries one row per original orphan with evidence pointers; assess re-index green.

5. **T14.4 — Cycle-close no-orphan audit re-run (the closing gate)**

   Brief: original §Closing the Cycle + the audit-targets list. The FINAL gate: re-run the full no-orphan audit (M' product surfaces, ta-onta carriers, constitutional agents, 6 techne-guardians per DR-S4-TECHNE, profile fields, integration plugins, UX load-bearing claims) once Tracks 36.7 and the release gates land. BLOCKED until the dependency order in §Closing the Cycle reaches the final step — this tranche IS "cycle-3 closed".
   Depends on 14.T14.3 and 36.T36.7.
   Verify: `node .codex/scripts/release-gates.mjs`; `node .codex/scripts/dr-gate-audit.mjs`; `node .codex/scripts/m-dev-plan-assess.mjs`; the re-audit shows zero ownerless surfaces; verifier ≠ closer.
