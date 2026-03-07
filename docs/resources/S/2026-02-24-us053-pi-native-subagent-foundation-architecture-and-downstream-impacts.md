# US-053: PI-Native Subagent Foundation Convergence (Gateway Baseline Preserved)

## Purpose

`US-053` formalizes the convergence architecture discovered during `US-052` implementation:

- PI-native multi-agent execution now exists (`agent-team` / `agent-chain` / workflow orchestration).
- OpenClaw/Epi-claw already has a native subagent lane (`sessions_spawn` -> gateway `agent`).
- These are currently separate execution authorities.

`US-053` resolves this split by making PI-native subagent spawning a first-class harness capability while keeping native gateway session spawning as the baseline/compatibility lane.

## Verified Current State (Code References)

### Native OpenClaw/Epi-claw subagent lane (baseline)

- ta-onta Anima spawner wraps native sessions spawn seam:
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/orchestration/agent-spawner.ts`
- QL seam contract invokes the `sessions_spawn` tool:
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/native-runtime-seam-contracts.ts`
- `sessions_spawn` enforces subagent policy and calls gateway `agent`:
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/tools/sessions-spawn-tool.ts`
- gateway `agent` method owns run/session lifecycle and lineage fields:
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-methods/agent.ts`

### PI-native multi-agent lane (US-052)

- PI team/chain/cross-agent extensions (child PI process orchestration):
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/agent-team.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/agent-chain.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/cross-agent.ts`
- QL launcher injects PI-native orchestration surfaces + Pleroma child extensions:
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-launcher.ts`

### Gateway UI/control-plane integration seam (current)

- Gateway exposes shallow agent catalog via RPC:
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-methods/agents.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/session-utils.ts` (`listAgentsForGateway`)
- Control UI (compiled bundle) calls:
  - `agents.list`
  - `config.get`
  - `config.schema`
  - `config.set`
  - `config.apply`
  - bundle location: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/dist/control-ui/assets/index-BlfNXnI2.js`

Important: `agents.list` is shallow (`id`, `name`, `identity`) and does not surface subagent policy or PI-native team/chain/subagent runtime state.

## US-053 Architectural Decision

### Authority split (target)

- PI harness layer owns:
  - PI-native subagent execution semantics
  - team/chain/subagent widget integration
  - child extension propagation
  - PI-native prompt/identity composition compatibility
- Gateway/OpenClaw control-plane owns:
  - RPC/auth/routing
  - session lineage visibility and delivery
  - control UI surfaces and observability access
  - compatibility baseline via `sessions_spawn` -> `gateway agent`
- Adapter contracts bridge them:
  - gateway invokes/surfaces PI-native subagent capability
  - gateway does not become the semantic owner of PI-native subagent orchestration

### Non-negotiable preservation

- Native `sessions_spawn` -> gateway `agent` path remains intact and verified.
- No silent replacement of existing OpenClaw subagent semantics.
- PI-native lane is additive/convergent, not a destructive rewrite.

## Why This Matters for Downstream Work

### `US-022` / `US-03x` implications (must be explicit)

Downstream session-spine and conformance stories will otherwise consume two incompatible subagent models:

- OpenClaw-native subagent lineage (`spawnedBy`, session store, lane `subagent`)
- PI-native multi-agent lineage (team/chain child sessions via PI extensions)

`US-053` should define a compatibility/normalization contract for:

- lineage correlation keys
- parent/child session metadata
- workflow/team/chain/subagent correlation
- observability event fields
- gateway UI visibility of PI-native runtime state

### Unblock impact for `US-018` and `US-020`

`US-018` (conformance E2E-09..24) and `US-020` (final readiness) depend on clean native-lifecycle/no-bypass and session-propagation semantics.

Without `US-053`, conformance risks:

- split assertions for subagent behavior
- inconsistent lineage visibility across lanes
- gateway UI/operator ambiguity about which lane executed a multi-agent run

With `US-053`, conformance can assert:

- gateway baseline path still works
- PI-native subagent path is invocable and visible through gateway control-plane adapters
- both lanes report normalized lineage/telemetry fields

## Required US-053 Deliverables (Planning Notes)

- PI-native subagent extension capability (team/chain-adjacent; widget-capable)
- Gateway adapter invocation surface for PI-native subagent runs
- Lineage/observability normalization contract for gateway visibility
- Control UI integration plan (at minimum shallow visibility; ideally richer runtime state)
- Compatibility proof: native gateway baseline path still passes
- Bounded proof: gateway invokes/surfaces PI-native subagent path without bypass

## Source Patterns to Reuse (Do not reinvent)

Primary local vendored source to study and adapt:

- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/subagent-widget.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/agent-team.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/agent-chain.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/cross-agent.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/UPSTREAM-PROVENANCE.md`

Do not treat the subagent widget as only UI decoration; use it as runtime/interface pattern input for the PI-native subagent execution surface.

## US-053 Implementation Record (2026-02-24)

### Scope delivered in this slice

- Added a gateway adapter RPC path for PI-native subagent execution: `agents.piSubagent.spawn`
- Preserved native baseline lane (`sessions_spawn` -> gateway `agent`) unchanged
- Added shallow control-plane visibility metadata via `agents.list` (`piNativeSubagentAdapter`)
- Added normalized PI-native adapter lineage + observability payload contract in adapter results

### Upstream provenance used (exact)

- Upstream repo: `https://github.com/disler/pi-vs-claude-code`
- Upstream ref: `32dfe122cb6d444e91c68b32597274a725d81fa3`
- Upstream path: `extensions/subagent-widget.ts`

### `subagent-widget.ts` patterns adopted/adapted

- Adopted: persistent per-subagent JSONL session file pattern (`--session ...jsonl`)
- Adopted: JSON-mode subprocess execution (`--mode json`) for machine-readable subagent runs
- Adapted: explicit CLI thinking/tools flags for bounded, fail-fast adapter invocation
- Adapted: non-UI runtime usage (gateway adapter) while preserving child-extension propagation (`PI_AGENT_CHILD_EXTENSIONS`)

### Deep-wrapper integration points touched

- PI harness/runtime:
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-launcher.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-native-subagent-adapter.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/taonta-runtime-observability-contracts.ts`
- Gateway/control-plane:
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-methods/agents.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-methods.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-methods-list.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/session-utils.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/protocol/index.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/protocol/schema/agents-models-skills.ts`
  - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/protocol/schema/protocol-schemas.ts`

### Downstream implications

#### `US-022` / `US-03x`

- Gateway adapter results now expose normalized fields for PI-native subagent runs:
  - `adapter.lane = "pi_native_subagent"`
  - `lineage.parentSessionKey`
  - `lineage.childSessionFile`
  - `lineage.normalizedContractVersion = 1`
  - `observability.version = 1`
  - `observability.invocationSurface = "pi_native_subagent_adapter"`
- `agents.list` now advertises PI-native adapter visibility metadata (`piNativeSubagentAdapter`) without changing the native baseline lane or repurposing `agent`
- This gives `US-022` / `US-03x` a stable gateway-visible contract to map PI-native runs into session-spine/conformance reporting while keeping native subagent assertions intact

#### `US-018` / `US-020` unblock notes

- Baseline lane remains verified via existing native seam + gateway `agent` + `sessions_spawn` tests
- PI-native adapter is bounded (`timeoutMs`) and fail-fast (no silent fallback to native lane)
- Remaining blocker for richer operator UX is control UI rendering of the new `agents.list.piNativeSubagentAdapter` metadata and adapter result visualization (compiled UI bundle is unchanged in this slice)
