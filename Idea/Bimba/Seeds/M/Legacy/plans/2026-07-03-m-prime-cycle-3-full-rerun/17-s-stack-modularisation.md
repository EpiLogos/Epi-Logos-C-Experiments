# Track 17 — S-Stack Modularisation Campaign (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 17). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

1. **T17.1 — Split `gateway-contract/lib.rs` (4,883 LOC, largest file in repo)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.1 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

2. **T17.2 — Split `Body/S/S0/epi-cli/src/gate/server.rs` (3,235 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.2 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

3. **T17.3 — Split `graph-schema/src/lib.rs` (3,072 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.3 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

4. **T17.4 — Split `capacity_workflows.rs` (2,584 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.4 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

5. **T17.5 — Split `Body/S/S0/epi-cli/src/core/mod.rs` (2,485 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.5 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

6. **T17.6 — Split `Body/S/S0/portal-core/src/kernel.rs` (1,266 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.6 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

7. **T17.7 — Split `Body/S/S3/gateway/src/spacetime.rs` (1,765 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.7 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

8. **T17.8 — Split `Body/S/S2/graph-services/src/sync_coordinator.rs` (1,384 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.8 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

9. **T17.9 — Split `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` (1,114 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.9 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

10. **T17.10 — Split `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` (761 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.10 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

11. **T17.11 — Split `Body/S/S1/hen-compiler-core/src/lib.rs` (881 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.11 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

12. **T17.12 — Split `Body/S/S0/epi-cli/src/nara/oracle.rs` (2,203 LOC) + `medicine.rs` (1,271 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.12 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

13. **T17.13 — Split `Body/S/S0/portal-core/src/events.rs` (522 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.13 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

14. **T17.14 — Split `Body/S/S2/graph-services/src/dataset_import.rs` (1,655 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.14 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

15. **T17.15 — Split `Body/S/S5/epii-autoresearch-core/src/lib.rs` (2,049 LOC) + `epii-agent-core/src/lib.rs` (1,170 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.15 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

16. **T17.16 — Collapse `classify_method` (270 LOC) + `METHOD_DISPATCH_PLAN` (940 LOC)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.16 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

17. **T17.17 — `coordinate_home: &'static str` → typed `CoordinateHome` enum**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.17 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

18. **T17.18 — Unify S1 rename-reconciliation**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.18 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

19. **T17.19 — Land S1 `WikilinkTarget::PathBlock` + `PathHeadingBlock` variants**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.19 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

20. **T17.20 — S1 coordinate-residency-on-move enforcement**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.20 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

21. **T17.21 — `Body/S/S0/luts/` subdir consolidation**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.21 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

22. **T17.22 — Declare `Body/S/S1/hen-compiler/` compatibility-only via `STATUS.md`**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.22 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

23. **T17.23 — Migrate/decommission `Body/S/S3/epi-app`**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.23 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

24. **T17.24 — Pi-agent symlink fragility**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.24 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

25. **T17.25 — Capability matrix schema co-location**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.25 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

26. **T17.26 — Graphiti native-library landing + sidecar deprecation**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.26 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

27. **T17.27 — `epi-kernel-contract` parent-role wording patch**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.27 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

28. **T17.28 — `bimba-mcp` parity over `epi canon coord` depth ladder**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md` — Tranche 17.28 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.
