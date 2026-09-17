# Testing Plan Handoff

Date: 2026-08-04
Audience: the parallel session planning the new [[M']] IDE implementation

## Binding Message

Do not treat the current green suite, the Cycle 3 `done` ledger, or the existence of Playwright/native/live-wire stages as proof that a tranche is canonically accepted.

The test audit found:

- 656 indexed Cycle 3 tasks;
- only 61 with an executable task-specific Verify command;
- 573 with Verify prose but no extractable command;
- 602 verification records that explicitly ran only a generic class gate;
- a large real suite that strongly protects implementation state but weakly binds that state to the accepted IDE and agentic workflows.

Read [[09-testing-truth-audit]], then use [[10-full-system-verification-architecture]] and [[11-test-suite-migration-plan]] as the verification rail for the new plan.

## Required Plan Changes

Every implementation tranche in the new plan must declare:

1. inherited Cycle 3 task IDs and existing bodies;
2. canonical claim IDs and exact spec anchors;
3. owning [[S]]/[[S']]/[[M']] coordinate;
4. positive behavior and forbidden negative space;
5. minimum named environment;
6. real producer and observer;
7. task-specific executable proof;
8. fault or refusal proof where the claim is load-bearing;
9. evidence/receipt path;
10. required human design or governance decision.

The generic K/W/UF/D/G gate is additional regression evidence only.

## Immediate Priorities

1. Make task-specific proof mandatory before the first implementation tranche closes.
2. Create the claim registry and join it to [[data/cycle3-task-inventory]].
3. Reclassify [[M0']], [[M2']], [[M3']], and [[M4']] carrier work and assign Track 54.
4. Re-run current native startup from fresh source and capture the actual launched organism; the source changed after the earlier failing receipt.
5. Define the `full-substrate` environment and promote required Neo4j/Redis/Graphiti/SpaceTimeDB/Gnostic paths out of optional skip status.
6. Make `prompt_to_reviewed_change` and `native_boot_to_workbench` the first product-level acceptance scenarios.
7. Quarantine current visual baselines until the classical IDE shell is human-approved.

## Do Not Repeat

- Do not add more pane-presence tests as a substitute for a complete workflow.
- Do not seed producer output and claim the producer works.
- Do not call a helper-spawned gateway proof of native startup ownership.
- Do not use `data-state` or `data-testid` as the primary oracle for usability or meaning.
- Do not let screenshots ratify their own design.
- Do not run all ignored tests indiscriminately; classify live, destructive, paid, forensic, long, and vendor cases into owned lanes.
- Do not rerun all 656 tasks. Reprove load-bearing claims and adapt preserved bodies through the claim registry.

## First Planning Deliverables

- a machine-readable canonical claim registry;
- a task-to-claim-to-proof matrix;
- typed environment definitions and startup ownership;
- typed startup, agent-run, artifact-write, review, promotion, and privacy receipts;
- seven canonical workflow specifications;
- a fail-closed closure-harness change set;
- a human architectural acceptance checkpoint before visual baselines.

## Success Condition

The new plan succeeds when the verification system can distinguish four statements without ambiguity:

1. an owner-layer law passes;
2. the real substrate path is connected;
3. the launched [[M']] product completes a canonical workflow;
4. the human Architect has accepted the design and governance boundary.

Nothing less should be allowed to collapse into the word `PASS`.
