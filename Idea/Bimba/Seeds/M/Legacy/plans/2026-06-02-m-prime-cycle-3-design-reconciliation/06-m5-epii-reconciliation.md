# Track 06 — M5 Epii Reconciliation

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


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

1. **6.1 — Register `s5'.gnostic.*` over production epi-gnostic — EXPANDED to ONE substrate layer** *(code-pending-closure; gates 6.2; EXPANDED 2026-06-15 per DR-S5-ONE-1; canonical execution tranche at [`12-agentic-layer-s4-s5.md`](12-agentic-layer-s4-s5.md) Tranche 12.2 EXPANDED; comprehensive substrate plan at [`39-s5-prime-one-substrate-layer.md`](39-s5-prime-one-substrate-layer.md))*

   Per DR-S5-ONE-1 (Phase-I 2026-06-15), this tranche **EXPANDS from gateway-only registration to the full ONE-substrate scope**: gateway routes + Khora session-workspace + S0 tmux integration + Redis hierarchical keys + CLI parity, all working as one substrate (temporal + contextual + informational-conditional + logos-definitional). The execution detail lives in [`12-agentic-layer-s4-s5.md`](12-agentic-layer-s4-s5.md) Tranche 12.2 EXPANDED; the comprehensive substrate plan lives in [`39-s5-prime-one-substrate-layer.md`](39-s5-prime-one-substrate-layer.md). This tranche from M5'-side cross-references both.

   **Minimum gateway scope** (≥10 methods + `s0'.anuttara.trace`): `s5'.gnostic.{query, ingest, notebook, status, candidates, etymology, resolve, list_notebooks, episode_search, evidence_trace, query_with_layers}` + `s0'.anuttara.trace`. All routes dispatch to `Body/S/S5/epi-gnostic/epi_gnostic/{cli.py, graphiti_service.py, wrapper.py}` — **anti-greenfield: do NOT rebuild epi-gnostic.**

   **The ONE-substrate invariant** (per DR-S5-ONE-1): no gnostic operation may bypass the gateway; no gateway route may exist without a CLI command (`epi gnostic *` parity); no CLI command may write outside Khora's session authority; no session may exist without tmux-backed persistence when persistent mode is requested; no Redis cache may be flat-namespaced for gnostic-substrate keys (hierarchical `{day}/{session}/{turn}/{coordinate}/*` mandated). Cycle 3 release-gate G14 verifies these five rules.

   **Cross-track hooks:** Tranche 12.2 EXPANDED (canonical execution); Track 39 (comprehensive shape); CCT-14 EXPANSION (PASU lifecycle CLI parity); CCT-17 (compress_through_VAK orchestrator + `s0'.anuttara.trace` consumer); DR-S5-ONE-1, DR-WORLD-1, DR-COMP-1 (canonical definitions).

   Verification: `grep -n "s5'.gnostic" Body/S/S3/gateway-contract/src/lib.rs` returns ≥10 methods; `grep -n "s0'.anuttara.trace" Body/S/S3/gateway-contract/src/lib.rs` returns the route; `grep -nE "epi gnostic" Body/S/S0/epi-cli/src/gnostic.rs` returns ≥9 subcommands; `cargo check -p gateway-contract && cargo check -p gateway`; integration test `cargo test -p epi-s3-gateway s5_one_substrate_e2e_acceptance` (per Track 39 acceptance scenario) gates the PR.

2. **6.2 — Activate Atelier as etymological-cluster lens on m0-anuttara graph viewer + OmniPanel commands** *(REFRAMED 2026-06-15 per DR-LIB-ATELIER-1 + CCT-19; was: "Author `logos-atelier` Theia extension"; depends on 6.1 EXPANDED)*

   Per DR-LIB-ATELIER-1 (Phase-I 2026-06-15), the Logos Atelier is NOT a standalone Theia extension to build — it is a **projection / lensing of the inbuilt Anuttara M0-5' graph viewer where etymological clusters are visible, occurring within the filesystem + markdown editor space**. The Atelier "is just" a lens applied to the existing m0-anuttara graph viewer + commands in the OmniPanel that operate on currently-open files. This tranche is REFRAMED accordingly:

   **(a) Etymological-cluster overlay lens on m0-anuttara graph viewer.** Extend the existing `m0.anuttara.communityClockOverlay` pattern (Tranche 1.5) to cluster by `c_1_*` etymological relations. The lens renders inside the existing m0-anuttara extension widget; clusters appear as colored / proximity-grouped node clusters. Implementation: small additive view-mode in `Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` (estimated ≤80 LOC, NOT a new extension).

   **(b) OmniPanel commands for scent-following.** Add command bindings in `Body/M/epi-theia/extensions/omnipanel-shell/` that operate on currently-open files:
   - `epi-atelier scent-follow <selection>` — runs the canonical scent-following pipeline (root → cognate → drift → psychoid charge → pros-hen synthesis) over the user's text selection in the active markdown editor; writes provisional results back into the same file via Khora.
   - `epi-atelier cognate-search <selection>` — surfaces cognate cluster across vault + Bimba + Gnosis.
   - `epi-atelier psychoid-trace <selection>` — visualises the psychoid-charge surface for the selection in the m0-anuttara graph viewer lens.

   **(c) Möbius write-back as Hen-promotion candidate.** When the Atelier user accepts a scent-following result, the canonical write-back is staged as a Hen-promotion candidate (per CCT-14 entity-candidate lifecycle), NOT a direct canon write. The user reviews the candidate via the standard PASU promotion surface; Hen routes the canon-write through Anuttara verification per DR-MP-1.

   **(d) NO standalone Theia extension.** `test ! -d Body/M/epi-theia/extensions/logos-atelier` is part of the verification — explicitly no separate extension. If a minimal projection-lens package is strictly required, it's named `atelier-projection-lens` (≤200 LOC, lens-explicit naming).

   **(e) Dispatch architecture.** Atelier-mode dispatch runs through Anima into the Aletheia-crystallisation-mode (per DR-M5-1); Aletheia subagent techne-guardians (Moirai for graph-RAG distillation, Anansi for coordinate-mapping) surface as evidence lineage in the Atelier widget, NOT as peer review actors.

   **Cross-track hooks:** DR-LIB-ATELIER-1 (canonical reframe definition); CCT-19 (Library + Atelier projection canon); Tranche 1.5 (m0.anuttara.communityClockOverlay pattern Atelier extends); Tranche 6.1 EXPANDED (gateway routes Atelier consumes: `s5'.gnostic.etymology`, `s5'.gnostic.candidates`); CCT-14 (Möbius write-back routes through entity-candidate lifecycle); DR-MP-1 (Anuttara verification gate before canon promotion).

   Verification: `test ! -d Body/M/epi-theia/extensions/logos-atelier` (no standalone extension created); `grep -nE "etymological-cluster|atelier-projection-lens" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` returns the lens additions; `grep -nE "epi-atelier scent-follow|epi-atelier cognate-search|epi-atelier psychoid-trace" Body/M/epi-theia/extensions/omnipanel-shell/` returns the command bindings; integration test: a user selects text in an open markdown file, runs `epi-atelier scent-follow`, sees the etymological-cluster lens render in the m0-anuttara graph viewer, and accepts the Möbius write-back which stages as a Hen-promotion candidate (visible via `epi gnostic candidates`).

2b. **6.2b — Activate Library as Theia IDE projection: coordinate-overlay file-tree + OmniPanel Library tab + breadcrumb header** *(NEW 2026-06-15 per DR-LIB-ATELIER-1 + CCT-19; depends on 6.1 EXPANDED)*

   Per DR-LIB-ATELIER-1, the M5-0' Library is NOT a standalone Theia extension — it is **the vault filesystem itself, organised by the M-coordinate map**. This tranche activates the Library projection across three small surfaces:

   **(a) Coordinate-overlay lens on Theia file-tree.** Files appear organised by their M-coordinate ancestry (resolved from `coordinate:` frontmatter key). Implementation: small extension to existing `body-lite-surface` (or new minimal `library-projection-lens` package, ≤200 LOC, lens-explicit naming). Lens MODE is toggle-able — user can switch between filesystem-tree view and coordinate-organised view.

   **(b) OmniPanel "Library" tab.** Queries `s5'.gnostic.list_notebooks(coord_filter)` (per Tranche 6.1 EXPANDED) and renders the coordinate-organised view inline in the OmniPanel. Each entry resolves to the corresponding vault file on click (jumps to the file in the markdown editor).

   **(c) Markdown-editor coordinate-breadcrumb header.** Every open file shows its coordinate ancestry as a breadcrumb at the top of the editor (e.g., `M > M5 > M5-1 > integration-template.md`). Implementation: small Theia editor decoration via the existing markdown-editor extension contribution point.

   **(d) NO standalone Theia extension.** Like the Atelier (Tranche 6.2), the Library is a projection. `test ! -d Body/M/epi-theia/extensions/library-surface` is part of the verification.

   **Cross-track hooks:** DR-LIB-ATELIER-1 (canonical reframe definition); CCT-19 (Library + Atelier projection canon); Tranche 6.1 EXPANDED (`s5'.gnostic.list_notebooks` powers the Library tab); Track 11 (Theia shell hosting; Library/Atelier projections referenced in widget-ownership trace per Tranche 11.3).

   Verification: `test ! -d Body/M/epi-theia/extensions/library-surface`; `grep -nE "coordinate-overlay|library-projection-lens" Body/M/epi-theia/extensions/body-lite-surface/` returns the lens additions; `grep -nE "pratibimba.daily.library\|OmniPanel Library tab\|library-tab" Body/M/epi-theia/extensions/omnipanel-shell/` returns the tab registration; `grep -nE "coordinate-breadcrumb|coordinate.*ancestry" Body/M/epi-theia/extensions/` returns the editor decoration; integration test: opening a file at `Idea/Bimba/Seeds/M/M5'/integration-template.md` displays the breadcrumb `M > M5' > integration-template.md` in the editor header, and the OmniPanel Library tab lists the file under its coordinate ancestry.

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

   **LANDED 2026-07-16:** DR-M5-1 now records the active-carrier disposition: deprecated empty `constitutional_agents`, Pi/Anima plus six Aletheia-mode guardian dispatch targets (`actor: 'aletheia'` + `techneClass`), and non-dispatch Psyche aspect registers. DR-M5-2 records the completed [[M1-5]] `+1` sweep. [[M5-ARCHITECTURE]] no longer presents the former seven-name matrix array or frozen ACR package as current runtime.

   Verification: `python3 -m pytest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/omni/omnipanelCapabilities.test.ts src/panes/omni/omnipanelCapabilities.live.test.ts src/engine/compositionMatheme.test.ts src/panes/KleinTopologyPane.test.tsx`; `rg -n "M0.*witness-axis|M0 Anuttara witness" Idea/Bimba/Seeds/M -g '*.md' -g '!**/Legacy/**' -g '!**/plans/**'` returns no live-attribution matches.

6. **6.6 — `anuttara_trace` orphan-fill referral** *(no-orphan-fill; cross-link to Tranche 14)*

   Defer carrier-assignment to Wave-A M0 (owns Anuttara substrate). Add cross-reference entry in no-orphan audit (Tranche 14) naming `anuttara_trace(output, sensitivity, depth)` as M5-claim with M0-substrate-owner requirement, read-only contemplative-offering only. Escalate to user final-validation if Wave-A M0 does not claim.

   **CLOSED / REVERIFIED 2026-07-16:** [[M0-ARCHITECTURE]] and [[M0'-SPEC]] establish the [[M0]] / [[S2]] graph-language substrate ownership. Tranche 14 records the M5 claim against that owner, constrains the offering to read-only contemplation, routes any M0 substrate mutation through [[DR-M0-1]], and explicitly forbids a separate `anuttara_trace` carrier. The Wave-A M0 claim is therefore satisfied; no user escalation or implementation fill remains.

   Verification: `node -e "const fs=require('fs');const s=fs.readFileSync('Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/14-no-orphan-audit-and-release-gates.md','utf8');const row=s.split('\\n').find(l=>l.includes('anuttara_trace(output, sensitivity, depth)'));const required=['M5-claimed','M0-substrate-owner requirement','read-only contemplative-offering only','governed routed-write per DR-M0-1','no separate carrier lands','CLOSED / REVERIFIED 2026-07-16'];if(!row||required.some(x=>!row.includes(x))){console.error(row||'missing anuttara_trace row');process.exit(1)}"`; `node .codex/scripts/lint-test-honesty.mjs`.

7. **6.7 — DR-M5-1 implementation landing tranche** *(doc/contract/code-surface landing; DR-M5-1 / DR-S4-TECHNE VALIDATED)*

   Collapse `AgenticActor` to `pi` + `anima` + six Aletheia subagent techne-guardian variants. Patch Pleroma CONTRACT with the Techne atomic-skills second face. Patch S4-SPEC §14 roster to remove Techne as a seventh Aletheia member. Audit or deprecate `capability-matrix.json constitutional_agents[]` per 6.5. No `Techne-profile file` agent profile lands.

   **LANDED / REVERIFIED 2026-07-16:** the active [[OmniPanel]] carrier projects Pi, Anima, and six `actor: 'aletheia'` targets discriminated by `techneClass`; the Pleroma matrix's `constitutional_agents` array is empty and deprecated; [[S4-SPEC]] records the Psyche registers as non-dispatch authorial facets; and Pleroma's contract defines Techne as its atomic-skills face, never an agent profile. The bounded primitive contract was also reconciled to the eight-entry production registry.

   Verification: `python3 -m pytest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/omni/omnipanelCapabilities.test.ts src/panes/omni/omnipanelCapabilities.live.test.ts src/panes/m5ReviewGate.test.ts`; `node --test Body/S/S4/ta-onta/S4-2p-pleroma/tests/terminal_tools.test.ts`; `node .codex/scripts/lint-test-honesty.mjs`.

8. **6.8 — EBM-Epii position 5' resonance-vector predictor module (72-dim N-channel head, Rust-native)** *(code-pending-closure; routes to DR-MP-1, DR-MP-2; cross-link Tracks 10.M5, 19.6; Stream C of [[33-harmonic-energy-channel-handoff]] §2.3 — module/runtime surface)*

   Land the canonical **EBM at position 5'/Epii** as the learned 72-dimensional resonance-vector predictor over the multi-channel harmonic substrate. Per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) (post-Thread-A N-channel rewrite per handoff §1.2 — **NOW LANDED**): the EBM reads the full `MathemeHarmonicProfile` N-channel substrate (already in code at [`portal-core/src/kernel.rs:346-388`](../../../../../Body/S/S0/portal-core/src/kernel.rs) — `lens_resonance_72` + `audio_octet[8]` + `nodal_quartet[4]` + `planetary_chakral` + `mahamaya` + `codon_rotation_projection` + `q_cosmic`), produces a 72-dim resonance vector via tritone-symmetric three-sub-head, and supplies the scalar that feeds `e_5_harmonic_energy` in `kernel_energy_evaluate` (Tranche 6.11).

   **Scope-split with Tranche 12.24 Phase 2 (per handoff §2.3 coordination requirement):**
   - **This tranche (6.8) owns the module / runtime-integration surface** — the `resonance_ebm/` Rust crate-module, its public API, the kernel-runtime invocation hook, the checkpoint-load path, the bioquaternion→embedding projection layer.
   - **Tranche 12.24 Phase 2 in [`12-agentic-layer-s4-s5.md`](12-agentic-layer-s4-s5.md) owns the skill / training-pipeline surface** — the `Body/S/S5/epii-autoresearch-core/skills/parashakti/ebm-head/` Pleroma-Techne skill, `scripts/train.rs`, `scripts/eval.rs`, `scripts/serve.rs`, corpus-assembly, λ-config-loading, `pi train-ebm` / `pi export-ebm-state` CLI delivery.
   - Both tranches reference the same canonical architecture decisions (see below) — no duplication. 12.24 Phase 2 delivers the trained checkpoint; 6.8 delivers the runtime module that loads + invokes it. Cross-reference is enforced from both sides.

   **Module residency:** [`Body/S/S5/epii-autoresearch-core/src/resonance_ebm/`](../../../../../Body/S/S5/epii-autoresearch-core/src/resonance_ebm/):
   - `mod.rs` — module entry + public API exposed to `capacity_workflows.rs` and `kernel_energy_evaluate`
   - `model.rs` — **Rust-native EBM architecture** via `burn` or `candle` (per locked decision; see below). PyO3+PyTorch only as documented fallback per `DR-EBM-IMPL` at decision-point, not preemptively. Implements the N-channel architecture shape: parallel channel encoders → cross-channel attention → tritone-symmetric three-sub-head → sigmoid-normalised 72-output projection.
   - `channels.rs` — per-channel encoder definitions reading from `MathemeHarmonicProfile` fields. Encoder widths and latent dims from config.
   - `attention.rs` — cross-channel attention surface. **Specific attention pattern (full vs gated fusion vs hierarchical) is the system's self-experimentation degree of freedom; the module exposes a swappable trait-object so Mercurius-Elo can rate variants. NOT pinned in this tranche.**
   - `inference.rs` — forward pass producing 72-vector + energy-scalar computation. The scalar feeds `e_5_harmonic_energy` in `kernel_energy_evaluate` (Tranche 6.11 consumption point).
   - `gradient.rs` — autograd-through-EBM surface consumed by Stream D's Riemannian gradient pipeline (Tranche 6.10 expansion). The Rust-native framework's autograd is the load-bearing requirement — `∇E_5` is computed by `burn`/`candle` autograd on this module's forward pass.
   - `checkpoint.rs` — versioned checkpoint load/persist (paired with corpus-snapshot for reproducibility); checkpoint format authored by Tranche 12.24 Phase 2's `serve.py` equivalent (Rust-native `serve.rs`).
   - `kernel_invocation.rs` — element-tick invocation hook (8x per cycle, not 12x per epogdoon-tick — per [`mental-pole-mechanics.md §7 line 436`](../../M4'/mental-pole-mechanics.md)); bioquaternion→embedding projection learned alongside the EBM head.
   - `mirror_loss.rs` — mirror-consistency invariant assertion surface used by tests; the loss is computed during training (Tranche 12.24 Phase 2) but the X+Y=5 tritone-symmetric invariant is asserted at inference-time as a sanity check.

   **Canonical architecture decisions (shared with 12.24 Phase 2, locked per [[33-harmonic-energy-channel-handoff]] frontmatter `dev_decisions`):**
   - **Rust-native default** (`burn` or `candle`). PyO3+PyTorch fallback only on documented `DR-EBM-IMPL`. Locked.
   - **N-channel architecture shape:** parallel channel encoders → cross-channel attention → tritone-symmetric three-sub-head → sigmoid-normalised 72-vector output. Locked.
   - **Cross-channel attention pattern: system-experimentation degree of freedom. NOT pinned.** This tranche's `attention.rs` exposes a swappable surface; the system learns its own best fusion topology via Mercurius-Elo across architecture variants (Track 12.20 / Stream G rating infrastructure consumes the variant-id from checkpoint metadata).
   - **All hyperparameters from `~/.epi-logos/config.toml` `[ml.parashakti_ebm_head]` section.** No hardcoded latent dims, attention widths, channel-encoder shapes, or loss-weight values in tranche scope or implementation.
   - **Channel-set canonical**: the seven `MathemeHarmonicProfile` channels listed above. Channel-set membership IS the architectural commitment; specific cross-channel attention is the experimentation surface.

   Anti-greenfield: the M5 substrate at `Body/S/S5/epii-autoresearch-core/` already exists with `capacity_workflows.rs` + `spine.rs`. This adds the EBM-specific submodule that the six operational-capacity workflows reach into for energy scoring. The N-channel substrate (`MathemeHarmonicProfile`) is already in `kernel.rs` — this tranche does not introduce it.

   **Dependencies:**
   - **Thread A canon amendments (NOW LANDED):** [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) Rust-native + N-channel rewrite per handoff §1.2. These define the module shape this tranche implements.
   - **Tranche 12.24 Phase 2 (Stream C skill surface):** delivers the trained checkpoint and training pipeline. This tranche delivers the runtime module that loads + invokes it. Parallel execution; cross-reference required from both sides.
   - **Stream E (Track 34 — S0 settings + Gemini Embedding 2 accessor):** **BLOCKING for the training pipeline operated via 12.24 Phase 2.** 6.8 may scaffold the runtime module without Stream E, but the module cannot load a usable checkpoint until Stream E enables training. Stub-zero behaviour (no checkpoint loaded → zero-gradient fallback per existing Tranche 6.10 spec) covers the gap.
   - **Stream D (Tranche 6.10 expansion):** consumes `gradient.rs` autograd surface defined here; 6.8 lands the autograd-amenable forward pass, 6.10 lands the Riemannian-projection wrapper.

   **Operational-capacity substrate binding (per DR-MP-1 cross-reference):** the EBM consumes two canonical capacity files as training-signal sources:
   - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md) — graph-relational ML over the 72-fold harmonic field is the primary EBM training-signal source (resonance vectors derived from GDS embeddings on the bimba map's typed graph).
   - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md) — process-reward RL over codon trajectories shapes the EBM's energy landscape (trajectory rewards become resonance-vector targets for supervised regression).
   The EBM module is the *implementation* of energy scoring; these two capacity files are the *substrate context* of what gets scored. Neither file is greenfielded by this tranche — they are read as canonical spec and the EBM's training pipeline references them explicitly in `training.rs` module doc-comments.

   **LANDED / REVERIFIED 2026-07-16:** `resonance_ebm` is a feature-gated [[S5-4']] runtime module backed by Candle tensors. It consumes all seven ordered harmonic-profile channels, loads architecture- and channel-validated checkpoints, applies checkpoint weights including the learned bioquaternion projection, emits the tritone-paired sigmoid 72-vector plus E5 scalar, and computes `q_p` derivatives through Candle backpropagation. The no-checkpoint path remains an explicit zero-score/zero-gradient fallback and never fabricates learned output.

   Verification: `cargo check --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm --test resonance_ebm_runtime`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm resonance_ebm::mirror_consistency_loss`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm --test anuttara_pentadic_feature`; `node .codex/scripts/lint-test-honesty.mjs`.

9. **6.9 — `pi train-ebm` + `pi export-ebm-state` CLI commands** *(code-pending-closure; routes to DR-MP-3; depends on 6.8)*

   Add two new CLI subcommands to the `epi-cli` Rust binary at [`Body/S/S0/epi-cli/src/main.rs`](../../../../../Body/S/S0/epi-cli/src/main.rs):
   - `pi train-ebm` — triggers EBM retraining over accumulated `(document, 72-vector)` training pairs in the corpus store. Manually-invoked-by-developer per the bootstrap protocol (training is a deliberate act, not background process). Outputs validation metrics + new checkpoint id.
   - `pi export-ebm-state` — snapshots current EBM weights and metadata as a versioned checkpoint (paired with corpus-snapshot for reproducibility per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md)).

   Add a corpus-management module at [`Body/S/S5/epii-autoresearch-core/src/resonance_corpus/`](../../../../../Body/S/S5/epii-autoresearch-core/src/resonance_corpus/) tracking ingested documents with their co-authored resonance-vectors per DR-MP-3 ("corpus IS canon IS training data" — same Neo4j substrate, with `targetResonanceVector: null → 72-vector` filled per node as ingestion proceeds, per minimal node-property schema in [`mental-pole-mechanics.md §2`](../../M4'/mental-pole-mechanics.md)).

   **LANDED / REVERIFIED 2026-07-16:** the [[S0]] `epi pi` membrane exposes deliberate `train-ebm` and `export-ebm-state` commands over the [[S5-4']] resonance-corpus owner. Dry-run returns a non-mutating plan; non-dry training consumes real persisted corpus pairs and writes metrics plus a trained checkpoint; export writes checkpoint, metadata, and the paired corpus snapshot. A trained export preserves the exact recorded weights and training-time snapshot rather than silently re-fitting against a later corpus; a no-checkpoint store alone authors the declared bootstrap-untrained export. Corpus authoring and runtime loading share the Candle architecture identifier, and spawned-binary tests require both trained and bootstrap artifacts to load and execute in the position-5' runtime.

   Verification: `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test pi_ebm_commands`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm exported_checkpoint_round_trips_into_resonance_ebm_runtime --lib`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml resonance_corpus --features resonance_ebm`; `node .codex/scripts/lint-test-honesty.mjs`.

10. **6.10 — EBM kernel-runtime integration + Möbius descent step (Riemannian-quaternion gradient pipeline, per-element-tick invocation)** *(code-pending-closure; depends on 6.8, 6.11, Streams C / F; cross-link Tranches 10.M5, 19.7; Stream D of [[33-harmonic-energy-channel-handoff]] §2.4)*

    Wire the EBM into the kernel runtime at [`Body/S/S0/portal-core/src/kernel.rs`](../../../../../Body/S/S0/portal-core/src/kernel.rs) AND land the canonical **Möbius descent step** as the Riemannian-quaternion gradient pipeline specified in [`mental-pole-mechanics.md §7.5`](../../M4'/mental-pole-mechanics.md) (the new subsection landed by Thread A per handoff §1.2 — **NOW LANDED**; it IS the spec this tranche implements). Per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md), invocation is **per element-tick (8x per cycle)** not per epogdoon-tick (12x per cycle) — 50% compute reduction; inter-element transitions interpolate energy-gradients between EBM calls.

    **A. Per-invocation runtime flow (EBM forward + descent step):**
    1. Project bioquaternion to EBM input space (learned projection from `BioQuaternionState` to embedding).
    2. EBM forward pass produces 72-vector (energy-scalar feeds `e_5_harmonic_energy` per Tranche 6.11).
    3. Compute per-channel energy scalars via `kernel_energy_evaluate` (Tranche 6.11 signature) → `EnergyDecomposition { e_4_personal_energy, e_5_harmonic_energy, e_6_verifier_energy, .. }`.
    4. Compute Riemannian-projected gradient `∇_M E_total` via `kernel_energy_gradient` (this tranche).
    5. Apply Möbius descent step `q_p^(n+1) = renormalize(q_p − log(9/8) · ∇_M E_total)` via `kernel_mobius_descent_step` (this tranche).

    **B. `kernel_energy_gradient(state, e_4_inputs, e_5_inputs, e_6_inputs) → [f32; 4]` — per-channel gradient sources + weighted combination + manifold projection:**
    - **`∇E_4`:** autograd through Rust-native Nara-LoRA forward pass (Stream F — `05-m4-nara-reconciliation.md`). E_4 is a scalar function of LoRA-adapted output evaluated against PASU substrate; the forward pass is differentiable end-to-end. Consumes the autograd-amenable surface exported by Stream F.
    - **`∇E_5`:** autograd through Rust-native N-channel EBM head + the learned bioquaternion→embedding projection layer (Stream C — Tranches 6.8 + 12.24 Phase 2). Both are differentiable by construction; `gradient.rs` per Tranche 6.8 is the load-bearing autograd surface.
    - **`∇E_6`:** discrete (Cypher invariant pass/fail) — NOT naturally differentiable. **Soft surrogate:** scalar count of violated invariants weighted by severity, divided by total invariants checked. **Severity weights from `~/.epi-logos/config.toml` `[anuttara.r_virtue]` — no hardcoded numbers.** REINFORCE-style estimator may be substituted for high-noise regimes; surrogate choice recorded in the per-tick provenance emitted into the profile bus.
    - **Weighted combination (canonical 4:5:6):**
      ```
      ∇E_total = (4·∇E_4 + 5·∇E_5 + 6·∇E_6) / 15
      ```
    - **Manifold projection (tangent-space at q_p):**
      ```
      ∇_M E_total = ∇E_total − ⟨∇E_total, q_p⟩ · q_p
      ```
      Subtract the radial component (projection onto q_p) to land in the tangent space of S^3 at q_p. Standard Euclidean backprop violates the `|q_p| = 1` constraint; manifold projection is non-optional, specced in §7.5, **non-substitutable** (decision locked: Riemannian-quaternion with manifold projection per handoff frontmatter `dev_decisions`).

    **C. `kernel_mobius_descent_step(state) → BioQuaternionState` — update + renormalize:**
    - `q_p_raw = q_p − log(9/8) · ∇_M E_total`
    - `q_p^(n+1) = q_p_raw / |q_p_raw|`
    - Renormalization enforces `|q_p^(n+1)| = 1`. Step-size `log(9/8)` is the **epogdoon** — non-tunable, structurally inherited from the kernel matheme per [`epi-logos-kernel-spec`](../../epi-logos-kernel-spec.md) §3 + §7. No config knob.

    **D. Invocation cadence + inter-element interpolation:** wire into `KernelProjection` at per-element-tick (8x per cycle per `mental-pole-mechanics §7 line 436`). Between element-ticks the kernel interpolates gradients (no fresh EBM forward / no fresh descent step) to keep the 12-tick epogdoon-clock coherent. Tick parity: 8 descent steps per 12-tick cycle.

    **E. Inverse-Möbius at Element VII (q_b descent):** per [`epi-logos-kernel-spec`](../../epi-logos-kernel-spec.md) §7 line 326, Element VII fires the **inverse-Möbius step on q_b** (bimba pole) using the same Riemannian pattern: identical gradient pipeline against q_b's tangent space, identical step-size `log(9/8)` (sign-inverted), identical renormalize-to-unit-quaternion law. Single shared `kernel_riemannian_step(q, grad)` helper serves both poles; q_p (mental) gets standard direction, q_b (bimba) gets inverted direction at Element VII.

    **F. Checkpoint + provenance surfacing:** retain `MathemeResonance72Projection.learned_predictor_checkpoint_ref: Option<String>` field per DR-MP-2 action; profile bus carries active checkpoint id so renderers can label "EBM v0.3 checkpoint" or "pending: no checkpoint loaded". **Bootstrap fallback path when no checkpoint is loaded:** zero-gradient — the kernel proceeds without EBM-driven energy descent, in bootstrap Phase 1 corpus-accumulation mode (matches `total_energy = 0.0` stub-zero criterion in Tranche 6.11). E_6 surrogate path and Nara-LoRA path observe the same zero-gradient fallback semantics when their checkpoints / inputs are unavailable.

    **G. Test contract (per [`mental-pole-mechanics.md §7.5`](../../M4'/mental-pole-mechanics.md)):**
    - **Synthetic q_b/q_p pairs with known optimum:** descent must reach within tolerance ε after K steps for documented (ε, K) read from `~/.epi-logos/config.toml` `[kernel.descent_test]` — no hardcoded ε / K.
    - **Manifold preservation:** `|q_p^(n)|` must equal `1 ± numerical-precision-floor` at every step; assert across the synthetic test trajectory.
    - **Weight invariance:** the 4:5:6 sum from `kernel_energy_gradient` must match `(4·E_4 + 5·E_5 + 6·E_6) / 15` recomputed independently against `kernel_energy_evaluate` outputs.
    - **Gradient sanity:** for `E_total = const`, `∇E_total = 0` and the descent update is identity.
    - **Discrete-surrogate behaviour:** zero invariants violated → `∇E_6 = 0`; monotone increase in violations → monotone increase in `‖∇E_6‖`.
    - **Inverse-Möbius parity:** q_b inverse-step at Element VII preserves `|q_b| = 1` and applies opposite descent direction; assert via paired synthetic q_b/q_p trajectory.
    - **Cadence assertion:** within one 12-tick epogdoon cycle, exactly 8 descent steps fire; inter-element ticks interpolate without re-invoking EBM.

    **Dependencies (the chain that gates this tranche's execution):**
    - **Thread A canon amendment — [`mental-pole-mechanics`](../../M4'/mental-pole-mechanics.md) §7.5 new subsection per handoff §1.2: NOW LANDED.** §7.5 IS the spec this tranche implements; no further canon work required.
    - **Stream B — Tranche 6.11 (`kernel.rs` total_energy formula + E_4 parameter restructure): MUST land first.** The `EnergyDecomposition` struct + `kernel_energy_evaluate` signature defined in 6.11 are the consumption shape this tranche autograds through. Captured in NEW Tranche 6.11 by Thread C.
    - **Stream C — Tranches 6.8 + 12.24 Phase 2 (N-channel EBM autograd surface): MUST land first.** `∇E_5` is computed by `burn`/`candle` autograd on Stream C's `gradient.rs` module. Captured in Tranche 6.8 + 12.24 Phase 2 by Thread D.
    - **Stream F — Tranche in [`05-m4-nara-reconciliation.md`](05-m4-nara-reconciliation.md) (Nara-LoRA autograd surface): MUST land first.** `∇E_4` is computed by autograd through Stream F's Nara-LoRA forward pass. Captured in Tranche 5.22 by Thread G.
    - **Streams B + C + F all land before this tranche executes.** Until then, stub-zero gradient fallback (zero-gradient descent → identity update) is the documented bootstrap mode per Tranche 6.11.

    **Decisions already locked (cite [[33-harmonic-energy-channel-handoff]] frontmatter `dev_decisions` — non-negotiable):**
    - Gradient technique: **Riemannian-quaternion with manifold projection.** No alternative technique (Euclidean unprojected, projected-gradient-with-constraint-Lagrangian, exponential-map-retraction, etc.) is in scope. Re-debate is out of scope for this tranche.
    - Step-size `log(9/8)` (epogdoon): non-tunable, structurally inherited.
    - 4:5:6 just-triad weighting: canonical, non-tunable.
    - All thresholds (ε, K, severity weights, surrogate choice, retry counts) from `~/.epi-logos/config.toml`: no hardcoded values in `kernel.rs`.

    Verification: `cargo check -p portal-core --features resonance_ebm_runtime`; `cargo test -p portal-core kernel::ebm_element_tick_invocation`; `cargo test -p portal-core kernel::mobius_descent_step_manifold_preservation` (asserts `|q_p| = 1` invariant across trajectory); `cargo test -p portal-core kernel::riemannian_gradient_tangent_projection` (asserts radial component zero post-projection); `cargo test -p portal-core kernel::weighted_4_5_6_gradient_invariance`; `cargo test -p portal-core kernel::inverse_mobius_element_vii_parity`; `cargo test -p portal-core kernel::element_tick_cadence_8_per_cycle`; profile-bus field `learned_predictor_checkpoint_ref` round-trips through kernel-bridge JSON edge; bootstrap-phase-1 test asserts zero-gradient fallback when no checkpoint is present (matches phase markers in [`mental-pole-mechanics.md §10`](../../M4'/mental-pole-mechanics.md)); `gitnexus_impact({target: "kernel_energy_gradient", direction: "upstream"})` + `gitnexus_impact({target: "kernel_mobius_descent_step", direction: "upstream"})` run at execution time to confirm impact map before edit.

11. **6.11 — `kernel.rs` total_energy formula + E_4 parameter restructure (canonical 4:5:6 weighting)** *(code-pending-closure; depends on Thread A canon amendments per [[33-harmonic-energy-channel-handoff]] §1.1 + §1.2 — LANDED; cross-link Tranches 6.8 / 6.10, Stream C, Stream F)*

    Land the formal restructure of [`Body/S/S0/portal-core/src/kernel.rs`](../../../../../Body/S/S0/portal-core/src/kernel.rs) `EnergyDecomposition` + `kernel_energy_evaluate` to align with the canonical kernel matheme per [[33-harmonic-energy-channel-handoff]] §2.2. Current `kernel_energy_evaluate` at `kernel.rs:1209-1237` uses a plain sum (`total = bimba_pratibimba + lens + r`) and is **missing E_4 entirely** — neither the 4:5:6 just-triad weighting nor the personal-resonance term is represented. Per locked decisions (handoff frontmatter `dev_decisions`): **E_4 = personal/Nara substrate** (PASU + kairos + Nara-LoRA), **E_5 = multi-channel harmonic substrate** (MathemeHarmonicProfile N-channel EBM), **E_6 = Anuttara R-virtue verifier** (unchanged). The 4:5:6 architecture is canonical.

    **Scope:**
    - Extend `EnergyDecomposition` struct at `kernel.rs:106-111` with fields `e_4_personal_energy: f32`, `e_5_harmonic_energy: f32`, `e_6_verifier_energy: f32`. **Preserve** `bimba_pratibimba_energy: f32` as a **diagnostic-only field** (NOT summed into `total_energy`); the bimba-pratibimba distance retains operational meaning as a quaternion-state observability signal even though it is not a weighted energy term in the canonical matheme.
    - Introduce three new input structs co-located with `EnergyDecomposition`:
      - `E4PersonalInputs` — Nara substrate handle (PASU snapshot + live kairotic state + Nara-LoRA checkpoint reference); shape owned by Stream F (Tranche 5.x in [`05-m4-nara-reconciliation.md`](05-m4-nara-reconciliation.md)).
      - `E5HarmonicInputs` — MathemeHarmonicProfile channel-set (lens_resonance_72 + audio_octet[8] + nodal_quartet[4] + planetary_chakral + mahamaya + codon_rotation_projection + q_cosmic); shape owned by Stream C (Tranches 6.8 + 12.24 Phase 2).
      - `E6VerifierInputs` — invariant-set + severity weights handle for the Anuttara R-virtue verifier; soft-surrogate scalar per [[mental-pole-mechanics]] §7.5 (severity weights from `~/.epi-logos/config.toml`, no hardcoded values).
    - Change `kernel_energy_evaluate` signature at `kernel.rs:1209-1214` to take `(&BioQuaternionState, &E4PersonalInputs, &E5HarmonicInputs, &E6VerifierInputs)` and return the extended `EnergyDecomposition`. Per-channel scalar computation; **stub-zero behaviour acceptable for initial landing** — `e_4 = 0.0`, `e_5 = 0.0`, `e_6 = 0.0` until Streams C, F, and the E_6 surrogate path land their forward passes. This unblocks the type/signature scaffold without waiting for downstream channel content.
    - Compute `total_energy` per canonical weighting: `total_energy: (4.0 * e_4_personal_energy + 5.0 * e_5_harmonic_energy + 6.0 * e_6_verifier_energy) / 15.0`. The denominator `15 = 4 + 5 + 6` keeps `total_energy` in the same numeric range as the individual terms.
    - Retain `bimba_pratibimba_energy = quat_distance_sq(state.q_b, state.q_p)` as a diagnostic computation inside `kernel_energy_evaluate`; emit it into the struct but **do not sum it into `total_energy`**.
    - Update direct caller `KernelProjection::from_clock_state` at `kernel.rs:161-184` to take and forward the three new input handles. Caller signature change is breaking; update call-sites accordingly.
    - Update `KernelTemporalEnergy::from_energy` at `kernel.rs:1088-1094` to serialize all four energy fields (`e_4`, `e_5`, `e_6`, plus `bimba_pratibimba` as diagnostic) into the profile-bus payload so renderers and KernelTemporalProjection consumers see the full decomposition.

    **gitnexus impact assessment (per [[33-harmonic-energy-channel-handoff]] §2.2):** ~30 transitive upstream callers reach `kernel_energy_evaluate` through the call graph, but only **1 is a direct caller** (the same-file `KernelProjection::from_clock_state`). All transitive callers route through `KernelTemporalProjection::from_kernel_projection` and do NOT re-pass the changed arguments — they consume the resulting `EnergyDecomposition` struct opaquely. Risk acceptable; the signature change is contained to one direct call-site. MUST still run `gitnexus_impact({target: "kernel_energy_evaluate", direction: "upstream"})` at execution time to confirm the impact map matches this assessment (per project gitnexus discipline).

    **Stub-zero acceptance criterion:** with `e_4 = e_5 = e_6 = 0.0` and only `bimba_pratibimba_energy` carrying signal, `total_energy = 0.0` and the kernel still ticks coherently — bootstrap Phase 1 behaviour, no descent driven by missing channels. Tranche 6.10 EBM-runtime-integration MUST be updated in parallel so its energy computation flows into `e_5_harmonic_energy` rather than the now-diagnostic `lens_energy` field path; mark the rename in the 6.11 implementation.

    **Dependencies:**
    - **Thread A canon amendments (LANDED):** [[epi-logos-kernel-spec]] §3 (per handoff §1.1) + [[mental-pole-mechanics]] §5 / §7 / new §7.5 (per handoff §1.2). These define E_4/E_5/E_6 semantics + Riemannian-quaternion gradient pipeline. **NOW LANDED** per Thread A's execution; this tranche may proceed.
    - **Stream C (Tranches 6.8 + 12.24 Phase 2):** N-channel EBM forward pass producing the scalar that feeds `e_5_harmonic_energy`. **Stub-zero acceptable until Stream C lands.**
    - **Stream F (Tranche in [`05-m4-nara-reconciliation.md`](05-m4-nara-reconciliation.md)):** Nara-LoRA forward pass producing the scalar that feeds `e_4_personal_energy`. **Stub-zero acceptable until Stream F lands.**
    - **Stream D (Tranche 6.10 expansion):** Riemannian gradient `kernel_energy_gradient` consumes the same three input structs; the signature defined here is the consumption shape Stream D will autograd through. 6.11 lands the struct surface; 6.10 (post-expansion) lands the gradient computation.

    **Decisions already locked (cite [[33-harmonic-energy-channel-handoff]] frontmatter `dev_decisions`):**
    - E_4 personal-substrate definition: locked. No re-debate.
    - E_5 N-channel harmonic-substrate definition: locked.
    - E_6 R-virtue refusal-authority: unchanged from prior canon.
    - 4:5:6 just-triad weighting: canonical, non-tunable.
    - Bimba-pratibimba distance retained as diagnostic only: per handoff §2.2.
    - All thresholds from `~/.epi-logos/config.toml`: no hardcoded values in `kernel.rs` constants.

    Verification: `cargo check -p portal-core` with extended `EnergyDecomposition`; `cargo test -p portal-core kernel::total_energy_4_5_6_weighting` asserts the weighted-sum invariant for synthetic (e_4, e_5, e_6) triples; `cargo test -p portal-core kernel::bimba_pratibimba_is_diagnostic_only` asserts `total_energy` excludes the diagnostic field; `gitnexus_detect_changes({scope: "staged"})` post-edit confirms the change radius matches the direct-caller-only assessment; profile-bus round-trip test asserts all four energy fields serialize through `KernelTemporalEnergy::from_energy`; stub-zero coherence test confirms `total_energy = 0.0` and kernel tick still proceeds when all three input structs supply zero-valued channels.

12. **6.12 — Wisdom curation loop: Epii M5'-self-referential autoresearch + ML at M5-4' + VAK-gated pair-development surface** *(spec-ahead-integration → code-pending-closure; depends on CCT-16, DR-S1-6, DR-M4-4, Tranches 5.23, 12.26; cross-link Track 19 contemplation RPC, Track 33 §2.x Streams A–G, DR-MP-1/2/3, DR-M5-1, CCT-14)*

    Land the operative kernel of the q_ wisdom-curation economy: the intelligent (NOT automated) maintenance loop that keeps every Bimba node's quintessential articulation (per Tranche 5.23 vocabulary) alive, accurate, and refined as the system itself evolves. The loop is M5'-Epii reading its own crystallised bimba-map corpus (the canonical autoresearch self-improvement loop per [`m5-prime-epii-on-epii-self-referential-capacity.md`](../../M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md)), producing a queue of q_-refresh CANDIDATES that user+agent pair-develop into Sophia-disclosure-shaped proposals (per Tranche 12.26), routed through M0 Anuttara pure-Cypher verification (per DR-MP-1 — Anuttara is the Verifier in the 4'-5'-0' LLM/EBM/Verifier triplet), Hen-promoted to canon (per CCT-14), and distributed via the canon CLI (per Tranche 9.13). Four sub-mechanisms compose the loop:

    **(i) Epii M5'-self-referential read** — *consume as-is* the spec at [`m5-prime-epii-on-epii-self-referential-capacity.md §3.3`](../../M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md) (crystallisation step canonical text); *extend* implementation at [`Body/S/S5/epii-autoresearch-core/src/`](../../../../../Body/S/S5/epii-autoresearch-core/src/) with `epii_self_referential_read(corpus_snapshot, last_review_epoch) → QReviewQueue` fired on night' pass via Chronos (`cron_evening` per Track 19 / [`M5-ARCHITECTURE.md:213`](../../M5'/M5-ARCHITECTURE.md)). Input: the crystallised bimba-map corpus + the prior queue's outcome (accepted / rejected / deferred). Output: structured `QReviewQueue` JSONL at `Body/S/S5/epii-autoresearch-core/queues/q_review_{day_id}.jsonl`, one line per candidate, each line carrying `{target_coordinate, q_key, reason_class, evidence_refs[], priority}`.

    **Live queue boundary:** [[S2]] owns the read-only, embedding-complete `:Bimba` snapshot (`graph_revision`, Q/QM fields, canonical relations, resonance edges); [[S5]] owns `s5'.improve.q_review.run` (detector execution plus durable JSONL/metadata persistence), `s5'.improve.q_review.latest` (day/VAK-filtered read projection), and `s5'.improve.q_review.night_pass` (the no-caller-corpus composition of that S2 snapshot into the persisted queue). [[S0]] only dispatches these methods through the gateway membrane; [[Aletheia]] sends only the Chronos day/review-epoch context after crystallisation. The run method refuses absent or malformed `~/.epi-logos/config.toml [autoresearch]` detector policy; no threshold is supplied by a gateway fallback. **Canon update flag:** [[S2-ARCHITECTURE]] and [[S5-ARCHITECTURE]] should record this public snapshot/queue boundary at their next harmonisation pass.

    **Accepted-Q amendment boundary:** `s1'.q_articulation.accept` is the governed post-composition path. It accepts an S5-persisted human approval for a human-gated review item, the Sophia value/open-question/provenance payload, and the graph revision the reviewer saw; an arbitrary review-reference string is refused before the graph or vault is opened. [[S2]] read-only verifies the existing `:Bimba` coordinate/property and returns an [[Anuttara]] diagnostic, [[S1]] plans the only legal existing-note mutation (`q_*` scalar plus paired `qm_*_review_epoch_*`), and [[S0]] persists then runs the normal S2 vault sync. The sync must land the predicted next revision or returns an honest concurrent-change failure; a live WebSocket/Neo4j proof creates and removes a disposable node while checking both the note and graph properties. **Canon update flag:** [[S1-ARCHITECTURE]], [[S2-ARCHITECTURE]], and [[S5-ARCHITECTURE]] should record this amendment/approval contract at their next harmonisation pass.

    **(ii) ML at M5-4' as pattern lens** — *consume* the Stream G EBM training infrastructure (per Tranche 12.24 Phase 2, [`M'-ML-SKILL-SURFACE-SPEC`](../../M'-ML-SKILL-SURFACE-SPEC.md)) and the `parashakti-ebm-head` custom skill (per DR-ML-1); *extend* with four detector sub-skills at [`Body/S/S5/epii-autoresearch-core/skills/`](../../../../../Body/S/S5/epii-autoresearch-core/skills/) (each a Hermes-shaped SKILL.md — these are M5-4' typological pattern-recognition lenses, NOT autonomous canon-writers):

    - **`epii-q-articulation-gap-detector`** — clusters Bimba nodes by `(c_4_family, c_4_ql_position, c_4_lens)` using 3072-dim embeddings; for each cluster, finds nodes missing `q_*_{i?}_*` keys that ≥75% of cluster peers carry (threshold config-keyed); emits `reason_class: "articulation_gap"` queue entries.
    - **`epii-q-contradiction-candidate-detector`** — pairs of nodes joined by canonical relations whose `q_3_{i?}_dialectical_movement` texts vector-disagree above a threshold; pairs whose `RESONATES_WITH` edge confidence is below 0.6 under cross-validation against their respective `q_5_{i?}_integration_template` neighbourhoods; emits `reason_class: "contradiction_candidate"`.
    - **`epii-q-stale-by-non-revisit-detector`** — compares each node's `qm_{n}_{i?}_review_epoch` (per Tranche 12.26 stamp) against the current `graph_revision` (per CCT-16(v)); nodes whose latest reviewed epoch is more than N revisions stale (config: `~/.epi-logos/config.toml [autoresearch] stale_revision_threshold`, NO hardcoded value per the no-hardcoding rule inherited from Tranches 12.20/12.23/12.24/DR-ML-1) queue for re-review. NOT automatic invalidation — only flagged for the queue.
    - **`epii-q-resonance-harvester`** — consumes `RESONATES_WITH` edges currently written-but-barely-read at [`coordinator.py:163`](../../../../../Body/S/S5/epi-gnostic/epi_gnostic/enrichment/coordinator.py); high-confidence (>0.85, threshold config-keyed) cross-namespace resonances that have NO corresponding canonical Bimba relation surface as `reason_class: "promotion_candidate"` — proposing that the Gnostic-discovered resonance graduate to a canonical Bimba relation, with the relation's `c_1_relation_family` per DR-IG-1 / CCT-13.

    Each detector returns ranked candidates into the same `QReviewQueue` JSONL; M5-4' ranks across detectors via a composite priority (`articulation_gap > promotion_candidate > contradiction_candidate > stale_by_non_revisit` as default ordering, config-overridable). The four detectors do NOT mutate the corpus — they produce queue entries only.

    **(iii) VAK-gated pair-development surface** — *consume* the Tranche 12.15 VAK reading-frame evaluator and the Tranche 12.21 user-context skill; *extend* with two new review surfaces:

    - **TUI portal pane** `m5.q_review` — new plugin in [`Body/S/S0/epi-cli/src/portal/`](../../../../../Body/S/S0/epi-cli/src/portal/) (consistent with existing M5 plugin naming `m5.logos`, `m5.chat`, `m5.fsm`). Renders the `QReviewQueue` as a card stack; each card shows target coordinate, the existing `q_*` articulation (if any), the reason_class, and an "open in pair-composition" action. The pane respects VAK addressing — the queue is filtered by current `cf` (context frame) so candidates surface at the position they're relevant to.
    - **Theia agentic-control-room tab** (extends Track 11 + ACR repurpose per DR-M5-1) — full-screen pair-composition workspace: the existing `q_*` value (or empty if articulation gap), the candidate context (cluster peers, contradiction partner, resonance evidence), an editable Sophia-disclosure-envelope template (per Tranche 12.26 q_proposal shape), and the aphoristic-skill composition assistant (the `composeAphoristic` module of Tranche 12.26). On accept, the envelope flows through the 12.26 dispatch pipeline.

    **VAK gating semantics** (per DR-VAK-1 / Tranche 12.15): candidates surface at the VAK position their `reason_class` maps to — articulation gaps surface in M4-3'-resident editing surfaces (the personal-meaning altitude); contradiction candidates surface in M5-side dialectical-review surfaces; promotion candidates surface in M0' graph-chrome surfaces (the structural-canon altitude). The user reviews in the VAK seat where the work belongs.

    **Aphoristic-skill in line** (cross-link Tranche 12.26): pair-composition invokes the same `composeAphoristic(rationale, source_vak, q_key, depth_target) → q_value_candidate` module as session-close Sophia disclosure, enforcing aphoristic-density + poetic-encapsulation criteria. The pair-development surface is essentially "Sophia synthesis at a different altitude" — same composition engine, different trigger.

    **(iv) Anti-greenfield commitment.** The autoresearch loop produces a queue. It does NOT write canon. The pair-development surface composes proposals. It does NOT write canon. Only Hen writes canon (per CCT-14), with M0 Anuttara's pure-Cypher pattern-match verification gate (per DR-MP-1: Anuttara is the Verifier in the 4'-5'-0' LLM/EBM/Verifier triplet — pure structural pattern-match, no LLM judgment, raises questions not pass/fail per DR-MP-3) before promotion. The loop closes on its own work: after Hen promotes accepted candidates, the next night' pass reads the updated state and identifies the next tier of review work (`qm_{n}_{i?}_review_epoch` advances).

    **Acceptance gate (end-to-end):** a night' pass on a seeded corpus identifies ≥5 q_-articulation gaps → produces a `QReviewQueue` JSONL with structured entries → user opens TUI `m5.q_review` pane → selects one entry → pair-composition workspace opens with envelope template → aphoristic-skill assistant composes a candidate `q_5'_integration_template` → user accepts → envelope flows through Tranche 12.26 pipeline → M0 Anuttara verifier confirms structural compliance → Hen promotes to canonical Bimba node → `epi canon coord X --depth pithy` (per Tranche 9.13) reflects the new articulation → next night' pass reads updated state and the queue does NOT re-surface the just-promoted candidate.

    **Verification:** `cargo test -p epii-autoresearch-core --test self_referential_read_seeded_corpus` asserts the seeded run produces ≥5 candidates of mixed reason_class; `cargo test -p epii-autoresearch-core --test articulation_gap_detector` against fixture with known peers-with-q_5/missing-peer; `cargo test -p epii-autoresearch-core --test resonance_harvester_promotes_high_confidence_only` (threshold config-keyed); TUI integration test `cargo test -p epi-cli --test portal_m5_q_review_renders_queue`; Theia integration test `pnpm --filter agentic-control-room test --testNamePattern 'pair-composition workspace'`; end-to-end acceptance test `cargo test --test wisdom_curation_loop_end_to_end` runs the full acceptance gate above (gates the tranche close).

    **Decisions already locked / inherited from Cycle-3 canon:**
    - **DR-MP-1** Anuttara as Verifier (pure Cypher pattern-match, raises questions not pass/fail) is the canon-verification gate. The loop does NOT bypass it.
    - **DR-MP-3** corpus IS canon IS training data: the M5-4' detector skills consume the same crystallised corpus they're identifying gaps in. The loop trains and serves over the same artifact.
    - **No autonomous canon writes** — Hen is the canon-write authority per CCT-14; this loop produces queue entries and proposals only, per the wisdom-curation-not-automation principle.
    - **No hardcoded thresholds** — all priority orderings, staleness thresholds, confidence cutoffs come from `~/.epi-logos/config.toml [autoresearch] *` keys per the no-hardcoding rule (DR-ML-1, Tranches 12.20/12.23/12.24).

    Cross-track hooks: Track **12.24 Phase 2** owns the EBM substrate this loop's detectors consume; Track **19** owns the contemplation RPC that session-close-side of the loop (Tranche 12.26) wires through; Track **33** §2.x (Streams A–G) is the energy-channel infrastructure these detectors ride on; CCT-14 owns the Hen entity-candidate lifecycle that promotes accepted proposals; CCT-16 makes the proposed q_/qm_ keys survive sync; CCT-15 owns the C-layer typology the locality signature (Tranche 5.23) flattens against; Tranche **12.26** is the session-close producer of the same proposal shape this tranche's pair-development surface emits.

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M5 substrate at two points: **T19.2** defines `M5_ContemplationObject` struct in [m5.h](Body/S/S0/epi-lib/include/m5.h) carrying the session's lived bioquaternion trajectory + tarot anchor + VAK-profile pairs + codon trace + arch-9 charge state + four-syntax compliance seeds; **T19.7** wires the close path through agentic intelligence by adding `m5_compose_contemplation_object()` inside [`m5_execute_mobius_return`](Body/S/S0/epi-lib/src/m5.c:98), then gateway dispatch `contemplate_session_close()` (T19.6) before `m4_mobius_return` consumes the LLM-composed wisdom_delta. The cycle closes through contemplation rather than bare arithmetic; the XOR carries the agents' reading. See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
