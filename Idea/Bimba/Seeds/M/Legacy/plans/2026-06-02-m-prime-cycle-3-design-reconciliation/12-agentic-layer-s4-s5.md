# Track 12 — Agentic Layer (S4 ↔ S5) Ownership Closure — Pi + Anima + Subagents

**Canonical architecture (per DR-M5-1 / DR-B-1 validation):**

- **Pi** is the underlying agent harness. One Pi. Runtime gateway, dispatch, capability-parity, axiom-translation (per DR-B-2).
- **Anima** is the main dispatching agent. Anima dispatches **6 Aletheia subagent techne-guardians** during Aletheia-crystallisation-mode for skill/system/service tasks. Each guardian stewards a specific techne class within Pleroma's atomic-skills repository (Pleroma-Techne).
- **6 Aletheia subagent techne-guardians** (each guards a specific techne class within Pleroma-Techne per DR-S4-TECHNE):
  - **Anansi** (CF0) — guards **coordinate-mapping / blueprint / Darshana-REPL** techne
  - **Janus** (CF1) — guards **temporal-structure / bhedabheda-threshold** techne
  - **Moirai** (CF2) — guards **GraphRAG-distillation** (Klotho/Lachesis/Atropos) techne
  - **Mercurius** (CF3) — guards **Kairos-signal / qualitative-temporal-pattern** techne
  - **Agora** (CF4) — guards **plugin-absorption / skill-index / multi-channel-aggregation** techne
  - **Zeithoven** (CF5) — guards **creative-advance / skill-and-agent-creation** techne

  These are PI-native specialists invoked through Anima during Aletheia-crystallisation-mode. They surface in Pi monitoring views as Anima-dispatch sub-traces under Aletheia, NOT as first-class peer agents.
- **Pleroma-Techne (S4-2') is the atomic-skills substrate** the 6 guardians steward. Pleroma has TWO faces per DR-S4-TECHNE: **VAK capability membrane** (canonical) + **Techne atomic-skills repository** (canon-aligned 2026-06-03). The existing Techne gateway tools (`techne_gateway_*`, `techne_session_*`, `techne_cmux_*` at `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts:25-259`) are the gateway over this skills layer. **Techne is NOT an agent**; the S4 canon §14-Agent Roster mis-classified it. No `techne.md` agent profile lands.
- **Six ta-onta carriers** (Khora, Hen, Pleroma, Chronos, Anima-carrier, Aletheia-carrier) are system/service routing infrastructure — they are NOT agents. Aletheia-the-carrier hosts the crystallisation mode; Anima dispatches within it.
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

   Audit report at `plan.runs/12.1-pi-anima-subagents-architecture.md` documenting the canonical architecture: Pi (harness), Anima (main dispatcher), 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each guarding specific techne classes in Pleroma-Techne) (skill/system/service specialists invoked by Anima), six ta-onta carriers (system/service routing infrastructure, NOT agents). Map every actor / role currently in ACR `run-model.ts::AgenticActor` to one of these categories or to "tangent — deprecate." Rewrite `M5'-SPEC §M5-4'` around the canonical architecture.

   Verification: `grep -n 'AgenticActor' Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts` reflects collapsed union; `M5'-SPEC §M5-4'` patched.

2. **12.2 — `s5'.gnostic.*` gateway-endpoint registration** *(code-pending-closure; consolidates Tranche 06.1)*

   Register `s5'.gnostic.{ingest, query, notebook, status}` in `Body/S/S3/gateway/src/` routing to `epi-gnostic/epi_gnostic/{cli.py, graphiti_service.py, wrapper.py}`. Anti-greenfield: production Python package landed; gateway only registers.

   Verification: `grep -rn "s5'.gnostic\." Body/S/S3/gateway/src/` returns ≥4 method registrations; `cargo check -p epi-s3-gateway` clean; `pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py -q` passes.

3. **12.3 — `constitutional_agents` array audit and disposition** *(contradiction-decision DOWNGRADED to audit; replaces orphan-fill)*

   Per DR-M5-1: the `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` array is NOT a peer-agent ontology. Audit whether each name (1) is psyche-aspect rendering material surfaced through Anima — document as such, OR (2) is tangent — deprecate. There are no missing `.md` profiles to land for "constitutional agents" because there are no constitutional agents — there's Anima with optional psyche-aspect facets.

   Non-deletion clause: do not delete `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/{nous,logos,eros,mythos,psyche,sophia,anima}.md` merely because they are not peer runtime agents. They remain CF-bound aspect/profile material for Anima/Psyche rendering and dispatch explanation unless the audit proves a specific file is tangent.

   Verification: audit doc at `plan.runs/12.3-constitutional-agents-disposition.md`; `capability-matrix.json` patched per audit outcome; no orphan-fill of agent profiles.

4. **12.4 — Recursive-self-review gate (relocated from ACR to Pi)** *(code-pending-closure)*

   Recursive-self-review gating is a property of **Pi's review-routing**, not "ACR enforceHumanGate." Pi enforces: when Anima reviews Anima-dispatched work, the review requires user final-validation. Implementation at `Body/S/S4/pi-agent/lib/` (or carrier-equivalent), not in the ACR extension.

   Verification: contract test asserts `pi.enforceReviewGate({recursiveSelfReview: true, actor: 'anima'}).ok === false` requires user final-validation pass.

5. **12.5 — Six operational-capacity views (audit; possibly Pi-monitoring repurpose)** *(spec-ahead-integration; DR-TS-4 bound)*

   The six per-capacity panes (Anuttara-construction, Paramaśiva-CPT/RAG, Paraśakti-graph-relational, Mahāmāyā-process-reward, Nara-Anima-dialogic, Epii-on-Epii) over `capacity_workflows.rs` are valid as **Pi runtime monitoring views** showing per-capacity dispatch traces. Per DR-TS-4, they are NOT new OmniPanel operational-capacity tabs. If retained, they live in the repurposed ACR-as-Pi-monitor surface (Tranche 12.14). If not retained, deprecate with `capacity_workflows.rs` substrate kept as canonical.

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

   Audit doc verifying `s4'.mediation.route` knows about `dispatch_moirai_night_pass` and chains into `aletheia/modules/moirai-rehear.ts` per Aletheia CONTRACT §Möbius + `janus-envelope.schema.json`. Moirai is one of the 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each guarding specific techne classes in Pleroma-Techne) — Anima dispatches it for the night-pass routing.

   Verification: `grep -rn 'dispatch_moirai_night_pass' Body/S/S3/gateway/src/ Body/S/S4/ta-onta/anima/modules/` returns hits in BOTH; Pi-monitor view includes night-pass dispatch trace.

10. **12.10 — Capability-parity live-assertion wiring (Pi gateway)** *(spec-ahead-integration)*

    Register gateway endpoint exposing capability list (`s4'.mediation.capabilities.list`); wire parity assertion against it at Pi startup (NOT ACR startup — Pi owns the capability gate).

    Verification: `grep -rn 'capabilities.list' Body/S/S3/gateway/src/`; Pi-runtime test asserts parity at startup.

11. **12.11 — TillDone substrate residency confirmation** *(doc-confirmation)*

    Confirm `Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts` exists per S4-ARCHITECTURE §2.4.1 / §8.1. TillDone is execution-backbone for the Pleroma carrier (system/service routing), not an agent. If missing in a future branch, that is a regression; do not copy from vendor source as greenfield work.

    Verification: `test -f 'Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts'`; audit doc records the confirmation.

12. **12.12 — DEPRECATED** *(was: Aletheia-subagents-in-ACR-AgenticActor decision)*

    Resolved by DR-B-3 + DR-M5-1 + DR-S4-TECHNE clarification. The 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) are Anima-dispatched specialists during Aletheia-crystallisation-mode, each stewarding specific techne classes within Pleroma-Techne; they surface in Pi-monitor as dispatch traces under Aletheia, not as first-class actors. The `AgenticActor` union collapses to `pi` + `anima` + the 6 Aletheia subagent techne-guardians. **Techne is NOT in the union** — it is Pleroma's atomic-skills substrate (Pleroma's second face), not an agent. Tranche removed from execution sequence.

13. **12.13 — S4 ↔ S5 shared-intelligence seam runtime audit** *(code-pending-closure; cross-link to Tranches 10.x, 09.x)*

    Audit report: (a) `GEMINI_EMBED_DIMS=3072` end-to-end Bimba+Gnosis; (b) `RELATES_TO_COORDINATE` cross-namespace edges land per `test_enrichment`; (c) `MathemeHarmonicProfile.resonance72` consumed by Aletheia gnosis-RAG via Pi. Straddles Tranche 10.x (resonance72) and 09.x (cross-namespace edges).

    Verification: `pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py::test_cross_namespace_edge_created -q` passes; `grep -rn 'EMBED_DIMS\|embedding_dim' Body/S/S5/epi-gnostic/` returns single value.

14. **12.14 (NEW) — ACR extension repurpose decision and execution** *(no-orphan-fill / first-build allowed for repurposed Pi-monitor)*

    Audit `Body/M/epi-theia/extensions/agentic-control-room/` against the Pi+Anima+subagents canonical architecture. Two paths:

    - **(a) Repurpose as Pi-runtime monitoring surface** — widgets render: dispatch trace (Pi → Anima → subagent invocations), run-evidence display (`MediatedRunEvidencePacket`), capability-parity check, capacity-workflow dispatch traces (Tranche 12.5). Rename extension to `pi-runtime-monitor` (or similar). Drop the "constitutional-agents review panel" framing entirely.
    - **(b) Deprecate** — if no monitoring surface is wanted, mark the extension `@deprecated` and migrate any useful contracts (run-evidence types) into `pi-agent` or `m5-epii`.

    Recommendation: (a). The substrate has real monitoring value once reframed.

    Verification: extension renamed and refactored OR deprecated with migration notes; `grep -rn 'AgenticControlRoom\|ACR' Body/M/epi-theia/extensions/` reflects the chosen path; M5'-SPEC §M5-4' references the Pi-monitor surface instead of ACR.

15. **12.15 — VAK reading-frame evaluator for OracleFrame / SymbolicProtein** *(code-pending-closure; depends on 4.11 + 5.11; DR-VAK-1 bound)*

    Extend Anima/Psyche VAK evaluation so Tarot, I-Ching, and Mahāmāyā readings can be routed as first-class VAK-addressed execution events. `CPF` declares dialogical vs autonomous consent; `CT` declares artifact/content register; `CP` declares active QL position set; `CF` selects constitutional handling mode; `CFP` declares thread/spread topology; `CS` declares Day/Night traversal direction. The evaluator must accept variable-size reading frames: single-card CP point, compressed triad CP-set, sixfold traverse, Klein/Night' inverse pass, and 4/5 depth pass.

    Runtime law: `reading_frame.positions[]` is authoritative for cardinality. A spread name alone is not enough. Optional P4 lemniscate sub-readings are nested CP frames (`CFP5` or explicit child frame), not extra top-level cards. Complementary pairs are computed from position pairs only when the frame declares the relevant topology.

    S4/Psyche integration: VAK reading events should write DAY/NOW/session handles, Redis/Psyche live-context handles, kbase/source-pool handles where used, and Graphiti flattened VAK attrs (`cpf`, `ct`, `cp`, `cf`, `cfp`, `cs_code`, `cs_direction`) before M4-3 integration. This preserves the economy: Anima frames/routs, Psyche holds continuity, M3 transcribes, M4 interprets, M5 reviews.

    Verification: Anima VAK tests cover Tarot single/triad/sixfold/Night'/4-5 fixtures; Graphiti episode tests round-trip flattened VAK fields for oracle artifacts; Redis/S3 session runtime carries `vak_address` for an OracleFrame; no reading path dispatches without CPF consent state and CP position set.

16. **12.16 — S4-SPEC Techne wording patch** *(doc-ahead-landing; DR-S4-TECHNE VALIDATED)*

    Patch S4-SPEC §A and §14 where "Techne helper roles" / `s_4_helper_roles` imply Techne is a helper-agent roster item. Rename the surface to Pleroma-Techne atomic skills / `s_4_pleroma_techne_*` and cross-link Pleroma's two faces: VAK capability membrane + Techne atomic-skills repository.

    Verification: `grep -rn 'Techne helper roles\\|s_4_helper_roles\\|Aletheia 7\\|7th member' Idea/Bimba/Seeds/S/S4` returns no live wrong-roster attribution.

17. **12.17 — Aletheia tool-guardian carrier contract verification** *(doc-confirmation)*

    Verify `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md` carries the invariant that the carrier IS the contract; there is no separate `aletheia-agent/agent-contract.json`. The six Aletheia subagent techne-guardians are profiles under the carrier/mode and are dispatched by Anima.

    Verification: `grep -rn 'aletheia-agent/agent-contract.json\\|carrier IS the contract\\|tool-guardian' Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md Idea/Bimba/Seeds/S/S4`.

18. **12.18 — Janus widens to operate the Klein: prospective/retrospective binary, OracleSpread aliveness, kairos-driven weighting** *(spec-ahead-integration; depends on 5.17; cross-link Tracks 05.15, 05.18, 11.12, 19.11; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §4)*

    Currently Janus (CF1) is "double-faced guardian of thresholds, calendars, and session seams" — accepts `klein_mode` as a trigger but does not operate the Klein. **Widen Janus to operate the Klein at the practical level**, holding the prospective/retrospective binary on every session and computing the session's Klein weighting from live kairos. Janus's frame contract extends from `CF1 (threshold distinction)` to `CF1 + CF(0/1) Klein-binary` — the doorway *is* the sense-switch. Two concrete capabilities land in `Body/S/S4/ta-onta/S4-5p-aletheia/modules/janus-doorway.ts`:

    (a) **Live-vs-mute spread tracking** — new tools `janus_track_spreads({ session_id })` (scans daily-notes from spread placement onward for recognitions referencing each card-position by name / image / decan / ruling planet / explicit `live-spread` highlight from 11.11; updates `last_recognition_at` and `recognition_count` on the `OracleSpreadPosition` table from 5.17), `janus_evaluate_aliveness({ spread_id })` (state machine: 14+ days no recognition AND no target_aspect within ±7 days → muting; 7 more days no recognition → mute; target_aspect.exact_at within ±24h → reopen as generating), `janus_spread_resolved({ spread_id })` (when all positions mute, mark resolved so next draw lands as fresh ground rather than repetition). Recognition detection routes through Mercurius (CF3) for kairos windows extending activation.

    (b) **Forward/backward weighting per session** — new tool `janus_weight_session({ session_id })` computes default `c_3_klein_weighting` from `M4_Temporal_Now.planet_degrees[10]` (canonical mod-10). Structural weightings: Saturn station within ±3° → retrospective +0.3; Saturn return within ±2° → retrospective +0.5; New Moon within ±12h → prospective +0.3; Mercury retrograde shadow entry → retrospective +0.2; Mercury direct station → prospective +0.2; Sun trine/sextile natal Sun → balanced. Final = `clamp([0.5 + Σ skews], 0.0..1.0)` for prospective, complement for retrospective. User override (from Tuning Bar 11.12) is absolute. Updates session NOW frontmatter via Khora.

    Patch `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md` frame contract section to reflect the widening. The two faces of Janus are *prospective* and *retrospective* — and Janus is the only guardian whose function is to hold both faces co-present and decide direction of read for the current moment.

    Verification: `grep -nE 'janus_track_spreads|janus_evaluate_aliveness|janus_spread_resolved|janus_weight_session' Body/S/S4/ta-onta/S4-5p-aletheia/modules/janus-doorway.ts` returns the four new tools; `grep -nE 'CF1 \\+ CF\\(0/1\\)|prospective.*retrospective|Klein-binary' Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md` returns the contract widening; state-machine test covers generating → muting → mute and reopen on target_aspect proximity; weighting test against a fixture kairos with Saturn station asserts retrospective tilt; integration test confirms `c_3_klein_weighting` writes through to NOW frontmatter and is read by the briefing skill (5.18) and ambient strip (11.12).

19. **12.19 — Aletheia subagent veto primitive in dispatch contract** *(spec-ahead-integration; depends on 12.17; cross-link Tracks 05.18, 11.11; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §5)*

    Per DR-M5-1, Anima is the dispatcher and the only synthesis authority; the six Aletheia subagent techne-guardians (Anansi CF0, Janus CF1, Moirai CF2, Mercurius CF3, Agora CF4, Zeithoven CF5) are facet-shaped by design intent but currently lack an operational mechanism preventing facets from drifting into voices that produce independent reports. Under Klein topology, no single facet can speak for the whole because the whole is non-orientable. The **veto primitive** is the formal recognition of one-sidedness:

    New return type from any dispatched Aletheia guardian:
    ```ts
    type FacetReturn =
      | { kind: 'disclosure'; facet: FacetId; angle: string; evidence: Citation[] }
      | { kind: 'veto'; facet: FacetId; reason: string; what_is_missed: string };
    ```
    A `veto` blocks the current synthesis from being written as the recognition. Anima (as dispatcher) receives the veto and may: (i) re-dispatch the facet-set with the veto noted, (ii) defer synthesis to the next return (orbit lengthens — coupled to `c_3_response_orbit` in Khora flow-watcher per Track 19.11), or (iii) escalate to the user as a `retrospective-surfacing` highlight (11.11) explicitly marked "open question — the facets are not converging." Veto patterns persist in CONTINUATION.md and a new SpacetimeDB `aletheia_veto_log` table so subsequent runs see recurring gaps. Anima's dispatch logic reads `c_3_klein_weighting` (12.18) to select the guardian-set; psyche-aspect rendering (Sophia for wisdom-integration voice, Nous for intellectual ground, Mythos for narrative, etc.) is Anima's authorial register choice — **not separate dispatch authorities**, per DR-M5-1.

    Patch `Body/S/S5/plugins/epi-logos/skills/aletheia-orchestration/SKILL.md` (or current orchestration contract) to specify: (1) every dispatched facet discloses an angle; never concludes; (2) Anima is the only synthesis authority; (3) any facet may return `veto` instead of `disclosure`; (4) veto handling protocol; (5) veto patterns persist and inform future dispatch; (6) over-frequent vetoes from one facet flag dispatch logic as miscalibrated (concrete threshold: 3+ vetoes per facet per session → emit `aletheia.dispatch.miscalibrated` observability event). Cross-link: the constitutional-agents array audit in Track 12.3 confirms Anima's authorship — these aspect names are voice-rendering, not peer agents.

    Verification: `cargo check -p epi-s3-gateway`; `cargo test -p epi-s3-gateway aletheia_veto_log_persists`; round-trip test confirms a veto blocks synthesis and triggers the configured re-dispatch / defer / escalate path; `grep -nE 'aletheia_veto|FacetReturn|disclosure.*veto' Body/S/S5/plugins/epi-logos/skills/aletheia-orchestration/SKILL.md` returns the contract update; miscalibration observability event fires on a fixture with 3 vetoes from the same facet.
