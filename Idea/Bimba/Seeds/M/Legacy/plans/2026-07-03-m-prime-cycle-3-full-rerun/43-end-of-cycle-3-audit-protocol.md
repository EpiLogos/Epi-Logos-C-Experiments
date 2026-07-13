# Track 43 — End-of-Cycle-3 Audit Protocol (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/43-end-of-cycle-3-audit-protocol.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 43). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 43) — build/verify HERE, never epi-theia:** SUBSTRATE — end-of-cycle hygiene (coordinate headers convention:coordinate-header:v1, .h < .c, forbidden-imports machine-enforced, DR-HYGIENE-1..3). CARRIER: pratibimba-app itself needs the header convention + its own forbidden-imports row (not covered by the Theia preflight). §2 track 43.

1. **T43.1 — Repo-hygiene sweep: immediate fixes + gated legacy removal**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/43-end-of-cycle-3-audit-protocol.md` — Tranche 43.1 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

2. **T43.2 — Unified "Coordinate Header" convention (define + hand to Hen)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/43-end-of-cycle-3-audit-protocol.md` — Tranche 43.2 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

3. **T43.3 — Apply the convention across S/S'→M'**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/43-end-of-cycle-3-audit-protocol.md` — Tranche 43.3 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: the unified coordinate-header convention (convention:coordinate-header:v1) is applied + machine-enforced — `node Body/M/epi-theia/extensions/scripts/lint-boundaries.mjs` passes (43.5 boundary lint: Coordinate Headers on Body/S lib.rs/main.rs + Cargo descriptions + .h<.c size; the remaining crates are ratcheted as allowlisted migration gaps = the deliberate landed shape); worst-first exemplar 43.2 header at Body/S/S5/epi-kbase-core/src/lib.rs; verify-first ledger close (no code change); verifier != closer; evidence = fresh command output.

4. **T43.4 — C-header information-hiding remediation**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/43-end-of-cycle-3-audit-protocol.md` — Tranche 43.4 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: the 43.4 C-header info-hiding invariant (no C header larger than its sibling .c) holds STRICTLY — `node Body/M/epi-theia/extensions/scripts/lint-boundaries.mjs` passes, and the .h>.c size check (lint-boundaries.mjs:377) carries NO legacy allowlist (unlike the header/cargo/import gaps), so a green run proves the invariant clean; make test green via the K-gate epi-lib C suite. Verify-first ledger close (no code change; feeds the G12 release gate). verifier != closer; evidence = fresh command output.

5. **T43.5 — Enforced boundaries + drift guardrails**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/43-end-of-cycle-3-audit-protocol.md` — Tranche 43.5 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

6. **T43.6 — Make navigability first-class for the agents**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/43-end-of-cycle-3-audit-protocol.md` — Tranche 43.6 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.
