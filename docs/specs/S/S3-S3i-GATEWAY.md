# S3/S3' — Gateway and Universal NOW

**Status:** Canonical specification
**Date:** 2026-03-07
**Coordinate:** S3 (gateway control plane), S3' (live state plane / QL gateway)
**Implementation Home:** `epi-cli/src/gate/` (Rust)
**CLI Namespace:** `epi gate`

---

## I. Canonical Decision

S3 is not a vague "network layer." In this repo it has two tightly related but non-identical responsibilities:

1. **Gateway control plane**: full behavioral parity with the existing `epi-claw` gateway.
2. **Universal NOW state plane**: a shared, multiplayer, live state substrate, planned around SpaceTimeDB.

These two concerns must not be collapsed into one transport just because both are real-time.

### The Non-Negotiable Stipulation

- **Full `epi-claw` gateway parity is the canonical port target.**
- **Rust is the implementation language for the new gateway.**
- **The existing Electron OmniPanel gateway-client surface is retained as a compatibility target, not discarded.**
- **SpaceTimeDB is stipulated as the future host of the universal NOW and the collective M0-M5 data surfaces.**
- **SpaceTimeDB does not replace gateway parity in the first implementation tranche.**
- **The gateway must remain open to subagent invocation and VAK-system dynamics, not only a single main-agent flow.**
- **Gateway session, bootstrap, and workspace logic must support subagent-specific and sub-session-specific scope.**

The correct mental model:

- **Gateway** = personal interface, command plane, agent/session/runtime control.
- **SpaceTimeDB** = collective interface, shared world-state, live archetypal-social surface.

This means the new system is architected as a **unified multiplayer symbolic environment**:

- each human user is a participant in the shared field,
- each user's agent ensemble is also a participant in the shared field,
- the Electron M-layers are not only a local UI but a shareable inhabitation surface,
- the universal NOW is a synchronized social-symbolic state, not just a timestamp.

---

## II. Architectural Role

### S3 (Explicit) — Gateway Control Plane

S3 is the runtime that owns:

- WebSocket connection lifecycle
- request/response RPC
- session registry and transcript access
- agent command relay
- config/schema mutation
- channel integration control
- presence, health, logs, approvals, wizard/update flows
- OmniPanel and agent client interoperability

This is the layer that must port the practical strengths of the `epi-claw` gateway into the new architectural paradigm without losing feature coverage.

### S3' (Implicate) — Universal NOW / QL Gateway

S3' is the implicate layer that interprets network/runtime activity as shared ontological state:

- context-frame aware routing
- signature-aware parallelism
- session envelope propagation
- shared agent/user presence
- live M0-M5 state surfacing
- collective world-state updates
- pedagogical and reflective overlays

S3' is where the gateway stops being "a server" and becomes "a world-interface."

---

## III. The Two-Plane Model

The architecture is deliberately dual-plane.

### Plane A: Gateway Plane

This is the imperative plane.

It handles:

- `connect`
- RPC methods
- chat send/abort/history
- session CRUD and compaction
- channel runtime control
- config/apply/reload/update
- device pairing and auth token management
- node invocation
- logs/health/heartbeat
- wizard flows

This plane is best implemented with a conventional async server model:

- Rust `tokio`
- WebSocket framing
- explicit request IDs
- explicit error codes
- explicit reconnect/gap handling

### Plane B: Universal NOW Plane

This is the declarative plane.

It handles:

- shared presence state
- synchronized live state projections
- M0-M5 surfaces
- collective temporal state
- archetypal identity visibility
- multiplayer observation
- pedagogical overlays
- social/shared encounter state

This plane is best implemented with SpaceTimeDB because:

- clients subscribe to state, not polling loops,
- the server owns transactional reducers,
- the client receives live table/view updates,
- Rust and TypeScript are both supported,
- the model fits "inhabit a shared field" better than bespoke event plumbing.

### Boundary Rule

If something is an **imperative command**, it belongs to the gateway plane first.

If something is a **shared synchronized world-state surface**, it belongs to the Universal NOW plane first.

When in doubt:

- "Do X now" -> gateway
- "Show what is true for all participants right now" -> SpaceTimeDB

---

## IV. Full Epi-Claw Parity Requirement

The canonical target is the existing `epi-claw` gateway behavioral surface, not a reduced subset.

The Rust S3 implementation must preserve parity for:

- transport semantics,
- authentication semantics,
- session semantics,
- OmniPanel compatibility,
- gateway-control workflows,
- channel/runtime control workflows,
- node/browser/runtime invocation workflows,
- operator/admin surfaces.

### Protocol-Level Parity

The current gateway protocol shape that must be preserved:

- frame types: `req`, `res`, `event`, `hello-ok`
- first-request `connect` handshake semantics
- protocol version negotiation
- challenge/nonce flow for secure device-auth connect
- event sequence numbers and gap detection
- presence/health state versions
- heartbeat/tick policy
- structured error shape and method-level validation failures

### Connection/Auth Parity

The parity target includes:

- token auth
- password auth
- device identity and signed device payload flow
- device-token issuance/rotation/revocation
- loopback/local development behavior
- reconnect/backoff behavior
- TLS certificate generation/loading/fingerprint handling
- bind-mode and remote-mode configuration
- Tailscale-aware exposure model where relevant

### Session Parity

The parity target includes:

- canonical session-key handling
- canonical key plus alias metadata handling
- session resolution by label/key
- list/preview/update/reset/delete flows
- transcript/history retrieval
- chat run lifecycle
- compaction support
- session metadata propagation
- agent/session identity matching rules
- subagent-specific active-session binding
- sub-session naming and resolution
- bootstrap state scoped by session and subagent
- workspace state scoped by session and subagent

### Session Identity Rule

The project explicitly chooses the following rule for the first working method:

- keep an `epi-claw`-compatible canonical session key on the wire and in primary storage,
- add NOW/VAK-native naming as first-class alias and metadata layers,
- resolve sessions by canonical key, alias, label, and future NOW conventions,
- defer making NOW-native naming the sole canonical format until the Universal NOW layer is ready to own that responsibility.

This gives S3 immediate compatibility while keeping the path open for future NOW-native identity.

### Pi-Open Gateway Requirement

The gateway must be open to the PI agent layer as a general runtime substrate.

That means:

- session logic must allow different PI agents to become the active agent for a given session,
- subagents must be invocable as first-class participants, not hacked in as side channels,
- method payloads must remain extensible enough to carry new PI/VAK dynamics without protocol breakage,
- gateway routing must tolerate future signature, lane, bootstrap, workspace, and invocation metadata.

The design goal is not only "gateway works with PI now." The goal is "gateway stays permeable to PI system evolution."

### UI Compatibility Parity

The current Electron OmniPanel already successfully passes through the gateway agent instance. That integration path is an asset.

Therefore:

- the new S3 gateway must preserve a protocol and method surface that allows the OmniPanel path to be reused,
- existing gateway-client logic is treated as a compatibility harness,
- breaking the client model for the sake of architectural novelty is explicitly rejected.

---

## V. Canonical RPC Surface to Port

The following `epi-claw` gateway methods are the full parity target currently identified from `src/gateway/server-methods/` in the source repo.

### Handshake / Connection

- `connect`

### Agent / Runtime

- `agent.identity.get`
- `agent.wait`
- `agents.list`

### Browser / Web

- `browser.request`
- `web.login.start`
- `web.login.wait`

### Channels

- `channels.status`
- `channels.logout`

### Chat

- `chat.history`
- `chat.abort`
- `chat.send`
- `chat.inject`

### Config

- `config.get`
- `config.schema`
- `config.set`
- `config.patch`
- `config.apply`

### Cron

- `cron.list`
- `cron.status`
- `cron.add`
- `cron.update`
- `cron.remove`
- `cron.run`
- `cron.runs`

### Devices / Pairing

- `device.pair.list`
- `device.pair.approve`
- `device.pair.reject`
- `device.token.rotate`
- `device.token.revoke`

### Exec Approvals

- `exec.approval.request`
- `exec.approval.resolve`
- `exec.approvals.get`
- `exec.approvals.set`
- `exec.approvals.node.get`
- `exec.approvals.node.set`

### Logs / Models / Skills / Usage

- `logs.tail`
- `models.list`
- `skills.status`
- `skills.bins`
- `skills.install`
- `skills.update`
- `usage.status`
- `usage.cost`

### Nodes

- `node.pair.request`
- `node.pair.list`
- `node.pair.approve`
- `node.pair.reject`
- `node.pair.verify`
- `node.rename`
- `node.list`
- `node.describe`
- `node.invoke`
- `node.invoke.result`
- `node.event`

### Sessions

- `sessions.list`
- `sessions.preview`
- `sessions.resolve`
- `sessions.patch`
- `sessions.reset`
- `sessions.delete`
- `sessions.compact`

### System / Health / Presence

- `last-heartbeat`
- `set-heartbeats`
- `system-presence`
- `system-event`
- `talk.mode`
- `tts.status`
- `tts.enable`
- `tts.disable`
- `tts.convert`
- `tts.setProvider`
- `tts.providers`
- `voicewake.get`
- `voicewake.set`

### Update / Wizard

- `update.run`
- `wizard.start`
- `wizard.next`
- `wizard.cancel`
- `wizard.status`

This list is the minimum canonical parity inventory for S3. Additional hidden helper paths in `epi-claw` may exist, but this method surface is the explicit port contract.

---

## VI. Gateway Configuration Surface to Preserve

The Rust port must preserve the conceptual shape of the gateway configuration surface from `epi-claw`, adapted into repo-native config structures.

### Required Configuration Domains

- gateway mode: local / remote
- default runtime port and dedicated test port
- bind mode: auto / lan / loopback / custom / tailnet
- TLS config and certificate paths
- auth mode and credential material
- control UI behavior
- tailscale exposure behavior
- remote gateway connection config
- reload strategy
- HTTP endpoint exposure
- canvas/static host behavior where retained
- talk / TTS configuration
- node/browser routing policy
- discovery configuration
- bootstrap policy
- workspace resolution policy
- per-agent / per-subagent defaults

### Port Stipulation

S3 must reserve a distinct testing port for gateway bring-up and compatibility verification.

Recommended baseline:

- default local gateway port: `8420`
- dedicated S3 testing port: `8421`

The Rust implementation must allow explicit port override, but the testing workflow should standardize on a fixed non-default port so automated and manual parity testing do not collide with the main operator runtime.

### Design Rule

Config parity does not mean file-format cloning.

It means preserving:

- operator capabilities,
- deployment choices,
- security choices,
- behavior switches,
- UI assumptions,
- client expectations.

The Rust implementation may normalize and improve config handling, but it must not silently remove operator affordances that the original gateway already had.

---

## VII. Immediate S3 Rust Architecture

The implementation home remains `epi-cli/src/gate/`.

Recommended module layout:

```text
epi-cli/src/gate/
  mod.rs
  server.rs
  protocol.rs
  auth.rs
  tls.rs
  lock.rs
  config.rs
  sessions.rs
  workspace.rs
  bootstrap.rs
  chat.rs
  channels.rs
  nodes.rs
  cron.rs
  approvals.rs
  models.rs
  skills.rs
  logs.rs
  wizard.rs
  update.rs
  presence.rs
  omnipanel.rs
  spacetimedb_bridge.rs
```

### Core Responsibilities

- `server.rs`: transport server, connection registry, event broadcast, request dispatch
- `protocol.rs`: frame schema, versioning, error envelopes, sequence tracking
- `auth.rs`: token/password/device auth and client identity rules
- `tls.rs`: certificate generation/loading/fingerprint policy
- `lock.rs`: single-instance enforcement
- `sessions.rs`: canonical key handling, alias resolution, transcript access, preview/patch/reset/delete/compact
- `workspace.rs`: workspace root derivation and per-session/per-subagent isolation policy
- `bootstrap.rs`: session bootstrap state and per-agent/per-subagent initialization policy
- `omnipanel.rs`: compatibility affordances for the existing Electron control client
- `spacetimedb_bridge.rs`: one-way state publishing to the Universal NOW plane

### CLI Surface

The eventual `epi gate` namespace should expose at least:

- `epi gate status`
- `epi gate start`
- `epi gate stop`
- `epi gate config`
- `epi gate methods`
- `epi gate subscribe`
- `epi gate pair`
- `epi gate inspect`
- `epi gate bootstrap`
- `epi gate workspace`

The CLI is not the protocol itself; it is the operator surface for the protocol.

---

## VIII. SpaceTimeDB as Universal NOW

SpaceTimeDB is stipulated here as the future host of the universal NOW.

That phrase means more than "live updates." It means SpaceTimeDB becomes the shared substrate in which:

- users appear,
- agents appear,
- sessions appear,
- M-surfaces appear,
- temporal flows appear,
- archetypal identity surfaces appear,
- pedagogical traces appear,
- collective state can be inhabited.

### Why SpaceTimeDB Fits This Role

Its model matches the need for:

- durable shared state,
- reducer-owned transitions,
- live subscriptions,
- client-local mirrors of current truth,
- multi-participant synchronized views,
- server-side state logic in Rust.

### Why It Is Not Phase 1 Gateway Replacement

The gateway still has to own:

- RPC correctness,
- auth/session control,
- operator workflows,
- OmniPanel compatibility,
- imperative runtime actions,
- exact parity with `epi-claw`.

So the implementation sequence is:

1. **port gateway parity first**
2. **bridge gateway state into SpaceTimeDB**
3. **expand SpaceTimeDB into the shared world substrate**

This ordering is deliberate and mandatory.

---

## IX. Universal NOW Data Model

The Universal NOW should be designed as a shared ontological runtime, not a generic analytics database.

### First-Class Entities

- **User identity**
  - canonical user id
  - public/shared display identity
  - private personal control metadata

- **Pratibimba identity**
  - a user's instantiated reflective presence
  - personal archetypal interface state
  - relation to `4.0` and `4.4.4.4`

- **Agent identity**
  - agent id
  - role
  - signature / context frame
  - attached user / pratibimba / session

- **Session identity**
  - gateway session key
  - session aliases and NOW-oriented future naming
  - active agent id
  - subagent lineage
  - control-plane lifecycle
  - bootstrap scope
  - workspace root
  - NOW-surface visibility state

- **M-surface state**
  - M0 structural state
  - M1 clock state
  - M2 vibrational/planetary state
  - M3 symbolic/bitboard state
  - M4 social-dialogical state
  - M5 pedagogical-reflective state

### First SpaceTimeDB Tables

These are the recommended initial tables for the Universal NOW plane:

- `identity_presence`
- `pratibimba_presence`
- `agent_presence`
- `session_surface`
- `activity_event`
- `m0_surface`
- `m1_clock_state`
- `m2_planetary_state`
- `m3_symbolic_state`
- `m4_collective_surface`
- `m5_pedagogical_surface`
- `topology_surface`

### Visibility Strategy

The design should prefer:

- private tables for operator/control material,
- public or semi-public views for shared collective state,
- views for participant-specific projections,
- reducers for controlled mutation.

This is especially important because fine-grained visibility and "my field vs shared field" are structural requirements of the system.

---

## X. Universal NOW Interaction Model

The canonical social-symbolic interpretation is:

- the **gateway** is how a participant acts,
- the **Universal NOW** is where the consequences become shareable truth.

### Example Flow

1. User acts through OmniPanel.
2. OmniPanel sends imperative action through gateway RPC.
3. Gateway validates, routes, persists, and emits runtime events.
4. Gateway bridge publishes state transitions into SpaceTimeDB reducers/tables.
5. All subscribed participants receive the updated world-state view.
6. M0-M5 surfaces render the state as an inhabitable collective field.
7. Epii can appear inside that field as callable otherness, not only as a hidden orchestrator.

This is the correct basis for the "new social media" intuition: not feed-first, but ontology-first.

---

## XI. Electron / OmniPanel Compatibility

The current Electron app already demonstrates that gateway-mediated agent experience is viable.

Therefore the S3 spec requires:

- compatibility with the existing OmniPanel gateway client model,
- preservation of the chat/session/config/channels/control workflows it already uses,
- no forced migration to SpaceTimeDB subscriptions for personal command actions,
- progressive enhancement rather than client breakage,
- reuse of the existing gateway agent instance path where possible.

### Compatibility Strategy

- keep WebSocket RPC as the authoritative command surface,
- continue supporting OmniPanel as an operator/personal interface,
- add SpaceTimeDB subscriptions for collective/shared/live surfaces,
- let one Electron application host both:
  - personal gateway actions
  - collective NOW state observation

This lets the app remain both:

- a sovereign personal AI shell,
- and a portal into the shared symbolic universe.

---

## XII. Implementation Sequence

### Phase 1 — Gateway Parity Kernel

Deliver the minimum full-parity control plane:

- lock
- TLS
- connect/auth/device flow
- frame protocol
- session methods
- subagent-active-session support
- canonical-key plus alias session resolution
- session-scoped bootstrap and workspace derivation
- chat methods
- config methods
- presence/health/log methods
- models/skills/update/wizard methods

### Phase 2 — Operational Parity Expansion

Deliver the remaining operator/runtime domains:

- nodes
- browser/web login
- channels
- cron
- exec approvals
- TTS / voicewake / talk mode
- channel-facing skill propagation affordances

### Phase 3 — OmniPanel Hard Compatibility

Verify behavioral compatibility for:

- connection lifecycle
- chat queue/abort/reset flow
- session editing and compaction
- subagent invocation and active-agent switching
- alias-based session resolution
- config/schema/apply flow
- channels status and logout flow
- skill-mediated channel invocation flow
- node invocation flows

### Phase 4 — SpaceTimeDB Bridge

Add one-way world-state publication:

- presence mirror
- session mirror
- activity mirror
- M-clock/state mirror

### Phase 5 — Universal NOW Plane

Build the first inhabitable shared world-state:

- subscriptions
- user/agent/pratibimba presence
- M0-M5 surfaces
- collective projections
- pedagogical overlays

---

## XIII. Verification Requirements

Because this is a production-readiness repo, S3 work is not complete without real verification.

### Required Verification Classes

- protocol conformance tests
- auth and device identity tests
- TLS/fingerprint tests
- session lifecycle tests against real transcript/session stores
- alias and canonical-key resolution tests
- subagent-specific bootstrap and workspace tests
- chat run and abort tests against real gateway behavior
- OmniPanel compatibility tests
- method-by-method parity matrix
- skill propagation tests through channel-oriented gateway paths
- reconnect and sequence-gap tests
- SpaceTimeDB bridge integration tests when introduced

### Hard Rule

No mock-only "parity" claims.

Tests must verify real behavior:

- files written,
- sessions mutated,
- frames exchanged,
- events sequenced,
- config applied,
- clients updated.

---

## XIV. Authority and Source References

Primary local authorities:

- `docs/specs/S/S-STACK-INTEGRATION.md`
- `docs/plans/2026-03-07-s-stack-development-plan.md`
- `docs/resources/S/2026-02-11-omnipanel-gateway-parity-plan.md`
- `docs/resources/S/2026-02-17-omnipanel-gateway-state-architecture-plan.md`
- `docs/resources/S/2026-02-11-omnipanel-gateway-gap-analysis-elevation-plan.md`
- `docs/resources/S/2026-02-26-epi-logos-canonical-system-plan.md`

Reference implementation authorities from the existing gateway codebase:

- `Idea/epi-claw/src/gateway/server-methods/*.ts`
- `Idea/epi-claw/src/infra/gateway-lock.ts`
- `Idea/epi-claw/src/infra/tls/gateway.ts`
- `Idea/epi-claw/src/config/types.gateway.ts`
- `Idea/epi-claw/ui/src/ui/gateway.ts`
- `Idea/epi-claw/ui/src/ui/app-chat.ts`
- `Idea/epi-claw/ui/src/ui/views/chat.ts`

External technology authorities:

- official SpaceTimeDB documentation for reducers, subscriptions, views, and client connections

---

## XV. Final Stipulation

S3 is the place where this project stops being only a private toolchain.

The gateway preserves sovereign agency.
The Universal NOW enables shared inhabitation.

The correct build order is therefore:

1. **port full `epi-claw` gateway parity into Rust**
2. **retain OmniPanel compatibility as a first-class constraint**
3. **establish SpaceTimeDB as the future host of the universal NOW**
4. **surface M0-M5 as a real multiplayer symbolic environment**

That is the canonical S3/S3' architecture for this repo.
