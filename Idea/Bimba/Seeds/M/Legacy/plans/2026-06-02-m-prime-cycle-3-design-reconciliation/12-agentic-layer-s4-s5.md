# Track 12 — Agentic Layer (S4 ↔ S5) Ownership Closure — Pi + Anima + Subagents

**Canonical architecture (per DR-M5-1 / DR-B-1 validation):**

- **Pi** is the underlying agent harness. One Pi. Runtime gateway, dispatch, capability-parity, axiom-translation (per DR-B-2).
- **Anima** is the main dispatching agent. Anima dispatches the six Aletheia subagents for skill/system/service tasks.
- **Six Aletheia subagents** (Anansi, Moirai, Janus, Mercurius, Agora, Zeithoven) are PI-native specialists invoked through Anima. They surface in Pi monitoring views as dispatch traces, NOT as first-class peer agents.
- **Six ta-onta carriers** (Khora, Hen, Pleroma, Chronos, Anima-carrier, Aletheia) are system/service routing infrastructure — they are NOT agents. Aletheia is the tool-guardian carrier AND the subagent dispatcher.
- **ACR (Agentic Control Room) substrate is tangent-development drift** to be repurposed as a Pi runtime monitoring surface, not retained as a "constitutional-agents review panel."
- The `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` array in `capability-matrix.json` is either documented as psyche-aspect rendering material (surfaced through Anima for recognition/meditation work — NOT separate agents) or deprecated outright.

## Source Specs and Matrix

- Canonical: `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md` (Aletheia tool-guardian), `Body/S/S5/epi-kbase/CONTRACT.md`, `Body/S/S4/pi-agent/` (Pi harness)
- Reframed: `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md §M5-4'` (rewrite required around Pi+Anima)
- Audit-target (tangent): `Body/M/epi-theia/extensions/agentic-control-room/`, `Body/S/S4/plugins/pleroma/capability-matrix.json constitutional_agents[]`
- Full row-level evidence: `plan.runs/wave-b-agentic-layer-matrix.md` (read with DR-M5-1 lens — the matrix surfaces the tangent that needs unwinding)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/S/S4/pi-agent` (Pi harness); `Body/S/S4/ta-onta/{khora, hen, pleroma, chronos, anima, aletheia}` (six carriers); `Body/S/S4/ta-onta/aletheia/S5'/agents/` (six subagent .md profiles + janus-envelope.schema.json); `Body/S/S5/epi-gnostic`; `Body/S/S5/epi-kbase`. Audit-and-repurpose — `Body/M/epi-theia/extensions/agentic-control-room/` + `capability-matrix.json constitutional_agents[]`.

## Tranches

1. **12.1 — Pi + Anima + subagents architecture audit (replaces ACR-actor parity)** *(doc-ahead-landing)*

   Audit report at `plan.runs/12.1-pi-anima-subagents-architecture.md` documenting the canonical architecture: Pi (harness), Anima (main dispatcher), six Aletheia subagents (skill/system/service specialists invoked by Anima), six ta-onta carriers (system/service routing infrastructure, NOT agents). Map every actor / role currently in ACR `run-model.ts::AgenticActor` to one of these categories or to "tangent — deprecate." Rewrite `M5'-SPEC §M5-4'` around the canonical architecture.

   Verification: `grep -n 'AgenticActor' Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts` reflects collapsed union; `M5'-SPEC §M5-4'` patched.

2. **12.2 — `s5'.gnostic.*` gateway-endpoint registration** *(code-pending-closure; consolidates Tranche 06.1)*

   Register `s5'.gnostic.{ingest, query, notebook, status}` in `Body/S/S3/gateway/src/` routing to `epi-gnostic/epi_gnostic/{cli.py, graphiti_service.py, wrapper.py}`. Anti-greenfield: production Python package landed; gateway only registers.

   Verification: `grep -rn "s5'.gnostic\." Body/S/S3/gateway/src/` returns ≥4 method registrations; `cargo check -p epi-s3-gateway` clean; `pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py -q` passes.

3. **12.3 — `constitutional_agents` array audit and disposition** *(contradiction-decision DOWNGRADED to audit; replaces orphan-fill)*

   Per DR-M5-1: the `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` array is NOT a peer-agent ontology. Audit whether each name (1) is psyche-aspect rendering material surfaced through Anima — document as such, OR (2) is tangent — deprecate. There are no missing `.md` profiles to land for "constitutional agents" because there are no constitutional agents — there's Anima with optional psyche-aspect facets.

   Verification: audit doc at `plan.runs/12.3-constitutional-agents-disposition.md`; `capability-matrix.json` patched per audit outcome; no orphan-fill of agent profiles.

4. **12.4 — Recursive-self-review gate (relocated from ACR to Pi)** *(code-pending-closure)*

   Recursive-self-review gating is a property of **Pi's review-routing**, not "ACR enforceHumanGate." Pi enforces: when Anima reviews Anima-dispatched work, the review requires user final-validation. Implementation at `Body/S/S4/pi-agent/lib/` (or carrier-equivalent), not in the ACR extension.

   Verification: contract test asserts `pi.enforceReviewGate({recursiveSelfReview: true, actor: 'anima'}).ok === false` requires user final-validation pass.

5. **12.5 — Six operational-capacity views (audit; possibly Pi-monitoring repurpose)** *(spec-ahead-integration)*

   The six per-capacity panes (Anuttara-construction, Paramaśiva-CPT/RAG, Paraśakti-graph-relational, Mahāmāyā-process-reward, Nara-Anima-dialogic, Epii-on-Epii) over `capacity_workflows.rs` are valid as **Pi runtime monitoring views** showing per-capacity dispatch traces. If retained, they live in the repurposed ACR-as-Pi-monitor surface (Tranche 12.14). If not retained, deprecate with `capacity_workflows.rs` substrate kept as canonical.

   Verification: `grep -rn capacity_workflows Body/S/S5/epii-autoresearch-core/src`; per-capacity dispatch trace visible in Pi-monitor view OR audit doc explains why deferred.

6. **12.6 — `MediatedRunEvidencePacket` field-parity closure** *(spec-ahead-integration)*

   Extend `RunEvidenceEnvelope` to include all 16 spec fields (`profileGeneration`, `bridgeReadinessHandle`, `sessionKey`, `dayNowContext`, `currentProfile`, `graphContext`, `sessionRuntime`, `semanticCandidates`, `s5Refs`, `reviewId`, …). Run-evidence transport is canonical regardless of ACR's fate.

   Verification: parity test compares `RunEvidenceEnvelope` keys vs `capability-matrix.json mediated_run_evidence_bridge.packet_required_fields` — set-equality assertion.

7. **12.7 — Pi axiom-translation tooling (DR-B-2 land)** *(code-pending-closure)*

   Implement `Body/S/S4/pi-agent/lib/axiom-translate.ts` consuming `epi-gnostic` OWL/SHACL (`import_epi_ontology_with_n10s` landed). Land in Pi capability list. Unblocks Logos Atelier scent-following root.

   Verification: `test -f Body/S/S4/pi-agent/lib/axiom-translate.ts`; capability-matrix Pi gate-set includes axiom-translate; integration test bridges plain prose to OWL/SHACL.

8. **12.8 — DEPRECATED** *(was: Pi-as-ACR-role decision)*

   Resolved by DR-M5-1 clarification. There is no separate ACR-governance ontology to reconcile with constitutional-roster. Pi is the harness; Anima is the main agent; subagents are dispatched specialists. Tranche removed from execution sequence.

9. **12.9 — Gateway handler audit for `dispatch_moirai_night_pass` + Aletheia Möbius routing** *(spec-ahead-integration)*

   Audit doc verifying `s4'.mediation.route` knows about `dispatch_moirai_night_pass` and chains into `aletheia/modules/moirai-rehear.ts` per Aletheia CONTRACT §Möbius + `janus-envelope.schema.json`. Moirai is one of the six Aletheia subagents — Anima dispatches it for the night-pass routing.

   Verification: `grep -rn 'dispatch_moirai_night_pass' Body/S/S3/gateway/src/ Body/S/S4/ta-onta/anima/modules/` returns hits in BOTH; Pi-monitor view includes night-pass dispatch trace.

10. **12.10 — Capability-parity live-assertion wiring (Pi gateway)** *(spec-ahead-integration)*

    Register gateway endpoint exposing capability list (`s4'.mediation.capabilities.list`); wire parity assertion against it at Pi startup (NOT ACR startup — Pi owns the capability gate).

    Verification: `grep -rn 'capabilities.list' Body/S/S3/gateway/src/`; Pi-runtime test asserts parity at startup.

11. **12.11 — TillDone substrate residency audit** *(code-pending-closure)*

    Verify `Body/S/S4/ta-onta/pleroma/S2/tilldone.ts` exists; if missing, copy from vendor source or downgrade `body_path` claim in capability-matrix. TillDone is execution-backbone for the Pleroma carrier (system/service routing), not an agent.

    Verification: `test -f 'Body/S/S4/ta-onta/pleroma/S2/tilldone.ts'` OR audit doc explains divergence.

12. **12.12 — DEPRECATED** *(was: Aletheia-subagents-in-ACR-AgenticActor decision)*

    Resolved by DR-B-3 + DR-M5-1 clarification. Subagents are Anima-dispatched specialists; they surface in Pi-monitor as dispatch traces, not as first-class actors. The `AgenticActor` union collapses to `pi` + `anima` + the six subagents-as-dispatched. Tranche removed from execution sequence.

13. **12.13 — S4 ↔ S5 shared-intelligence seam runtime audit** *(code-pending-closure; cross-link to Tranches 10.x, 09.x)*

    Audit report: (a) `GEMINI_EMBED_DIMS=3072` end-to-end Bimba+Gnosis; (b) `RELATES_TO_COORDINATE` cross-namespace edges land per `test_enrichment`; (c) `MathemeHarmonicProfile.resonance72` consumed by Aletheia gnosis-RAG via Pi. Straddles Tranche 10.x (resonance72) and 09.x (cross-namespace edges).

    Verification: `pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py::test_cross_namespace_edge_created -q` passes; `grep -rn 'EMBED_DIMS\|embedding_dim' Body/S/S5/epi-gnostic/` returns single value.

14. **12.14 (NEW) — ACR extension repurpose decision and execution** *(no-orphan-fill / first-build allowed for repurposed Pi-monitor)*

    Audit `Body/M/epi-theia/extensions/agentic-control-room/` against the Pi+Anima+subagents canonical architecture. Two paths:

    - **(a) Repurpose as Pi-runtime monitoring surface** — widgets render: dispatch trace (Pi → Anima → subagent invocations), run-evidence display (`MediatedRunEvidencePacket`), capability-parity check, capacity-workflow dispatch traces (Tranche 12.5). Rename extension to `pi-runtime-monitor` (or similar). Drop the "constitutional-agents review panel" framing entirely.
    - **(b) Deprecate** — if no monitoring surface is wanted, mark the extension `@deprecated` and migrate any useful contracts (run-evidence types) into `pi-agent` or `m5-epii`.

    Recommendation: (a). The substrate has real monitoring value once reframed.

    Verification: extension renamed and refactored OR deprecated with migration notes; `grep -rn 'AgenticControlRoom\|ACR' Body/M/epi-theia/extensions/` reflects the chosen path; M5'-SPEC §M5-4' references the Pi-monitor surface instead of ACR.
