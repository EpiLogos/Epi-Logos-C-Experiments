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

## Redis/Psyche/Kbase Residency Preflight

Before normal Track 12 agentic-layer work resumes, pass the pre-Cycle-3 Redis residency cleanup at [[../../../../S/S3/S3-REDIS-RUNTIME-SPEC]]. Agentic dispatch evidence, Psyche continuity, kbase/Gnosis retrieval, and source-pool references must carry S3-owned Redis runtime handles rather than raw Redis clients or raw protected bodies. [[Psyche]] owns continuity law; [[S3]] owns the hot/active runtime state; [[S5]] owns kbase/source meaning; [[S0]] remains only the adapter.

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

20. **12.20 — Elo-bookkeeping infrastructure across Mercurius / Janus / Anansi / Moirai** *(spec-ahead-integration; depends on 12.18, 12.19; DR-ELO-1 bound; canonical spec at [[../../../M'-AGENTIC-RUNTIME-SPEC]] §3-§4)*

    Operationalize the S4'/S5' autoresearch self-improvement loop as multi-channel Elo over `(agent × model × skill × context)` indexed by `(vak-cp-position, mef-lens, content-class, kairos-window)`. The same machinery rates agent dispatch AND research-moves; the tournament IS the system activity.

    Four Aletheia techne-guardians together constitute the Elo infrastructure:

    - **Mercurius (CF3)** — Elo bookkeeper. Maintains rating tables per channel (R_verifier, R_lens, R_user), per `(agent-model-skill, context)` tuple. Computes Elo updates on completion of each trial. Exposes ratings to Anima's dispatch policy. New module: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/mercurius-elo.ts` with tools `mercurius_record_trial({trial_id, dispatch, outcomes})`, `mercurius_query_ratings({agent, context_tuple, channel})`, `mercurius_update_elo({trial_id})`.
    - **Janus (CF1)** — threshold logic. Decides whether a `(verifier_pass, lens_delta, user_delta)` is real signal vs noise. Extends Janus's existing CF1+CF(0/1) Klein-binary widening (Track 12.18) — Janus already runs prospective/retrospective weighting; now also runs threshold on Elo deltas calibrated per trial-class. New tool: `janus_threshold_elo_delta({delta, trial_class})`.
    - **Anansi (CF0)** — coordinate-conditional index. Maintains the rating-index structure keyed by `(vak-cp-position, mef-lens, content-class, kairos-window)`. Resolves dispatch queries to the right rating-set; handles partitioning for O(log N) lookup. New module: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/anansi-elo-index.ts` with `anansi_index_rating({rating_record})`, `anansi_resolve_context({context_query})`.
    - **Moirai (CF2)** — fair-comparison distillation. GraphRAGs recent trial-history to find genuinely comparable prior trials; refuses updates where no comparable prior exists. Klotho spins (trial-recording), Lachesis measures (similarity), Atropos cuts (update-decision). New module: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/moirai-fair-comparison.ts` with `moirai_distil_comparison({trial_id})`, `moirai_similarity_score({trial_a, trial_b})`.

    Multi-channel rating, never collapsed to scalar. Composite ratings exist as derived view only. Confidence-interval penalty applies: `effective_rating = R - α·σ(R)`. Bootstrap behaviour: uniform 1500 Elo with confidence-interval-penalty-dominated dispatch until ~100 trials per context-class accumulate.

    Persistence: SpacetimeDB tables `mercurius_elo_ratings`, `mercurius_trial_log`, `anansi_rating_index`, `moirai_comparison_cache`. Schema in `Body/S/S3/spacetime-context/schemas/elo-runtime.sql` (new).

    Verification: `cargo test -p epi-s3-gateway mercurius_elo_round_trip` (dispatch → trial → outcomes → rating update); `cargo test -p epi-s3-gateway moirai_refuses_uncalibrated_update`; `grep -nE 'mercurius_record_trial|janus_threshold_elo|anansi_index_rating|moirai_distil_comparison' Body/S/S4/ta-onta/S4-5p-aletheia/modules/` returns the four new module surfaces; integration test confirms agent-tournament and canon-tournament ratings persist in the same indexed structure; observability events fire on rating updates and threshold misses.

21. **12.21 — `user-context` skill implementation with mandatory routing** *(spec-ahead-integration; depends on 12.15; DR-UC-1 bound; canonical spec at [[../../../M'-USER-CONTEXT-SKILL-SPEC]])*

    Land the `user-context` skill as a first-class participant in the agentic loop. The skill fires mandatorily under specified VAK conditions (CT ∈ {2,4,5}, CF ≠ (00/00), target ∈ #4.x.y, agent_role ∈ constitutional-7, or explicit `require_user_context`), returns a typed `UserContextFrame`, and is dual-injected: into the dispatched agent's articulation context as `[[UserContext]]` AND as second-channel input to the EBM at position 5'.

    Skill location: `Body/S/S4/pi-agent/skills/user-context/{SKILL.md, index.ts, schema.json}` (new). The skill follows Pleroma-Techne atomic-skill contract.

    UserContextFrame schema (TypeScript, also JSON-schema): seven channels — `pasu` (birth-date, birth-location, natal-chart-path, jungian, gene-keys, human-design, quintessence_hash, quintessence_clock, last_wound), `kairos` (planet_degrees[10], transits_active, decan_window, moon_phase, epoch_marker), `identity` (q_identity, q_personal, tick12, exact_degree_720, phase), `recent_sessions`, `active_dev_goals`, `recognized` flag, provenance metadata.

    Routing enforcement: Anuttara registers `user_context_routing_compliance` constraint at `severity: error-level` (blocks dispatch). `pi register-constraint user_context_routing_compliance constraints/user_context_routing_compliance.cypher`.

    Longitudinal write-back at session close: appends to `Idea/Pratibimba/Self/PASU.md` (`c_3_session_history` array) and `M5_ContemplationObject.vak_profile_pairs[]`. Kairos field populated via existing `kairos-python-adapter.ts` at `chronos/S3'/` (Task 4.6). Performance budget: <100ms per fire warm-cache, <250ms cold-cache.

    EBM integration: position-5' EBM input becomes `(lens_resonance_72, user_temporal_N)` with `user_temporal_N` a ~25-30-dim projection of the frame. Projection layer learned alongside the EBM head; lives at `Body/S/S5/epii-autoresearch-core/src/ebm_user_projection.py` (new).

    Verification: `test -d Body/S/S4/pi-agent/skills/user-context`; round-trip test confirms skill fires on matching VAK frame and skips on non-matching frame; `cargo test -p epi-s3-gateway user_context_routing_compliance` confirms verifier refuses non-attached dispatch; integration test confirms dual-injection (agent receives `[[UserContext]]`, EBM receives second channel); longitudinal write-back appends to PASU.md and M5_ContemplationObject.

22. **12.22 — Pi-Agent model-slot configuration interface** *(spec-ahead-integration; DR-MODEL-1 bound; canonical spec at [[../../../M'-MODEL-SLOT-SPEC]])*

    Land the per-role model-slot rule. Each slot has three valid states (local-default / cloud-opt-in / null) configured in `~/.epi-logos/config.toml`. Anima's dispatch policy reads slot state at dispatch time; Anuttara verifier enforces privacy boundaries.

    Slots: `nara_parser`, `epii_judge`, `aletheia.{anansi,janus,moirai,mercurius,agora,zeithoven}`. Defaults per slot per [[../../../M'-MODEL-SLOT-SPEC]] §2-§4 (Nara-parser → local-default Gemma 4 12B Unified Q4; Epii-judge → cloud-opt-in Pro-class; per-Aletheia-subagent defaults per techne-domain).

    CLI surface at `Body/S/S0/epi-cli/src/slot.rs` (new): `epi slot list`, `epi slot show <name>`, `epi slot set <name> --state <state> --provider <p> --model <m>`, `epi slot disable <name>`, `epi slot test <name>`.

    Verifier constraints (new, registered via `pi register-constraint`):
    - `slot_privacy_boundary_compliance` (error-level) — dispatches must not route content of class X to a slot whose consent_scope doesn't cover X
    - `slot_fallback_compliance` (error-level) — slots configured `local-default` must resolve to either `local-default` or `null`, never silently to `cloud-opt-in`

    Pi-Agent harness reads slot config at startup and per-dispatch; exposes `pi_slot_resolve({slot_name, dispatch_context})` → `(model_ref, state, fallback_action)`.

    Cloud-opt-in UI gate: when user enables cloud routing for a slot whose default is local, surface frictional confirmation with privacy implication ("Enabling cloud routing for Nara-parser means your journal entries and dream content will be sent to {provider}. Type 'I understand' to confirm.").

    Verification: `cargo test -p epi-cli slot_list_round_trip`; `cargo test -p epi-s3-gateway slot_privacy_boundary_compliance` (constraint blocks scope violations); `cargo test -p epi-s3-gateway slot_fallback_compliance` (silent degradation is refused); `epi slot test nara_parser` confirms local Gemma reachable; integration test confirms cloud-opt-in UI gate fires with frictional confirmation; existing Pi-Agent dispatches honour resolved slot model.

23. **12.23 — Anima MoE dispatch policy implementation** *(spec-ahead-integration; depends on 12.20, 12.21, 12.22; DR-MOE-1 bound; canonical spec at [[../../../M'-AGENTIC-RUNTIME-SPEC]] §5)*

    Operationalize Anima's dispatch policy as the gating function of the coordinate-conditional MoE. Policy is observable, editable, Elo-informed. Reads at dispatch time: candidate `(agent, model, skill_set)` triples (constitutional-role-fit × model-availability × skill-applicability); Mercurius rating-state per `(vak-cp-position, mef-lens, content-class, kairos-window)`; user-context state (if skill fired); slot resolution per Track 12.22.

    Policy module location: `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts` (new) — replaces ad-hoc dispatch logic with the documented MoE policy. Composite-weighting, confidence-penalty (α), and recency-bias parameters configurable per session via `~/.epi-logos/config.toml`.

    Bootstrap behaviour: uniform-rating fallback prefers (a) constitutional-role fit, (b) skill-applicability, (c) model-availability, (d) coverage-priority. Transition to Elo-dominated dispatch is smooth; no hard cutoff.

    Per-dispatch trace: every gating decision recorded as `DispatchTrace` event into Pi monitoring view (per Track 12.14 Pi-runtime-monitor) — candidate set, rating lookup keys, composite scores, selection rationale, fallback applications. Surfaces in `pi-runtime-monitor` extension widget as the MoE-gating audit panel.

    Aletheia mode dispatch: when task requires Aletheia-crystallisation-mode, Anima dispatches one or more techne-guardians per (12.18, 12.19) with veto handling. Guardian-selection itself is Elo-informed (Mercurius rates per `(guardian × task-class × context)`).

    Per-session override: `epi session start --override-policy <policy-file>` allows explicit per-dispatch overrides bypassing Elo (useful during onboarding before ratings accumulate).

    Verification: `cargo test -p epi-s3-gateway anima_dispatch_policy_bootstrap` (uniform-rating fallback hits documented heuristics); `cargo test -p epi-s3-gateway anima_dispatch_policy_elo_informed` (with seeded Mercurius state, dispatch selects highest-rated candidate); integration test confirms DispatchTrace events emitted per dispatch and visible in `pi-runtime-monitor`; `grep -nE 'dispatch-policy|gating|composite_rating' Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts` returns the documented policy module; round-trip test confirms Aletheia-mode dispatch composes with veto primitive and Elo updates flow back to Mercurius after trial completion.

24. **12.24 — ML skill surface: vendor priority-13 Hermes + build 5 core gaps + per-subsystem domain skills + drift-detection retrain loop** *(spec-ahead-integration; depends on 12.20, 12.21, 12.22, 12.23; DR-ML-1 bound; canonical spec at [[../../../M'-ML-SKILL-SURFACE-SPEC]])*

    Land the per-subsystem ML method as concrete skill surface across the system. Four phases, sequenced:

    **Phase 1 — Vendor priority-13 Hermes skills** *(Agora CF4 owns)*. In order: huggingface-hub, huggingface-accelerate, peft-fine-tuning, unsloth, fine-tuning-with-trl, simpo-training, weights-and-biases, pytorch-lightning, nemo-curator, serving-llms-vllm, llama-cpp, evaluating-llms-harness, dspy. All land at `Body/S/S4/pi-agent/skills/hermes/{name}/` per residency rule. Each vendoring: clone upstream SKILL.md + scripts/references/assets, validate frontmatter against Claude Code Skills standard, record `provenance.yaml` (upstream commit hash, vendoring timestamp), register with Agora's skill-index. New module: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/agora-vendoring.ts` with tools `agora_vendor_skill({name})`, `agora_list_upstream({source})`, `agora_preview_skill({name})`, `agora_verify_skill({name})`, `agora_refresh_skill({name})`.

    **Phase 2 — Build 5 core gap skills** *(distributed ownership per subsystem)*:
    - **`mlx-lora`** at `Body/S/S4/pi-agent/skills/custom/mlx-lora/` (Pi-Agent harness-resident because cross-subsystem). Mirror `unsloth` pattern with `mlx-lm` backend. Scripts: train.py, merge.py, quantize.py, eval.py. Config schema: axolotl-compatible YAML so configs reuse across runtimes.
    - **`epii-distillation`** at `Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/`. Pro→local teacher-student pipeline. Scripts: distill_dataset_gen.py (with multi-channel annotation: lens-coherence, verifier-pass, user-articulation simulation), distill_train.py (composes peft + unsloth OR mlx-lora + custom multi-channel preservation loss), distill_eval.py.
    - **`parashakti-ebm-head`** at `Body/S/S5/epii-autoresearch-core/skills/parashakti/ebm-head/`. The 72-dim tritone-symmetric dual-channel EBM. Scripts: train.py (pytorch-lightning host), architecture.py (three sub-heads per square + cross-square attention), loss.py (MSE + λ_square·square_emphasis + λ_mirror·mirror_consistency + λ_user·user_temporal_consistency), eval.py (per-square accuracy, mirror-consistency, user-temporal-correlation), serve.py (checkpoint export for kernel-runtime).
    - **`aletheia-elo-rating`** at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/elo-rating/`. Multi-channel Bradley-Terry / TrueSkill update math. Scripts: bradley_terry_update.py, trueskill_update.py (alternative for small samples), confidence_interval.py, query.py, audit.py. State in SpacetimeDB `mercurius_elo_ratings` table per Track 12.20.
    - **`aletheia-drift-detection`** at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/`. The autoresearch loop's keystone. Scripts: watch.py (daemon monitoring Mercurius rating tables), diagnose.py (drift→retrain-action mapping), compose_task.py (produces Pi task spec for retrain), dispatch.py (queues for Anima with calibration provenance). Drift conditions per [[../../../M'-ML-SKILL-SURFACE-SPEC]] §5: rating-trend (δ=100 Elo over N=50 trials), veto-pattern (3+ vetoes per facet × 3+ consecutive sessions), coverage (no trials in 30 days), verifier-violation (3× baseline).

    **Phase 3 — Per-subsystem domain skills**:
    - **M0 Anuttara**: `anuttara-constraint-discovery` (composes dspy + lm-eval-harness; surfaces candidate Cypher constraints from trials), `anuttara-symbolic-parse` *(already specified Track 5.21 — landing in same phase)*, `anuttara-lean-bridge` *(future, Level-2)*
    - **M1 Paramaśiva**: `paramasiva-quaternion-projection` (learned bioquaternion-to-EBM-input with `|q|=1` preservation), `paramasiva-topology-eval` (K² topology invariant checks)
    - **M2 Parashakti**: `parashakti-corpus-curation` (nemo-curator + co-authored resonance annotations → EBM training pairs), `parashakti-72dim-eval` (square accuracy + mirror-consistency + user-temporal-correlation tracking via wandb)
    - **M3 Mahāmāyā**: `mahamaya-hexagram-trajectory` (peft + instructor for typed-enumerated hexagram transitions), `mahamaya-codon-pattern` (structured-prediction on 360+24 backbone)
    - **M4 Nara**: `nara-journal-parser` (wraps Nara-parser slot + structured-output for journal entries — archetypal tags, mood signatures, theme extraction), `nara-dream-parser` (analogous, with M2/M3 decan/planet/chakra bridges), `nara-voice-training` (LoRA pipeline composing mlx-lora on Darwin OR peft+unsloth on Linux+CUDA, with user-context-aware data prep)
    - **M5 Epii**: `epii-canon-coherence-judge` (multi-model judge dispatch via dspy), `epii-autoresearch-orchestrator` (alphaproof-pattern outer loop: propose → judge → Elo → escalate → deposit), `epii-preference-learning` (Mercurius Elo state → simpo-training preference pairs)
    - **Aletheia cross-cutting**: `aletheia-creative-skill-creation` (Zeithoven's skill-proposal via dspy), `aletheia-skill-vendoring` (Agora's vendoring orchestration, factored out of Phase-1 module)

    **Phase 4 — Wire drift-detection retrain loop end-to-end**. `aletheia-drift-detection` daemon active in production; rating-trend drift on `(Nara, gemma-12b-q4, journal-parser)` produces calibration task dispatching `nara-voice-training`; rating-trend drift on `(Parashakti EBM)` outputs produces calibration task dispatching `parashakti-ebm-head` retrain on accumulated new trials; verifier-violation drift produces task dispatching `anuttara-constraint-discovery` OR developer review. Developer-in-the-loop CLI: `epi review-retrain <retrain-id>` (staged provisional artifact + diff + metrics + sample outputs), `epi promote-retrain <retrain-id>` (deploys to slot), `epi reject-retrain <retrain-id>` (records rejection as drift-calibration signal).

    **CLI surface** at `Body/S/S0/epi-cli/src/skill.rs` (new): `epi skill list [--source vendored|custom] [--subsystem M0..M5]`, `epi skill show <name>`, `epi skill vendor <name>`, `epi skill propose <description>`, `epi skill scaffold <name>`, `epi skill register <name>`, `epi skill refresh <name>` (vendored-skill update check). Plus retrain-review CLI in same module.

    **Persistence** in SpacetimeDB tables: `agora_skill_index` (registry of all skills with frontmatter, residency, dependencies, current rating), `aletheia_retrain_queue` (calibration tasks awaiting Anima dispatch), `aletheia_retrain_history` (completed retrain runs with metrics + ratification status). Schema at `Body/S/S3/spacetime-context/schemas/skill-registry.sql` (new) and `Body/S/S3/spacetime-context/schemas/retrain-loop.sql` (new).

    Verification: `epi skill list --source vendored` returns 13 Hermes skills after Phase 1; `epi skill list --source custom --subsystem M4` returns M4 Nara skills after Phase 3; `cargo test -p epi-s3-gateway agora_skill_index_round_trip`; `cargo test -p epi-s3-gateway aletheia_drift_detection_seeded_fixture` (with seeded rating-drift, daemon produces calibration task with correct retrain-action mapping); integration test runs full loop: seeded drift → diagnose → compose-task → dispatch → retrain (mocked ML skill) → register-provisional → recalibrate; `test -d Body/S/S4/pi-agent/skills/hermes && test -d Body/S/S4/pi-agent/skills/custom && test -d Body/S/S5/epii-autoresearch-core/skills/parashakti && test -d Body/S/S5/plugins/epi-logos/skills/custom && test -d Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom`; `epi skill show mlx-lora` returns canonical SKILL.md after Phase 2; `epi review-retrain <fixture-id>` shows staged provisional artifact with metrics.
