# Track 06 — M5 Epii Reconciliation

Reconciles [[M5']] (agentic-pedagogical IDE + S4↔S5 shared-intelligence seam) across the four corpora. The autoresearch + review + agent-core spine and the 4/5/0 recognition plugin are ALIGNED — substrate, gateway methods (`s5'.epii.*`, `s5'.review.*`, `s5'.improve.*`), and extensions are landed. **Aletheia is correctly modeled as Anima-dispatched tool-guardian** (per `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md`), **not a peer Pi agent** — memory invariant honored, no `aletheia-agent/agent-contract.json` blocker raised. The chief gaps are: `s5'.gnostic.*` gateway routes unregistered despite production `epi-gnostic` package being landed; Canon Studio, Backend Studio, and Logos Atelier are intent-only at the Theia layer.

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

   Add `Body/M/epi-theia/extensions/logos-atelier/` `{package.json, src/common/atelier-surface.ts, src/browser/atelier-widget.tsx}` consuming `aletheia_gnosis_query` / `aletheia_crystallise` / `aletheia_thought_route` over the `etymology` graph namespace via Tranche 6.1's `s5'.gnostic.*` routes. Surface contract: scent-following pipeline root → cognate → drift → psychoid → pros-hen → Möbius write-back proposal.

   Verification: `test -d Body/M/epi-theia/extensions/logos-atelier && test -f Body/M/epi-theia/extensions/logos-atelier/package.json`; `grep -n etymology Body/M/epi-theia/extensions/logos-atelier/src/common/atelier-surface.ts`.

3. **6.3 — Six operational-capacity panes over `capacity_workflows.rs`** *(spec-ahead-integration; cross-link to Tranche 12.5)*

   In `Body/M/epi-theia/extensions/agentic-control-room/`, add six per-capacity panes (Anuttara-construction, Paramaśiva-CPT/RAG, Paraśakti-graph-relational, Mahāmāyā-process-reward, Nara-Anima-dialogic, Epii-on-Epii) driven by existing `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs`. Substrate audit only; extend Theia surface.

   Verification: `grep -rn capacity_workflows Body/S/S5/epii-autoresearch-core/src`; `cargo check -p epii-autoresearch-core`; M5'-SPEC readiness criteria "six end-to-end paths" tests pass.

4. **6.4 — Canon Studio + Backend Studio Theia extensions** *(doc-ahead-landing)*

   Two named extensions:
   - `Body/M/epi-theia/extensions/canon-studio/` — markdown editor + QL/bimba decoration + Smart Connections autocomplete via `s1'.semantic.*`; writes via Hen `s1'.vault.*`.
   - `Body/M/epi-theia/extensions/backend-studio/` — declares LSP contributions (`rust-analyzer`/`clangd`/`pylsp`) per system-shape canon §1.2; surfaces `epi-lib` + `portal-core` + S1–S5 cores with provenance.

   Verification: `test -d Body/M/epi-theia/extensions/canon-studio && test -d Body/M/epi-theia/extensions/backend-studio`; `grep -n "s1'.vault\|s1'.semantic" Body/M/epi-theia/extensions/canon-studio/src/common/`; `grep -n "rust-analyzer\|clangd\|pylsp" Body/M/epi-theia/extensions/backend-studio/package.json`.

5. **6.5 — Decision-register entries DR-M5-1 + DR-M1 wording consolidation** *(contradiction-decision; routes to DR-M5-1 + DR-M5-2)*

   Two entries in Tranche 13:
   - **DR-M5-1** (consolidates Wave-B Agentic DR-B-1) — reconcile `M5'-SPEC` row M5-4' (Pi as constitutional agent) with `capability-matrix.json constitutional_agents=[anima,eros,logos,mythos,nous,psyche,sophia]` (no Pi). Either extend constitutional_agents to include `pi` (and add `agent_capability_gates.pi`), or explicitly document ACR-governance-roles vs constitutional-roster as **distinct ontologies**.
   - **DR-M5-2** — enforce `+1 = M1-5`, deprecate residual `M0-witness` wording from M5'-SPEC §M5'.6 and across the corpus. Sibling of DR-M1-1.

   Verification: `test -f 13-decision-register.md`; `grep -n "DR-M5-1\|DR-M5-2" 13-decision-register.md`.

6. **6.6 — `anuttara_trace` orphan-fill referral** *(no-orphan-fill; cross-link to Tranche 14)*

   Defer carrier-assignment to Wave-A M0 (owns Anuttara substrate). Add cross-reference entry in no-orphan audit (Tranche 14) naming `anuttara_trace(output, sensitivity, depth)` as M5-claim with M0-substrate-owner requirement, read-only contemplative-offering only. Escalate to user final-validation if Wave-A M0 does not claim.

   Verification: `grep -n anuttara_trace 14-no-orphan-audit-and-release-gates.md`.
