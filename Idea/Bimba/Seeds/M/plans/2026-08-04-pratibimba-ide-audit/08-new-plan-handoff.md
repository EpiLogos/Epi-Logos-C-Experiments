# New Plan Handoff

## Instruction To The Other Session

The current IDE plan may proceed, but its first planning gate must import [[07-cycle3-inheritance-contract]]. Do not amend or reopen the July Cycle 3 ledger to represent redesign work.

Use:

- [[data/cycle3-track-register.json]] for the 55-track carrier/substrate disposition map;
- [[data/cycle3-task-inventory.csv]] when a phase touches a specific capability or write scope;
- the original June tranche body for full design detail;
- the July verification record and current code for implementation truth;
- [[03-runtime-startup-audit]] for the native-startup correction;
- [[06-redesign-brief]] for the stable workbench architecture.

## Required Plan Schema

Add these fields to every new tranche before implementation begins:

```yaml
cycle3_inherits: []
inheritance_disposition: preserve | recompose | reverify | repair | retire-carrier
existing_bodies: []
existing_proof: []
ide_destination: ""
contract_change: none
deletion_replacement: none
```

These fields are traceability, not bureaucracy. They are what lets the shell be rebuilt without rebuilding the organism.

## Phase-Zero Checks

1. Snapshot the current gateway expected-present ratchet and live-wire projection manifest.
2. Carry the single kernel-truth expected red forward explicitly.
3. Reclassify Tracks 01, 03, 04, and 05 with UF coverage where the new shell exposes them.
4. Assign Track 54 a verification class.
5. Put the 21 latest-`REFUSED` tasks into a re-verification queue. Do not relabel them as missing implementation.
6. Repair native supervisor startup and native receipt authority before using `app-smoke` as a product gate.
7. Establish the stable workbench skeleton without deleting existing pane bodies.

## Planning Rule

The unit of redesign is a user workflow plus its inherited capabilities, not an old track and not a coordinate name.

Example:

```text
Workflow: ask agent to change canon, inspect diff, run checks, review evidence, deposit
Inherits: Tracks 12, 18, 26-28, 39-40, 44, 50 plus their concrete task ids
Preserves: [[S3]]/[[S4]]/[[S5]] methods, Canon Studio, chat, sessions, evidence/review contracts
Recomposes: Pi, Tools, Evidence, Review, Canon Studio, CU Ledger
Repairs: native startup and selected missing adapters
Destination: M5 workbench with editor + agent pane + bottom panel + Changes/Review explorer
```

That shape protects four weeks of work while still permitting a major shell correction.
