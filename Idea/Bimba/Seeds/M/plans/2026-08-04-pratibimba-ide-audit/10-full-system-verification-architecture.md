# Full-System Verification Architecture

Date: 2026-08-04
Status: proposed binding architecture for the new [[M']] IDE plan

## Purpose

This document defines how the system checks itself without collapsing [[S]], [[S']], and [[M']] into one unmaintainable end-to-end test or allowing thousands of isolated tests to impersonate product proof.

The verification object is a **proof graph**:

`canonical claim -> owning coordinate -> producer -> boundary -> observer -> oracle -> evidence -> closure decision`

Every edge must be explicit. A missing edge is not inferred from a green suite.

## Governing Laws

1. **Canon authors the claim; implementation does not author its own acceptance oracle.**
2. **The coordinate owner fixes where law is tested.** [[M']] may observe [[S]]/[[S']] behavior but does not re-own it.
3. **Every proof has a maximum claim scope.** A component test cannot close a wire claim; a browser fixture cannot close its producer; a screenshot cannot approve architecture.
4. **Positive behavior and negative space are co-equal.** The test must state what must happen and what must never happen.
5. **"Real" is typed.** Real browser, real gateway, real filesystem, real graph, real provider, and real native carrier are different environments.
6. **A release proof must compose.** Separate green stages require a causal receipt tying them to one launched-product workflow.
7. **Human-owned boundaries remain human-owned.** Architecture, usability, privacy widening, public envelopes, and review authority cannot be approved by snapshots or agents.

## Canonical Claim Record

Every implementation tranche must register at least one claim before code is closed. A claim record must contain:

| Field | Required content |
|---|---|
| `claim_id` | Stable identifier independent of a test filename. |
| `canon` | Exact wikilinks and section anchors that author the behavior. |
| `owner` | Owning [[S]]/[[S']]/[[M']] coordinate and method family. |
| `behavior` | Observable result in domain language. |
| `negative_space` | Forbidden ownership, leakage, fallback, recomputation, or bypass. |
| `environment` | Minimum admissible environment tier. |
| `producer` | The real operation that must create the observed state. |
| `observer` | Boundary from which proof is collected. |
| `oracle` | Independent invariant, golden vector, state transition, or human decision. |
| `proof_ids` | Tests, scenarios, receipts, and fault cases permitted to prove it. |
| `evidence` | Durable command output, trace, capture, artifact diff, or review receipt. |
| `human_gate` | Required human decision and named authority, if any. |

Task IDs remain useful for planning, but they are not claim IDs. Multiple tasks can serve one claim, and one task can affect multiple claims.

## Verification Lattice

### H0 - Adjudicator Integrity

Proves the harness can fail, records fresh commands and exit codes, enforces independent verifier ownership, detects stale evidence, and cannot silently skip a required suite.

Existing basis: harness self-tests, honesty lint, expected-red manifest, gate-lane lock, and receipt validation.

New requirement: sabotage every closure mechanism itself. A deliberately absent task-specific proof must be refused.

### L1 - Canon And Claim Integrity

Proves every active implementation task maps to a registered canonical claim and every claim names its owner, environment, negative space, and admissible proof.

This is machine-checkable traceability, not a source-string test of the implementation. Changes to canon or a public contract make affected claims stale until re-ratified.

### L2 - Owner-Layer Law

Fast tests at the coordinate that owns the behavior:

- pure and deterministic examples;
- property-based tests for mathematical, coordinate, serialization, and state-machine invariants;
- boundary and privacy refusal cases;
- replayable golden vectors shared across C, Rust, TypeScript, and Python where the same law crosses languages;
- compile-time and import-boundary checks.

These tests provide diagnosis and breadth. They do not claim that a service, bus, or carrier is assembled.

### L3 - Contract And Compatibility

Proves consumer/provider compatibility across every public envelope and method family:

- strict schemas and version negotiation;
- unknown-field and missing-field policy;
- cross-language golden vectors;
- backwards and forwards compatibility where promised;
- forbidden raw/private fields;
- ownership and provenance fields;
- protocol mismatch and wrong-listener rejection.

Every public-surface change requires an [[Sn-ARCHITECTURE]], [[Sn-SPEC]], or [[Mn'-SPEC]] canon flag and a claim-registry update.

### L4 - Live Owner Integration

Runs the real owner against the real dependency named by the claim:

- [[S1]] against a real temporary vault and Hen validation;
- [[S2]] against live Neo4j and the real indexed corpus required by the scenario;
- [[S3]] against live Redis, Graphiti, and SpaceTimeDB where those paths are claimed;
- [[S4]] through the gateway mediation path;
- [[S5]] against durable review, improve, and promotion stores;
- provider-backed logic only in an explicit provider-live lane.

An in-memory substitute can test an adapter. It cannot close the production integration claim.

### L5 - Wire And Causal Projection

Proves one operation crosses boundaries with unchanged identity and lawful projection:

- one trace or correlation ID from initiating intent to returned state;
- owner, coordinate, session, profile generation, and privacy class retained;
- profile and event frames strict-parsed;
- no renderer recomputation of owner law;
- no undeclared field or method drift;
- durable side effects linked to the initiating operation.

`live-wire` and the gateway-method ratchet are the current foundation. They should evolve from field-presence closure into causal workflow receipts.

### L6 - Native Organism

Proves the product that a person launches:

`native carrier -> binary resolution -> supervise/adopt -> protocol handshake -> first profile -> vault/DAY/NOW/session resolution -> workbench reveal`

Required faults include stale saved binary paths, a wrong process on the configured port, protocol mismatch, missing first profile, dependency death, restart, reconnect, and clean shutdown.

The receipt must identify the actual binary, process, version, supervisor mode, gateway endpoint, profile generation, vault root, and carrier dimensions. A second gateway started by a smoke helper cannot stand in for the one owned by the launched carrier.

### L7 - Canonical User And Governance Workflows

Proves outcomes through user-perceived commands and visible work objects, then verifies their durable effects at the owning substrate.

Selectors should prefer accessible roles, names, document identity, and domain commands. Test IDs remain acceptable for non-user-visible receipts, but they must not be the primary oracle for discoverability or meaning.

Every critical workflow needs:

- a success path;
- a refused or degraded path;
- restart/continuity where persistence is claimed;
- durable owner-side evidence;
- privacy and authority assertions;
- a human decision where canon requires one.

### L8 - Resilience, Visual, Accessibility, And Human Acceptance

This layer combines four distinct proof forms without pretending they are interchangeable:

- **fault injection** for dependency loss, stale state, interrupted writes, duplicate frames, reconnects, and concurrency;
- **mutation testing** to show that tests detect deliberately introduced logic faults;
- **applied UI checks** for keyboard paths, focus, roles/names, announcements, resize, density, text containment, and stable geometry;
- **human architectural acceptance** before visual baselines become release gates.

Screenshot regression starts only after the shell/workflow has a recorded human design decision. It then protects an accepted state; it does not create acceptance.

## Canonical Full-System Scenarios

The new plan must provide at least these named scenarios.

### `native_boot_to_workbench`

Launch the real Tauri carrier from a stale-but-repairable configuration. Prove binary resolution, gateway ownership, version handshake, first profile, vault/DAY/NOW/session resolution, visible IDE workbench, and truthful organism health. Kill and recover one dependency without relaunching a false second organism.

### `home_to_deep_with_identity_preserved`

Move through `0`, `/`, `1`, and an [[M0']]-[[M5']] workspace. Prove the same coordinate, lens, mode, profile generation, session key, DAY, and NOW are observed across the crossing, with no second state authority.

### `minimum_live_loop`

Prove the umbrella loop defined by [[M'-SYSTEM-SPEC]] and [[S-SYSTEM-INDEX]] at least once:

`[[S0]] executable ground -> [[S1]] lawful artifact -> [[S2]] graph/cache -> [[S3]] temporal routing -> [[S4]] inhabitation -> [[S5]] governed return -> renewed executable/testable ground`

The scenario must retain one causal identity across the whole traversal.

### `canon_edit_to_review_submission`

Open a real artifact, edit it in the editor, write through the governed [[S1]]/Hen path, sync under [[S1]] -> [[S2]] intent, show the diff, submit review through the gateway, and prove the durable [[S5]] review record. A direct filesystem bypass or renderer-owned graph write must fail.

### `prompt_to_reviewed_change`

From the [[M5']] conversation surface: submit intent, build context, dispatch a bounded agent run, observe tool activity and terminal output, change a real artifact, run tests, inspect a diff, make a human review decision, and deposit governed evidence. The agent may not resolve a `requires_human` decision.

### `personal_observation_to_governed_return`

Create or select protected [[M4']] material, expose only lawful handles/projections, submit a reviewable deposit, and prove raw journal/dream/birth/private-body content never crosses the bus, trace, evidence artifact, or public graph namespace.

### `namespace_and_promotion_governance`

Retrieve from `bimba`, `gnosis`, `etymology`, and protected `pratibimba` without namespace collapse. Complete review/improve state and produce a dry-run promotion plan only after approved review. Refuse promotion, authority widening, or provenance loss.

## Typed Environments

| Environment | Permitted proof | Forbidden overclaim |
|---|---|---|
| `offline-law` | H0-L3 deterministic and contract checks | Live service or product assembly claims |
| `ephemeral-owner` | One owner with real temporary storage/process | Full organism claims |
| `spawned-gateway` | L5 wire and method claims | Native startup ownership |
| `full-substrate` | Neo4j, Redis, Graphiti, SpaceTimeDB, gateway, vault, durable stores | Provider-live behavior unless provider is enabled |
| `native-carrier` | L6 launch and native workflows | External-service claims not present in the run |
| `provider-live` | Real authenticated provider/model behavior | Deterministic CI guarantee |
| `soak` | Concurrency, reconnect, resource, and longevity behavior | Functional breadth by itself |

Every test receipt names its environment. "E2E," "live," and "real" alone are rejected as ambiguous.

## Acceptance Receipts And Traces

The system should emit typed receipts for at least:

- startup;
- layout/surface transition;
- agent run;
- artifact write;
- review/improve;
- promotion planning;
- privacy crossing or refusal.

Receipts are not hidden DOM truth. They are cross-process evidence with a correlation ID and actor/owner/provenance fields. The carrier may expose a redacted diagnostic view, while tests retain the full governed capture.

Distributed trace propagation is the appropriate model: one logical operation can carry a trace identity across client, gateway, producer, consumer, store, and return path. See the OpenTelemetry trace references in [[sources]].

## Falsification Standard

A critical claim is not mature until the suite demonstrates that it fails under a relevant sabotage. Required methods include:

- targeted code mutation for owner-layer law;
- contract mutation for envelope and version handling;
- dependency kill/restart for lifecycle claims;
- fixture removal for accidental producer bypass;
- wrong namespace/privacy class/actor injection;
- removal of review authority checks;
- deliberately wrong visual composition before baseline approval.

For Rust owner law, `cargo-mutants` is a viable current tool. For cross-language and workflow claims, a small curated sabotage corpus is more useful than indiscriminate mutation of the whole repository.

## Gate Schedule

### Per Change

Run H0, claim validation, affected L2/L3 tests, and the smallest real integration lane required by the changed claim. Use impact analysis to select affected claims, not test filenames alone.

### Merge Checkpoint

Run all offline owner/contract suites, full affected live-owner integrations, wire closure, native startup, and the canonical workflows touched by the change.

### Nightly

Run the complete `full-substrate` graph, ignored/live tests promoted into named lanes, mutation/sabotage samples, restart/reconnect scenarios, and longer concurrency checks.

### Release Candidate

Require every load-bearing claim green in its required environment, all seven canonical scenarios complete, no unowned skip, no stale visual baseline, and all named human gates recorded.

## Closure Law

No implementation task may close on a generic class gate alone.

A closure receipt must contain:

1. the claim IDs affected;
2. one or more task-specific executable proofs;
3. the required environment receipt;
4. negative-space and fault proof where specified;
5. independent verifier ownership;
6. current canon and contract checksums;
7. any required human acceptance decision.

Broad class gates remain mandatory regression context. They become **additional evidence**, not a substitute for exact proof.
