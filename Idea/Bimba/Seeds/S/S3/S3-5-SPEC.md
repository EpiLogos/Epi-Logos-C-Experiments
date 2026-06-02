---
coordinate: "S3.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S3'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3.5 Shard: Integration Surface

## Canonical Role

[[S3.5]] is the [[P5]] / [[CT5]] integration surface of [[S3]]. It binds gateway parity to app/device/log/approval/browser/update/wizard surfaces, keeps [[M']] client expectations truthful, and hands runtime consequences toward [[S3']] projection and [[S5]] / [[S5']] reflective governance without absorbing their meaning.

## Source And Diagram Anchors

Read [[S3-SPEC]], [[S3'-SPEC]], [[S3-SHARD-INDEX]], [[S3-TRACEABILITY-INDEX]], [[S3'-TRACEABILITY-INDEX]], [[S3]], [[S3']], and both S3 World/Types canvases. Diagrams: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]]. Legacy anchors include [[2026-05-12-portal-core-spec-amendment]], [[2026-03-10-gateway-verification-matrix]], and [[2026-03-10-nara-runtime-full-plan]].

## Current Body Reality

`Body/S/S3/epi-app` contains the current Electron + Vite + React bridge, including `main/s3-gateway-client.ts`, `main/epi-claw-client.ts`, renderer gateway stores, OmniPanel panels, M0-M5 domain views, and `tests/main/gateway-parity.test.ts`. `Body/S/S3/gateway-contract/src/lib.rs` includes app-facing RPC families for devices, approvals, logs, browser, config, models, usage, skills, node methods, sessions, status, and health. `Body/S/S3/graphiti-runtime/src/lib.rs` supplies the S3' runtime adapter for [[Graphiti]] envelopes and payloads, while [[S5]] governs invocation.

## Build Contract

The app bridge must consume the same gateway method/session truth as `epi portal`; it must not invent a desktop-only settings/session ontology. Graphiti must remain a runtime adapter at [[S3']] with protected-local episodic-memory boundaries and [[S5]] invocation ownership. Integration methods must map product RPC names to coordinate owners, expose unsupported states honestly, and preserve parity for [[OmniPanel]] / Epi-Claw-shaped clients.

## API / Envelope / Implementation Hooks

Surfaces include `browser.request`, `web.login.*`, `device.*`, `exec.approval.*`, `logs.tail`, `models.list`, `usage.*`, `skills.*`, `node.*`, `update.run`, `wizard.*`, `s5.episodic.*`, and `s5.episodic.kernel_*`. App hooks include `S3GatewayClient`, `resolvePreferredGatewaySessionKey`, `normalizeChatPayload`, `PANEL_RPC_PARITY`, and renderer session controllers.

## Test Obligations

Use `Body/S/S3/epi-app/tests/main/gateway-parity.test.ts`, `Body/S/S3/gateway/tests/graphiti_runtime_contract.rs`, and dispatch contract tests. They must prove app session defaults come from gateway sessions, chat events normalise correctly, required session RPC parity exists, and Graphiti envelopes preserve runtime/invocation split.

## Open Gaps

`Body/S/S3/epi-app` is still Electron rather than the target Tauri v2 / Theia-aligned surface, and some renderer domains still use direct local helpers. Treat it as current evidence plus migration source, not final architecture.

## Boundaries

[[S3.5]] integrates runtime surfaces. [[M']] consumes them, [[S3']] projects shared state, [[S1']] governs vault writes, [[S2]] owns graph law, [[S4']] owns agent orchestration, and [[S5']] owns [[Graphiti]] meaning, review, and return.
