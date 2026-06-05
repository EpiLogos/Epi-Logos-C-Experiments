# Track 06 — M5 Epii Reconciliation

Reconciles [[M5']] (agentic-pedagogical IDE + S4↔S5 shared-intelligence seam) across the four corpora. The autoresearch + review + agent-core spine and the 4/5/0 recognition plugin are ALIGNED — substrate, gateway methods (`s5'.epii.*`, `s5'.review.*`, `s5'.improve.*`), and extensions are landed. **Aletheia is correctly modeled as Anima-dispatched tool-guardian mode/carrier with six subagent techne-guardians** (per DR-M5-1 / DR-B-3 / DR-S4-TECHNE), **not a peer Pi agent** — memory invariant honored, no `aletheia-agent/agent-contract.json` blocker raised. The chief gaps are: `s5'.gnostic.*` gateway routes unregistered despite production `epi-gnostic` package being landed; Canon Studio, Backend Studio, and Logos Atelier are intent-only at the Theia layer.

**ACR reframe (binding):** any 06.x row touching `Body/M/epi-theia/extensions/agentic-control-room/` treats that substrate as repurposed Pi-runtime monitoring / OmniPanel-housed runtime evidence, not as a constitutional-agents review panel. Pi is the single harness; Anima dispatches; the six Aletheia subagent techne-guardians appear only as Anima-dispatch sub-traces under Aletheia-crystallisation-mode.

## Total-Shape Architecture (Phase A)

Canonical total-shape document for M5' (Gnostic library, Canon Studio, Backend Studio, Tauri/Theia IDE shell, Pi-runtime monitoring replacing ACR per DR-M5-1, Logos Atelier): [`Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md) (726 lines). Profile-bus projections `EpiiReviewWorkbenchProjection` + `CanonRecognitionAnchor` per Tranche 10.M5. DR-M5-3 fixes library-pane placement as left-sidebar activity-bar mode in `ide-deep`, NOT an OmniPanel tab. M5↔M0 Möbius write-back boundary PASSES.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md`
- Companions: `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`, `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md`, `Idea/Bimba/Seeds/M/M5'/frontier-confirmations-and-refinements.md`
- Full row-level reconciliation: `plan.runs/wave-a-m5-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/S/S5/epi-gnostic` (production Python package + Aletheia CLI bridge); `Body/S/S5/epi-kbase`; `Body/S/S4/ta-onta` (six carriers, Aletheia subagents); `Body/S/S4/pi-agent`; `Body/S/S4/plugins/pleroma/capability-matrix.json`; `Body/M/epi-theia/extensions/m5-epii`; `Body/M/epi-theia/extensions/agentic-control-room`. Cycle 2 plan 07 left M5-0 partial because the gateway route was unregistered; M5-5 Logos Atelier had no named extension owner; M5-1 Canon Studio + Backend Studio likewise.

## Tranches

1. **6.1 — Register `s5'.gnostic.*` over production epi-gnostic** *(code-pending-closure; gates 6.2)*

   Add `s5'.gnostic.{ingest,query,notebook,status}` to `Body/S/S3/gateway-contract/src/lib.rs` + wire dispatch in `Body/S/S3/gateway` over existing `Body/S/S5/epi-gnostic` Python package and Aletheia CLI bridge. **Anti-greenfield: do NOT rebuild epi-gnostic.**

   Verification: `grep -n "s5'.gnostic" Body/S/S3/gateway-contract/src/lib.rs` returns ≥4 methods; `cargo check -p gateway-contract`; `cargo check -p gateway`.

2. **6.2 — Author `logos-atelier` Theia extension** *(no-orphan-fill; depends on 6.1)*

   Add `Body/M/epi-theia/extensions/logos-atelier/` `{package.json, src/common/atelier-surface.ts, src/browser/atelier-widget.tsx}` consuming `aletheia_gnosis_query` / `aletheia_crystallise` / `aletheia_thought_route` over the `etymology` graph namespace via Tranche 6.1's `s5'.gnostic.*` routes. Surface contract: scent-following pipeline root → cognate → drift → psychoid → pros-hen → Möbius write-back proposal. Dispatch runs through Anima into the Aletheia-crystallisation-mode; Aletheia subagent techne-guardians appear as evidence lineage, not peer review actors.

   Verification: `test -d Body/M/epi-theia/extensions/logos-atelier && test -f Body/M/epi-theia/extensions/logos-atelier/package.json`; `grep -n etymology Body/M/epi-theia/extensions/logos-atelier/src/common/atelier-surface.ts`.

3. **6.3 — Six operational-capacity panes over `capacity_workflows.rs`** *(spec-ahead-integration; cross-link to Tranche 12.5 / DR-TS-4)*

   In the repurposed Pi-runtime monitoring / OmniPanel-housed surface, add six per-capacity panes (Anuttara-construction, Paramaśiva-CPT/RAG, Paraśakti-graph-relational, Mahāmāyā-process-reward, Nara-Anima-dialogic, Epii-on-Epii) driven by existing `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs`. DR-TS-4 explicitly rejects new operational-capacity OmniPanel tabs; these panes are valid as M5-4 runtime-monitor surface work, not OmniPanel tab proliferation.

   Verification: `grep -rn capacity_workflows Body/S/S5/epii-autoresearch-core/src`; `cargo check -p epii-autoresearch-core`; M5'-SPEC readiness criteria "six end-to-end paths" tests pass.

4. **6.4 — Canon Studio + Backend Studio Theia extensions** *(doc-ahead-landing)*

   Two named extensions:
   - `Body/M/epi-theia/extensions/canon-studio/` — markdown editor + QL/bimba decoration + Smart Connections autocomplete via `s1'.semantic.*`; writes via Hen `s1'.vault.*`.
   - `Body/M/epi-theia/extensions/backend-studio/` — declares LSP contributions (`rust-analyzer`/`clangd`/`pylsp`) per system-shape canon §1.2; surfaces `epi-lib` + `portal-core` + S1–S5 cores with provenance.

   Verification: `test -d Body/M/epi-theia/extensions/canon-studio && test -d Body/M/epi-theia/extensions/backend-studio`; `grep -n "s1'.vault\|s1'.semantic" Body/M/epi-theia/extensions/canon-studio/src/common/`; `grep -n "rust-analyzer\|clangd\|pylsp" Body/M/epi-theia/extensions/backend-studio/package.json`.

5. **6.5 — Execute DR-M5-1 + DR-M5-2 register cleanup** *(doc-ahead-landing; DR-M5-1 / DR-M5-2 VALIDATED)*

   Land the ratified register cleanup. Pi is the single underlying agent harness; Anima is the main dispatcher; six Aletheia subagent techne-guardians (Anansi, Janus, Moirai, Mercurius, Agora, Zeithoven) are dispatched by Anima during Aletheia-crystallisation-mode; Techne is Pleroma's atomic-skills substrate, not an agent. Audit `constitutional_agents=[anima,eros,logos,mythos,nous,psyche,sophia]` as psyche-aspect rendering material or deprecate it. Enforce `+1 = M1-5` and sweep residual `M0-witness` wording.

   Verification: `test -f 13-decision-register.md`; `grep -n "DR-M5-1\|DR-M5-2" 13-decision-register.md`.

6. **6.6 — `anuttara_trace` orphan-fill referral** *(no-orphan-fill; cross-link to Tranche 14)*

   Defer carrier-assignment to Wave-A M0 (owns Anuttara substrate). Add cross-reference entry in no-orphan audit (Tranche 14) naming `anuttara_trace(output, sensitivity, depth)` as M5-claim with M0-substrate-owner requirement, read-only contemplative-offering only. Escalate to user final-validation if Wave-A M0 does not claim.

   Verification: `grep -n anuttara_trace 14-no-orphan-audit-and-release-gates.md`.

7. **6.7 — DR-M5-1 implementation landing tranche** *(doc/contract/code-surface landing; DR-M5-1 / DR-S4-TECHNE VALIDATED)*

   Collapse `AgenticActor` to `pi` + `anima` + six Aletheia subagent techne-guardian variants. Patch Pleroma CONTRACT with the Techne atomic-skills second face. Patch S4-SPEC §14 roster to remove Techne as a seventh Aletheia member. Audit or deprecate `capability-matrix.json constitutional_agents[]` per 6.5. No `techne.md` agent profile lands.

   Verification: `grep -n 'AgenticActor' Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts` reflects the collapsed union; `grep -rn 'Aletheia 7\|Techne helper\|7th member\|techne.md' Idea/Bimba/Seeds/M/ Idea/Bimba/Seeds/S/S4/` returns no live wrong-roster attribution; Pleroma CONTRACT names VAK + Techne dual-face.

8. **6.8 — EBM-Epii position 5' resonance-vector predictor (72-dim with three tritone-symmetric squares)** *(code-pending-closure; routes to DR-MP-1, DR-MP-2; cross-link Tracks 10.M5, 19.6)*

   Land the canonical **EBM (Energy-Based Model) at position 5'/Epii** as the learned 72-dimensional resonance-vector predictor over the bimba map manifold. Per [`mental-pole-mechanics.md §1, §7`](../../M4'/mental-pole-mechanics.md): the EBM is a supervised regression learner from input-embedding to 72-vector with **mirror-consistency loss** enforcing harmonic-structural relationships across the three tritone-symmetric squares ((0,5), (1,4), (2,3) per DR-MP-2). New module at [`Body/S/S5/epii-autoresearch-core/src/resonance_ebm/`](../../../../../Body/S/S5/epii-autoresearch-core/src/resonance_ebm/) with:
   - `mod.rs` — module entry + public API
   - `model.rs` — EBM neural-network architecture (PyTorch via PyO3, OR pure Rust via `candle-core`/`burn`; DR-EBM-IMPL deferred to landing-time choice)
   - `training.rs` — supervised regression training loop with mirror-consistency loss `L = L_MSE + λ · L_mirror` where `L_mirror = Σ_squares ||resonance[sq.X] - mirror(resonance[sq.Y])||²` enforcing X+Y=5 tritone symmetry
   - `inference.rs` — forward pass producing 72-vector + energy-gradient computation `∇_{q_p} E_total = ∇_{q_p} ||target_72 - predicted_72||²`
   - `checkpoint.rs` — versioned checkpoint persistence with (corpus-version, training-config, validation-metrics) metadata
   - `kernel_invocation.rs` — element-tick invocation hook (8x per cycle, not 12x per epogdoon-tick); bioquaternion→embedding projection learned alongside the EBM

   Anti-greenfield: the M5 substrate at `Body/S/S5/epii-autoresearch-core/` already exists with `capacity_workflows.rs` + `spine.rs`. This adds the EBM-specific submodule that the six operational-capacity workflows reach into for energy scoring.

   **Operational-capacity substrate binding (per DR-MP-1 cross-reference):** the EBM consumes two canonical capacity files as training-signal sources:
   - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md) — graph-relational ML over the 72-fold harmonic field is the primary EBM training-signal source (resonance vectors derived from GDS embeddings on the bimba map's typed graph).
   - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md) — process-reward RL over codon trajectories shapes the EBM's energy landscape (trajectory rewards become resonance-vector targets for supervised regression).
   The EBM module is the *implementation* of energy scoring; these two capacity files are the *substrate context* of what gets scored. Neither file is greenfielded by this tranche — they are read as canonical spec and the EBM's training pipeline references them explicitly in `training.rs` module doc-comments.

   Verification: `cargo check -p epii-autoresearch-core --features resonance_ebm`; `cargo test -p epii-autoresearch-core resonance_ebm::mirror_consistency_loss` asserts the X+Y=5 invariance; checkpoint-roundtrip test loads/reuses a snapshot deterministically; `grep -n "resonance_ebm" Body/S/S5/epii-autoresearch-core/src/lib.rs` returns module declaration; `grep -n "parashakti-graph-relational-ml\|mahamaya-process-reward-rl" Body/S/S5/epii-autoresearch-core/src/resonance_ebm/training.rs` returns the substrate-context citations.

9. **6.9 — `pi train-ebm` + `pi export-ebm-state` CLI commands** *(code-pending-closure; routes to DR-MP-3; depends on 6.8)*

   Add two new CLI subcommands to the `epi-cli` Rust binary at [`Body/S/S0/epi-cli/src/main.rs`](../../../../../Body/S/S0/epi-cli/src/main.rs):
   - `pi train-ebm` — triggers EBM retraining over accumulated `(document, 72-vector)` training pairs in the corpus store. Manually-invoked-by-developer per the bootstrap protocol (training is a deliberate act, not background process). Outputs validation metrics + new checkpoint id.
   - `pi export-ebm-state` — snapshots current EBM weights and metadata as a versioned checkpoint (paired with corpus-snapshot for reproducibility per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md)).

   Add a corpus-management module at [`Body/S/S5/epii-autoresearch-core/src/resonance_corpus/`](../../../../../Body/S/S5/epii-autoresearch-core/src/resonance_corpus/) tracking ingested documents with their co-authored resonance-vectors per DR-MP-3 ("corpus IS canon IS training data" — same Neo4j substrate, with `targetResonanceVector: null → 72-vector` filled per node as ingestion proceeds, per minimal node-property schema in [`mental-pole-mechanics.md §2`](../../M4'/mental-pole-mechanics.md)).

   Verification: `grep -nE 'train-ebm|export-ebm-state' Body/S/S0/epi-cli/src/main.rs` returns the two subcommands; `epi pi train-ebm --dry-run` produces a training plan; `epi pi export-ebm-state ./snapshots/test/` writes a checkpoint with valid metadata; round-trip test confirms checkpoint can be reloaded into kernel runtime.

10. **6.10 — EBM kernel-runtime integration (per-element-tick invocation)** *(code-pending-closure; depends on 6.8; cross-link Tranches 10.M5, 19.7)*

    Wire the EBM into the kernel runtime at [`Body/S/S0/portal-core/src/kernel.rs`](../../../../../Body/S/S0/portal-core/src/kernel.rs) per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md): invoked **per element-tick (8x per cycle)** not per epogdoon-tick (12x per cycle) — 50% compute reduction; inter-element transitions use interpolated energy-gradients between EBM calls. Each invocation:
    1. Project bioquaternion to EBM input space (learned projection from `BioQuaternionState` to embedding)
    2. EBM forward pass produces 72-vector
    3. Compute energy `E = ||target_resonance - predicted_resonance||²` against the current coordinate's `targetResonanceVector` (read from S2 graph)
    4. Compute gradient `∇_{q_p} E` driving the Möbius descent step `q_p^{(n+1)} = q_p^{(n)} - log(9/8) · ∇E`

    Add `MathemeResonance72Projection.learned_predictor_checkpoint_ref: Option<String>` field per DR-MP-2 action; profile bus carries the active checkpoint id so renderers can label "EBM v0.3 checkpoint" or "pending: no checkpoint loaded". Fallback path when no checkpoint is loaded: zero-gradient (the kernel proceeds without EBM-driven energy descent, in bootstrap Phase 1 corpus-accumulation mode).

    Verification: `cargo check -p portal-core --features resonance_ebm_runtime`; `cargo test -p portal-core kernel::ebm_element_tick_invocation`; profile-bus field `learned_predictor_checkpoint_ref` round-trips through kernel-bridge JSON edge; bootstrap-phase-1 test asserts zero-gradient fallback when no checkpoint is present (matches phase markers in [`mental-pole-mechanics.md §10`](../../M4'/mental-pole-mechanics.md)).

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M5 substrate at two points: **T19.2** defines `M5_ContemplationObject` struct in [m5.h](Body/S/S0/epi-lib/include/m5.h) carrying the session's lived bioquaternion trajectory + tarot anchor + VAK-profile pairs + codon trace + arch-9 charge state + four-syntax compliance seeds; **T19.7** wires the close path through agentic intelligence by adding `m5_compose_contemplation_object()` inside [`m5_execute_mobius_return`](Body/S/S0/epi-lib/src/m5.c:98), then gateway dispatch `contemplate_session_close()` (T19.6) before `m4_mobius_return` consumes the LLM-composed wisdom_delta. The cycle closes through contemplation rather than bare arithmetic; the XOR carries the agents' reading. See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
