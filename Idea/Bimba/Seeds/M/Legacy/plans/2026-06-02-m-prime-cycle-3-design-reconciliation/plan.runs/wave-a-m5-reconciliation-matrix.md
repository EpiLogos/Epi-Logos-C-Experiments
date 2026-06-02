# Wave-A M5 (Epii) — Cycle-3 Design Reconciliation Matrix

**Task ID:** wave-a-m5
**Domain:** M5 — Epii / Agentic-Pedagogical IDE / S4↔S5 shared-intelligence seam
**Authored:** 2026-06-02
**Status:** subagent-deliverable (matrix is the work product)

## Sources Consulted

- **Corpus 1 (UX intent):** `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md`
- **Corpus 2 (M' Seed authority):**
  - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
  - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md` (§1.1, §1.2, §8)
  - `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md` (§0, §1.1–§1.4)
  - `Idea/Bimba/Seeds/M/M5'/frontier-confirmations-and-refinements.md` (§0/1, §1.x — Pi polyvalent verification)
  - `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md` (resolved Theia decision)
- **Corpus 3 (substrate):**
  - `Body/S/S5/epi-gnostic/{epi_gnostic, schema-context.md, Dockerfile.graphiti}` (production RAG)
  - `Body/S/S5/{epi-kbase, epi-kbase-core, epii-agent-core, epii-agent, epii-review-core, epii-autoresearch-core}`
  - `Body/S/S5/epii-agent/agent-contract.json` (gateway methods, spines, accepted deposits, forbidden_authority)
  - `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md` (Aletheia as crystallisation/Gnosis layer)
  - `Body/S/S4/plugins/pleroma/capability-matrix.json` (S4/S4' agent-tool governance)
  - `Body/S/S3/gateway-contract/src/lib.rs` (`s5'.epii.*` / `s5'.review.*` / `s5'.improve.*` registry)
  - `Body/S/S5/epii-autoresearch-core/src/{lib.rs, inbox.rs, recompose.rs, spine.rs, capacity_workflows.rs}`
- **Corpus 4 (Theia surface):**
  - `Body/M/epi-theia/extensions/m5-epii/{package.json, src/common/epii-surface.ts, src/browser/m5-epii-widget.tsx}`
  - `Body/M/epi-theia/extensions/agentic-control-room/package.json`
  - `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/` (recognition seam plugin)
  - `Body/M/epi-theia/extensions/` directory listing (no `logos-atelier` / `m5-canon-studio` extension present)
- **Reference (do not redo):** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/07-m5-epii-extension-and-agentic-ide.md` (T0–T5)

## Standing-invariant honoring

- Aletheia is **tool-guardian / crystallisation layer**, not an autonomous peer agent. Contract is at `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md`; it owns Gnosis ingest/query/notebook/route/crystallise/seed_refresh tools, invoked through Anima dispatch. The S5'-side `epii-agent/agent-contract.json` declares `accepted_deposits_from_anima` including `aletheia_crystallisation` — Aletheia is an **effect produced through Anima invocations**, not a peer Pi agent. (Memory confirms: do not flag a missing `aletheia-agent/agent-contract.json` as a blocker.)
- The 72-invariant is one (M2 lineage), six addressing-axes; the +1 parent is M1-5, not M0 — M5'-SPEC §M5'.6 explicitly retains the residual M0-witness wording as an unresolved canon question. Flag as CONTRADICTION.
- `/pratibimba/system` + `Body/M/epi-theia` is the M' Theia shell authority (Tauri/epi-tauri is migration source).
- Anti-greenfield: Body/S/S5 cores (autoresearch, review, agent-core, epi-gnostic, epi-kbase) are **landed substrate**; all M5 tranches must consume/extend/audit, never rebuild.

---

## Four-Way Reconciliation Matrix

| # | Claim (UX doc) | Spec authority (M5'-SPEC + companions) | Code / substrate evidence | Theia surface | Status |
|---|---|---|---|---|---|
| 1 | "Conversational agent is the primary surface; the six panes are summonable contexts, not a dashboard" (§1) | M5'-SPEC §"Surface Philosophy"; system-shape canon §1.2 names M5-4 = operational-capacities + agentic mediation | Substrate-ready: `epii-agent` `s5'.epii.*` deposit/runtime-context methods registered in `gateway-contract/src/lib.rs`; ACR extension exists | `extensions/m5-epii/src/browser/m5-epii-widget.tsx` exists but is described in `package.json` as "Review queue and spine-state inspector"; `agentic-control-room/` extension hosts the chat surface separately — no unified "summonable-pane" router observed | **SPEC-AHEAD** — agent-as-primary-surface intent has no single named router/host owner; M5-3 frontend studio and M5-4 ACR are split across extensions with no orchestrator |
| 2 | M5-0 Library / Gnostic Namespace: "`Body/S/S5/epi-gnostic` IS the RAG-anything system" served via `s5'.gnostic.*` | M5'-SPEC explicitly names `s5'.gnostic.*` as the gateway route over `epi-gnostic`; Aletheia CONTRACT owns the raw `aletheia_gnosis_*` tools | `epi-gnostic` Python package landed (`epi_gnostic/cli.py`, `graphiti_service.py` 534 LOC, `wrapper.py`, `enrichment/`, `storage/`, `cypher/`, `Dockerfile.graphiti`); Aletheia `extension.ts` line 214 invokes `epi-gnostic query` via CLI bridge | No `s5'.gnostic.*` method registered in `gateway-contract/src/lib.rs` (grep returned zero hits for `s5'.gnostic|s5'.atelier|s5'.etymology`); m5-epii Theia widget has no library/RAG surface | **CODE-PENDING** — `s5'.gnostic.*` gateway routes are spec-named but unregistered; library pane unowned. The unblock contract is gateway-contract registration over the existing `epi-gnostic` package. |
| 3 | M5-1 Canon Studio: "philosophy files edited; reads direct-FS, writes through Hen via `s1'.vault.*`; QL/bimba decoration extension + Smart Connections wikilink autocompletion" (§2.2) | M5'-SPEC "Backend Contract Consumed" §S1; cycle-2 plan 07 T2 owns Canon Studio | `hen-compiler-core/src/wikilinks.rs` + `smart_env.rs` (`suggest_link_candidates(LinkCandidateRequest) → LinkCandidateResponse`) landed; `s1'.vault.*` / `s1'.semantic.*` are Wave-A-M0 / S1 territory | No `canon-studio` or `m5-canon-studio` Theia extension present in `Body/M/epi-theia/extensions/`. The decoration + autocompletion contribution does not exist as a Theia surface | **DOC-AHEAD** — Canon Studio is intent-only at the Theia surface; spec contract + substrate are landed but no extension consumes them |
| 4 | M5-2 Backend Studio: "S-family stack inspectable & agent-editable through governed tasks/tests/evidence" (§2.3) | M5'-SPEC §"Sixfold IDE Surface" row M5-2'; system-shape canon §1.2 ("M5-2 IS the S-family stack itself") | Substrate landed: `epi-lib` 12,160 LOC C + `portal-core` ~4.5K LOC Rust + S1–S5 cores all present | No `backend-studio` Theia extension; `m5-epii` widget does not expose S-stack inspect/edit views; LSP wiring (rust-analyzer/clangd/pylsp per canon §1) not declared in any package.json | **DOC-AHEAD** — Backend Studio is aspirational at the Theia layer; underlying substrate fully landed (consume as-is). Cycle-3 tranche: name an extension owner + wire LSP contributions. |
| 5 | M5-2 exposes the read-only `anuttara_trace(output, sensitivity, depth)` API as contemplative offering (§2.3) | M5'-SPEC §2.3 references it as a sensitive-context grammatical-tracing API; no canonical method-name in `agent-contract.json` | No `anuttara_trace` method in `gateway-contract/src/lib.rs`; no implementing function found in S5 cores. (M0 substrate may carry the trace logic; M0 reconciler owns) | Not present in m5-epii widget | **ORPHAN** — `anuttara_trace` claim has no spec method-route and no implementing carrier. Wave-B M0/agentic-layer should adjudicate ownership; M5 records it as an unowned surface claim |
| 6 | M5-3 Frontend Studio hosts **playable bimba** in two render-modes (`BimbaMap2D.tsx` / `BimbaMap3D.tsx`); developer-mode vs engagement-mode (§2.4) | M5'-SPEC "Sixfold IDE Surface" row M5-3'; UX doc §2.4 names files | Substrate side is M0-extension territory (`bimba-map` / `playable-bimba`); not present in M5 substrate. No `BimbaMap2D.tsx`/`BimbaMap3D.tsx` files observed in `Body/M/epi-theia/extensions/m0-anuttara/` (Wave-A-M0 owns verification) | M5-3 Frontend Studio in M5 sense (shell-shaping) is the `ide-shell-m0-m5` + `omnipanel-shell` extensions, both landed | **SPEC-AHEAD** — boundary: M5-3 "Frontend Studio" overlaps with M0's "playable bimba"; ownership seam needs explicit consume-from-M0 statement. Cross-ref Wave-A-M0. |
| 7 | M5-4 Agentic Control Room: Sophia / Anima / Pi / Aletheia — the S4↔S5 shared seam; Aletheia "owns the Gnosis RAG pipeline (S4-5p)" (§2.5, §5) | M5'-SPEC §M5'.4 (six operational capacities); system-shape canon §1.2; Aletheia CONTRACT confirms tool ownership; `agent-contract.json` `accepted_deposits_from_anima` includes `aletheia_crystallisation` | `agentic-control-room` extension package landed; `epii-agent-core` + `epii-autoresearch-core` (~690 LOC `lib.rs` + `inbox.rs` 173 LOC + `recompose.rs`) carry the spine; `pleroma/capability-matrix.json` declares Anima dispatch tools and skill bus | `extensions/agentic-control-room/` declares scope: VAK eval, capability tree, run tree, tool stream, abort/retry/continue, deposit, review decision — matches §2.5 well | **ALIGNED** — primary M5-4 surface and S4↔S5 seam contract is consistent. Note: Aletheia is correctly modeled as Anima-dispatched tool-guardian, NOT a peer Pi agent (memory invariant honored) |
| 8 | "The canon acts as context, not payload — both S4 and S5 tune to it. The 72-fold harmonic profile derived from the canon (137 = 64+72+1) is the common pitch" (§5.2) | M5'-SPEC §"Canon Recognition: 137 And Jiva-is-Śiva"; alpha_quaternionic spec | `MathemeHarmonicProfile` is Wave-B kernel-bridge territory (`resonance72`, `pointerAnchor`, `depositionAnchor` declared as required fields in M5'-SPEC); readiness flags = "missing backend contract, pending dataset LUT, provisional evolutionary gap" | Kernel-bridge extension landed but profile-field surfacing in m5-epii widget is review-queue only | **CODE-PENDING** — depends on Wave-B kernel-bridge / profile-contract closure. The `137 = 64+72+1` canon-review tests (per M5'-SPEC readiness criteria line "tests prove canon-review surfaces can trace `137 = 64 + 72 + 1`...") are blocked until kernel profile tranche exposes resonance72 / planetaryChakral / mahamaya / pointerAnchor / depositionAnchor |
| 9 | The "+1 parent" of 137: M5'-SPEC §M5'.6 records the M1-vs-M0 wording as unresolved | alpha_quaternionic_integration_across_M_stack assigns +1 primarily to M1 Paramaśiva; one residual passage names M0 witness-axis; cycle-3 standing invariant says +1 is M1-5 not M0 — flag M0 wording as residual | M1 substrate carries +1 via `hopf.rs` (`portal-core/src/hopf.rs`); M0 has no `+1` carrier | M5'-SPEC openly retains the contradiction in §M5'.6 | **CONTRADICTION** — explicit decision-register entry: cycle-3 standing invariant resolves +1 to M1-5; rewrite residual M0-witness wording across the corpus as part of the decision register tranche (cross-ref Wave-A-M0 / M1) |
| 10 | M5-5 Logos Atelier: scent-following method (root → cognate → drift → psychoid charge → pros-hen → Möbius write-back); `etymology` graph namespace; word constellations (§2.6) | M5'-SPEC row M5-5'; UX doc §2.6 names the operational verbs; system-shape canon names Atelier as 6th surface | **No** dedicated Atelier core under `Body/S/S5/`. Aletheia owns `crystallisation` tool; etymology-namespace ingestion is implicit in `epi-gnostic`'s graph layer | **No** `logos-atelier` Theia extension in `Body/M/epi-theia/extensions/` (verified by ls — only m0–m5, plugins, shell, ACR, kernel-bridge, contracts present) | **DOC-AHEAD** — Atelier is named as a first-class surface in spec + UX but has neither a Body/S core nor a Theia extension. The minimum cycle-3 work: define a `logos-atelier` extension owner that consumes Aletheia crystallisation tools + `epi-gnostic` over the `etymology` namespace. Anti-greenfield: do NOT rebuild RAG — extend Aletheia + epi-gnostic. |
| 11 | Four graph namespaces — `bimba | gnosis | etymology | pratibimba` — load-bearing; "boundaries are not collapsed" (§5.3) | M5'-SPEC §"Graph Namespace Model" lists all four; UI naming migration (`gnostic` → `gnosis`, `atelier` → `etymology`) explicit | `graph-services/src/retrieval/{graphrag.rs, hybrid.rs, coordinate.rs}` landed; `epi-gnostic` `cypher/` queries respect coordinate tagging | No namespace-aware visualisation in m5-epii widget; no extension owns "graph viewer as shared affordance" | **SPEC-AHEAD** — namespace contract exists in substrate; Theia surface that respects boundaries does not yet exist as an extension |
| 12 | The autoresearch spine: surface → route → orchestrate → integrate; dry-run promotion only; `requires_human` non-bypassable (§11) | M5'-SPEC §M5'.3 + autoresearch-loop-seed spec §1.1; `agent-contract.json` declares `spines: ["autoresearch", "review_inbox"]` and `forbidden_authority` | Spine substrate landed at `epii-autoresearch-core` + `epii-review-core` + `epii-agent-core`; `s5'.improve.*` registered in `gateway-contract/src/lib.rs`; `recompose.rs` Möbius pass exists | `m5-epii` widget README names "Review queue and spine-state inspector over real S5 review/improve DTOs with dry-run-only governance" — surface partially present | **ALIGNED** — the spine is the most-aligned M5 sub-claim; cycle-3 should consume as-is and only extend with the missing surfacing for the six operational-capacity views |
| 13 | Six operational capacities (Epii-on-{Anuttara, Paramaśiva, Paraśakti, Mahāmāyā, Nara, Epii}) with named per-capacity readiness paths into S5 review/autoresearch | M5'-SPEC §M5'.4 names six companion files; M5'-SPEC "Readiness/Test Criteria" lists six required per-capacity end-to-end paths | `epii-autoresearch-core/src/capacity_workflows.rs` exists (named module — `capacity` surfacing is present); per-capacity surfacing-pipelines are partially implemented per autoresearch spec §1.1 | `m5-epii` widget does not surface six capacity views; ACR extension does not enumerate capacity-specific run trees | **SPEC-AHEAD** — six-capacity surfacing exists in substrate (`capacity_workflows.rs`) but is unconsumed by any Theia surface |
| 14 | 4/5/0 Recognition Seam — Jiva-is-Śiva surface: foreground personal cymatic (M4) on background canonical bimba (M0); BEDROCK link; activity-resonance via Cl(4,2) (§7) | M5'-SPEC §M5'.5; UX doc §7 + §7.1 (promotion law); psychoid-cymatic-field-engine §18.11 | `portal-core/src/personal_identity.rs` carries `M4-4-4-4`; M4 + M0 Cl(4,2) substrate landed (Wave-B kernel-bridge owns the four-scale audit) | `extensions/plugin-integrated-4-5-0/` package landed | **ALIGNED** for substrate + extension landing; recognition-surface UX content owned by Wave-A-M4 and cycle-2 plan 09. M5's specific responsibility: review-gate the promotion law (§7.1) — no separate tranche needed beyond depositing review hooks |
| 15 | "Pi" as a constitutional agent in the M5-4 register (Sophia / Anima / Pi / Aletheia quartet) | M5'-SPEC row M5-4'; system-shape canon §1.2 | `pi-agent/` directory landed; `pleroma/capability-matrix.json` declares constitutional-agents list `[anima, eros, logos, mythos, nous, psyche, sophia]` — **Pi is not in the constitutional-agents array**; Pi is the *agent kind* (`agent_kind: "pi_agent"`) | n/a — control room consumes whatever agents are registered | **CONTRADICTION** — UX doc + spec name Pi as one of four control-room agents; `capability-matrix.json` lists 7 constitutional agents and does not list Pi as one. Decision needed: is Pi a meta-classification (agent-kind), or a named agent in M5-4? Wave-B agentic-layer (S4↔S5) owns the adjudication. |
| 16 | "Sophia advises and coordinates across these capacities without becoming a panel of her own" (§1, §2.5) | M5'-SPEC "Surface Philosophy"; Sophia coordinator-role in system-shape canon | `pi-agent/agents/` has `anima.md` etc.; Sophia is in `constitutional_agents` list but no `sophia.md` directly inspected here (Wave-B audit) | No "Sophia" surface in any extension; consistent with "no panel of her own" | **ALIGNED** (negative-claim alignment — Sophia correctly absent as a pane) |
| 17 | Vault writes route through Hen `s1'.vault.*`; reads are filesystem-direct via Theia FS provider | M5'-SPEC "Backend Contract Consumed" §S1 | `hen-compiler-core/src/wikilinks.rs` landed; `s1'.vault.*` is Wave-B / Wave-A-M0 territory | Direct-FS reads available in any Theia extension; Hen-routed write surface in m5-epii widget not observed | **CODE-PENDING** — `s1'.vault.*` gateway-method registration needs Wave-A-M0/Wave-B confirmation; M5's tranche is to consume them once landed |

---

## Anomalies — Detail

### CONTRADICTION

- **C-M5-1 — Pi as constitutional agent.** UX §1, §2.5 and M5'-SPEC row M5-4' name Pi alongside Sophia/Anima/Aletheia as a control-room agent. `Body/S/S4/plugins/pleroma/capability-matrix.json` declares `constitutional_agents: ["anima","eros","logos","mythos","nous","psyche","sophia"]` and uses `pi_agent` as the *kind* of agent on the S5/S5' side (per `epii-agent/agent-contract.json` `agent_kind: "pi_agent"`). Decision needed: is "Pi" a class-label (agent_kind) or a named agent surface? Wave-B agentic-layer owns the routing-closure adjudication.
- **C-M5-2 — +1 parent residual M0 wording.** Per standing invariant: +1 is M1-5, not M0; M5'-SPEC §M5'.6 retains the contradiction explicitly. Decision-register entry: enforce M1-5 across the corpus and downgrade the M0-witness wording. (Owned at cycle-3 decision register; M5 only flags.)

### CODE-PENDING

- **CP-M5-1 — `s5'.gnostic.*` gateway routes unregistered.** M5'-SPEC explicitly names `s5'.gnostic.*` as the M5-0 access route over `epi-gnostic`. Grep of `gateway-contract/src/lib.rs` finds zero `s5'.gnostic|s5'.atelier|s5'.etymology` registrations. Unblock contract: register `s5'.gnostic.{ingest, query, notebook, status}` over the existing production `epi-gnostic` package (Aletheia tools already exist).
- **CP-M5-2 — `MathemeHarmonicProfile` fields for canon-recognition tests.** `resonance72`, `planetaryChakral`, `mahamaya`, `pointerAnchor`, `depositionAnchor` are required-field claims in M5'-SPEC; M2/M3 review and the `137 = 64+72+1` review tests are blocked until kernel-bridge surfaces them. Wave-B kernel-bridge owns the field-readiness ledger; M5 records the blocker.
- **CP-M5-3 — `s1'.vault.*` consumption.** M5-1 Canon Studio + M5-3 vault writes depend on Wave-A-M0 / Wave-B confirmation that `s1'.vault.*` is registered and live.

### ORPHAN

- **O-M5-1 — `anuttara_trace(output, sensitivity, depth)`.** Named in UX doc §2.3 as read-only contemplative-offering API; no method-route, no carrier. Refer to Wave-B agentic-layer / Wave-A-M0 for adjudication.
- **O-M5-2 — Logos Atelier surface.** Spec-canonical M5-5 surface with no Body/S core and no Theia extension. Aletheia owns crystallisation tools but does not own the "scent-following / etymology constellation" surface. Cycle-3 must name an owner.

### DOC-AHEAD (intent ahead of code/surface)

- **DA-M5-1 — Canon Studio extension.** Substrate complete (Hen + Smart Connections); no Theia extension.
- **DA-M5-2 — Backend Studio extension.** S-stack landed; no Theia extension; LSP contributions not declared.
- **DA-M5-3 — Logos Atelier surface (same as O-M5-2 above; ORPHAN classifies stronger).**

### SPEC-AHEAD (contract defined, surface unconsumed)

- **SA-M5-1 — Unified summonable-pane router** (UX §1 conversational-default UX) — no router host owner across extensions.
- **SA-M5-2 — Namespace-aware graph viewer** (`bimba | gnosis | etymology | pratibimba`).
- **SA-M5-3 — Six operational-capacity views over `capacity_workflows.rs`** (substrate landed, no Theia consumer).
- **SA-M5-4 — M5-3 vs M0 playable-bimba seam.**

### ALIGNED

- A-M5-1 Agentic Control Room substrate ↔ extension ↔ S4↔S5 spine.
- A-M5-2 Autoresearch + Review spine (the most-aligned sub-claim).
- A-M5-3 4/5/0 Recognition Seam (plugin landed; M4/M0 own further substrate work).
- A-M5-4 Sophia as no-panel coordinator (negative alignment).

---

## Proposed Cycle-3 Tranches (numeric ids 6.x)

Each tranche carries a `Cycle 2 substrate inheritance:` line that names the cycle-2 plan 07 tranche it closes against, and a real verification command.

### Tranche 6.1 — Register `s5'.gnostic.*` over the production `epi-gnostic` package (code-pending closure)

- **Classification:** code-pending-closure
- **Cycle-2 substrate inheritance:** Extends cycle-2 plan 07 T1 (Library / Gnosis Surface); cycle-2 left the M5-0 surface partial because the gateway route was unregistered.
- **Deliverable:** Add `s5'.gnostic.{ingest, query, notebook, status}` to `Body/S/S3/gateway-contract/src/lib.rs` METHODS array and wire dispatch in `Body/S/S3/gateway` over the existing `Body/S/S5/epi-gnostic/epi_gnostic/cli.py` + Aletheia CLI bridge. Anti-greenfield: do NOT rebuild epi-gnostic.
- **Verification:**
  - `grep -n "s5'.gnostic" Body/S/S3/gateway-contract/src/lib.rs` returns ≥4 method registrations
  - `cargo check -p gateway-contract`
  - `cargo check -p gateway`

### Tranche 6.2 — Author the `logos-atelier` Theia extension over Aletheia + epi-gnostic (no-orphan fill)

- **Classification:** no-orphan-fill
- **Cycle-2 substrate inheritance:** Extends cycle-2 plan 07 T5 (Logos Atelier, canon-recognition, recursive validation); cycle-2 left the surface intent without a named extension owner.
- **Deliverable:** Add `Body/M/epi-theia/extensions/logos-atelier/` with `package.json`, `src/common/atelier-surface.ts`, and `src/browser/atelier-widget.tsx`; consume Aletheia tools (`aletheia_gnosis_query`, `aletheia_crystallise`, `aletheia_thought_route`) over the `etymology` graph namespace via the (newly-registered, Tranche 6.1) `s5'.gnostic.*` route. Surface contract: scent-following — root → cognate → drift → psychoid charge → pros-hen → Möbius write-back proposal.
- **Verification:**
  - `test -d Body/M/epi-theia/extensions/logos-atelier && test -f Body/M/epi-theia/extensions/logos-atelier/package.json`
  - `grep -n "etymology" Body/M/epi-theia/extensions/logos-atelier/src/common/atelier-surface.ts`
  - Build the workspace and confirm extension discovers without errors.

### Tranche 6.3 — Six operational-capacity views over `capacity_workflows.rs` (spec-ahead integration)

- **Classification:** spec-ahead-integration
- **Cycle-2 substrate inheritance:** Extends cycle-2 plan 07 T4 (Agentic Control Room + Operational Capacities); cycle-2 named the substrate; cycle-3 closes the surface consumer.
- **Deliverable:** In `Body/M/epi-theia/extensions/agentic-control-room/`, add six per-capacity panes (Anuttara-construction, Paramaśiva-CPT/RAG, Paraśakti-graph-relational, Mahāmāyā-process-reward, Nara-Anima-dialogic, Epii-on-Epii) driven by the existing `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs` types. Audit/verify that the runtime module already has wiring; only extend the Theia surface.
- **Verification:**
  - `grep -rn "capacity_workflows" Body/S/S5/epii-autoresearch-core/src` returns the implemented surface
  - `cargo check -p epii-autoresearch-core`
  - Theia extension `package.json` declares six capacity view contributions
  - Per-capacity surfacing tests pass per M5'-SPEC readiness criteria (six end-to-end paths)

### Tranche 6.4 — Canon Studio + Backend Studio Theia extensions (doc-ahead landing, named owners)

- **Classification:** doc-ahead-landing
- **Cycle-2 substrate inheritance:** Closes cycle-2 plan 07 T2 (Canon Studio) and T3 (Backend / Frontend Studios) at the extension layer — cycle-2 named the deliverables but did not create the extensions.
- **Deliverable:** Two extensions, named owners:
  - `Body/M/epi-theia/extensions/canon-studio/` — markdown editor + QL/bimba decoration contribution + Smart Connections autocomplete via `s1'.semantic.*`; writes via Hen `s1'.vault.*`. Read is direct-FS.
  - `Body/M/epi-theia/extensions/backend-studio/` — declares LSP contributions (`rust-analyzer`, `clangd`, `pylsp`) per system-shape canon §1.2; surfaces `epi-lib` + `portal-core` + S1-S5 cores with provenance.
- **Verification:**
  - `test -d Body/M/epi-theia/extensions/canon-studio && test -d Body/M/epi-theia/extensions/backend-studio`
  - `grep -n "s1'.vault\|s1'.semantic" Body/M/epi-theia/extensions/canon-studio/src/common/`
  - `grep -n "rust-analyzer\|clangd\|pylsp" Body/M/epi-theia/extensions/backend-studio/package.json`

### Tranche 6.5 — Decision-register entries for M5 contradictions (contradiction-decision)

- **Classification:** contradiction-decision
- **Cycle-2 substrate inheritance:** Cycle-2 plan 07 did not resolve C-M5-1 (Pi as constitutional-agent) or C-M5-2 (+1 parent wording).
- **Deliverable:** Two entries in the cycle-3 decision register (plan tranche 13):
  - **DR-M5-1:** "Is Pi a named constitutional agent in M5-4 alongside Sophia/Anima/Aletheia, or an agent-kind that the M5-4 register applies to multiple specific agents?" Resolution path: align M5'-SPEC row M5-4' with `Body/S/S4/plugins/pleroma/capability-matrix.json` `constitutional_agents` array. User final-validation required.
  - **DR-M5-2:** "Enforce the standing invariant that the +1 parent is M1-5 (Paramaśiva), not M0 (Anuttara witness-axis)." Resolution path: edit M5'-SPEC §M5'.6 to reclassify the M0-witness wording as deprecated; downgrade all residual M0-witness corridor passages. User final-validation required (load-bearing canon).
- **Verification:**
  - `test -f Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md`
  - `grep -n "DR-M5-1\|DR-M5-2" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md`

### Tranche 6.6 — `anuttara_trace` orphan-fill referral (no-orphan, cross-domain)

- **Classification:** no-orphan-fill (refer to Wave-A-M0 / Wave-B agentic-layer)
- **Cycle-2 substrate inheritance:** Not addressed by cycle-2 plan 07. Spec mentions in M5'-SPEC §2.3 (via UX echo) only.
- **Deliverable:** Defer concrete carrier-assignment to Wave-A-M0 (which owns the Anuttara substrate); add a cross-reference entry to the no-orphan audit (plan tranche 14) noting `anuttara_trace` as an M5-named claim with M0-substrate owner-requirement, read-only, contemplative-offering only. If Wave-A-M0 does not claim it, escalate to user final-validation as a deferred decision.
- **Verification:**
  - `grep -n "anuttara_trace" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/14-no-orphan-audit-and-release-gates.md`

---

## Aligned-only Note

Tranches 6.7+ are intentionally absent. The autoresearch spine (Claim 12), the 4/5/0 recognition plugin (Claim 14), and Sophia-as-coordinator (Claim 16) are ALIGNED and require no cycle-3 tranche beyond their cycle-2 inheritance. Consume as-is.

---

## Summary

The M5 (Epii) subsystem has a well-landed **spine** (autoresearch + review + agent-core + gateway routes) and a well-landed **carrier layer** (Aletheia as Anima-dispatched tool-guardian, capability-matrix.json governance). The gaps cluster at: (i) the **Theia extension surface** — Library / Canon Studio / Backend Studio / Logos Atelier are intent without extensions; (ii) the **`s5'.gnostic.*` gateway-route** registration over the production `epi-gnostic` package; (iii) **two contradictions** (Pi-as-constitutional-agent and the +1-parent wording) that need user final-validation in the decision register; (iv) one **orphan** (`anuttara_trace`) needing M0 adjudication. None of these are greenfield; all are integration or registration over landed substrate.
