# 13.T6 - S4/S4' Orchestration Adapter Cleanup - Evidence

**Track:** 13.T6 (parallel m-dev Thread Q)
**Owner:** admin-13t6-s4-orchestration
**Date:** 2026-06-02
**Status:** done

## Scope

Audit `Body/S/S0/epi-cli/src/gate/anima.rs` against the live S4 authority
(`Body/S/S4/ta-onta/`, `Body/S/S4/plugins/pleroma/capability-matrix.json`,
`Body/S/S4/pi-agent/agents/anima.md`). Ensure S4 remains the authority for VAK
evaluation, Anima orchestration, dispatch-tool gating, and capability-matrix
enforcement. S0 retained as a thin adapter calling S4-owned surfaces.

**Lane constraint:** anima the agent (owner `anima-09T5-fresh`) is actively
editing `Body/S/S4/**` and `Body/S/S5/**` for 09.T7. All S4 reads were
read-only; all writes were to `Body/S/S0/epi-cli/src/gate/anima.rs`, the two
S0 test files, and this evidence file.

## S4 authority surfaces (read-only confirmed)

| Surface | Authority owned |
|---|---|
| `Body/S/S4/plugins/pleroma/capability-matrix.json` | `dispatch_tools[*]` (incl. `upstream_required: ["vak-evaluate"]`), `constitutional_agents`, `forbidden_authority`, `agent_capability_gates`, `agent_run_contract.vak_required_keys`, `m5_4_governance.*` |
| `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts` | `AGENT_CF` (CF→agent), `MOIRAI_HOST_CF` (klotho/lachesis/atropos host CF), `validateFusionDispatch`, `validateParallelDispatch`, `dispatchGuardrails`, `CANONICAL_TRIGGERS` |
| `Body/S/S4/plugins/pleroma/skills/vak-evaluate/SKILL.md` | VAK evaluate contract: input shape, CPF/CF stop conditions |
| `Body/S/S4/plugins/pleroma/skills/anima-orchestration/SKILL.md` | Anima orchestration contract: CF→agent map, output shape |
| `Body/S/S4/pi-agent/agents/anima.md` | Anima identity, CF `(4.0/1-4.4/5)`, allowed tool set |

## S4-bound call sites preserved in S0 (count: 8)

S0's `Body/S/S0/epi-cli/src/gate/anima.rs` retains 8 surfaces that act as
gateway adapters into the S4 authority. Every adapter now stamps the
constant `S4_AUTHORITY_ORIGIN` (= `"Body/S/S4 (capability-matrix.json +
ta-onta/S4-4p-anima)"`) into its returned payload so callers can verify the
S0 layer is mirroring S4, not acting as a second authority.

1. `vak_evaluate(params)` — calls `crate::agent::vak::evaluate_vak`; advertises
   the `vak-evaluate` Pleroma skill path. Returns `authority()` (now stamped).
2. `orchestrate(params)` — resolves CF→agent via the same `vak::cf_to_agent`;
   advertises the `anima-orchestration` Pleroma skill path. Returns `authority()`.
3. `mediation_route(state_root, params)` — gateway adapter for
   `s4'.mediation.route`. Applies route law derived from S4
   `dispatch-validate.ts` + `capability-matrix.json:dispatch_tools`.
   Tagged with `s4AuthorityOrigin` in both `decision` and `capability` blocks.
4. `agent_status` / `agent_query` / `agent_notify` — adapter surfaces for
   `s4.agent.{status,query,notify}`; persist S3 session telemetry only.
5. `psyche_state` / `psyche_update` — read/write S4' psyche field at
   `<state_root>/s4/psyche/*.json`. Persistence is S4-runtime evidence
   under the explicit `s4/` subtree.
6. `permission_get` — returns the S4' permission boundary (`authority()`).
7. `route_outcome` — outcome name selection. Annotated as `S4_AUTHORITY`
   mirror of S4 dispatch routing law.
8. `route_agent_for_outcome` — agent-name selection. Annotated as
   `S4_AUTHORITY` mirror of the constitutional roster.

## Extractions flagged for S4 owner (count: 6 follow-ups)

These are NOT extracted in this tranche (lane constraint forbids writes to
`Body/S/S4/**`). Each is now explicitly annotated in
`Body/S/S0/epi-cli/src/gate/anima.rs` with an `S4_AUTHORITY:` comment and a
Track-13 follow-up note. Once S4 exposes `s4'.mediation.capabilities.list`
(IOD-17), these can collapse into runtime fetches.

| Constant in S0 | S4 source-of-truth |
|---|---|
| `MOIRAI_HOST_CF` (3 CF literals) | `dispatch-validate.ts:MOIRAI_HOST_CF` |
| `DISPATCH_TOOLS` (6 tool names) | `capability-matrix.json:dispatch_tools[*].name` |
| `route_outcome` routing law | `dispatch-validate.ts` + `anima-orchestration/SKILL.md` |
| `route_agent_for_outcome` agent table | `capability-matrix.json:agent_capability_gates` + `pi-agent/agents/teams.yaml` |
| `authority().forbidden` list | `capability-matrix.json:forbidden_authority` |
| `constitutional_agents()` roster | `capability-matrix.json:constitutional_agents` (minus self) |

All six remain duplicated values in S0 because the gateway must enforce them
before the call reaches the S4 plugin. The duplication is now traceable; any
future divergence is detectable by parity test diff against the named S4 file.

## Local JSONL classification (under `<gate_state_root>/s4/`)

Two append-only JSONL files live under the gate state root. Both are now
documented in the file header with explicit classification:

| File | Classification | Notes |
|---|---|---|
| `s4/agent-events.jsonl` | **S3 session telemetry** | Gateway acceptance/delivery receipts for `s4.agent.query` / `s4.agent.notify`. Not authoritative. Re-derivable from session record. |
| `s4/mediation-routes.jsonl` | **S4 orchestration evidence** | Per-decision record for every `s4'.mediation.route` dispatch. Tagged `s4AuthorityOrigin` in payload so it is never confused with an S4-internal authoritative store. Re-derivable from envelope + S4 capability matrix at any time. |

Neither file is an ambiguous second S4 store. The S4 plugin maintains its
own authoritative records under `Body/S/S4/**`; the JSONL under
`<gate_state_root>/s4/` is gateway adapter evidence only.

## IOD-17 follow-up surfaced

**Recommendation for S4 owner (next tranche):** expose
`s4'.mediation.capabilities.list` over the gateway. Right now the S0
adapter's `route_outcome` + `route_agent_for_outcome` re-derive routing
decisions from constants mirrored from S4 sources. The IOD-17 runtime
parity check in `Body/S/S0/epi-cli/src/gate/parity.rs:165-178` already
declares the `s4'.*` family with `live_gateway_method` listing
`s4'.mediation.route` but NOT `s4'.mediation.capabilities.list`.

Once S4 exposes the `capabilities.list` surface:

1. S0 `route_outcome` should call it and return the S4-canonical outcome
   verbatim, removing the duplicated `MOIRAI_HOST_CF` literal.
2. S0 `route_agent_for_outcome` should call it and return the S4-canonical
   agent name, removing the duplicated agent table.
3. `DISPATCH_TOOLS` should be replaced by a runtime fetch of
   `capability-matrix.json:dispatch_tools[*].name` at gateway boot.

These are deferred to a future Track-13 tranche after the S4 owner has
landed the `capabilities.list` surface.

## Tests passing

```
cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_anima_pleroma_access
running 2 tests
test s0_mediation_adapter_rejects_dispatch_tools_without_upstream_vak_evidence ... ok
test s4_prime_gateway_exposes_anima_pleroma_vak_and_orchestration_access ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vak_constitutional_architecture
running 4 tests
test vak_docs_clusters_and_primitives_exist ... ok
test vak_runtime_surface_and_modules_are_wired ... ok
test vak_constitutional_agents_and_roots_are_complete ... ok
test vak_skill_surface_exists_and_validates ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

### New rejection test (Track-13.T6 acceptance)

`s0_mediation_adapter_rejects_dispatch_tools_without_upstream_vak_evidence`
in `Body/S/S0/epi-cli/tests/gate_anima_pleroma_access.rs` issues a
`s4'.mediation.route` gateway call carrying `dispatchTool: "dispatch_agent"`
but no `upstreamEvidence`/`upstreamRequired`. The adapter rejects with
`"... requires upstreamRequired/upstreamEvidence containing vak-evaluate"`
— S4 owns the rule source (`capability-matrix.json:dispatch_tools[*]
.upstream_required`); S0 enforces it at the gateway edge.

### Pre-existing test fix included

`vak_constitutional_architecture.rs` had a stale `repo_root()` that walked
only one ancestor up, leaving paths resolving to `Body/S/S0/Body/S/S4/...`.
Fixed to walk four ancestors (`epi-cli → S0 → S → Body → repo`), aligning
with the same pattern in `gate_anima_pleroma_access.rs`. Four tests passing
that were previously broken on path resolution.

## Files modified

- `Body/S/S0/epi-cli/src/gate/anima.rs` — file-level adapter doc, six
  `S4_AUTHORITY:` annotations on duplicated constants/functions,
  `S4_AUTHORITY_ORIGIN` constant + stamping into `authority()`,
  `mediation_route()` `decision`/`capability` blocks, JSONL append-fn doc
  comments classifying each store as S3 telemetry vs S4 evidence.
- `Body/S/S0/epi-cli/tests/gate_anima_pleroma_access.rs` — added
  `s0_mediation_adapter_rejects_dispatch_tools_without_upstream_vak_evidence`
  + `s4AuthorityOrigin` tag assertion on existing positive test.
- `Body/S/S0/epi-cli/tests/vak_constitutional_architecture.rs` — fixed
  stale `repo_root()` walking only one ancestor.
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/13-t6-s4-orchestration-evidence.md` — this file.

No writes to `Body/S/S4/**` or `Body/S/S5/**` (anima's lane).
